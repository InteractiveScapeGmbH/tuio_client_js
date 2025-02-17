import dts from "vite-plugin-dts"
import path from "path";
import { defineConfig, UserConfig } from "vite";

export default defineConfig({
    base: "./",
    plugins: [dts({ rollupTypes: true })],
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/tuio-client.ts"),
            name: "TuioClient",
            formats: ["es", "cjs", "umd", "iife"],
            fileName: (format) => `tuio-client.${format}.js`,
        },
    },
} satisfies UserConfig);