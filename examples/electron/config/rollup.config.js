const typescript = require("@rollup/plugin-typescript");
const nodeResolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const terser = require("@rollup/plugin-terser");

module.exports = {
    input: "src/renderer.ts",
    output: {
        dir: "dist",
        format: "cjs",
    },
    plugins: [
        typescript(),
        nodeResolve(),
        commonjs(),
        json(),
        terser(),
    ],
}