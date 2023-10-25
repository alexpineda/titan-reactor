const esbuild = require("esbuild");
const { copy, move } = require("fs-extra");
const { rmSync, readFileSync, writeFileSync, createReadStream } = require("fs");
const path = require("path");
const { createHash } = require("crypto");

rmSync("dist/plugins", { recursive: true, force: true });

(async () => {
    await esbuild.build({
        entryPoints: ["src/runtime.tsx"],
        outdir: "dist/plugins",
        keepNames: true,
        minify: false,
        format: "esm",
    });

    // copy assets
    await copy("bundled/assets", "dist/plugins/assets");
    await copy("src/runtime.html", "dist/plugins/runtime.html");

    // make file hash for cache busting
    const fileHash = (
        (await generateFileHash("dist/plugins/runtime.js")) as string
    ).substring(0, 8);

    const newFileName = `runtime.${fileHash}.js`;
    await move("dist/plugins/runtime.js", `dist/plugins/${newFileName}`);

    const htmlPath = path.join(__dirname, "dist", "plugins", "runtime.html");
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
