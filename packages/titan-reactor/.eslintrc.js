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
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-empty": ["error", { allowEmptyCatch: true }],
    "import/no-duplicates": 0,
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
        extensions: [".js", ".jsx", ".ts"],
      },
    },
    "import/ignore": [".worker.js"],
  },
};
