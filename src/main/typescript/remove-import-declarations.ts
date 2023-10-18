import * as tsm from "ts-morph";

export const removeImportDeclarations = (
    filename: string,
    content: string,
    specifiers: string[] | true
) => {
    const project = new tsm.Project( {
        compilerOptions: {
            isolatedModules: false,
            module: tsm.ModuleKind.CommonJS,
            target: tsm.ts.ScriptTarget.ESNext,
            allowJs: true,
        },
        skipAddingFilesFromTsConfig: true,
        useInMemoryFileSystem: true,
    } );
    const file = project.createSourceFile( filename, content );
    for ( const importDecl of file.getImportDeclarations() ) {
        if (
            specifiers === true ||
            specifiers.includes( importDecl.getModuleSpecifierValue() )
        ) {
            importDecl.replaceWithText(importDecl.getFullText().split("\n").map(str => `//${str}`).join("\n"));
            // importDecl.remove();
        }
    }
    return file.getText( true );
};
