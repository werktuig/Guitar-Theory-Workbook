/* ===== Part 2: lessons 4–6 ===== */

/* ---------- Lesson 4: octaves ---------- */
function oPick(){for(let k=0;k<80;k++){const s1=R(0,5),up=Math.random()<.6,sp=pick([0,2,3]),s2=s1+(up?sp:-sp);if(s2<0||s2>5)continue;const f=R(0,15),t=shapeFret(s1,f,s2,up?12:-12);if(t>=0&&t<=15)return{s1,s2,f,t,up}}return{s1:0,s2:2,f:5,t:7,up:true}}
const oExp=(s1,s2,f,t,up)=>{const lo=Math.min(s1,s2),hi=Math.max(s1,s2);
  if(s1===s2)return`Same string: an octave is 12 frets ${up?'higher':'lower'}, fret ${t}.`;
  return`An octave is 12 semitones. The ${SN[lo]} and ${SN[hi]} strings are ${Math.abs(gap(s1,s2))} semitones apart, so the octave sits ${offTxt(t-f)} on the ${SN[s2]} string: fret ${t}.${crossGB(lo,hi)?' The shape crosses the G–B pair, so it is one fret different from the same shape on the low strings.':''}`};
function oBuild(){const{s1,s2,f,t,up}=oPick();
  return{type:'click',key:`ob${s1}${s2}${up}`,text:`Root: ${where(s1,f)}. Click the octave ${up?'above':'below'} it on the ${SN[s2]} string.`,marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:t},notes:[midi(s1,f),midi(s2,t)],hint:s1===s2?'Same string: 12 frets.':`Two strings up = 2 frets higher; three strings up = 3 frets lower. Add 1 fret when the shape crosses from G to B.`,explain:oExp(s1,s2,f,t,up)}}
function oRule(){const sp=pick([2,3]),s1=R(0,5-sp),s2=s1+sp,d=12-gap(s1,s2);
  return{type:'choice',key:`or${s1}${s2}`,noBoard:false,text:`Root on the ${SN[s1]} string. The octave on the ${SN[s2]} string (${sp} strings up) is…`,marks:[{s:s1,f:5,t:'R',k:'root'}],reveal:[{s:s2,f:5+d,t:'8'}],choices:mc(offTxt(d),[d-2,d-1,d+1,d+2,-d].map(offTxt)),ans:offTxt(d),notes:[midi(s1,5),midi(s2,5+d)],hint:'Crossing G–B moves the shape 1 fret higher.',explain:oExp(s1,s2,5,5+d,true)}}
function oAll(){for(let k=0;k<60;k++){const s=R(0,5),f=R(0,15),m=midi(s,f),tg=[...allMidi(m+12),...allMidi(m-12)];if(tg.length>=2&&tg.length<=6)
  return{type:'multi',key:`oa${m}`,text:`Root: ${where(s,f)}. Click every octave of it: exactly 12 semitones higher or lower, on any string (frets 0–15).`,marks:[{s,f,t:'R',k:'root'}],targets:tg.map(p=>({...p,t:'8'})),notes:[m,m+12],hint:'Use the shapes: same string ±12 frets, two strings away ±2 frets, three strings away ∓3 frets (adjust by 1 across G–B).',explain:`There are ${tg.length} octaves of this ${note(s,f)} within frets 0–15: ${tg.map(posTxt).join(', ')}.`}}return oBuild()}
function oKind(){const kinds=['Unison: exactly the same pitch','Octave: same note, 12 semitones apart','Two octaves: same note, 24 semitones apart','Different notes'];
  for(let k=0;k<80;k++){const kind=R(0,3),s=R(0,5),f=R(0,15),m=midi(s,f);let c=[];
    if(kind===0)c=allMidi(m).filter(p=>p.s!==s);if(kind===1)c=[...allMidi(m+12),...allMidi(m-12)].filter(p=>p.s!==s);if(kind===2)c=[...allMidi(m+24),...allMidi(m-24)];
    if(kind===3){const s2=pick([0,1,2,3,4,5].filter(x=>x!==s)),f2=f-gap(s,s2)+pick([-1,1,-2,2]);if(f2>=0&&f2<=15)c=[{s:s2,f:f2}]}
    if(!c.length)continue;const p=pick(c),d=midi(p.s,p.f)-m;
    return{type:'choice',key:`ok${kind}${s}`,text:'How are these two notes related?',marks:[{s,f,t:'A',k:'root'},{s:p.s,f:p.f,t:'B',k:'q'}],choices:kinds.slice(),ans:kinds[kind],notes:[m,midi(p.s,p.f)],hint:'Name both notes first, then compare their pitch.',explain:`A is ${note(s,f)}, B is ${note(p.s,p.f)}: ${d===0?'the same pitch, a unison.':Math.abs(d)%12===0?`${Math.abs(d)} semitones apart, ${Math.abs(d)===12?'one octave':'two octaves'}.`:`${Math.abs(d)} semitones apart, so they are different notes.`}`}}}

/* ---------- Lesson 5: unison notes ---------- */
function uClick(){for(let k=0;k<80;k++){const s=R(0,5),f=R(0,15),s2=R(0,5);if(s2===s)continue;const t=f+OPEN[s]-OPEN[s2];if(t<0||t>15)continue;const g=OPEN[s2]-OPEN[s];
  return{type:'click',key:`uc${s}${s2}`,text:`Here is ${where(s,f)}. Click the exact same pitch on the ${SN[s2]} string.`,marks:[{s,f,t:'R',k:'root'}],target:{s:s2,f:t},notes:[midi(s,f),midi(s2,t)],hint:`The ${SN[s2]} string is tuned ${Math.abs(g)} semitones ${g>0?'higher':'lower'} than the ${SN[s]} string.`,explain:`The ${SN[s2]} string is ${Math.abs(g)} semitones ${g>0?'higher, so subtract':'lower, so add'} ${Math.abs(g)}: fret ${f} ${g>0?'−':'+'} ${Math.abs(g)} = fret ${t}.${crossGB(Math.min(s,s2),Math.max(s,s2))?' The span crosses G–B, which is a semitone narrower than the other pairs.':''}`}}}
function uAll(){for(let k=0;k<60;k++){const s=R(0,5),f=R(0,15),m=midi(s,f),tg=allMidi(m).filter(p=>p.s!==s);if(tg.length>=2)
  return{type:'multi',key:`ua${m}`,text:`Here is ${where(s,f)}. Click every other place where this exact pitch appears (frets 0–15).`,marks:[{s,f,t:'R',k:'root'}],targets:tg.map(p=>({...p,t:'='})),notes:[m],hint:'Next string up: 5 frets lower (4 across G–B). Next string down: 5 frets higher (4 across B–G).',explain:`This ${note(s,f)} also sounds at ${tg.map(posTxt).join(', ')}.`}}}
function uCount(){const s=R(0,5),f=R(0,15),m=midi(s,f),n=allMidi(m).length;
  return{type:'choice',key:`un${m}`,text:`Counting this one, how many places on frets 0–15 play exactly this pitch?`,marks:[{s,f,t:'R',k:'root'}],reveal:allMidi(m).filter(p=>p.s!==s).map(p=>({...p,t:'='})),choices:mc(String(n),['1','2','3','4','5'].filter(x=>x!==String(n))),ans:String(n),notes:[m],hint:'Look for the same pitch roughly 5 frets away on each neighbouring string.',explain:`${n} place${n>1?'s':''}: ${allMidi(m).map(posTxt).join(', ')}.`}}
const uConcept=sbank('uk',[
 ['What is a unison?','Two notes of exactly the same pitch',['Two notes with the same name, an octave apart','Two notes a half step apart','Any two notes on the same fret'],'A unison is the same pitch played twice, usually on two different strings.'],
 ['To play the same pitch on the next higher string, you move…','5 frets lower (4 if you cross from G to B)',['5 frets higher','7 frets lower','2 frets lower'],'The higher string already sounds a 4th higher, so you come back down 5 frets (4 across G–B).'],
 ['To play the same pitch on the next lower string, you move…','5 frets higher (4 if you cross from B to G)',['5 frets lower','12 frets higher','7 frets higher'],'The lower string is tuned a 4th lower, so you go up 5 frets (4 from B down to G).'],
 ['Fret 5 of the B string is in unison with…','the open high e string',['the open G string','fret 4 of the G string','fret 7 of the high e string'],'Fret 5 of B is E, the open high e. (The G string is the one that uses fret 4.)'],
 ['Fret 4 of the G string is in unison with…','the open B string',['the open high e string','fret 5 of the D string','fret 9 of the D string'],'G + 4 frets = B, the open B string. Fret 9 of the D string is also B, but an octave lower.'],
 ['Why are unisons useful on guitar?','You can play the same pitch in another position, with a different tone or fingering',['They make chords louder','They are only used for tuning','They change the key'],'Every pitch (except the very lowest and highest) lives on more than one string, so you choose where to play it.'],
 ['The same pitch can appear on at most how many strings within frets 0–15?','4',['2','3','6'],'Each string is about 5 frets from the next, so a pitch usually reaches 3 strings, and up to 4 for some middle notes across G–B.']]);

/* ---------- Lesson 6: musical alphabet & chromatic scale ---------- */
function cStep(){const pc=R(0,11),st=pick([1,2,-1,-2]),a=NN2[(pc+st+12)%12];
  const w=`${Math.abs(st)===1?'half step (1 fret)':'whole step (2 frets)'} ${st>0?'above':'below'}`;
  return{type:'choice',noBoard:true,key:`cs${pc}${st}`,text:`What note is a ${w} ${NN2[pc]}?`,choices:mc(a,[NN2[(pc+st+11)%12],NN2[(pc+st+13)%12],NN2[(pc+st+10)%12],NN2[(pc+st+14)%12]]),ans:a,hint:'The natural notes are a whole step apart, except E–F and B–C, which are a half step.',explain:`${NN2[pc]} ${st>0?'+':'−'} ${fr(Math.abs(st))} = ${a}. Remember: no sharp between E–F or B–C.`}}
function cName(){const s=R(0,5),f=R(1,15),pc=pcAt(s,f),a=NN2[pc];
  const base=f>=9?12:0,dir=f>=base?1:-1,steps=Math.abs(f-base),chain=[];for(let i=0;i<=steps;i++)chain.push(NN2[(OPEN[s]+base+dir*i+120)%12]);const fromTop=base===12;
  return{type:'choice',key:`cn${s}${f}`,text:`What note is the ? (${SN[s]} string, fret ${f})?`,marks:[{s,f,t:'?',k:'q'}],choices:mc(a,[NN2[(pc+1)%12],NN2[(pc+11)%12],NN2[(pc+2)%12],NN2[(pc+10)%12]]),ans:a,notes:[midi(s,f)],hint:fromTop?'Fret 12 is the open-string note again. Count from there.':'Count up from the open string, one fret per semitone.',explain:`${fromTop?`Fret 12 is ${SL[s].toUpperCase()} again; count ${dir>0?'up':'back'} ${fr(steps)}`:`Count up from the open ${SN[s]}`}: ${chain.join(' → ')}.`}}
function cFind(){const s=R(0,5),pc=R(0,11),tg=allPc(pc,[s]);
  return{type:'multi',key:`cf${s}${pc}`,text:`Click every ${NN2[pc]} on the ${SN[s]} string (frets 0–15).`,marks:[],targets:tg.map(p=>({...p,t:NN[pc]})),notes:tg.map(p=>midi(p.s,p.f)),hint:`Count up from the open ${SL[s].toUpperCase()}. If you find it below fret 4, it appears again 12 frets higher.`,explain:`${NN2[pc]} is at ${tg.map(p=>fretTxt(p.f)).join(' and ')} on the ${SN[s]} string. A note repeats every 12 frets.`}}
function cFindAll(){const pc=pick([0,2,4,5,7,9,11,R(0,11)]),tg=allPc(pc,[0,1]);
  return{type:'multi',key:`cF${pc}`,text:`Click every ${NN2[pc]} on the low E and A strings (frets 0–15). These are the root notes you will use most.`,marks:[],targets:tg.map(p=>({...p,t:NN[pc]})),notes:tg.map(p=>midi(p.s,p.f)),hint:'Find it on one string, then use the octave shape (two strings up, two frets higher) or count 12 frets.',explain:`${NN2[pc]}: ${tg.map(posTxt).join(', ')}.`}}
const cEnh=sbank('ce',[
 ['Another name for C♯ is…','D♭',['C♭','D♯','B♯']],['Another name for D♯ is…','E♭',['F♭','D♭','E♯']],['Another name for F♯ is…','G♭',['F♭','G♯','E♯']],['Another name for G♯ is…','A♭',['G♭','A♯','B♭']],['Another name for A♯ is…','B♭',['A♭','C♭','B♯']],
 ['E♯ is the same pitch as…','F',['E','F♯','D♯']],['B♯ is the same pitch as…','C',['B','C♯','A♯']],['F♭ is the same pitch as…','E',['F','E♭','G♭']],['C♭ is the same pitch as…','B',['C','B♭','D♭']],
 ['Which pairs of natural notes have NO note between them?','E–F and B–C',['A–B and D–E','C–D and F–G','G–A and B–C']],
 ['How many letters does the musical alphabet use?','7 (A to G)',['8','12','5']],
 ['How many different notes are in the chromatic scale?','12',['7','8','13']],
 ['Two names for the same pitch (like C♯ and D♭) are called…','enharmonic equivalents',['octaves','unisons','intervals']]].map(x=>[...x,x[0].includes('same pitch')||x[0].includes('Another')?`${x[1]} and the note in the question are the same fret on the guitar, just spelled differently.`:'Seven letters, twelve semitones: the five extra notes are the sharps/flats between the letters (none between E–F and B–C).']));
function cChrom(){const pc=R(0,11),n=R(3,9),seq=[];for(let i=0;i<n;i++)seq.push(NN2[(pc+i)%12]);const a=seq[n-1];
  return{type:'choice',noBoard:true,key:`cc${pc}${n}`,text:`Play the chromatic scale up from ${NN2[pc]} (one fret at a time). What is the ${ord(n)} note, counting ${NN2[pc]} as the 1st?`,choices:mc(a,[NN2[(pc+n)%12],NN2[(pc+n-2)%12],NN2[(pc+n+1)%12],NN2[(pc+n-3)%12]]),ans:a,hint:'Write the letters out and add a sharp between every pair except E–F and B–C.',explain:seq.join(' → ')}}

const LS={
 octaves:{h:'octaves',n:'Lesson 4',title:'Octaves',sub:'The same note, 12 semitones higher or lower, and its shapes across the strings.',
  ex:[['Build the octave',[oBuild]],['Shape rule',[oRule]],['Find all octaves',[oAll]],['Octave or unison?',[oKind]]],
  test:[...rep(oBuild,5),...rep(oRule,3),...rep(oAll,3),...rep(oKind,4)]},
 unison:{h:'unison-notes',n:'Lesson 5',title:'Unison notes',sub:'Exactly the same pitch on a different string.',
  ex:[['Same pitch elsewhere',[uClick]],['Find every unison',[uAll]],['Count them',[uCount]],['Concepts',[uConcept]]],
  test:[...rep(uClick,6),...rep(uAll,3),...rep(uCount,2),...rep(uConcept,4)]},
 alphabet:{h:'alphabet-chromatic',n:'Lesson 6',title:'Alphabet & chromatic scale',sub:'Seven letters, twelve notes, and naming any fret.',
  ex:[['Steps',[cStep]],['Name the fret',[cName]],['Find the note',[cFind,cFindAll]],['Sharps, flats & chromatic',[cEnh,cChrom]]],
  test:[...rep(cStep,3),...rep(cName,4),cFind,cFind,cFindAll,cFindAll,...rep(cEnh,2),...rep(cChrom,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 4–6 mixed. Pass this and you are ready for the major scale.',
  ex:[['Lesson 4',[oBuild,oRule,oAll,oKind]],['Lesson 5',[uClick,uAll,uCount,uConcept]],['Lesson 6',[cStep,cName,cFind,cFindAll,cEnh,cChrom]]],
  test:[oBuild,oBuild,oRule,oAll,oKind,oKind,uClick,uClick,uClick,uAll,uCount,uConcept,cStep,cName,cName,cName,cFind,cFindAll,cEnh,cChrom]}};
const ORDER=['octaves','unison','alphabet','final'],STORE='gi-best-p2';

const NOTES={
 octaves:`<div class="cols"><div><h3>Octave shapes</h3><table class="stack"><thead><tr><th>From root to…</th><th>Octave is</th><th>Across G–B</th></tr></thead><tbody>
  <tr><td>Same string</td><td>12 frets higher</td><td>—</td></tr>
  <tr><td>Two strings up</td><td>2 frets higher (E→D, A→G)</td><td>3 frets higher (D→B, G→e)</td></tr>
  <tr><td>Three strings up</td><td>3 frets lower (E→G)</td><td>2 frets lower (A→B, D→e)</td></tr>
  <tr><td>Low E → high e</td><td>Same fret = two octaves</td><td>—</td></tr></tbody></table>
  <p class="small">Going down, reverse the shape: two strings down = 2 frets lower (3 across B–G), and so on.</p></div>
  <div><h3>Key ideas</h3><ul><li>An octave is 12 semitones: same letter name, double (or half) the frequency.</li><li>Octave shapes let you find one note all over the neck quickly.</li><li>Any shape that crosses the G–B pair shifts one fret.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A at fret 5 of the low E string, then every octave of it up the neck.</li><li>Mute the string in between and strum the two-strings-up octave shape like a power chord.</li><li>Pick any note and find its octave without counting, using only shapes.</li></ul></div></div>`,
 unison:`<div class="cols"><div><h3>Unison moves</h3><table class="stack"><thead><tr><th>Same pitch on…</th><th>Move</th><th>Across G–B</th></tr></thead><tbody>
  <tr><td>Next string up</td><td>5 frets lower</td><td>4 frets lower (G→B)</td></tr>
  <tr><td>Next string down</td><td>5 frets higher</td><td>4 frets higher (B→G)</td></tr>
  <tr><td>Two strings up</td><td>10 frets lower</td><td>9 frets lower (D→B, G→e)</td></tr></tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>A unison is the exact same pitch, not just the same name.</li><li>Most notes can be played in 2–4 places. Pick the one that suits the position, tone or fingering.</li><li>The 5th-fret tuning rule is just a unison.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play an open string, then the same pitch on the next lower string. They should sound identical.</li><li>Pick fret 10 of the low E (D) and find it on the A, D and G strings.</li><li>Compare the tone: thicker strings higher up the neck sound warmer.</li></ul></div></div>`,
 alphabet:`<div class="cols"><div><h3>The chromatic scale</h3><p>${NN2.map(n=>`<b>${n}</b>`).join(' · ')} · <b>C</b></p><p>Natural notes are a whole step (2 frets) apart, except <b>E–F</b> and <b>B–C</b>, which are a half step (1 fret).</p>
  <h3 style="margin-top:22px">Fretboard landmarks</h3><ul><li>Open strings: E A D G B E.</li><li>Fret 12 = the open-string note again (double dots).</li><li>Fret 5 = the next open string (fret 4 on G).</li><li>Fret 7 = a perfect 5th above the open string.</li></ul></div>
  <div><h3>Key ideas</h3><ul><li>Seven letters, A–G, then they repeat.</li><li>A sharp (♯) raises a note one fret; a flat (♭) lowers it one fret.</li><li>C♯ and D♭ are enharmonic: same fret, different spelling. E♯ = F and B♯ = C.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the chromatic scale on each string from open to fret 12, naming every note.</li><li>Name the natural notes only on the low E string, then the A string. These are your root strings.</li><li>Pick a random fret and name it in under three seconds.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15). The tabs show your best score.</li><li>The final mixes everything: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 7, <em>The Major Scale</em>, builds a scale out of these twelve notes using whole and half steps.</p></div></div>`};
