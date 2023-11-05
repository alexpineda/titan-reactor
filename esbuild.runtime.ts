const esbuild = require("esbuild");
const { copy, move } = require("fs-extra");
const { rmSync, readFileSync, writeFileSync, createReadStream } = require("fs");
const path = require("path");
const { createHash } = require("crypto");

const OUTDIR = "dist/runtime";

rmSync(OUTDIR, { recursive: true, force: true });

(async () => {
    await esbuild.build({
        entryPoints: ["src/runtime.tsx"],
        outdir: OUTDIR,
        keepNames: true,
        minify: false,
        format: "esm",
    });

    // copy assets
    await copy("bundled/assets", `${OUTDIR}/assets`);
    await copy("src/runtime.html", `${OUTDIR}/runtime.html`);

    // make file hash for cache busting
    const fileHash = (
        (await generateFileHash(`${OUTDIR}/runtime.js`)) as string
    ).substring(0, 8);

    const newFileName = `runtime.${fileHash}.js`;
    await move(`${OUTDIR}/runtime.js`, `${OUTDIR}/${newFileName}`);

    const htmlPath = path.join(__dirname, "dist", "runtime", "runtime.html");
    const content = readFileSync(htmlPath, "utf8").replace(/runtime.js/g, newFileName);
    writeFileSync(htmlPath, content, "utf8");
})();

function generateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = createHash("sha256");
        const fileStream = createReadStream(filePath);

        fileStream.on("data", (chunk) => {
            hash.update(chunk);
        });

        fileStream.on("end", () => {
            const fileHash = hash.digest("hex");
            resolve(fileHash);
        });

        fileStream.on("error", (err) => {
            reject(err);
        });
    });
}
