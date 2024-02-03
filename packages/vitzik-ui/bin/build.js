#! /usr/bin/env node
import {
  runWebpack,
  generateTypeDefinitions,
  clearOutputDir,
} from "./utils/index.js";
import { PACKAGE_NAME } from "./const/index.js";

(() => {
  console.log(`Starting build task in ${PACKAGE_NAME}`);
  clearOutputDir();
  runWebpack();
  generateTypeDefinitions();
})();
