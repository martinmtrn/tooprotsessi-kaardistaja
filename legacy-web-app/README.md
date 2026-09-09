# Legacy veebirakendus: Minu tööteekonna AI-kaart

> See kaust sisaldab algset brauserirakendust demonstratsiooniks. Toetatud
> API-vaba kasutusviis on nüüd juurkaustas olev Claude Code'i plugin.

Vestluslik koolitusvidin, mis aitab osalejal kirjeldada üht päris tööolukorda,
kinnitada selle sammud ning valida ühe realistliku AI-katse. See ei ühendu
ettevõtte süsteemidega ega säilita seansi sisu serveris.

## API-vaba kohalik kasutus

Ava lihtsalt `public/index.html` veebibrauseris. Vaikimisi on valitud
**kohalik režiim**: kaardistamine toimub reeglipõhiselt ainult brauseris ning
teksti ei saadeta võrku, API-sse ega serverisse. Selles režiimis pole vaja
Node.js-i, API-võtit ega internetiühendust.

## Käivitamine

Kui soovid kasutada vabamas vestluses Claude'i, eemalda kasutajaliideses
"kohalik režiim" linnuke. Siis vajad serverit:

1. Kasuta Node.js-i versiooni 20 või uuemat.
2. Kopeeri `.env.example` failiks `.env` ja lisa `ANTHROPIC_API_KEY`.
3. Käivita `npm start`.
4. Ava `http://localhost:3000`.

API-võti jääb serverisse. Rakendus kasutab Anthropicu Messages API-t ning
hoiab vestlust ainult kasutaja brauseri mälus. See tähendab, et lehe uuendamine
lõpetab seansi.

Claude'i režiimis lisandub pärast AI-võimaluse valimist sisendi ja väljundi
kvaliteedi hinnang. See küsib oodatud tulemust, vajaliku kontrollitavuse,
sisendi valmisoleku, kontrolliviisi ja vea mõju ning annab põhjendatud staatuse.
Kohalik režiim seda sisulist hinnangut ei simuleeri.

## Koolitaja kasutus

- Palu osalejal valida üks käivituva alguse ja nähtava lõpuga tööolukord.
- Osaleja kleebib transkripti või kirjutab lühikirjelduse; tundlikku sisu
  sisestatakse ainult ettevõtte heakskiidetud AI-kasutuse raamides.
- Enne AI-võimaluste vaatamist kinnitab osaleja tööteekonna.
- Lõpus saab kaart alla laadida Markdown-failina või kopeerida.

Anthropicu API kasutab struktureeritud tööriistakutset, et tagastada alati
samas vormis tööteekonna kaart.
