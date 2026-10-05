import { NextResponse } from "next/server";
import {
  ChallengeRequestSchema,
} from "@/lib/schema";
import {
  AppError,
  runChallenge,
} from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Malformed request.",
      },
      { status: 400 }
    );
  }

  const parsed = ChallengeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Invalid challenge request.",
      },
      { status: 400 }
    );
  }

  try {
    const data = await runChallenge(
      parsed.data.claim,
      parsed.data.argument,
      parsed.data.objection
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: e.message,
        },
        { status: e.status }
      );
    }

    console.error(e);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}