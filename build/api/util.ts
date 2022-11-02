import { resolve, join } from "path";
import * as tsm from "ts-morph";
// import aliases from "../aliases";

export type Diagnostic = {
    external: Set<string>;
    importFileNotFound: Set<string>;
    nodeModules: Set<string>;
    externalDeclarations: Set<string>;
    notFound: Set<string>;
    nameClash: Set<string>;
    failedToPrint: Set<string>;
};

export const fn = (filename: string) => resolve(process.cwd(), filename);

const _declarationFileCache = new Map<string, tsm.SourceFile>();

export const emitFileDeclaration = (
    project: tsm.Project,
    sourceFile: tsm.SourceFile,
    outProject = new tsm.Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
            ...project.getCompilerOptions(),
            declaration: true,
            emitDeclarationOnly: true,
            declarationDir: "/outdir",
            allowJs: true,
            target: tsm.ScriptTarget.ESNext,
            module: tsm.ModuleKind.ESNext,
            jsx: tsm.ts.JsxEmit.React,
        },
        useInMemoryFileSystem: true,
    })
) => {
    if (_declarationFileCache.has(sourceFile.getFilePath())) {
        return _declarationFileCache.get(sourceFile.getFilePath())!;
    }

    const memResult = project.emitToMemory({
        emitOnlyDtsFiles: true,
        targetSourceFile: sourceFile,
    });

    for (const memDefFiles of memResult.getFiles()) {
        if (memDefFiles.filePath.endsWith(".d.ts")) {
            const file = outProject.createSourceFile(
                memDefFiles.filePath.replace(process.cwd().replace(/\\/g, "/"), ""),
                memDefFiles.text,
                { overwrite: true }
            );
            _declarationFileCache.set(sourceFile.getFilePath(), file);
            return file;
        }
    }
};

export const isDeclaration = (node: tsm.Node) => {
    return (
        tsm.Node.isClassDeclaration(node) ||
        tsm.Node.isInterfaceDeclaration(node) ||
        tsm.Node.isTypeAliasDeclaration(node) ||
        tsm.Node.isVariableStatement(node) ||
        tsm.Node.isVariableDeclaration(node) ||
        tsm.Node.isFunctionDeclaration(node) ||
        tsm.Node.isEnumDeclaration(node)
    );
};

type NamedType =
    | tsm.ClassDeclaration
    | tsm.InterfaceDeclaration
    | tsm.TypeAliasDeclaration
    | tsm.VariableStatement
    | tsm.VariableDeclaration
    | tsm.FunctionDeclaration
    | tsm.EnumDeclaration
    | tsm.ImportTypeNode
    | tsm.TypeReferenceNode
    | tsm.HeritageClause
    | tsm.ComputedPropertyName
    | tsm.TypeQueryNode;

// reads files and concatenates them into a single string
export function hasOwnIdentifier(node: tsm.Node): node is NamedType {
    return (
        tsm.Node.isClassDeclaration(node) ||
        tsm.Node.isInterfaceDeclaration(node) ||
        tsm.Node.isTypeAliasDeclaration(node) ||
        tsm.Node.isVariableStatement(node) ||
        tsm.Node.isVariableDeclaration(node) ||
        tsm.Node.isFunctionDeclaration(node) ||
        tsm.Node.isEnumDeclaration(node) ||
        tsm.Node.isImportTypeNode(node) ||
        tsm.Node.isTypeReference(node) ||
        tsm.Node.isHeritageClause(node) ||
        tsm.Node.isComputedPropertyName(node) ||
        tsm.Node.isTypeQuery(node)
    );
}

export function hasJsDocTag<T extends tsm.Node>(node: T, needle: string) {
    if (tsm.Node.isJSDocable(node)) {
        for (const _n of node.getJsDocs()) {
            if (_n.getInnerText().includes(needle)) {
                return true;
            }
        }
    }
    return false;
}

export const isExportedOrExportedAncestry = (node: tsm.Node) => {
    let _parent = node;
    while (_parent) {
        if (
            (_parent as tsm.InterfaceDeclaration).isExported &&
            (_parent as tsm.InterfaceDeclaration).isExported()
        ) {
            return true;
        }
        _parent = _parent.getParent();
    }
};

export const isExportableOrExportableAncestry = (node: tsm.Node) => {
    let _parent = node;
    while (_parent) {
        if (tsm.Node.isExportable(_parent)) {
            return true;
        }
        _parent = _parent.getParent();
    }
};

export const getExportableNode = (_node: tsm.Node) => {
    const node = tsm.Node.isVariableDeclaration(_node)
        ? _node.getFirstAncestorByKind(tsm.SyntaxKind.VariableStatement)
        : _node;
    return tsm.Node.isExportable(node) ? node : undefined;
};

export function isExportable<T extends tsm.Node>(
    node: T
): node is T & tsm.ExportableNode {
    return !!getExportableNode(node);
}

export const isJsDocChild = (node: tsm.Node) => {
    return node.getAncestors().some((ancestor) => tsm.Node.isJSDoc(ancestor));
};

const _nodeIdCache = new Map<tsm.Node, tsm.Node>();
export const getNodeId = (node: tsm.Node) => {
    if (_nodeIdCache.has(node)) {
        return _nodeIdCache.get(node)!;
    }
    for (const id of node.getDescendantsOfKind(tsm.SyntaxKind.Identifier)) {
        if (!isJsDocChild(id)) {
            _nodeIdCache.set(node, id);
            return id;
        }
    }
    return null;
};

export function findMatchingNodeById(needle: tsm.Node, haystack: tsm.Node[]) {
    const needleId = getNodeId(needle);
    const kind = needle.getKind();
    if (needleId) {
        for (const child of haystack) {
            const childId = getNodeId(child);
            const childKind = child.getKind();
            if (
                childId &&
                needleId.getText() === childId.getText() &&
                kind === childKind
            ) {
                return child;
            }
        }
    }

    return null;
}

const getFileFromModulePath = (project: tsm.Project, modulePath: string) => {
    let file = project.getSourceFile(`${modulePath}.ts`);
    if (!file) {
        file = project.getSourceFile(`${modulePath}.tsx`);
    }
    if (!file) {
        file = project.getSourceFile(`${modulePath}/index.ts`);
    }
    if (!file) {
        file = project.getSourceFile(`${modulePath}/index.tsx`);
    }
    return file;
};

export const replaceTransientImports = (
    declarationFile: tsm.SourceFile,
    sourceFile: tsm.SourceFile,
    inProject: tsm.Project,
    diagnostics: Diagnostic
) => {
    return [
        ...new Set(
            declarationFile
                .getDescendantsOfKind(tsm.SyntaxKind.ImportType)
                .map((importType) => {
                    const literal = importType.getFirstDescendantByKind(
                        tsm.SyntaxKind.StringLiteral
                    )!;
                    const file = resolveModule(
                        literal.getLiteralValue(),
                        sourceFile.getDirectoryPath(),
                        inProject
                    );
                    if (file) {
                        // find the node with the id and add to work items
                        const importedNode = findMatchingNodeById(
                            importType,
                            file.getChildren()
                            // [...file.getExportedDeclarations().values()].flat()
                        );

                        // strip the import type
                        importType.replaceWithText(getNodeId(importType)!.getText());

                        if (
                            !hasJsDocTag(importedNode, "transient") &&
                            tsm.Node.isJSDocable(importedNode)
                        ) {
                            importedNode.addJsDoc({
                                description: `@transient`,
                            });
                        }
                        return importedNode;
                    } else {
                        diagnostics.importFileNotFound.add(literal.getLiteralValue());
                        return null;
                    }
                })
                .filter((x) => x)
        ),
    ];
};

export const resolveModule = (
    baseModulePath: string,
    cwd: string,
    project: tsm.Project
) => {
    let file: tsm.SourceFile | undefined;

    const baseUrl = project.getCompilerOptions().baseUrl || "";
    const paths = project.getCompilerOptions().paths || {};

    const aliases = Object.keys(paths);
    const noStarAliases = Object.keys(paths).map((alias) => alias.replace("*", ""));

    if (noStarAliases.some((alias) => baseModulePath.startsWith(alias))) {
        const rootAlias =
            aliases[
                noStarAliases.findIndex((alias) => baseModulePath.startsWith(alias))
            ];
        for (const path of paths[rootAlias]) {
            const modulePath = join(baseUrl, baseModulePath.replace(rootAlias, path));
            file = getFileFromModulePath(project, modulePath);
            if (file) {
                break;
            }
        }
    } else {
        file = getFileFromModulePath(project, resolve(cwd, baseModulePath));
    }

    if (file) {
        return file;
    }
    return null;
};

export const isExternalNode = (node: tsm.Node) => {
    return (
        node.getSourceFile().isInNodeModules() ||
        node.getSourceFile().isFromExternalLibrary()
    );
};

export const getDefinitionNodes = (
    id: tsm.Identifier,
    project: tsm.Project,
    allowExternal = false
) => {
    let definitionNodes = id.getDefinitionNodes().filter((def) => {
        if (allowExternal) return true;
        return (
            !def.getSourceFile().isInNodeModules() &&
            !def.getSourceFile().isFromExternalLibrary()
        );
    });

    // sometimes definition nodes are not found because they are external
    // othertimes they are not found for some reason and we need to get it from the symbol
    if (id.getDefinitionNodes().length === 0) {
        const definitions = id.getDefinitions();

        for (const definition of definitions) {
            const file = project.getSourceFile(
                definition.getSourceFile().getFilePath()
            );
            if (file) {
                if (
                    !allowExternal &&
                    (file.isInNodeModules() || file.isFromExternalLibrary())
                ) {
                    continue;
                }
                file.forEachDescendant((child) => {
                    //TODO: should get type + identifier
                    if (
                        getNodeId(child) &&
                        getNodeId(child)!.getText() === id.getText()
                    ) {
                        definitionNodes.push(child);
                    }
                });
            }
        }
    }
    return definitionNodes;
};
