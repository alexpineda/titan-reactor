import { DiagnosticCategory, JsxEmit, ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { removeImportDeclarations } from "./plugins/process-ts-plugin";

export interface TransformSyntaxError extends Error {
  message: string;
  loc: {
    line: number;
    column: number;
  };
  snippet: string;
}


export const transpile = (_source: string, filename: string, removeImports?: string[] | true) => {
  const source = removeImports ? removeImportDeclarations(_source, removeImports) : _source;
  const ts = transpileModule(source, { compilerOptions: { target: ScriptTarget.ESNext, module: ModuleKind.ESNext, allowJs: true, jsx: JsxEmit.React, isolatedModules: true, inlineSourceMap: true, skipLibCheck: true, allowSyntheticDefaultImports: true } });

  const transpileErrors: TransformSyntaxError[] = [];

  for (const error of ts.diagnostics ?? []) {
    if (error.category === DiagnosticCategory.Error) {
      transpileErrors.push({
        name: filename,
        snippet: error.source!,
        message: error.messageText.toString(),
        loc: {
          line: error.start!,
          column: 0
        }
      });
    }
  }

  return {
    result: ts,
    transpileErrors
  }
}