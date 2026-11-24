/* ===== Part 26: lessons 104–108 (diminished scales) ===== */
const FLN=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const pcName=(pc,fl=true)=>(fl?FLN:NN)[((pc%12)+12)%12];
const noDbl=a=>!a.some(x=>/[𝄪𝄫]/.test(x));
/* multiple choice of note names where no distractor shares a pitch class with the answer or with another distractor */
const mcp=(ans,pool)=>{const seen=new Set([pcOf(ans)]),o=[];for(const x of shuf(pool)){const p=pcOf(x);if(!seen.has(p)){seen.add(p);o.push(x)}if(o.length===3)break}return shuf([ans,...o])};
const TOK={dimWH:['R','2','♭3','4','♭5','♯5','6','7'],dimHW:['R','♭2','♯2','3','♯4','5','6','♭7']};
const SCN={dimWH:'whole-half diminished',dimHW:'half-whole diminished'};
const SCS={dimWH:'WH',dimHW:'HW'};
const rootsFor=sc=>KEASY.filter(k=>noDbl(scaleNotes(k,sc)));
const nn=(r,sc)=>scaleNotes(r,sc);
const spcs=(r,sc)=>nn(r,sc).map(pcOf);
const cname=(pc,q)=>{for(const n of [FLN[pc],NN[pc]])if(noDbl(chordNotes(n,q)))return n;return FLN[pc]};
function scPos(root,sc,strings,lo,hi){const p=spcs(root,sc),n=nn(root,sc),o=[];for(const s of strings)for(let f=lo;f<=hi;f++){const i=p.indexOf(pcAt(s,f));if(i>=0)o.push({s,f,t:TOK[sc][i],name:n[i],i})}return o}
const byPitch=a=>a.slice().sort((x,y)=>midi(x.s,x.f)-midi(y.s,y.f));
const chSemis=q=>[...new Set(fmlSemis(CHORDS[q].f).map(x=>x%12))];
const subsetOf=(semis,root,set)=>semis.every(x=>set.includes((x+root)%12));
/* indices of scale degrees on which chord quality q (rooted on that note) fits entirely inside the scale */
const fitIdx=(sc,q)=>{const p=fmlSemis(SCALES[sc].f).map(x=>x%12);return p.map((x,i)=>i).filter(i=>subsetOf(chSemis(q),p[i],p))};
/* a playable voicing (any arrangement of the chord tones on 4 adjacent strings, 4-fret span); marks labelled by chord degree, root marked 'root' */
const perms=a=>a.length<2?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
function chordShape(rpc,q,sets=SETS4){const L=CHORDS[q].f.split(' ').map(t=>t==='1'?'R':t.replace('bb','♭♭').replace('b','♭').replace('#','♯')),sm=fmlSemis(CHORDS[q].f).map(x=>x%12),opts=[];
  for(const st of sets)for(const p of perms(sm.map((x,i)=>i)))opts.push([st,p]);
  for(const[st,p]of shuf(opts)){const v=voicing(st,p.map(i=>(sm[i]+rpc)%12),0,12,4);if(v)return v.map((x,j)=>({s:x.s,f:x.f,t:L[p[j]],k:p[j]===0?'root':'ghost'}))}
  return null}
const scTxt=(r,sc)=>`${r} ${SCN[sc]}: ${nn(r,sc).join(' ')}`;
const pcSet=(rpc,sc)=>fmlSemis(SCALES[sc].f).map(x=>(x+rpc)%12).sort((a,b)=>a-b).join();
const sem=n=>`${n} semitone${n===1?'':'s'}`;
const stepHint={dimWH:'Whole step, half step, whole step, half step… (2, 1, 2, 1 frets).',dimHW:'Half step, whole step, half step, whole step… (1, 2, 1, 2 frets).'};

/* ---------- Lessons 104 / 106: spelling and the neck ---------- */
function spellQ(sc){const r=pick(rootsFor(sc)),n=nn(r,sc),d=R(2,8),a=n[d-1],sh=a.includes('♯');
  return{type:'choice',noBoard:true,key:`sp${sc}${r}${d}`,text:`What is the ${ord(d)} note of the ${r} ${SCN[sc]} scale? (The root counts as the 1st note.)`,choices:mcp(a,[...n.filter(x=>pcOf(x)!==pcOf(a)),pcName(pcOf(a)+1,!sh),pcName(pcOf(a)-1,!sh),pcName(pcOf(a)+2,!sh)]),ans:a,
   hint:stepHint[sc]+' Count up from the root, one step at a time.',explain:`${scTxt(r,sc)} ${r}. The ${ord(d)} note is ${a}. The scale has 8 notes, so one letter name appears twice (${n.find(x=>n.filter(y=>y[0]===x[0]).length===2)[0]} here).`}}
function notInQ(sc){const r=pick(rootsFor(sc)),n=nn(r,sc),p=spcs(r,sc),sh=r.includes('♯')||sigOf(r)>0,miss=[0,1,2,3,4,5,6,7,8,9,10,11].filter(x=>!p.includes(x)),a=pcName(pick(miss),!sh);
  return{type:'choice',noBoard:true,key:`ni${sc}${r}${a}`,text:`Which of these notes is NOT in the ${r} ${SCN[sc]} scale?`,choices:shuf([a,...shuf(n.slice(1)).slice(0,3)]),ans:a,hint:`Spell the scale from ${r} first. It has 8 notes, so 4 of the 12 pitches are missing.`,explain:`${scTxt(r,sc)}. The four pitches it skips are ${miss.map(x=>pcName(x,!sh)).join(', ')}; ${a} is one of them.`}}
function oneStringQ(sc){for(let k=0;k<200;k++){const r=pick(rootsFor(sc)),s=R(0,5),f=rootFret(r,s,0);if(f>3)continue;const tg=scPos(r,sc,[s],f+1,f+12).map(p=>({s:p.s,f:p.f,t:p.i===0?'8':p.t}));
  return{type:'multi',key:`os${sc}${r}${s}`,text:`Play the ${r} ${SCN[sc]} scale up the ${SN[s]} string: the root is marked. Click every scale note from there up to the octave (8 notes).`,marks:[{s,f,t:'R',k:'root'}],targets:tg,notes:[midi(s,f),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:stepHint[sc],
   explain:`${scTxt(r,sc)} ${r}. On the ${SN[s]} string the frets are ${[f,...tg.map(p=>p.f)].join(', ')}: ${sc==='dimWH'?'2, 1, 2, 1, 2, 1, 2, 1':'1, 2, 1, 2, 1, 2, 1, 2'} frets apart.`}}return oneStringQ(sc)}
function boxQ(sc){for(let k=0;k<300;k++){const r=pick(rootsFor(sc)),rs=R(0,4),f=rootFret(r,rs,2);if(f<2||f>10)continue;const lo=f-1,hi=f+3,st=[rs,rs+1],tg=scPos(r,sc,st,lo,hi).filter(p=>!(p.s===rs&&p.f===f));if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`bx${sc}${r}${rs}`,box:[lo,hi],text:`${r} ${SCN[sc]}: the root is marked. Click every scale note on the ${SN[rs]} and ${SN[rs+1]} strings inside the shaded frets (${lo}–${hi}).`,marks:[{s:rs,f,t:'R',k:'root'}],targets:tg,notes:byPitch(scPos(r,sc,st,lo,hi)).map(p=>midi(p.s,p.f)),pm:'seq',
   hint:'Name the notes of the scale first, then find each one inside the box. '+stepHint[sc],explain:`${scTxt(r,sc)}. In frets ${lo}–${hi}: ${st.map(s=>`${SL[s]}: ${scPos(r,sc,[s],lo,hi).map(p=>p.name+' ('+p.f+')').join(', ')}`).join(' · ')}.`}}return boxQ(sc)}
function findQ(sc){for(let k=0;k<300;k++){const r=pick(rootsFor(sc)),s=R(0,5),f=rootFret(r,s,1);if(f<1||f>11)continue;const s2=R(0,5),c=scPos(r,sc,[s2],Math.max(0,f-4),Math.min(15,f+4)).filter(p=>p.i>0&&!(p.s===s&&p.f===f));if(!c.length)continue;const t=pick(c),semi=(pcOf(t.name)-pcOf(r)+12)%12;
  return{type:'click',key:`fd${sc}${r}${s}${t.i}${s2}`,text:`The ${r} ${SCN[sc]} root is marked. Click its ${t.t} (${t.name}) on the ${SN[s2]} string, within 4 frets of the root.`,marks:[{s,f,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:t.t},notes:[midi(s,f),midi(t.s,t.f)],
   hint:`${t.name} is ${sem(semi)} above the root (or ${12-semi} below it).`,explain:`${scTxt(r,sc)}. The ${t.t} is ${t.name}: ${SN[t.s]} string, ${fretTxt(t.f)}, ${sem(semi)} above ${r}.`}}return findQ(sc)}
function nameQ(sc){for(let k=0;k<300;k++){const r=pick(rootsFor(sc)),s=R(0,5),f=rootFret(r,s,1);if(f<1||f>11)continue;const s2=R(0,5),c=scPos(r,sc,[s2],Math.max(0,f-4),Math.min(15,f+4)).filter(p=>p.i>0&&!(p.s===s&&p.f===f));if(!c.length)continue;const t=pick(c);
  return{type:'choice',key:`nm${sc}${r}${s}${t.i}${s2}`,text:`The root of the ${r} ${SCN[sc]} scale is marked. Which scale degree is the ?`,marks:[{s,f,t:'R',k:'root'},{s:t.s,f:t.f,t:'?',k:'q'}],choices:mc(t.t,TOK[sc].slice(1)),ans:t.t,notes:[midi(s,f),midi(t.s,t.f)],
   hint:'Count the semitones from the root to the ?, then match them to the scale formula.',explain:`${scTxt(r,sc)}. The ? is ${t.name}, ${sem((pcOf(t.name)-pcOf(r)+12)%12)} above ${r}: the ${t.t} of the scale (${TOK[sc].join(' ')}, with the root written R).`}}return nameQ(sc)}
function stepQ(sc){const d=R(1,8),w=(d%2===1)===(sc==='dimWH'),a=w?'Whole step (2 frets)':'Half step (1 fret)';
  return{type:'choice',noBoard:true,key:`st${sc}${d}`,text:`In a ${SCN[sc]} scale, what is the step from the ${ord(d)} note to the ${d===8?'octave':ord(d+1)+' note'}?`,choices:['Whole step (2 frets)','Half step (1 fret)','Minor 3rd (3 frets)'],ans:a,hint:'The steps alternate. Which one comes first?',
   explain:`${sc==='dimWH'?'Whole-half: W H W H W H W H':'Half-whole: H W H W H W H W'}. The ${ord(d)} step is a ${w?'whole':'half'} step.`}}
const wSpell=()=>spellQ('dimWH'),wNotIn=()=>notInQ('dimWH'),wOne=()=>oneStringQ('dimWH'),wBox=()=>boxQ('dimWH'),wFind=()=>findQ('dimWH'),wName=()=>nameQ('dimWH'),wStep=()=>stepQ('dimWH');
const vSpell=()=>spellQ('dimHW'),vNotIn=()=>notInQ('dimHW'),vOne=()=>oneStringQ('dimHW'),vBox=()=>boxQ('dimHW'),vFind=()=>findQ('dimHW'),vName=()=>nameQ('dimHW'),vStep=()=>stepQ('dimHW');
const wBank=sbank('wb',[
 ['How many different notes does a diminished scale have in one octave?','8',['7','6','12'],'Whole and half steps alternate: 2+1+2+1+2+1+2+1 = 12 semitones over 8 steps, so 8 notes before the octave.'],
 ['What is the step pattern of the whole-half diminished scale?','W H W H W H W H',['H W H W H W H W','W W H W W W H','W W W W W W'],'It starts with a whole step and then alternates: whole, half, whole, half…'],
 ['What is the formula of the whole-half diminished scale?','1 2 ♭3 4 ♭5 ♯5 6 7',['1 ♭2 ♯2 3 ♯4 5 6 ♭7','1 2 ♭3 4 5 ♭6 ♭7','1 2 3 4 5 6 7'],'In C: C D E♭ F G♭ G♯ A B.'],
 ['Which chord type is made from the alternate notes 1 ♭3 ♭5 6 of the whole-half diminished scale?','Diminished 7th',['Dominant 7th','Minor 7th','Major 7th'],'1 ♭3 ♭5 ♭♭7 (written 6): three minor thirds stacked, a diminished 7th chord.'],
 ['In C whole-half diminished, the notes G♭ and G♯ share a letter. Why?','8 notes do not fit 7 letter names',['It is a mistake in the spelling','The scale is not in a key','G♭ and G♯ are the same pitch'],'Spelling uses each letter once for a 7-note scale. With 8 notes one letter must repeat; G♭ (♭5) and G♯ (♯5) are different pitches.'],
 ['The whole-half diminished scale is symmetrical. What does that mean?','Its pattern of steps repeats every minor 3rd (3 frets)',['It sounds the same going up and down only','It has the same notes in every key','Its notes are all a whole step apart'],'Two steps (W H) make a minor 3rd; the pattern W H repeats four times, so shifting the scale 3 frets gives the same notes.'],
 ['Which step comes first in a whole-half diminished scale?','A whole step',['A half step','A minor 3rd','A tritone'],'The name tells you the order: whole step, then half step.']]);
const vBank2=sbank('hb',[
 ['What is the step pattern of the half-whole diminished scale?','H W H W H W H W',['W H W H W H W H','H H W W H H W','W W H W W W H'],'It starts with a half step and alternates: half, whole, half, whole…'],
 ['What is the formula of the half-whole diminished scale?','1 ♭2 ♯2 3 ♯4 5 6 ♭7',['1 2 ♭3 4 ♭5 ♯5 6 7','1 ♭2 ♭3 4 ♭5 ♭6 ♭7','1 2 3 4 5 6 ♭7'],'In C: C D♭ D♯ E F♯ G A B♭ (the ♯2 is the same pitch as the ♭3, written ♯2 so each letter name works).'],
 ['Which chord does the half-whole diminished scale usually accompany?','A dominant 7♭9 chord',['A major 7th chord','A minor 7th chord','A diminished 7th chord'],'Its notes 1 3 5 ♭7 are the dominant 7th, and the extra notes ♭9, ♯9, ♯11 and 13 are common dominant tensions.'],
 ['In the half-whole diminished scale, which notes are the chord tones of a dominant 7th?','1, 3, 5 and ♭7',['1, ♭3, 5 and ♭7','1, ♭2, 4 and 6','2, ♯2, ♯4 and 6'],'C HW: C E G B♭ are 1 3 5 ♭7. The other four notes (D♭ D♯ F♯ A) are the tensions ♭9 ♯9 ♯11 13.'],
 ['The half-whole scale has 8 notes. How many half steps does it contain in one octave?','4',['2','8','7'],'H W H W H W H W: four half steps and four whole steps, 4 + 8 = 12 semitones.'],
 ['Which step comes first in a half-whole diminished scale?','A half step',['A whole step','A minor 3rd','A tritone'],'The name tells you the order: half step, then whole step.']]);
/* tension labels in the half-whole scale */
const HWT={1:'♭9',3:'♯9',6:'♯11',9:'13'},TSEM={'♭9':1,'9':2,'♯9':3,'11':5,'♯11':6,'♭13':8,'13':9};
function hwTension(){const r=pick(rootsFor('dimHW')),n=nn(r,'dimHW'),idx=pick([1,2,4,6]),pcrel=(pcOf(n[idx])-pcOf(r)+12)%12,a=HWT[pcrel];
  for(let k=0;k<200;k++){const s=R(0,5),f=rootFret(r,s,1);if(f<1||f>11)continue;const s2=R(0,5),c=scPos(r,'dimHW',[s2],Math.max(0,f-4),Math.min(15,f+4)).filter(p=>p.i===idx);if(c.length!==1||(c[0].s===s&&c[0].f===f))continue;
   return{type:'choice',key:`ht${r}${s}${idx}${s2}`,text:`Over a ${r}7 chord you play the ${r} half-whole diminished scale. The root is marked. Which tension is the ?`,marks:[{s,f,t:'R',k:'root'},{s:s2,f:c[0].f,t:'?',k:'q'}],choices:mc(a,Object.keys(TSEM).filter(x=>TSEM[x]!==pcrel)),ans:a,notes:[midi(s,f),midi(s2,c[0].f)],
    hint:`The ? is ${sem(pcrel)} above the root. Compare with 1 for ♭9, 2 for 9, 3 for ♯9, 5 for 11, 6 for ♯11, 8 for ♭13, 9 for 13.`,explain:`${scTxt(r,'dimHW')}. The ? is ${c[0].name}, ${sem(pcrel)} above ${r}: the ${a}. The half-whole scale supplies ♭9, ♯9, ♯11 and 13 over a dominant chord.`}}return hwTension()}

/* ---------- Lessons 105 / 107: harmonizing ---------- */
function stackQ(sc){const r=pick(rootsFor(sc)),n=nn(r,sc),d=R(1,8),tri=Math.random()<.4,off=tri?[0,2,4]:[0,2,4,6],idx=off.map(o=>(d-1+o)%8),sm=idx.map(j=>(pcOf(n[j])-pcOf(n[d-1])+12)%12),q=qualityOf(sm);
  if(q!==(tri?'dim':'dim7'))throw new Error('stack '+sc+r+d+q);const a=n[d-1]+CHORDS[q].sym,cs=tri?['m','+','']:['m7♭5','7','m7','maj7'];
  return{type:'choice',noBoard:true,key:`sk${sc}${r}${d}${tri}`,text:`In the ${r} ${SCN[sc]} scale, stack alternate scale notes starting on ${n[d-1]} (the ${ord(d)} note) to make a ${tri?'triad':'7th chord'}. Which chord is it?`,choices:mc(a,cs.map(x=>n[d-1]+x).concat(tri?[n[d-1]+'sus4']:[])),ans:a,
   hint:`Take every other note: ${tri?'3 notes':'4 notes'}, skipping one scale note each time. Measure the gaps between them.`,explain:`${scTxt(r,sc)}. From ${n[d-1]}: ${idx.map(j=>n[j]).join(' ')}, gaps of ${sm.map((x,i)=>i?x-sm[i-1]:null).slice(1).join(' + ')} semitones (all minor 3rds): ${a}. In a diminished scale every alternate-note chord is diminished.`}}
const hStackW=()=>stackQ('dimWH'),hStackH=()=>stackQ('dimHW');
function sameQ(sc){const r=pick(rootsFor(sc)),n=nn(r,sc),d=R(1,8),same=[1,2,3,4,5,6,7,8].filter(i=>i!==d&&i%2===d%2),other=[1,2,3,4,5,6,7,8].filter(i=>i%2!==d%2),a=pick(same),lbl=i=>`${n[i-1]} (the ${ord(i)} note)`,
   S=i=>[0,2,4,6].map(o=>pcOf(n[(i-1+o)%8])).sort((x,y)=>x-y).join();if(S(a)!==S(d))throw new Error('same');
  return{type:'choice',noBoard:true,key:`sm${sc}${r}${d}${a}`,text:`In the ${r} ${SCN[sc]} scale, the 7th chord stacked on ${n[d-1]} (the ${ord(d)} note) has the same four notes as the chord stacked on which other note?`,choices:mc(lbl(a),shuf(other).map(lbl)),ans:lbl(a),
   hint:'Alternate notes: the chord on one note re-uses notes that are 2, 4 and 6 scale steps away.',explain:`${scTxt(r,sc)}. From ${n[d-1]}: ${[0,2,4,6].map(o=>n[(d-1+o)%8]).join(' ')}. From ${n[a-1]}: ${[0,2,4,6].map(o=>n[(a-1+o)%8]).join(' ')}. Same four notes, so only notes with the same odd/even position share a chord: 2 different °7 chords in the whole scale.`}}
const hSameW=()=>sameQ('dimWH'),hSameH=()=>sameQ('dimHW');
/* click the notes of a chord that fits inside the scale */
function chordClickQ(sc,q){for(let k=0;k<400;k++){const r=pick(rootsFor(sc)),n=nn(r,sc),i=pick(fitIdx(sc,q)),rp=pcOf(n[i]),sem=chSemis(q).sort((a,b)=>a-b),pcs=sem.map(x=>(x+rp)%12),a=R(0,2),st=[a,a+1,a+2,a+3],lo=R(1,9),hi=lo+4;
   const tg=st.flatMap(s=>{const o=[];for(let f=lo;f<=hi;f++){const j=pcs.indexOf(pcAt(s,f));if(j>=0)o.push({s,f,t:q==='dim7'?['R','♭3','♭5','♭♭7'][j]:['R','3','5','♭7'][j]})}return o});if(tg.length<4||tg.length>8||new Set(tg.map(x=>x.t)).size<4)continue;
   const cn=q==='dim7'?n[i]+'°7':cname(rp,q)+'7',tones=q==='dim7'?[0,2,4,6].map(o=>n[(i+o)%8]).join(' '):chordNotes(cname(rp,q),q).join(' ');
   return{type:'multi',key:`cc${sc}${q}${r}${i}${a}${lo}`,box:[lo,hi],text:`${cn} fits inside the ${r} ${SCN[sc]} scale. Click every note of ${cn} on the ${SN[a]}, ${SN[a+1]}, ${SN[a+2]} and ${SN[a+3]} strings inside the shaded frets (${lo}–${hi}).`,marks:[],targets:tg,notes:byPitch(tg).map(p=>midi(p.s,p.f)),
    hint:'Spell the four chord notes first. Each one is a note of the scale, so check them against it.',explain:`${cn} = ${tones} (${CHORDS[q].f.replace(/b/g,'♭').replace(/#/g,'♯')}). Every pitch is in ${scTxt(r,sc)}. In the shaded frets: ${tg.map(p=>posTxt(p)).join(', ')}.`}}return chordClickQ(sc,q)}
const hTonesDim=()=>chordClickQ(pick(['dimWH','dimHW']),'dim7'),hTonesDimW=()=>chordClickQ('dimWH','dim7'),hTonesDimH=()=>chordClickQ('dimHW','dim7'),hTonesDom=()=>chordClickQ('dimHW','dom7'),hTonesDomW=()=>chordClickQ('dimWH','dom7');
/* which dominant 7th chord fits inside the scale */
function domFitQ(sc){const r=pick(rootsFor(sc)),n=nn(r,sc),p=spcs(r,sc),fit=fitIdx(sc,'dom7').map(i=>pcOf(n[i])),non=[0,1,2,3,4,5,6,7,8,9,10,11].filter(x=>!fit.includes(x)),a=pick(fit),others=shuf(non).slice(0,3),nmz=x=>cname(x,'dom7')+'7',ca=nmz(a);
  const miss=x=>chordNotes(cname(x,'dom7'),'dom7').find(t=>!p.includes(pcOf(t)));
  return{type:'choice',noBoard:true,key:`df${sc}${r}${a}`,text:`Which of these dominant 7th chords has all four of its notes inside the ${r} ${SCN[sc]} scale (${n.join(' ')})?`,choices:shuf([ca,...others.map(nmz)]),ans:ca,
   hint:'Spell each chord (1 3 5 ♭7) and check every note against the scale. One missing note rules a chord out.',explain:`${ca} = ${chordNotes(cname(a,'dom7'),'dom7').join(' ')}: all four pitches are in the scale. ${nmz(others[0])} fails because ${miss(others[0])} is not in it. In ${r} ${SCS[sc]} the dominant 7th chords sit on ${fit.sort((x,y)=>x-y).map(x=>cname(x,'dom7')).join(', ')}.`}}
const hDomW=()=>domFitQ('dimWH'),hDomH=()=>domFitQ('dimHW');
/* degree names of the dominant chords */
const hBankW=sbank('hw',[
 ['Stack alternate notes on any note of the whole-half diminished scale. What chord do you get?','A diminished 7th (°7)',['A dominant 7th','A minor 7th','A major 7th'],'Alternate notes are always 3 semitones apart (a minor 3rd): 0, 3, 6, 9 above the starting note.'],
 ['The 8 notes of C whole-half diminished give how many different °7 chords?','2',['8','4','1'],'The chord on a note equals the chord 2, 4 and 6 notes away. C°7 (C E♭ G♭ A) and D°7 (D F A♭ B) are the two.'],
 ['In C whole-half diminished (C D E♭ F G♭ G♯ A B), the C°7 chord is C E♭ G♭ A. Which other note starts the same chord?','E♭',['D','F','G♯'],'E♭ G♭ A C: the same four notes in a different order. Only the 1st, 3rd, 5th and 7th notes (C, E♭, G♭, A) start C°7.'],
 ['Which triad do you get by stacking alternate notes of a diminished scale?','Diminished',['Minor','Major','Augmented'],'Two stacked minor 3rds make a diminished triad (1 ♭3 ♭5).'],
 ['Besides the °7 chords, the whole-half diminished scale also contains dominant 7th chords. On which notes of C WH?','D, F, A♭ and B',['C, E♭, G♭ and A','C, E, G and B♭','D♭, E, G and B♭'],'D7 (D F♯ A C), F7 (F A C E♭), A♭7 (A♭ C E♭ G♭) and B7 (B D♯ F♯ A) each use only notes of the scale. The notes on 2nd, 4th, 6th and 8th degrees.'],
 ['On D, F, A♭ and B of C whole-half diminished, which other chords fit besides the dominant 7th?','Major, minor, m7 and m7♭5',['Major 7th and minor-major 7th','Augmented and augmented 7th','None, only dominant 7ths'],'On D the scale also holds D, Dm, Dm7 (D F A C) and Dm7♭5 (D F A♭ C); the same goes for F, A♭ and B. It does not contain any maj7 or augmented chord.']]);
const hBankH=sbank('hh',[
 ['Stack alternate notes on any note of the half-whole diminished scale. What chord do you get?','A diminished 7th (°7)',['A dominant 7th','A minor 7th','A major 7th'],'Alternate notes are 3 semitones apart: 0, 3, 6, 9.'],
 ['On which notes of C half-whole diminished (C D♭ D♯ E F♯ G A B♭) can you build a dominant 7th chord?','C, E♭ (D♯), G♭ (F♯) and A',['D♭, E, G and B♭','C, D♭, E and F♯','Every note'],'C7 (C E G B♭), E♭7 (E♭ G B♭ D♭), G♭7 (G♭ B♭ D♭ F♭) and A7 (A C♯ E G) use only scale notes. These are the 1st, 3rd, 5th and 7th notes, a minor 3rd apart.'],
 ['The dominant 7th chords inside C half-whole diminished are C7, E♭7, G♭7 and A7. What interval separates their roots?','Minor 3rds',['Major 3rds','Perfect 5ths','Whole steps'],'C → E♭ → G♭ → A: each a minor 3rd (3 semitones).'],
 ['Why can one half-whole diminished scale be used over four different dominant chords?','Its pattern repeats every minor 3rd, so each of those roots sees the same notes',['It has no half steps','It is a major scale','Each chord uses a different mode'],'The scale is symmetrical: the C HW notes are also the E♭ HW, G♭ HW and A HW notes.'],
 ['Which chord types besides dominant 7th and °7 sit on the root of the half-whole scale?','Major, minor, m7 and m7♭5',['Only major 7th','Only augmented','None'],'On C: C, Cm, Cm7 and Cm7♭5 also fit C HW (C D♭ D♯ E F♯ G A B♭). The scale is richer than just the 7♭9 sound.']]);


/* name the chord shown on the board (a chord that fits inside the scale) */
function shapeNameQ(sc,q){for(let k=0;k<200;k++){const r=pick(rootsFor(sc)),n=nn(r,sc),i=pick(fitIdx(sc,q)),rp=pcOf(n[i]),m=chordShape(rp,q);if(!m)continue;
  const rn=q==='dim7'?n[i]:cname(rp,'dom7'),a=rn+(q==='dim7'?'°7':'7'),cs=q==='dim7'?['m7♭5','7','m7','maj7']:['m7','maj7','m7♭5','°7'];
  return{type:'choice',key:`sn${sc}${q}${r}${i}${m.map(x=>x.s+'_'+x.f).join('')}`,text:`These four notes all belong to the ${r} ${SCN[sc]} scale. The root of the chord is marked R and the other notes show their chord degree. Which chord is it?`,marks:m,choices:mc(a,cs.map(x=>rn+x)),ans:a,notes:byPitch(m).map(p=>midi(p.s,p.f)),pm:'chord',
   hint:q==='dim7'?'Check the gaps between the notes from the root up: what interval repeats?':'Read the chord degrees (R 3 5 ♭7) and decide which chord has them.',explain:`${a}: the degrees are ${q==='dim7'?'1 ♭3 ♭5 ♭♭7 (three minor 3rds)':'1 3 5 ♭7 (major 3rd, minor 3rd, minor 3rd)'}, built on ${rn}${rn!==n[i]?` (spelled ${n[i]} in the scale)`:''}, note ${i+1} of ${scTxt(r,sc)}. ${q==='dim7'?[0,2,4,6].map(o=>n[(i+o)%8]).join(' '):chordNotes(rn,'dom7').join(' ')} are all scale pitches. On the board: ${m.map(p=>`${p.t} (${SL[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}return shapeNameQ(sc,q)}
const hShapeW=()=>shapeNameQ('dimWH',pick(['dim7','dom7'])),hShapeH=()=>shapeNameQ('dimHW',pick(['dim7','dom7']));
/* click every note on a string that can root a dominant 7th chord inside the scale */
function fitRootsQ(sc){for(let k=0;k<200;k++){const r=pick(rootsFor(sc)),n=nn(r,sc),fit=fitIdx(sc,'dom7'),s=R(0,5),tg=[];
  for(let f=0;f<=12;f++){const j=fit.find(i=>pcOf(n[i])===pcAt(s,f));if(j!==undefined)tg.push({s,f,t:n[j]})}if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`fr${sc}${r}${s}`,text:`In the ${r} ${SCN[sc]} scale (${n.join(' ')}), some notes can root a dominant 7th chord that fits entirely inside the scale. Click each of those notes on the ${SN[s]} string, frets 0–12.`,marks:[],targets:tg,notes:tg.map(p=>midi(p.s,p.f)),pm:'seq',
   hint:sc==='dimWH'?'Test one note: spell its 7th chord (1 3 5 ♭7) and check every note. Then use the symmetry.':'Test the root first, then use the minor-3rd symmetry to find the others.',explain:`Dominant 7th chords fit on ${fit.map(i=>cname(pcOf(n[i]),'dom7')+'7').join(', ')}: ${fit.length===4?'roots a minor 3rd apart':''}. On the ${SN[s]} string those pitches are at frets ${tg.map(p=>p.f).join(', ')}.`}}return fitRootsQ(sc)}
const hRootsW=()=>fitRootsQ('dimWH'),hRootsH=()=>fitRootsQ('dimHW');

/* ---------- Lesson 108: the three diminished scales ---------- */
const FAM=[0,1,2];
function minor3Q(){const sc=pick(['dimWH','dimHW']),r=R(0,11),ans=pick([3,6,9]),dis=shuf([1,2,4,5,7,8,10,11]).slice(0,3),f=x=>pcName(r+x)+' '+SCN[sc];
  if(pcSet(r,sc)!==pcSet((r+ans)%12,sc))throw new Error('m3');
  return{type:'choice',noBoard:true,key:`m3${sc}${r}${ans}`,text:`Which of these scales has exactly the same notes as ${f(0)}?`,choices:mc(f(ans),dis.map(f)),ans:f(ans),hint:'The scale repeats every minor 3rd. Go up in minor 3rds from the root.',
   explain:`A diminished scale repeats every minor 3rd (3 semitones), so ${[0,3,6,9].map(x=>pcName(r+x)).join(', ')} all start the same ${SCN[sc]} scale. Other roots give different sets of notes.`}}
function halfStepQ(){const toWH=Math.random()<.5,r=R(0,11),offs=toWH?[1,4,7,10]:[11,2,5,8],ans=pick(offs),dis=shuf([0,1,2,3,4,5,6,7,8,9,10,11].filter(x=>!offs.includes(x))).slice(0,3),a=toWH?'dimWH':'dimHW',b=toWH?'dimHW':'dimWH';
  if(pcSet(r,b)!==pcSet((r+ans)%12,a))throw new Error('hs');
  const f=x=>pcName(r+x)+' '+SCN[a];
  return{type:'choice',noBoard:true,key:`hs${toWH}${r}${ans}`,text:`Which of these scales has exactly the same notes as ${pcName(r)} ${SCN[b]}?`,choices:mc(f(ans),dis.map(f)),ans:f(ans),hint:toWH?'Think of how a half-whole scale is a whole-half scale shifted by one semitone.':'Shift the starting note by one semitone, then remember the minor-3rd repeats.',
   explain:toWH?`A half-whole scale from ${pcName(r)} has the same notes as the whole-half scale from the note a half step higher: ${pcName(r+1)} (and, repeating every minor 3rd, ${pcName(r+4)}, ${pcName(r+7)} and ${pcName(r+10)}).`:`A whole-half scale from ${pcName(r)} has the same notes as the half-whole scale from the note a half step lower: ${pcName(r+11)} (and ${pcName(r+2)}, ${pcName(r+5)}, ${pcName(r+8)}).`}}
function repeatQ(){for(let k=0;k<200;k++){const sc=pick(['dimWH','dimHW']),s=R(0,5),f=R(1,14),tg=[];for(let x=f%3;x<=15;x+=3)if(x!==f)tg.push({s,f:x,t:'R'});if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`rp${sc}${s}${f}`,text:`The marked note is a root of a ${SCN[sc]} scale (${pcName(pcAt(s,f))}) on the ${SN[s]} string. The same notes also form a ${SCN[sc]} scale from other roots on this string. Click every other fret from 0 to 15 where such a root sits.`,marks:[{s,f,t:'R',k:'root'}],targets:tg,notes:[midi(s,f)],
   hint:'The scale repeats every minor 3rd. How many frets is that?',explain:`A minor 3rd is 3 frets, so the same scale starts on every 3rd fret of the string: ${[f,...tg.map(p=>p.f)].sort((a,b)=>a-b).join(', ')} (${[f,...tg.map(p=>p.f)].sort((a,b)=>a-b).map(x=>pcName(pcAt(s,x))).join(', ')}).`}}return repeatQ()}
function whichQ(){for(let k=0;k<200;k++){const s=R(0,5),f=R(0,10),off=pick([1,2,4,5,7,8,10,11]);if(f+off>15)continue;const hw=[1,4,7,10].includes(off),a=hw?'Half-whole only':'Whole-half only',r=pcName(pcAt(s,f));
  return{type:'choice',key:`wh${s}${f}${off}`,text:`The root of a diminished scale (${r}) is marked, and the ? is ${off} semitones above it. Which diminished scale from ${r} contains that note?`,marks:[{s,f,t:'R',k:'root'},{s,f:f+off,t:'?',k:'q'}],choices:['Whole-half only','Half-whole only','Both','Neither'],ans:a,notes:[midi(s,f),midi(s,f+off)],
   hint:'Write both formulas in semitones above the root: 0 2 3 5 6 8 9 11 and 0 1 3 4 6 7 9 10.',explain:`The ? is ${off} semitones above ${r}. Whole-half has 0 2 3 5 6 8 9 11; half-whole has 0 1 3 4 6 7 9 10. ${off} is only in the ${hw?'half-whole':'whole-half'} list. (The notes they share are 3, 6, 9, plus the root.)`}}return whichQ()}

function halfStepClick(){for(let k=0;k<200;k++){const toWH=Math.random()<.5,s=R(0,5),f=R(1,13),t=toWH?f+1:f-1;if(t<0||t>15)continue;const a=toWH?'dimHW':'dimWH',b=toWH?'dimWH':'dimHW',r=pcName(pcAt(s,f)),r2=pcName(pcAt(s,t));
  if(pcSet(pcAt(s,f),a)!==pcSet(pcAt(s,t),b))throw new Error('hsc');
  return{type:'click',key:`hc${toWH}${s}${f}`,text:`The marked note is ${r}, the root of a ${SCN[a]} scale. Click the root of the ${SCN[b]} scale with exactly the same notes that lies a half step ${toWH?'above':'below'} it on the ${SN[s]} string.`,marks:[{s,f,t:'R',k:'root'}],target:{s,f:t,t:'R'},notes:[midi(s,f),midi(s,t)],
   hint:toWH?'A half-whole scale equals a whole-half scale that starts on a different note. Is it one semitone up or down?':'Which way do you shift the starting note: one semitone up or down?',explain:`${r} ${SCN[a]} = ${r2} ${SCN[b]}: ${toWH?'half-whole equals the whole-half scale a half step higher':'whole-half equals the half-whole scale a half step lower'}. That is fret ${t} on the ${SN[s]} string (${r2}).`}}return halfStepClick()}
function sameNotesQ(){for(let k=0;k<200;k++){const sc=pick(['dimWH','dimHW']),s=R(0,5),f=R(0,9),d=pick([1,2,3,3,3,4,5,6,6,6,7,8,9]),t=f+d;if(t>15)continue;const same=d%3===0,a=same?'Yes, the same notes':'No, different notes';
  return{type:'choice',key:`sn2${sc}${s}${f}${d}`,text:`R is the root of a ${SCN[sc]} scale. The ? is on the same string, ${fr(d)} higher. Is the ${SCN[sc]} scale that starts on the ? made of the same notes?`,marks:[{s,f,t:'R',k:'root'},{s,f:t,t:'?',k:'q'}],choices:['Yes, the same notes','No, different notes'],ans:a,notes:[midi(s,f),midi(s,t)],
   hint:'How many frets make a minor 3rd? That is how often the scale repeats.',explain:`The scale repeats every minor 3rd (3 frets), so a scale starting ${fr(d)} higher has the ${same?'same notes':'notes of a different set'}${same?'':` (${d} is not a multiple of 3)`}. The ? is ${pcName(pcAt(s,t))}, R is ${pcName(pcAt(s,f))}.`}}return sameNotesQ()}
const OVER=[['dim7','°7','dimWH'],['dom7','7♭9','dimHW']];
function overQ(){const[ ,sym,sc]=pick(OVER),r=pick(rootsFor(sc2(sym))),ct=sym==='°7'?[0,3,6,9]:[0,4,7,10,1],modes=['ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian'].filter(m=>!subsetOf(ct,0,spcs0(r,m))),a=`${r} ${SCN[sc]}`;
  const mk=chordShape(pcOf(r),sym==='°7'?'dim7':'dom7');if(!mk)return overQ();
  return{type:'choice',key:`ov${sym}${r}${mk.map(x=>x.s+'_'+x.f).join('')}`,text:`The marks show the chord tones of ${r}${sym}${sym==='°7'?'':' (the ♭9 is not marked)'}; R is the root. Which scale is the standard choice over this chord?`,marks:mk,notes:byPitch(mk).map(p=>midi(p.s,p.f)),pm:'chord',choices:mc(a,shuf(modes).slice(0,3).map(m=>`${r} ${SCALES[m].name}`)),ans:a,hint:sym==='°7'?'Which scale can supply all four chord tones (1 ♭3 ♭5 ♭♭7)?':'Which scale contains the root, 3rd, 5th, ♭7 and the ♭9?',
   explain:sym==='°7'?`${r}°7 is ${r} ${CHORDS.dim7.f.replace(/b/g,'♭')} and ${scTxt(r,'dimWH')} contains all four chord tones, with the other notes as tensions. (The half-whole scale also holds the °7 notes, but it adds a natural 3rd a half step above the chord's ♭3, so the whole-half scale is the standard choice.)`:`${r}7♭9 needs the ♭9 above the root; ${scTxt(r,'dimHW')} contains 1 3 5 ♭7 and the ♭9, and adds ♯9, ♯11 and 13 as extra tensions. Major-scale modes lack the ♭9 or another chord tone.`}}
const sc2=sym=>sym==='°7'?'dimWH':'dimHW';
function spcs0(r,m){return scaleNotes(r,m).map(pcOf)}
const dBank=sbank('db',[
 ['How many different diminished scales (sets of 8 notes) are there?','3',['12','2','6'],'Each scale repeats every minor 3rd, so 12 starting notes give only 3 sets. Each set is the whole-half scale from 4 roots and the half-whole scale from 4 other roots.'],
 ['Why are there only 3 different diminished scales?','The scale repeats every minor 3rd (3 semitones), and 12 ÷ 3 = 4 starting notes share each set',['Because there are 3 diminished chords only','Because it has 3 whole steps','Because it is a 3-note scale'],'Starting on C, E♭, G♭ or A gives the same WH scale; starting a semitone higher gives the next one, and a third one starts a tone above C.'],
 ['A whole-half and a half-whole diminished scale can contain exactly the same notes. When?','When the half-whole root is a half step below the whole-half root (C HW = D♭ WH)',['Never, they are always different','When both start on the same note','When the roots are a tritone apart'],'C HW: C D♭ D♯ E F♯ G A B♭. D♭ WH: D♭ E♭ E G♭ G A B♭ C. Same pitches.'],
 ['Which chord is the whole-half diminished scale built to play over?','A diminished 7th chord',['A dominant 7♭9 chord','A major 7th chord','A m7 chord'],'WH over °7 chords (all four chord tones fit); HW over dominant 7♭9 chords.'],
 ['Which chord is the half-whole diminished scale built to play over?','A dominant 7♭9 chord',['A diminished 7th chord','A major 7th chord','A minor 7th chord'],'HW over dominant 7♭9: its 1 3 5 ♭7 are chord tones and ♭9 ♯9 ♯11 13 are tensions.'],
 ['Each diminished scale contains how many diminished 7th chords?','2',['1','4','8'],'There are only 3 different °7 chords. Each scale holds two of them: C WH has C°7 and D°7; C HW has C°7 and D♭°7.']]);

const LS={
 wh:{h:'whole-half-diminished',n:'Lesson 104',title:'Whole-half diminished',sub:'W H W H W H W H: an 8-note symmetrical scale built on the diminished 7th.',
  ex:[['Spell it',[wSpell,wNotIn]],['One string',[wOne]],['Fill the box',[wBox]],['Degrees',[wFind,wName]],['Steps & ideas',[wStep,wBank]]],
  test:[...rep(wSpell,3),wNotIn,...rep(wOne,2),...rep(wBox,2),...rep(wFind,2),...rep(wName,2),wStep,wBank,wBank]},
 whh:{h:'harmonized-whole-half',n:'Lesson 105',title:'Harmonized whole-half',sub:'Stacking alternate notes: every chord is diminished; dominants hide on the other notes.',
  ex:[['Stack it',[hStackW,hSameW]],['Chord tones on the neck',[hTonesDimW,hTonesDomW,hShapeW]],['Dominants inside',[hDomW,hRootsW,hBankW]]],
  test:[...rep(hStackW,3),hSameW,...rep(hTonesDimW,2),hTonesDomW,...rep(hShapeW,3),hDomW,...rep(hRootsW,3),hBankW]},
 hw:{h:'half-whole-diminished',n:'Lesson 106',title:'Half-whole diminished',sub:'H W H W H W H W: the dominant diminished scale, with ♭9, ♯9, ♯11 and 13.',
  ex:[['Spell it',[vSpell,vNotIn]],['One string',[vOne]],['Fill the box',[vBox]],['Degrees & tensions',[vFind,vName,hwTension]],['Steps & ideas',[vStep,vBank2]]],
  test:[...rep(vSpell,3),vNotIn,...rep(vOne,2),...rep(vBox,2),vFind,vName,...rep(hwTension,3),vStep,vBank2]},
 hwh:{h:'harmonized-half-whole',n:'Lesson 107',title:'Harmonized half-whole',sub:'Dominant 7th chords on 1, ♭3, ♭5 and 6, plus °7 chords on every note.',
  ex:[['Stack it',[hStackH,hSameH]],['Chord tones on the neck',[hTonesDimH,hTonesDom,hShapeH]],['Dominants inside',[hDomH,hRootsH,hBankH]]],
  test:[...rep(hStackH,3),hSameH,hTonesDimH,...rep(hTonesDom,2),...rep(hShapeH,3),hDomH,...rep(hRootsH,3),hBankH]},
 dim:{h:'diminished-scales',n:'Lesson 108',title:'Diminished scales',sub:'Only three different scales: symmetry, WH vs HW, and which chord each one fits.',
  ex:[['Same notes?',[minor3Q,halfStepQ,sameNotesQ]],['On the neck',[halfStepClick,repeatQ,whichQ]],['Over chords',[overQ,dBank]]],
  test:[...rep(minor3Q,2),...rep(halfStepQ,2),...rep(sameNotesQ,2),...rep(halfStepClick,2),...rep(repeatQ,2),...rep(whichQ,2),...rep(overQ,2),dBank]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 104–108 mixed.',
  ex:[['Lessons 104–105',[wSpell,wNotIn,wOne,wBox,wFind,wName,wStep,wBank,hStackW,hSameW,hTonesDimW,hTonesDomW,hShapeW,hDomW,hRootsW,hBankW]],['Lessons 106–108',[vSpell,vOne,vBox,vFind,hwTension,vBank2,hStackH,hSameH,hTonesDom,hShapeH,hDomH,hRootsH,hBankH,minor3Q,halfStepQ,sameNotesQ,halfStepClick,repeatQ,whichQ,overQ,dBank]]],
  test:[wSpell,wOne,wBox,wName,wBank,hStackW,hTonesDimW,hShapeW,hDomW,vSpell,vOne,hwTension,vBank2,hRootsH,hShapeH,minor3Q,halfStepClick,repeatQ,whichQ,overQ]}};
const ORDER=['wh','whh','hw','hwh','dim','final'],STORE='gi-best-p26';

/* ---------- notes ---------- */
const stepRows=sc=>{const n=nn('C',sc),sm=fmlSemis(SCALES[sc].f);return n.map((x,i)=>`<tr><td>${TOK[sc][i]}</td><td>${x}</td><td>${(i<7?sm[i+1]:12)-sm[i]===2?'W':'H'}</td></tr>`).join('')};
const chordRows=sc=>{const n=nn('C',sc);return n.map((x,i)=>{const ix=[0,2,4,6].map(o=>(i+o)%8);return`<tr><td>${x}</td><td>${n[i]}°7</td><td>${ix.map(j=>n[j]).join(' ')}</td></tr>`}).join('')};
const domRoots=sc=>fitIdx(sc,'dom7').map(i=>cname(pcOf(nn('C',sc)[i]),'dom7')+'7').join(', ');
const famRows=()=>[0,1,2].map(m=>{const wh=[0,3,6,9].map(x=>pcName(x+m)),hw=[0,3,6,9].map(x=>pcName(x+m-1));return`<tr><td>${m+1}</td><td>${wh.join(' ')}</td><td>${hw.join(' ')}</td></tr>`}).join('');
const NOTES={
 wh:`<div class="cols"><div><h3>C whole-half diminished</h3><table class="stack"><thead><tr><th>Degree</th><th>Note</th><th>Step up</th></tr></thead><tbody>${stepRows('dimWH')}</tbody></table><p class="small">Convention: formula 1 2 ♭3 4 ♭5 ♯5 6 7, spelled as in the workbook (G♭ and G♯ both appear because 8 notes share 7 letter names). The 6th degree is written ♯5; it is the same pitch as ♭6, and the ♭♭7 of a °7 chord is written 6.</p></div>
  <div><h3>Key ideas</h3><ul><li>Whole step, half step, repeated: 2+1+2+1+2+1+2+1 = 12 semitones, 8 notes.</li><li>It is symmetrical: the pattern repeats every minor 3rd (3 frets).</li><li>Alternate notes (1 ♭3 ♭5 6) spell a diminished 7th chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C WH on one string: frets 3, 5, 6, 8, 9, 11, 12, 14, 15 on the A string.</li><li>Slide the same fingering up 3 frets: the notes stay the same.</li><li>Play it over a C°7 chord.</li></ul></div></div>`,
 whh:`<div class="cols"><div><h3>Chords from C WH (alternate notes)</h3><table class="stack"><thead><tr><th>Root</th><th>Chord</th><th>Notes</th></tr></thead><tbody>${chordRows('dimWH')}</tbody></table><p class="small">Checked by computing: every 7th chord stacked on a WH note is a diminished 7th, giving only 2 different chords (C°7 and D°7). Dominant 7th chords also fit entirely inside C WH on ${domRoots('dimWH')}.</p></div>
  <div><h3>Key ideas</h3><ul><li>Stacking alternate notes always gives minor 3rds: °7 chords and dim triads.</li><li>Only 2 different °7 chords appear: notes 1, 3, 5, 7 make one; notes 2, 4, 6, 8 make the other.</li><li>The same scale also holds major, minor and dominant chords on its 2nd, 4th, 6th and 8th notes.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C°7 and D°7 shapes, then run C WH between them.</li><li>Find D7 inside the scale (D F♯ A C) and play it over D7.</li></ul></div></div>`,
 hw:`<div class="cols"><div><h3>C half-whole diminished</h3><table class="stack"><thead><tr><th>Degree</th><th>Note</th><th>Step up</th></tr></thead><tbody>${stepRows('dimHW')}</tbody></table><p class="small">Convention: formula 1 ♭2 ♯2 3 ♯4 5 6 ♭7 (the ♯2 is the pitch of ♭3, spelled D♯ so each letter is used). Over a dominant chord these are 1 ♭9 ♯9 3 ♯11 5 13 ♭7.</p></div>
  <div><h3>Key ideas</h3><ul><li>Half step, whole step, repeated. Also 8 notes, also symmetrical every minor 3rd.</li><li>1 3 5 ♭7 are a dominant 7th chord; ♭9, ♯9, ♯11 and 13 are the tensions.</li><li>That is why it is the classic scale over a dominant 7♭9 chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C HW on one string, starting with a 1-fret step.</li><li>Play C7♭9, then run C HW over it.</li><li>Find the 4 tensions: ♭9, ♯9, ♯11 and 13 around the root.</li></ul></div></div>`,
 hwh:`<div class="cols"><div><h3>Chords from C HW (alternate notes)</h3><table class="stack"><thead><tr><th>Root</th><th>Chord</th><th>Notes</th></tr></thead><tbody>${chordRows('dimHW')}</tbody></table><p class="small">Checked by computing: alternate notes give a °7 on every note (2 different chords: C°7 and D♭°7). Dominant 7th chords fit entirely inside C HW on ${domRoots('dimHW')}, the 1st, 3rd (♯2/♭3), 5th (♯4/♭5) and 7th (6) notes.</p></div>
  <div><h3>Key ideas</h3><ul><li>Dominant 7th chords sit on 1, ♭3, ♭5 and 6: roots a minor 3rd apart.</li><li>The notes ♭2, 3, 5 and ♭7 (D♭ E G B♭) carry the other °7 chord (D♭°7) but root no dominant chord inside the scale.</li><li>One scale therefore covers four dominant chords: C7, E♭7, G♭7 and A7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C HW, then outline C7, E♭7, G♭7 and A7 from it.</li><li>Pick a 7♭9 chord and play its HW scale from its root.</li></ul></div></div>`,
 dim:`<div class="cols"><div><h3>The three diminished scales</h3><div class="scroll"><table><thead><tr><th>Set</th><th>Whole-half roots</th><th>Half-whole roots</th></tr></thead><tbody>${famRows()}</tbody></table></div><p class="small">Each row is one set of 8 notes. A half-whole scale equals the whole-half scale a half step higher: C HW = D♭ WH.</p></div>
  <div><h3>Key ideas</h3><ul><li>Symmetry: 12 roots ÷ 3 semitones = only 3 sets of notes.</li><li>Each set has 4 WH names and 4 HW names.</li><li>WH over °7 chords, HW over dominant 7♭9 chords; each set contains 2 of the 3 diminished 7th chords.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play one fingering at frets 3, 6, 9 and 12 to hear the same scale again.</li><li>Move it 1 fret: a new set.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 104–108: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 109 returns to the diminished 7th chord itself: its construction, four names and shapes that repeat every 3 frets.</p></div></div>`};
