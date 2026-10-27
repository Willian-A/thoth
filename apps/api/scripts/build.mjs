import { readFileSync } from "node:fs";
import { build } from "esbuild";

// O pacote @thoth/shared é código-fonte TypeScript, então entra no bundle.
// As demais dependências ficam em node_modules.
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const external = Object.keys(pkg.dependencies ?? {}).filter((name) => !name.startsWith("@thoth/"));

await build({
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  external,
});
