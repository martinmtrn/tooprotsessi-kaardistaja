import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildExample, output } from "../../../scripts/build-example.mjs";
import { render } from "./fixtures/dom-harness.mjs";
import { assertPortfolioContract } from "./fixtures/portfolio-contract.mjs";

const dataFile = new URL("../../../examples/kliendiparing.map.json", import.meta.url);
const map = JSON.parse(await readFile(dataFile, "utf8"));

test("näidiskaardi HTML vastab mallile ja andmefailile (vea korral käivita npm run build)", async () => {
  assert.equal(await readFile(output, "utf8"), await buildExample());
});

test("näidiskaart vastab V6 portfelli turva- ja struktuurilepingule", () => {
  assertPortfolioContract("kliendiparing", map);
  assert.equal(map.schemaVersion, 6);
  assert.ok(map.steps.length >= 5 && map.steps.length <= 12);
});

test("näidiskaardi soovitatud prototüüp on valmis ehita oskuse sisendiks", () => {
  const recommended = map.prototypeIdeas.find((idea) => idea.id === map.recommendedPrototypeId);

  assert.ok(map.processContext.tools.length >= 1);
  assert.ok(map.processContext.toolLimits);
  assert.ok(recommended.benefitHypothesis.measurement.metric);
  for (const field of ["hypothesis", "scope", "testData", "firstBuild", "humanCheck", "successMetric", "stopCondition", "ownerQuestion"]) {
    assert.ok(recommended.prototypePlan[field], `prototypePlan.${field}`);
  }
});

test("näidiskaardis on ainult fiktiivsed andmed ja uus tekst kasutab ainult sidekriipsu", async () => {
  const text = await readFile(dataFile, "utf8");

  assert.match(text, /fiktiivsed/);
  assert.doesNotMatch(text, new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`));
  assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
});

test("mall renderdab näidiskaardi, tööriistad ja Mis edasi paneeli ilma veata", async () => {
  const nodes = await render(map, { location: { protocol: "file:", pathname: "/Users/mari/kliendiparing-naidiskaart.html" } });

  assert.ok(nodes.some((node) => node.tagName === "dd" && node.textContent === "Outlook · Excel · Claude"));
  assert.equal(nodes.find((node) => node.id === "next-step").hidden, false);
  assert.equal(nodes.find((node) => node.id === "next-step-heading").textContent, "Alusta oma esimest ehitust");
  assert.equal(nodes.filter((node) => node.className.split(" ").includes("step")).length, map.steps.length);
});
