import * as tsm from "ts-morph";
import {
    emitFileDeclaration,
    fn,
    getIdentifierDefinitions,
    TSMProcessedNodeCache,
    TSMValidNodes,
} from "./util";
import { readFileSync } from "fs";
import { basename } from "path";

// reads files and concatenates them into a single string
const concat = (files: string[]) => {
    return files.map(fn).map((file) => ({
        filename: basename(file),
        content: readFileSync(file, "utf8"),
    }));
};

export type Diagnostic = {
    nodeModules: string[];
    external: string[];
    notFound: string[];
    nodes: string[];
    files: any[];
    tree: FileTree[];
};

type FileTree = {
    parent: string;
    child: string;
    childType: string;
    node?: string;
};

type InputFile = {
    file: string;
    // types?: string[];
    ignoreReferences?: string[];
};

export const extractTypesFromFiles = async ({
    files,
    globalIgnore,
    prependFiles,
}: {
    files: InputFile[];
    globalIgnore: string[];
    prependFiles: string[];
}) => {
    const inProject = new tsm.Project({
        tsConfigFilePath: fn("./tsconfig.json"),
        compilerOptions: {
            declaration: true,
            emitDeclarationOnly: true,
            declarationDir: "./outdir",
            allowJs: false,
        },
    });

    const fileSystem = new tsm.InMemoryFileSystemHost();

    const outProject = new tsm.Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
            ...inProject.getCompilerOptions(),
            declaration: true,
            emitDeclarationOnly: true,
            declarationDir: "/outdir",
            allowJs: false,
        },
        fileSystem,
    });

    const processed = new TSMProcessedNodeCache();

    let result = {
        content: "",
        diagnostics: {
            nodeModules: [],
            external: [],
            notFound: [],
            nodes: [],
            tree: [],
        } as Diagnostic,
    };
    const writeContent = (str) => (result.content += str + "\n");

    prependFiles.map(fn).forEach((file) => {
        const sourceFile = inProject.getSourceFiles(file)[0];
        const defFile = emitFileDeclaration(inProject, sourceFile, outProject);
        writeContent(defFile.declFile.getFullText());
    });

    const workNodes: TSMValidNodes[] = [];

    const declMap = new Map<
        tsm.SourceFile,
        {
            declFile: tsm.SourceFile;
            mapFile: tsm.SourceFile;
        }
    >();

    const addWork = (child: TSMValidNodes) => {
        workNodes.push(child);
    };

    for (const file of files) {
        const sourceFile = inProject.getSourceFiles(file.file)[0];
        for (const childNode of [
            ...sourceFile.getTypeAliases(),
            ...sourceFile.getInterfaces(),
            ...sourceFile.getClasses(),
        ]) {
            addWork(childNode);
        }
    }

    // gather identifiers
    // gather identiifer definitions

    for (const workNode of workNodes) {
        if (processed.containsNode(workNode)) {
            continue;
        }

        const workItemSourceFile = workNode.getSourceFile();

        if (workItemSourceFile.isFromExternalLibrary()) {
            if (
                !result.diagnostics.external.includes(workItemSourceFile.getFilePath())
            ) {
                result.diagnostics.external.push(workItemSourceFile.getFilePath());
            }
            continue;
        }
        if (workItemSourceFile.isInNodeModules()) {
            if (
                !result.diagnostics.nodeModules.includes(
                    workItemSourceFile.getFilePath()
                )
            ) {
                result.diagnostics.nodeModules.push(workItemSourceFile.getFilePath());
            }
            continue;
        }
        if (!declMap.has(workItemSourceFile)) {
            declMap.set(
                workItemSourceFile,
                emitFileDeclaration(inProject, workItemSourceFile, outProject)
            );
        }

        let declNode: TSMValidNodes;
        for (const _declNode of declMap
            .get(workItemSourceFile)
            .declFile.getChildrenOfKind(workNode.getKind())) {
            //TODO: map this by pos not by id if we want to support other types of nodes
            if ((_declNode as TSMValidNodes).getName() === workNode.getName()) {
                if (declNode) {
                    throw new Error("Duplicate node found");
                }
                declNode = _declNode as TSMValidNodes;
            }
        }
        if (!declNode) {
            throw new Error("Node not found");
        }
        processed.addNode(workNode, declNode);

        const p = workNode.getParent();
        //@ts-ignore
        const pn = p?.getName ? p.getName() : "<>";

        result.diagnostics.tree.push({
            // parent: workNode.getParent() ? workNode.getParent().getName() : "<root>",
            parent: pn,
            child: workNode.getSourceFile().getFilePath(),
            childType: workNode.getKindName(),
            node: workNode.getName(),
        });

        // go down the tree and find all referenced types so we can add them to our d.ts file
        const references = workNode
            .getDescendantsOfKind(tsm.SyntaxKind.TypeReference)
            .map((node) => {
                const query = node.getFirstChildByKind(tsm.SyntaxKind.TypeQuery);
                const definitions = getIdentifierDefinitions(node);
                return {
                    node,
                    query,
                    definitions,
                };
            });

        for (const node of references) {
            for (const d of node.definitions) {
                if (
                    d.getKind() === tsm.SyntaxKind.TypeAliasDeclaration ||
                    d.getKind() === tsm.SyntaxKind.InterfaceDeclaration ||
                    d.getKind() === tsm.SyntaxKind.ClassDeclaration
                ) {
                    addWork(d as TSMValidNodes);
                }
            }
        }

        if (workNode.getKind() === tsm.SyntaxKind.TypeAliasDeclaration) {
            // writeContent(
            //     `export type ${root.getName()} = ${printNode(
            //         inProject.getTypeChecker(),
            //         root.getType()
            //     )}`
            // );
        } else if (workNode.getKind() === tsm.SyntaxKind.InterfaceDeclaration) {
            workNode
                .asKind(tsm.SyntaxKind.InterfaceDeclaration)
                .getBaseDeclarations()
                .forEach(addWork);
        } else if (workNode.getKind() === tsm.SyntaxKind.ClassDeclaration) {
            const base = workNode
                .asKind(tsm.SyntaxKind.ClassDeclaration)
                .getBaseClass();
            if (base) {
                addWork(base);
            }
        } else {
            throw new Error(`Unknown kind ${workNode.getKindName()}`);
        }
    }

    let mashedOut = "";

    for (const decl of declMap) {
        decl[1].declFile.forEachChild((node) => {
            if (tsm.Node.isImportDeclaration(node)) {
                return;
            }
            mashedOut += node.getFullText();
        });
    }
    for (const node of processed.getAllNodes()) {
        const id = node.getFirstChildByKind(tsm.SyntaxKind.Identifier);
        if (!id) {
            debugger;
        }
        // id.getDefinitionNodes().forEach((d) => {
        //     d.print()

        // mashedOut = mashedOut + "\n" + id.getType().getText();
        // const defs = inProject
        //     .getLanguageService()
        //     .compilerObject.getDefinitionAtPosition(
        //         node.compilerNode.getSourceFile().fileName,
        //         id.compilerNode.pos
        //     );
        // console.log(
        //     node.compilerNode.getSourceFile().fileName,
        //     id.compilerNode.pos,
        //     id.compilerNode.text,
        //     defs
        // );
        // for (const def of) {
        //     mashedOut = mashedOut + "\n" + def.textSpan;
        // }
        // mashedOut = mashedOut + "\n" + processed.getDefNode(node).print();
    }

    result.content = mashedOut;

    result.diagnostics.files = outProject.getSourceFiles().map((file) => {
        return {
            filePath: file.getFilePath(),
            aliases: file.getTypeAliases().map((t) => t.getName()),
            interfaces: file.getInterfaces().map((t) => t.getName()),
            classes: file.getClasses().map((t) => t.getName()),
            variables: file.getVariableDeclarations().map((t) => t.getName()),
        };
    });
    result.diagnostics.nodes = processed.getAllNodes().map((node) => node.getName());

    return result;
};
