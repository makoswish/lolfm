# Rift Manager

Esports-Manager im Browser im Stil von Football Manager und Esports Manager. Alle Teams, Spieler und Champions sind erfunden. Echte LoL-Namen (Riot-Marken, echte Champions, echte Profis) kommen nicht ins Spiel.

Reines HTML, CSS und JavaScript ohne Build-Schritt und ohne Abhängigkeiten. `index.html` lädt die Dateien aus `js/` der Reihe nach als normale Scripts. Alle Funktionen und Variablen liegen im globalen Scope.

## Befehle

- `node tests/run.js`: alle Tests (rund 30 s). Einzelne Tests: `node tests/run.js sim views`
- `node scripts/build-single.js`: baut `dist/rift-manager.html` als eine Datei mit eingebettetem CSS und JS
- `python3 -m http.server 8000`: lokal spielen unter http://localhost:8000

Nach jeder Änderung `node tests/run.js` laufen lassen. Neue Features bekommen einen Test in `tests/`.

## Dateien in `js/`

Die Reihenfolge in `index.html` ist wichtig: Code auf oberster Ebene (zum Beispiel `const NAVG=...` oder `Object.assign(PEV,...)`) darf nur auf Dinge zugreifen, die in früheren Dateien stehen. Funktionen dürfen sich gegenseitig beliebig aufrufen, solange der Aufruf erst zur Laufzeit passiert.

| Datei | Inhalt |
|---|---|
| 01-core | Konstanten, Regionen, Teams, Attribute, Spieler-Generator (`genPlayer`, `ovr`, `valueFor`, `salaryFor`), `newGame` |
| 02-engine | Teamstärke (`teamPower`), Draft, Match-Engine minutenweise (`newSim`, `simTick`, `finishSim`) |
| 03-season | Kalender, Turniere (`initEvent`, `step`), Wochenablauf (`weekTick`), Saisonende (`newSeason`), `save`/`load` |
| 04-ui-base | UI-Bausteine, Startbildschirm, Übersicht, Kader |
| 05-tactics | Taktik-System, Rollen, Spielstil, Vertrautheit |
| 06-views | Transfers, Turniere, Verein, Spielerseite, Co-Trainer |
| 07-match-ui | Spielvorbereitung, Draft-Ansicht, Live-Spiel |
| 08-negotiation | Transfer- und Gehaltsverhandlungen (`startNego`, `NG`) |
| 09-scene | T2-Szene, Academy, Scouting, Statistiken |
| 10-staff-training | Trainerstab, Trainingsplan, Mentoring, Kaderübersicht, Spielerbilder |
| 11-sponsors | Sponsoren-Slots, Angebote, Ziele |
| 12-content | Match-Historie, News, Auszeichnungen, Erfolge, Spieler-Ereignisse (`PEV`) |
| 13-chemistry | Teamchemie, Teamaktionen, Abwerbungen, KI-Transfers, Gegner-Anpassung |
| 14-sim | Mehrere Wochen simulieren |
| 15-savegame | Spielstand exportieren und importieren |
| 16-nav-render | Seitenleiste (`NAVG`), Postfach- und News-Seite, `render()` |
| 17-actions | Alle Klick-Aktionen (`ACT`) und Event-Listener, Spielstart |

## Wie das Spiel aufgebaut ist

- **Zustand:** Der komplette Spielstand ist das globale Objekt `S` (Teams, Spieler, Finanzen, Postfach, aktuelles Turnier `S.ev`). Gespeichert wird es als JSON in `localStorage`. Es gibt drei Speicherplätze: Platz 1 nutzt `riftmgr_v2` (alte Spielstände bleiben dort), Platz 2 und 3 `riftmgr_v2_s2` und `riftmgr_v2_s3`. `SAVEKEY` zeigt auf den aktiven Platz (`useSlot`), `riftmgr_meta` hält eine Kurzinfo pro Platz für die Liste.
- **Alte Spielstände:** Wer neue Felder einführt, setzt Standardwerte in `migrate()` (03-season). Spieler haben echte Spieler, alte Stände dürfen nie kaputtgehen. `tests/fixtures/` enthält zwei alte Stände, die der Migrationstest lädt.
- **Referenzen:** Nach dem Laden zeigen Objekte in `S.ev` nicht mehr auf dieselben Teams. `relink()`, `evBroken()` und `restartEvent()` reparieren das. Neue Turnier-Logik muss das Neuladen überstehen (der Saisontest lädt jede Woche neu).
- **Rendering:** `render()` baut die ganze Seite als HTML-String neu. Ansichten sind Funktionen, die Strings liefern, registriert in der `views`-Tabelle in `render()`. Reiter laufen über globale Variablen (`KTAB`, `TTAB`, `LTAB`, `CLUBTAB`, `TACTAB`).
- **Rückfragen:** Aktionen, die Geld kosten oder etwas löschen, rufen beim ersten Klick `askConfirm()` auf und laufen erst mit `data-ok="1"` aus dem Dialog wirklich durch.
- **Verlauf:** `render()` schreibt Ansicht und Reiter per `history.pushState` mit (`histSync`). Die Zurück-Taste führt über `histPop` zur vorherigen Seite. Während Draft, Live-Spiel, Verhandlung und Simulation bleibt die Seite stehen.
- **Klicks:** Buttons tragen `data-a="name"`. Ein globaler Listener ruft `ACT[name](dataset, element)` auf. Fehler fängt der Listener ab und zeigt eine Fehlerseite statt abzustürzen.
- **Live-Spiel:** `LIVE` hält Serie, Draft und laufendes Spiel. Während Draft und Live ist die Navigation gesperrt.
- **Talente:** Jeder Spieler hat einen Entwicklungstyp `p.dev` (f/n/s), der über `ageF()` das Training und über `growLimit()` das Saisonwachstum steuert. Talente bis 21 brauchen Spielpraxis: `youthSeason()` verschiebt zum Saisonende das Potenzial (ab 20 Spielen hoch, unter 5 runter). Fremde Spieler zeigen das Potenzial als Spanne (`potEst`, `potTxt`).
- **Leihe:** `loanOut()` schickt junge Bankspieler als Stammspieler zu einem T2-Team, `p.loan` merkt den Herkunftsverein. Leihspieler zählen über `isLoanee()` als eigene (`isMine`), stehen aber im Kader des T2-Teams. `newSeason()` holt alle zuerst zurück (`loansReturn`). Die Aktionen heißen `lend*`, weil `ACT.loan` der Kredit ist.
- **Simulation:** `simOne()` spielt eine Woche inklusive eigener Serie ohne Draft. Der Simulationsmodus ruft das in Häppchen per `setTimeout` auf.

## Balancing

Gemessen mit den Testläufen (Stand November 2026):

- 1 Punkt Teamstärke ist etwa 5 bis 6 Prozent Siegchance pro Spiel. +3 ergibt rund 68 Prozent.
- U23-Spieler wachsen etwa +3 OVR pro Saison, beim Nutzer und bei der KI gleich.
- Talente bis 21 auf der Bank verlieren 1 bis 3 Potenzial pro Saison, Stammspieler gewinnen 0 bis 2 (selten ein Durchbruch mit +3 bis +6). Über alle U22 steigt das Potenzial im Schnitt um etwa 0,4 pro Saison.
- Ablöse und Gehalt steigen ab 70 OVR überproportional. Spieler weit über dem Vereinsruf verhandeln nicht.
- Teamchemie wirkt mit -4,5 bis +3 Teamstärke. Neue Spieler brauchen etwa einen Split, bis sie eingespielt sind.
- Gegner stellen sich mit steigendem Ruf öfter auf den Spielstil des Nutzers ein.
- Die KI-Topteams werben jeden Sommer Spieler ab. Das stärkste Team einer Liga wächst in vier Saisons um etwa 6 OVR.

Ziel: Der Aufstieg zum Topteam soll mehrere Saisons dauern, wie in Football Manager. Wer am Balancing dreht, misst vorher und nachher mit mehreren Saisons im Test.

## Texte im Spiel

- Alle Texte auf Deutsch, direkt und knapp, wie ein Sportjournalist. Keine Werbesprache.
- Kein Gedankenstrich (—) in Texten.
- Überschriften in normaler Groß- und Kleinschreibung, nicht jedes Wort groß.

## Darstellung

- Dunkles Design mit CSS-Variablen in `css/style.css` (`--bg`, `--panel`, `--brass`, `--good`, `--bad` ...). `--team` ist die Farbe des eigenen Teams.
- Das Spiel muss am Handy laufen (ab 400 px Breite). Unter 900 px wird die Seitenleiste zur Leiste am unteren Rand.
