const esbuild = require("esbuild");
// const { copy, move } = require("fs-extra");
const { rmSync  } = require("fs");
// const path = require("path");
// const { createHash } = require("crypto");

const OUTDIR = "dist/plugin-host-es";

rmSync(OUTDIR, { recursive: true, force: true });

(async () => {
    await esbuild.build({
        entryPoints: ["src/utils/types/plugin-host.ts"],
        outdir: OUTDIR,
        keepNames: true,
        minify: false,
        format: "esm",
        bundle: true,
        
    });
})();
