# Horgász Napló – GitHub Pages verzió

Statikus, telefonon is használható Horgász Napló webapp.

## Feltöltés GitHub Pages-re

1. Csomagold ki a ZIP-et.
2. A kicsomagolt mappában lévő fájlokat töltsd fel a GitHub repo gyökerébe.
3. Az `index.html`, `app.js`, `data.js`, `style.css`, `manifest.json`, `sw.js` és az `assets` mappa legyen közvetlenül a repo gyökerében.
4. GitHub: Settings → Pages → Deploy from branch → main → /root.

## Fő funkciók

- Új bejegyzés a vázlat szerinti elrendezésben.
- GPS koordináta lekérés telefonról.
- Élő Open-Meteo időjárás: hőmérséklet, hőérzet, páratartalom, légnyomás, szélsebesség, szélirány, széllökés, csapadék, felhőzet, UV, holdfázis.
- Órás időjárás bontás.
- Helyszín, módszer, csali, horog, etetőanyag, vízállapot, megjegyzés és saját képek mentése.
- Napló visszanézés a mentéskori időjárással.
- Szerkeszthető adatbázis menüpontok: csalik, etetőanyagok, horgok, módszerek.
- Halfajok külön tudásbázisban.
- Aktuális tilalmak menüpont a beépített adatok alapján.
- JSON export/import biztonsági mentéshez.

## Fontos

A halfaj tilalmi idők induló adatként szerepelnek. Mindig ellenőrizd az aktuális országos és helyi horgászrendet is.
