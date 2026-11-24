/* ===== Part 10: lessons 37–41 ===== */
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

const ROM7S=['Imaj7','ii7','iii7','IVmaj7','V7','vi7','viiø7'];
const dia4=k=>diatonic(k,'major',4);
const keyTxt=k=>`${k} major: ${spellScale(k).join(' ')} ${k}`;
const PN=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const CHAIN=['maj7','dom7','m7','m7b5','dim7'],CHG=[3,1,2,3],CHGN=['7th','3rd','5th','♭7 (to a 𝄫7)'];
function dPick(fk,bs=[0,1,2,3],loMax=9){const F=FAMS[fk];
  for(let t=0;t<800;t++){const key=pick(KEASY),d=R(1,7),all=dia4(key),c=all[d-1],b=pick(bs),st=pick(F.sets),v=mkV(c.root,c.q,st,F.ord(b),R(1,loMax),F.span);if(v)return{fk,key,d,all,c,b,st,v}}
  const all=dia4('C'),c=all[0],st=FAMS.d2.sets[1];return{fk:'d2',key:'C',d:1,all,c,b:0,st,v:mkV('C','maj7',st,FAMS.d2.ord(0),1)}}
const dExp=o=>`${keyTxt(o.key)}. ${o.c.roman} = ${o.c.sym} = ${o.c.notes.join(' ')}. ${FAMS[o.fk].cap}, ${INVN[o.b]} (${ordTxt(o.fk,o.b)}) on the ${strList(o.st)} strings: ${vTxt(o.v)}.`;
const dKey=(p,o)=>`${p}${o.fk}${o.key}${o.d}${o.b}${o.st.join('')}`;
/* step every note of a voicing up one scale step (diatonic harmonization) */
function stepV(key,d,v){const sc=spellScale(key);return v.map(p=>{const i=(d-1+2*p.idx)%7,step=(pcOf(sc[(i+1)%7])-pcOf(sc[i])+12)%12;return{s:p.s,f:p.f+step,idx:p.idx,name:sc[(i+1)%7],step}})}
const okStep=nv=>nv.every(p=>p.f>=1&&p.f<=15)&&nv.every((p,j)=>j===0||midi(p.s,p.f)>midi(nv[j-1].s,nv[j-1].f));

/* ---------- Lesson 37: dim7 inversions ---------- */
const dBank=sbank('db',[
 ['What is the formula of a diminished 7th chord?','1 ♭3 ♭5 𝄫7',['1 ♭3 ♭5 ♭7','1 ♭3 5 𝄫7','1 3 ♭5 𝄫7'],'Stack three minor 3rds: C E♭ G♭ B𝄫 (B𝄫 sounds like A).'],
 ['Which interval separates neighbouring notes of a diminished 7th chord?','A minor 3rd (3 semitones)',['A major 3rd','A perfect 4th','A major 2nd'],'3 + 3 + 3 + 3 = 12: the chord divides the octave into four equal parts.'],
 ['How many different diminished 7th chords exist?','3',['12','4','6'],'Each chord repeats every minor 3rd, so the 12 roots fall into 3 groups of 4: C, E♭, G♭, A / D♭, E, G, B♭ / D, F, A♭, B.'],
 ['What happens when you slide a dim7 shape up 3 frets?','You get the same chord in another inversion',['You get a different chord','You get a minor 7th chord','You get a major 7th chord'],'Every note moves up a minor 3rd to the next chord tone.'],
 ['How many names can one diminished 7th chord have?','4, one for each of its notes as root',['1','2','7'],'Any chord tone can be heard as the root, so Cdim7 = E♭dim7 = G♭dim7 = Adim7.'],
 ['How many inversions does a dim7 chord have (besides root position)?','3',['2','4','1'],'Four notes: root position, 1st, 2nd and 3rd inversion, each a different bass note.'],
 ['How many frets apart are the same dim7 shape\'s inversions on the neck?','3',['2','4','5'],'3 frets = 3 semitones = a minor 3rd.'],
 ['Which chord tone is the 𝄫7 of Cdim7?','B𝄫 (sounds like A)',['B♭','B','A♭'],'The 7th of C is B; flat it once (B♭) and again (B𝄫) to get the diminished 7th, which sounds like A.']]);
function dSpell(){const root=rootFor('dim7'),a=chordNotes(root,'dim7').join(' ');
  return{type:'choice',noBoard:true,key:'dsp'+root,text:`Which notes spell ${csym(root,'dim7')}?`,choices:mc(a,['m7b5','m7','dom7','mMaj7'].map(q=>chordNotes(root,q).join(' '))),ans:a,
   hint:'Every note is a minor 3rd above the one before; the 7th is double-flattened.',explain:`${csym(root,'dim7')} = ${fmlTxt('dim7')} = ${a}. The last note is a 𝄫7: it sounds like the 6th (${NN[(pcOf(root)+9)%12]}).`}}
function dEnh(){const pc=R(0,11),k=pick([1,2,3]),a=PN[(pc+3*k)%12]+'°7',same=[0,3,6,9].map(x=>PN[(pc+x)%12]);
  const others=[1,2,4,5,7,8,10,11].map(x=>PN[(pc+x)%12]+'°7');
  return{type:'choice',noBoard:true,key:'den'+pc+k,text:`Which of these chords has exactly the same notes as ${PN[pc]}°7?`,choices:mc(a,others.filter(x=>!same.includes(x.slice(0,-2)))),ans:a,
   hint:'Move up in minor 3rds (3 semitones) from the root.',explain:`${PN[pc]}°7 sounds ${[0,3,6,9].map(x=>NN[(pc+x)%12]).join(' ')}. Each of these notes can be the root, so ${same.map(x=>x+'°7').join(' = ')}.`}}
const dBuild=fBuild('d2',['dim7']),dMiss=fMiss('d2',['dim7']),dInv=fInv('d2',['dim7']);
function dSlide(){for(let t=0;t<500;t++){const o=vPick('d2',['dim7']);if(o.v.some(p=>p.f+3>15))continue;const cn=o.cn,nv=o.v.map(p=>({s:p.s,f:p.f+3,name:cn[(p.idx+1)%4]}));
  return{type:'multi',key:vKey('sl',o),box:bx(o.v,nv),text:`${o.sym} (Drop 2, ${INVN[o.b]}) is shown. Slide the whole shape up 3 frets and click the four new notes: it is the same chord in a new inversion.`,
   marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'ghost'})),targets:nv.map(p=>({s:p.s,f:p.f,t:p.name})),notes:vNotes(o.v),
   hint:'Each note moves up a minor 3rd, which is 3 frets on the same string.',explain:`Each note moves to the next chord tone: ${o.v.map((p,i)=>`${p.name}→${nv[i].name}`).join(', ')}. The notes are the same, but ${nv[0].name} is now in the bass: ${INVN[(o.b+1)%4]} of ${o.sym}.`}}
  return dSlide()}
function dSlideQ(){for(let t=0;t<500;t++){const o=vPick('d2',['dim7']),n=pick([3,6,9]);if(o.v.some(p=>p.f+n>15))continue;const nb=(o.b+n/3)%4,cn=o.cn;
  return{type:'choice',key:vKey('sq',o)+n,text:`These marks are ${o.sym} (root highlighted). Slide the whole shape up ${n} frets. Which inversion of ${o.sym} is it now?`,marks:o.v.map(p=>nmark(p,'name')),choices:INVN,ans:INVN[nb],notes:vNotes(o.v),
   hint:`Every 3 frets moves each note to the next chord tone. How many chord-tone steps is ${n} frets?`,explain:`${n} frets = ${n/3} minor 3rd${n>3?'s':''}, so the bass note moves from ${cn[o.b]} to ${cn[nb]}: ${INVN[nb]}. The notes are the same four as before.`}}
  return dSlideQ()}

/* ---------- Lesson 38: maj7 to dim7 ---------- */
const mBank=sbank('mb',[
 ['What is the order of the chain from major 7th to diminished 7th?','maj7 → 7 → m7 → m7♭5 → °7',['maj7 → m7 → 7 → m7♭5 → °7','maj7 → 7 → m7♭5 → m7 → °7','7 → maj7 → m7 → °7 → m7♭5'],'Lower one note a half step at a time: 7th, then 3rd, then 5th, then the 7th again.'],
 ['Which note do you lower to turn a major 7th into a dominant 7th?','The 7th',['The 3rd','The 5th','The root'],'maj7 1 3 5 7 → 7: 1 3 5 ♭7.'],
 ['Which note do you lower to turn a dominant 7th into a minor 7th?','The 3rd',['The 7th','The 5th','The root'],'7: 1 3 5 ♭7 → m7: 1 ♭3 5 ♭7.'],
 ['Which note do you lower to turn a minor 7th into a half-diminished chord?','The 5th',['The 3rd','The 7th','The root'],'m7: 1 ♭3 5 ♭7 → m7♭5: 1 ♭3 ♭5 ♭7.'],
 ['Which note do you lower to turn a half-diminished chord into a diminished 7th?','The ♭7 (it becomes 𝄫7)',['The ♭3','The ♭5','The root'],'m7♭5: 1 ♭3 ♭5 ♭7 → °7: 1 ♭3 ♭5 𝄫7.'],
 ['How many frets does each single change move a note?','1 fret, on that note\'s string',['2 frets','3 frets','No frets'],'Each lowering is a half step.'],
 ['Going from maj7 straight to °7, how many semitones do the notes move in total?','4 (3rd −1, 5th −1, 7th −2)',['3','5','2'],'The root stays; 3rd, 5th and 7th are lowered by 1, 1 and 2 semitones.'],
 ['Which chord is one step from Cm7 in the chain, going towards the diminished 7th?','Cm7♭5',['C7','Cdim7','Cmaj7'],'Lower the 5th (G → G♭).']]);
function mNext(){for(let t=0;t<300;t++){const s=R(0,3),n=R(1,4-s),root=rootFor('dim7');if(!CHAIN.slice(s,s+n+1).every(q=>okSpell(q,root)))continue;const a=csym(root,CHAIN[s+n]);
  const chg=[];for(let i=s;i<s+n;i++)chg.push(i===3?'the ♭7 again':'the '+CHGN[i]);
  return{type:'choice',noBoard:true,key:`mn${root}${s}${n}`,text:`Start with ${csym(root,CHAIN[s])}. Lower ${chg.join(', then ')} by a half step. Which chord do you have now?`,choices:mc(a,CHAIN.concat(['mMaj7']).filter(q=>q!==CHAIN[s+n]).map(q=>csym(root,q))),ans:a,
   hint:`Write the formula of ${csym(root,CHAIN[s])} and flatten the named note${n>1?'s one at a time':''}.`,explain:`${CHAIN.slice(s,s+n+1).map(q=>`${csym(root,q)} (${fmlTxt(q)})`).join(' → ')}.`}}
  return mNext()}
function mWhich(){for(let t=0;t<300;t++){const s=R(0,3),root=rootFor('dim7');if(!okSpell(CHAIN[s],root)||!okSpell(CHAIN[s+1],root))continue;const i=CHG[s],a0=chordNotes(root,CHAIN[s])[i],a1=chordNotes(root,CHAIN[s+1])[i];
  const tn=['root','3rd','5th','7th'],lab=j=>`The ${tn[j]} (${chordNotes(root,CHAIN[s])[j]} becomes ${chordNotes(root,CHAIN[s+1])[j]})`;const a=lab(i);
  return{type:'choice',noBoard:true,key:`mw${root}${s}`,text:`Which note changes when ${csym(root,CHAIN[s])} becomes ${csym(root,CHAIN[s+1])}?`,choices:mc(a,[1,2,3].filter(j=>j!==i).map(j=>`The ${tn[j]} (${chordNotes(root,CHAIN[s])[j]} becomes ${chordNotes(root,CHAIN[s])[j]}♭)`)),ans:a,
   hint:`Compare ${fmlTxt(CHAIN[s])} with ${fmlTxt(CHAIN[s+1])}.`,explain:`${fmlTxt(CHAIN[s])} → ${fmlTxt(CHAIN[s+1])}: only the ${tn[i]} changes, ${a0} → ${a1}. ${csym(root,CHAIN[s])} = ${chordNotes(root,CHAIN[s]).join(' ')}; ${csym(root,CHAIN[s+1])} = ${chordNotes(root,CHAIN[s+1]).join(' ')}.`}}
  return mWhich()}
function mClick(){for(let t=0;t<600;t++){const s=R(0,3),q=CHAIN[s],q2=CHAIN[s+1],o=vPick('d2',[q]);if(!okSpell(q2,o.root))continue;const h=o.v.find(p=>p.idx===CHG[s]);if(h.f-1<1)continue;
  return{type:'click',key:vKey('mc',o)+s,box:bx(o.v),text:`${o.sym} (Drop 2, ${INVN[o.b]}) is shown. Lower one note by a half step to make ${csym(o.root,q2)}. Click where that note goes.`,
   marks:o.v.map(p=>nmark(p,'deg')),target:{s:h.s,f:h.f-1,t:LB[q2][h.idx]},notes:vNotes(o.v),
   hint:`Compare ${fmlTxt(q)} with ${fmlTxt(q2)}: which chord tone gets flatter?`,explain:`${fmlTxt(q)} → ${fmlTxt(q2)}: the ${TONE[h.idx]} ${h.name} drops to ${chordNotes(o.root,q2)[h.idx]}, one fret lower on the ${SN[h.s]} string: fret ${h.f-1}.`}}
  return mClick()}
function mMulti(){for(let t=0;t<800;t++){const k=R(2,4),q2=CHAIN[k],o=vPick('d2',['maj7']);if(!okSpell(q2,o.root))continue;const base=fmlSemis(CHORDS.maj7.f),fin=fmlSemis(CHORDS[q2].f);
  const nv=o.v.map(p=>({s:p.s,idx:p.idx,f:p.f-(base[p.idx]-fin[p.idx]),d:base[p.idx]-fin[p.idx]}));const fs=nv.map(p=>p.f);
  if(fs.some(f=>f<1)||Math.max(...fs)-Math.min(...fs)>4||!okStep(nv))continue;const tg=nv.filter(p=>p.d>0);
  return{type:'multi',key:vKey('mm',o)+k,box:bx(o.v,nv),text:`${o.sym} (Drop 2, ${INVN[o.b]}) is shown. Turn it into ${csym(o.root,q2)} by lowering notes. Click the new position of every note that changes.`,
   marks:o.v.map(p=>nmark(p,'deg')),targets:tg.map(p=>({s:p.s,f:p.f,t:LB[q2][p.idx]})),notes:vNotes(o.v),
   hint:`Compare ${fmlTxt('maj7')} with ${fmlTxt(q2)}. Each lowered note moves down that many frets on its own string.`,
   explain:`${fmlTxt('maj7')} → ${fmlTxt(q2)}: ${tg.map(p=>`${TONE[p.idx]} ${o.cn[p.idx]} → ${chordNotes(o.root,q2)[p.idx]} (−${p.d} fret${p.d>1?'s':''}, fret ${p.f})`).join('; ')}.`}}
  return mMulti()}
function mType(){const q=pick(CHAIN),o=vPick('d2',[q]);
  return{type:'choice',key:vKey('mt',o),text:`These marks are the four notes of a chord with root ${o.root} (highlighted). Which chord is it?`,marks:o.v.map(p=>nmark(p,'name')),choices:mc(o.sym,CHAIN.filter(x=>x!==q).map(x=>csym(o.root,x))),ans:o.sym,notes:vNotes(o.v),
   hint:'Measure the 3rd, 5th and 7th from the root.',explain:`The notes are ${o.v.map(p=>p.name).join(', ')}: ${fmlTxt(q)} from ${o.root} = ${o.sym} (${o.cn.join(' ')}).`}}

/* ---------- Lesson 39: diatonic 7th chords ---------- */
const tBank=sbank('tb',[
 ['What are the 7th chords of a major key, in order?','Imaj7, ii7, iii7, IVmaj7, V7, vi7, viiø7',['Imaj7, ii7, iii7, IV7, V7, vi7, vii°7','I7, ii7, iii7, IV7, V7, vi7, viiø7','Imaj7, iim7♭5, iii7, IVmaj7, V7, vi7, vii7'],'The qualities repeat in every major key.'],
 ['Which degree carries the dominant 7th chord?','The 5th (V7)',['The 4th','The 1st','The 7th'],'In C major, G7 = G B D F.'],
 ['Which degree carries the half-diminished chord?','The 7th (viiø7)',['The 2nd','The 5th','The 6th'],'In C major, Bm7♭5 = B D F A.'],
 ['Which two degrees carry a major 7th chord?','I and IV',['I and V','IV and V','ii and vi'],'In C major: Cmaj7 and Fmaj7.'],
 ['Which three degrees carry a minor 7th chord?','ii, iii and vi',['I, IV and V','ii, V and vii','iii, IV and vi'],'In C major: Dm7, Em7 and Am7.'],
 ['What happens to the diminished triad on vii when 7ths are added?','It becomes a half-diminished chord (m7♭5)',['A fully diminished 7th','A dominant 7th','A minor 7th'],'B D F + A (a minor 7th above B) = Bm7♭5.'],
 ['Do diatonic 7th chords of a major key ever include a fully diminished 7th?','No',['Yes, on vii','Yes, on ii','Yes, on V'],'The vii chord is m7♭5; the °7 chord needs a double-flat 7th that is not in the major scale.'],
 ['How are the 7th chords of a major key built?','Stack 3rds on each degree using only notes of the scale',['Add a ♭7 to every triad','Add the octave to each triad','Use the same quality on every degree'],'Four notes: scale degrees n, n+2, n+4, n+6.']]);
function tDeg(){const key=pick(KEASY),d=R(1,7),all=dia4(key);return{key,d,all,c:all[d-1]}}
function tQual(){const{key,d,c}=tDeg();
  return{type:'choice',noBoard:true,key:`tq${key}${d}`,text:`In ${key} major, which 7th chord is built on the ${ord(d)} degree (${c.roman})?`,choices:mc(c.sym,Q4.map(q=>csym(c.root,q))),ans:c.sym,
   hint:`Find the ${ord(d)} note, then stack scale notes: 1st, 3rd, 5th and 7th above it.`,explain:`${keyTxt(key)}. Degree ${d} is ${c.root}; its chord uses ${c.notes.join(' ')} = ${c.sym} (${c.roman}).`}}
function tRoman(){const{key,d,c}=tDeg();
  return{type:'choice',noBoard:true,key:`tr${key}${d}`,text:`In ${key} major, which Roman numeral does ${c.sym} have?`,choices:mc(c.roman,ROM7S.filter(x=>x!==c.roman)),ans:c.roman,
   hint:`Which degree of ${key} major is ${c.root}? Then think about the chord quality.`,explain:`${keyTxt(key)}. ${c.root} is degree ${d} and the chord is ${c.notes.join('–')}: ${c.roman}.`}}
function tSpell(){const{key,d,c}=tDeg(),a=c.notes.join(' ');
  return{type:'choice',noBoard:true,key:`ts${key}${d}`,text:`Which notes spell the ${c.roman} chord (${c.sym}) of ${key} major?`,choices:mc(a,Q4.filter(q=>q!==c.q).map(q=>chordNotes(c.root,q).join(' '))),ans:a,
   hint:`Use only notes of ${key} major: take every other note from ${c.root}.`,explain:`${keyTxt(key)}. From ${c.root}: ${a}.`}}
function tRootFind(){for(let t=0;t<200;t++){const key=pick(KEASY),s=R(0,1),r=rootFret(key,s,1),d=R(2,7),c=dia4(key)[d-1],f=rootFret(c.root,s,1);if(r<1||r>12||f<1||f>12||f===r)continue;
  return{type:'click',key:`trf${key}${s}${d}`,box:[1,12],text:`The root of ${key} major (chord Imaj7) is marked. Click the root of the ${c.roman} chord on the ${SN[s]} string, frets 1–12.`,
   marks:[{s,f:r,t:'I',k:'root'}],target:{s,f,t:c.roman},notes:[midi(s,r),midi(s,f)],hint:`The ${c.roman} chord is built on the ${ord(d)} note of the scale.`,explain:`${keyTxt(key)}. The ${ord(d)} degree is ${c.root} (${c.sym}): fret ${f} of the ${SN[s]} string.`}}
  return tRootFind()}
const tTone=(idx)=>()=>{for(let t=0;t<500;t++){const{key,d,c}=tDeg(),s1=R(0,3),s2=R(s1+1,Math.min(5,s1+(idx===3?3:2))),fs=allPc(pcOf(c.root),[s1],2,11);if(!fs.length)continue;const f=pick(fs).f,sm=fmlSemis(CHORDS[c.q].f)[idx],tf=shapeFret(s1,f,s2,sm);
  if(tf<1||tf>15||Math.abs(tf-f)>5)continue;const nn=c.notes[idx],lab=LB[c.q][idx],tn=idx===1?'3rd':'7th';
  return{type:'click',key:`tt${idx}${key}${d}${s1}${s2}`,box:[Math.max(0,Math.min(f,tf)-1),Math.min(15,Math.max(f,tf)+1)],text:`In ${key} major, the root of the ${c.roman} chord (${c.sym}) is marked on the ${SN[s1]} string. Click its ${tn} on the ${SN[s2]} string.`,
   marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:tf,t:lab},notes:[midi(s1,f),midi(s2,tf)],
   hint:`Is the ${tn} major or minor in a ${QLAB[c.q].split(' (')[0]} chord? That decides how many semitones above the root it is.`,
   explain:`${c.sym} = ${c.notes.join(' ')}. The ${tn} is ${nn}, ${sm} semitones above ${c.root}. From the ${SN[s1]} string to the ${SN[s2]} string is ${gap(s1,s2)} semitones, so it is ${tf===f?'on the same fret':offTxt(tf-f)}: fret ${tf}.`}}
  return tTone(idx)()};
const tThird=tTone(1),tSeventh=tTone(3);
function tWhich(){const o=dPick(pick(['d2','d2','d3']));
  return{type:'choice',key:dKey('tw',o),text:`These four notes come from the 7th chords of ${o.key} major. Which chord (Roman numeral) is it?`,marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),choices:mc(o.c.roman,ROM7S.filter(x=>x!==o.c.roman)),ans:o.c.roman,notes:vNotes(o.v),
   hint:'Read the note names, stack them in thirds to find the root, then count its degree in the key.',explain:`${dExp(o)}`}}

/* ---------- Lesson 40: harmonized major scale with 7ths ---------- */
const hsBank=sbank('hs',[
 ['What does it mean to harmonize the major scale with 7th chords?','Build a 7th chord on every scale degree using only notes of the key',['Play the scale in 7ths of an octave','Add a ♭7 to every chord','Play seven chords of the same type'],'Four stacked thirds on each degree: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.'],
 ['Played on the same strings in the same inversion, how does each note move from chord to chord?','Up one scale step (1 or 2 frets)',['Always 2 frets','It stays on the same fret','Up an octave'],'Every chord tone steps to the next scale note: a half step between 3–4 and 7–8, otherwise a whole step.'],
 ['How far can a note move between neighbouring chords of the harmonized scale?','1 or 2 frets (a half or whole step)',['Always 2 frets','Up to 5 frets','It never moves'],'Each note steps to the next scale note, so voicings slide a fret or two at a time.'],
 ['How do the harmonized 7th chords relate to the harmonized triads?','Same roots; each triad gets one more 3rd on top',['They use different roots','Only the major triads change','The root moves up a step'],'C Dm Em F G Am B° → Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bm7♭5.'],
 ['What quality is the 7th chord on degree 7 of a major key?','m7♭5',['dim7','m7','7'],'viiø7: a diminished triad with a minor 7th.'],
 ['After viiø7, the harmonized scale returns to the…','Imaj7, one octave higher',['I7','ii7','V7'],'The pattern repeats every seven chords.']]);
function hsOut(){const key=pick(KEASY),all=dia4(key),d=R(0,6),c=all[d],wq=pick(Q4.filter(q=>q!==c.q)),a=csym(c.root,wq),rest=shuf(all.filter((x,i)=>i!==d)).slice(0,3).map(x=>x.sym);
  return{type:'choice',noBoard:true,key:`ho${key}${d}${wq}`,text:`Which of these chords is NOT in the harmonized ${key} major scale (7th chords)?`,choices:shuf([a,...rest]),ans:a,
   hint:`Spell the seven 7th chords of ${key} major first.`,explain:`${keyTxt(key)}. The ${ord(d+1)} chord is ${c.sym}, not ${a}. The harmonized scale is ${all.map(x=>x.sym).join(', ')}.`}}
function hsList(){const key=pick(KEASY),all=dia4(key),a=all.map(x=>x.sym).join(' · '),ds=shuf([0,1,2,3,4,5,6]).slice(0,3),dis=ds.map(i=>all.map((x,j)=>j===i?csym(x.root,pick(Q4.filter(q=>q!==x.q))):x.sym).join(' · '));
  return{type:'choice',noBoard:true,key:`hl${key}`,text:`Which list shows the 7th chords of ${key} major from the 1st to the 7th degree?`,choices:mc(a,dis),ans:a,
   hint:'Remember the quality pattern maj7, m7, m7, maj7, 7, m7, m7♭5.',explain:`${keyTxt(key)}. Qualities: maj7 m7 m7 maj7 7 m7 m7♭5, giving ${a}.`}}
function hsBoard(){const o=dPick('d2');
  return{type:'multi',key:dKey('hb',o),box:bx(o.v),text:`${o.key} major: build the ${o.c.roman} chord (${o.c.sym}) as a Drop 2 voicing, ${INVN[o.b]}, on the ${strList(o.st)} strings. The bass note is marked; click the other three notes inside the shaded frets.`,
   marks:[nmark(o.v[0],'name')],targets:o.v.slice(1).map(p=>({s:p.s,f:p.f,t:p.name})),notes:vNotes(o.v),hint:`${o.c.sym} contains ${o.c.notes.join(' ')}; the order from the bass is ${ordTxt('d2',o.b)}.`,explain:dExp(o)}}
function stepSetup(fk){for(let t=0;t<800;t++){const o=dPick(fk,[0,1,2,3],6);if(o.d>6)continue;const nv=stepV(o.key,o.d,o.v);if(!okStep(nv))continue;return{o,nv,n:o.all[o.d]}}
  return stepSetup(fk)}
function mkStep(fk,top){return()=>{const{o,nv,n}=stepSetup(fk),sc=nv.map(p=>({s:p.s,f:p.f,t:top?p.name:LB[n.q][p.idx],name:p.name}));
  return{type:top?'click':'multi',key:dKey(top?'ht':'hp',o),box:bx(o.v,nv),text:top?`${o.key} major: the ${o.c.roman} chord (${o.c.sym}, ${FAMS[fk].name}, ${INVN[o.b]}) is shown. Move every note up one scale step to reach the ${n.roman} chord (${n.sym}). Click the new position of the TOP note (${SN[o.v[3].s]} string).`
     :`${o.key} major: the ${o.c.roman} chord (${o.c.sym}, ${FAMS[fk].name}, ${INVN[o.b]}) is shown. Move every note up one scale step to reach the ${n.roman} chord (${n.sym}). Click all four new notes.`,
   marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'ghost'})),...(top?{target:sc[3]}:{targets:sc}),notes:vNotes(o.v),
   hint:'Half step (1 fret) between degrees 3–4 and 7–8, whole step (2 frets) elsewhere. Work out each note\'s scale step.',
   explain:`${keyTxt(o.key)}. Each note steps up the scale: ${o.v.map((p,i)=>`${p.name}→${nv[i].name} (+${nv[i].step})`).join(', ')}. Result: ${n.sym} = ${n.notes.join(' ')} on the same strings.`}}}
const hsStep=mkStep('d2',false),hsTop=mkStep('d2',true);
function hsWhich(){const o=dPick('d2');
  return{type:'choice',key:dKey('hw',o),text:`These four notes come from the harmonized ${o.key} major scale (7th chords). Which chord (Roman numeral) is it?`,marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),choices:mc(o.c.roman,ROM7S.filter(x=>x!==o.c.roman)),ans:o.c.roman,notes:vNotes(o.v),
   hint:'Find the root by stacking the notes in thirds, then count the degree.',explain:dExp(o)}}
function hsRoots(){for(let t=0;t<200;t++){const key=pick(KEASY),s=R(0,1),r=rootFret(key,s,1);if(r<1||r>12)continue;const all=dia4(key);const tg=all.slice(1).map(c=>({s,f:rootFret(c.root,s,1),t:c.roman}));
  if(tg.some(g=>g.f<1||g.f>12||g.f===r))continue;
  return{type:'multi',key:`hr${key}${s}`,box:[1,12],text:`The root of ${key} major (Imaj7) is marked on the ${SN[s]} string. Click the roots of the other six chords on the same string, frets 1–12.`,
   marks:[{s,f:r,t:'I',k:'root'}],targets:tg,notes:[midi(s,r),midi(s,tg[0].f)],hint:`The roots are the notes of ${key} major: ${spellScale(key).join(' ')}.`,explain:`${keyTxt(key)}. On the ${SN[s]} string: ${all.map(c=>`${c.roman} ${c.root} (fret ${rootFret(c.root,s,1)})`).join(', ')}.`}}
  return hsRoots()}

/* ---------- Lesson 41: harmonized scale with drop chords ---------- */
const hdBank=sbank('hd',[
 ['When you harmonize the scale with Drop 2 chords on one string set, what stays the same?','The string set and the inversion',['The frets','The chord quality','The root'],'Only the notes move: each steps to the next scale note.'],
 ['In root-position Drop 2 voicings, which note is on the lowest string?','The root',['The 3rd','The 5th','The 7th'],'R–5–7–3 from low to high.'],
 ['In root-position Drop 3 voicings, which note is on the lowest string?','The root',['The 3rd','The 5th','The 7th'],'R–7–3–5 from low to high.'],
 ['Which strings does the Drop 2 harmonized scale use if the root is on the A string?','A, D, G and B',['A, G, B and e','E, A, D and G','D, G, B and e'],'Drop 2 uses four adjacent strings.'],
 ['Which strings does the Drop 3 harmonized scale use if the root is on the low E string?','E, D, G and B',['E, A, D and G','A, D, G and B','D, G, B and e'],'Drop 3 skips the A string: E–D–G–B.'],
 ['Which chord of the harmonized major scale is m7♭5 in every key?','vii',['ii','V','IV'],'viiø7.']]);
function hdSpell(){const o=dPick(pick(['d2','d3']),[0,1,2,3]),a=o.v.map(p=>p.name).join(' ');const F=FAMS[o.fk],tn=['root','3rd','5th','7th'];
  const perm=[0,1,2,3].map(i=>o.c.notes[i]).join(' ');const alt=shuf([[0,1,3,2],[1,0,2,3],[2,0,1,3],[3,1,2,0],[0,3,1,2],[0,2,3,1]]).map(x=>x.map(i=>o.c.notes[i]).join(' ')).filter(x=>x!==a);
  return{type:'choice',noBoard:true,key:dKey('hs',o),text:`In ${o.key} major, the ${o.c.roman} chord is ${o.c.sym}. Which notes, lowest to highest, form its ${F.name} voicing in ${INVN[o.b]}?`,choices:mc(a,alt),ans:a,
   hint:`${F.name} ${INVN[o.b]} runs ${ordTxt(o.fk,o.b)} from low to high.`,explain:`${o.c.sym} = ${o.c.notes.join(' ')} (R 3 5 7). ${F.cap}, ${INVN[o.b]}: ${ordTxt(o.fk,o.b)} = ${a}.`}}
const hdBoard=()=>{const o=dPick(pick(['d2','d3']));
  return{type:'multi',key:dKey('hb',o),box:bx(o.v),text:`${o.key} major: build the ${o.c.roman} chord (${o.c.sym}) as a ${FAMS[o.fk].name} voicing, ${INVN[o.b]}, on the ${strList(o.st)} strings. The bass note is marked; click the other three notes inside the shaded frets.`,
   marks:[nmark(o.v[0],'name')],targets:o.v.slice(1).map(p=>({s:p.s,f:p.f,t:p.name})),notes:vNotes(o.v),hint:`${o.c.sym} contains ${o.c.notes.join(' ')}; the order from the bass is ${ordTxt(o.fk,o.b)}.`,explain:dExp(o)}};
const hdMiss=()=>{const o=dPick(pick(['d2','d3'])),h=R(0,3),p=o.v[h],tn=p.idx===0?'root':TONE[p.idx];
  return{type:'click',key:dKey('hm',o)+h,box:bx(o.v),text:`${o.key} major, ${o.c.roman} chord (${o.c.sym}) as a ${FAMS[o.fk].name} voicing, ${INVN[o.b]}, on the ${strList(o.st)} strings. Click the missing ${tn} (${SN[p.s]} string).`,
   marks:o.v.filter((x,i)=>i!==h).map(x=>nmark(x,'deg')),target:{s:p.s,f:p.f,t:p.deg},notes:vNotes(o.v),hint:`The ${tn} of ${o.c.sym} is ${p.name}.`,explain:`The missing note is ${p.name}. ${dExp(o)}`}};
const hdStep=()=>{for(let t=0;t<800;t++){const fk=pick(['d2','d3']),{o,nv,n}=stepSetup(fk);
  return{type:'multi',key:dKey('hp',o),box:bx(o.v,nv),text:`${o.key} major: the ${o.c.roman} chord (${o.c.sym}, ${FAMS[fk].name}, ${INVN[o.b]}) is shown. Move every note up one scale step to reach the ${n.roman} chord (${n.sym}). Click all four new notes.`,
   marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'ghost'})),targets:nv.map(p=>({s:p.s,f:p.f,t:LB[n.q][p.idx]})),notes:vNotes(o.v),
   hint:'Half step (1 fret) between degrees 3–4 and 7–8, whole step (2 frets) elsewhere.',explain:`${keyTxt(o.key)}. ${o.v.map((p,i)=>`${p.name}→${nv[i].name} (+${nv[i].step})`).join(', ')}. Result: ${n.sym} = ${n.notes.join(' ')}.`}}
  return hdStep()};
const hdWhich=()=>{const o=dPick(pick(['d2','d3']));
  return{type:'choice',key:dKey('hw',o),text:`These four notes are a ${FAMS[o.fk].name} voicing from the harmonized ${o.key} major scale. Which chord (Roman numeral) is it?`,marks:o.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),choices:mc(o.c.roman,ROM7S.filter(x=>x!==o.c.roman)),ans:o.c.roman,notes:vNotes(o.v),
   hint:'Find the root by stacking the notes in thirds, then count the degree.',explain:dExp(o)}};
const hdFam=()=>{const o=dPick(pick(['d2','d3'])),a=FAMS[o.fk].cap;
  return{type:'choice',key:dKey('hf',o),text:`These four notes are the ${o.c.roman} chord (${o.c.sym}) of ${o.key} major. Is this a Drop 2 or a Drop 3 voicing?`,marks:o.v.map(p=>nmark(p,'name')),choices:['Drop 2','Drop 3'],ans:a,notes:vNotes(o.v),
   hint:'Look at the strings: four adjacent strings, or one skipped below the top three?',explain:`${o.fk==='d2'?'Four adjacent strings: Drop 2.':'One string is skipped under three adjacent strings: Drop 3.'} ${dExp(o)}`}};

const LS={
 dim:{h:'dim7-inversions',n:'Lesson 37',title:'Dim 7th chord inversions',sub:'A symmetrical chord: every inversion is the same shape three frets apart.',
  ex:[['Concepts',[dBank,dSpell,dEnh]],['Build it',[dBuild,dMiss]],['Slide it',[dSlide,dSlideQ,dInv]]],
  test:[...rep(dBank,2),dSpell,...rep(dEnh,2),...rep(dBuild,3),...rep(dMiss,2),...rep(dSlide,2),...rep(dSlideQ,2),dInv]},
 chain:{h:'maj7-to-dim7',n:'Lesson 38',title:'Major 7th to diminished 7th',sub:'Lower one note at a time: maj7, 7, m7, m7♭5, °7.',
  ex:[['The chain',[mBank,mNext,mWhich]],['On the neck',[mClick,mMulti,mType]]],
  test:[...rep(mBank,2),...rep(mNext,3),...rep(mWhich,2),...rep(mClick,3),...rep(mMulti,2),...rep(mType,3)]},
 diat:{h:'diatonic-7th-chords',n:'Lesson 39',title:'Diatonic major scale 7th chords',sub:'The seven 7th chords of a major key and their Roman numerals.',
  ex:[['Theory',[tBank,tQual,tRoman,tSpell]],['On the neck',[tRootFind,tThird,tSeventh]],['Name the chord',[tWhich]]],
  test:[tBank,...rep(tQual,2),...rep(tRoman,2),tSpell,...rep(tRootFind,2),...rep(tThird,2),...rep(tSeventh,2),...rep(tWhich,3)]},
 harm:{h:'harmonized-7th-chords',n:'Lesson 40',title:'Harmonized scale with 7th chords',sub:'Walk the 7th chords up the neck: every note steps to the next scale note.',
  ex:[['Theory',[hsBank,hsOut,hsList]],['On the neck',[hsBoard,hsStep,hsTop,hsRoots]],['Name the chord',[hsWhich]]],
  test:[...rep(hsBank,2),hsOut,...rep(hsList,2),...rep(hsBoard,3),...rep(hsStep,3),...rep(hsTop,2),...rep(hsWhich,2)]},
 hdrop:{h:'harmonized-drop-chords',n:'Lesson 41',title:'Harmonized scale with drop chords',sub:'The harmonized scale in Drop 2 and Drop 3 voicings.',
  ex:[['Theory',[hdBank,hdSpell]],['On the neck',[hdBoard,hdMiss,hdStep]],['Name it',[hdWhich,hdFam]]],
  test:[hdBank,...rep(hdSpell,2),...rep(hdBoard,3),...rep(hdMiss,2),...rep(hdStep,3),...rep(hdWhich,2),...rep(hdFam,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 37–41 mixed.',
  ex:[['Lessons 37–38',[dSpell,dEnh,dBuild,dSlideQ,mNext,mClick,mMulti,mType]],['Lessons 39–40',[tQual,tRoman,tSeventh,tWhich,hsList,hsStep,hsTop,hsWhich]],['Lesson 41',[hdSpell,hdBoard,hdStep,hdFam]]],
  test:[dSpell,dEnh,dBuild,dSlideQ,mNext,mClick,mMulti,mType,tQual,tRoman,tSeventh,tWhich,hsList,hsStep,hsTop,hsWhich,hdSpell,hdBoard,hdStep,hdFam]}};
const ORDER=['dim','chain','diat','harm','hdrop','final'],STORE='gi-best-p10';
const dn=['C','E♭','G♭','A'];
const NOTES={
 dim:`<div class="cols"><div><h3>C°7 and its inversions</h3><table class="stack"><thead><tr><th>Inversion</th><th>Low → high</th></tr></thead><tbody>${[0,1,2,3].map(b=>`<tr><td>${cap(INVN[b])}</td><td>${[0,1,2,3].map(i=>dn[(b+i)%4]).join(' ')}</td></tr>`).join('')}</tbody></table>
  <p class="small">C°7 = C E♭ G♭ B𝄫; the last note sounds like A. The same four notes are also E♭°7, G♭°7 and A°7.</p></div>
  <div><h3>Key ideas</h3><ul><li>Three stacked minor 3rds divide the octave equally.</li><li>Slide any dim7 shape 3 frets: same notes, next inversion.</li><li>Four names per chord, three different chords in all.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play a Drop 2 dim7 shape and slide it up 3, 6, 9 and 12 frets.</li><li>Name each bass note as you go.</li></ul></div></div>`,
 chain:`<div class="cols"><div><h3>The chain on C</h3><table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${CHAIN.map(q=>`<tr><td>${csym('C',q)}</td><td>${fmlTxt(q)}</td><td>${chordNotes('C',q).join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Lower the 7th, then the 3rd, then the 5th, then the ♭7 again.</li><li>Each step is one note, one fret, one string.</li><li>Maj7 to °7 lowers the 3rd, 5th and 7th by 1, 1 and 2 semitones.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play a Cmaj7 Drop 2 shape, then change one note per chord down the chain.</li><li>Repeat from another root.</li></ul></div></div>`,
 diat:`<div class="cols"><div><h3>7th chords of C major</h3><table class="stack"><thead><tr><th>Degree</th><th>Chord</th><th>Notes</th></tr></thead><tbody>${dia4('C').map(c=>`<tr><td>${c.roman}</td><td>${c.sym}</td><td>${c.notes.join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Qualities: maj7, m7, m7, maj7, 7, m7, m7♭5.</li><li>Only V carries a dominant 7th.</li><li>vii° becomes the half-diminished viiø7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Find the roots of all seven chords on the A string.</li><li>Play the 3rd and 7th of each chord above its root.</li></ul></div></div>`,
 harm:`<div class="cols"><div><h3>C major, Drop 2 root position (A D G B)</h3><div class="scroll"><table><thead><tr><th>Chord</th><th>Notes</th><th>Frets A–D–G–B</th></tr></thead><tbody>${dia4('C').map(c=>{const v=mkV(c.root,c.q,[1,2,3,4],FAMS.d2.ord(0),1);return`<tr><td>${c.roman} ${c.sym}</td><td>${c.notes.join(' ')}</td><td>${v?v.map(p=>p.f).join('–'):''}</td></tr>`}).join('')}</tbody></table></div>
  <p class="small">Lowest voicing without open strings for each chord. Assumption: the lesson walks the scale on one string set and inversion; here with Drop 2 voicings.</p></div>
  <div><h3>Key ideas</h3><ul><li>Hold the string set and inversion; every note steps to the next scale note.</li><li>Steps are 1 fret (3–4, 7–8) or 2 frets.</li><li>Chord roots follow the scale.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Walk the seven chords of G major on A–D–G–B.</li><li>Name each Roman numeral as you play.</li></ul></div></div>`,
 hdrop:`<div class="cols"><div><h3>C major, root position</h3><div class="scroll"><table><thead><tr><th>Chord</th><th>Drop 2 (A D G B)</th><th>Drop 3 (E D G B)</th></tr></thead><tbody>${dia4('C').map(c=>{const a=mkV(c.root,c.q,[1,2,3,4],FAMS.d2.ord(0),1),b=mkV(c.root,c.q,[0,2,3,4],FAMS.d3.ord(0),1);return`<tr><td>${c.roman} ${c.sym}</td><td>${a?a.map(p=>p.f).join('–'):''}</td><td>${b?b.map(p=>p.f).join('–'):''}</td></tr>`}).join('')}</tbody></table></div></div>
  <div><h3>Key ideas</h3><ul><li>Drop 2: four adjacent strings, root position R–5–7–3.</li><li>Drop 3: one skipped string, root position R–7–3–5.</li><li>Harmonizing works the same way: each note steps to the next scale note.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the harmonized scale in Drop 2, then in Drop 3.</li><li>Compare how the sound changes.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 37–41. 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lessons 42–44: chord progressions with 7th chords, finding the key of a song with 7th chords, and the relative minor.</p></div></div>`};

