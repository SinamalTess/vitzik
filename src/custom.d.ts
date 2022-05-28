/*
Fix for : TS2307: Cannot find module '../../../...svg' or its corresponding type declarations
See : https://webpack.js.org/guides/typescript/#importing-other-assets
*/

declare module "*.svg" {
    const content: any
    export default content
}
