import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

function createConfig(input, name, outputFile) {
  return {
    input,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
    output: [
      {
        file: `dist/${outputFile}.js`,
        format: "iife",
        name,
        sourcemap: false,
      },
      {
        file: `dist/${outputFile}.min.js`,
        format: "iife",
        name,
        plugins: [
          terser({
            format: {
              comments: false,
            },
            compress: {
              drop_console: false, // giữ log khi test
              drop_debugger: true,
              passes: 2,
              pure_getters: true,
            },
            mangle: {
  properties: {
    regex: /^_/,
    reserved: ["_arfQueue", "_arfPlugins", "_arfProcessQueue", "__arf_sdk_loaded__"],
  },
}
          }),
        ],
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      }),
    ],
  };
}

export default [
  createConfig("src/main-sdk.ts", "ARFSDK", "main-sdk"),
  createConfig("src/plugins/plugin-banner.ts", "ARFPluginBanner", "plugin-banner"),
  createConfig("src/plugins/plugin-popup.ts", "ARFPluginPopup", "plugin-popup"),
  createConfig("src/plugins/plugin-float.ts", "ARFPluginFloat", "plugin-float"),
  createConfig("src/plugins/plugin-codeclogo.ts", "ARFPluginLogo", "plugin-codeclogo"),
  createConfig("src/monitor/genTracking.ts", "ARFGenTracking", "genTracking"),
];
