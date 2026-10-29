import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skill = new URL("../skills/ehita/SKILL.md", import.meta.url);
const ladder = new URL("../skills/ehita/references/ehituse-redel.md", import.meta.url);

test("ehita töövoog loeb kaarti turvaliselt ja ei käivita selle HTML-i", async () => {
  const source = await readFile(skill, "utf8");

  assert.match(source, /^name: ehita$/m);
  assert.match(source, /map-data/);
  assert.match(source, /Ära käivita kaardi HTML-i/);
  assert.match(source, /recommendedPrototypeId/);
  assert.match(source, /prototypePlan/);
});

test("ehita küsib tööriistad ning ei soovita osta ega eelda ligipääsu", async () => {
  const source = await readFile(skill, "utf8");

  assert.match(source, /processContext\.tools/);
  assert.match(source, /Milliste tööriistadega on sul päriselt ligipääs/);
  assert.match(source, /Ära soovita tööriista osta/);
  assert.match(source, /Ära eelda, et kasutajal on ligipääs/);
});

test("ehita kirjutab ainult kinnitatud kausta ning kasutab ainult näidisandmeid", async () => {
  const source = await readFile(skill, "utf8");

  assert.match(source, /Ära loo kaustu ega kirjuta faile enne, kui kasutaja on kinnitanud täpse absoluutse ehituskausta/);
  assert.match(source, /Kas loon komplekti siia\?/);
  assert.match(source, /fiktiivseid või anonüümitud näidisandmeid/);
  assert.match(source, /ei kirjuta tootmissüsteemi/);
  assert.match(source, /Ära muuda kaardifaili/);
  assert.doesNotMatch(source, /kirjutab faili üle/);
});

test("ehita viib läbi juhendatud esimese ehituse ja lõpeb otsusega", async () => {
  const source = await readFile(skill, "utf8");

  for (const marker of ["Näidisandmed", "Käivita ehitus", "Inimese kontroll", "Tulemuste tabel", "Otsus"]) {
    assert.match(source, new RegExp(`\\*\\*${marker}\\.\\*\\*`));
  }
  assert.match(source, /05-jargmine-samm\.md/);
  assert.match(source, /successMetric/);
  assert.match(source, /stopCondition/);
});

test("ehituse redel katab viis sammu ja viidatakse SKILL.md-st", async () => {
  const source = await readFile(skill, "utf8");
  const steps = await readFile(ladder, "utf8");

  assert.match(source, /references\/ehituse-redel\.md/);
  for (const heading of ["### 1. Prompt ja testjuhtumid", "### 2. Valem või kontrollreegel", "### 3. Väike skript näidisandmetel", "### 4. Voo kirjeldus mustandina", "### 5. Paketeeritud juhis või oskus"]) {
    assert.ok(steps.includes(heading), heading);
  }
  assert.match(steps, /Ära soovita tööriista osta/);
});

test("ehita on õppijale nähtav: mudel võib seda kasutada ja see ei ole ainult käsitsi käivitatav", async () => {
  const source = await readFile(skill, "utf8");
  const frontmatter = source.split("---")[1];

  assert.doesNotMatch(frontmatter, /disable-model-invocation/);
  assert.match(frontmatter, /argument-hint:/);
});
