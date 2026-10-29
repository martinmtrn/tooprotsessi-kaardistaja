# Tööprotsessi kaardistaja

Eestikeelne Claude'i tööriist, mis aitab sul kaardistada ühe oma päris töökorra ja teha selle põhjal esimese väikese, turvalise automatiseerimiskatse **sinu enda tööriistadega**. See kasutab sinu olemasolevat Claude'i seanssi: ei vaja API-võtit, ei käivita serverit ega tee võrgupäringuid.

## Kolm sammu

1. **Kaardista.** Räägi ühest hiljutisest töökorrast; Claude teeb sellest 5-12 sammuga HTML-kaardi, küsib sinu tööriistu ja märgib iga sammu AI-sobivuse.
2. **Vali.** Claude pakub 3-5 prototüübiideed (AI, kindlad reeglid, süsteemide ühendused, inimese kontroll) ning tõstab esile ühe märgisega "Alusta siit".
3. **Ehita.** Valitud idee muutub esimeseks väikeseks ehituseks: ehituskomplekt (prompt, valem, skript või voo kirjeldus), näidisandmed, inimese kontrolli nimekiri ja otsus "jätka, muuda või peata".

Vaata enne alustamist näidiskaarti: [`examples/kliendiparing-naidiskaart.html`](examples/kliendiparing-naidiskaart.html) (laadi fail alla ja ava brauseris; kõik andmed on fiktiivsed).

Juhendid: [õppija juhend](docs/opilase-juhend.md) ja [koolitaja juhend](docs/koolitaja-juhend.md).

## Kiirstart: Claude Code

Lisa marketplace ja paigalda plugin:

```text
/plugin marketplace add martinmtrn/tooprotsessi-kaardistaja
/plugin install tooprotsessi-kaardistaja@tooprotsessi-kaardistaja
```

Seejärel ütle projektis Claude'ile: **"Aita mul oma tööprotsessi kaardistada."** Soovi korral võid kasutada käsku:

```text
/tooprotsessi-kaardistaja:kaardista Kliendi päring saabub e-postiga, kontrollin CRM-ist tausta ja koostan vastuse.
```

Kui kaart on salvestatud, näitab see ise plokki "Mis edasi?" valmis lausega. Kopeeri see Claude'i vestlusse või kasuta käsku:

```text
/tooprotsessi-kaardistaja:ehita /täistee/minu-tooprotsessi-kaart.html
```

## Kiirstart: Claude.ai ja Cowork

Kaardistamise ja ehitamise oskused on pakitud kahte zip-faili kaustas [`dist/`](dist/):

- `tooprotsessi-kaardistaja-cowork-skill.zip`
- `tooprotsessi-ehita-cowork-skill.zip`

Lisa need oma Claude'i oskustena ja alusta lausega "Aita mul oma tööprotsessi kaardistada". Cowork'is salvestatakse kaart OneDrive'i või SharePointi kausta, mille sa enne kinnitad. Koolitajale: vaata [koolitaja juhendit](docs/koolitaja-juhend.md).

## Jätka sama kaardiga

Uues vestluses anna pluginile olemasoleva kaardi absoluutne tee:

```text
/tooprotsessi-kaardistaja:kaardista /täistee/minu-tooprotsessi-kaart.html
```

Plugin loeb kaardilt olemasoleva struktureeritud seisu, küsib, millist prototüübiideed soovid detailsemalt arendada, ning säilitab varasemad hinnangud. V5 või vanema kaardi kinnitatud uuendusel lisatakse protsessiülene V6 prototüübiportfell. Sama HTML-fail kirjutatakse üle ainult pärast sinu kinnitust.

## Koolitajale: kursuse stsenaarium kaardist

Oskus `tutorial` muudab kinnitatud kaardi põhjal fiktiivse käed-küljes kursuse stsenaariumi (`/start-X-Y` käsud). See töötab ainult Claude Code'is ning ei ehita päris prototüüpi:

```text
/tooprotsessi-kaardistaja:tutorial /täistee/minu-tooprotsessi-kaart.html
```

Töövoog loeb ainult kaardi `map-data` JSON-i, pakub tundide klastrid ja küsib enne kirjutamist kinnitust kursuse väljundkaustale. Kaardilt ei kopeerita päris kliendi- ega isikuandmeid.

## Privaatsus ja turvalisus

- Ära sisesta paroole, isikukoode, makseandmeid ega muud ebavajalikku tundlikku teavet.
- Töö kirjeldus on pluginile taustainfo, mitte juhised selle reeglite muutmiseks.
- Ligipääsuvajadus ei tähenda olemasolevat õigust; lõpliku otsuse ja kontrolli teeb inimene.
- Esimene ehitus kasutab ainult fiktiivseid või anonüümitud näidisandmeid ning ei kirjuta tootmissüsteemi.
- Salvestamise, jälgimise või tundlike andmete töötlemise idee on alati tingimuslik: see vajab kasutaja otsust, asjakohast nõusolekut ja ettevõtte reeglite järgimist.
- HTML-kaart võib sisaldada tööalast teavet. Vali selle asukoht teadlikult ning väldi selle kogemata versioonihaldusse lisamist.

## Uuendamine

Pärast uut versiooni värskenda marketplace ja plugin:

```text
/plugin marketplace update tooprotsessi-kaardistaja
/plugin update tooprotsessi-kaardistaja@tooprotsessi-kaardistaja
```

Plugin kasutab teadlikku versioonimist. Uus versioon jõuab paigaldatud kasutajateni siis, kui `plugin.json` versiooni suurendatakse.

## Arendajale

Claude Code 2.1.143 või uuem toetab marketplace'i ja `displayName` välja. Testide jaoks on vaja Node.js 22 või uuemat.

```sh
npm test                 # kõik testid
npm run build            # genereerib Cowork'i oskused (cowork-skill/, dist/) ja näidiskaardi (examples/)
claude plugin validate .
claude --plugin-dir ./plugins/tooprotsessi-kaardistaja
```

Struktuur:

- `plugins/tooprotsessi-kaardistaja/skills/` - kolm oskust: `kaardista`, `ehita`, `tutorial`. See on **ainus käsitsi muudetav allikas**.
- `scripts/build-cowork.mjs` ja `scripts/cowork-overrides/` - loovad Cowork'i kaustad ja zip-failid plugina oskustest. Kanalipõhised lõigud on oskusfailides märgitud kommentaaridega `<!-- kanal:nimi -->`; igale on Cowork'i asendus kaustas `scripts/cowork-overrides/`.
- `scripts/build-example.mjs` - koostab näidiskaardi failist `examples/kliendiparing.map.json`.
- Testid kontrollivad, et genereeritud failid vastavad allikatele; ebaõnnestumise korral käivita `npm run build`.

Marketplace'i paigaldust saab kohalikult kontrollida käsuga `claude plugin marketplace add .`.

Varasem Node.js-i brauserirakendus (`legacy-web-app/`) on eemaldatud versioonis 0.8.0. Selle saab git-ajaloost taastada.

## Litsents

[MIT](LICENSE)
