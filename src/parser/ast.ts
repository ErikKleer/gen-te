import { readFileSync } from "node:fs";
import ts from "typescript";

export function extractSignatures(filePath: string): string {
  const source = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const signatures: string[] = [];

  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      const signature = ts.factory.updateFunctionDeclaration(
        statement,
        statement.modifiers,
        statement.asteriskToken,
        statement.name,
        statement.typeParameters,
        statement.parameters,
        statement.type,
        undefined,
      );

      signatures.push(printer.printNode(ts.EmitHint.Unspecified, signature, sourceFile));
    }
  }

  return signatures.join("\n");
}