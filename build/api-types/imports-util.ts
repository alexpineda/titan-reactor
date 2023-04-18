import * as tsm from "ts-morph";
import { getNodeId } from "./util";

export class ImportNodeUtil {
    #namedImportNodes = new Map<string, string>();
    #namedImports = new Map<string, Set<string>>();

    #defaultImportNodes = new Map<string, string>();
    #defaultImports = new Map<string, Set<string>>();

    registerImports(id: tsm.Identifier, sourceFile: tsm.SourceFile) {
        const importDecls = sourceFile.getImportDeclarations();

        for (const importDecl of importDecls) {
            importDecl.getNamedImports().forEach((namedImport) => {
                if (getNodeId(namedImport).getText() === id.getText()) {
                    this.#namedImportNodes.set(
                        getNodeId(namedImport).getText(),
                        importDecl.getModuleSpecifierValue()
                    );
                }
            });
            const importClause = importDecl.getImportClause();
            if (importClause) {
                if (getNodeId(importClause).getText() === id.getText()) {
                    this.#defaultImportNodes.set(
                        getNodeId(importClause).getText(),
                        importDecl.getModuleSpecifierValue()
                    );
                }
            }
        }
    }

    prepareOutput(declNode: tsm.Node) {
        const nodeId = getNodeId(declNode);

        if (this.#namedImportNodes.has(nodeId.getText())) {
            const importDeclaration = this.#namedImportNodes.get(nodeId.getText())!;
            if (!this.#namedImports.has(importDeclaration)) {
                this.#namedImports.set(importDeclaration, new Set());
            }

            this.#namedImports.get(importDeclaration)!.add(nodeId.getText());
            return true;
        } else if (this.#defaultImportNodes.has(nodeId.getText())) {
            const importDeclaration = this.#defaultImportNodes.get(nodeId.getText())!;
            if (!this.#defaultImports.has(importDeclaration)) {
                this.#defaultImports.set(importDeclaration, new Set());
            }

            this.#defaultImports.get(importDeclaration)!.add(nodeId.getText());

            return true;
        }

        return false;
    }

    get output() {
        const content: string[] = [];
        for (const [importDeclaration, defaultImports] of this.#defaultImports) {
            for (const defaultImport of defaultImports) {
                content.push(`import ${defaultImport} from "${importDeclaration}"`);
            }
        }

        for (const [importDeclaration, namedImports] of this.#namedImports) {
            content.push(
                `import { ${[...namedImports].join(
                    ", "
                )} } from "${importDeclaration}";`
            );
        }
        return content.join("\n");
    }

    get diagnostics() {
        const externNamedImportNodes = [];
        for (const [namedImports, importDeclaration] of this.#namedImportNodes) {
            externNamedImportNodes.push(
                `import { ${namedImports} } from "${importDeclaration}";`
            );
        }

        // external imports that were referenced in d.ts files
        const externNamedImports = [];
        for (const [importDeclaration, namedImports] of this.#namedImports) {
            externNamedImports.push(
                `import { ${[...namedImports].join(
                    ", "
                )} } from "${importDeclaration}";`
            );
        }

        const externDefaultImportNodes = [];
        for (const [defaultImport, importDeclaration] of this.#defaultImportNodes) {
            externDefaultImportNodes.push(
                `import ${defaultImport} from "${importDeclaration}";`
            );
        }

        const externDefaultImports = [];
        for (const [importDeclaration, defaultImports] of this.#defaultImports) {
            for (const defaultImport of defaultImports) {
                externDefaultImports.push(
                    `import ${defaultImport} from "${importDeclaration}";`
                );
            }
        }

        return {
            externNamedImportNodes,
            externNamedImports,
            externDefaultImportNodes,
            externDefaultImports,
        };
    }
}
