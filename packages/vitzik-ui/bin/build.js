#! /usr/bin/env node
const { runWebpack, generateTypeDefinitions, clearOutputDir} = require("./utils");
const { PACKAGE_NAME } = require("./const");

(() => {
  console.log(`Starting build task in ${PACKAGE_NAME}`);
  clearOutputDir()
  runWebpack();
  generateTypeDefinitions();
})();
