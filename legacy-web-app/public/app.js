const state = {
  title: "",
  history: [],
  latest: null,
  steps: [],
  opportunities: [],
  qualityAssessment: null,
  experiment: null,
  confirmed: false,
  selectedOpportunity: null,
  localMode: true,
  pending: false
};

const $ = (selector) => document.querySelector(selector);
const welcome = $("#welcome");
const workspace = $("#workspace");
const startForm = $("#start-form");
const messageForm = $("#message-form");
const messageInput = $("#message-input");
const chatLog = $("#chat-log");
const actionArea = $("#action-area");
const insightPanel = $("#insight-panel");

function emptyQualityAssessment() {
  return {
    status: "",
    expectedOutput: "",
    truthThreshold: "",
    inputReadiness: "",
    templateReadiness: "",
    verificationMethod: "",
    errorImpact: "",
    rationale: "",
    safeAiRole: "",
    inputImprovements: ""
  };
}

function updateModeNote() {
  const note = $("#data-note");
  const sessionNote = $("#session-note");
  if (state.localMode) {
    note.textContent = "Kohalik režiim kasutab juhitud kaardistamist sinu seadmes. Teksti ei saadeta võrku ega API-sse.";
    sessionNote.innerHTML = "<span></span> Täiesti kohalik režiim";
  } else {
    note.textContent = "Tekst saadetakse ainult Anthropicu API-le vestluse jooksul. Rakendus ei hoia sinu seanssi ega kaarti pärast lehe sulgemist.";
    sessionNote.innerHTML = "<span></span> Seanssi ei salvestata";
  }
}

function sourceText() {
  const opening = state.history[0]?.content || "";
  const start = opening.indexOf("Siin on minu töö kirjeldus või transkript:\n");
  if (start < 0) return opening;
  return opening.slice(start + "Siin on minu töö kirjeldus või transkript:\n".length).split("\n\nAita mul")[0];
}

function categoryFor(text) {
  const value = text.toLowerCase();
  if (/otsusta|kinnita|vali|heaks kiida/.test(value)) return "inimese otsus";
  if (/otsi|loe|vaata|kontrolli|uuri/.test(value)) return "info otsimine";
  if (/kirjuta|saada|vasta|koosta|sõnasta/.test(value)) return "sisuloome";
  if (/sisesta|salvesta|uuenda|muuda/.test(value)) return "andmete sisestamine";
  if (/küsi|edasta|anna edasi|oota|kooskõlasta/.test(value)) return "koordineerimine";
  if (/analüüsi|arvuta|võrdle/.test(value)) return "andmeanalüüs";
  return "tööetapp";
}

function actorFor(text) {
  const value = text.toLowerCase();
  if (/crm/.test(value)) return "Mina, CRM";
  if (/e-kiri|email|outlook|postkast/.test(value)) return "Mina, e-post";
  if (/excel|tabel|arvutustabel/.test(value)) return "Mina, tabel";
  if (/kolleeg|juht|tiim|spetsialist/.test(value)) return "Mina, kolleeg";
  if (/klient/.test(value)) return "Mina, klient";
  return "Mina";
}

function sourceFor(text) {
  const value = text.toLowerCase();
  if (/^käivitaja/.test(value)) return "Käivitav teade või sündmus — täpsusta selle päritolu";
  if (/crm/.test(value)) return "CRM-i kliendikaart või varasem suhtlus";
  if (/e-kiri|email|outlook|postkast/.test(value)) return "Kliendi või kolleegi e-kiri";
  if (/veeb|koduleht/.test(value)) return "Avalik veeb või ettevõtte koduleht";
  if (/varasem|mall|näidis/.test(value)) return "Varasemad kavad, näidised või mallid";
  if (/kolleeg|juht|tiim|spetsialist/.test(value)) return "Kolleegilt või juhilt saadud info";
  if (/excel|tabel|arvutustabel/.test(value)) return "Exceli või muu tabeli andmed";
  return "Täpsusta: millist infot selles sammus vajad ja kust see tuleb?";
}

function localSteps() {
  const sentences = sourceText()
    .split(/(?<=[.!?])\s+|[;\n]+/)
    .map((piece) => piece.replace(/^[-–•\s]+/, "").trim())
    .filter((piece) => piece.length > 8);
  const pieces = sentences.flatMap((sentence) => {
    const triggeredBy = sentence.match(/^Kui\s+(.+?),\s+(.+)/i);
    if (!triggeredBy) return [sentence];
    return [`Käivitaja: ${triggeredBy[1]}.`, triggeredBy[2]];
  });
  const steps = pieces.slice(0, 12).map((action, index) => ({
    number: index + 1,
    action,
    actorSystem: actorFor(action),
    inputSource: sourceFor(action),
    informationOutput: "Tulemus liigub järgmisse sammu",
    category: categoryFor(action)
  }));
  const answers = state.history.slice(1)
    .filter((item) => item.role === "user" && !/TÖÖTEE ON KINNITATUD|VALIN SELLE VÕIMALUSE/.test(item.content))
    .map((item) => item.content.trim())
    .filter((item) => item.length > 2);
  const stepsNeedingSource = steps.filter((step) => isUnresolvedSource(step.inputSource));
  answers.forEach((answer, index) => {
    if (stepsNeedingSource[index]) stepsNeedingSource[index].inputSource = answer;
  });
  return steps;
}

function isUnresolvedSource(source = "") {
  return source.startsWith("Täpsusta:") || source.startsWith("Käivitav teade");
}

function needsSource(step) {
  return isUnresolvedSource(step.inputSource);
}

function localOpportunities(steps = state.steps) {
  const categoryCandidates = {
    "info otsimine": {
      title: "Olulise info leidmine ja kokkuvõte",
      description: "AI saab sellest konkreetsest sammust välja tuua vajalikud faktid, puuduva info ja kontrollküsimused."
    },
    sisuloome: {
      title: "Esimese mustandi loomine",
      description: "AI saab koostada selle sammu jaoks esimese vastuse või teksti mustandi; inimene parandab ja kinnitab selle."
    },
    "andmete sisestamine": {
      title: "Andmete vormistamine ja esmane kontroll",
      description: "AI saab aidata andmed enne sisestamist ühtlasesse vormi panna ning puuduvad väljad nähtavaks teha."
    },
    koordineerimine: {
      title: "Üleandmise või järgmise tegevuse kokkuvõte",
      description: "AI saab sõnastada, mis tuleb kolleegile edasi anda ja milline tegevus järgmisena ootab."
    },
    andmeanalüüs: {
      title: "Võrdluse või analüüsi ettevalmistus",
      description: "AI saab aidata sõnastada, mida andmetest võrrelda, milliseid kõrvalekaldeid otsida ja kuidas tulemust kontrollida."
    }
  };
  const usedCategories = new Set();
  const opportunities = steps.flatMap((step) => {
    if (step.category === "inimese otsus") {
      return [{
        step: step.number,
        suitability: "ei_sobi",
        title: "Lõplik otsus või kinnitus",
        description: `Samm „${step.action}” vajab vastutava inimese otsust. AI võib anda tausta, kuid ei peaks seda otsust tegema.`,
        accessNeed: "Ligipääs ei muuda vastutust ega otsustusõigust.",
        humanCheck: "Otsuse teeb ja kinnitab vastutav inimene."
      }];
    }
    const candidate = categoryCandidates[step.category];
    if (!candidate || usedCategories.has(step.category)) return [];
    usedCategories.add(step.category);
    const needsReading = /CRM|süsteem|SharePoint|sisekesk/.test(step.inputSource || "");
    return [{
      step: step.number,
      suitability: needsReading ? "lugemine" : "kohe",
      title: candidate.title,
      description: `Samm „${step.action}” kasutab sisendit „${step.inputSource}”. ${candidate.description}`,
      accessNeed: needsReading
        ? `Lugemisligipääs: ${step.inputSource}. Alternatiivina annab inimene vajaliku väljavõtte käsitsi.`
        : "Ligipääsu ei vaja — inimene annab vajaliku näidissisendi käsitsi.",
      humanCheck: "Võrdle tulemust algallikaga enne selle kasutamist."
    }];
  });
  return opportunities.length ? opportunities : [{
    step: 1,
    suitability: "kohe",
    title: "Tööteekonna kokkuvõtte kontroll",
    description: "AI saab aidata kirjeldusest välja tuua, mis info või tegevus on enne järgmist sammu puudu.",
    accessNeed: "Ligipääsu ei vaja — inimene annab näidissisendi käsitsi.",
    humanCheck: "Inimene kontrollib, et kokkuvõte vastab päris tööolukorrale."
  }];
}

function localAssistant() {
  const lastUser = state.history.filter((item) => item.role === "user").at(-1)?.content || "";
  if (/TÖÖTEE ON KINNITATUD/.test(lastUser)) {
    const steps = state.steps.length ? state.steps : localSteps();
    return {
      kind: "analysis",
      message: "Analüüsisin iga tööteekonna sammu eraldi. Paremal näed ainult nende sammude põhjal tuvastatud kandidaate; ligipääsuvajadus ei tähenda olemasolevat õigust.",
      question: "",
      steps,
      opportunities: localOpportunities(steps),
      qualityAssessment: emptyQualityAssessment(),
      experiment: { title: "", goal: "", firstStep: "", neededInput: "", humanCheck: "", itQuestion: "" }
    };
  }
  if (/VALIN SELLE VÕIMALUSE:/.test(lastUser)) {
    const selection = lastUser.match(/VALIN SELLE VÕIMALUSE:\s*([^\.\n]+)/)?.[1] || "Valitud AI-katse";
    return {
      kind: "experiment",
      message: "Hea valik. Sõnastasin sellest väikese katse, mille saad teha ilma süsteeme ühendamata.",
      question: "",
      steps: state.steps.length ? state.steps : localSteps(),
      opportunities: [],
      qualityAssessment: emptyQualityAssessment(),
      experiment: {
        title: selection,
        goal: "Kontrollida, kas see samm säästab aega või teeb järgmise tegevuse selgemaks.",
        firstStep: "Vali üks hiljutine, mittetundlik näidisjuhtum ja kleebi vajalik tekst AI-vestlusesse.",
        neededInput: "Üks näidissisend ning lühike kirjeldus, millist tulemust ootad.",
        humanCheck: "Võrdle AI väljundit algallikaga ja otsusta ise, kas see on kasutuskõlblik.",
        itQuestion: "Kui katse toimib, kas selleks sammuks oleks tulevikus vaja lugemisligipääsu mõnele infosüsteemile?"
      }
    };
  }
  const steps = localSteps();
  const sourceAnswers = state.history.slice(1)
    .filter((item) => item.role === "user" && !/TÖÖTEE ON KINNITATUD|VALIN SELLE VÕIMALUSE/.test(item.content));
  const stepNeedingSource = steps.find(needsSource);
  const sourcesReady = !stepNeedingSource;
  return {
    kind: "interview",
    message: sourcesReady
      ? "Tööteekonna olulistel sammudel on nüüd sisend ja allikas nähtaval. Vaata kaart üle; kui see kirjeldab sinu tööd piisavalt hästi, saad selle kinnitada."
      : sourceAnswers.length
        ? "Lisasin sinu vastuse sisendiallikana kaardile. Küsin järgmisena ainult ühe veel ebaselge sammu kohta."
        : "Panin sinu kirjelduse põhjal esialgse tööteekonna kaardile. Alustame kõige olulisemast allikast.",
    question: sourcesReady
      ? "Kas kaart vastab töö tegelikule käigule? Kui jah, kinnita tööteekond ja vaatame AI-võimalusi."
      : `Samm ${stepNeedingSource.number}: „${stepNeedingSource.action}” — millist infot selles vajad ja kust see konkreetselt tuleb? Näiteks kliendilt, kolleegilt, failist, infosüsteemist või veebist.`,
    steps,
    opportunities: [],
    qualityAssessment: emptyQualityAssessment(),
    experiment: { title: "", goal: "", firstStep: "", neededInput: "", humanCheck: "", itQuestion: "" }
  };
}

function message(role, content) {
  const template = $(role === "assistant" ? "#assistant-message-template" : "#user-message-template");
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector(".bubble").textContent = content;
  chatLog.append(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  return node;
}

function setPending(pending) {
  state.pending = pending;
  $("#send-button").disabled = pending;
  messageInput.disabled = pending;
}

function renderSteps(steps = []) {
  const list = $("#steps-list");
  if (!steps.length) return;
  state.steps = steps;
  list.innerHTML = "";
  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step.action;
    const actor = document.createElement("span");
    actor.className = "actor";
    actor.textContent = `${step.actorSystem} · ${step.category}`;
    item.append(actor);
    const source = document.createElement("div");
    source.className = "source-readout";
    source.innerHTML = `<span>Sisend ja allikas</span>${escapeHtml(step.inputSource || "Täpsustamisel")}`;
    item.append(source);
    list.append(item);
  });
}

function suitabilityLabel(value) {
  return {
    kohe: ["Saab kohe proovida", ""],
    lugemine: ["Vajab lugemisligipääsu", "read"],
    tegevusoigus: ["Vajab tegevusõigust", "action"],
    ei_sobi: ["Ei ole praegu AI-kandidaat", "no"]
  }[value] || ["AI-võimalus", ""];
}

function renderOpportunities(opportunities = []) {
  if (!Array.isArray(opportunities)) opportunities = [];
  const list = $("#opportunities-list");
  if (!opportunities.length) {
    list.innerHTML = `<p class="muted">AI võimaluste kaart ei jõudnud selles vastuses õigel kujul. See ei ole hinnang sinu tööteekonna sobivusele.</p>`;
    return;
  }
  state.opportunities = opportunities;
  list.innerHTML = "";
  opportunities.forEach((opportunity) => {
    const [label, style] = suitabilityLabel(opportunity.suitability);
    const card = document.createElement("article");
    card.className = "opportunity";
    card.innerHTML = `<span class="badge ${style}">${label}</span><h3>${escapeHtml(opportunity.title)}</h3><p>${escapeHtml(opportunity.description)}</p><dl><dt>Ligipääsuvajadus</dt><dd>${escapeHtml(opportunity.accessNeed)}</dd><dt>Inimese kontroll</dt><dd>${escapeHtml(opportunity.humanCheck)}</dd></dl>`;
    list.append(card);
  });
  insightPanel.querySelector(".panel-heading h2").textContent = "Võimalused";
  insightPanel.querySelector(".status-text").textContent = "Ligipääsuvajadus ei tähenda olemasolevat õigust.";
}

function qualityStatusClass(status = "") {
  if (status === "Hea esimene AI-katse") return "ready";
  if (status === "Sobib kontrollitud abiks") return "checked";
  if (status === "Vajab paremat sisendit") return "improve";
  return "stop";
}

function qualityHistoryDetails(quality = emptyQualityAssessment()) {
  return [
    `Staatus: ${quality.status || "täpsustamisel"}`,
    `Oodatud väljund: ${quality.expectedOutput || "täpsustamisel"}`,
    `Vastusekindlus: ${quality.truthThreshold || "täpsustamisel"}`,
    `Sisendi valmisolek: ${quality.inputReadiness || "täpsustamisel"}`,
    `Malli või näidete olemasolu: ${quality.templateReadiness || "ei ole asjakohane või täpsustamisel"}`,
    `Kontrolliviis: ${quality.verificationMethod || "täpsustamisel"}`,
    `Vea mõju: ${quality.errorImpact || "täpsustamisel"}`
  ].join("\n");
}

function assistantHistoryContent(result) {
  const visible = result.message + (result.question ? `\n\n${result.question}` : "");
  if (!result.kind.startsWith("quality_")) return visible;
  return `${visible}\n\nKVALITEEDIHINNANGU SEIS (taustainfo):\n${qualityHistoryDetails(result.qualityAssessment)}`;
}

function renderQualityProgress(quality = emptyQualityAssessment()) {
  const list = $("#opportunities-list");
  const known = [
    ["Oodatud väljund", quality.expectedOutput],
    ["Vastusekindlus", quality.truthThreshold],
    ["Sisendi valmisolek", quality.inputReadiness],
    ["Mall või head näited", quality.templateReadiness],
    ["Kontrolliviis", quality.verificationMethod],
    ["Vea mõju", quality.errorImpact]
  ].filter(([, value]) => value);
  list.innerHTML = `<article class="quality-card progress-card"><p class="eyebrow">KVALITEEDI HINNANG</p><h3>Täpsustame valitud sammu</h3><p>AI hindab sobivust alles siis, kui sisend, oodatud tulemus ja kontrolliviis on läbi räägitud.</p>${known.length ? `<dl>${known.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>` : ""}</article>`;
  insightPanel.querySelector(".panel-heading h2").textContent = "Kvaliteedi hinnang";
  insightPanel.querySelector(".status-text").textContent = "Üks küsimus korraga · hinnang ei ole garantii.";
}

function renderQualityAssessment(quality) {
  state.qualityAssessment = quality;
  const list = $("#opportunities-list");
  list.innerHTML = `<article class="quality-card"><span class="quality-badge ${qualityStatusClass(quality.status)}">${escapeHtml(quality.status || "Hinnang valmis")}</span><h3>Sisendi ja väljundi kvaliteet</h3><p>${escapeHtml(quality.rationale)}</p><dl><dt>Oodatud väljund</dt><dd>${escapeHtml(quality.expectedOutput)}</dd><dt>Vastusekindlus</dt><dd>${escapeHtml(quality.truthThreshold)}</dd><dt>Sisendi valmisolek</dt><dd>${escapeHtml(quality.inputReadiness)}</dd>${quality.templateReadiness ? `<dt>Mall või head näited</dt><dd>${escapeHtml(quality.templateReadiness)}</dd>` : ""}<dt>Kontrolliviis</dt><dd>${escapeHtml(quality.verificationMethod)}</dd><dt>Vea mõju</dt><dd>${escapeHtml(quality.errorImpact)}</dd><dt>Turvaline AI roll</dt><dd>${escapeHtml(quality.safeAiRole)}</dd>${quality.inputImprovements ? `<dt>Sisendi järgmine parandus</dt><dd>${escapeHtml(quality.inputImprovements)}</dd>` : ""}</dl></article>`;
  insightPanel.querySelector(".panel-heading h2").textContent = "Kvaliteedi hinnang";
  insightPanel.querySelector(".status-text").textContent = "Põhineb sinu kirjeldusel, mitte ametlikul auditil.";
}

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function renderExperiment(experiment) {
  if (!experiment?.title) return;
  state.experiment = experiment;
  const list = $("#opportunities-list");
  list.innerHTML = `<article class="experiment-card"><p class="eyebrow">SINU JÄRGMINE KATSE</p><h3>${escapeHtml(experiment.title)}</h3><dl><dt>Eesmärk</dt><dd>${escapeHtml(experiment.goal)}</dd><dt>Esimene samm</dt><dd>${escapeHtml(experiment.firstStep)}</dd><dt>Vajalik sisend</dt><dd>${escapeHtml(experiment.neededInput)}</dd><dt>Inimese kontroll</dt><dd>${escapeHtml(experiment.humanCheck)}</dd><dt>Küsimus IT-le või juhile</dt><dd>${escapeHtml(experiment.itQuestion)}</dd></dl><div class="export-buttons"><button id="download-button">Laadi kaart alla</button><button id="copy-button">Kopeeri kaart</button></div></article>`;
  insightPanel.querySelector(".panel-heading h2").textContent = "Järgmine katse";
  insightPanel.querySelector(".status-text").textContent = "Alusta väikese käsitsi sisestatud näidisega.";
  $("#download-button").addEventListener("click", downloadMap);
  $("#copy-button").addEventListener("click", copyMap);
}

function renderQualityActions(quality) {
  const needsAlternative = ["Vajab paremat sisendit", "Ei sobi praegu selleks otsuseks"].includes(quality.status);
  if (!needsAlternative) {
    actionArea.innerHTML = `<div class="confirm-card"><strong>Kas teeme sellest väikese katse?</strong><p>Katse algab käsitsi sisestatud näidissisendiga ja inimese kontroll jääb alles.</p><button id="experiment-button" class="secondary-button">Koosta järgmise katse kaart →</button></div>`;
    $("#experiment-button").addEventListener("click", requestExperiment);
    return;
  }
  actionArea.innerHTML = `<div class="choice-card"><strong>Millise järgmise tee valid?</strong><p>Sa ei pea seda sammu praegu automatiseerima.</p><div class="choice-grid"><button id="improve-input" class="choice-button">Paranda sisendit ja hinda uuesti<span>AI aitab täpsustada, milline info, mall või kontrollreegel on puudu.</span></button><button id="choose-another" class="choice-button">Vali teine AI-võimalus<span>Naase võimaluste juurde ja alusta väiksema riskiga sammust.</span></button><button id="reduce-role" class="choice-button">Vähenda AI rolli<span>Kasuta AI-d näiteks mustandi, kokkuvõtte või kontrollküsimuste jaoks.</span></button></div></div>`;
  $("#improve-input").addEventListener("click", improveInput);
  $("#choose-another").addEventListener("click", chooseAnotherOpportunity);
  $("#reduce-role").addEventListener("click", reduceAiRole);
}

function askConfirmation() {
  actionArea.innerHTML = `<div class="confirm-card"><strong>Kas see tööteekond kirjeldab su tööolukorda piisavalt hästi?</strong><p>Sa ei pea seda täiuslikuks tegema. Kinnita siis, kui olulised sammud, inimesed ja süsteemid on nähtaval.</p><button id="confirm-button" class="secondary-button">Kinnita tööteekond ja vaata AI-võimalusi →</button></div>`;
  $("#confirm-button").addEventListener("click", confirmJourney);
}

function isJourneyApproval(content = "") {
  return /^(jah|sobib|kõik sobib|liigume edasi|edasi|kinnitan(?: tööteekonna)?)(?:[.! ,]|$)/i.test(content.trim());
}

function chooseOpportunity(opportunities) {
  const usable = (Array.isArray(opportunities) ? opportunities : []).filter((item) => item?.suitability !== "ei_sobi");
  if (!usable.length) {
    actionArea.innerHTML = `<div class="confirm-card"><strong>AI võimaluste kaart ei jõudnud lõpuni.</strong><p>See on vastuse vormistuse probleem, mitte hinnang sinu tööteekonnale.</p><button id="retry-analysis" class="secondary-button">Proovi analüüsi uuesti →</button></div>`;
    $("#retry-analysis").addEventListener("click", repeatAnalysis);
    return;
  }
  actionArea.innerHTML = `<div class="choice-card"><strong>Vali üks võimalus, millega alustada</strong><p>Soovitame valida väikese katse, mida saad esmalt proovida käsitsi sisestatud näidisega.</p><div class="choice-grid"></div></div>`;
  const grid = actionArea.querySelector(".choice-grid");
  usable.forEach((opportunity, index) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `${escapeHtml(opportunity.title)}<span>${escapeHtml(opportunity.description)}</span>`;
    button.addEventListener("click", () => selectOpportunity(opportunity, index));
    grid.append(button);
  });
}

async function repeatAnalysis() {
  if (state.pending) return;
  actionArea.innerHTML = "";
  state.history.push({ role: "user", content: "TÖÖTEE ON KINNITATUD. Koosta AI-võimaluste analüüs uuesti ning tagasta 2–4 konkreetset võimalust koos ligipääsuvajaduse ja inimese kontrollpunktiga." });
  message("user", "Proovi AI-võimaluste analüüsi uuesti.");
  await callAssistant();
}

async function callAssistant() {
  const typing = message("assistant", "Mõtlen tööteekonna järgmise vajaliku küsimuse üle…");
  typing.classList.add("typing");
  setPending(true);
  try {
    let result;
    if (state.localMode) {
      result = localAssistant();
    } else {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: state.history })
      });
      const responseText = await response.text();
      try { result = JSON.parse(responseText); }
      catch { throw new Error("AI-server ei vasta ootuspäraselt. Kontrolli, et käivitasid rakenduse käsuga npm start."); }
      if (!response.ok) throw new Error(result.error || "Päring ei õnnestunud.");
    }
    typing.remove();
    state.latest = result;
    if (result.kind.startsWith("quality_") && result.qualityAssessment) state.qualityAssessment = result.qualityAssessment;
    state.history.push({ role: "assistant", content: assistantHistoryContent(result) });
    message("assistant", result.message + (result.question ? `\n\n${result.question}` : ""));
    renderSteps(result.steps);
    if (result.kind === "interview") {
      $("#journey-status").textContent = "Täpsustame järgmisi samme";
      if (/kinnita|kinnit/i.test(`${result.message} ${result.question}`)) askConfirmation();
    }
    if (result.kind === "analysis") {
      $("#journey-status").textContent = "Tööteekond kinnitatud";
      renderOpportunities(result.opportunities);
      chooseOpportunity(result.opportunities);
    }
    if (result.kind === "quality_interview") {
      $("#journey-status").textContent = "Hindame sisendi ja väljundi kvaliteeti";
      renderQualityProgress(result.qualityAssessment);
      actionArea.innerHTML = "";
    }
    if (result.kind === "quality_assessment") {
      $("#journey-status").textContent = "Kvaliteedihinnang valmis";
      renderQualityAssessment(result.qualityAssessment);
      renderQualityActions(result.qualityAssessment);
    }
    if (result.kind === "experiment") {
      actionArea.innerHTML = "";
      $("#journey-status").textContent = "Kaart valmis";
      renderExperiment(result.experiment);
    }
  } catch (error) {
    typing.remove();
    message("assistant", `Praegu ei saanud ma jätkata: ${error.message} Kontrolli serveri seadistust või proovi uuesti.`);
  } finally {
    setPending(false);
    messageInput.focus();
  }
}

async function requestExperiment() {
  if (state.pending) return;
  actionArea.innerHTML = "";
  const quality = state.qualityAssessment || emptyQualityAssessment();
  const content = `KOOSTA KATSEKAART. Koosta valitud võimalusest üks väike realistlik järgmise katse kaart. Lähtu kvaliteedihinnangust: turvaline AI roll on „${quality.safeAiRole}” ja inimese kontroll on „${quality.verificationMethod}”. Katse peab algama käsitsi sisestatud näidissisendiga, mitte süsteemiühendusega.`;
  state.history.push({ role: "user", content });
  message("user", "Koosta selle põhjal järgmise katse kaart.");
  await callAssistant();
}

async function improveInput() {
  if (state.pending) return;
  actionArea.innerHTML = "";
  const content = "PARANDAN SISENDIT. Aita mul täpsustada üks kõige olulisem muudatus, mida saan sisendi, malli või kontrollreegli juures teha, ja hinda seejärel sobivust uuesti.";
  state.history.push({ role: "user", content });
  message("user", "Soovin sisendit parandada ja hinnangut uuendada.");
  await callAssistant();
}

function chooseAnotherOpportunity() {
  actionArea.innerHTML = "";
  $("#journey-status").textContent = "Vali teine AI-võimalus";
  renderOpportunities(state.opportunities);
  chooseOpportunity(state.opportunities);
}

async function reduceAiRole() {
  if (state.pending) return;
  actionArea.innerHTML = "";
  const content = "VÄHENDA AI ROLLI. Paku selle võimaluse jaoks väiksema riskiga assistiivne AI roll, näiteks mustand, kokkuvõte või kontrollküsimused, ning uuenda kvaliteedihinnangut.";
  state.history.push({ role: "user", content });
  message("user", "Vähendame AI rolli väiksema riskiga abiks.");
  await callAssistant();
}

async function confirmJourney({ alreadyShown = false } = {}) {
  if (state.pending) return;
  state.confirmed = true;
  actionArea.innerHTML = "";
  const sourceMap = state.steps.map((step) => `${step.number}. ${step.action}\nSisend ja allikas: ${step.inputSource || "Täpsustamata"}`).join("\n\n");
  const content = `TÖÖTEE ON KINNITATUD. Analüüsi nüüd kinnitatud samme. Märgi sammude kategooriad ning paku 2–4 AI-võimalust koos ligipääsuvajaduse ja inimese kontrollpunktiga. Ära eelda olemasolevaid õigusi.\n\nKinnitatud sammud koos sisendiallikatega:\n${sourceMap}`;
  state.history.push({ role: "user", content });
  if (!alreadyShown) message("user", "Kinnitan tööteekonna. Vaatame nüüd AI-võimalusi.");
  await callAssistant();
}

async function selectOpportunity(opportunity) {
  if (state.pending) return;
  state.selectedOpportunity = opportunity;
  actionArea.innerHTML = "";
  state.qualityAssessment = null;
  const content = `VALIN SELLE VÕIMALUSE: ${opportunity.title}. ${opportunity.description}\nAlusta enne katsekaarti sisendi ja oodatud väljundi kvaliteedi küsitlust. Küsi üks küsimus korraga.`;
  state.history.push({ role: "user", content });
  message("user", `Valin alustamiseks: ${opportunity.title}`);
  await callAssistant();
}

function mapAsMarkdown() {
  const steps = state.steps;
  const opportunities = state.opportunities;
  const quality = state.qualityAssessment;
  const experiment = state.experiment;
  const selected = state.selectedOpportunity;
  const selectedStep = steps.find((step) => step.number === selected?.step);
  const rows = steps.map((step) => `| ${step.number} | ${step.action} | ${step.actorSystem} | ${step.inputSource} | ${step.informationOutput} | ${step.category} |`).join("\n");
  const optionRows = opportunities.map((item) => `- **${item.title}** (${suitabilityLabel(item.suitability)[0]}): ${item.description}\n  - Ligipääsuvajadus: ${item.accessNeed}\n  - Inimese kontroll: ${item.humanCheck}`).join("\n");
  const qualitySubject = selected ? `\n\n**Hinnatud AI-võimalus:** ${selected.title}${selectedStep ? `\n\n**Seotud tööteekonna samm:** ${selectedStep.number}. ${selectedStep.action}` : ""}` : "";
  const qualitySection = quality?.status ? `\n\n## Kvaliteedi ja kontrolli hinnang${qualitySubject}\n\n- Staatus: ${quality.status}\n- Oodatud väljund: ${quality.expectedOutput}\n- Vastusekindlus: ${quality.truthThreshold}\n- Sisendi valmisolek: ${quality.inputReadiness}${quality.templateReadiness ? `\n- Mall või head näited: ${quality.templateReadiness}` : ""}\n- Kontrolliviis: ${quality.verificationMethod}\n- Vea mõju: ${quality.errorImpact}\n- Põhjendus: ${quality.rationale}\n- Turvaline AI roll: ${quality.safeAiRole}${quality.inputImprovements ? `\n- Sisendi järgmine parandus: ${quality.inputImprovements}` : ""}` : "";
  return `# Minu tööteekonna AI-kaart\n\n## Tööolukord\n${state.title}\n\n## Tööteekond\n| Samm | Mis juhtub? | Inimene / süsteem | Sisend ja allikas | Info või väljund | Kategooria |\n|---|---|---|---|---|---|\n${rows}\n\n## AI-võimalused\n${optionRows}${qualitySection}\n\n## Järgmine katse\n**${experiment?.title || ""}**\n\n- Eesmärk: ${experiment?.goal || ""}\n- Esimene samm: ${experiment?.firstStep || ""}\n- Vajalik sisend: ${experiment?.neededInput || ""}\n- Inimese kontroll: ${experiment?.humanCheck || ""}\n- Küsimus IT-le või juhile: ${experiment?.itQuestion || ""}\n`;
}

function downloadMap() {
  const blob = new Blob([mapAsMarkdown()], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.title.toLowerCase().replace(/[^a-z0-9õäöü-]+/gi, "-") || "tooteekond"}-ai-kaart.md`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function copyMap() {
  try {
    await navigator.clipboard.writeText(mapAsMarkdown());
    $("#copy-button").textContent = "Kopeeritud!";
  } catch { $("#copy-button").textContent = "Kopeerimine ei õnnestunud"; }
}

startForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.pending) return;
  const title = $("#journey-title").value.trim();
  const source = $("#source-text").value.trim();
  if (!source) { $("#source-text").focus(); return; }
  state.localMode = $("#local-only").checked || location.protocol === "file:";
  updateModeNote();
  state.title = title;
  $("#journey-name").textContent = title;
  welcome.classList.add("hidden");
  workspace.classList.remove("hidden");
  const opening = `Kaardistan tööolukorda: ${title}.\n\nSiin on minu töö kirjeldus või transkript:\n${source}\n\nAita mul kõigepealt tööteekond nähtavaks teha. Ära veel paku AI kasutamist.`;
  state.history.push({ role: "user", content: opening });
  message("user", `Kaardistan tööolukorda: ${title}`);
  await callAssistant();
});

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = messageInput.value.trim();
  if (!content || state.pending) return;
  if (!state.confirmed && state.steps.length && isJourneyApproval(content)) {
    actionArea.innerHTML = "";
    message("user", content);
    messageInput.value = "";
    await confirmJourney({ alreadyShown: true });
    return;
  }
  actionArea.innerHTML = "";
  state.history.push({ role: "user", content });
  message("user", content);
  messageInput.value = "";
  await callAssistant();
});

$("#file-upload").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 300_000) { alert("Tekstifail on liiga suur. Lisa kuni umbes 300 kB suurune väljavõte."); return; }
  $("#source-text").value = await file.text();
  document.querySelector(".file-picker").lastChild.textContent = ` ${file.name} lisatud`;
});

$("#local-only").addEventListener("change", (event) => {
  state.localMode = event.target.checked || location.protocol === "file:";
  updateModeNote();
});

updateModeNote();
$("#reset-button").addEventListener("click", () => window.location.reload());
