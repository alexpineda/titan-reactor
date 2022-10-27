import * as tsm from "ts-morph";
import * as ts from "typescript";
import { fn } from "./util";

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
};

buildEnums();
