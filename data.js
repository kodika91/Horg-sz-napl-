const WATER_DATA = [
  {
    "name": "Keleti-főcsatorna",
    "img": "assets/waters/keleti-focsatorna.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Nyugati-főcsatorna",
    "img": "assets/waters/nyugati-focsatorna.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Hármas-Körös",
    "img": "assets/waters/harmas-koros.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Bodrog",
    "img": "assets/waters/bodrog.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Rába",
    "img": "assets/waters/raba.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Ipoly",
    "img": "assets/waters/ipoly.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Sajó",
    "img": "assets/waters/sajo.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Zala",
    "img": "assets/waters/zala.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Duna (Közép-szakasz)",
    "img": "assets/waters/duna-kozep-szakasz.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Tisza (Alsó-szakasz)",
    "img": "assets/waters/tisza-also-szakasz.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Muraszombat Duna",
    "img": "assets/waters/muraszombat-duna.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Gerecse Patak",
    "img": "assets/waters/gerecse-patak.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Csatorna",
    "img": "assets/waters/csatorna.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Balaton",
    "img": "assets/waters/balaton.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Tisza-tó",
    "img": "assets/waters/tisza-to.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Derítő-tó",
    "img": "assets/waters/derito-to.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "RSD",
    "img": "assets/waters/rsd.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Felső Duna",
    "img": "assets/waters/felso-duna.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Közép-Tisza",
    "img": "assets/waters/kozep-tisza.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Palotási víztározó",
    "img": "assets/waters/palotasi-viztarozo.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Bányató",
    "img": "assets/waters/banyato.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Hegyi patak",
    "img": "assets/waters/hegyi-patak.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Intenzív víz",
    "img": "assets/waters/intenziv-viz.webp",
    "lat": "",
    "lon": ""
  },
  {
    "name": "Holtág",
    "img": "assets/waters/holtag.webp",
    "lat": "",
    "lon": ""
  }
];
const FISH_DATA = [
  {
    "name": "Selymes durbincs",
    "latin": "Gymnocephalus schraetser",
    "img": "assets/fish/selymes-durbincs.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Leánykoncér",
    "latin": "Rutilus pigus virgo",
    "img": "assets/fish/leanykoncer.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Lápi póc",
    "latin": "Umbra krameri",
    "img": "assets/fish/lapi-poc.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Pénzes pér",
    "latin": "Thymallus thymallus",
    "img": "assets/fish/penzes-per.webp",
    "ban": "03.01–04.30",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Sujtásos küsz",
    "latin": "Alburnoides bipunctatus",
    "img": "assets/fish/sujtasos-kusz.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Halványfoltú küllő",
    "latin": "Gobio albipinnatus",
    "img": "assets/fish/halvanyfoltu-kullo.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Magyar bucó",
    "latin": "Zingel zingel",
    "img": "assets/fish/magyar-buco.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Német bucó",
    "latin": "Zingel streber",
    "img": "assets/fish/nemet-buco.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Pontys küsz",
    "latin": "Leuciscus idus",
    "img": "assets/fish/pontys-kusz.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Sügér",
    "latin": "Perca fluviatilis",
    "img": "assets/fish/suger.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Menyhal",
    "latin": "Lota lota",
    "img": "assets/fish/menyhal.webp",
    "ban": "12.01–03.31",
    "size": "25 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Angolna",
    "latin": "Anguilla anguilla",
    "img": "assets/fish/angolna.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Sebes pisztráng",
    "latin": "Salmo trutta",
    "img": "assets/fish/sebes-pisztrang.webp",
    "ban": "10.01–03.31",
    "size": "22 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Szivárványos pisztráng",
    "latin": "Oncorhynchus mykiss",
    "img": "assets/fish/szivarvanyos-pisztrang.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Pataki szajbling",
    "latin": "Salvelinus fontinalis",
    "img": "assets/fish/pataki-szajbling.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Törpeharcsa",
    "latin": "Ameiurus nebulosus",
    "img": "assets/fish/torpeharcsa.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Naphal",
    "latin": "Lepomis gibbosus",
    "img": "assets/fish/naphal.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Razbóra",
    "latin": "Pseudorasbora parva",
    "img": "assets/fish/razbora.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Gébfélék",
    "latin": "Generic Gobiidae",
    "img": "assets/fish/gebfelek.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Vágódurbincs",
    "latin": "Gymnocephalus cernua",
    "img": "assets/fish/vagodurbincs.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Fenékjáró küllő",
    "latin": "Gobio gobio",
    "img": "assets/fish/fenekjaro-kullo.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Jászkeszeg",
    "latin": "Leuciscus idus",
    "img": "assets/fish/jaszkeszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Szilvaorrú keszeg",
    "latin": "Vimba vimba",
    "img": "assets/fish/szilvaorru-keszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Garda",
    "latin": "Pelecus cultratus",
    "img": "assets/fish/garda.webp",
    "ban": "04.15–05.31",
    "size": "20 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Küsz",
    "latin": "Alburnus alburnus",
    "img": "assets/fish/kusz.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Domolykó",
    "latin": "Squalius cephalus",
    "img": "assets/fish/domolyko.webp",
    "ban": "04.15–05.31",
    "size": "25 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Paduc",
    "latin": "Chondrostoma nasus",
    "img": "assets/fish/paduc.webp",
    "ban": "04.15–05.31",
    "size": "20 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Márna",
    "latin": "Barbus barbus",
    "img": "assets/fish/marna.webp",
    "ban": "04.15–05.31",
    "size": "40 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Harcsa",
    "latin": "Silurus glanis",
    "img": "assets/fish/harcsa.webp",
    "ban": "05.02–06.15",
    "size": "60 cm / helyi rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Csuka",
    "latin": "Esox lucius",
    "img": "assets/fish/csuka.webp",
    "ban": "02.01–03.31",
    "size": "40 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Fogassüllő",
    "latin": "Sander lucioperca",
    "img": "assets/fish/fogassullo.webp",
    "ban": "03.01–04.30",
    "size": "30 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Kősüllő",
    "latin": "Sander volgensis",
    "img": "assets/fish/kosullo.webp",
    "ban": "03.01–06.30",
    "size": "25 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Balin",
    "latin": "Leuciscus aspius",
    "img": "assets/fish/balin.webp",
    "ban": "03.01–04.30",
    "size": "40 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Ponty",
    "latin": "Cyprinus carpio",
    "img": "assets/fish/ponty.webp",
    "ban": "05.02–05.31",
    "size": "30 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Amur",
    "latin": "Ctenopharyngodon idella",
    "img": "assets/fish/amur.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Busafélék",
    "latin": "Hypophthalmichthys sp.",
    "img": "assets/fish/busafelek.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Kárász",
    "latin": "Carassius carassius",
    "img": "assets/fish/karasz.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Ezüstkárász",
    "latin": "Carassius gibelio",
    "img": "assets/fish/ezustkarasz.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Compó",
    "latin": "Tinca tinca",
    "img": "assets/fish/compo.webp",
    "ban": "05.02–06.15",
    "size": "25 cm",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Dévérkeszeg",
    "latin": "Abramis brama",
    "img": "assets/fish/deverkeszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Karikakeszeg",
    "latin": "Blicca bjoerkna",
    "img": "assets/fish/karikakeszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Laposkeszeg",
    "latin": "Ballerus ballerus",
    "img": "assets/fish/laposkeszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Bagolykeszeg",
    "latin": "Abramis sapa",
    "img": "assets/fish/bagolykeszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Bodorka",
    "latin": "Rutilus rutilus",
    "img": "assets/fish/bodorka.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  },
  {
    "name": "Vörösszárnyú keszeg",
    "latin": "Scardinius erythrophthalmus",
    "img": "assets/fish/vorosszarnyu-keszeg.webp",
    "ban": "Nincs általános adat / helyi rend szerint",
    "size": "Helyi/országos rend szerint",
    "info": "Leírás és horgászati megjegyzések szerkeszthetők a data.js fájlban. A tilalmi időt mindig ellenőrizd az aktuális horgászrendben."
  }
];
