# Lesson-pack spec (Guitar theory workbook)

You are writing **lesson packs** for an interactive guitar-theory workbook that accompanies the YouTube course
"Music Theory for Guitar" (116 lessons; we only know the lesson TITLES, not the video content). Each pack is one
web page covering 3–5 lessons. Per lesson the learner gets **Practice** (exercises with hints and explanations,
filtered by "chips") and a **Test** (15 questions, pass mark 13). Each pack ends with a **Final** tab (20 mixed questions).

A shared engine already exists. **You write exactly one file per pack: `/home/claude/src/partN.js`.**
Do NOT edit any other file (core_a.js, core_b.js, head.html, build.py, check.js, parts.json, other parts).
If you need a helper, define it inside your own part file.

Study these finished packs first — they are the model for structure, tone and quality:
`/home/claude/src/part3.js` and `/home/claude/src/part4.js` (also part1.js, part2.js).
Read `/home/claude/src/core_a.js` fully: it lists every helper you may use.

## What your file must define (top-level `const`s, no exports, plain browser JS, no imports)

```js
const LS={ <lessonKey>:{h,n,title,sub,ex,test}, ..., final:{...} };
const ORDER=['<lessonKey>',...,'final'];
const STORE='gi-best-pN';          // N = your part number
const NOTES={ <lessonKey>:`<html>`, ..., final:`<html>` };
```
- `h`: URL hash, unique within the pack, lowercase ascii letters/digits/hyphens (e.g. 'major-triads'). Never: settings, sidebar, customize, upgrade, downloads, anything starting 'comment'.
- `n`: 'Lesson 16' etc. (final: 'Final'). `title`: short lesson title (≤ 32 chars). `sub`: one sentence.
- `ex`: 2–4 chips: `[['Chip label',[genA,genB]], ...]`. The engine adds "Mix all". Chips can be multi-selected.
- `test`: array of EXACTLY 15 generator functions for each lesson (use `rep(gen,n)`), EXACTLY 20 for final (mix all lessons).
- Your file is concatenated after core_a.js and before core_b.js inside one `{ }` block. Do not redeclare any name
  that exists in core_a.js or core_b.js (check!). core_b.js declares: ac, pluck, play, cur, mode, sel, q, done, picked,
  st, T, showHint, best, $, prep, gen, autoplay, newQ, startTest, setLesson, ansLabel, answer, next, X, Y, BASE, CELLS,
  board, same, render, result, fromHash. Avoid all of those names.

## Question objects (each generator is a zero-arg function returning one fresh random question)

Common fields:
- `type`: 'choice' | 'click' | 'multi'
- `key`: string used to avoid repeats in a test (a test draws `rep(gen,n)` with distinct keys when possible). Make it encode the
  meaningful variables (e.g. `'tq'+root+qual`). A generator used n times in a test must be able to produce ≥ n+3 distinct keys.
- `text`: the prompt (plain text, no HTML). Must stand alone: name the key / root / string / chord explicitly.
- `explain`: shown after answering in practice and in the test review. TEACH: give the reasoning and the full answer (spelled notes, frets). HTML allowed but plain is fine.
- `hint`: shown on request in practice. Points the way, never states the answer.
- `notes`: optional array of MIDI numbers to play (use `midi(s,f)`); `pm`: 'seq' for scales/melodies (no chord at end), 'chord' to strum only; omit for intervals/arpeggio+strum.
- `hide`: true for ear-training (marks hidden until answered; audio autoplays).
- `noBoard`: true for pure-theory questions (then no marks). Fretboard hidden.
- `marks`: array `{s,f,t,k}` drawn on the board. s = string 0..5 (0 = low E, 5 = high e), f = fret 0..15, t = short label (≤ 3 chars, e.g. 'R','3','♭7','?'), k = 'root' | 'q' | 'ghost'.
- `box`: optional `[loFret,hiFret]` shaded region.
- `reveal`: optional marks `{s,f,t}` shown (green) after answering.

Type specifics:
- choice: `choices` (2–4 strings, build with `mc(ans, distractorPool)` which dedupes/shuffles and returns ≤4), `ans` (must be in choices).
- click: `target:{s,f,t?}`; learner clicks one fret. Target must not coincide with a mark.
- multi: `targets:[{s,f,t?}]`; learner clicks all of them (a wrong click ends it). No target on a mark. Keep it ≤ 8 targets
  for tests (the learner must click each one); up to ~16 is OK only for a dedicated practice chip.

Quality rules:
- **At least half of each lesson's generators must use the fretboard** (click / multi / choice with marks). This is a GUITAR workbook.
  Pure theory → `noBoard:true`. Good fretboard tasks: click the chord tones of a voicing on a string set, name a shape shown on the board,
  click every ♭7 in a box, find the root of a shown voicing, identify inversion from marks, play a scale on one string, etc.
- Always use letter-correct spelling: `spellF`, `chordNotes`, `scaleNotes`, `spellScale`, `diatonic`. Use `NN`/`NN2` only when no key/chord context exists.
  Keys: use `KEASY` (12 keys) for random roots unless the lesson needs others. Avoid roots that create double sharps/flats
  in your chord/scale unless that is the point (check outputs!).
- Distractors must be plausible and WRONG (never another correct answer; e.g. for "which chord contains E and G" make sure distractors don't).
- One concept per question. Prompts concise. British/US spelling consistent with existing packs ("practise" verb, "colour" ok).
- No song lyrics; avoid song references altogether.
- Theory must be standard and correct. When the lesson title is ambiguous, choose the mainstream interpretation and state the
  assumption in that lesson's NOTES (one short "small" line).
- Voicings on the board must be physically playable: use `voicing(strings, pcsLowToHigh, lo, hi, span)` (span 4 = max 4-fret stretch).
  Adjacent-string voicings with span ≤ 4 keep pitch order = string order, so pass the pitch classes in the low→high order you want
  (that is how you build inversions, drop 2, drop 3, shells). Check it returned non-null; retry with new random values otherwise.
- Every generator must succeed (loop with retries; never return undefined; no infinite recursion).

## NOTES html (per tab), same structure as part3/part4:
```html
<div class="cols"><div><h3>...</h3> table or list </div>
<div><h3>Key ideas</h3><ul>3–5 li</ul><h3 style="margin-top:22px">On your guitar</h3><ul>2–4 concrete practice tasks</ul></div></div>
```
Tables: `<table class="stack">` with `<thead>` if ≤ 4 columns; wider tables inside `<div class="scroll"><table>`. Generate tables from helpers
(e.g. `diatonic('C','major',4).map(...)`) so they are correct. Optional `<p class="small">` for assumptions. Final tab: what the final covers
(20 questions, pass mark 17) and what comes next in the course (next lesson title).

## Theory anchors (follow these conventions)
- Roman numerals: `romanOf(deg,quality)` → I ii iii IV V vi vii°; 7ths: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7. Flat-side borrowed: ♭III ♭VI ♭VII, iv (write them yourself).
- Chord families: tonic I iii vi; subdominant (predominant) ii IV; dominant V vii°.
- Secondary dominant V7/x = dominant 7th a P5 above x (V7/ii in C = A7). 12-bar blues: I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7 (turnaround) — mention the quick-change variant only as a variant.
- Find the key of a progression: collect the notes / match chords to one major key's diatonic set; V7 points to the key a P5 below.
- Relative minor = 6th degree of the major key (relMinor). Same notes, different home.
- Close position 7th = notes within one octave (1 3 5 7 stacked). Drop 2 = drop the 2nd-highest note of a close voicing an octave (adjacent sets [0,1,2,3],[1,2,3,4],[2,3,4,5]).
  Drop 3 = drop the 3rd-highest (sets with a skipped string: [0,2,3,4] and [1,3,4,5]). Drop 2&4 = drop both 2nd and 4th highest (usual set [0,1,3,4] or [1,2,4,5]... verify with voicing()).
  Shell voicing = root + 3rd + 7th (5th omitted), usually root on low E or A string: R-7-3 (root E string: [0,2,3]) or R-3-7 ([0,1,2]/[1,2,3]).
- Diminished 7th is symmetrical: each inversion is another dim7 (minor-3rd spacing, moving any shape 3 frets gives the same chord's notes). Maj7→dim7: lower each chord tone in turn etc.: interpret as "how changing one note at a time turns maj7 into 7, m7, m7♭5, °7".
- Modes of the major scale: Ionian, Dorian (♮6), Phrygian (♭2), Lydian (♯4), Mixolydian (♭7), Aeolian (♭6), Locrian (♭2 ♭5). Brightness order: Lydian > Ionian > Mixolydian > Dorian > Aeolian > Phrygian > Locrian.
  Series = all modes from the same parent scale (C Ionian, D Dorian, E Phrygian…). Parallel = same root, different modes (C Ionian, C Dorian…).
  Major modes: Ionian, Lydian, Mixolydian. Minor modes: Dorian, Phrygian, Aeolian (Locrian = diminished).
  Chord-scale: maj7 → Ionian/Lydian; dom7 → Mixolydian; m7 → Dorian/Aeolian/Phrygian; m7♭5 → Locrian.
- Pentatonics: major 1 2 3 5 6, minor 1 ♭3 4 5 ♭7, relative (A minor pent = C major pent). Minor pent over m7♭5: play the minor pentatonic built on the ♭3 of the chord (Bm7♭5 → D minor pentatonic). Blues scale = minor pent + ♭5; major blues = major pent + ♭3.
- Melodic minor (ascending/jazz) 1 2 ♭3 4 5 6 7; modes: melodic minor, Dorian ♭2, Lydian augmented, Lydian dominant, Mixolydian ♭6, Locrian ♮2, altered (super Locrian). Its chords (7ths): m(maj7), m7, +maj7, 7, 7, m7♭5, m7♭5.
- Harmonic minor 1 2 ♭3 4 5 ♭6 7; modes: harmonic minor, Locrian ♮6, Ionian ♯5, Dorian ♯4, Phrygian dominant, Lydian ♯2, super Locrian ♭♭7. 7th chords: m(maj7), m7♭5, +maj7, m7, 7, maj7, °7 (verify with diatonic(root,'harmMinor',4)).
- Whole-half diminished (1 2 ♭3 4 ♭5 ♯5 6 7) fits dim7 chords; half-whole (1 ♭2 ♯2 3 ♯4 5 6 ♭7) fits dominant 7♭9. Only 3 distinct diminished scales; symmetric every minor 3rd.
  Harmonized whole tone → augmented triads (and 7♯5) only; 2 distinct whole-tone scales. Augmented triad is symmetric (3 names); dim7 symmetric (4 names).
- Chord synonyms: same notes, different names: Am7 = C6, Bm7♭5 = Dm6, F♯m7♭5 = Am6, C6/9 etc.; dim7 and aug have several roots.
- Stacked-interval chords: stacked 3rds (tertian), stacked 4ths (quartal), stacked 5ths (quintal). Upper interval shapes = 9ths, 11ths, 13ths as shapes from a root (see part3 lesson 10).

## Verify before you finish (mandatory)
1. `cd /home/claude && node check.js partN.js` → must end with `ALL OK`. Fix every failure.
2. `node sample.js partN.js > /tmp/sN.txt` and READ all of it carefully as a music-theory teacher would: wrong spellings,
   wrong answers, wrong frets, misleading explanations, giveaway hints, awkward grammar ("a octave"), duplicate choices that are
   both correct. Use `art(word)` for a/an before interval names. Fix and repeat.
3. `python3 build.py N && python3 ui_test.py N` → must print `errors []` and `mobile scrollW 375`. (Do not change these scripts.)
4. Final reply (short): lessons covered, list of generators per lesson (one line each), assumptions about ambiguous lesson titles,
   anything you were unsure about theoretically. Do not paste code.
