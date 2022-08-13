import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
import { resolve, basename } from "path";
import * as ts from "typescript";
import * as tsm from "ts-morph";
// import { compilerOptions } from "../../tsconfig.json";

const fn = filename => resolve(process.cwd(), filename)

const compile = (files: string[], options: ts.CompilerOptions, onWrite: ts.WriteFileCallback) => {
    const host = ts.createCompilerHost(options);
    host.writeFile = onWrite;
    const program = ts.createProgram(files, options, host);

    return program;
}

// reads files and concatenates them into a single string
const concat = (files: string[]) => {
    return files.map(fn).map(file => ({ filename: basename(file), content: readFileSync(file, "utf8") }));
}

export const buildRunTimeTypes = () => {
    // es6 exported types
    const project = new tsm.Project({
        tsConfigFilePath: fn("./tsconfig.json"),
        compilerOptions: {
            declaration: true,
            outFile: fn("./packages/titan-reactor-runtime/index.d.ts"),
            isolatedModules: true,
            module: tsm.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            allowJs: true,
            emitDeclarationOnly: true,
        },
        skipAddingFilesFromTsConfig: true,
    });
    project.addSourceFileAtPath(fn("./src/main/plugins/runtime.tsx"));
    project.addSourceFileAtPath(fn("./src/common/types/declarations/titan-reactor-host.d.ts"));
    project.emit();
}

buildRunTimeTypes();

const printNode = (tc: tsm.TypeChecker, node: tsm.Type<tsm.ts.Type>, enclosingNode?: tsm.Node) => {
    return tc.getTypeText(node, enclosingNode, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias);
}

interface ExtractOptions {
    extractFiles: {
        file: string | tsm.SourceFile,
        types?: string[]
        ignoreReferences?: string[],
        log?: boolean
    }[];
    globalIgnore: string[];
    extraTypes: string[];
    prependFiles: string[];
}

export const extractTypesFromFiles = async ({ extractFiles, globalIgnore, extraTypes, prependFiles }: ExtractOptions) => {
    const project = new tsm.Project({
        tsConfigFilePath: fn("./tsconfig.json")
    });

    const fileSystem = new tsm.InMemoryFileSystemHost;

    const out = new tsm.Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
            ...project.getCompilerOptions(),
            outDir: "/outdir",
            outFile: "/outdir/out.d.ts",
            declaration: true,
            allowJs: false,
        },
        fileSystem
    })

    out.createSourceFile("index.d.ts", out.createWriter().writeLine("declare module '*' {").indent().writeLine("export * from './index';").indent().writeLine("}").toString());

    const _globalIgnore = ["Record", "ReturnType", ...globalIgnore]

    const getIdDefinition = (typeReferenceOrHeritageClause: tsm.TypeReferenceNode | tsm.HeritageClause | tsm.TypeQueryNode) => {
        const id = typeReferenceOrHeritageClause.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);

        const name = id.getText();
        const defs = id.getDefinitionNodes();
        return {
            name,
            definitions: defs
        }
    }

    type TRReferenceNode = ReturnType<typeof getIdDefinition> & {
        type: "typeReference",
        node: tsm.TypeReferenceNode,
        query?: tsm.TypeQueryNode
    }

    const getAllTypeReferences = (root: tsm.Node, ignore: string[], log: (...args: any[]) => void): TRReferenceNode[] => {
        return root.getDescendantsOfKind(tsm.SyntaxKind.TypeReference).map(tf => {
            const query = tf.getFirstChildByKind(tsm.SyntaxKind.TypeQuery);
            const id = getIdDefinition(tf);
            if (ignore.includes(id.name) || _globalIgnore.includes(id.name)) {
                log("ignoring", id.name)
                return null;
            }
            return {
                type: "typeReference",
                node: tf,
                query,
                ...id
            }
        }).filter(x => x !== null) as TRReferenceNode[];
    }

    const processedFiles = new Map<tsm.SourceFile, string[]>();
    const nodeHasBeenProcessed = (file: tsm.SourceFile, node: tsm.TypeAliasDeclaration | tsm.InterfaceDeclaration | tsm.ClassDeclaration | string) => {
        if (typeof node === "string") {
            return processedFiles.get(file)?.includes(node)
        } else {
            return processedFiles.get(file)?.includes(`${node.getKindName()}${node.getName()}`)
        }
    }
    const markNodeAsProcessed = (file: tsm.SourceFile, node: tsm.TypeAliasDeclaration | tsm.InterfaceDeclaration | tsm.ClassDeclaration) => {
        if (!processedFiles.has(file)) {
            processedFiles.set(file, []);
        }
        processedFiles.get(file).push(`${node.getKindName()}${node.getName()}`)
    }

    let output = "";
    const exports = str => output += str + "\n";

    exports(extraTypes.join("\n"))
    exports(concat(prependFiles).map(t => t.content).join("\n"));

    for (const extractFile of extractFiles) {
        const file = extractFile.file instanceof tsm.SourceFile ? extractFile.file : project.getSourceFiles(extractFile.file)[0];
        if (!file) {
            throw new Error(`File not found: ${extractFile.file}`);
        }

        out.createSourceFile(file.getFilePath().replace(process.cwd().replace(/\\/g, "/"), ""), file.getText(true), { overwrite: true });
        if (file.isFromExternalLibrary()) {
            console.log("external library", file.getFilePath());

            continue;
        }
        if (file.isInNodeModules()) {
            console.log("node_modules", file.getFilePath());
            continue;
        }
        if (!processedFiles.has(file)) {
            processedFiles.set(file, []);
        }
        const log = extractFile.log ? console.log : () => { };
        log("file", file.getFilePath());






        for (const root of [...file.getTypeAliases(), ...file.getInterfaces(), ...file.getClasses()]) {
            if (extractFile.types && !extractFile.types.includes(root.getName())) {
                continue;
            }
            if (nodeHasBeenProcessed(file, root)) {
                log("already processed interface", root.getName())
                continue;
            }
            markNodeAsProcessed(file, root);

            log(root.getKindName(), root.getName());
            log(`root: export type ${root.getName()} = ${printNode(project.getTypeChecker(), root.getType())}`);

            const references = getAllTypeReferences(root, extractFile.ignoreReferences ?? [], log);
            log("reference count", references.length);
            for (const node of references) {
                node.definitions.forEach(d => {
                    if (d.getKind() === tsm.SyntaxKind.TypeAliasDeclaration || d.getKind() === tsm.SyntaxKind.InterfaceDeclaration || d.getKind() === tsm.SyntaxKind.ClassDeclaration) {
                        const ta = d as tsm.TypeAliasDeclaration;
                        if (nodeHasBeenProcessed(ta.getSourceFile(), ta)) {
                            log("already processed reference", ta.getName())
                            return;
                        }
                        extractFiles.push({
                            file: ta.getSourceFile(),
                            types: [ta.getName()],
                            log: extractFile.log,
                            ignoreReferences: extractFile.ignoreReferences
                        });
                    } else {
                        log("skipping definition", d.getKindName());
                    }
                })

            }

            if (root.getKind() === tsm.SyntaxKind.TypeAliasDeclaration) {
                exports(`export type ${root.getName()} = ${printNode(project.getTypeChecker(), root.getType())}`);
            } else if (root.getKind() === tsm.SyntaxKind.InterfaceDeclaration) {
                root.setIsExported(true);
                exports(root.print());
                root.asKind(tsm.SyntaxKind.InterfaceDeclaration).getBaseDeclarations().forEach(base => {
                    if (nodeHasBeenProcessed(file, base)) {
                        log("already processed interface", base.getName())
                        return;
                    }
                    log("adding base", base.getName());
                    extractFiles.push({
                        file: base.getSourceFile(),
                        types: [base.getName()],
                        log: extractFile.log,
                        ignoreReferences: extractFile.ignoreReferences
                    })
                })
            } else if (root.getKind() === tsm.SyntaxKind.ClassDeclaration) {
                root.setIsExported(true);

                exports(root.setIsExported(true).print());
                const base = root.asKind(tsm.SyntaxKind.ClassDeclaration).getBaseClass();
                if (base) {
                    if (nodeHasBeenProcessed(file, base)) {
                        log("already processed class", base.getName())
                    } else {
                        log("adding base", base.getName());
                        extractFiles.push({
                            file: base.getSourceFile(),
                            types: [base.getName()],
                            log: extractFile.log,
                            ignoreReferences: extractFile.ignoreReferences
                        })
                    }
                }
            } else {
                throw new Error(`Unknown kind ${root.getKindName()}`);
            }
        }

    }

    // fileSystem.writeFile = (filePath: string, content: string) => writeFile(filePath, content, { encoding: "utf8" });
    const emitted = await Promise.all(out.getSourceFiles().map(file => {
        console.log(file.getFilePath(), file.getTypeAliases().length, file.getInterfaces().length, file.getClasses().length, file.getVariableDeclarations().length);
        // return file.save().then(_ => file.emit({ emitOnlyDtsFiles: false }).then(r => {
        //     console.log("skipped", r.getEmitSkipped());
        //     return r.compilerObject.emittedFiles ?? []
        // }));
    }));
    // console.log(emitted.flat().length, "files emitted");

    out.emit({ emitOnlyDtsFiles: true }).then(result => {
        console.log(result.getDiagnostics().filter(d => d.getCategory() === tsm.ts.DiagnosticCategory.Error).map(d => d.getMessageText()).join("\n"));
        console.log(result.compilerObject.emittedFiles?.length, "files emitted");
        // result.compilerObject.emittedFiles.forEach(file => {

        // });
    })

    return output;
}

(
    async () => {
        writeFile(fn("./src/common/types/declarations/titan-reactor-host.d.ts"), `declare module "titan-reactor/host" {\n` + await extractTypesFromFiles({
            extractFiles: [
                {
                    file: "**/types/plugin.ts",
                    types: ["PluginMetaData", "SceneInputHandler"]
                },
                {
                    file: "**/bwdat/bw-dat.ts",
                },
                {
                    file: "**/minimap-dimensions.ts",
                },
                {
                    file: "**/parse-replay-header.ts",
                    types: ["ReplayPlayer"]
                },
                {
                    file: "**/plugin-system-ui.ts",
                    types: ["PluginStateMessage", "ReplayPlayer"],
                },
                {
                    file: "**/plugin-system-native.ts",
                    types: ["PluginProto"],
                },
                {
                    file: "**/scenes/scene.ts",
                    types: ["SceneStateID"],
                },
                {
                    file: "**/assets.ts",
                    types: ["UIStateAssets"],
                    ignoreReferences: ["Assets", "Pick"],
                },
                {
                    file: "**/icons.ts",
                },
                {
                    file: "**/core/unit.ts",
                },
            ], globalIgnore: ["SpritesBufferView", "Vector2"], extraTypes: ["type Vector2 = {x:number,y:number}"
                // , 
                // `
                // export class PluginProto implements NativePlugin {
                //     id: string;
                //     name: string;
                //     $$permissions: NativePlugin["$$permissions"];
                //     $$config: NativePlugin["$$config"];
                //     $$meta: NativePlugin["$$meta"];
                //     callCustomHook: NativePlugin["callCustomHook"];
                //     sendUIMessage: NativePlugin["sendUIMessage"];
                //     setConfig(key: string, value: any, persist?: boolean): void
                // }
                // `
            ], prependFiles: [fn("./src/renderer/plugins/events.ts")]
        }) + "\n}", { encoding: "utf8" })
    }
)();


export const buildEnums = () => {
    const project = new tsm.Project({
        tsConfigFilePath: fn("./tsconfig.json"),
        compilerOptions: {
            outDir: fn("./packages"),
            outFile: fn("./packages/enums.d.ts"),
            isolatedModules: false,
            module: tsm.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ESNext,
            allowJs: true,
            emitDeclarationOnly: true,
            declaration: true,
        },
        skipAddingFilesFromTsConfig: true,
    });
    project.addSourceFileAtPath(fn("./src/common/enums/index.ts"));
    project.emit({ emitOnlyDtsFiles: true });
}

buildEnums();