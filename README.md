# Horgász Napló Pro – gyors, moduláris GitHub Pages verzió

Ez a verzió úgy készült, hogy a fő `index.html` ne legyen lassú:
- a település-, víz-, halfaj- és termékadatbázis külön JSON fájlokban van,
- az alkalmazás csak akkor tölti be az adatot, amikor az adott menüpont kell,
- a naplók és saját csalik/horgok/vizek a böngésző `localStorage` tárhelyébe mentődnek.

## Fájlok
- `index.html` – maga az alkalmazás
- `data/settlements.min.json` – vármegyék és települések
- `data/waters.min.json` – vízadatbázis
- `data/fish.json` – halfajok, képek és országos alap tilalmi/méret adatok
- `data/products.json` – csali/horog induló adatbázis
- `tools/build_full_databases.py` – teljes adatbázis előállító segédscript külső forrásból

## Fontos adatminőségi megjegyzés
A mellékelt település- és vízlista induló, gyors demo-adatbázis. A szerkezet már alkalmas teljes országos adatbázis fogadására, de az országos teljes vízrajzi állományt érdemes külön generálni OSM/OVF/KSH forrásból, mert nagy és idővel változik.

## GitHub Pages
1. Töltsd fel a teljes mappát a GitHub repositoryba.
2. Settings → Pages → Deploy from branch.
3. HTTPS-en megnyitva a GPS funkció működhet, ha a böngésző engedélyezi.
