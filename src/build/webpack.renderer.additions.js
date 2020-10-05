const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      },
    ],
  },
  resolve: {
    alias: {
      image: path.resolve("./src/renderer/image"),
      environment: path.resolve("./src/renderer/3d-map-rendering"),
      mesh: path.resolve("./src/renderer/mesh"),
      utils: path.resolve("./src/renderer/utils"),
      bwdat: path.resolve("./src/common/bwdat"),
    },
  },
};
