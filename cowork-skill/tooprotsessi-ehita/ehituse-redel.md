# Ehituse redel ja komplekti mallid

Loe seda viidet ainult siis, kui valid esimese ehituse viisi või kirjutad ehituskomplekti faile. Vali alati madalaim redelisamm, mis prototüübi suurimat ebakindlust kontrollib.

## Kuidas redelisammu valida

| Prototüübi suurim ebakindlus | Esimene redelisamm |
| --- | --- |
| AI väljund pole kindlalt kasutatav | 1. Prompt ja testjuhtumid |
| Reegel või arvutus peab alati samamoodi töötama | 2. Valem või kontrollreegel |
| Töö on korduv ja sisend on struktureeritud | 3. Väike skript näidisandmetel |
| Mitme süsteemi vahel liigub info käsitsi | 4. Voo kirjeldus mustandina |
| Töövoogu peavad kasutama teised inimesed | 5. Paketeeritud juhis või oskus |

Kui kasutaja nimetatud tööriistadega ei saa valitud sammu teha, vali järgmine madalam sobiv samm või kirjuta käsitsi- või concierge-asendus. Ära soovita tööriista osta.

## Redelisammud

### 1. Prompt ja testjuhtumid
- Sobib, kui AI loeb vabateksti, koostab mustandi, võrdleb või selgitab.
- Tööriist: mis tahes vestluslik AI, mille kasutamine on kasutajale lubatud (Claude, ChatGPT, Copilot).
- Tulemus: korduvkasutatav prompt, 3-5 testjuhtumit oodatud tulemusega, kontrollnimekiri.
- Ohutu piir: ainult fiktiivsed või anonüümitud näited; väljundit ei saadeta edasi enne inimese kontrolli.

### 2. Valem või kontrollreegel
- Sobib, kui tulemus peab olema alati sama: summad, kohustuslikud väljad, kuupäevareeglid.
- Tööriist: Excel või Google Sheets (valemid, andmete valideerimine, tingimusvormindus).
- Tulemus: valemite loend või kontrolllehe kirjeldus ning testrida iga reegli kohta.
- Ohutu piir: töötab koopial või näidisandmestikul, mitte päris tööfailil.

### 3. Väike skript näidisandmetel
- Sobib, kui sama töötlus korduvalt tehakse ja sisend on struktureeritud.
- Tööriist: Office Scripts (Excel veebis), Apps Script (Google), Python või muu kasutaja nimetatud keskkond.
- Tulemus: üks väike skript `03-ehitus/` kaustas ja testkäivitus `01-testandmed/` failidega.
- Ohutu piir: skript loeb ainult testkaustast ega kirjuta väljapoole seda.

### 4. Voo kirjeldus mustandina
- Sobib, kui info liigub käsitsi mitme süsteemi vahel.
- Tööriist: Power Automate, Zapier, Make, n8n või muu kasutaja nimetatud automatiseerimisplatvorm.
- Tulemus: voo kirjeldus kujul käivitaja, tegevused, tingimus, inimese kinnitus, eranditee; vajaduse korral platvormi mustandvoog testkonto või testandmetega.
- Ohutu piir: kirjeldus või sandbox; ühtegi tootmisvoogu ei lülitata sisse ja write-samm ootab inimese kinnitust.

### 5. Paketeeritud juhis või oskus
- Sobib, kui toimiv prompt või reegel läheb teiste kasutusse.
- Tööriist: Claude'i projekti juhised või oskus, ettevõtte jagatud juhend.
- Tulemus: lühike kasutusjuhend, sisend- ja väljundmall, kontrollnimekiri.
- Ohutu piir: jagamine ainult pärast IT või juhi nõusolekut.

## Tööriistade vastavuse tabeli mall

| Komponent | Roll | Kasutaja tööriist | Kuidas lihtsas keeles | Lünk | Järgmine samm |
| --- | --- | --- | --- | --- | --- |
| (kaardi `components` kirje) | (selle `role`) | (kasutaja nimetatud või `Täpsustada`) | (üks lause) | (mis puudub) | (käsitsi asendus või küsimus IT-le) |

## Ehituskomplekti failimallid

### README.md
- Pealkiri: prototüübi nimi.
- Üks lõik: mida esimene ehitus kontrollib.
- Olekunimekiri märkeruutudega: näidisandmed, ehitus, inimese kontroll, tulemuste tabel, otsus.
- Faili 00-ulevaade.md link.

### 00-ulevaade.md
- Prototüübi nimi ja `summary`.
- Hüpotees (`prototypePlan.hypothesis`).
- Mis on sees ja mis jääb välja (`prototypePlan.scope`).
- Tööriistade vastavuse tabel.
- Inimese kontroll ja eranditee.
- Edukuse mõõdik ja katkestamiskriteerium.

### 04-kontroll.md
- Inimese kontrolli nimekiri: mida kontrollija vaatab ja mille põhjal otsustab.
- Võrdlus kaardi lähtepunktiga; kui lähtepunkt puudub, märge „Mõõta esimeses väikeses katses”.
- Tulemuste tabel:

| Juhtum | Oodatud tulemus | Tegelik tulemus | Klapib (jah/ei) | Märkus |
| --- | --- | --- | --- | --- |

### 05-jargmine-samm.md
- Otsus: jätka, muuda või peata.
- Põhjendus edukuse mõõdiku ja katkestamiskriteeriumi järgi.
- Valmis küsimus IT-le või juhile (`prototypePlan.ownerQuestion` või tööriistade lünkadest).
- Üks soovitatud järgmine väike samm.
