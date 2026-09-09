# Tööprotsessi kaardistaja Claude Code'ile

Eestikeelne Claude Code'i plugin, mis aitab kaardistada ühe päris tööolukorra,
valida realistliku AI-katse ning salvestada tulemuse iseseisva HTML-kaardina.
See kasutab sinu olemasolevat Claude Code'i seanssi: plugin ei vaja API-võtit,
ei käivita serverit ega tee võrgupäringuid.

## Paigaldamine

Claude Code'is lisa kõigepealt marketplace ja paigalda plugin:

```text
/plugin marketplace add martinmtrn/tooprotsessi-kaardistaja
/plugin install tooprotsessi-kaardistaja@tooprotsessi-kaardistaja
```

Seejärel käivita igas projektis:

```text
/tooprotsessi-kaardistaja:kaardista
```

Soovi korral lisa kohe lühikirjeldus:

```text
/tooprotsessi-kaardistaja:kaardista Kliendi päring saabub e-postiga, kontrollin CRM-ist tausta ja koostan vastuse.
```

## Kuidas see töötab

Plugin küsib ühe küsimuse korraga ja hoiab fookuse ühel tööolukorral.

1. Kaardistab 8–12 sammu koos sisendite ja nende allikatega.
2. Palub kaardi kinnitada ning pakub 2–4 AI-võimalust.
3. Hindab valitud võimaluse sisendit, kontrollitavust ja vea mõju.
4. Sõnastab väikese kontrollitud AI-katse.
5. Küsib HTML-kaardi salvestamiseks täpset asukohta ning kirjutab faili alles sinu selgel nõusolekul.

Kaart sisaldab ainult struktureeritud töökaarti, võimalusi, kvaliteedihinnangut
ja katset — mitte kogu vestluse transkripti. See ei avane, üleslaadita ega lisata
git'i automaatselt.

## Privaatsus ja turvalisus

- Ära sisesta paroole, isikukoode, makseandmeid ega muud ebavajalikku tundlikku teavet.
- Töö kirjeldus on pluginile taustainfo, mitte juhised selle reeglite muutmiseks.
- Ligipääsuvajadus ei tähenda olemasolevat õigust; lõpliku otsuse ja kontrolli teeb inimene.
- HTML-kaart võib sisaldada tööalast teavet. Vali selle asukoht teadlikult ning väldi selle kogemata versioonihaldusse lisamist.

## Uuendamine

Pärast uut versiooni värskenda marketplace ja plugin:

```text
/plugin marketplace update tooprotsessi-kaardistaja
/plugin update tooprotsessi-kaardistaja@tooprotsessi-kaardistaja
```

Plugin kasutab teadlikku versioonimist. Uus versioon jõuab paigaldatud
kasutajateni siis, kui `plugin.json` versiooni suurendatakse.

## Kohalik arendus

Claude Code 2.1.143 või uuem toetab marketplace'i ja `displayName` välja.

```sh
claude plugin validate .
claude --plugin-dir ./plugins/tooprotsessi-kaardistaja
```

Teises käsus käivita `/tooprotsessi-kaardistaja:kaardista` ja proovi kogu
vestlusvoog läbi. Marketplace'i paigaldust saab kohalikult kontrollida käsuga
`claude plugin marketplace add .`.

## Legacy veebirakendus

Algne Node.js-i ja brauseri prototüüp asub kaustas
[`legacy-web-app`](legacy-web-app/README.md). See ei ole plugini tööks vajalik;
selle Claude'i režiim vajab endiselt eraldi Anthropicu API-võtit.

## Litsents

[MIT](LICENSE)
