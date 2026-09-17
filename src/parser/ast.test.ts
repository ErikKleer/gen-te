import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractSignatures } from "./ast.js";

describe("extractSignatures", () => {
  it("extracts only exported function signatures", () => {
    const dummyPath = fileURLToPath(new URL("../dummy.ts", import.meta.url));

    expect(extractSignatures(dummyPath)).toBe(
      "export function add(first: number, second: number): number;",
    );
  });
});