import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { render, source } from "./fixtures/dom-harness.mjs";
import { assertPortfolioContract } from "./fixtures/portfolio-contract.mjs";
import { prototypeScenarios } from "./fixtures/prototype-scenarios.mjs";

function assessment(recommendedApproach) {
  return {
    suitability: "kohe",
    title: "Abistav samm",
    summary: "Näidishinnang.",
    accessNeed: "Täpsustada.",
    humanCheck: "Inimene kontrollib.",
    recommendedApproach,
    implementationOptions: ["ai_chat", "connector_read", "connector_write", "deterministic"].map((kind) => ({
      kind,
      status: kind === recommendedApproach ? "soovitatud" : "voimalik",
      rationale: `${kind} põhjendus`,
      flow: `${kind} voog`,
      requirements: `${kind} eeldused`,
      humanCheck: `${kind} kontroll`,
      constraint: `${kind} piirang`,
      ...(kind === "deterministic" ? { technology: "Python" } : {})
    }))
  };
}

function descendants(node) {
  return [node, ...node.children.flatMap(descendants)];
}

test("V6 kaart määratleb prototüübiportfelli ja säilitab V5 lahendusteed", async () => {
  const html = await source();

  assert.match(html, /schemaVersion:6/);
  assert.match(html, /prototypeIdeas/);
  assert.match(html, /recommendedPrototypeId/);
  assert.match(html, /PROTOTÜÜBIIDEED/);
  assert.match(html, /const implementationOrder = \["ai_chat", "connector_read", "connector_write", "deterministic"\]/);
  assert.match(html, /ai_chat:"AI-chat käsitsi"/);
  assert.match(html, /connector_read:"Connector: lugemisõigus"/);
  assert.match(html, /connector_write:"Connector: tegevusõigus"/);
  assert.match(html, /deterministic:"Deterministlik lahendus"/);
});

test("V5 lahendusvõrdlus jääb loetavaks ja peidetakse V6 portfelli olemasolul", async () => {
  const html = await source();

  assert.match(html, /if \(!Array\.isArray\(assessment\.implementationOptions\)\) return null/);
  assert.match(html, /if \(kind === recommended\) return \{ \.\.\.option, status:"soovitatud" \}/);
  assert.match(html, /option\.status === "soovitatud" \? \{ \.\.\.option, status:"voimalik" \} : option/);
  assert.match(html, /if \(!hasPortfolio && implementations\) card\.append\(renderImplementationOptions\(assessment, implementations\)\)/);
});

test("lahendusvõrdlus näitab õiguseid, kontrolli ja deterministliku tee märgistust", async () => {
  const html = await source();

  assert.match(html, /AI asemel mõistlikum/);
  assert.match(html, /\[\["TÖÖVOOG",option\.flow\],\["ÕIGUSED JA EELDUSED",option\.requirements\],\["INIMESE KONTROLL",option\.humanCheck\],\["PRAKTILINE PIIRANG",option\.constraint\]\]/);
  assert.match(html, /option\.kind === "deterministic" && hasText\(option\.technology\)/);
  assert.match(html, /Soovitatud tee puudub/);
});

test("vestlusjuhis ja andmeleping nõuavad protsessiülest V6 portfelli", async () => {
  const skill = await readFile(new URL("../skills/kaardista/SKILL.md", import.meta.url), "utf8");
  const schema = await readFile(new URL("../skills/kaardista/references/map-schema.md", import.meta.url), "utf8");

  assert.match(skill, /3–5 eristatavat `prototypeIdeas`/);
  assert.match(skill, /Ära genereeri uutel V6 kaartidel sammupõhiseid `implementationOptions`/);
  assert.match(skill, /read-only integratsiooni tehniline proov/);
  assert.match(schema, /"schemaVersion": 6/);
  assert.match(schema, /V5: säilita `recommendedApproach` ja `implementationOptions`/);
});

test("kaart renderdab kõik neli varianti ning ainult ühe soovitusena", async () => {
  const nodes = await render({ schemaVersion: 5, title: "Test", steps: [{ number: 1, action: "Tee", aiAssessment: assessment("connector_read") }] });

  assert.equal(nodes.filter((node) => node.className.split(" ").includes("solution-option")).length, 4);
  assert.equal(nodes.filter((node) => node.className === "option-status" && node.textContent === "Soovitatud").length, 1);
  assert.equal(nodes.filter((node) => node.className === "option-status" && node.textContent === "Võimalik").length, 3);
});

test("deterministlik soovitus ja V4 kaart saavad õige vaate", async () => {
  const v5Nodes = await render({ schemaVersion: 5, title: "Test", steps: [{ number: 1, action: "Arvuta", aiAssessment: assessment("deterministic") }] });
  const v4Nodes = await render({ schemaVersion: 4, title: "Vana kaart", steps: [{ number: 1, action: "Tee", aiAssessment: { suitability: "kohe", title: "AI roll", summary: "Vana hinnang", accessNeed: "Näidissisend", humanCheck: "Inimene kontrollib" } }] });

  assert.equal(v5Nodes.filter((node) => node.className.includes("solution-badge") && node.textContent === "AI asemel mõistlikum").length, 1);
  assert.equal(v4Nodes.filter((node) => node.className.includes("solution-details")).length, 0);
});

test("V6 kaart renderdab portfelli, protsessikonteksti ja ühe soovituse", async () => {
  const map = structuredClone(prototypeScenarios[0].map);
  map.prototypeIdeas.reverse();
  const nodes = await render(map);
  const firstCard = nodes.find((node) => node.id === "prototype-list").children[0];

  assert.equal(nodes.filter((node) => node.className.split(" ").includes("prototype-card")).length, 3);
  assert.equal(nodes.filter((node) => node.className.split(" ").includes("prototype-card") && node.className.includes("recommended")).length, 1);
  assert.equal(nodes.filter((node) => node.className === "prototype-badge" && node.textContent === "Alusta siit").length, 1);
  assert.equal(descendants(firstCard).find((node) => node.tagName === "h3").textContent, "CRM-kontekstiga vastusevoog");
  assert.ok(nodes.some((node) => node.id === "process-context" && node.hidden === false));
  assert.ok(nodes.some((node) => node.className === "component-badge connector" && node.textContent === "Connector"));
});

test("V6 portfell peidab sama sammu vana V5 lahendusvõrdluse", async () => {
  const map = structuredClone(prototypeScenarios[0].map);
  map.steps[0].aiAssessment = assessment("connector_read");
  const nodes = await render(map);

  assert.equal(nodes.filter((node) => node.className.includes("solution-details")).length, 0);
  assert.equal(nodes.filter((node) => node.className.includes("prototype-card")).length >= 3, true);
});

test("viis stsenaariumifikstuuri vastavad portfelli turva- ja struktuurilepingule", () => {
  assert.equal(prototypeScenarios.length, 5);
  for (const { id, map } of prototypeScenarios) assertPortfolioContract(id, map);
});

test("stsenaariumid katavad hübriidi, mitme süsteemi ja ümberkujunduse", () => {
  const byId = new Map(prototypeScenarios.map((scenario) => [scenario.id, scenario.map]));
  const customer = byId.get("customer-inquiry").prototypeIdeas[0];
  const invoice = byId.get("supplier-invoice").prototypeIdeas[0];
  const report = byId.get("monthly-report").prototypeIdeas[0];
  const onboarding = byId.get("employee-onboarding").prototypeIdeas[0];
  const service = byId.get("service-redesign").prototypeIdeas[0];

  assert.deepEqual(customer.components.filter((component) => component.kind === "connector").map((component) => component.capability), ["read","write"]);
  assert.ok(invoice.components.some((component) => component.kind === "ai") && invoice.components.some((component) => component.kind === "deterministic"));
  assert.ok(report.components.some((component) => component.kind === "deterministic" && /valemid|Python/.test(component.technology)));
  assert.ok(new Set(onboarding.components.filter((component) => component.kind === "connector").map((component) => component.system)).size >= 3);
  assert.equal(service.type, "protsessi_umberkujundus");
});

test("valitud prototüübi kasu ja esimene ehitus kuvatakse idee juures", async () => {
  const map = structuredClone(prototypeScenarios[2].map);
  map.prototypeIdeas[0].benefitHypothesis = { primaryBenefit:{ category:"aeg_toomaht", label:"Aja kokkuhoid" }, userRationale:"Raport valmib kiiremini.", measurement:{ metric:"Minutid aruande kohta", baseline:"Mõõta esimeses väikeses katses", target:"Vähem käsitööd", sample:"3 kuuaruannet", method:"Võrdlus senise tööga" } };
  map.prototypeIdeas[0].prototypePlan = { hypothesis:"Kas arvutused ja narratiiv töötavad koos?", scope:"Üks näidisaruanne", testData:"Anonüümitud kuunäitajad", firstBuild:"Valemite ja AI-kommentaari prototüüp", humanCheck:"Analüütik võrdleb arvud algallikaga.", successMetric:"Kõik arvud õiged ja kommentaar kasutatav.", stopCondition:"Arvud muutuvad või allikat pole võimalik kontrollida.", ownerQuestion:"Kas näidisandmete kasutamine on lubatud?" };
  const nodes = await render(map);

  assert.equal(nodes.filter((node) => node.className === "prototype-plan").length, 1);
  assert.ok(nodes.some((node) => node.textContent === "Valemite ja AI-kommentaari prototüüp"));
  assert.ok(nodes.some((node) => node.textContent === "Aja kokkuhoid"));
});

function detailedMap() {
  const map = structuredClone(prototypeScenarios[2].map);
  map.prototypeIdeas[0].prototypePlan = { hypothesis:"Kas arvutused ja narratiiv töötavad koos?", scope:"Üks näidisaruanne", testData:"Anonüümitud kuunäitajad", firstBuild:"Valemite ja AI-kommentaari prototüüp", humanCheck:"Analüütik võrdleb arvud algallikaga.", successMetric:"Kõik arvud õiged.", stopCondition:"Allikat pole võimalik kontrollida.", ownerQuestion:"Kas näidisandmete kasutamine on lubatud?" };
  return map;
}

const byId = (nodes, id) => nodes.find((node) => node.id === id);

test("tööriistad ja piirangud kuvatakse protsessikontekstis ainult siis, kui need on olemas", async () => {
  const map = structuredClone(prototypeScenarios[0].map);
  const without = await render(map);
  map.processContext.tools = ["Excel", "Outlook"];
  map.processContext.toolLimits = "Ainult ettevõtte heakskiidetud AI.";
  const withTools = await render(map);

  assert.equal(without.some((node) => node.textContent === "TÖÖRIISTAD KÄE ALL"), false);
  assert.ok(withTools.some((node) => node.tagName === "dt" && node.textContent === "TÖÖRIISTAD KÄE ALL"));
  assert.ok(withTools.some((node) => node.tagName === "dd" && node.textContent === "Excel · Outlook"));
  assert.ok(withTools.some((node) => node.tagName === "dd" && node.textContent === "Ainult ettevõtte heakskiidetud AI."));
});

test("Mis edasi paneel pakub valmis prototüübi korral ehitamise lause koos faili täisteega", async () => {
  const nodes = await render(detailedMap(), { location: { protocol: "file:", pathname: "/Users/mari/Minu%20kaart.html" } });

  assert.equal(byId(nodes, "next-step").hidden, false);
  assert.equal(byId(nodes, "next-step-heading").textContent, "Alusta oma esimest ehitust");
  assert.equal(byId(nodes, "next-step-command").textContent, 'Ehita selle kaardi põhjal esimene prototüüp: "/Users/mari/Minu kaart.html"');
  assert.notEqual(byId(nodes, "next-step-hint").hidden, false);
});

test("Mis edasi paneel palub ilma prototüübiplaanita kaarti enne detailiseerida", async () => {
  const nodes = await render(structuredClone(prototypeScenarios[0].map), { location: { protocol: "file:", pathname: "/C:/Users/Mari/kaart%20v1.html" } });

  assert.equal(byId(nodes, "next-step-heading").textContent, "Detailiseeri enne valitud prototüüp");
  assert.equal(byId(nodes, "next-step-command").textContent, 'Jätka selle tööprotsessi kaardiga ja detailiseeri valitud prototüüp: "C:/Users/Mari/kaart v1.html"');
});

test("Mis edasi paneel kasutab kohahoidjat ja vihjet, kui faili teed ei tea, ning jääb V5 kaardilt peitu", async () => {
  const noPath = await render(detailedMap());
  const v5 = await render({ schemaVersion: 5, title: "Vana", steps: [{ number: 1, action: "Tee", aiAssessment: assessment("connector_read") }] });

  assert.match(byId(noPath, "next-step-command").textContent, /<selle kaardi täistee>/);
  assert.equal(byId(noPath, "next-step-hint").hidden, false);
  assert.notEqual(byId(v5, "next-step").hidden, false);
});

test("Kopeeri nupp kirjutab lause lõikelauale ja annab vihje, kui lõikelauda pole", async () => {
  const nodes = await render(detailedMap(), { location: { protocol: "file:", pathname: "/Users/mari/kaart.html" } });
  const button = byId(nodes, "next-step-copy");
  const sentence = byId(nodes, "next-step-command").textContent;
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const written = [];
  try {
    Object.defineProperty(globalThis, "navigator", { value: { clipboard: { writeText: async (text) => { written.push(text); } } }, configurable: true, writable: true });
    button.listeners.click();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(written, [sentence]);
    assert.equal(button.textContent, "Kopeeritud");

    Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true, writable: true });
    button.listeners.click();
    assert.equal(button.textContent, "Märgi tekst ja kopeeri käsitsi");
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else delete globalThis.navigator;
  }
});
