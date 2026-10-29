# Koolitaja juhend

Siit leiad, kuidas Tööprotsessi kaardistaja koolitusel kasutada, mida ette valmistada ja kuidas Cowork'i oskuste zip-faile uuendada.

## Soovituslik ajakava (umbes 2 tundi)

See on soovitus, mitte nõue. Kohanda gruppi ja ajaga.

| Osa | Aeg | Tulemus osalejale |
| --- | --- | --- |
| Sissejuhatus ja näidiskaardi vaatamine | 10 min | Teab, kuhu jõutakse |
| Kaardistamine | 30 min | HTML-kaart oma töökorra sammudega ja tööriistade nimekirjaga |
| Prototüübi valik | 15 min | Üks põhjendatud "Alusta siit" idee koos mõõtmiskavaga |
| Esimene ehitus näidisandmetel | 40 min | Ehituskomplekt ja täidetud tulemuste tabel |
| Arutelu | 15 min | Otsus: jätka, muuda või peata; küsimus IT-le või juhile |

## Enne koolitust

1. Veendu, et osalejatel on Claude Code (plugin) või Claude oskustega (Cowork ja zip-failid). Paigaldus on README-s.
2. Käi ise läbi: ava [`examples/kliendiparing-naidiskaart.html`](../examples/kliendiparing-naidiskaart.html), kopeeri lause plokist "Mis edasi?" ja lase `ehita` oskusel see läbi teha.
3. Palu osalejatel valida juba enne koolitust üks hiljutine töökord (algus ja lõpp nähtavad) ning mõelda, milliseid tööriistu nad tohivad kasutada.
4. Tuleta meelde: harjutuses kasutame väljamõeldud või anonüümitud andmeid.

## Oskused ja nende rollid

| Oskus | Kellele | Mida teeb |
| --- | --- | --- |
| `kaardista` | Osalejale | Kaardistab ühe tööolukorra ja koostab HTML-kaardi prototüübiideedega |
| `ehita` | Osalejale | Viib valitud prototüübi esimese väikese ehituseni osaleja tööriistadega |
| `tutorial` | Koolitajale | Muudab kinnitatud kaardi põhjal fiktiivse käed-küljes kursuse stsenaariumi (`/start-X-Y` käsud); ei ehita päris prototüüpi |

`tutorial` töötab ainult Claude Code'is, sest loob kausta `.claude/commands` käskudega. Cowork'i pakettides seda ei ole.

## Cowork'i ja Claude.ai oskuste zip-failid

Zip-failid kaustas `dist/` ja kaustad `cowork-skill/` on genereeritud. **Ära muuda neid käsitsi.** Muuda plugina oskusi kaustas `plugins/tooprotsessi-kaardistaja/skills/` (ja vajadusel kanalipõhiseid asendusi kaustas `scripts/cowork-overrides/`) ning käivita:

```bash
npm run build
```

`npm test` kontrollib, et genereeritud failid vastavad allikatele. Kui test ebaõnnestub, käivita `npm run build`.

Kaks zip-faili:

- `dist/tooprotsessi-kaardistaja-cowork-skill.zip` (kaardistamine)
- `dist/tooprotsessi-ehita-cowork-skill.zip` (esimene ehitus)

Lae need enne koolitust ise oma Claude'i oskustesse üles ja tee üks läbimäng, sest repo ei saa automaatselt kontrollida, et sinu Claude'i versioon neid vastu võtab.

## Privaatsus

- Osalejate kaardid võivad sisaldada tööalast infot. Palu osalejatel salvestada need oma töökausta ega jagada ilma nõusolekuta.
- Ära kogu osalejate päris kliendi- ega isikuandmeid. Harjutuses kasutatakse fiktiivseid näiteid.
- Plugin ei tee võrgupäringuid ja ei vaja API-võtit. Kõik toimub osaleja enda Claude'i seansis.

## Mida järgmiseks

Kui osaleja otsustas "jätka", aitab komplekti fail `05-jargmine-samm.md` tal koostada küsimuse IT-le või juhile. Soovita osalejal tulla koolituse järelkohtumisele oma tulemuste tabeliga.
