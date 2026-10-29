# Muudatuste ajalugu

## 0.8.0 - 2026-10-28

- Lisatud oskus `ehita`: viib kaardil valitud prototüübi esimese väikese ehituseni õppija enda tööriistadega. Koostab tööriistade vastavustabeli, ehituskomplekti ja juhendab esimese katse fiktiivsetel või anonüümitud näidisandmetel kuni otsuseni jätka, muuda või peata.
- `kaardista` küsib enne prototüübiportfelli tööriistad ja nende piirangud (valikulised väljad `processContext.tools` ja `processContext.toolLimits`; skeemiversioon jääb 6), pakub salvestamiseks vaikimisi asukoha ning lõpetab valmis lausega ehitamise alustamiseks.
- `kaardista` ei ole enam ainult käsitsi käivitatav, nii et sõnastus "aita mul oma tööprotsessi kaardistada" käivitab selle. `tutorial` jääb käsitsi käivitatavaks.
- HTML-kaart näitab tööriistu ning plokki "Mis edasi?" kopeeritava lausega.
- Cowork'i ja Claude.ai oskused (`cowork-skill/` ja `dist/`) genereeritakse nüüd plugina oskustest käsuga `npm run build`; testid kontrollivad, et need ei lähe allikatest lahku. Zip-faile on kaks: kaardistamine ja ehitamine.
- Lisatud fiktiivne näidiskaart `examples/`, õppija ja koolitaja juhend kaustas `docs/`, README on ümber tehtud õppija teekonna järgi, ning juurkausta `package.json` (`npm test`) ja GitHub Actionsi testide töövoog.
- Eemaldatud `legacy-web-app/`; selle saab git-ajaloost taastada.

## 0.7.0 — 2026-10-05

- Lisatud `tutorial` töövoog, mis muudab Tööprotsessi kaardistaja HTML-kaardi
  põhjal fiktiivse käed-küljes Claude Code'i kursuse stsenaariumi.
- Tutorial klasterdab protsessisammud AI-sobivuse järgi, säilitab inimese
  kontrollpunktid ning ei loo päris write-ühendusi ega kasuta kliendiandmeid.

## 0.6.0 — 2026-09-09

- Sammupõhise lahendusvõrdluse asemel loob plugin 3–5 protsessiülest prototüübiideed ning tõstab ühe neist esile märgisega „Alusta siit”.
- Üks prototüüp võib kombineerida AI, deterministliku töötluse, read/write connector'id ja inimese kontrolli ning pakkuda põhjendatud protsessi ümberkujundust.
- Lisatud protsessikontekst, ehitatava prototüübi visand, riskipõhine esimese katse valik ja viis stsenaariumifikstuuri.
- V4/V5 kaardid jäävad loetavaks ning nende vanad sammupõhised andmed säilitatakse V6 uuendusel.

## 0.5.0 — 2026-09-09

- Iga sammu detailvaates on nüüd soovitatud lahendustee ja võrreldavad AI-chat, read-connector, write-connector ning deterministlik alternatiiv.
- Deterministliku soovituse korral näitab kaart selgelt märget „AI asemel mõistlikum” ning sobivat tehnoloogianäidet.
- V4-kaardid jäävad loetavaks; nelja tee võrdlus lisatakse alles järgmise kinnitatud uuendusega V5 vormingus.

## 0.4.0 — 2026-09-09

- Detailhinnangus valib kasutaja nüüd AI kasutamise peamise ja valikulise teisejärgulise kasu.
- Lisatud lähtepunkti, sihi ja kontrolliviisiga mõõtmiskava ning sellele vastav HTML-kaardi plokk.
- V3-kaardid jäävad loetavaks; nende puuduvaid ärieesmärke ei oletata.

## 0.3.0 — 2026-09-09

- Lisatud AI-sobivatele sammudele põhjendatud, tingimuslikud töökorralduse alternatiivid.
- Detailne kvaliteedihinnang ja kontrollitud katse näitavad nüüd hinnatud lähenemist.
- HTML-mall loeb V2-kaarte edasi ning kinnitatud uuendusel kirjutab need V3-vormingusse.

## 0.2.0 — 2026-09-09

- HTML-kaart on nüüd üks protsessijoon, kus igal sammul on AI-sobivuse esmahinnang.
- Esmahinnangu, detailse kvaliteedihinnangu ja järgmise katse plokid on lahtiklikitavad.
- Lisatud olemasoleva HTML-kaardi järgmises vestluses jätkamise ja sama faili turvalise uuendamise töövoog.

## 0.1.0 — 2026-09-09

- Esimene avalik Claude Code'i marketplace ja plugin `tooprotsessi-kaardistaja`.
- Lisatud eestikeelne juhendatud tööprotsessi kaardistamise oskus.
- Lisatud API-vaba, iseseisev HTML-kaardi mall.
- Algne brauserirakendus tõstetud `legacy-web-app/` demonstratsiooniks.
