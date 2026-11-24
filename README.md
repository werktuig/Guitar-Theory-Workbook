# Guitar Theory Workbook

Interactive practice and test pages for the 116-lesson YouTube course *Music Theory for Guitar* by
[Move Forward Guitar](https://www.youtube.com/@Moveforwardguitar). The lessons are grouped into 28 parts (packs).
Each lesson has:

- **Practice**: endless generated exercises with hints and explanations, filtered by exercise-type chips (multi-select).
- **Test**: 15 questions, pass mark 13, with a review of every mistake. Each part ends with a 20-question final (pass mark 17).
- A clickable, audible fretboard, a link to the lesson video and lesson notes.

| Part | Lessons | Topic |
|---|---|---|
| 1 | 1–3 | Intervals |
| 2 | 4–6 | Octaves, unisons & note names |
| 3 | 7–11 | The major scale |
| 4 | 12–15 | Keys, sharps & flats |
| 5 | 16–20 | Triads |
| 6 | 21–24 | Triad shapes & inversions |
| 7 | 25–28 | Diatonic triads & progressions |
| 8 | 29–31 | Open triads & the harmonized scale |
| 9 | 32–36 | 7th chords & drop voicings |
| 10 | 37–41 | Diminished 7ths & harmonized 7th chords |
| 11 | 42–44 | 7th-chord progressions & relative minor |
| 12 | 45–47 | Shell voicings & drop 2&4 |
| 13 | 48–52 | I, ii and iii chords |
| 14 | 53–57 | IV, V, vi and vii chords |
| 15 | 58–62 | Sus, power & slash chords |
| 16 | 63–67 | Borrowed chords, secondary dominants & blues |
| 17 | 68–71 | Modulation & the modes |
| 18 | 72–75 | Ionian, Dorian, Phrygian, Lydian |
| 19 | 76–80 | Mixolydian, Aeolian, Locrian & mode families |
| 20 | 81–84 | Mode patterns & soloing over chords |
| 21 | 85–87 | Soloing over progressions & modal harmony |
| 22 | 88–91 | Pentatonic scales |
| 23 | 92–95 | Advanced pentatonics |
| 24 | 96–98 | Arpeggios & blues scales |
| 25 | 99–103 | Melodic & harmonic minor |
| 26 | 104–108 | Diminished scales |
| 27 | 109–112 | Dim7, whole tone & augmented |
| 28 | 113–116 | Upper intervals & chord synonyms |

Live site: https://werktuig.github.io/Guitar-Theory-Workbook/ (GitHub Pages, served from `docs/`).
Also published as claude.ai artifacts, see `artifacts.json`.

## Layout

```
src/head.html     Shared page template and ALL styling (CSS variables at the top: colours, fonts)
src/core_a.js     Shared theory helpers: notes, intervals, keys, chord/scale/mode spelling, voicing finder, diatonic harmony
src/core_b.js     Shared engine: fretboard drawing, audio, practice/test flow, chips, scoring, video links
src/partN.js      One lesson pack per part: question generators (LS), tab order (ORDER), storage key (STORE), lesson notes (NOTES)
src/parts.json    Titles, intros and lesson ranges per part
videos.json       Lesson number -> YouTube video id
nav.json          Part number -> published URL (used for the cross-links between parts)
build.py          Builds dist/partN.html (claude.ai artifacts) and docs/ (GitHub Pages site with index.html)
scripts/          check.js (invariants), sample.js / sample1.js (dump generated questions for review), ui_test.py (headless browser test)
SPEC.md           The authoring spec every lesson pack follows
```

## Build and test

```sh
python3 build.py            # all parts -> dist/
python3 build.py 5 6        # only some parts
node scripts/check.js part5.js      # must end with "ALL OK"
node scripts/sample1.js part5.js    # one sample of every question type, for a theory read-through
python3 scripts/ui_test.py 5        # needs: pip install playwright && playwright install chromium
```

`check.js` generates thousands of questions per generator and verifies that every answer is among the choices,
there are no duplicate choices, every mark/target is on the board, nothing renders as `undefined`, and so on.

## Changing the look

All styling lives in `src/head.html`. Change it once, run `python3 build.py`, and republish the pages.
