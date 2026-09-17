# GEN-TE : Autonomous TypeScript Test Generation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.x-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Gemini 3.6 Flash](https://img.shields.io/badge/Gemini-3.6%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/gemini-api)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)

## 📄 Summary

`GEN-TE` is a local CLI that analyzes a TypeScript file, generates a Vitest suite for its exported functions with Google Gemini, runs the suite, and asks the model to repair failures for up to three attempts.

The generated test file is written beside the target module, so the result remains visible and reviewable in the project.

## 🎯 The Problem

Writing normal cases and meaningful edge cases by hand is repetitive. Generated tests can also fail because of incorrect imports, assertions, mocks, or syntax.

A useful test generator must connect AI-assisted generation to real test execution instead of treating the first model response as a valid test suite.

## 💡 The Solution

`GEN-TE` uses a small feedback loop:

1. Extract exported function signatures with the TypeScript Compiler API.
2. Send the focused signatures to Gemini Flash with a QA-oriented prompt.
3. Write the generated suite beside the target module.
4. Run the suite with Vitest.
5. Send real failures back to Gemini and retry up to three times.

## 🏛️ Solution Architecture

```text
TypeScript file
   |
   v
AST signature extraction
   |
   v
Gemini Flash test generation
   |
   v
Generated .test.ts file
   |
   v
Vitest execution
   |
   +--> Pass: finish
   |
   +--> Fail: repair with error log (max 3 attempts)
```

### 1. Signature extraction

The parser uses the TypeScript Compiler API to collect exported function declarations and send only their signatures to the model.

### 2. Test generation

Gemini receives a focused QA prompt covering normal behavior and relevant edge cases, including empty collections, null-like values, and rejected promises when applicable.

### 3. Execution and repair

Vitest is the validation boundary. When a generated suite fails, its output is sent back to Gemini so the test can be rewritten. The loop stops on success or after three attempts.

## ✨ Key Features

- AST-based extraction of exported function signatures.
- Vitest suite generation focused on the selected module.
- Explicit `.js` extensions for relative ESM imports.
- Automatic repair based on actual Vitest output.
- Bounded retries for a predictable workflow.
- Generated tests saved beside the target file for easy review.

## 🛠️ Technology Stack

- **Language:** TypeScript with strict ESM modules.
- **Runtime:** Node.js 18 or newer.
- **Artificial intelligence:** Gemini Flash through `@google/genai`.
- **AST analysis:** TypeScript Compiler API.
- **Test runner:** Vitest.
- **CLI:** Commander.
- **Configuration:** dotenv and environment variables.
- **Process execution:** execa.

## 🚀 Installation and Configuration

### Prerequisites

- Node.js 18 or newer.
- Git.
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

### Local installation

```bash
git clone https://github.com/ErikKleer/gen-te.git
cd gen-te
npm install
```

### Gemini API key

Create a local `.env` from the example and replace the placeholder:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your-gemini-api-key
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

The CLI loads `.env` automatically from the project directory. The file is ignored by Git and must never contain a committed or shared API key.

## ▶️ Usage

Run the generator against a TypeScript file:

```bash
npm start -- src/dummy.ts
```

The command generates `src/dummy.test.ts` and runs it with Vitest. The CLI accepts one required file argument and also exposes Commander `--help` and `--version` options.

To install and use the command globally from a local checkout:

```bash
npm run build
npm link
gen-te src/dummy.ts
```

## 🧪 Development

```bash
npm test
npm run build
npm start -- src/dummy.ts
```

If `GEMINI_API_KEY` is missing, the command stops with:

```text
Error: GEMINI_API_KEY is not set.
```

## 📁 Project Structure

```text
bin/                Commander CLI entrypoint
src/parser/         TypeScript AST signature extraction
src/llm/            Gemini generation and repair client
src/agent/          Vitest execution and feedback loop
src/cli/            Application orchestration and file output
```
