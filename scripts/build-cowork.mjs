// Builds the Claude.ai / Cowork skill folders and zips from the plugin skills.
// The plugin skills are the only hand-edited source; run `npm run build` after changing them.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crc32 } from "node:zlib";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.join(root, "plugins/tooprotsessi-kaardistaja");
const overrides = path.join(root, "scripts/cowork-overrides");

const BLOCK = /<!-- kanal:([\w-]+) -->\n([\s\S]*?)<!-- \/kanal -->\n?/g;
const renames = [["`ehita`", "`tooprotsessi-ehita`"], ["`kaardista`", "`tooprotsessi-kaardistaja`"]];

const skills = [
  { source: "kaardista", name: "tooprotsessi-kaardistaja", assets: [["references/map-schema.md", "map-schema.md"], ["tooprotsessi-kaart.html", "tooprotsessi-kaart.html"]] },
  { source: "ehita", name: "tooprotsessi-ehita", assets: [["references/ehituse-redel.md", "ehituse-redel.md"]] }
];

function blocks(text) {
  return new Map([...text.matchAll(BLOCK)].map((match) => [match[1], match[2]]));
}

function splitFrontmatter(text) {
  const match = text.match(/^---\n[\s\S]*?\n---\n/);
  if (!match) throw new Error("Frontmatter puudub.");
  return { frontmatter: match[0], body: text.slice(match[0].length) };
}

function coworkSkillText(pluginText, overrideText, version) {
  const { body } = splitFrontmatter(pluginText);
  const { frontmatter: coworkFrontmatter, body: overrideBody } = splitFrontmatter(overrideText);
  const replacement = blocks(overrideBody);
  let text = body.replace(BLOCK, (_, name) => {
    if (!replacement.has(name)) throw new Error(`Cowork-varianti plokk puudub: ${name}`);
    return replacement.get(name);
  });
  for (const [from, to] of renames) text = text.split(from).join(to);
  text = text.replaceAll("references/", "").replaceAll("${CLAUDE_SKILL_DIR}/", "");
  if (replacement.has("lisa")) text = `${text.trimEnd()}\n\n${replacement.get("lisa").trimEnd()}\n`;
  const result = `${coworkFrontmatter.replace("__VERSION__", version)}\n${text.trimStart()}`;
  for (const leak of ["$ARGUMENTS", "${CLAUDE_SKILL_DIR}", "<!-- kanal", "argument-hint"]) {
    if (result.includes(leak)) throw new Error(`Cowork-väljundisse jäi plugina-spetsiifiline tekst: ${leak}`);
  }
  return result;
}

export function buildZip(entries) {
  const sorted = [...entries].sort((a, b) => (a.name < b.name ? -1 : 1));
  const parts = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of sorted) {
    const nameBuffer = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x0800, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0x21, 14);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(data.length, 20);
    header.writeUInt32LE(data.length, 24);
    header.writeUInt16LE(nameBuffer.length, 28);
    header.writeUInt32LE(offset, 42);
    parts.push(local, nameBuffer, data);
    central.push(header, nameBuffer);
    offset += local.length + nameBuffer.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(sorted.length, 8);
  end.writeUInt16LE(sorted.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, directory, end]);
}

// Returns { files: Map<relative path, Buffer> } for the tracked cowork-skill/ folder and dist/ zips.
export async function buildAll() {
  const plugin = JSON.parse(await readFile(path.join(pluginRoot, ".claude-plugin/plugin.json"), "utf8"));
  const files = new Map();
  for (const skill of skills) {
    const skillDir = path.join(pluginRoot, "skills", skill.source);
    const pluginText = await readFile(path.join(skillDir, "SKILL.md"), "utf8");
    const overrideText = await readFile(path.join(overrides, `${skill.source}.md`), "utf8");
    const entries = [{ name: "SKILL.md", data: Buffer.from(coworkSkillText(pluginText, overrideText, plugin.version), "utf8") }];
    for (const [from, to] of skill.assets) entries.push({ name: to, data: await readFile(path.join(skillDir, from)) });
    for (const entry of entries) files.set(`cowork-skill/${skill.name}/${entry.name}`, entry.data);
    files.set(`dist/${skill.name}-cowork-skill.zip`, buildZip(entries));
  }
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await buildAll();
  await rm(path.join(root, "cowork-skill"), { recursive: true, force: true });
  for (const [relative, data] of files) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    console.log(`kirjutatud ${relative}`);
  }
}
