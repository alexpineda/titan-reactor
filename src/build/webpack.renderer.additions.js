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
      "@2d-map-rendering": path.resolve(
        __dirname,
        "src/renderer/2d-map-rendering/"
      ),
      "@common": path.resolve(__dirname, "src/common/"),
    },
  },
};
