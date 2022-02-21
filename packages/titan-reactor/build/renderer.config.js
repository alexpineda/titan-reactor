const aliases = require("./aliases");

module.exports = function (config) {
  config.module.rules.push(
    {
      test: /\.worker\.js$/,
      use: { loader: "worker-loader" },
    },
    {
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"],
    }
  );

  config.resolve.alias = {
    ...config.resolve.alias,
    ...aliases,
  };

  //eslint-disable-next-line
  console.log(JSON.stringify(config, null, 4));

  return config;
};
