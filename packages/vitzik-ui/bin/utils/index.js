const { exec } = require("child_process");
const fs = require("fs");
const { ROOT_DIR, OUTPUT_DIR } = require("../const");

function runWebpack(watch = false) {
  console.log("Run Webpack config");
  const webpackProcess = exec(
      `webpack ${watch ? '-w': ''} --config webpack.config.js`
  );

  webpackProcess.stdout.on("data", function (data) {
    console.log(data);
  });
}

function transpileTsToJs(watch = false) {
  console.log("Transpiling TypeScript to JavaScript");
  const babelProcess = exec(
      `babel ${watch ? '-w': ''} --extensions .ts,.tsx ${ROOT_DIR} -d ${OUTPUT_DIR} --ignore **/*.test.tsx,**/*.test.ts`
  );

  babelProcess.stdout.on("data", function (data) {
    console.log(data);
  });
}

function clearOutputDir() {
  console.log(`Clearing ${OUTPUT_DIR} folder`);
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}

function generateTypeDefinitions(watch = false) {
  console.log("Generating d.ts files");
  const tscProcess = exec(
      `tsc --rootDir ${ROOT_DIR} --outDir ${OUTPUT_DIR} --emitDeclarationOnly ${watch ? '-w': ''}`
  );

  tscProcess.stdout.on("data", function (data) {
    console.log(data);
  });
}

module.exports = {
  runWebpack,
  transpileTsToJs,
  clearOutputDir,
  generateTypeDefinitions
};
