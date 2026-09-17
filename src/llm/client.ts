import { GoogleGenAI } from "@google/genai";

const model = "gemini-3.6-flash";

function normalizeGeneratedCode(responseText: string): string {
  const trimmedText = responseText.trim();
  const fencedCode = trimmedText.match(/^```(?:typescript|ts)?\s*\r?\n([\s\S]*?)\r?\n```$/i);

  return fencedCode?.[1].trim() ?? trimmedText;
}

export async function generateInitialTests(
  signatures: string,
  filePath: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const prompt = `Act as a Senior QA Engineer. Write a Vitest test suite for the provided TypeScript function signatures.

Target file: ${filePath}

Requirements:
- Import the functions from the target file.
- Use explicit .js extensions in all relative ESM imports, such as './dummy.js', because the project uses NodeNext module resolution.
- Include normal behavior and meaningful edge cases, including nulls, empty arrays, and rejected promises where applicable to the signatures.
- Return ONLY valid TypeScript code. Do not include markdown code blocks or conversational text.

TypeScript signatures:
${signatures}`;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return normalizeGeneratedCode(response.text ?? "");
}

export async function fixFailingTests(
  currentCode: string,
  errorLog: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction:
        "The test failed. Analyze the error log and rewrite the test file to fix syntax errors, incorrect mocks, or failing assertions. Use explicit .js extensions in all relative ESM imports because the project uses NodeNext module resolution. Return ONLY valid TypeScript code.",
    },
    contents: `Current test file:
${currentCode}

Error log:
${errorLog}`,
  });

  return normalizeGeneratedCode(response.text ?? "");
}
