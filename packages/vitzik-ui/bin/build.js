#! /usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

const outputDir = "lib";

console.log("Starting build task in vitzik-ui");

console.log(`Clearing ${outputDir} folder`);
fs.rmSync(outputDir, { recursive: true, force: true });

console.log("Generating d.ts files");
execSync("tsc --emitDeclarationOnly");

console.log("Transpiling TypeScript to JavaScript");
execSync(
  "babel --extensions .ts,.tsx src -d lib --ignore **/*.test.tsx,**/*.test.ts"
);
