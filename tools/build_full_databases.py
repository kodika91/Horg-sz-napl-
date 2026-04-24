#!/usr/bin/env python3
"""Teljes adatbázis-generáló segéd.

Településekhez javasolt forrás: KSH Helységnévtár XLSX/CSV vagy tisztított JSON.
Vizekhez javasolt forrás: OpenStreetMap/Geofabrik, HOTOSM Hungary waterways/water bodies export, vagy OVF/VGT adatok.

Használat:
  python tools/build_full_databases.py --settlements input_settlements.json --waters input_waters.geojson --out data

Elvárt település JSON lista példa:
[
  {"name":"Tata", "county":"Komárom-Esztergom", "lat":47.65, "lon":18.32, "rank":"város"}
]

Elvárt víz GeoJSON: FeatureCollection, properties.name és properties.waterway/natural/water mezőkkel.
"""
import argparse, json, os
from collections import defaultdict

def norm_type(p):
    waterway = p.get("waterway")
    water = p.get("water")
    natural = p.get("natural")
    if waterway == "river": return "folyó"
    if waterway == "stream": return "patak"
    if waterway == "canal": return "csatorna"
    if water in ("lake", "pond") or natural == "water": return "tó/vízfelület"
    if water == "reservoir": return "tározó"
    return p.get("type", "víz")

def centroid(coords):
    pts = []
    def walk(x):
        if isinstance(x, (list, tuple)) and len(x) >= 2 and all(isinstance(v, (int, float)) for v in x[:2]):
            pts.append(x[:2])
        elif isinstance(x, (list, tuple)):
            for y in x: walk(y)
    walk(coords)
    if not pts: return None, None
    lon = sum(p[0] for p in pts) / len(pts)
    lat = sum(p[1] for p in pts) / len(pts)
    return lat, lon

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--settlements")
    ap.add_argument("--waters")
    ap.add_argument("--out", default="data")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    if args.settlements:
        rows = json.load(open(args.settlements, encoding="utf-8"))
        by = defaultdict(list)
        counties = set()
        for r in rows:
            c = r.get("county") or r.get("varmegye") or r.get("Megye neve")
            n = r.get("name") or r.get("telepules") or r.get("Település neve")
            if not c or not n:
                continue
            counties.add(c)
            by[c].append({
                "name": n,
                "county": c,
                "lat": r.get("lat") or r.get("szelesseg"),
                "lon": r.get("lon") or r.get("hosszusag"),
                "rank": r.get("rank") or r.get("rang")
            })
        json.dump({"source":"generated", "counties":sorted(counties), "settlementsByCounty":dict(by)},
                  open(os.path.join(args.out, "settlements.min.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",",":"))

    if args.waters:
        gj = json.load(open(args.waters, encoding="utf-8"))
        out = []
        seen = set()
        for f in gj.get("features", []):
            p = f.get("properties", {})
            name = p.get("name") or p.get("name:hu")
            if not name or name in seen:
                continue
            lat, lon = centroid(f.get("geometry", {}).get("coordinates"))
            seen.add(name)
            out.append({"name":name, "type":norm_type(p), "county":p.get("county",""), "settlement":p.get("settlement",""), "lat":lat, "lon":lon})
        out.sort(key=lambda x: x["name"])
        json.dump({"source":"generated from geojson", "waters":out},
                  open(os.path.join(args.out, "waters.min.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",",":"))

if __name__ == "__main__":
    main()
