import { resolve } from "path";
import * as ts from "typescript";

const createCompiler = (files: string[], options: ts.CompilerOptions, onWrite: ts.WriteFileCallback) => {
    const host = ts.createCompilerHost(options);
    host.writeFile = onWrite;
    // Prepare and emit the d.ts files
    const program = ts.createProgram(files, options, host);
    return program.emit();
}

export const buildRunTimeTypes = () => {
    const compiler = createCompiler([
        resolve(process.cwd(), "./src/main/plugins/runtime.jsx")
    ], {
        declaration: true,
        emitDeclarationOnly: true,
        isolatedModules: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        allowJs: true,
    }, (fileName, data, writeByteOrderMark, onError) => {
        console.log("writing")
        console.log(data);
    })
    console.log(compiler.diagnostics.length)
}
buildRunTimeTypes();