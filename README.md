# Rift Manager

Esports-Manager im Browser. Du übernimmst eine Organisation in einer von sechs Regionen, stellst den Kader zusammen, planst Training und Taktik, verhandelst Transfers und führst dein Team durch drei Splits, First Stand, MSI, den Demacia Cup und Worlds.

Alle Teams, Spieler und Champions sind erfunden.

## Spielen

- Online über GitHub Pages (Link siehe rechts unter „About“ beziehungsweise in den Repository-Einstellungen unter „Pages“)
- Lokal: Ordner öffnen und `python3 -m http.server 8000` starten, dann http://localhost:8000 aufrufen

Der Spielstand liegt im Browser. Unter Büro → Spielstand kannst du ihn exportieren und auf einem anderen Gerät wieder importieren.

## Entwickeln

- Tests: `node tests/run.js`
- Eine Datei zum Weitergeben bauen: `node scripts/build-single.js` erzeugt `dist/rift-manager.html`

Aufbau und Konventionen stehen in `CLAUDE.md`.
