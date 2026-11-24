/* ===== Part 9: lessons 32–36 ===== */
/* ---------- shared voicing helpers ---------- */
const m3=x=>((x%3)+3)%3,m4=x=>((x%4)+4)%4;
const LB={maj:['R','3','5'],min:['R','♭3','5'],dim:['R','♭3','♭5'],aug:['R','3','♯5'],
 maj7:['R','3','5','7'],dom7:['R','3','5','♭7'],m7:['R','♭3','5','♭7'],m7b5:['R','♭3','♭5','♭7'],dim7:['R','♭3','♭5','𝄫7'],mMaj7:['R','♭3','5','7']};
const INVN=['root position','1st inversion','2nd inversion','3rd inversion'];
const TONE=['root','3rd','5th','7th'];
/* every playable way to sound pcs[i] on strings[i]: frets lo..hi (no open strings), pitch strictly rising, fret spread < span */
function vAll(strings,pcs,lo,hi,span){const out=[];
  const rec=(i,acc)=>{if(i===strings.length){const mn=Math.min(...acc),mx=Math.max(...acc);
      if(mx-mn<=span-1){const m=acc.map((f,j)=>midi(strings[j],f));if(m.every((x,j)=>j===0||x>m[j-1]))out.push(acc.slice())}return}
    for(let f=lo;f<=hi;f++)if(pcAt(strings[i],f)===pcs[i]){acc.push(f);rec(i+1,acc);acc.pop()}};
  rec(0,[]);return out}
function vOne(strings,pcs,lo,hi=15,span=4){const a=vAll(strings,pcs,lo,hi,span);if(!a.length)return null;
  a.sort((x,y)=>Math.max(...x)-Math.max(...y)||x[0]-y[0]);return a[0].map((f,i)=>({s:strings[i],f}))}
/* voicing of chord (root,q): order = chord-tone indices from lowest to highest string */
function mkV(root,q,strings,order,lo,span=4){const cn=chordNotes(root,q),pcs=order.map(i=>pcOf(cn[i])),p=vOne(strings,pcs,lo,15,span);
  return p?p.map((x,j)=>({...x,idx:order[j],name:cn[order[j]],deg:LB[q][order[j]]})):null}
const strList=st=>{const a=st.map(s=>SN[s]);return a.length>1?a.slice(0,-1).join(', ')+' and '+a[a.length-1]:a[0]};
const bx=(...vs)=>{const fs=vs.flat().map(p=>p.f);return[Math.max(0,Math.min(...fs)-1),Math.min(15,Math.max(...fs)+1)]};
const vNotes=v=>v.map(p=>midi(p.s,p.f));
const vTxt=v=>v.map(p=>`${p.name} (${SN[p.s]} string, fret ${p.f})`).join(', ');
const nmark=(p,mode)=>({s:p.s,f:p.f,t:mode==='deg'?p.deg:p.name,k:p.idx===0?'root':'q'});
/* roots whose chord spelling avoids double accidentals and awkward C♭/F♭/E♯/B♯ (dim7 may use one 𝄫 or the flats) */
function okSpell(q,r){const s=chordNotes(r,q).join(' ');if(/𝄪/.test(s))return false;const d=(s.match(/𝄫/g)||[]).length;
  if(q==='dim7')return d<=1;return d===0&&!/C♭|F♭|E♯|B♯/.test(s)}
const bad={test:s=>/𝄪|𝄫|C♭|F♭|E♯|B♯/.test(s)};
function rootFor(q,pool=KEASY){for(let i=0;i<120;i++){const r=pick(pool);if(okSpell(q,r))return r}return'C'}
const semiSpan=v=>midi(v[v.length-1].s,v[v.length-1].f)-midi(v[0].s,v[0].f);
const noteList=a=>a.join(' ');

/* ---------- shared 7th-chord voicing families ---------- */
const Q4=['maj7','dom7','m7','m7b5'];
const QLAB={maj7:'major 7th (maj7)',dom7:'dominant 7th (7)',m7:'minor 7th (m7)',m7b5:'half-diminished (m7♭5)',dim7:'diminished 7th (°7)',mMaj7:'minor-major 7th (m(maj7))'};
const fmlTxt=q=>CHORDS[q].f.replace(/bb/g,'𝄫').replace(/b/g,'♭').replace(/#/g,'♯');
const seventhName=q=>q==='maj7'?'major 7th':q==='dim7'?'diminished 7th (𝄫7)':'minor 7th (♭7)';
const csym=(r,q)=>chordSym(r,q);
const TL=['R','3','5','7'];
const FAMS={
 close:{name:'close position',cap:'Close position',sets:[[2,3,4,5],[1,2,3,4],[0,1,2,3]],ord:b=>[b,b+1,b+2,b+3].map(m4),span:5},
 d2:{name:'Drop 2',cap:'Drop 2',sets:[[0,1,2,3],[1,2,3,4],[2,3,4,5]],ord:b=>[b,b-2,b-1,b+1].map(m4),span:4},
 d3:{name:'Drop 3',cap:'Drop 3',sets:[[0,2,3,4],[1,3,4,5]],ord:b=>[b,b-1,b+1,b+2].map(m4),span:4}};
const ordTxt=(fk,b)=>FAMS[fk].ord(b).map(i=>TL[i]).join('–');
/* a random playable voicing of family fk; bs = allowed inversions (bass tone indices) */
function vPick(fk,qs=Q4,bs=[0,1,2,3],loMax=9){const F=FAMS[fk];
  for(let t=0;t<800;t++){const q=pick(qs),root=rootFor(q),b=pick(bs),st=pick(F.sets),v=mkV(root,q,st,F.ord(b),R(1,loMax),F.span);if(v)return{fk,q,root,b,st,v,sym:csym(root,q),cn:chordNotes(root,q)}}
  const q=qs[0],root='C';for(const b of bs)for(const st of F.sets){const v=mkV(root,q,st,F.ord(b),1,F.span);if(v)return{fk,q,root,b,st,v,sym:csym(root,q),cn:chordNotes(root,q)}}
  return{fk:'d2',q:'dom7',root:'C',b:0,st:[1,2,3,4],v:mkV('C','dom7',[1,2,3,4],FAMS.d2.ord(0),1),sym:'C7',cn:chordNotes('C','dom7')}}
const vExp=o=>`${o.sym} = ${o.cn.join(' ')}. ${FAMS[o.fk].cap}, ${INVN[o.b]} (${ordTxt(o.fk,o.b)}, low to high) on the ${strList(o.st)} strings: ${vTxt(o.v)}.`;
const vKey=(p,o)=>`${p}${o.fk}${o.root}${o.q}${o.b}${o.st.join('')}`;
const famDesc=o=>`${o.sym} ${FAMS[o.fk].name} voicing, ${INVN[o.b]},`;

/* ----- generic generators for a voicing family ----- */
const fBuild=(fk,qs)=>()=>{const o=vPick(fk,qs||Q4,fk==='close'?[0]:[0,1,2,3]);
  return{type:'multi',key:vKey('b',o),box:bx(o.v),text:`${cap(famDesc(o))} on the ${strList(o.st)} strings. The bass note is marked. Click the other three notes inside the shaded frets.`,
   marks:[nmark(o.v[0],'deg')],targets:o.v.slice(1).map(p=>({s:p.s,f:p.f,t:p.deg})),notes:vNotes(o.v),
   hint:`Spell the chord first (${o.cn.join(' ')}); the pattern from the bass up is ${ordTxt(fk,o.b)}. Find each note on its string near the marked fret.`,explain:vExp(o)}};
const fMiss=(fk,qs)=>()=>{const o=vPick(fk,qs||Q4,fk==='close'?[0]:[0,1,2,3]),h=R(0,3),p=o.v[h];
  return{type:'click',key:vKey('m',o)+h,box:bx(o.v),text:`${cap(famDesc(o))} on the ${strList(o.st)} strings. Three notes are shown; click the missing ${p.idx===0?'root':TONE[p.idx]} (${SN[p.s]} string).`,
   marks:o.v.filter((x,i)=>i!==h).map(x=>nmark(x,'deg')),target:{s:p.s,f:p.f,t:p.deg},notes:vNotes(o.v),
   hint:`The ${p.idx===0?'root':TONE[p.idx]} of ${o.sym} is ${p.name}. Look for it on the ${SN[p.s]} string inside the shaded frets.`,explain:`The missing note is ${p.name}, the ${p.idx===0?'root':TONE[p.idx]}. ${vExp(o)}`}};
const fInv=(fk,qs)=>()=>{const o=vPick(fk,qs||Q4),bn=o.v[0];
  return{type:'choice',key:vKey('i',o),text:`These marks are the notes of ${o.sym} in a ${FAMS[fk].name} voicing (root highlighted). Which inversion is it? (Inversions are named by the lowest note.)`,
   marks:o.v.map(p=>nmark(p,'name')),choices:INVN,ans:INVN[o.b],notes:vNotes(o.v),
   hint:'Find the lowest-sounding note and decide which chord tone it is.',explain:`The lowest note is ${bn.name}, the ${bn.idx===0?'root':TONE[bn.idx]} of ${o.sym}, so this is ${INVN[o.b]}. ${vExp(o)}`}};
const fTypeNames={close:'Close position',d2:'Drop 2',d3:'Drop 3'};
const fType=(fks,plain)=>()=>{const fk=pick(fks),o=vPick(fk),sp=semiSpan(o.v),nmz=k=>plain&&k!=='close'?'Spread (not close)':fTypeNames[k],a=nmz(fk);
  const why={close:`The four notes sit on adjacent strings and within one octave (${sp} semitones from lowest to highest): close position.`,
   d2:plain?`The notes span ${sp} semitones, more than an octave, so a note has been moved down an octave: it is a spread voicing, not close position.`:`The four notes sit on adjacent strings but span ${sp} semitones, more than an octave: the 2nd-highest note of a close voicing has been dropped an octave (Drop 2).`,
   d3:`One string is skipped under three adjacent strings and the notes span ${sp} semitones: the 3rd-highest note of a close voicing has been dropped (Drop 3).`};
  return{type:'choice',key:vKey('t',o)+(plain?'p':''),text:`These marks are the notes of ${o.sym}. What kind of voicing is it?`,marks:o.v.map(p=>nmark(p,'name')),choices:fks.map(nmz),ans:a,notes:vNotes(o.v),
   hint:fks.includes('d3')?'Are the strings adjacent or is one skipped? Then check whether the notes fit inside one octave.':'Compare the lowest and highest note: do all four fit inside one octave (12 semitones)?',explain:`${why[fk]} ${plain?`${o.sym} = ${o.cn.join(' ')}: ${vTxt(o.v)}.`:vExp(o)}`}};
const fSpell=fk=>()=>{const q=pick(Q4),root=rootFor(q),cn=chordNotes(root,q),c=R(0,3),cl=[0,1,2,3].map(i=>m4(c+i)),nmz=a=>a.map(i=>cn[i]).join(' ');
  if(fk==='close'){const a=nmz(cl);
    return{type:'choice',noBoard:true,key:`cs${root}${q}${c}`,text:`Spell ${csym(root,q)} in close position, ${INVN[c]}, from the lowest note to the highest.`,choices:mc(a,[0,1,2,3].filter(x=>x!==c).map(x=>nmz([0,1,2,3].map(i=>m4(x+i))))),ans:a,
     hint:`${cap(INVN[c])} has the ${c===0?'root':TONE[c]} in the bass. Then keep stacking chord tones upward.`,explain:`${csym(root,q)} = ${cn.join(' ')}. Close position ${INVN[c]} starts on the ${c===0?'root':TONE[c]} and stacks the next three chord tones: ${a}.`}}
  const d2=fk==='d2',dr=d2?[cl[2],cl[0],cl[1],cl[3]]:[cl[1],cl[0],cl[2],cl[3]],other=d2?[cl[1],cl[0],cl[2],cl[3]]:[cl[2],cl[0],cl[1],cl[3]],top=[cl[3],cl[0],cl[1],cl[2]],a=nmz(dr),bass=dr[0];
  return{type:'choice',noBoard:true,key:`${fk}s${root}${q}${c}`,text:`${csym(root,q)} in close position, ${INVN[c]}, is ${nmz(cl)} (low to high). Drop the ${d2?'2nd':'3rd'}-highest note down an octave. What is the new voicing from the lowest note to the highest?`,
   choices:mc(a,[nmz(cl),nmz(other),nmz(top),nmz([cl[3],cl[2],cl[1],cl[0]])]),ans:a,
   hint:`The notes are numbered from the top: the highest is 1, the next is 2, and so on. Move the ${d2?'2nd':'3rd'}-highest note an octave down, so it becomes the new bass.`,
   explain:`The ${d2?'2nd':'3rd'}-highest note is ${cn[d2?cl[2]:cl[1]]}. Dropped an octave it becomes the lowest note: ${a}. With the ${bass===0?'root':TONE[bass]} in the bass this is ${FAMS[fk].cap} ${INVN[bass]}.`}};

function bankFor(fk){return{
 close:[
  ['What does close position mean for a 7th chord?','All four notes fit inside one octave, stacked in thirds (or an inversion of that stack)',['The chord uses only open strings','The notes are played on one string','Two notes are doubled'],'In close position the four chord tones are as near to each other as possible: R 3 5 7 (or a rotation of it).'],
  ['In close position, what is the order of a root-position 7th chord from low to high?','Root – 3rd – 5th – 7th',['Root – 5th – 7th – 3rd','Root – 7th – 3rd – 5th','7th – root – 3rd – 5th'],'Stacked thirds: R 3 5 7.'],
  ['How many inversions does a 7th chord have (besides root position)?','3',['2','4','1'],'Root position, 1st (3rd in the bass), 2nd (5th in the bass) and 3rd (7th in the bass) inversion.'],
  ['Which chord tone is in the bass in 3rd inversion?','The 7th',['The root','The 3rd','The 5th'],'Inversions are named by the bass note: root, 3rd, 5th, 7th.'],
  ['Why are close-position 7th chords hard on guitar?','Neighbouring strings are a 4th apart, so four close notes need a wide stretch',['The notes are too low to hear','Guitars cannot play 7th chords','They need open strings'],'Four close notes need to climb about a 3rd per string, but the strings climb a 4th, so the frets fall by 1–2 each time and a 5-fret stretch is needed. This is why we move to Drop 2 and Drop 3.'],
  ['Which root-position close-position 7th chord fits within a 4-fret reach on D–G–B–e?','Major 7th',['Dominant 7th','Minor 7th','Half-diminished 7th'],'Cmaj7: frets 10–9–8–7 (4 frets). C7 is 10–9–8–6 and Cm7 is 10–8–8–6, both a 5-fret stretch.'],
  ['The 7th is a half step below the root (one octave up) in which chord?','Major 7th',['Dominant 7th','Minor 7th','Half-diminished 7th'],'A major 7th is 11 semitones above the root: one below the octave. A minor 7th is two below.'],
  ['In 1st inversion close position, which note is lowest?','The 3rd',['The root','The 5th','The 7th'],'1st inversion: 3rd in the bass: 3–5–7–R.']],
 d2:[
  ['How do you make a Drop 2 voicing?','Take a close voicing and drop its 2nd-highest note down an octave',['Drop the highest note an octave','Drop the root two octaves','Remove the 2nd note'],'Count from the top: the 2nd-highest note moves down an octave and becomes the new bass.'],
  ['Which strings do Drop 2 voicings use on guitar?','Four adjacent strings',['Four strings with one skipped','Only the top three strings','Any strings, with open strings'],'Drop 2 voicings fit on adjacent sets: E–A–D–G, A–D–G–B and D–G–B–e.'],
  ['What is the order of a root-position Drop 2 voicing from low to high?','R – 5th – 7th – 3rd',['R – 3rd – 5th – 7th','R – 7th – 3rd – 5th','3rd – R – 5th – 7th'],'Close 5–7–R–3 with the 2nd-highest (R) dropped gives R–5–7–3.'],
  ['Which note is highest in a root-position Drop 2 voicing?','The 3rd',['The root','The 5th','The 7th'],'R–5–7–3: the 3rd is on top.'],
  ['Which note is in the bass of a 1st-inversion Drop 2 voicing?','The 3rd',['The root','The 5th','The 7th'],'1st inversion = 3rd in the bass: 3–7–R–5.'],
  ['Why are Drop 2 chords more guitar-friendly than close position 7ths?','The notes are spread wider so they fit in a 4-fret hand shape',['They use fewer notes','They are always open chords','They never need barring'],'Moving one note down an octave shrinks the stretch, because neighbouring strings are a 4th apart and the spread voicing matches that spacing better.'],
  ['A Drop 2 voicing of Cmaj7 in root position has which notes from low to high?','C G B E',['C E G B','E G B C','G C E B'],'Close 2nd inversion is G B C E (low to high). Drop the 2nd-highest note (C) an octave and the order becomes C G B E.'],
  ['How many notes does a Drop 2 chord have?','4 (all the chord tones of a 7th chord)',['3','5','2'],'Drop 2 chords are four-note 7th chord voicings.']],
 d3:[
  ['How do you make a Drop 3 voicing?','Take a close voicing and drop its 3rd-highest note down an octave',['Drop the 2nd-highest note an octave','Drop the root two octaves','Remove the 3rd'],'Count from the top: the 3rd-highest note moves down an octave and becomes the new bass.'],
  ['Which strings do Drop 3 voicings use?','Four strings with one skipped: E–D–G–B or A–G–B–e',['Four adjacent strings','The top three strings','Six strings'],'The bass note is on its own, then a string is skipped before the three upper notes.'],
  ['What is the order of a root-position Drop 3 voicing from low to high?','R – 7th – 3rd – 5th',['R – 5th – 7th – 3rd','R – 3rd – 5th – 7th','5th – R – 3rd – 7th'],'Close 7–R–3–5 with the 3rd-highest note (the root) dropped an octave gives R–7–3–5.'],
  ['Which note is in the bass of a 1st-inversion Drop 3 voicing?','The 3rd',['The root','The 5th','The 7th'],'1st inversion = 3rd in the bass: 3–R–5–7.'],
  ['Which inversion of a Drop 3 voicing has the 7th in the bass?','3rd inversion',['Root position','1st inversion','2nd inversion'],'3rd inversion: 7–5–R–3 from low to high.'],
  ['Which of these is a Drop 3 voicing of Cmaj7 (low to high)?','C B E G',['C G B E','C E G B','E G B C'],'Close 3rd inversion is B C E G (low to high). The 3rd-highest note is C; dropped an octave it becomes the bass: C B E G.'],
  ['A Drop 3 voicing sounds…','more open than close position, with a clear bass note',['exactly like close position','higher than close position','like a power chord'],'The dropped note adds a bass note an octave below, so the chord spreads out.'],
  ['How many strings does a Drop 3 voicing skip?','One (between the bass note and the upper three)',['None','Two','Three'],'E–[A]–D–G–B or A–[D]–G–B–e.']]}[fk]}
const fBank=fk=>sbank('fb'+fk,bankFor(fk));

/* ---------- Lesson 32: 7th chords ---------- */
const sBank=sbank('sb',[
 ['How is a 7th chord built?','A triad plus the note a 3rd above its 5th',['A triad plus the octave','A triad with the 5th removed','Two triads a 5th apart'],'Stack one more third on a triad: R 3 5 7.'],
 ['How many different notes does a 7th chord have?','4',['3','5','7'],'Root, 3rd, 5th and 7th.'],
 ['What is the formula of a dominant 7th chord?','1 3 5 ♭7',['1 3 5 7','1 ♭3 5 ♭7','1 ♭3 ♭5 ♭7'],'A major triad with a minor 7th.'],
 ['What is the formula of a major 7th chord?','1 3 5 7',['1 3 5 ♭7','1 ♭3 5 7','1 ♭3 5 ♭7'],'A major triad with a major 7th, one semitone below the octave.'],
 ['What is the formula of a minor 7th chord?','1 ♭3 5 ♭7',['1 3 5 ♭7','1 ♭3 ♭5 ♭7','1 ♭3 5 7'],'A minor triad with a minor 7th.'],
 ['What is the formula of a half-diminished (m7♭5) chord?','1 ♭3 ♭5 ♭7',['1 ♭3 ♭5 𝄫7','1 ♭3 5 ♭7','1 3 ♭5 ♭7'],'A diminished triad with a minor 7th. With a 𝄫7 instead it would be fully diminished.'],
 ['Which 7th chord is built on the 5th degree of a major scale?','Dominant 7th',['Major 7th','Minor 7th','Half-diminished'],'In C major, G7 = G B D F.'],
 ['In which chord is the 7th just one semitone below the root an octave higher?','Major 7th',['Dominant 7th','Minor 7th','Half-diminished'],'A major 7th is 11 semitones above the root, one below the octave.']]);
function sSpell(){const q=pick(Q4),root=rootFor(q),a=chordNotes(root,q).join(' ');
  return{type:'choice',noBoard:true,key:`ss${root}${q}`,text:`Which notes spell ${csym(root,q)}?`,choices:mc(a,Q4.filter(x=>x!==q).map(x=>chordNotes(root,x).join(' '))),ans:a,
   hint:`Write the formula ${fmlTxt(q)} under the ${root} major scale and adjust the notes.`,explain:`${csym(root,q)} is ${QLAB[q]}: ${fmlTxt(q)} = ${a}.`}}
function sName(){const q=pick(Q4),root=rootFor(q),a=csym(root,q);
  return{type:'choice',noBoard:true,key:`sn${root}${q}`,text:`Which chord is spelled ${chordNotes(root,q).join(' ')}?`,choices:mc(a,Q4.filter(x=>x!==q).map(x=>csym(root,x))),ans:a,
   hint:`Start from the triad (is the 3rd major or minor? the 5th perfect or flat?), then look at the top note.`,explain:`${chordNotes(root,q).join(' ')}: ${fmlTxt(q)} from ${root}, so it is ${a}, a ${QLAB[q].split(' (')[0]} chord.`}}
function s7(){for(let t=0;t<400;t++){const q=pick(Q4),root=rootFor(q),s1=R(0,3),s2=R(s1+1,Math.min(5,s1+3)),fs=allPc(pcOf(root),[s1],2,11);if(!fs.length)continue;
  const f=pick(fs).f,sm=fmlSemis(CHORDS[q].f)[3],tf=shapeFret(s1,f,s2,sm);if(tf<1||tf>15||Math.abs(tf-f)>5)continue;const n7=chordNotes(root,q)[3];
  return{type:'click',key:`s7${root}${q}${s1}${s2}`,box:[Math.max(0,Math.min(f,tf)-1),Math.min(15,Math.max(f,tf)+1)],text:`The root of ${csym(root,q)} is marked on the ${SN[s1]} string. Click its ${seventhName(q)} on the ${SN[s2]} string.`,
   marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:tf,t:LB[q][3]},notes:[midi(s1,f),midi(s2,tf)],
   hint:'A major 7th is one semitone below the octave; a minor 7th is two. Convert that to frets with the string gap.',
   explain:`The ${seventhName(q)} of ${csym(root,q)} is ${n7}, ${sm} semitones above ${root}. From the ${SN[s1]} string to the ${SN[s2]} string is ${gap(s1,s2)} semitones, so it sits ${offTxt(tf-f)}: fret ${tf}.`}}
  return s7()}
function sFind(){for(let t=0;t<400;t++){const q=pick(Q4),root=rootFor(q),s1=R(0,3),r=R(3,9),rf=allPc(pcOf(root),[s1],r-1,r+1);if(!rf.length)continue;
  const rr=rf[0].f,lo=Math.max(0,rr-2),hi=lo+5,pc7=pcOf(chordNotes(root,q)[3]),tg=allPc(pc7,[0,1,2,3,4,5],lo,hi);if(tg.length<2||tg.length>6)continue;
  return{type:'multi',key:`sf${root}${q}${s1}${rr}`,box:[lo,hi],text:`The root of ${csym(root,q)} is marked. Click every ${q==='maj7'?'major 7th':'♭7'} (${chordNotes(root,q)[3]}) on any string inside the shaded frets ${lo}–${hi}.`,
   marks:[{s:s1,f:rr,t:'R',k:'root'}],targets:tg.map(p=>({...p,t:LB[q][3]})),notes:[midi(s1,rr),midi(tg[0].s,tg[0].f)],
   hint:`The ${q==='maj7'?'major 7th':'♭7'} is ${q==='maj7'?'one semitone':'two semitones'} below the root's octave. Find ${chordNotes(root,q)[3]} on each string.`,
   explain:`${chordNotes(root,q)[3]} in frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}}
  return sFind()}
function sType(){const o=vPick(pick(['close','d2']),Q4,[0,1,2,3]),a=o.sym;
  return{type:'choice',key:vKey('st',o),text:`These marks are the four notes of a 7th chord with root ${o.root} (highlighted). Which chord is it?`,marks:o.v.map(p=>nmark(p,'name')),
   choices:mc(a,Q4.filter(x=>x!==o.q).map(x=>csym(o.root,x))),ans:a,notes:vNotes(o.v),
   hint:`Measure from ${o.root}: is the 3rd major or minor? Is the 5th perfect or flat? Is the 7th major or minor?`,explain:`The notes are ${o.v.map(p=>p.name).join(', ')}. From ${o.root} that is ${fmlTxt(o.q)}, so the chord is ${a} (${o.cn.join(' ')}).`}}

/* ---------- Lesson 33: 7th chord construction ---------- */
const TR7=[['maj','major','maj7','major triad','major 7th'],['maj','minor','dom7','major triad','minor 7th'],['min','minor','m7','minor triad','minor 7th'],['min','major','mMaj7','minor triad','major 7th'],['dim','minor','m7b5','diminished triad','minor 7th'],['dim','diminished','dim7','diminished triad','diminished 7th']];
const cBank=sbank('cb',[
 ['Which triad and 7th make a dominant 7th chord?','Major triad + minor 7th',['Major triad + major 7th','Minor triad + minor 7th','Diminished triad + minor 7th'],'C E G + B♭ = C7.'],
 ['Which triad and 7th make a major 7th chord?','Major triad + major 7th',['Major triad + minor 7th','Minor triad + major 7th','Minor triad + minor 7th'],'C E G + B = Cmaj7.'],
 ['Which triad and 7th make a minor 7th chord?','Minor triad + minor 7th',['Minor triad + major 7th','Major triad + minor 7th','Diminished triad + minor 7th'],'C E♭ G + B♭ = Cm7.'],
 ['Which triad and 7th make a half-diminished (m7♭5) chord?','Diminished triad + minor 7th',['Diminished triad + diminished 7th','Minor triad + minor 7th','Major triad + minor 7th'],'C E♭ G♭ + B♭ = Cm7♭5.'],
 ['What do you get from a diminished triad plus a diminished 7th (𝄫7)?','A diminished 7th chord',['A half-diminished chord','A dominant 7th chord','A minor 7th chord'],'C E♭ G♭ + B𝄫 (A) = C°7: every interval is a minor 3rd.'],
 ['Which triad and 7th make a minor-major 7th chord?','Minor triad + major 7th',['Major triad + minor 7th','Minor triad + minor 7th','Major triad + major 7th'],'C E♭ G + B = Cm(maj7).'],
 ['How many semitones is the 7th above the root in a dominant 7th chord?','10',['11','9','12'],'A minor 7th = 10 semitones. Major 7th = 11, diminished 7th = 9.'],
 ['A 7th chord is built by stacking…','three 3rds on the root',['two 3rds on the root','three 4ths on the root','four 3rds on the root'],'Root → 3rd → 5th → 7th is three stacked thirds.']]);
function cFormula(){const qs=['maj7','dom7','m7','m7b5','dim7','mMaj7'],q=pick(qs);
  if(Math.random()<.5){const a=fmlTxt(q);return{type:'choice',noBoard:true,key:'cf1'+q,text:`What is the formula of a ${QLAB[q]} chord?`,choices:mc(a,qs.filter(x=>x!==q).map(fmlTxt)),ans:a,hint:'Start from the triad, then add the 7th.',explain:`${cap(QLAB[q])}: ${fmlTxt(q)}. For example in C: ${chordNotes('C',q).join(' ')}.`}}
  const a=QLAB[q];return{type:'choice',noBoard:true,key:'cf2'+q,text:`Which chord has the formula ${fmlTxt(q)}?`,choices:mc(a,qs.filter(x=>x!==q).map(x=>QLAB[x])),ans:a,hint:'Is the 3rd major or minor? Is the 5th perfect or flat? What kind of 7th is on top?',explain:`${fmlTxt(q)} is ${a}. For example in C: ${chordNotes('C',q).join(' ')}.`}}
function cBuild(){const[tq,k,q,tn,sn]=pick(TR7),root=rootFor(q),a=csym(root,q),tri=chordNotes(root,tq),n7=chordNotes(root,q)[3];
  const ch=TR7.map(x=>x[2]).filter(x=>x!==q).map(x=>csym(root,x));
  return{type:'choice',noBoard:true,key:`cu${root}${q}`,text:`Take the ${root} ${tn} (${tri.join(' ')}) and add a ${k} 7th above the root (${n7}). Which chord do you get?`,choices:mc(a,ch),ans:a,
   hint:`Compare the 7th you add with the ${root} major scale: ${k==='major'?'it is the 7th scale note':k==='minor'?'it is a semitone lower than the 7th scale note':'it is two semitones lower than the 7th scale note'}.`,
   explain:`${cap(tn)} + ${sn} = ${a}: ${chordNotes(root,q).join(' ')}.`}}
function cGap(){const o=vPick('d2',Q4,[0,1,2,3]),cn=o.cn,i=R(0,2),lo=o.v.find(p=>p.idx===i),hi=o.v.find(p=>p.idx===i+1),a=nm(m3x(cn,i)),names=['root–3rd','3rd–5th','5th–7th'];
  return{type:'choice',key:vKey('cg',o)+i,text:`These marks are the notes of ${o.sym}. What interval is it from ${lo.name} up to ${hi.name} (the ${names[i]} step of the chord)?`,
   marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:p===lo||p===hi?'root':'ghost'})),choices:mc(a,['minor 3rd','major 3rd','perfect 4th','major 2nd']),ans:a,notes:[midi(lo.s,lo.f),midi(hi.s,hi.f)],
   hint:`The two highlighted notes are neighbouring chord tones. Count the semitones from ${lo.name} up to ${hi.name}.`,explain:`${lo.name} up to ${hi.name} is ${(pcOf(hi.name)-pcOf(lo.name)+12)%12} semitones: a ${a}. ${o.sym} is built from three stacked 3rds: ${[0,1,2].map(j=>nm(m3x(cn,j))).join(', ')}.`}}
const m3x=(cn,i)=>(pcOf(cn[i+1])-pcOf(cn[i])+12)%12;
function cMake(){const T={dom7:[3],m7:[1,3],mMaj7:[1],m7b5:[1,2,3]};
  for(let t=0;t<3000;t++){const ch=pick(Object.keys(T)),o=vPick('close',['maj7'],[0],7);if(!okSpell(ch,o.root))continue;
    const nv=T[ch].map(i=>({s:o.v[i].s,f:o.v[i].f-1,idx:i,name:chordNotes(o.root,ch)[i],deg:LB[ch][i]}));
    const fr=o.v.map((p,j)=>T[ch].includes(j)?p.f-1:p.f);if(Math.max(...fr)-Math.min(...fr)>4||nv.some(p=>p.f<1))continue;
    const from=csym(o.root,'maj7'),to=csym(o.root,ch);
    return{type:'multi',key:`cm${o.root}${ch}${o.st.join('')}`,box:bx(o.v),text:`${from} (close position) is shown. Turn it into ${to}: each note that has to change moves down one fret on its own string. Click the new positions.`,
     marks:o.v.map(p=>nmark(p,'deg')),targets:nv.map(p=>({s:p.s,f:p.f,t:p.deg})),notes:vNotes(o.v),
     hint:`Compare the formulas: ${fmlTxt('maj7')} and ${fmlTxt(ch)}. Which numbers got a flat?`,
     explain:`${fmlTxt('maj7')} → ${fmlTxt(ch)}: ${T[ch].map((i,j)=>`${TL[i]} (${o.v[i].name}) becomes ${nv[j].deg} (${nv[j].name}) on the ${SN[nv[j].s]} string, fret ${nv[j].f}`).join('; ')}. ${to} = ${chordNotes(o.root,ch).join(' ')}.`}}
  throw new Error('cMake')}

/* ---------- Lesson 34: close position 7th chords ---------- */
const clBank=fBank('close'),clSpell=fSpell('close'),clBuild=fBuild('close'),clMiss=fMiss('close'),clType=fType(['close','d2'],true);
function clInv(){const q=pick(Q4),root=rootFor(q),cn=chordNotes(root,q),c=R(0,3),cl=[0,1,2,3].map(i=>m4(c+i)),a=INVN[c];
  return{type:'choice',noBoard:true,key:`ci${root}${q}${c}`,text:`The notes ${cl.map(i=>cn[i]).join(' ')} (lowest to highest) are a close-position ${csym(root,q)}. Which inversion is it?`,choices:INVN,ans:a,
   hint:`Which chord tone of ${csym(root,q)} is the lowest note?`,explain:`${csym(root,q)} = ${cn.join(' ')}. The lowest note is ${cn[c]}, the ${c===0?'root':TONE[c]}, so it is ${a}.`}}

/* ---------- Lesson 35: Drop 2 ---------- */
const d2Bank=fBank('d2'),d2Spell=fSpell('d2'),d2Build=fBuild('d2'),d2Miss=fMiss('d2'),d2Inv=fInv('d2'),d2Type=fType(['close','d2']);

/* ---------- Lesson 36: Drop 3 ---------- */
const d3Bank=fBank('d3'),d3Spell=fSpell('d3'),d3Build=fBuild('d3'),d3Miss=fMiss('d3'),d3Inv=fInv('d3'),d3Type=fType(['close','d2','d3']);
function d3Set(){const o=vPick('d3'),a=strList(o.st),sets=[[0,1,2,3],[1,2,3,4],[0,2,3,4],[1,3,4,5],[2,3,4,5]].map(strList);
  return{type:'choice',key:vKey('ds',o),text:`This ${o.sym} Drop 3 voicing is marked. Which four strings does it use?`,marks:o.v.map(p=>nmark(p,'name')),choices:mc(a,sets),ans:a,notes:vNotes(o.v),
   hint:'Look at the string of each mark: which string sits between the bass and the upper three notes?',explain:`The bass is on the ${SN[o.st[0]]} string, one string is skipped, and the upper three notes are on the ${strList(o.st.slice(1))} strings. ${vExp(o)}`}}

const LS={
 sev:{h:'7th-chords',n:'Lesson 32',title:'7th chords',sub:'Add a 7th to a triad: maj7, 7, m7 and m7♭5.',
  ex:[['Concepts',[sBank,sSpell,sName]],['Find the 7th',[s7,sFind]],['Name the shape',[sType]]],
  test:[...rep(sBank,3),...rep(sSpell,2),...rep(sName,2),...rep(s7,3),...rep(sType,3),...rep(sFind,2)]},
 cons:{h:'7th-chords-construction',n:'Lesson 33',title:'7th chords construction',sub:'Formulas, triad + 7th, and changing one note to change the chord.',
  ex:[['Formulas',[cBank,cFormula]],['Build it',[cBuild,cGap]],['On the neck',[cMake,clMiss]]],
  test:[...rep(cBank,2),...rep(cFormula,3),...rep(cBuild,2),...rep(cGap,2),...rep(cMake,3),...rep(clMiss,3)]},
 clo:{h:'close-position-7ths',n:'Lesson 34',title:'Close position 7th chords',sub:'Four chord tones inside one octave, and their inversions.',
  ex:[['Concepts',[clBank,clSpell,clInv]],['Build it',[clBuild,clMiss]],['Close or not?',[clType]]],
  test:[...rep(clBank,2),...rep(clSpell,2),...rep(clInv,2),...rep(clBuild,3),...rep(clMiss,3),...rep(clType,3)]},
 drop2:{h:'drop-2-chords',n:'Lesson 35',title:'Drop 2 chords',sub:'Drop the 2nd-highest note an octave: four playable inversions on adjacent strings.',
  ex:[['Concepts',[d2Bank,d2Spell]],['Build it',[d2Build,d2Miss]],['Read it',[d2Inv,d2Type]]],
  test:[...rep(d2Bank,2),...rep(d2Spell,2),...rep(d2Build,3),...rep(d2Miss,3),...rep(d2Inv,3),...rep(d2Type,2)]},
 drop3:{h:'drop-3-chords',n:'Lesson 36',title:'Drop 3 chords',sub:'Drop the 3rd-highest note an octave: a bass note, a skipped string, three upper notes.',
  ex:[['Concepts',[d3Bank,d3Spell]],['Build it',[d3Build,d3Miss]],['Read it',[d3Inv,d3Type,d3Set]]],
  test:[...rep(d3Bank,2),...rep(d3Spell,2),...rep(d3Build,3),...rep(d3Miss,2),...rep(d3Inv,2),...rep(d3Type,2),...rep(d3Set,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 32–36 mixed.',
  ex:[['Lessons 32–33',[sBank,sName,s7,sType,cFormula,cBuild,cMake,clMiss]],['Lessons 34–35',[clSpell,clBuild,clType,d2Spell,d2Build,d2Inv,d2Type]],['Lesson 36',[d3Spell,d3Build,d3Inv,d3Set,d3Type]]],
  test:[sBank,sName,s7,sType,cFormula,cBuild,cMake,clMiss,clSpell,clBuild,clMiss,clType,d2Spell,d2Build,d2Inv,d2Type,d3Spell,d3Build,d3Inv,d3Set]}};
const ORDER=['sev','cons','clo','drop2','drop3','final'],STORE='gi-best-p9';
const famRows=(fk,q='maj7')=>[0,1,2,3].map(b=>{let ex='';for(const st of FAMS[fk].sets){const v=mkV('C',q,st,FAMS[fk].ord(b),1,FAMS[fk].span);if(v){ex=`${st.map(s=>SL[s]).join(' ')} · ${v.map(p=>p.f).join('–')}`;break}}
  const cn=chordNotes('C',q);return`<tr><td>${cap(INVN[b])}</td><td>${ordTxt(fk,b)}<br>${FAMS[fk].ord(b).map(i=>cn[i]).join(' ')}</td><td>${ex||'(very awkward)'}</td></tr>`}).join('');
const NOTES={
 sev:`<div class="cols"><div><h3>The four main 7th chords on C</h3><table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${Q4.map(q=>`<tr><td>${csym('C',q)} · ${QLAB[q]}</td><td>${fmlTxt(q)}</td><td>${chordNotes('C',q).join(' ')}</td></tr>`).join('')}</tbody></table>
  <p class="small">Assumption: “7th chords” means the four seventh chords of the major scale. m7♭5 is also written ø7 (half-diminished).</p></div>
  <div><h3>Key ideas</h3><ul><li>A 7th chord is a triad plus a 7th: root, 3rd, 5th, 7th.</li><li>Major 7th = 11 semitones above the root; minor (♭7) = 10.</li><li>The 3rd and 7th decide the character; the 5th is the first note you can leave out.</li><li>In a major key: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C, Cmaj7, C7 and Cm7 as open chords and listen to the 7th change the colour.</li><li>From a root on the A string, find the ♭7 and the major 7th on the strings above.</li><li>Play Am7, D7 and Gmaj7 in a row.</li></ul></div></div>`,
 cons:`<div class="cols"><div><h3>Triad + 7th</h3><table class="stack"><thead><tr><th>Triad (C)</th><th>+ 7th</th><th>Chord</th></tr></thead><tbody>${TR7.map(([tq,k,q,tn,sn])=>`<tr><td>${tn} · ${chordNotes('C',tq).join(' ')}</td><td>${sn} · ${chordNotes('C',q)[3]}</td><td>${csym('C',q)}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Stack three 3rds, or add the 7th to a triad.</li><li>Change the chord one note at a time: ♭7 → dominant, ♭3 as well → minor 7th, ♭5 too → half-diminished.</li><li>Each single-note change moves one fret on one string.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7 in close position, then lower the 7th by a fret for C7.</li><li>Lower the 3rd for Cm7, the 5th for Cm7♭5.</li><li>Say the formula aloud as you play each shape.</li></ul></div></div>`,
 clo:`<div class="cols"><div><h3>Close position on C maj7</h3><table class="stack"><thead><tr><th>Inversion</th><th>Notes (low → high)</th></tr></thead><tbody>${[0,1,2,3].map(b=>`<tr><td>${cap(INVN[b])}</td><td>${FAMS.close.ord(b).map(i=>TL[i]).join('–')} · ${FAMS.close.ord(b).map(i=>chordNotes('C','maj7')[i]).join(' ')}</td></tr>`).join('')}</tbody></table>
  <h3 style="margin-top:18px">Root-position shapes (strings D G B e)</h3><table class="stack"><thead><tr><th>Chord</th><th>Frets</th></tr></thead><tbody>${Q4.map(q=>{const v=mkV('C',q,[2,3,4,5],[0,1,2,3],1,5);return`<tr><td>${csym('C',q)}</td><td>${v?v.map(p=>p.f).join('–'):''}</td></tr>`}).join('')}</tbody></table>
  <p class="small">Close-position inversions need very wide stretches on adjacent strings, so the fretboard exercises use root position; inversions are practised by spelling. That stretch is exactly why Drop 2 and Drop 3 exist.</p></div>
  <div><h3>Key ideas</h3><ul><li>Close position: all four notes inside one octave, stacked in 3rds.</li><li>Inversions are named by the bass: root, 3rd, 5th or 7th.</li><li>Maj7 is the easiest close shape; the others need a 5-fret reach.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7, C7, Cm7 and Cm7♭5 on D–G–B–e, changing one note at a time.</li><li>Move each shape up 2 frets for the next chord.</li><li>Notice which shapes feel awkward.</li></ul></div></div>`,
 drop2:`<div class="cols"><div><h3>Drop 2 on C maj7</h3><table class="stack"><thead><tr><th>Inversion</th><th>Low → high</th><th>Example (strings · frets)</th></tr></thead><tbody>${famRows('d2')}</tbody></table>
  <p class="small">Assumption: inversions are named by the lowest note, so root position has the root in the bass (R–5–7–3).</p></div>
  <div><h3>Key ideas</h3><ul><li>Start with a close voicing, then drop its 2nd-highest note down an octave.</li><li>Four adjacent strings: E–A–D–G, A–D–G–B or D–G–B–e.</li><li>The four inversions are the same chord with a different note in the bass.</li><li>Every shape is movable: the root decides the chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7 Drop 2 in all four inversions on D–G–B–e.</li><li>Do the same for Dm7, G7 and Cmaj7: a ii–V–I.</li><li>Find each root in the voicing.</li></ul></div></div>`,
 drop3:`<div class="cols"><div><h3>Drop 3 on C maj7</h3><table class="stack"><thead><tr><th>Inversion</th><th>Low → high</th><th>Example (strings · frets)</th></tr></thead><tbody>${famRows('d3')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Start with a close voicing, then drop its 3rd-highest note down an octave.</li><li>Strings: E–D–G–B or A–G–B–e, with one string skipped under the upper three notes.</li><li>Root position is R–7–3–5, ideal for a bass note with a jazz sound.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7, C7, Cm7 and Cm7♭5 as Drop 3 chords with the root on the low E string.</li><li>Compare a Drop 2 and a Drop 3 voicing of the same chord.</li><li>Name the skipped string each time.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 32–36: 7th chords, construction, close position, Drop 2 and Drop 3. 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lessons 37–41: diminished 7th chord inversions, major 7th to diminished 7th, and the harmonized major scale with 7th chords and drop chords.</p></div></div>`};

