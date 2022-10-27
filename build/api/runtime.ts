import * as tsm from "ts-morph";
import * as ts from "typescript";
import { fn } from "./util";

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
    project.addSourceFileAtPath(
        fn("./src/common/types/declarations/titan-reactor-host.d.ts")
    );
    project.emit();
};

buildRunTimeTypes();
