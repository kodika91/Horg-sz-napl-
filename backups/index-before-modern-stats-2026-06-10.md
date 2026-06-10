# Biztonsági mentés – modern statisztika beépítés előtt

Dátum: 2026-06-10
Repository: kodika91/Horg-sz-napl-
Fájl: index.html
Mentés előtti index.html blob SHA: 90bab590471c41cb471cbc433986d14933268641

Visszaállítási cél: ha az új statisztika modul nem válik be, az index.html visszaállítható erre az állapotra GitHub commit historyból vagy ebből a SHA állapotból.

A beépítés tervezetten külön modulban történik:
- assets/kp-mod-statistics-modern.js
- index.html csak egy új modulbetöltő sort kap

Fontos: ez a mentés nem módosítja az app adatbázisát és nem nyúl a felhasználói naplóadatokhoz.
