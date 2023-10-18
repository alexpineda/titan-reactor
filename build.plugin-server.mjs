import { build } from "esbuild";

build({
	entryPoints: ["src/main/index.ts"],
	bundle: true,
	outfile: "dist/plugin-server/index.js",
	plugins: [
	],
	tsconfig: "tsconfig.node.json",
	platform:"node",
	
	
});