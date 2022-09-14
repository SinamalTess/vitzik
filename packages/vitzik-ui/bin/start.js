#! /usr/bin/env node
const { generateTypeDefinitions, runWebpack, clearOutputDir} = require("./utils");
const { PACKAGE_NAME } = require("./const");

(() => {
  console.log(`Starting ${PACKAGE_NAME} in watch mode`);
  clearOutputDir()
  runWebpack(true);
  generateTypeDefinitions(true);
})();
