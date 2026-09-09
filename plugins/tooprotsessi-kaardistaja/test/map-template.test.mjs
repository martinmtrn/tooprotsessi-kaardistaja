import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const template = new URL("../skills/kaardista/tooprotsessi-kaart.html", import.meta.url);

async function source() {
  return readFile(template, "utf8");
}

class TestNode {
  constructor(tagName, className = "", text = "") {
    this.tagName = tagName;
    this.className = className;
    this.textContent = text;
    this.children = [];
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    this.children.splice(this.children.indexOf(node), 1);
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get childNodes() {
    return this.children;
  }
}

async function render(data) {
  const html = await source();
  const scriptStart = html.lastIndexOf("<script>") + "<script>".length;
  const scriptEnd = html.lastIndexOf("</script>");
  const nodes = [];
  const byId = new Map();
  for (const id of ["map-data", "stamp", "map-title", "lede", "notice", "step-count", "timeline"]) {
    const node = new TestNode("div");
    nodes.push(node);
    byId.set(id, node);
  }
  byId.get("map-data").textContent = JSON.stringify(data);
  const originalDocument = globalThis.document;
  globalThis.document = {
    title: "",
    getElementById: (id) => byId.get(id),
    createElement: (tagName) => {
      const node = new TestNode(tagName);
      nodes.push(node);
      return node;
    },
    createTextNode: (text) => {
      const node = new TestNode("#text", "", String(text));
      nodes.push(node);
      return node;
    }
  };
  try {
    new Function(html.slice(scriptStart, scriptEnd))();
  } finally {
    globalThis.document = originalDocument;
  }
  return nodes;
}

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

test("V5 kaart määratleb neli võrreldavat lahendusteed", async () => {
  const html = await source();

  assert.match(html, /schemaVersion:5/);
  assert.match(html, /const implementationOrder = \["ai_chat", "connector_read", "connector_write", "deterministic"\]/);
  assert.match(html, /ai_chat:"AI-chat käsitsi"/);
  assert.match(html, /connector_read:"Connector: lugemisõigus"/);
  assert.match(html, /connector_write:"Connector: tegevusõigus"/);
  assert.match(html, /deterministic:"Deterministlik lahendus"/);
});

test("kuva normaliseerib soovituse üheseks ning hoiab V4 kaardi võrdluseta", async () => {
  const html = await source();

  assert.match(html, /if \(!Array\.isArray\(assessment\.implementationOptions\)\) return null/);
  assert.match(html, /if \(kind === recommended\) return \{ \.\.\.option, status:"soovitatud" \}/);
  assert.match(html, /option\.status === "soovitatud" \? \{ \.\.\.option, status:"voimalik" \} : option/);
  assert.match(html, /if \(implementations\) card\.append\(renderImplementationOptions\(assessment, implementations\)\)/);
});

test("lahendusvõrdlus näitab õiguseid, kontrolli ja deterministliku tee märgistust", async () => {
  const html = await source();

  assert.match(html, /AI asemel mõistlikum/);
  assert.match(html, /\[\["TÖÖVOOG",option\.flow\],\["ÕIGUSED JA EELDUSED",option\.requirements\],\["INIMESE KONTROLL",option\.humanCheck\],\["PRAKTILINE PIIRANG",option\.constraint\]\]/);
  assert.match(html, /option\.kind === "deterministic" && hasText\(option\.technology\)/);
  assert.match(html, /Soovitatud tee puudub/);
});

test("vestlusjuhis nõuab nelja tee hinnangut ja V4 ühilduvust", async () => {
  const skill = await readFile(new URL("../skills/kaardista/SKILL.md", import.meta.url), "utf8");

  assert.match(skill, /"schemaVersion": 5/);
  assert.match(skill, /täpselt neli kirjet/);
  assert.match(skill, /kui `suitability` on `lugemine`, tohib `connector_read` kirjeldada ainult lugemisõigust/);
  assert.match(skill, /V3- ja V4-kaart jäävad samuti loetavaks/);
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
