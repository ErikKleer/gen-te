import { intro, outro, spinner } from "@clack/prompts";
import { writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { runFeedbackLoop } from "../agent/loop.js";
import { generateInitialTests } from "../llm/client.js";
import { extractSignatures } from "../parser/ast.js";

export async function runAnalysis(filePath: string): Promise<void> {
  intro("GEN-TE");

  const analysisSpinner = spinner();
  analysisSpinner.start(`Starting analysis of ${filePath}`);

  const signatures = extractSignatures(filePath);

  analysisSpinner.stop("Analysis complete");

  const generatedTests = await generateInitialTests(signatures, filePath);
  const outputFilePath = join(
    dirname(filePath),
    `${basename(filePath, extname(filePath))}.test.ts`,
  );

  await writeFile(outputFilePath, generatedTests, "utf8");
  await runFeedbackLoop(outputFilePath);
  outro(`Generated ${outputFilePath}`);
}
