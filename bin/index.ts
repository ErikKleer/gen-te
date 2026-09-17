#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { runAnalysis } from "../src/cli/commands.js";

const program = new Command();

program
  .name("gen-te")
  .description("Generate Vitest tests for a TypeScript file")
  .version("0.1.0")
  .argument("<file>", "path to the TypeScript file to analyze")
  .action(runAnalysis);

await program.parseAsync();
