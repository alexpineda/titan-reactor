import { writeFile, readFileSync } from "fs";
import { resolve, basename } from "path";
import * as ts from "typescript";
import { compilerOptions } from "../../tsconfig.json";

type Output = { filename: string, content: string };
const fn = filename => resolve(process.cwd(), filename)

const compile = (files: string[], options: ts.CompilerOptions, onWrite: ts.WriteFileCallback) => {
    const host = ts.createCompilerHost(options);
    host.writeFile = onWrite;
    const program = ts.createProgram(files, options, host);

    return program;
}

// reads files and concatenates them into a single string
const concat = (...files: string[]) => {
    return files.map(fn).map(file => ({ filename: basename(file), content: readFileSync(file, "utf8") }));
}

export const buildRunTimeTypes = () => {
    let result = "";
    // es6 exported types
    const program = compile([
        resolve(process.cwd(), "./src/main/plugins/runtime.tsx")
    ], {
        declaration: true,
        emitDeclarationOnly: true,
        isolatedModules: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        allowJs: true,
    }, (fileName, data, writeByteOrderMark, onError) => {
        result = data;
    });
    program.emit();
    return result;
}

export const extractTypes = (files: string[], identifiers: string[], emitFiles: string[], out: Output[]) => {

    const options: ts.CompilerOptions = {
        declaration: true,
        emitDeclarationOnly: true,
        isolatedModules: false,
        baseUrl: compilerOptions.baseUrl,
        paths: compilerOptions.paths,
        typeRoots: compilerOptions.typeRoots,
        stripInternal: true,
    };

    {
        const program = compile(files, options, (filename, data) => {
            for (const emitFile of emitFiles) {
                if (filename.endsWith(emitFile)) {
                    out.push({ filename, content: data });
                }
            }
        });
        const res = program.emit();
        const sourceFile = program.getSourceFiles();
        const typeChecker = program.getTypeChecker();


        sourceFile.forEach(file => {
            if (file.fileName.includes('node_modules')) {
                return;
            }

            console.log(basename(file.fileName))
            ts.forEachChild(file, node => {
                if (ts.isTypeAliasDeclaration(node) && identifiers.includes(node.name.getText())) {
                    const n = typeChecker.getTypeAtLocation(node);

                    out.push({
                        filename: basename(file.fileName),

                        content: `export type ${node.name.getText()} = ${typeChecker.typeToString(n, undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias)}`//printer.printNode(ts.EmitHint.Unspecified, node, file)
                    })
                } else if (ts.isInterfaceDeclaration(node) && identifiers.includes(node.name.getText())) {
                    const n = typeChecker.getTypeAtLocation(node);

                    out.push({
                        filename: basename(file.fileName),

                        content: `export type ${node.name.getText()} = ${typeChecker.typeToString(n, node, ts.TypeFormatFlags.NoTruncation)}`//printer.printNode(ts.EmitHint.Unspecified, node, file)
                    })
                }
            });
        });

    }
}
export const buildPluginUIMessageTypes = () => {
    let result: Output[] = concat(fn("./src/renderer/plugins/events.ts"), fn("./src/renderer/render/minimap-dimensions.ts"));

    const identifiers = ["PluginStateMessage", "SceneStateID", "Unit", "ReplayPlayer", "UnitDATIncomingType", "UnitDAT", "Assets"];

    extractTypes([fn("./src/renderer/plugins/plugin-system-ui.ts"), fn("./src/renderer/core/unit.ts"), fn("./src/renderer/scenes/scene.ts")], identifiers, ["unit-struct.d.ts", "flingy-struct.d.ts", "thingy-struct.d.ts", "enums/index.d.ts"], result);

    return `declare module "titan-reactor-host" { 
        ${result.map(r => {
        return `
        // ${r.filename}

        ${r.content.endsWith(",") ? r.content.slice(0, -1) : r.content}
        `
    })}

    }`
}

writeFile(fn("./packages/titan-reactor-runtime-host.d.ts"), buildPluginUIMessageTypes(), { encoding: "utf8" }, () => { })

writeFile(fn("./packages/titan-reactor-runtime.d.ts"), buildRunTimeTypes(), { encoding: "utf8" }, () => { })