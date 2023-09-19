module.exports = function(eleventyConfig) {
    // Add a filter using the Config API
    // eleventyConfig.addPassthroughCopy('assets');
  
    // Returning the config object
    return {
      dir: {
        input: "docs/src/pages",
        includes: "docs/src/_includes",
        output: "docs/www"
      }
    };
  };