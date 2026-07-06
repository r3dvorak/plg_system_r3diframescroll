# AGENTS.md

Lokale Arbeitsregeln fuer `plg_system_r3diframescroll`.

## Source of Truth

- `project.json` ist die zentrale Metadatenquelle fuer Name, Slug, Artefaktbasis, Version, Autor, Release-URL und Pfade.
- Das Manifest in `01_src/plg_system_r3diframescroll/r3diframescroll.xml` und der PHP-Header muessen zur Version aus `project.json` passen.
- Die Joomla-Update-URL fuer dieses Plugin ist `https://extensions.r3d.de/joomlaextensions/updates/plg_system_r3diframescroll.xml`.

## Verbindliche Release-Regeln

- Keine Veroeffentlichung ohne echten FTP-Upload.
- Keine Phoca-Doppelanlage.
- Wenn eine vorhandene Phoca File ID existiert, muss exakt diese ID aktualisiert werden.
- Wenn keine File ID existiert, wird der neue Eintrag bewusst und dokumentiert angelegt.
- Keine `r3dcomments`-IDs, URLs, Dateinamen oder Kategorien uebernehmen.
- Keine Sprachvariante raten. Fuer diesen Releasepfad ist `en` die Standard-Release-Sprache, weitere Sprachen nur nach expliziter Pruefung.
- Vor scharfem Upload immer Dry-Run oder eine explizite Pruefung ausfuehren.
- ZIP, Update-XML und Phoca-Eintrag muessen dieselbe Version tragen.
- Update-XML und ZIP muessen nach dem Upload per HTTP erreichbar und pruefbar sein.

## Projektstruktur

- `01_src/`: Quellcode
- `02_build/`: Build-Zwischenstand
- `03_docs/`: lokale Logs und Notizen
- `04_dist/`: installierbare ZIPs
- `05_updates/`: lokales Update-XML und Release-Plan-Artefakte
- `scripts/`: Release- und Pruefscripte fuer dieses Plugin

## Build- und Publish-Workflow

- Erst `scripts/build-release-r3diframescroll.ps1` oder direkt `D:/1DEV/_tools/04-build-extension.ps1`.
- Danach `scripts/verify-extension-archive-paths.ps1`.
- Fuer Phoca- und Update-Server-Publish zuerst Dry-Run mit `D:/1DEV/_tools/31-create-download.ps1` und `D:/1DEV/_tools/32-publish-updateserver.ps1`.
- Beim echten Publish FTP-Upload, HTTP-Pruefung und Phoca-Update-Log sichern.

## Repo-Hygiene

- Nicht committen: `02_build/`, `03_docs/`, `04_dist/`, `05_updates/`, `.env`, `.env.*`.
- Committen: `01_src/`, `scripts/`, `README.md`, `CHANGELOG.md`, `project.json`, `.gitignore`, `AGENTS.md`.

## Sicherheitsregeln

- Jede PHP-Datei beginnt mit `defined('_JEXEC') or die;`.
- Keine Geheimnisse in Commit-Dateien ablegen.
- Vor Upload oder Phoca-Update jede Ziel-URL explizit pruefen.
