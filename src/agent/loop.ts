import { log } from "@clack/prompts";
import { execa } from "execa";
import { readFile, writeFile } from "node:fs/promises";
import { fixFailingTests } from "../llm/client.js";

const MAX_ITERATIONS = 3;

export async function runFeedbackLoop(testFilePath: string): Promise<void> {
  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    const result = await execa(
      "npx",
      ["vitest", "run", testFilePath, "--run"],
      { reject: false },
    );

    if (result.exitCode === 0) {
      log.success("Tests passed successfully.");
      return;
    }

    if (iteration === MAX_ITERATIONS) {
      log.error("Tests still fail after 3 attempts. Human intervention is required.");
      return;
    }

    const currentCode = await readFile(testFilePath, "utf8");
    const errorLog = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const fixedCode = await fixFailingTests(currentCode, errorLog);

    await writeFile(testFilePath, fixedCode, "utf8");
  }
}