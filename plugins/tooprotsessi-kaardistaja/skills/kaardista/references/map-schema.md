# V6 HTML-kaardi andmeleping

Loe seda viidet ainult uue kaardi koostamisel, vana kaardi V6 vormingusse viimisel või olemasoleva kaardi kirjutamisel.

## Põhiobjekt

```json
{
  "schemaVersion": 6,
  "title": "Tööolukorra nimi",
  "createdAt": "2026-09-09T12:00:00+03:00",
  "updatedAt": "2026-09-09T12:00:00+03:00",
  "notice": "Kaart põhineb kasutaja kirjeldusel; inimene kontrollib tulemust.",
  "processContext": {
    "goal": "Miks seda tööd tehakse",
    "trigger": "Mis käivitab ühe juhtumi",
    "outcome": "Milline nähtav tulemus lõpetab juhtumi",
    "frequency": "Sagedus või maht, või Täpsustada",
    "painPoints": ["Ootamine, viga, ümbertöö või käsitsi kopeerimine"],
    "systems": ["Ainult kasutaja nimetatud süsteem või võimekus (täpsustada)"],
    "dataConstraints": "Tundlikkus, säilitamine või ettevõtte reegel; teadmata juhul Täpsustada"
  },
  "recommendedPrototypeId": "P1",
  "prototypeIdeas": [],
  "steps": []
}
```

`prototypeIdeas` sisaldab 3–5 kirjet ning täpselt ühe kirje `id` võrdub `recommendedPrototypeId` väärtusega. Selle kirje `priorityAssessment.status` on `alusta_siist`; ühegi teise kirje staatus ei ole `alusta_siist`.

## Prototüübiidee

```json
{
  "id": "P1",
  "title": "Lühike ehitatava idee nimi",
  "type": "sammude_uhendus",
  "summary": "Mida uus lahendus inimese jaoks muudab.",
  "stepNumbers": [2, 3, 4],
  "currentProblem": "Praegune konkreetne raiskamine, viga või piirang.",
  "futureFlow": "Käivitaja → lugemine → AI tõlgendus → reeglikontroll → inimese kinnitus → write-tegevus",
  "trigger": "Sündmus, mis käivitab prototüübi ühe juhtumi.",
  "outcome": "Nähtav lõpetatud tulemus.",
  "components": [{
    "kind": "connector",
    "role": "Loeb kliendi tausta.",
    "system": "CRM",
    "capability": "read",
    "technology": "Kasutaja nimetatud connector või Täpsustada",
    "access": "Vajalik minimaalne lugemisõigus"
  }, {
    "kind": "ai",
    "role": "Tõlgendab vabateksti ja koostab mustandi.",
    "system": "AI-teenus (täpsustada)",
    "capability": "none",
    "technology": "Keelemudel",
    "access": "Ainult lubatud sisendandmed"
  }, {
    "kind": "deterministic",
    "role": "Kontrollib kohustuslikke välju ja kindlaid ärireegleid.",
    "system": "Töövoog või skript (täpsustada)",
    "capability": "none",
    "technology": "Apps Script, Python, valem või reeglimootor vastavalt teadaolevale keskkonnale",
    "access": "Ainult tööks vajalikud andmed"
  }, {
    "kind": "human",
    "role": "Kontrollib sisu ja kinnitab tegevuse.",
    "system": "Inimese töövaade",
    "capability": "approve",
    "technology": "Olemasolev kasutajaliides või Täpsustada",
    "access": "Kasutaja tavapärane tööõigus"
  }],
  "humanControl": "Kus ja mida inimene enne kasutamist või write-tegevust kinnitab.",
  "exceptionPath": "Kuhu liigub puudulik, vastuoluline või ebakindel juhtum.",
  "conditions": "Õigused, nõusolekud, reeglid ja muud teostatavuse eeldused.",
  "priorityAssessment": {
    "value": "korge",
    "feasibility": "keskmine",
    "risk": "madal",
    "learningValue": "korge",
    "status": "alusta_siist",
    "rationale": "Miks see on või ei ole hea esimene prototüüp."
  },
  "benefitHypothesis": null,
  "prototypePlan": null
}
```

`type` on `sammu_parendus`, `sammude_uhendus` või `protsessi_umberkujundus`. Komponendi `kind` on `ai`, `deterministic`, `connector` või `human`. `capability` on `none`, `read`, `write` või `approve`; connector kasutab ainult `read` või `write`. Igal connector-komponendil on nimetatud süsteem, roll ja minimaalne `access`. Iga `write` komponendiga prototüübil peavad olema sisulised `humanControl` ning `exceptionPath`.

`priorityAssessment.value`, `feasibility`, `risk` ja `learningValue` on `korge`, `keskmine` või `madal`. `status` on `alusta_siist`, `jargmine` või `hiljem`. Ära arvuta nende põhjal näilist täpset punktisummat.

## Detailiseeritud prototüüp

Valitud prototüübi `benefitHypothesis`:

```json
{
  "primaryBenefit": {
    "category": "aeg_toomaht",
    "label": "Aja- või töömahu kokkuhoid"
  },
  "secondaryBenefit": null,
  "userRationale": "Kasutaja kinnitatud põhjus.",
  "measurement": {
    "metric": "Mida võrreldakse",
    "baseline": "Praegune lähtepunkt või Mõõta esimeses väikeses katses",
    "target": "Kasutajaga kinnitatud realistlik siht",
    "sample": "Võrreldav valim või ajavahemik",
    "method": "Kuidas inimene tulemust kontrollib"
  }
}
```

`primaryBenefit.category` on `kvaliteet`, `aeg_toomaht`, `kulud`, `risk_umbertoe`, `teenus` või kasutaja sõnastatud `muu`. Ära leiuta numbrilist lähtepunkti ega rahalist väärtust.

Valitud prototüübi `prototypePlan`:

```json
{
  "hypothesis": "Millist suurimat ebakindlust esimene ehitus kontrollib.",
  "scope": "Mis on esimeses prototüübis sees ja mis jääb välja.",
  "testData": "Lubatud näidisandmed või kontrollitud testkeskkond.",
  "firstBuild": "Konkreetne väikseim ehitatav lahendus.",
  "humanCheck": "Kuidas inimene kontrollib väljundit või kinnitab tegevuse.",
  "successMetric": "Milline mõõdetav tulemus toetab jätkamist.",
  "stopCondition": "Millise tulemuse või riski korral katse peatatakse.",
  "ownerQuestion": "Üks vajalik küsimus IT-le, juhile või protsessi omanikule."
}
```

## Samm

Uue V6 kaardi samm on kompaktne:

```json
{
  "number": 1,
  "action": "Tegevus",
  "actorSystem": "Tegija või süsteem",
  "inputSource": "Sisend ja konkreetne allikas",
  "informationOutput": "Väljund",
  "category": "info otsimine",
  "aiAssessment": {
    "suitability": "lugemine",
    "title": "Lühike võimaluse või piirangu nimetus",
    "summary": "Ühe-kahe lausega esmahinnang.",
    "accessNeed": "Vajalik lugemis- või tegevusõigus või käsitsi antud näidissisend.",
    "humanCheck": "Kuidas inimene kontrollib või otsustab."
  },
  "benefitHypothesis": null,
  "qualityAssessment": null,
  "experiment": null
}
```

Kategooria on `inimese otsus`, `info otsimine`, `sisuloome`, `andmeanalüüs`, `koordineerimine`, `andmete sisestamine` või `kontroll`. `suitability` on `kohe`, `lugemine`, `tegevusoigus` või `ei_sobi`.

## Vanemate kaartide säilitamine

- 0.1/V1: seo `opportunities` vastavate sammude `aiAssessment` väljaks ning ülemised `qualityAssessment` ja `experiment` valitud sammu alla.
- V2: säilita sammupõhised esmahinnangud ja detailid.
- V3: säilita `processChangeIdeas` ja hinnatud lähenemised.
- V4: säilita `benefitHypothesis`.
- V5: säilita `recommendedApproach` ja `implementationOptions` JSON-is.
- V6 portfelli loomisel ära tuleta tundmatuid eesmärke, süsteeme, õigusi ega mõõdikuid vanadest väljadest. Küsi puuduvaid olulisi asjaolusid või kasuta `Täpsustada`.
- Kui V6 `prototypeIdeas` on olemas, kuvab mall portfelli ja peidab korduva V5 lahendusvõrdluse sammude juures. Vanad väljad jäävad faili alles.
