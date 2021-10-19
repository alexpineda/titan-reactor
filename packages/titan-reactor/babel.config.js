// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "classic",
        useBuiltIns: true,
        development: false,
        pragma: "h",
        pragmaFrag: "Fragment",
      },
    ],
  ],
  plugins: ["@babel/plugin-proposal-class-properties"],
};
