import assert from "node:assert/strict";

// Structural and safety contract that every V6 portfolio (fixture or example map) must satisfy.
export function assertPortfolioContract(id, map) {
  assert.ok(map.prototypeIdeas.length >= 3 && map.prototypeIdeas.length <= 5, `${id}: ideede arv`);
  assert.equal(new Set(map.prototypeIdeas.map((idea) => idea.id)).size, map.prototypeIdeas.length, `${id}: unikaalsed ID-d`);
  assert.equal(map.prototypeIdeas.filter((idea) => idea.id === map.recommendedPrototypeId).length, 1, `${id}: soovitatud ID`);
  assert.equal(map.prototypeIdeas.filter((idea) => idea.priorityAssessment.status === "alusta_siist").length, 1, `${id}: üks Alusta siit`);
  assert.ok(map.prototypeIdeas.some((idea) => idea.components.some((component) => component.kind === "connector")), `${id}: integreeritud idee`);
  for (const idea of map.prototypeIdeas) {
    for (const component of idea.components.filter((item) => item.kind === "connector" && item.capability === "write")) {
      assert.ok(component.system && component.access, `${id}/${idea.id}: write süsteem ja õigus`);
      assert.ok(idea.humanControl && idea.exceptionPath, `${id}/${idea.id}: write kontroll ja eranditee`);
    }
  }
}
