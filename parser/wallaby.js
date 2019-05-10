module.exports = function() {
  return {
    files: [
      "./jest.config.js",
      "tsconfig.json",
      "src/**/*.ts",
      "!src/**/*.spec.ts",
      "config/*.json",
      { pattern: "res/**/*", binary: true }
    ],
    filesWithNoCoverageCalculated: [],
    tests: ["src/**/*.spec.ts"],
    env: {
      type: "node",
      runner: "node"
    },
    testFramework: "jest",
    setup: function(wallaby) {
      var path = require("path");
      process.env.NODE_PATH +=
        path.delimiter + path.join(wallaby.projectCacheDir, "src");
      const cfg = require("./jest.config");
      // wallaby uses it's own compiler
      delete cfg.transform;
      wallaby.testFramework.configure(cfg);
    }
  };
};
