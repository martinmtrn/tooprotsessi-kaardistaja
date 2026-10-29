# Õppija juhend: kaardista oma töö ja tee esimene katse

See juhend viib sind ühest päris töökorrast esimese väikese automatiseerimiskatseni. Ülesanne ei ole valmis lahendus, vaid ohutu esimene katse, mis näitab, kas idee on jätkamist väärt. Kogu töö võtab umbes 1,5 tundi.

## Mida sul vaja on

- Claude Code (töölauaversioon või terminal) või Claude oskustega (Claude.ai või Cowork), kuhu koolitaja on tööriista lisanud.
- Üks **hiljutine päris töökord**, millel on selge algus ja nähtav lõpp (näiteks "kliendi päring saabus e-postiga ja sai vastuse"). Vali üks juhtum, mitte kogu amet.
- Teadmine, milliste tööriistadega sul on ligipääs ja luba töötada (Excel, Outlook, Google Sheets, Claude, Power Automate ...) ning kas ettevõttel on AI-kasutuse reegel.

Vaata enne alustamist näidiskaarti: [`examples/kliendiparing-naidiskaart.html`](../examples/kliendiparing-naidiskaart.html) (laadi fail alla ja ava brauseris). Nii näed, kuhu sa jõuad.

## Kolm sammu

### 1. Kaardista
Ütle Claude'ile: **"Aita mul oma tööprotsessi kaardistada."** (Claude Code'is töötab ka käsk `/tooprotsessi-kaardistaja:kaardista`.)

Claude küsib ühe küsimuse korraga: mis töö käivitas, mida sa tegid, millest infot võtsid ja kus aeg kulus. Kirjuta nii, nagu räägiksid kolleegile. Kui Claude näitab sinu töö samme, vasta "sobib" või paranda. Ta küsib ka sinu **tööriistu**; nimeta kõik, mis meelde tulevad.

### 2. Vali prototüüp
Claude pakub 3-5 ideed, kuidas seda tööd osaliselt automatiseerida, ja märgib ühe **"Alusta siit"**. See on idee, mis kontrollib kõige väärtuslikumat eeldust väikese riskiga. Vali see või mõni teine ning vasta mõnele täpsustavale küsimusele (millist kasu ootad, millega võrdled, kus inimene kontrollib).

Lõpuks salvestub kaart HTML-failina. Claude ütleb enne ette, kuhu ta faili salvestab, ja küsib luba.

### 3. Ehita esimene katse
Ava kaart brauseris. Seal on plokk **"Mis edasi?"**; kopeeri sealt lause Claude'i vestlusse. Ta:

1. võrdleb prototüübi osi sinu tööriistadega;
2. pakub väikseima turvalise esimese ehituse (näiteks prompt, Exceli valem, väike skript või voo kirjeldus);
3. loob ehituskomplekti kausta (alles pärast sinu luba);
4. viib sind läbi esimese katse **näidisandmetega**: sina kontrollid tulemust, täidad tulemuste tabeli ja otsustad, kas jätkata, muuta või peatada.

## Mida kindlasti teha

- Kasuta katses **väljamõeldud või anonüümitud näiteid**, mitte päris kliendiandmeid.
- Kontrolli iga tulemust ise, enne kui seda kuhugi edasi saadad.
- Küsi IT-lt või juhilt luba, enne kui midagi päris süsteemiga ühendad. Komplektis on selleks valmis küsimus.

## Mida mitte teha

- Ära sisesta paroole, isikukoode, makseandmeid ega API-võtmeid.
- Ära lase automaatikal kirjutada tootmissüsteemi ega saata kirju enne, kui inimene on need üle vaadanud.
- Ära jaga kaarti ega komplekti, kui selles on tööalast teavet, ilma kolleegi või juhi nõusolekuta.

## Kui jääd toppama

- **Claude küsib liiga palju:** kirjuta esimeses sõnumis terve lugu korraga, siis küsib ta ainult puuduvat.
- **Kaart ei avane:** ava fail brauseris (topeltklõps või "Ava rakendusega").
- **Ma ei tea, milliseid tööriistu mul on lubatud kasutada:** vasta "Täpsustada". Komplekti tuleb siis küsimus IT-le.
- **Idee ei tundu hea:** see on kasulik tulemus. Katse eesmärk on seda varakult teada saada.
