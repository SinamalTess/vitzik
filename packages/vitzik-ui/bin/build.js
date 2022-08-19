#! /usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

const packageName = "vitzik-ui";
const rootDir = "src";
const outputDir = "lib";

(() => {
  console.log(`Starting build task in ${packageName}`);
  clearOutputDir();
  generateTypeDefinitions();
  transpileTsToJs();
})();

function clearOutputDir() {
  console.log(`Clearing ${outputDir} folder`);
  fs.rmSync(outputDir, { recursive: true, force: true });
}

function generateTypeDefinitions() {
  console.log("Generating d.ts files");
  execSync(
    `tsc --rootDir ${rootDir} --outDir ${outputDir} --emitDeclarationOnly`
  );
}

function transpileTsToJs() {
  console.log("Transpiling TypeScript to JavaScript");
  execSync(
    `babel --extensions .ts,.tsx ${rootDir} -d ${outputDir} --ignore **/*.test.tsx,**/*.test.ts`
  );
}
