import { resolve } from "path";
import * as tsm from "ts-morph";

export const fn = (filename) => resolve(process.cwd(), filename);

export const getIdentifierDefinitions = (
    typeReferenceOrHeritageClause:
        | tsm.TypeReferenceNode
        | tsm.HeritageClause
        | tsm.TypeQueryNode
) => {
    const id = typeReferenceOrHeritageClause.getFirstDescendantByKindOrThrow(
        tsm.SyntaxKind.Identifier
    );

    return id.getDefinitionNodes();
};

// export type TSMValidNodes =
//     | tsm.TypeAliasDeclaration
//     | tsm.InterfaceDeclaration
//     | tsm.ClassDeclaration;

export class TSMProcessedNodeCache {
    #nodes = new Set<tsm.Node>();
    #defNode = new Map<tsm.Node, tsm.Node>();

    containsNode(node: tsm.Node) {
        return this.#nodes.has(node);
    }

    addNode(node: tsm.Node, defNode: tsm.Node) {
        this.#nodes.add(node);
        this.#defNode.set(node, defNode);
    }

    getAllNodes() {
        return [...this.#nodes.values()];
    }

    getDefNode(node: tsm.Node) {
        return this.#defNode.get(node);
    }
}

export const emitFileDeclaration = (
    project: tsm.Project,
    file: tsm.SourceFile,
    outProject: tsm.Project
) => {
    const memResult = project.emitToMemory({
        emitOnlyDtsFiles: true,
        targetSourceFile: file,
    });

    let declFile: tsm.SourceFile;
    let mapFile: tsm.SourceFile;

    for (const memDefFiles of memResult.getFiles()) {
        if (memDefFiles.filePath.endsWith(".d.ts")) {
            declFile = outProject.createSourceFile(
                memDefFiles.filePath.replace(process.cwd().replace(/\\/g, "/"), ""),
                memDefFiles.text,
                { overwrite: true }
            );
        } else {
            mapFile = outProject.createSourceFile(
                memDefFiles.filePath.replace(process.cwd().replace(/\\/g, "/"), ""),
                memDefFiles.text,
                { overwrite: true }
            );
        }
    }
    return {
        declFile,
        mapFile,
    };
};
