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
              comments: false, // xóa comment
            },
            compress: {
              drop_console: true,   // bỏ console.log
              drop_debugger: true,  //bỏ debugger
              passes: 2,            // chạy nhiều vòng tối ưu hơn
              pure_getters: true,   // giả định getter không có side-effect
              // unsafe: true,         // tối ưu sâu hơn, nhưng nên test kỹ
            },
            mangle: {
              // rút gọn các thuộc tính bắt đầu bằng _
              properties: {
                regex: /^_/,
              },
            },
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
