/* ===== Part 3: lessons 7–11 ===== */
const keyByPc=pc=>KEASY.find(k=>pcOf(k)===pc);
const degIv=d=>d===8?12:MAJ[d-1];
const scaleTxt=k=>`${k} major: ${spellScale(k).join(' ')} ${k}`;
const nameK=(k,s,f)=>(inKey(k,s,f)||{name:note(s,f)}).name;
const whereK=(k,s,f)=>`${nameK(k,s,f)} on the ${SN[s]} string, ${fretTxt(f)}`;
/* plausible wrong spellings of a note name */
function misspell(n){const L=LET.indexOf(n[0]),a=ACC[n.slice(1)],pc=pcOf(n),o=[];
  for(const b of [a-1,a+1])if(Math.abs(b)<=1)o.push(LET[L]+accTxt(b));
  for(const L2 of [(L+1)%7,(L+6)%7]){const b=((pc-LPC[L2]+18)%12)-6;if(Math.abs(b)<=1)o.push(LET[L2]+accTxt(b))}
  return o.filter(x=>x!==n)}

/* ---------- Lesson 7: the major scale ---------- */
const STEP=['W','W','H','W','W','W','H'];
function mStep(){const d=R(1,7),w=STEP[d-1]==='W';const a=w?'Whole step (2 frets)':'Half step (1 fret)';
  return{type:'choice',noBoard:true,key:'ms'+d,text:`In the major scale formula W W H W W W H, what is the step from degree ${d} to degree ${d===7?'8 (the octave)':d+1}?`,choices:['Whole step (2 frets)','Half step (1 fret)','Minor 3rd (3 frets)'],ans:a,hint:'Write the formula under the numbers 1 to 8.',explain:`1 –W– 2 –W– 3 –H– 4 –W– 5 –W– 6 –W– 7 –H– 8. Degrees 3–4 and 7–8 are the half steps.`}}
const mBank=sbank('mb',[
 ['What is the major scale formula?','W W H W W W H',['W H W W H W W','W W W H W W H','H W W W H W W'],'Whole, whole, half, whole, whole, whole, half: 2+2+1+2+2+2+1 = 12 frets, one octave.'],
 ['Which degrees of the major scale are only a half step apart?','3–4 and 7–8',['2–3 and 6–7','4–5 and 7–8','1–2 and 5–6'],'The H steps in W W H W W W H fall between 3–4 and 7–8.'],
 ['How many different notes does a major scale have before the octave?','7',['8','5','12'],'Seven notes; the 8th is the root again, an octave up.'],
 ['In a correctly spelled major scale, each letter A–G appears…','exactly once',['as often as needed','twice','only as naturals'],'That is why F major has B♭ (not A♯): A is already used, B is not.'],
 ['Which major scale has no sharps or flats?','C major',['A major','G major','F major'],'C D E F G A B: the white keys, and the half steps fall naturally on E–F and B–C.'],
 ['The steps of a major scale add up to…','12 semitones (one octave)',['7 semitones','10 semitones','14 semitones'],'2+2+1+2+2+2+1 = 12.']]);
function mSpell(){const k=pick(KEASY),d=R(2,7),sc=spellScale(k),a=sc[d-1];
  return{type:'choice',noBoard:true,key:`mp${k}${d}`,text:`What is the ${ord(d)} note of ${k} major?`,choices:mc(a,[...misspell(a),sc[d%7],sc[d-2]]),ans:a,hint:'Use every letter once, starting on the root, then fix the accidentals with W W H W W W H.',explain:scaleTxt(k)+'.'}}
function mOneString(){for(let k=0;k<80;k++){const key=pick(KEASY),s=R(0,5),r=rootFret(key,s,0);if(r>3)continue;
  const tg=[];for(let f=r+1;f<=r+12;f++){const x=inKey(key,s,f);if(x)tg.push({s,f,t:x.deg===1?'8':String(x.deg)})}
  return{type:'multi',key:`mo${key}${s}`,text:`Play ${key} major up the ${SN[s]} string: the root is marked. Click every scale note from there up to the octave.`,marks:[{s,f:r,t:'R',k:'root'}],targets:tg,notes:[midi(s,r),...tg.map(p=>midi(p.s,p.f))],hint:'From the root: 2, 2, 1, 2, 2, 2, 1 frets.',explain:`${scaleTxt(key)}. On one string: frets ${[r,...tg.map(p=>p.f)].join(', ')} (W W H W W W H).`}}}
function mNotIn(){const k=pick(KEASY),sc=spellScale(k),pcs=sc.map(pcOf),out=shuf([0,1,2,3,4,5,6,7,8,9,10,11].filter(p=>!pcs.includes(p)))[0];
  const flat=sigOf(k)<0,odd=(flat?['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B']:NN)[out];
  return{type:'choice',noBoard:true,key:`mn${k}`,text:`Which of these notes is NOT in ${k} major?`,choices:shuf([odd,...shuf(sc.slice(1)).slice(0,3)]),ans:odd,hint:'Spell the scale first.',explain:scaleTxt(k)+`. ${odd} is not in it.`}}

/* ---------- Lesson 8: major scale intervals ---------- */
function iDeg(){const d=R(2,8),a=nm(degIv(d));
  return{type:'choice',noBoard:true,key:'id'+d,text:`From the root of any major scale up to its ${d===8?'8th degree (the octave)':ord(d)+' degree'}, what interval is it?`,choices:mc(a,[nm(degIv(d)-1),nm(Math.min(12,degIv(d)+1)),nm(degIv(d)===5?6:Math.max(1,degIv(d)-2))]),ans:a,hint:'Every interval from the root of a major scale is major or perfect.',explain:`1→${d} is ${fr(degIv(d))}: ${art(a)} ${a}. Major scale from the root: M2 M3 P4 P5 M6 M7 P8.`}}
function iRev(){const d=R(2,7),a=ord(d);
  return{type:'choice',noBoard:true,key:'ir'+d,text:`Which degree of the major scale is ${art(nm(degIv(d)))} ${nm(degIv(d))} above the root?`,choices:mc(a,['2nd','3rd','4th','5th','6th','7th']),ans:a,hint:'The interval number and the degree number match in a major scale.',explain:`${cap(nm(degIv(d)))} = degree ${d}. The number of the interval is the number of the degree.`}}
function iKey(){const k=pick(KEASY),d=R(2,7),n=spellScale(k)[d-1],a=nm(degIv(d));
  return{type:'choice',noBoard:true,key:`ik${k}${d}`,text:`In ${k} major, what interval is it from ${k} up to ${n}?`,choices:mc(a,near(degIv(d))),ans:a,hint:`Which degree of ${k} major is ${n}?`,explain:`${n} is the ${ord(d)} degree of ${k} major, so ${k}→${n} is ${art(a)} ${a} (${fr(degIv(d))}).`}}
function iShape(){for(let k=0;k<120;k++){const key=pick(KEASY),s1=R(0,3),f=rootFret(key,s1,1),d=R(2,8),s2=s1+R(0,2);if(f<1||f>12)continue;const t=shapeFret(s1,f,s2,degIv(d));if(t<0||t>15||Math.abs(t-f)>4||(s2===s1&&t===f))continue;
  return{type:'click',key:`is${s1}${s2}${d}`,text:`Root of ${key} major: ${whereK(key,s1,f)}. Click its ${ord(d)} degree (${nameK(key,s2,t)}, ${art(nm(degIv(d)))} ${nm(degIv(d))}) on the ${SN[s2]} string.`,marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:t,t:d===8?'8':String(d)},notes:[midi(s1,f),midi(s2,t)],hint:s2===s1?`${fr(degIv(d))} up the same string.`:`The ${SN[s1]}→${SN[s2]} gap is ${gap(s1,s2)} semitones; the interval needs ${degIv(d)}.`,explain:`${cap(art(nm(degIv(d))))} ${nm(degIv(d))} is ${fr(degIv(d))}. ${s2===s1?'On the same string it is':`The ${SN[s1]}→${SN[s2]} string gap is ${gap(s1,s2)} semitones, so it is`} ${t===f?'on the same fret as the root':offTxt(t-f)+' than the root'}: fret ${t}.${crossGB(s1,s2)?' (One fret higher than usual: the shape crosses G–B.)':''}`}}}

/* ---------- Lesson 9: major scale patterns ---------- */
function boxOf(){const key=pick(KEASY);if(Math.random()<.55){const r=rootFret(key,0,1);return{key,rs:0,r,box:[r-1,r+2],name:'6th-string-root pattern'}}
  const r=rootFret(key,1,2);return{key,rs:1,r,box:[r-2,r+2],name:'5th-string-root pattern'}}
function pBox(full){const b=boxOf(),st=full?[0,1,2,3,4,5]:(()=>{const a=R(0,3);return[a,a+1,a+2]})();
  const tg=keyPositions(b.key,st,b.box[0],b.box[1]).filter(p=>!(p.s===b.rs&&p.f===b.r));const ss=st.map(s=>SN[s]);
  return{type:'multi',key:`pb${b.key}${b.rs}${st[0]}${full?1:0}`,box:b.box,text:`${b.key} major, ${b.name}: click every scale note inside the shaded frets (${b.box[0]}–${b.box[1]}) on the ${full?'six strings':ss.slice(0,-1).join(', ')+' and '+ss[2]+' strings'}.`,marks:[{s:b.rs,f:b.r,t:'R',k:'root'}],targets:tg,notes:keyPositions(b.key,st,b.box[0],b.box[1]).sort((x,y)=>midi(x.s,x.f)-midi(y.s,y.f)).map(p=>midi(p.s,p.f)),hint:`${scaleTxt(b.key)}. Name the notes on each string inside the box and keep only those.`,explain:`${scaleTxt(b.key)}. In this box: ${st.map(s=>`${SL[s]}: ${keyPositions(b.key,[s],b.box[0],b.box[1]).map(p=>p.name+' ('+p.f+')').join(', ')}`).join(' · ')}.`}}
const pBox3=()=>pBox(false),pBox6=()=>pBox(true);
function pDeg(){for(let k=0;k<80;k++){const b=boxOf(),s=R(0,5),d=R(2,7),c=keyPositions(b.key,[s],b.box[0],b.box[1]).filter(p=>p.deg===d);if(c.length!==1||(c[0].s===b.rs&&c[0].f===b.r))continue;
  return{type:'click',key:`pd${s}${d}`,box:b.box,text:`Inside this ${b.key} major pattern, click the ${ord(d)} degree (${c[0].name}) on the ${SN[s]} string.`,marks:[{s:b.rs,f:b.r,t:'R',k:'root'}],target:{...c[0],t:String(d)},notes:[midi(b.rs,b.r),midi(c[0].s,c[0].f)],hint:`Find ${c[0].name} on the ${SN[s]} string, between frets ${b.box[0]} and ${b.box[1]}.`,explain:`${scaleTxt(b.key)}. The ${ord(d)} degree is ${c[0].name}; inside the box on the ${SN[s]} string it is at fret ${c[0].f}.`}}}
function pMove(){for(let k=0;k<60;k++){const rs=pick([0,1]),r=R(1,10),d=pick([-3,-2,-1,1,2,3,4,5]),r2=r+d;if(r2<1||r2>12)continue;const k1=keyByPc(pcAt(rs,r)),k2=keyByPc(pcAt(rs,r2));
  return{type:'choice',key:`pm${rs}${r}${d}`,text:`You play a ${k1} major pattern with its root on the ${SN[rs]} string at fret ${r}. You slide the whole pattern so the root is at fret ${r2}. Which key are you in now?`,marks:[{s:rs,f:r,t:'R',k:'ghost'},{s:rs,f:r2,t:'R',k:'root'}],choices:mc(k2,[keyByPc((pcOf(k2)+1)%12),keyByPc((pcOf(k2)+11)%12),k1,keyByPc((pcOf(k2)+2)%12)]),ans:k2,hint:'The fingering does not change. Only the root note does: name the new root fret.',explain:`Same fingering, new root: fret ${r2} of the ${SN[rs]} string is ${note(rs,r2)}, so it is now ${k2} major. Moving ${fr(Math.abs(d))} ${d>0?'up':'down'} moves the key ${fr(Math.abs(d))} ${d>0?'up':'down'}.`}}}

/* ---------- Lesson 10: upper (compound) intervals ---------- */
const UP={14:['major 9th','9th','2nd',2],16:['major 10th','10th','3rd',3],17:['perfect 11th','11th','4th',4],19:['perfect 12th','12th','5th',5],21:['major 13th','13th','6th',6]};
const uBank=sbank('ub',[
 ['A 9th is the same note name as which simple interval, an octave higher?','2nd',['3rd','7th','4th'],'9 = 2 + 7 (adding an octave adds 7 to the number): a 9th is a 2nd plus an octave.'],
 ['An 11th is the same note name as which simple interval, an octave higher?','4th',['3rd','5th','6th'],'11 = 4 + 7.'],
 ['A 13th is the same note name as which simple interval, an octave higher?','6th',['5th','7th','3rd'],'13 = 6 + 7.'],
 ['How many semitones is a major 9th?','14',['12','13','16'],'Major 2nd (2) + octave (12) = 14.'],
 ['How many semitones is a perfect 11th?','17',['15','16','19'],'Perfect 4th (5) + octave (12) = 17.'],
 ['How many semitones is a major 13th?','21',['19','20','22'],'Major 6th (9) + octave (12) = 21.'],
 ['To turn a simple interval into its compound version, you add…','7 to the number (an octave)',['8 to the number','12 to the number','an octave and a half'],'Interval numbers count letters, and an octave adds 7 letters: 2→9, 4→11, 6→13. In semitones you add 12.'],
 ['Why do chord names use 9, 11 and 13 instead of 2, 4 and 6?','They are stacked above the 7th, an octave up',['They are lower in pitch','They are different notes','They only exist in minor keys'],'Chords stack 3rds: 1 3 5 7 9 11 13. The upper notes are named by where they sit in that stack.']]);
function uKeyQ(){const k=pick(KEASY),u=pick([14,17,21]),[full,short,simple,d]=UP[u],a=spellScale(k)[d-1];
  return{type:'choice',noBoard:true,key:`uk${k}${u}`,text:`In ${k} major, what note is the ${short}?`,choices:mc(a,[...misspell(a),spellScale(k)[d],spellScale(k)[d-2]]),ans:a,hint:`The ${short} is the ${simple} degree, an octave up.`,explain:`${short} = ${simple} + octave, so it is degree ${d}: ${a}. ${scaleTxt(k)}.`}}
function uClk(){for(let k=0;k<120;k++){const s1=R(0,2),f=R(1,12),u=pick([14,14,17,17,21,21,16]),s2=R(s1+2,5),t=shapeFret(s1,f,s2,u);if(t<0||t>15||Math.abs(t-f)>4)continue;const[full]=UP[u];
  return{type:'click',key:`uc${s1}${s2}${u}`,text:`Root: ${where(s1,f)}. Click the ${full} above it on the ${SN[s2]} string.`,marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:t,t:UP[u][1].replace('th','')},notes:[midi(s1,f),midi(s2,t)],hint:`A ${full} is ${u} semitones. ${SN[s1]}→${SN[s2]} is ${gap(s1,s2)} semitones.`,explain:`${cap(full)} = ${UP[u][2]} + octave = ${u} semitones. The ${SN[s1]}→${SN[s2]} gap is ${gap(s1,s2)}, so go ${offTxt(t-f)}: fret ${t} (${note(s2,t)}).`}}}
function uName(){for(let k=0;k<120;k++){const s1=R(0,2),f=R(1,12),u=pick([14,16,17,19,21]),s2=R(s1+2,5),t=shapeFret(s1,f,s2,u);if(t<0||t>15||Math.abs(t-f)>4)continue;const a=UP[u][0];
  return{type:'choice',key:`un${s1}${s2}${u}`,text:'The ? is more than an octave above the root. Which interval is it?',marks:[{s:s1,f,t:'R',k:'root'},{s:s2,f:t,t:'?',k:'q'}],choices:mc(a,Object.values(UP).map(x=>x[0])),ans:a,notes:[midi(s1,f),midi(s2,t)],hint:`Count the semitones: the string gap (${gap(s1,s2)}) plus or minus the fret difference.`,explain:`String gap ${gap(s1,s2)} ${t-f>=0?'+':'−'} ${Math.abs(t-f)} fret${Math.abs(t-f)===1?'':'s'} = ${u} semitones: ${a} (${note(s1,f)} up to ${note(s2,t)}).`}}}

/* ---------- Lesson 11: patterns vs positions ---------- */
const vBank=sbank('vb',[
 ['What is a position?','Where your hand sits: the fret your index finger covers',['A fingering shape of the scale','A scale that starts on the low E string','A chord shape'],'In 5th position your index finger sits at fret 5, and each finger covers one fret (5–8).'],
 ['What is a pattern?','The fingering shape of a scale, movable to any key',['The fret your index finger is on','The order of whole and half steps','A list of note names'],'A pattern is the shape; slide it and it plays the same scale in another key.'],
 ['Your index finger is on fret 7, one finger per fret. Which position is that?','7th position',['5th position','8th position','10th position'],'The position is named after the index-finger fret.'],
 ['In 5th position, which frets do your four fingers cover?','5, 6, 7, 8',['4, 5, 6, 7','5, 7, 9, 10','1, 2, 3, 4'],'One finger per fret, starting at the index-finger fret.'],
 ['You slide a whole pattern 2 frets higher. What happens?','The key goes up a whole step; the fingering stays the same',['The key stays the same; the fingering changes','It becomes a minor scale','Nothing, patterns cannot move'],'Patterns are movable: same shape, new root, new key.'],
 ['To play in a new key without moving your hand, you…','switch to another pattern that fits this position',['slide the same pattern up','retune the guitar','play only open strings'],'Several patterns fit any position; changing pattern changes key while your hand stays put.'],
 ['How many frets does one hand position usually cover?','4 (sometimes 5 with a stretch)',['2','7','12'],'One finger per fret, plus the occasional stretch with the index or pinky.']]);
function vRoots(){const p=R(1,11),k=pick(KEASY),tg=allPc(pcOf(k),[0,1,2,3,4,5],p,p+3);if(!tg.length)return vRoots();
  return{type:'multi',key:`vr${k}${p}`,box:[p,p+3],text:`Stay in ${ord(p)} position (frets ${p}–${p+3}, shaded). Click every ${k} root you can reach without moving your hand.`,marks:[],targets:tg.map(x=>({...x,t:'R'})),notes:tg.map(x=>midi(x.s,x.f)),hint:'Find one, then use octave shapes inside the box.',explain:`${k} inside frets ${p}–${p+3}: ${tg.map(posTxt).join(', ')}. Any of them can anchor a pattern in this position.`}}

const LS={
 scale:{h:'major-scale',n:'Lesson 7',title:'The major scale',sub:'W W H W W W H: building and spelling the major scale.',
  ex:[['Formula',[mStep,mBank]],['Spell it',[mSpell,mNotIn]],['One string',[mOneString]]],
  test:[...rep(mStep,2),...rep(mBank,3),...rep(mSpell,5),...rep(mNotIn,2),...rep(mOneString,3)]},
 sint:{h:'major-scale-intervals',n:'Lesson 8',title:'Major scale intervals',sub:'Every degree measured from the root: major and perfect intervals.',
  ex:[['Degree → interval',[iDeg]],['Interval → degree',[iRev]],['In a key',[iKey]],['On the neck',[iShape]]],
  test:[...rep(iDeg,4),...rep(iRev,3),...rep(iKey,3),...rep(iShape,5)]},
 pat:{h:'scale-patterns',n:'Lesson 9',title:'Major scale patterns',sub:'Scale notes inside a hand-sized box, from a 6th- or 5th-string root.',
  ex:[['Fill the box (3 strings)',[pBox3]],['Fill the box (6 strings)',[pBox6]],['Find a degree',[pDeg]],['Move the pattern',[pMove]]],
  test:[...rep(pBox3,4),pBox6,...rep(pDeg,6),...rep(pMove,4)]},
 upper:{h:'upper-intervals',n:'Lesson 10',title:'Upper intervals',sub:'9ths, 11ths and 13ths: intervals beyond the octave.',
  ex:[['Concepts',[uBank]],['In a key',[uKeyQ]],['Play it',[uClk]],['Name it',[uName]]],
  test:[...rep(uBank,4),...rep(uKeyQ,3),...rep(uClk,4),...rep(uName,4)]},
 pos:{h:'patterns-positions',n:'Lesson 11',title:'Patterns vs positions',sub:'The shape (pattern) versus where your hand sits (position).',
  ex:[['Concepts',[vBank]],['Roots in a position',[vRoots]],['Move a pattern',[pMove]]],
  test:[...rep(vBank,6),...rep(vRoots,5),...rep(pMove,4)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 7–11 mixed.',
  ex:[['Lessons 7–8',[mStep,mBank,mSpell,mNotIn,mOneString,iDeg,iRev,iKey,iShape]],['Lessons 9–11',[pBox3,pDeg,pMove,uBank,uKeyQ,uClk,uName,vBank,vRoots]]],
  test:[mBank,mSpell,mSpell,mNotIn,mOneString,iDeg,iKey,iShape,iShape,pBox3,pDeg,pDeg,pMove,uBank,uKeyQ,uClk,uName,vBank,vBank,vRoots]}};
const ORDER=['scale','sint','pat','upper','pos','final'],STORE='gi-best-p3';

const NOTES={
 scale:`<div class="cols"><div><h3>Building the scale</h3><p><b>1</b> –W– <b>2</b> –W– <b>3</b> –H– <b>4</b> –W– <b>5</b> –W– <b>6</b> –W– <b>7</b> –H– <b>8</b></p>
  <table class="stack"><thead><tr><th>Key</th><th>Notes</th></tr></thead><tbody>${['C','G','D','F','B♭'].map(k=>`<tr><td>${k} major</td><td>${spellScale(k).join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>W = whole step = 2 frets. H = half step = 1 fret.</li><li>Spell it with every letter once, then add ♯ or ♭ to make the steps fit.</li><li>Never mix sharps and flats in one major scale.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C major up the A string from fret 3, saying W W H W W W H.</li><li>Do the same from any root on the low E string.</li><li>Sing the scale while you play it; the half steps should feel like “leaning” notes.</li></ul></div></div>`,
 sint:`<div class="cols"><div><h3>Degrees and intervals</h3><table class="stack"><thead><tr><th>Degree</th><th>Interval from root</th><th>Frets</th><th>In C</th></tr></thead><tbody>${[1,2,3,4,5,6,7,8].map(d=>`<tr><td>${d}</td><td>${d===1?'Unison':cap(nm(degIv(d)))}</td><td>${d===1?0:degIv(d)}</td><td>${spellScale('C')[(d-1)%7]}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>From the root, every major-scale interval is major (2, 3, 6, 7) or perfect (4, 5, 8).</li><li>So a major scale is a set of interval shapes around a root: use the shapes from lesson 3.</li><li>Intervals between other degrees (e.g. 2→4) can be minor.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the root, then each degree, then the root again (1-2-1, 1-3-1…). Name each interval.</li><li>Find the M3, P5 and M7 shapes from a low-E root without counting.</li></ul></div></div>`,
 pat:`<div class="cols"><div><h3>Two common box patterns</h3><ul><li><b>6th-string root</b>: root under the middle finger; the scale fits frets root−1 to root+2.</li><li><b>5th-string root</b>: root under the middle finger; the scale needs frets root−2 to root+2 (one stretch).</li></ul><p class="small">Your course may teach its own set of patterns (for example 3-notes-per-string). The box exercises work with any of them: they only ask which notes of the key fall inside the shaded frets.</p></div>
  <div><h3>Key ideas</h3><ul><li>A pattern is a fingering of the scale across the strings.</li><li>All patterns are movable: the root note decides the key.</li><li>Learn where the root sits inside each pattern first.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play G major from fret 3 of the low E string with the 6th-string pattern, up and down.</li><li>Slide the same pattern to fret 5 (A major) and fret 8 (C major).</li><li>Say the degree numbers as you play.</li></ul></div></div>`,
 upper:`<div class="cols"><div><h3>Upper intervals</h3><table class="stack"><thead><tr><th>Interval</th><th>Simple + octave</th><th>Semitones</th><th>In C</th></tr></thead><tbody>${Object.entries(UP).map(([u,x])=>`<tr><td>${cap(x[0])}</td><td>${x[2]} + octave</td><td>${u}</td><td>${spellScale('C')[x[3]-1]}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Add 7 to the number (or 12 semitones) to get the compound interval: 2→9, 4→11, 6→13.</li><li>Same note name, an octave higher, so the same fret shape plus an octave shift.</li><li>9ths, 11ths and 13ths are the colour notes of extended chords.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Root on the low E string: find the 9th two strings up and 2 frets higher.</li><li>Play root, octave, then 9th, 11th and 13th above it.</li></ul></div></div>`,
 pos:`<div class="cols"><div><h3>Pattern or position?</h3><table class="stack"><thead><tr><th></th><th>Pattern</th><th>Position</th></tr></thead><tbody><tr><td>What it is</td><td>A fingering shape</td><td>Where your hand sits</td></tr><tr><td>Named by</td><td>Root string / shape</td><td>Index-finger fret</td></tr><tr><td>Move it and…</td><td>the key changes</td><td>you change which notes you can reach</td></tr></tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Same pattern, different position = different key.</li><li>Same position, different pattern = different key without moving your hand.</li><li>Knowing both lets you play any key anywhere on the neck.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Stay in 5th position and play A major, then D major, without moving your hand.</li><li>Play one pattern in three positions: three keys.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes everything: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lessons 12–15 cover fretboard insight and major scale keys: key signatures, sharps and flats.</p></div></div>`};
