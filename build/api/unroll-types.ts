import * as tsm from "ts-morph";
import { ImportNodeUtil } from "./imports-util";
import {
    Diagnostic,
    emitFileDeclaration,
    findMatchingNodeById,
    getNodeId,
    isExportable,
    hasOwnIdentifier,
    isJsDocChild,
    replaceTransientImports,
    hasJsDocTag,
    isDeclaration,
    getExportableNode,
    getDefinitionNodes,
} from "./util";

const getUniqueName = (node: tsm.Node) => {
    if (hasOwnIdentifier(node)) {
        return `${node.getKindName()}-${getNodeId(node)?.getText()}`;
    }
    return null;
};

const getStatement = (node: tsm.Node) => {
    if (tsm.Node.isVariableDeclaration(node)) {
        return node.getFirstAncestorByKindOrThrow(tsm.SyntaxKind.VariableStatement);
    }

    return node;
};

/**
 *
 * @param inFiles A file list of entry files
 * @param tsConfigFilePath An optional config path for tsconfig.json
 * @param compilerOptions Optional compiler options for the TypeScript compiler
 * @param defaultInternal Whether to treat all exports as internal by default
 * @returns
 */
export const unrollTypes = async ({
    inFiles,
    tsConfigFilePath,
    compilerOptions,
    wrapInGlobal = [],
    defaultInternal = false,
}: {
    inFiles: string[];
    tsConfigFilePath?: string;
    compilerOptions?: tsm.ts.CompilerOptions;
    wrapInGlobal?: string[];
    defaultInternal?: boolean;
}) => {
    let result = {
        content: "",
        global: "",
        prepend: "",
        diagnostics: {
            nodeModules: new Set<string>(),
            external: new Set<string>(),
            notFound: new Set<string>(),
            importFileNotFound: new Set<string>(),
            externalDeclarations: new Set<string>(),
            nameClash: new Set<string>(),
            failedToPrint: new Set<string>(),
        } as Diagnostic,
    };

    const inProject = new tsm.Project({
        tsConfigFilePath,
        compilerOptions: {
            ...compilerOptions,
            declaration: true,
            emitDeclarationOnly: true,
            declarationDir: "./outdir",
        },
    });

    const outProject = new tsm.Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
            ...inProject.getCompilerOptions(),
            declaration: true,
            emitDeclarationOnly: true,
            declarationDir: "/outdir",
        },
        useInMemoryFileSystem: true,
    });

    const _collectedNodes: tsm.Node[] = [];
    const _collectedNodeMap = new Map<string, tsm.Node[]>();
    const _printedNodes = new Set<tsm.Node>();

    const _collect = (node: tsm.Node) => {
        if (hasOwnIdentifier(node)) {
            const nodeId = getNodeId(node)!.getText();
            if (isExportable(node)) {
                if (!_collectedNodes.includes(node)) {
                    _collectedNodes.push(node);
                    if (_collectedNodeMap.has(nodeId)) {
                        _collectedNodeMap.get(nodeId)!.push(node);
                    } else {
                        _collectedNodeMap.set(nodeId, [node]);
                    }

                    // set all nodes to exported so we can get declarations from TS
                    getExportableNode(node).setIsExported(true);
                    collect(node);
                }
            }
        }
    };

    const importNodes = new ImportNodeUtil();
    const importedDeclNodes = new ImportNodeUtil();

    const _collectAlreadyProcessed = new Set<tsm.Node>();

    const collect = (parentNode: tsm.Node) => {
        const sourceFile = parentNode.getSourceFile();

        parentNode.getDescendantsOfKind(tsm.SyntaxKind.Identifier).forEach((id) => {
            if (isJsDocChild(id)) {
                return;
            }

            let definitionNodes = getDefinitionNodes(id, inProject, true);

            // if (definitionNodes.length > 1) {
            //     debugger;
            // }\
            // if (id.getText() === "StateMessage") {
            //     debugger;
            // }

            for (const defNode of definitionNodes) {
                // minor optimization to reduce work in this loop
                if (_collectAlreadyProcessed.has(defNode)) {
                    continue;
                }
                _collectAlreadyProcessed.add(defNode);

                if (defNode.getSourceFile().isFromExternalLibrary()) {
                    result.diagnostics.external.add(id.getText());
                    continue;
                }
                if (defNode.getSourceFile().isInNodeModules()) {
                    // add node name to import list since it is external
                    importNodes.registerImports(id, sourceFile);
                    result.diagnostics.nodeModules.add(id.getText());
                    continue;
                }
                if (defNode.getSourceFile().isDeclarationFile()) {
                    importedDeclNodes.registerImports(id, sourceFile);
                    result.diagnostics.externalDeclarations.add(id.getText());
                    continue;
                }
                _collect(defNode);
            }

            if (definitionNodes.length === 0) {
                result.diagnostics.notFound.add(id.getText());
            }
        });

        // we emit the declaration after collecting exportable nodes
        // because we need to set them all to exported first!
        const declarationFile = emitFileDeclaration(
            inProject,
            parentNode.getSourceFile(),
            outProject
        );

        if (declarationFile === undefined) {
            console.error(parentNode.getSourceFile().getFilePath());
            throw new Error("Could not emit file declaration");
        }

        const transient = replaceTransientImports(
            declarationFile,
            parentNode.getSourceFile(),
            inProject,
            result.diagnostics
        );

        for (const node of transient) {
            _collect(node);
        }
    };

    const getDeclarationNode = (node: tsm.Node) => {
        if (hasOwnIdentifier(node)) {
            const nodeDecl = emitFileDeclaration(
                inProject,
                node.getSourceFile(),
                outProject
            );

            return findMatchingNodeById(
                node,
                nodeDecl.getChildren()
                // [...nodeDecl.getExportedDeclarations().values()].flat()
            );
        }
        return null;
    };

    const isReferencedByAncestorDeclaration = (
        node: tsm.Node,
        srcDeclNode: tsm.Node
    ) => {
        const id = getNodeId(node)!.getText();
        let _declParent = srcDeclNode;

        while (_declParent.getParent()) {
            _declParent = _declParent.getParent();
        }

        for (const _decl of _declParent.getDescendantsOfKind(node.getKind())) {
            for (const _id of _decl.getChildrenOfKind(tsm.SyntaxKind.Identifier)) {
                if (_id.getText() === id) {
                    return true;
                }
            }
        }
        return false;
    };

    const _printNode = (declNode: tsm.Node, sourceFile: tsm.SourceFile) => {
        const outputNode = getStatement(declNode);
        if (tsm.Node.isJSDocable(outputNode) && tsm.Node.isExportable(outputNode)) {
            if (
                defaultInternal &&
                !hasJsDocTag(outputNode, "public") &&
                !hasJsDocTag(outputNode, "internal")
            ) {
                outputNode.addJsDoc("@internal");
            }

            if (hasJsDocTag(outputNode, "internal")) {
                outputNode.setIsExported(false);
            }
        }

        if (wrapInGlobal && wrapInGlobal.includes(getNodeId(declNode)!.getText())) {
            if (isExportable(declNode)) {
                declNode.setIsExported(false);
                result.global +=
                    `\n\n//${sourceFile.getFilePath()}\n` + outputNode.getFullText();
            } else {
                throw new Error("Cannot wrap in global if not exportable");
            }
        } else {
            result.content +=
                `\n\n//${sourceFile.getFilePath()}\n` + outputNode.getFullText();
        }
    };

    const printNode = (_node: tsm.Node, srcDecl?: tsm.Node) => {
        const outputNode = getStatement(_node);

        if (getNodeId(outputNode).getText() === "StateMessage") {
            debugger;
        }

        if (_printedNodes.has(outputNode)) {
            return;
        }
        _printedNodes.add(outputNode);

        const declNode = getDeclarationNode(outputNode);

        if (declNode) {
            _printNode(declNode, outputNode.getSourceFile());

            declNode.forEachDescendant((desc) => {
                const nodeId = getNodeId(desc);
                if (nodeId) {
                    // same id doesn't mean we're in the same tree, though we're assuming so
                    const collectedNodes = _collectedNodeMap.get(nodeId.getText());
                    if (collectedNodes === undefined) {
                        // we don't have any node definitions for this id
                        // see if any external imports map to the symbol name
                        if (hasOwnIdentifier(desc)) {
                            if (
                                !importNodes.prepareOutput(desc) &&
                                !importedDeclNodes.prepareOutput(desc)
                            ) {
                                result.diagnostics.failedToPrint.add(nodeId.getText());
                            }
                        }
                    } else if (collectedNodes.length > 1) {
                        // we support exporting interface and class with same name as TS does, we print just the interface
                        if (
                            collectedNodes.length === 2 &&
                            collectedNodes.some((node) =>
                                tsm.Node.isClassDeclaration(node)
                            ) &&
                            collectedNodes.some((node) =>
                                tsm.Node.isInterfaceDeclaration(node)
                            )
                        ) {
                            printNode(collectedNodes[0], declNode);
                            printNode(collectedNodes[1], declNode);
                        } else {
                            result.diagnostics.nameClash.add(nodeId.getText());
                        }
                    } else if (collectedNodes.length === 1) {
                        printNode(collectedNodes[0], declNode);
                    }
                }
            });
        } else {
            // there will not be a declaration node if:
            // the node is not a exportable type
            // the node is not exported
            // however in our case we wish to include non-exported for convenience
            // so we will just print the node
            // we have to reach up and find out if parents have decl nodes
            // NOTE: now that we set nodes to export before hand, it will be odd to find nodes in this execution branch
            if (
                srcDecl &&
                // do we want just type reference?
                (isDeclaration(outputNode) || tsm.Node.isTypeReference(outputNode)) &&
                isReferencedByAncestorDeclaration(outputNode, srcDecl!)
            ) {
                if (tsm.Node.isJSDocable(outputNode)) {
                    outputNode.addJsDoc("@internal - inferred");
                }
                result.content +=
                    `\n\n//${outputNode.getSourceFile().getFilePath()}\n` +
                    outputNode.getFullText();
                _printedNodes.add(outputNode);
            }
        }
    };

    const process = (sourceFile: tsm.SourceFile) => {
        collect(sourceFile);
        const rootNodes = [
            ...(sourceFile.getExportedDeclarations().values() as Iterable<tsm.Node>),
        ].flat();

        for (const node of rootNodes) {
            printNode(node);
        }

        result.content =
            importNodes.output +
            "\n" +
            importedDeclNodes.output +
            "\n" +
            result.content;
    };

    for (const file of inFiles) {
        let sourceFile: tsm.SourceFile;
        // best effort for faulty configs
        if (inProject.getSourceFile(file) === undefined) {
            sourceFile = inProject.addSourceFileAtPath(file);
            console.warn(`File ${file} not found in tsconfig.json, adding...`);
        } else {
            sourceFile = inProject.getSourceFile(file);
        }

        process(sourceFile);
    }

    const content = `
    ${result.content}
    declare global {
        ${result.global}
    }
    `;

    return {
        content,
        diagnostics: {
            external: [...result.diagnostics.external],
            importFileNotFound: [...result.diagnostics.importFileNotFound],
            nodeModules: [...result.diagnostics.nodeModules],
            notFound: [...result.diagnostics.notFound],
            ...importNodes.diagnostics,
            nameClash: [...result.diagnostics.nameClash],
            failedToPrint: [...result.diagnostics.failedToPrint],
        },
    };
};
