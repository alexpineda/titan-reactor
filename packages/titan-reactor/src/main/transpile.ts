import { transform } from "buble";

export interface TransformSyntaxError extends Error {
    message: string;
    loc: {
        line: number;
        column: number;
    };
    snippet: string;
}

export default (content: string, transpileErrors: TransformSyntaxError[]) => {
    try {
        return transform(content, {
            transforms: {
                arrow: false,
                modules: false,
                dangerousForOf: false,
                classes: false,
                computedProperty: false,
                templateString: false,
                dangerousTaggedTemplateString: false,
                letConst: false,
                generator: false,
                destructuring: false,
                spreadRest: false,
                defaultParameter: false,
                forOf: false,
                objectRestSpread: false,
                exponentiation: false,
                conciseMethodProperty: false,
                numericLiteral: false,
                parameterDestructuring: false,
                reservedProperties: false,
                trailingFunctionCommas: false,
                unicodeRegExp: false,
            },
            file: `out.js`,
            source: `source.jsx`,
            namedFunctionExpressions: false,
        }).code;
    } catch (e) {
        transpileErrors.push(e as TransformSyntaxError);
        return "";
    }
}

