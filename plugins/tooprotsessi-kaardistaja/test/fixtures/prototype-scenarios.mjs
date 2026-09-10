const level = (status, rationale) => ({ value:"korge", feasibility:"keskmine", risk:"madal", learningValue:"korge", status, rationale });
const connector = (system, capability, role) => ({ kind:"connector", role, system, capability, technology:`${system} connector`, access:capability === "write" ? `Piiratud ${system} tegevusõigus` : `Minimaalne ${system} lugemisõigus` });
const ai = (role) => ({ kind:"ai", role, system:"AI-teenus (täpsustada)", capability:"none", technology:"Keelemudel", access:"Ainult lubatud sisendandmed" });
const rule = (role, technology="Reeglipõhine töövoog") => ({ kind:"deterministic", role, system:"Automaatika", capability:"none", technology, access:"Ainult tööks vajalikud andmed" });
const human = (role="Kontrollib tulemuse ja kinnitab tegevuse.") => ({ kind:"human", role, system:"Inimese töövaade", capability:"approve", technology:"Olemasolev kasutajaliides", access:"Kasutaja tavapärane tööõigus" });

function idea({ id, title, type="sammude_uhendus", flow, components, status, steps=[1,2,3] }) {
  return {
    id,
    title,
    type,
    summary:`${title} muudab mitu praegust tegevust üheks kontrollitavaks töövooks.`,
    stepNumbers:steps,
    currentProblem:"Info liigub käsitsi ja sama tööd kontrollitakse mitu korda.",
    futureFlow:flow,
    trigger:"Uus juhtum saabub.",
    outcome:"Kontrollitud tulemus on järgmises süsteemis valmis.",
    components,
    humanControl:"Inimene kontrollib väljundit enne välist vastust või süsteemi kirjutamist.",
    exceptionPath:"Puudulik või vastuoluline juhtum suunatakse inimesele ilma automaatse write-tegevuseta.",
    conditions:"Ligipääsud ja ettevõtte reeglid tuleb enne ühendamist kinnitada.",
    priorityAssessment:level(status, status === "alusta_siist" ? "Kontrollib suure väärtusega eeldust piiratud riskiga." : "Kasulik jätkuidee pärast esimese eelduse kontrollimist."),
    benefitHypothesis:null,
    prototypePlan:null
  };
}

function scenario({ id, title, systems, ideas }) {
  return {
    id,
    map:{
      schemaVersion:6,
      title,
      notice:"Teststsenaarium; inimene kontrollib tulemust.",
      processContext:{ goal:"Saada üks juhtum kiiremini ja väiksema ümbertööga valmis.", trigger:"Uus juhtum saabub.", outcome:"Juhtum on kontrollitult lõpetatud.", frequency:"Täpsustada", painPoints:["Käsitsi kopeerimine","Ootamine"], systems, dataConstraints:"Täpsustada ettevõtte reeglid." },
      recommendedPrototypeId:"P1",
      prototypeIdeas:ideas,
      steps:[1,2,3,4,5].map((number) => ({ number, action:`Testprotsessi tegevus ${number}`, actorSystem:number % 2 ? "Inimene" : systems[0], inputSource:"Eelmise sammu väljund", informationOutput:"Kontrollitav tulemus", category:"kontroll", aiAssessment:{ suitability:"lugemine", title:"Võimalus vajab konteksti", summary:"Sammu saab toetada ainult kontrollitud sisendiga.", accessNeed:"Täpsustada minimaalne lugemisõigus.", humanCheck:"Inimene kontrollib tulemuse." } }))
    }
  };
}

export const prototypeScenarios = [
  scenario({
    id:"customer-inquiry",
    title:"Kliendipäringust kontrollitud vastuseni",
    systems:["CRM","E-post"],
    ideas:[
      idea({ id:"P1", title:"CRM-kontekstiga vastusevoog", status:"alusta_siist", flow:"E-kiri → CRM read → AI mustand → inimese kinnitus → e-posti write", components:[connector("CRM","read","Loeb kliendi tausta."),ai("Koostab päringu ja CRM-i põhjal vastuse mustandi."),human(),connector("E-post","write","Salvestab kinnitatud vastuse mustandina või saadab selle.")] }),
      idea({ id:"P2", title:"Päringu käsitsi AI-katse", type:"sammu_parendus", status:"jargmine", flow:"Lubatud päring → AI mustand → inimese kontroll", components:[ai("Koostab vastuse mustandi."),human()] }),
      idea({ id:"P3", title:"Vastuse kohustuslike osade kontroll", type:"sammu_parendus", status:"hiljem", flow:"Vastuse mustand → reeglikontroll → puuduva info märge", components:[rule("Kontrollib kohustuslikke välju."),human()] })
    ]
  }),
  scenario({
    id:"supplier-invoice",
    title:"Ostuarve töötlemine",
    systems:["E-post","Raamatupidamissüsteem"],
    ideas:[
      idea({ id:"P1", title:"Arve väljavõte ja reeglikontroll", status:"alusta_siist", flow:"Arve → AI väljavõte → deterministlik kontroll → inimese kinnitus → raamatupidamissüsteemi write", components:[ai("Loeb arvelt väljad ja kõrvalekalded."),rule("Kontrollib summasid, kohustuslikke välju ja teadaolevaid reegleid.","Python või reeglimootor"),human(),connector("Raamatupidamissüsteem","write","Sisestab ainult kinnitatud arve andmed.")] }),
      idea({ id:"P2", title:"Arvete read-only võrdlus", status:"jargmine", flow:"Arve → süsteemi read → kõrvalekallete loend", components:[connector("Raamatupidamissüsteem","read","Loeb võrdluseks lubatud alusandmed."),rule("Võrdleb arvet alusandmetega."),human()] }),
      idea({ id:"P3", title:"Puuduliku arve tagasiside", type:"protsessi_umberkujundus", status:"hiljem", flow:"Arve saabumine → automaatne täielikkuse kontroll → puuduste tagasiside", components:[rule("Kontrollib kohustuslike väljade olemasolu."),human()] })
    ]
  }),
  scenario({
    id:"monthly-report",
    title:"Kuuaruande koostamine",
    systems:["Google Sheets","Esitlus"],
    ideas:[
      idea({ id:"P1", title:"Kontrollitud kuuaruande koostaja", status:"alusta_siist", flow:"Sheets read → valemid/Python → AI selgitus → inimese kinnitus → esitlus write", components:[connector("Google Sheets","read","Loeb kinnitatud aruandevahemiku."),rule("Arvutab näitajad ja kõrvalekalded.","Google Sheetsi valemid või Python"),ai("Sõnastab arvutatud näitajate põhjal narratiivi."),human(),connector("Esitlus","write","Lisab kinnitatud teksti aruande mustandisse.")] }),
      idea({ id:"P2", title:"Näitajate kvaliteedikontroll", type:"sammu_parendus", status:"jargmine", flow:"Arvutatud näitajad → deterministlikud kontrollid → erandite loend", components:[rule("Kontrollib summasid ja perioodide võrreldavust.","Google Sheetsi valemid"),human()] }),
      idea({ id:"P3", title:"Aruande kommentaari AI-katse", type:"sammu_parendus", status:"hiljem", flow:"Kontrollitud näitajad → AI kommentaar → inimese toimetus", components:[ai("Koostab kontrollitud arvudest kommentaari."),human()] })
    ]
  }),
  scenario({
    id:"employee-onboarding",
    title:"Uue töötaja onboarding",
    systems:["HR-süsteem","Kalender","Kontode haldus"],
    ideas:[
      idea({ id:"P1", title:"Sündmuspõhine onboardingu töövoog", status:"alusta_siist", flow:"HR-is kinnitatud töötaja → HR read → ülesannete reeglid → juhi kinnitus → kalendri ja kontode piiratud write", components:[connector("HR-süsteem","read","Loeb kinnitatud töötaja alustamiseks vajalikud väljad."),rule("Moodustab rolli põhjal standardsed ülesanded."),human("Juht kinnitab ülesanded ja õigused."),connector("Kalender","write","Loob kinnitatud kohtumiste mustandid."),connector("Kontode haldus","write","Loob kinnitatud konto loomise taotlused, mitte lõplikke õigusi.")] }),
      idea({ id:"P2", title:"Onboardingu puuduste kontroll", type:"sammu_parendus", status:"jargmine", flow:"HR väljad → reeglikontroll → puuduste loend juhile", components:[connector("HR-süsteem","read","Loeb vajalikud onboarding'u väljad."),rule("Kontrollib kohustuslike andmete olemasolu."),human()] }),
      idea({ id:"P3", title:"Uue töötaja küsimuste abiline", type:"sammu_parendus", status:"hiljem", flow:"Kinnitatud juhendid → AI vastusemustand → personalitöötaja kontroll", components:[ai("Leiab kinnitatud juhenditest vastuse mustandi."),human()] })
    ]
  }),
  scenario({
    id:"service-redesign",
    title:"Teenindusjuhtumi ümberkujundamine",
    systems:["Teenindusvorm","Piletisüsteem"],
    ideas:[
      idea({ id:"P1", title:"Struktureeritud iseteenindusest erandipõhise käsitluseni", type:"protsessi_umberkujundus", status:"alusta_siist", flow:"Juhitud vorm → reeglipõhine täielikkuse kontroll → AI liigitus → keerukad juhud inimesele → piletisüsteemi write", components:[rule("Kogub kohustuslikud väljad ja kontrollib täielikkust."),ai("Liigitab vabateksti ja koostab teenindajale kokkuvõtte."),human("Lahendab ebakindlad või suure mõjuga erandid."),connector("Piletisüsteem","write","Loob täieliku juhtumi pärast kontrollpunkte.")] }),
      idea({ id:"P2", title:"Teenindaja kokkuvõtteabiline", type:"sammu_parendus", status:"jargmine", flow:"Juhtumi tekst → AI kokkuvõte → teenindaja kontroll", components:[ai("Koostab juhtumist kontrollitava kokkuvõtte."),human()] }),
      idea({ id:"P3", title:"SLA ja suunamise reeglid", type:"sammu_parendus", status:"hiljem", flow:"Juhtumi väljad → reeglipõhine prioriteet → inimese erandikontroll", components:[rule("Rakendab kinnitatud SLA ja suunamise reegleid."),human()] })
    ]
  })
];
