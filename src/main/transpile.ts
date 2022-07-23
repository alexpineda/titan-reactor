import { createConfigItem, transformAsync } from "@babel/core";

export interface TransformSyntaxError extends Error {
  message: string;
  loc: {
    line: number;
    column: number;
  };
  snippet: string;
}

export default async (
  filename: string,
  content: string,
  transpileErrors: Error[]
) => {
  try {
    const result = await transformAsync(content, {
      filename,
      presets: [
        createConfigItem(require("@babel/preset-react")),
      ],
      configFile: false,
      browserslistConfigFile: false,
      sourceMaps: false,
      sourceType: "module",
      babelrc: false,

    });

    return result;
  } catch (e) {
    if (e instanceof Error) {
      transpileErrors.push(e);
    }
    return null;
  }
};
