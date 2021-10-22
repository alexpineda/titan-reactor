const aliases = require("./aliases");

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
    ...aliases,
  };
  //eslint-disable-next-line
  console.log(JSON.stringify(config, null, 4));

  return config;
};
