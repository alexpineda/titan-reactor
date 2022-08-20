import * as tsm from "ts-morph";

export const removeImportDeclarations = (content: string, specifiers: string[] | true) => {
    const project = new tsm.Project({
        compilerOptions: {
            isolatedModules: false,
            module: tsm.ModuleKind.CommonJS,
            target: tsm.ts.ScriptTarget.ESNext,
            allowJs: true,
        },
        skipAddingFilesFromTsConfig: true,
    });
    const file = project.createSourceFile("plugin.ts", content);
    for (const importDecl of file.getImportDeclarations()) {
        if (specifiers === true || specifiers.includes(importDecl.getModuleSpecifierValue())) {
            importDecl.remove();
        }
    }
    return file.getText(true);
}