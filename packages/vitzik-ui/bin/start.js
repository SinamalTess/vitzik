#! /usr/bin/env node
import { PACKAGE_NAME } from "./const/index.js";
import {
  generateTypeDefinitions,
  runWebpack,
  clearOutputDir,
} from "./utils/index.js";

(() => {
  console.log(`Starting ${PACKAGE_NAME} in watch mode`);
  clearOutputDir();
  runWebpack(true);
  generateTypeDefinitions(true);
})();
