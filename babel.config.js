// babel.config.js
module.exports = {
  plugins: ["@babel/plugin-proposal-class-properties"],
  assumptions: {
    setPublicClassFields: true,
  },
};
