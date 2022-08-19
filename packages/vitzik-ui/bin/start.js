#! /usr/bin/env node
const { exec } = require("child_process");

const packageName = "vitzik-ui";
const rootDir = "src";
const outputDir = "lib";

(() => {
  console.log(`Starting ${packageName} in watch mode`);
  generateTypeDefinitions();
  transpileTsToJs();
})();

function generateTypeDefinitions() {
  console.log("Generating d.ts files");
  const tscProcess = exec(
    `tsc --rootDir ${rootDir} --outDir ${outputDir} --emitDeclarationOnly -w`
  );

  tscProcess.stdout.on("data", function (data) {
    console.log(data);
  });
}

function transpileTsToJs() {
  console.log("Transpiling TypeScript to JavaScript");
  const babelProcess = exec(
    `babel -w --extensions .ts,.tsx ${rootDir} -d ${outputDir} --ignore **/*.test.tsx,**/*.test.ts`
  );

  babelProcess.stdout.on("data", function (data) {
    console.log(data);
  });
}
