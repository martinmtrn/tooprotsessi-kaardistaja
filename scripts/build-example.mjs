// Builds the student-facing example map from the plugin template and examples/kliendiparing.map.json.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = path.join(root, "plugins/tooprotsessi-kaardistaja/skills/kaardista/tooprotsessi-kaart.html");
const dataFile = path.join(root, "examples/kliendiparing.map.json");
export const output = path.join(root, "examples/kliendiparing-naidiskaart.html");

// Same escaping rule as skills/kaardista/SKILL.md: <, >, &, U+2028 and U+2029 become unicode escapes.
export function embed(map) {
  return JSON.stringify(map, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replaceAll(String.fromCharCode(0x2028), "\\u2028")
    .replaceAll(String.fromCharCode(0x2029), "\\u2029");
}

export async function buildExample() {
  const html = await readFile(template, "utf8");
  const map = JSON.parse(await readFile(dataFile, "utf8"));
  if (!html.includes("__TOOPROTSESSI_KAART_DATA__")) throw new Error("Malli andmekoht puudub.");
  return html.replace("__TOOPROTSESSI_KAART_DATA__", () => embed(map));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(output, await buildExample());
  console.log(`kirjutatud ${path.relative(root, output)}`);
}
