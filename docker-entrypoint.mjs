import { writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const runtimeKeys = [
  "VITE_DOMAIN",
  "VITE_AUTH_DOMAIN",
  "VITE_AUTH_PATH",
  "VITE_AUTH_CALLBACK_PATH",
  "VITE_AUTH_SCOPES",
];

const runtimeConfig = Object.fromEntries(
  runtimeKeys
    .filter((key) => process.env[key] !== undefined)
    .map((key) => [key, process.env[key]]),
);

await writeFile(
  new URL("./dist/runtime-config.js", import.meta.url),
  `window.__RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig)};\n`,
);

const preview = spawn(
  "./node_modules/.bin/vite",
  ["preview", "--host", "0.0.0.0", "--port", "4173"],
  { stdio: "inherit" },
);

preview.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});