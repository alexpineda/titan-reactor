const aliases = require("./src/build/aliases");
const aliasList = Object.entries(aliases).reduce(
  (arr, [key, val]) => [...arr, [key, val]],
  []
);

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    "jest/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "jest"],
  rules: {
    "linebreak-style": ["error", "windows"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-console": ["warn", { allow: ["error"] }],
    "react/display-name": 0,
    "react/prop-types": 0,
    "no-empty": ["error", { allowEmptyCatch: true }],
    "import/no-duplicates": 0,
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-interface": "off",
  },
  globals: {
    __static: true,
  },
  settings: {
    react: {
      pragma: "React",
      fragment: "Fragment",
      version: "17.0.0",
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
