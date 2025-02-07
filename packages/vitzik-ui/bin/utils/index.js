import { exec } from 'child_process'
import fs from 'fs'
import { ROOT_DIR, OUTPUT_DIR } from '../const/index.js'

export function runWebpack(watch = false) {
    console.log('Run Webpack config')
    const webpackProcess = exec(
        `webpack ${watch ? '-w' : ''} --config webpack.config.cjs`
    )

    webpackProcess.stdout.on('data', function (data) {
        console.log(data)
    })
}

export function transpileTsToJs(watch = false) {
    console.log('Transpiling TypeScript to JavaScript')
    const babelProcess = exec(
        `babel ${watch ? '-w' : ''} --extensions .ts,.tsx ${ROOT_DIR} -d ${OUTPUT_DIR} --ignore **/*.test.tsx,**/*.test.ts`
    )

    babelProcess.stdout.on('data', function (data) {
        console.log(data)
    })
}

export function clearOutputDir() {
    console.log(`Clearing ${OUTPUT_DIR} folder`)
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
}

export function generateTypeDefinitions(watch = false) {
    console.log('Generating d.ts files')
    const tscProcess = exec(
        `tsc --rootDir ${ROOT_DIR} --outDir ${OUTPUT_DIR} --emitDeclarationOnly ${watch ? '-w' : ''} -p tsconfig.json`
    )

    tscProcess.stdout.on('data', function (data) {
        console.log(data)
    })
}
