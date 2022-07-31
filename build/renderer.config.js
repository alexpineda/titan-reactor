const aliases = require("./aliases");
const path = require("path");

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

  for (const alias in aliases) {
    aliases[alias] = path.resolve(__dirname, "..", aliases[alias]);
  }

  config.resolve.alias = {
    ...config.resolve.alias,
    ...aliases,
  };

  if (config.devServer) {
    config.devServer.watchContentBase = true;
  }

  return config;
};
