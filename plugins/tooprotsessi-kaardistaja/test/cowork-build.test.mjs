import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildAll, buildZip, root } from "../../../scripts/build-cowork.mjs";

const files = await buildAll();
const plugin = JSON.parse(await readFile(new URL("../.claude-plugin/plugin.json", import.meta.url), "utf8"));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map((entry) => (entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)])));
  return nested.flat();
}

test("Cowork-kaustad ja zipid vastavad plugina allikatele (vea korral käivita npm run build)", async () => {
  for (const [relative, expected] of files) {
    const actual = await readFile(path.join(root, relative)).catch(() => null);
    assert.ok(actual, `${relative} puudub`);
    assert.ok(expected.equals(actual), `${relative} on aegunud`);
  }
});

test("Cowork-kaustades ja dist kaustas ei ole genereerimata faile", async () => {
  const onDisk = [...(await walk(path.join(root, "cowork-skill"))), ...(await walk(path.join(root, "dist")))]
    .map((file) => path.relative(root, file).split(path.sep).join("/"))
    .filter((file) => !file.endsWith(".DS_Store"));

  for (const file of onDisk) assert.ok(files.has(file), `${file} ei ole genereeritud`);
});

test("Cowork SKILL.md failid ei sisalda plugina-spetsiifilist teksti ja kannavad plugina versiooni", () => {
  const skills = [...files].filter(([relative]) => relative.endsWith("/SKILL.md"));

  assert.equal(skills.length, 2);
  for (const [relative, data] of skills) {
    const text = data.toString("utf8");
    assert.doesNotMatch(text, /\$ARGUMENTS|\$\{CLAUDE_SKILL_DIR\}|<!-- kanal|argument-hint|references\//, relative);
    assert.match(text, new RegExp(`version: "${plugin.version.replaceAll(".", "\\.")}"`), relative);
  }
});

test("Cowork kaardista säilitab OneDrive'i ja SharePointi salvestuse ning viitab ehitamise oskusele", () => {
  const text = files.get("cowork-skill/tooprotsessi-kaardistaja/SKILL.md").toString("utf8");

  assert.match(text, /OneDrive'i või SharePointi sihtkaust/);
  assert.doesNotMatch(text, /Kas salvestan kaardi siia\?/);
  assert.match(text, /oskust `tooprotsessi-ehita`/);
  assert.match(text, /Ehita selle kaardi põhjal esimene prototüüp/);
});

test("Cowork ehita viitab kaardistamise oskusele ja jätab abiplokid alles", () => {
  const text = files.get("cowork-skill/tooprotsessi-ehita/SKILL.md").toString("utf8");

  assert.match(text, /^name: tooprotsessi-ehita$/m);
  assert.match(text, /`tooprotsessi-kaardistaja`/);
  assert.match(text, /\(ehituse-redel\.md\)/);
  assert.ok(files.has("cowork-skill/tooprotsessi-ehita/ehituse-redel.md"));
});

test("Cowork ei sisalda tutorial oskust", () => {
  assert.equal([...files.keys()].some((relative) => /tutorial/.test(relative)), false);
});

test("Cowork kaardi mall ja andmeleping on plugina omaga identsed", async () => {
  const skillDir = new URL("../skills/kaardista/", import.meta.url);

  assert.ok(files.get("cowork-skill/tooprotsessi-kaardistaja/tooprotsessi-kaart.html").equals(await readFile(new URL("tooprotsessi-kaart.html", skillDir))));
  assert.ok(files.get("cowork-skill/tooprotsessi-kaardistaja/map-schema.md").equals(await readFile(new URL("references/map-schema.md", skillDir))));
});

test("zip kirjutaja on deterministlik ja kirjutab õige arvu kirjeid", () => {
  const entries = [{ name: "b.txt", data: Buffer.from("teine") }, { name: "a.txt", data: Buffer.from("esimene õ") }];
  const first = buildZip(entries);
  const second = buildZip([...entries].reverse());

  assert.ok(first.equals(second));
  assert.equal(first.readUInt32LE(0), 0x04034b50);
  assert.equal(first.readUInt16LE(first.length - 22 + 10), 2);
});
