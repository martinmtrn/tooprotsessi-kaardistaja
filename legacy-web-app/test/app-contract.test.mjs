import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const between = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));

test("loomulik kinnitus viib kohe analüüsi, ilma korduva kinnitusküsimuseta", async () => {
  const app = await read("public/app.js");
  assert.match(app, /function isJourneyApproval/);
  assert.match(app, /liigume edasi/);
  assert.match(app, /kõik sobib/);
  assert.match(app, /await confirmJourney\(\{ alreadyShown: true \}\)/);
  assert.match(app, /if \(!alreadyShown\) message\("user", "Kinnitan tööteekonna/);
});

test("pika tööteekonna analüüs kontrollib AI-võimaluste loendit ja kasutab varuvarianti", async () => {
  const server = await read("server.mjs");
  assert.match(server, /max_tokens: 3200/);
  assert.match(server, /function normalizeOpportunities/);
  assert.match(server, /function isUsableOpportunity/);
  assert.match(server, /async function askForValidatedAnswer/);
  assert.match(server, /VORMINGU PARANDUS/);
  assert.match(server, /function fallbackOpportunities/);
  assert.match(server, /opportunities\.length >= 2/);
});

test("sisuloome kvaliteedivestlus küsib malli või heade näidete kohta", async () => {
  const [server, app] = await Promise.all([read("server.mjs"), read("public/app.js")]);
  assert.match(server, /templateReadiness/);
  assert.match(server, /Kas selle sisu jaoks on olemas mall, kindel struktuur või paar head varasemat näidet/);
  assert.match(app, /Mall või head näited/);
  assert.match(app, /templateReadiness/);
});

test("eksporditud kvaliteedihinnang nimetab hinnatud AI-võimaluse ja seotud sammu", async () => {
  const app = await read("public/app.js");
  const markdownExport = between(app, "function mapAsMarkdown", "function downloadMap");
  assert.match(markdownExport, /Hinnatud AI-võimalus/);
  assert.match(markdownExport, /Seotud tööteekonna samm/);
  assert.match(markdownExport, /state\.selectedOpportunity/);
});

test("kvaliteedivestlus ei kuva eraldi näidissisendi kasti", async () => {
  const [server, app, css] = await Promise.all([read("server.mjs"), read("public/app.js"), read("public/styles.css")]);
  const markdownExport = between(app, "function mapAsMarkdown", "function downloadMap");
  assert.doesNotMatch(app, /temporarySample|temporary-sample|submitTemporarySample|renderSampleOption/);
  assert.doesNotMatch(server, /AJUTINE ANONÜÜMNE NÄIDISSISEND|temporarySample/);
  assert.doesNotMatch(css, /sample-card/);
  assert.doesNotMatch(markdownExport, /temporarySample|temporary-sample/);
});

test("töölaual kerib vestlus eraldi ning külgribad jäävad nähtavale", async () => {
  const css = await read("public/styles.css");
  assert.match(css, /\.workspace \{[^}]*height: calc\(100vh - 93px\)[^}]*overflow: hidden/);
  assert.match(css, /\.chat-log \{[^}]*overflow-y: auto/);
  assert.match(css, /\.journey-panel, \.insight-panel \{[^}]*overflow-y: auto/);
  assert.match(css, /@media \(max-width: 780px\) and \(min-width: 621px\)/);
});
