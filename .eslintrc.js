const aliases = require("./build/aliases.js");
const aliasList = Object.entries(aliases).reduce(
    (arr, [key, val]) => [...arr, [key, val]],
    []
);

module.exports = {
    env: {
        "browser": true,
        "es2021": true,
        "node": true,
        "jest/globals": true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:import/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        debugLevel: true,
    },
    plugins: ["react", "jest", "jest-extended", "jsx-a11y"],
    rules: {
        "quotes": ["error", "double"],
        "no-extra-semi": ["error"],
        "no-console": ["warn", { allow: ["error"] }],
        "liebreak-style": 0,
        "no-empty": ["error", { allowEmptyCatch: true }],
        "no-unused-vars": "off",
        "no-empty-function": "off",
        "object-curly-spacing": ["error", "always"],
        "space-in-parens": ["error", "always", { exceptions: ["empty"] }],
        "computed-property-spacing": ["error", "never"],
        "object-curly-newline": [
            "error",
            {
                multiline: true,
                consistent: true,
            },
        ],
        "padded-blocks": [ "error", "never", { allowSingleLineBlocks: true }],

        "react/display-name": 0,
        "react/prop-types": 0,

        "import/no-duplicates": 0,
        "import/no-unresolved": 0,
        "import/namespace": 0,
        "import/named": 0,
        "import/default": 0,
        "import/no-named-as-default-member": 0,

        "@typescript-eslint/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-non-null-assertion": "off",

        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-floating-promises": "off",

        "@typescript-eslint/prefer-optional-chain": "off",
        "@typescript-eslint/restrict-template-expressions" : ["error", {"allowNumber": true, "allowBoolean": true}],
    },
    globals: {
        __static: true,
    },
    settings: {
        "react": {
            pragma: "React",
            fragment: "Fragment",
            version: "18.0.0",
        },
        "import/resolver": {
            alias: {
                map: [...aliasList, ["common", "./src/common"]],
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
        "import/ignore": [".worker.js"],
    },
};
