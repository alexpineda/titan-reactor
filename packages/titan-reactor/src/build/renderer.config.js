const webpackRenderer = require("electron-webpack/webpack.renderer.config.js");

module.exports = (env) => {
  return new Promise((resolve, reject) => {
    /* get provided config */
    webpackRenderer(env).then((rendererConfig) => {
      console.log("rendererConfig", rendererConfig);
      rendererConfig.resolve.extensions.push(".mjs");

      const babelLoader = rendererConfig.module.rules.find(
        (rule) => rule.use.loader === "babel-loader"
      );

      //   babelLoader.use.options.plugins.push(
      //     "@babel/plugin-proposal-class-properties"
      //   );

      /* return modified config to webpack */
      resolve(rendererConfig);
    });
  });
};
