module.exports = function (config) {
  // config.devServer.headers = {
  //   "Cache-Control": "no-cache",
  //   "Cross-Origin-Resource-Policy": "same-site",
  //   "Cross-Origin-Embedder-Policy": "require-corp",
  // };

  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: "worker-loader" },
  });

  config.resolve.alias = {
    ...config.resolve.alias,
    react: "preact/compat",
    "react-dom/test-utils": "preact/test-utils",
    "react-dom": "preact/compat", // Must be below test-utils
    "react/jsx-runtime": "preact/jsx-runtime",
  };
  console.log(JSON.stringify(config, null, 4));

  return config;
};
