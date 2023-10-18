import { build } from "esbuild";
import inlineImportPlugin from 'esbuild-plugin-inline-import';

build({
	entryPoints: ["src/main/ui-server/ui-server.ts"],
	bundle: true,
	outfile: "dist/ui-server/index.js",
	plugins: [
		inlineImportPlugin()
	],
	tsconfig: "tsconfig.node.json",
	platform:"node",

	
});