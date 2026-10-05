// All provider-specific code lives here.
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  ModelOutputSchema,
  modelJsonSchema,
  ChallengeRequestSchema,
  ChallengeOutputSchema,
} from "./schema";
import { SYSTEM_PROMPT, buildPrompt } from "./prompts";
import type { Analysis } from "@/types/steelman";

export class AppError extends Error {
  constructor(message: string, public status = 500) { super(message); }
}

function extractJson(text: string): unknown {
  try { return JSON.parse(text); } catch {}
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}

export async function runSteelman(claim: string, quick = false): Promise<Analysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiKey || !model) throw new AppError("The server is missing GEMINI_API_KEY or AI_MODEL. See the README.", 500);

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(claim, quick);
  const schema = modelJsonSchema();
  const thinking = { thinkingLevel: quick ? "MINIMAL" : "HIGH" };

  // Try the richest configuration first, then degrade gracefully if the model rejects it.
  const attempts: Array<{ contents: string; config: Record<string, unknown> }> = [
    { contents: prompt, config: { systemInstruction: SYSTEM_PROMPT, responseMimeType: "application/json", responseJsonSchema: schema, thinkingConfig: thinking, temperature: 0.4 } },
    { contents: prompt, config: { systemInstruction: SYSTEM_PROMPT, responseMimeType: "application/json", responseJsonSchema: schema, temperature: 0.4 } },
    { contents: `${SYSTEM_PROMPT}\n\n${prompt}\n\nJSON Schema:\n${JSON.stringify(schema)}`, config: { temperature: 0.4 } },
  ];

  let text = "";
  let lastErr: unknown;
  for (const a of attempts) {
    try {
      const res = await ai.models.generateContent({ model, contents: a.contents, config: a.config as never });
      text = res.text ?? "";
      if (text) break;
    } catch (e) {
      lastErr = e;
      const msg = String((e as Error)?.message ?? e);
      if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg)) throw new AppError("Rate limit reached. Wait a minute and try again.", 429);
      if (/timeout|DEADLINE|fetch failed|ENOTFOUND/i.test(msg)) throw new AppError("The AI service did not respond in time. Try again.", 504);
      if (/API key|401|403|PERMISSION/i.test(msg)) throw new AppError("The AI service rejected the API key. Check GEMINI_API_KEY.", 502);
      // otherwise (e.g. 400 unsupported option) try the next, simpler configuration
    }
  }
  if (!text) { console.error("AI call failed:", lastErr); throw new AppError("The AI service returned no result. Check AI_MODEL and try again.", 502); }

  const json = extractJson(text);
  const parsed = ModelOutputSchema.safeParse(json);
  if (!parsed.success) throw new AppError("The AI returned an invalid analysis. Please try again.", 502);

  // Server-side total: never trust a model-supplied sum.
  const stages = parsed.data.stages.map((s) => ({
    ...s,
    score: { ...s.score, total: s.score.logicalRigor.score + s.score.relevance.score + s.score.resistanceToRebuttal.score },
  }));
  return { ...parsed.data, claim, stages };
}
export async function runChallenge(
  claim: string,
  argument: string,
  objection: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!apiKey || !model) {
    throw new AppError(
      "The server is missing GEMINI_API_KEY or AI_MODEL.",
      500
    );
  }

  const request = ChallengeRequestSchema.safeParse({
    claim,
    argument,
    objection,
  });

  if (!request.success) {
    throw new AppError("Invalid challenge request.", 400);
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are an adversarial argument critic.

Your job is NOT to automatically agree with the objection.

Analyze whether the objection genuinely damages the current argument.

Rules:
1. Be intellectually honest.
2. A strong argument may survive an objection.
3. A weak objection should receive a low objectionStrength score.
4. Identify the exact vulnerability exposed by the objection.
5. Explain how the argument can respond.
6. Produce a repaired version of the argument.
7. Do not invent statistics, studies, citations, or facts.
8. If outside evidence is required, say so.
9. Do not reveal chain-of-thought.
10. Return ONLY JSON matching the provided schema.

Score:
- 0 = no meaningful challenge
- 1 = very weak challenge
- 2 = moderate challenge
- 3 = strong challenge
- 4 = devastating challenge

The repaired argument should remain faithful to the original position.
`;

  const prompt = `
Original claim:
<<<CLAIM
${claim}
CLAIM>>>

Current argument:
<<<ARGUMENT
${argument}
ARGUMENT>>>

Selected objection:
<<<OBJECTION
${objection}
OBJECTION>>>

Evaluate the objection against the argument.

Determine:
- how strong the objection is
- what vulnerability it exposes
- how the argument can respond
- a repaired version of the argument
- whether external evidence is required
- an independent evaluation of the repaired argument
`;

  const schema = zodChallengeJsonSchema();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 0.3,
      },
    });

    const text = response.text ?? "";

    let json: unknown;

    try {
      json = JSON.parse(text);
    } catch {
      const a = text.indexOf("{");
      const b = text.lastIndexOf("}");

      if (a >= 0 && b > a) {
        json = JSON.parse(text.slice(a, b + 1));
      }
    }

    const parsed = ChallengeOutputSchema.safeParse(json);

    if (!parsed.success) {
      throw new AppError(
        "Gemma returned an invalid challenge response.",
        502
      );
    }

    return parsed.data;
  } catch (e) {
    if (e instanceof AppError) throw e;

    const msg = String((e as Error)?.message ?? e);

    if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg)) {
      throw new AppError(
        "Rate limit reached. Wait a moment and try again.",
        429
      );
    }

    if (/API key|401|403|PERMISSION/i.test(msg)) {
      throw new AppError(
        "The AI service rejected the API key.",
        502
      );
    }

    console.error("Challenge AI error:", e);

    throw new AppError(
      "The AI challenge could not be completed.",
      502
    );
  }
}

function zodChallengeJsonSchema() {
  const schema = z.toJSONSchema(ChallengeOutputSchema) as Record<
    string,
    unknown
  >;

  delete schema.$schema;

  return schema;
}