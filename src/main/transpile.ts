import { transformAsync } from "@babel/core";

export interface TransformSyntaxError extends Error {
  message: string;
  loc: {
    line: number;
    column: number;
  };
  snippet: string;
}

export default async (
  content: string,
  transpileErrors: TransformSyntaxError[]
) => {
  try {
    const result = await transformAsync(content, {
      presets: [
        
        "@babel/preset-react",
      ],
      configFile: false,
      browserslistConfigFile: false,
      sourceMaps: "inline",
      sourceType: "module",
      babelrc: false,
      
    });

    return result;
  } catch (e) {
    //@ts-ignore
    transpileErrors.push(e);
    return null;
  }
};
