import { readFile } from "node:fs/promises";

// Minimal fake DOM so the template script can run under node:test.
const template = new URL("../../skills/kaardista/tooprotsessi-kaart.html", import.meta.url);

export async function source() {
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

  addEventListener(type, handler) {
    this.listeners = { ...this.listeners, [type]: handler };
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get childNodes() {
    return this.children;
  }
}

export async function render(data, globals = {}) {
  const html = await source();
  const scriptStart = html.lastIndexOf("<script>") + "<script>".length;
  const scriptEnd = html.lastIndexOf("</script>");
  const nodes = [];
  const byId = new Map();
  for (const id of ["map-data", "stamp", "map-title", "lede", "notice", "process-context", "process-context-grid", "next-step", "next-step-heading", "next-step-text", "next-step-command", "next-step-copy", "next-step-hint", "prototype-section", "prototype-count", "prototype-list", "step-count", "timeline"]) {
    const node = new TestNode("div");
    node.id = id;
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
  const originals = Object.keys(globals).map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  try {
    new Function(html.slice(scriptStart, scriptEnd))();
  } finally {
    globalThis.document = originalDocument;
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
  return nodes;
}
