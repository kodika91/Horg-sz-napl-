# Biztonsági mentés – modern felszerelés nézet beépítés előtt

Dátum: 2026-06-10
Repository: kodika91/Horg-sz-napl-
Fájl: index.html
Mentés előtti index.html blob SHA: e1b298ff0245507d5f7886943d310b787c860b1d

Visszaállítási cél: ha a modern felszerelés nézet nem válik be, az index.html visszaállítható erre az állapotra GitHub commit historyból vagy ebből a SHA állapotból.

A beépítés tervezetten külön modulban történik:
- assets/kp-mod-gear-modern.js
- index.html csak egy új modulbetöltő sort kap

Fontos: ez a mentés nem módosítja az app adatbázisát és nem nyúl a felhasználói naplóadatokhoz.
