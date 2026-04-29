const INITIAL_DB = {
  "methods": [
    {
      "id": "method-feeder",
      "name": "Method feeder",
      "category": "Finomszerelékes fenekező",
      "note": "Method kosárral, pellet/wafter csalikkal."
    },
    {
      "id": "feeder",
      "name": "Feeder",
      "category": "Fenekező",
      "note": "Kosaras, rezgőspicces horgászat."
    },
    {
      "id": "picker",
      "name": "Picker",
      "category": "Finom feeder",
      "note": "Rövid feeder bot kisebb vizekre."
    },
    {
      "id": "fenekezo",
      "name": "Fenekező",
      "category": "Általános",
      "note": "Aljzaton felkínált csali."
    },
    {
      "id": "uszos",
      "name": "Úszós",
      "category": "Úszós",
      "note": "Álló- vagy folyóvízi úszós módszer."
    },
    {
      "id": "match",
      "name": "Matchbotos",
      "category": "Úszós",
      "note": "Távolabbi úszós horgászat matchbottal."
    },
    {
      "id": "bolognai",
      "name": "Bolognai",
      "category": "Folyóvízi úszós",
      "note": "Hosszú gyűrűs botos úsztatás."
    },
    {
      "id": "spicc",
      "name": "Spiccbotos",
      "category": "Úszós",
      "note": "Egyszerű, orsó nélküli horgászat."
    },
    {
      "id": "rakos",
      "name": "Rakós botos",
      "category": "Verseny / úszós",
      "note": "Precíz helyben horgászat rakós bottal."
    },
    {
      "id": "bojlis",
      "name": "Bojlis",
      "category": "Pontyos",
      "note": "Nagypontyos horgászat."
    },
    {
      "id": "pergetes",
      "name": "Pergetés",
      "category": "Ragadozóhalas",
      "note": "Műcsalis kereső horgászat."
    },
    {
      "id": "dropshot",
      "name": "Dropshot",
      "category": "Ragadozóhalas",
      "note": "Finom gumihalas módszer."
    },
    {
      "id": "ul",
      "name": "Ultra light / UL",
      "category": "Ragadozóhalas",
      "note": "Könnyű felszereléses pergetés."
    },
    {
      "id": "harcsazas",
      "name": "Harcsázás",
      "category": "Ragadozóhalas",
      "note": "Harcsára célzott módszer."
    },
    {
      "id": "legyezes",
      "name": "Legyezés",
      "category": "Műlegyes",
      "note": "Műlegyes horgászat."
    }
  ],
  "lines": [
    {
      "id": "fluoro-020",
      "name": "0.20 mm fluorocarbon",
      "category": "Előkezsinór",
      "note": "Óvatos halakhoz, tiszta vízhez."
    },
    {
      "id": "mono-025",
      "name": "0.25 mm monofil",
      "category": "Főzsinór",
      "note": "Általános feeder/fenekező főzsinór."
    },
    {
      "id": "braid-010",
      "name": "0.10 mm fonott",
      "category": "Főzsinór",
      "note": "Pergetéshez, jó kontakt."
    },
    {
      "id": "hooklink-012",
      "name": "0.12 mm előke",
      "category": "Előkezsinór",
      "note": "Finom úszós/feeder előke."
    }
  ],
  "hooks": [
    {
      "id": "guru-qm1-12",
      "name": "Guru QM1 – 12",
      "category": "Feeder horog",
      "note": "Method feederhez."
    },
    {
      "id": "owner-50355-12",
      "name": "Owner 50355 – 12",
      "category": "Feeder horog",
      "note": "Univerzális feeder horog."
    },
    {
      "id": "korda-wide-gape-10",
      "name": "Korda Wide Gape – 10",
      "category": "Bojlis horog",
      "note": "Bojlis előkéhez."
    }
  ],
  "baits": [
    {
      "id": "carp-expert-wafter-eper",
      "name": "Carp Expert Wafter 8mm – Eper",
      "category": "Wafter",
      "note": "Édes, pontyos csali."
    },
    {
      "id": "promix-ribbed-fokhagyma",
      "name": "Promix Ribbed Wafter – Fokhagyma",
      "category": "Wafter",
      "note": "Fokhagymás ízesítés."
    },
    {
      "id": "sbs-wafter-ananasz",
      "name": "SBS Wafter 6mm – Ananász",
      "category": "Wafter",
      "note": "Világos, gyümölcsös csali."
    }
  ],
  "groundbaits": [
    {
      "id": "promix-method-edes",
      "name": "Promix Method Mix – Édes",
      "category": "Method mix",
      "note": "Method feederhez."
    },
    {
      "id": "hallisztes-method",
      "name": "Hallisztes method mix",
      "category": "Method mix",
      "note": "Ponty/amur irány."
    }
  ],
  "accessories": [
    {
      "id": "method-kosar-30",
      "name": "30 g method kosár",
      "category": "Ólom / kosár",
      "note": ""
    },
    {
      "id": "gyorskapocs",
      "name": "Gyorskapocs",
      "category": "Aprócikk",
      "note": ""
    },
    {
      "id": "gubancgatlo",
      "name": "Gubancgátló",
      "category": "Aprócikk",
      "note": ""
    }
  ]
};
const FISH_DATA = [
  {
    "id": "selymes-durbincs",
    "name": "Selymes durbincs",
    "latin": "Gymnocephalus schraetser",
    "image": "assets/fish/selymes-durbincs.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "leanykoncer",
    "name": "Leánykoncér",
    "latin": "Rutilus pigus virgo",
    "image": "assets/fish/leanykoncer.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "lapi-poc",
    "name": "Lápi póc",
    "latin": "Umbra krameri",
    "image": "assets/fish/lapi-poc.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "penzes-per",
    "name": "Pénzes pér",
    "latin": "Thymallus thymallus",
    "image": "assets/fish/penzes-per.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "suitasos-kusz",
    "name": "Suitásos küsz",
    "latin": "Alburnoides bipunctatus",
    "image": "assets/fish/suitasos-kusz.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "halvanyfoltu-kullo",
    "name": "Halványfoltú küllő",
    "latin": "Gobio albipinnatus",
    "image": "assets/fish/halvanyfoltu-kullo.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "magyar-buco",
    "name": "Magyar bucó",
    "latin": "Zingel zingel",
    "image": "assets/fish/magyar-buco.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "nemet-buco",
    "name": "Német bucó",
    "latin": "Zingel streber",
    "image": "assets/fish/nemet-buco.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "pontys-kusz",
    "name": "Pontys küsz",
    "latin": "Leuciscus idus",
    "image": "assets/fish/pontys-kusz.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "suger",
    "name": "Sügér",
    "latin": "Perca fluviatilis",
    "image": "assets/fish/suger.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "menyhal",
    "name": "Menyhal",
    "latin": "Lota lota",
    "image": "assets/fish/menyhal.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "angolna",
    "name": "Angolna",
    "latin": "Anguilla anguilla",
    "image": "assets/fish/angolna.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "sebes-pisztrang",
    "name": "Sebes pisztráng",
    "latin": "Salmo trutta",
    "image": "assets/fish/sebes-pisztrang.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "szivarvanyos-pisztrang",
    "name": "Szivárványos pisztráng",
    "latin": "Oncorhynchus mykiss",
    "image": "assets/fish/szivarvanyos-pisztrang.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "pataki-szajbling",
    "name": "Pataki szajbling",
    "latin": "Salvelinus fontinalis",
    "image": "assets/fish/pataki-szajbling.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "torpeharcsa",
    "name": "Törpeharcsa",
    "latin": "Ameiurus nebulosus",
    "image": "assets/fish/torpeharcsa.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "naphal",
    "name": "Naphal",
    "latin": "Lepomis gibbosus",
    "image": "assets/fish/naphal.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "razbora",
    "name": "Razbóra",
    "latin": "Pseudorasbora parva",
    "image": "assets/fish/razbora.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "jaszkeszeg",
    "name": "Jászkeszeg",
    "latin": "Leuciscus idus",
    "image": "assets/fish/jaszkeszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "szilvaorru-keszeg",
    "name": "Szilvaorrú keszeg",
    "latin": "Vimba vimba",
    "image": "assets/fish/szilvaorru-keszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "garda",
    "name": "Garda",
    "latin": "Pelecus cultratus",
    "image": "assets/fish/garda.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "kusz",
    "name": "Küsz",
    "latin": "Alburnus alburnus",
    "image": "assets/fish/kusz.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "domolyko",
    "name": "Domolykó",
    "latin": "Squalius cephalus",
    "image": "assets/fish/domolyko.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "paduc",
    "name": "Paduc",
    "latin": "Chondrostoma nasus",
    "image": "assets/fish/paduc.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "marna",
    "name": "Márna",
    "latin": "Barbus barbus",
    "image": "assets/fish/marna.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "harcsa",
    "name": "Harcsa",
    "latin": "Silurus glanis",
    "image": "assets/fish/harcsa.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "csuka",
    "name": "Csuka",
    "latin": "Esox lucius",
    "image": "assets/fish/csuka.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "fogassullo",
    "name": "Fogassüllő",
    "latin": "Sander lucioperca",
    "image": "assets/fish/fogassullo.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "kosullo",
    "name": "Kősüllő",
    "latin": "Sander volgensis",
    "image": "assets/fish/kosullo.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "balin",
    "name": "Balin",
    "latin": "Leuciscus aspius",
    "image": "assets/fish/balin.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "ponty",
    "name": "Ponty",
    "latin": "Cyprinus carpio",
    "image": "assets/fish/ponty.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "amur",
    "name": "Amur",
    "latin": "Ctenopharyngodon idella",
    "image": "assets/fish/amur.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "busafelek",
    "name": "Busafélék",
    "latin": "Hypophthalmichthys sp.",
    "image": "assets/fish/busafelek.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "karasz",
    "name": "Kárász",
    "latin": "Carassius carassius",
    "image": "assets/fish/karasz.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "ezustkarasz",
    "name": "Ezüstkárász",
    "latin": "Carassius gibelio",
    "image": "assets/fish/ezustkarasz.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "compo",
    "name": "Compó",
    "latin": "Tinca tinca",
    "image": "assets/fish/compo.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "deverkeszeg",
    "name": "Dévérkeszeg",
    "latin": "Abramis brama",
    "image": "assets/fish/deverkeszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "karikakeszeg",
    "name": "Karikakeszeg",
    "latin": "Blicca bjoerkna",
    "image": "assets/fish/karikakeszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "laposkeszeg",
    "name": "Laposkeszeg",
    "latin": "Ballerus ballerus",
    "image": "assets/fish/laposkeszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "bagolykeszeg",
    "name": "Bagolykeszeg",
    "latin": "Abramis sapa",
    "image": "assets/fish/bagolykeszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "bodorka",
    "name": "Bodorka",
    "latin": "Rutilus rutilus",
    "image": "assets/fish/bodorka.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  },
  {
    "id": "vorosszarnyu-keszeg",
    "name": "Vörösszárnyú keszeg",
    "latin": "Scardinius erythrophthalmus",
    "image": "assets/fish/vorosszarnyu-keszeg.jpg",
    "status": "Ellenőrizendő",
    "closedSeason": "Helyi és országos horgászrend szerint ellenőrizendő",
    "minSize": "",
    "dailyLimit": "",
    "description": "Tudásbázis adatlap. A pontos tilalmi időt és méretkorlátozást a hatályos országos és helyi horgászrend alapján kell véglegesíteni."
  }
];
const WATER_DATA = [
  {
    "id": "csatorna",
    "name": "Csatorna",
    "subtitle": "Canalis generalis",
    "image": "assets/water/csatorna.jpg",
    "coords": ""
  },
  {
    "id": "balaton",
    "name": "Balaton",
    "subtitle": "Pannonia centralis",
    "image": "assets/water/balaton.jpg",
    "coords": ""
  },
  {
    "id": "tisza-to",
    "name": "Tisza-tó",
    "subtitle": "Lacus ad Tisam",
    "image": "assets/water/tisza-to.jpg",
    "coords": ""
  },
  {
    "id": "derito-to",
    "name": "Derítő-tó",
    "subtitle": "Lacus Tatensis",
    "image": "assets/water/derito-to.jpg",
    "coords": ""
  },
  {
    "id": "rsd",
    "name": "RSD",
    "subtitle": "Oxbow-Duna",
    "image": "assets/water/rsd.jpg",
    "coords": ""
  },
  {
    "id": "felso-duna",
    "name": "Felső Duna",
    "subtitle": "Alveus Superior Duna",
    "image": "assets/water/felso-duna.jpg",
    "coords": ""
  },
  {
    "id": "kozep-tisza",
    "name": "Közép-Tisza",
    "subtitle": "Alveus Mediocris Tisa",
    "image": "assets/water/kozep-tisza.jpg",
    "coords": ""
  },
  {
    "id": "palotasi-viztarozo",
    "name": "Palotási víztározó",
    "subtitle": "Lacus Palotasiensis",
    "image": "assets/water/palotasi-viztarozo.jpg",
    "coords": ""
  },
  {
    "id": "banyato",
    "name": "Bányató",
    "subtitle": "Quarrium Pond",
    "image": "assets/water/banyato.jpg",
    "coords": ""
  },
  {
    "id": "hegyi-patak",
    "name": "Hegyi patak",
    "subtitle": "Rivulus Montanus",
    "image": "assets/water/hegyi-patak.jpg",
    "coords": ""
  },
  {
    "id": "intenziv-viz",
    "name": "Intenzív víz",
    "subtitle": "Aqua Intensa",
    "image": "assets/water/intenziv-viz.jpg",
    "coords": ""
  },
  {
    "id": "holtag",
    "name": "Holtág",
    "subtitle": "Alveus Mortuus",
    "image": "assets/water/holtag.jpg",
    "coords": ""
  },
  {
    "id": "keleti-focsatorna",
    "name": "Keleti-főcsatorna",
    "subtitle": "Canalis Magnus Orientalis",
    "image": "assets/water/keleti-focsatorna.jpg",
    "coords": ""
  },
  {
    "id": "nyugati-focsatorna",
    "name": "Nyugati-főcsatorna",
    "subtitle": "Canalis Magnus Occidentalis",
    "image": "assets/water/nyugati-focsatorna.jpg",
    "coords": ""
  },
  {
    "id": "harmas-koros",
    "name": "Hármas-Körös",
    "subtitle": "Crisius Triplex",
    "image": "assets/water/harmas-koros.jpg",
    "coords": ""
  },
  {
    "id": "bodrog",
    "name": "Bodrog",
    "subtitle": "Bodrogus",
    "image": "assets/water/bodrog.jpg",
    "coords": ""
  },
  {
    "id": "raba",
    "name": "Rába",
    "subtitle": "Arrabo",
    "image": "assets/water/raba.jpg",
    "coords": ""
  },
  {
    "id": "ipoly",
    "name": "Ipoly",
    "subtitle": "Ipolya",
    "image": "assets/water/ipoly.jpg",
    "coords": ""
  },
  {
    "id": "sajo",
    "name": "Sajó",
    "subtitle": "Sajus",
    "image": "assets/water/sajo.jpg",
    "coords": ""
  },
  {
    "id": "zala",
    "name": "Zala",
    "subtitle": "Salanus",
    "image": "assets/water/zala.jpg",
    "coords": ""
  },
  {
    "id": "duna-kozep-szakasz",
    "name": "Duna (Közép-szakasz)",
    "subtitle": "Medio Alveus Duna",
    "image": "assets/water/duna-kozep-szakasz.jpg",
    "coords": ""
  },
  {
    "id": "tisza-also-szakasz",
    "name": "Tisza (Alsó-szakasz)",
    "subtitle": "Inferior Alveus Tisa",
    "image": "assets/water/tisza-also-szakasz.jpg",
    "coords": ""
  },
  {
    "id": "muraszombat-duna",
    "name": "Muraszombat Duna",
    "subtitle": "Duna-Drava-Mura",
    "image": "assets/water/muraszombat-duna.jpg",
    "coords": ""
  },
  {
    "id": "gerecse-patak",
    "name": "Gerecse Patak",
    "subtitle": "Rivulus Gerecsensis",
    "image": "assets/water/gerecse-patak.jpg",
    "coords": ""
  }
];
