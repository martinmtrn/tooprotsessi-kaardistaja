import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skill = new URL("../skills/tutorial/SKILL.md", import.meta.url);
const manifest = new URL("../.claude-plugin/plugin.json", import.meta.url);

test("tutorial töövoog kasutab kaarti turvalise kursusestsenaariumi sisendina", async () => {
  const source = await readFile(skill, "utf8");
  const plugin = JSON.parse(await readFile(manifest, "utf8"));

  assert.match(source, /name: tutorial/);
  assert.match(source, /map-data/);
  assert.match(source, /fiktiivne/);
  assert.match(source, /Ära käivita kaardi HTML-i/);
  assert.match(source, /Ära loo kaustu ega kirjuta faile enne/);
  assert.match(source, /tegevusoigus/);
  assert.match(source, /\/start-X-Y/);
  assert.equal(plugin.version, "0.7.0");
});
