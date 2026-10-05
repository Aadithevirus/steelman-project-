# Argument Steelman Engine

Enter a claim. The app builds a counterargument in three stages (Baseline, Strengthened, Steelman), shows the weaknesses and objections found at each step, scores each stage out of 12, and reports logical fallacies per stage. Gemma 4, called through the Gemini API, does all of the analysis.

## Setup
1. Install Node.js 20+ from nodejs.org.
2. `npm install` installs the dependencies.
3. `cp .env.example .env.local` creates your private settings file. Open `.env.local` and paste your key after `GEMINI_API_KEY=` (create one at https://aistudio.google.com/apikey).
4. `AI_MODEL` defaults to `gemma-4-26b-a4b-it`; set `gemma-4-31b-it` for the larger model. Check the current ids in the [Gemma on Gemini API docs](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).
5. `npm run dev` starts the app at http://localhost:3000.

## How Gemma powers the application
The browser posts the claim to `/api/steelman`. The server sends one structured request to Gemma, which classifies the claim, finds fallacies, writes the baseline, critiques it, strengthens it twice, and scores each stage. The server validates the JSON with Zod, recomputes every total itself, and returns it to the UI.

## Architecture
- `lib/ai.ts`: the only file that knows about the provider. Tries JSON schema + high thinking, then drops options the model rejects.
- `lib/prompts.ts`: system prompt, per-stage instructions, scoring rubric.
- `lib/schema.ts`: Zod schema (also sent to the model as JSON Schema). Totals are not requested from the model.
- `app/api/steelman/route.ts`: validation, error mapping. Errors never include keys or stack traces.
- `components/`: UI. The model's private thinking is never shown, only the auditable summaries.

## Security
The API key lives only in `.env.local` or Vercel environment variables, is read on the server, and `.env.local` is git-ignored.

## GitHub
`git init` starts a repository; `git add .` stages files; `git commit -m "Initial commit"` saves them; `git branch -M main` names the branch; `git remote add origin YOUR_GITHUB_REPOSITORY_URL` links GitHub; `git push -u origin main` uploads.

## Vercel
Push to GitHub, import the repo at vercel.com, add `GEMINI_API_KEY` and `AI_MODEL` under Environment Variables, deploy, then submit a claim on the live site.

## Troubleshooting
- "missing GEMINI_API_KEY": restart `npm run dev` after editing `.env.local`.
- "returned no result": check the `AI_MODEL` id against the docs.
- Rate limit: wait and retry.

## Limitations
Model output can be wrong; fallacy classification is probabilistic; no detected fallacy does not prove soundness; evidence claims need external verification; this is an analytical aid, not an authority on truth.

## License
Application code: Apache-2.0 (add the full text from apache.org/licenses/LICENSE-2.0.txt as `LICENSE`). Gemma is governed by its own terms; dependencies by theirs. Not affiliated with or endorsed by Google.
