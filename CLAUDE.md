# Maintaining the Guitar Theory Workbook

- Source of truth is this repo. Edit `src/` (shared styling in `src/head.html`, shared engine in `src/core_a.js` / `src/core_b.js`, lesson content in `src/partN.js`), never the built files in `dist/` by hand.
- After any change: `python3 build.py [N ...]`, then `node scripts/check.js partN.js` (must end with `ALL OK`) for every touched part, and `python3 scripts/ui_test.py N` (must print `errors []` and `mobile scrollW 375`). A change to `src/core_*.js` or `src/head.html` touches all 28 parts.
- New or changed questions: read `node scripts/sample1.js partN.js` output as a theory teacher before shipping. Follow `SPEC.md`.
- Commit the source and the rebuilt `dist/` and `docs/` together, then push. `docs/` is the GitHub Pages site (main branch, /docs folder); pushing updates it.
- The live pages are claude.ai artifacts listed in `artifacts.json` (slug + URL per part). Republish a changed part by uploading `dist/partN.html` as `index.html` to its slug (get the current version first). Keep `nav.json` in step with `artifacts.json`.
- Lesson videos are mapped in `videos.json` (lesson number → YouTube id, channel Move Forward Guitar).
