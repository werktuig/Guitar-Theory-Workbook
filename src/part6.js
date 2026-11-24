/* ----- shared triad helpers ----- */
const TQ=['maj','min','dim','aug'],TN={maj:'major',min:'minor',dim:'diminished',aug:'augmented'};
const TLB={maj:['R','3','5'],min:['R','♭3','5'],dim:['R','♭3','♭5'],aug:['R','3','♯5']};
const TIV={maj:['major 3rd','perfect 5th'],min:['minor 3rd','perfect 5th'],dim:['minor 3rd','diminished 5th'],aug:['major 3rd','augmented 5th']};
const TSEM={maj:[4,7],min:[3,7],dim:[3,6],aug:[4,8]};
const TONE=['root','3rd','5th'];
const FRIEND=['C','C♯','D♭','D','D♯','E♭','E','F','F♯','G♭','G','G♯','A♭','A','A♯','B♭','B'];
const BADN=['E♯','B♯','C♭','F♭'];
const okN=n=>n.length<=2&&!BADN.includes(n);
const RTS=q=>FRIEND.filter(r=>chordNotes(r,q).every(okN));
const NNF=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const flatish=r=>r.includes('♭')||r==='F';
const pcName=(pc,fl)=>(fl?NNF:NN)[((pc%12)+12)%12];
const trn=(r,q)=>`${r} ${TN[q]}`;
const trSym=(r,q)=>r+CHORDS[q].sym;
const wh=(nme,s,f)=>`${nme} on the ${SN[s]} string, ${fretTxt(f)}`;
const lst=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const strTxt=a=>lst(a.map(s=>SN[s]))+' strings';
const INVN=['root position','1st inversion','2nd inversion'];
const sortSh=sh=>sh.slice().sort((a,b)=>midi(a.s,a.f)-midi(b.s,b.f));
const mNotes=sh=>sortSh(sh).map(p=>midi(p.s,p.f));
const pf=p=>`${SN[p.s]} string fret ${p.f}`;
const ORD3=[[0,1,2],[1,2,0],[2,0,1]];
const boxOfSh=(sh,pad=1)=>[Math.max(0,Math.min(...sh.map(p=>p.f))-pad),Math.min(15,Math.max(...sh.map(p=>p.f))+pad)];
function shapeOf(root,q,inv,set,lo){const n=chordNotes(root,q),pcs=n.map(pcOf),o=ORD3[inv],v=voicing(set,o.map(i=>pcs[i]),lo,lo+5,4);
  return v?v.map((p,i)=>({s:p.s,f:p.f,deg:o[i],t:TLB[q][o[i]],name:n[o[i]]})):null}
function rShape(qs,invs=[0],sets=SETS3){for(let i=0;i<4000;i++){const q=pick(qs),root=pick(RTS(q)),set=pick(sets),inv=pick(invs),lo=R(1,10),sh=shapeOf(root,q,inv,set,lo);if(sh)return{q,root,set,inv,sh,n:chordNotes(root,q)}}
  return{q:'maj',root:'C',set:[2,3,4],inv:0,sh:shapeOf('C','maj',0,[2,3,4],6),n:['C','E','G']}}
const shKey=o=>o.q+o.root+o.set.join('')+o.inv+o.sh.map(p=>p.f).join('-');
const shTxt=sh=>sortSh(sh).map(p=>`${p.name} (${SN[p.s]}, fret ${p.f})`).join(', ');
/* ===== Part 6: lessons 21–24 (Triad shapes & inversions) ===== */
const fmtN=n=>n.join(' – ');
const setLbl=st=>lst(st.map(s=>SN[s]));
const shM=(sh,lab=true)=>sh.map(p=>({s:p.s,f:p.f,t:lab?p.t:'?',k:lab&&p.deg===0?'root':'q'}));
const tgs=sh=>sh.map(p=>({s:p.s,f:p.f,t:p.t}));
const AL=['maj','min','dim','aug'],I3=['maj','min','dim'];

const firstShape=(r,q,inv,set,from=1)=>{for(let lo=from;lo<=10;lo++){const s=shapeOf(r,q,inv,set,lo);if(s)return s}return null};
/* ---- ladder: all shapes of one triad on one string set, lowest bass first ---- */
function ladder(root,q,set){const out=[],seen=new Set();
  for(let inv=0;inv<3;inv++)for(let lo=1;lo<=10;lo++){const sh=shapeOf(root,q,inv,set,lo);if(!sh)continue;const k=inv+':'+sh.map(p=>p.f).join();if(seen.has(k))continue;seen.add(k);out.push({inv,sh})}
  return out.sort((a,b)=>midi(a.sh[0].s,a.sh[0].f)-midi(b.sh[0].s,b.sh[0].f))}
function pickLad(qs,need=1,sets=SETS3){for(let i=0;i<4000;i++){const q=pick(qs),root=pick(RTS(q)),set=pick(sets),L=ladder(root,q,set),idx=[];
  for(let j=0;j+need<L.length;j++){let ok=true;for(let k=0;k<need;k++)if(L[j+k+1].inv!==(L[j+k].inv+1)%3)ok=false;if(ok)idx.push(j)}
  if(!idx.length)continue;const j=pick(idx);return{q,root,set,L,j,n:chordNotes(root,q),a:L[j],b:L[j+1],c:L[j+2]}}
  const L=ladder('C','maj',[0,1,2]);return{q:'maj',root:'C',set:[0,1,2],L,j:0,n:['C','E','G'],a:L[0],b:L[1],c:L[2]}}

/* ---- generators ---- */
function gFill(qs,invs=[0],any=false,sets=SETS3){return function(){const o=rShape(qs,invs,sets),{q,root,set,inv,sh,n}=o,gi=any?R(0,2):sh.findIndex(p=>p.deg===0),g=sh[gi],rest=sh.filter((_,i)=>i!==gi),bd=ORD3[inv][0];
  return{type:'multi',key:'fl'+shKey(o)+gi,box:boxOfSh(sh),text:`${trn(root,q)} triad in ${INVN[inv]} on the ${strTxt(set)}. The marked note is the ${TONE[g.deg]} (${g.name}). Click the other two chord tones on the ${strTxt(rest.map(p=>p.s))} inside the shaded frets.`,
   marks:[{s:g.s,f:g.f,t:g.t,k:g.deg===0?'root':'q'}],targets:tgs(rest),notes:mNotes(sh),
   hint:`${inv>0?`In ${INVN[inv]} the ${TONE[bd]} is the lowest note. `:''}Spell the chord first (${n.join(' ')}), then find each note on its string inside the shaded frets.`,
   explain:`${trn(root,q)} = ${n.join(' ')}. ${INVN[inv][0].toUpperCase()+INVN[inv].slice(1)}: ${shTxt(sh)}.`}}}
function gFindTone(qs,invs=[0],sets=SETS3){return function(){const o=rShape(qs,invs,sets),{q,root,set,inv,sh,n}=o,rt=sh.find(p=>p.deg===0),cand=sh.filter(p=>p.deg!==0),p=pick(cand);
  return{type:'click',key:'ft'+shKey(o)+p.deg,box:boxOfSh(sh),text:`${trn(root,q)} triad in ${INVN[inv]} on the ${strTxt(set)}. The marked note is the root. Click the ${TONE[p.deg]} (${p.name}) on the ${SN[p.s]} string inside the shaded frets.`,
   marks:[{s:rt.s,f:rt.f,t:'R',k:'root'}],target:{s:p.s,f:p.f,t:p.t},notes:mNotes(sh),
   hint:`Spell ${trn(root,q)} (${n.join(' ')}), then find ${p.name} on the ${SN[p.s]} string near the root.`,explain:`${trn(root,q)} = ${n.join(' ')}. ${INVN[inv][0].toUpperCase()+INVN[inv].slice(1)}: ${shTxt(sh)}. The ${TONE[p.deg]} ${p.name} is on the ${SN[p.s]} string, fret ${p.f}.`}}}
function gFrets(qs,invs=[0],sets=SETS3){return function(){const o=rShape(qs,invs,sets),{q,root,set,inv,sh,n}=o,rt=sh.findIndex(p=>p.deg===0),rest=sh.filter((_,i)=>i!==rt);
  const[x,y]=rest.map(p=>p.f),a=`${x} and ${y}`,pool=[`${x+1} and ${y}`,`${x-1} and ${y}`,`${x} and ${y+1}`,`${x} and ${y-1}`,`${x+1} and ${y+1}`,`${x-1} and ${y-1}`].filter(s=>!s.includes('-'));
  return{type:'choice',key:'fr'+shKey(o),text:`${trn(root,q)} triad in ${INVN[inv]} on the ${strTxt(set)}. The marked note is the root. On which frets are the other two notes (${SN[rest[0].s]} string, then ${SN[rest[1].s]} string)?`,
   marks:[{s:sh[rt].s,f:sh[rt].f,t:'R',k:'root'}],choices:mc(a,pool),ans:a,notes:mNotes(sh),hint:`Spell the chord (${n.join(' ')}) and count semitones from the root, remembering the string gaps (4 semitones between G and B, 5 elsewhere).`,
   explain:`${trn(root,q)} = ${n.join(' ')}. ${INVN[inv][0].toUpperCase()+INVN[inv].slice(1)}: ${shTxt(sh)}.`}}}
function gName(qs,opts,invs=[0]){return function(){const o=rShape(qs,invs),{q,root,sh,n,inv}=o,a=TN[q]+' triad';
  return{type:'choice',key:'gn'+shKey(o),text:`The note marked R is the root of this triad${inv===0?' (root position)':''}. What type of triad is it?`,
   marks:sh.map(p=>p.deg===0?{s:p.s,f:p.f,t:'R',k:'root'}:{s:p.s,f:p.f,t:'?',k:'q'}),choices:mc(a,opts.filter(x=>x!==q).map(x=>TN[x]+' triad').concat([a])),ans:a,notes:mNotes(sh),
   hint:'Measure from the root to each of the other notes in semitones (frets on one string, adjusted for the string gaps).',
   explain:`The shape is ${trn(root,q)}: ${shTxt(sh)}. Above ${root}, ${n[1]} is ${TSEM[q][0]} semitones (${TIV[q][0]}) and ${n[2]} is ${TSEM[q][1]} semitones (${TIV[q][1]}): ${a}.`}}}
function gNameSym(qs,invs=[0]){return function(){const o=rShape(qs,invs),{q,root,sh,n,inv}=o,a=trn(root,q),bd=ORD3[inv][0];
  return{type:'choice',key:'ns'+shKey(o),text:inv===0?'These marked notes form a root-position triad (the lowest note is the root). Which chord is it?':'These marked notes form a triad (not necessarily in root position). Which chord is it?',marks:sh.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),choices:mc(a,TQ.map(x=>trn(root,x))),ans:a,notes:mNotes(sh),
   hint:inv===0?'Take the lowest note as the root and measure the other two notes against it.':'Find which note has a 3rd and a 5th above it among the other two notes.',
   explain:`Notes ${n.join(' ')}${inv>0?` (${INVN[inv]}, ${n[bd]} in the bass)`:''}: ${root}→${n[1]} is ${art(TIV[q][0])} ${TIV[q][0]} and ${root}→${n[2]} is ${art(TIV[q][1])} ${TIV[q][1]}, so it is ${a}.`}}}
function gSetOf(){const o=rShape(AL,[0]),{q,root,set,sh}=o,a=setLbl(set);
  return{type:'choice',key:'so'+shKey(o),text:`This is a root-position ${trn(root,q)} triad. On which strings is it played?`,marks:shM(sh),choices:mc(a,SETS3.map(setLbl)),ans:a,notes:mNotes(sh),
   hint:'Count the strings from the thickest (low E) upwards.',explain:`The three notes sit on the ${setLbl(set)} strings: ${shTxt(sh)}.`}}
function gInvName(qs,invs=[0,1,2]){return function(){const o=rShape(qs,invs),{q,root,set,inv,sh,n}=o,bd=ORD3[inv][0],a=INVN[inv],pos=['lowest','middle','top'][sh.findIndex(p=>p.deg===0)];
  return{type:'choice',key:'in'+shKey(o),text:`This is ${trn(root,q)} on the ${strTxt(set)}. The marked R is its root. Which inversion is shown?`,marks:shM(sh,false).map((m,i)=>sh[i].deg===0?{...m,t:'R',k:'root'}:m),choices:mc(a,INVN),ans:a,notes:mNotes(sh),
   hint:'Is the root the lowest, middle or highest note? That decides which chord tone is in the bass.',
   explain:`${trn(root,q)} = ${n.join(' ')}. The root is the ${pos} note, so the bass is the ${TONE[bd]} (${n[bd]}): ${a}. (Root lowest = root position; root on top = 1st inversion; root in the middle = 2nd inversion.)`}}}
function gInvNotes(qs){return function(){const q=pick(qs),root=pick(RTS(q)),inv=R(0,2),n=chordNotes(root,q),ord=ORD3[inv].map(i=>n[i]),a=INVN[inv];
  return{type:'choice',noBoard:true,key:`iv${q}${root}${inv}`,text:`${trn(root,q)} (${n.join(' ')}) is played with the notes ${fmtN(ord)}, lowest to highest. Which inversion is this?`,choices:mc(a,INVN),ans:a,hint:'Which chord tone is the lowest note?',
   explain:`The bass note is ${ord[0]}, the ${TONE[ORD3[inv][0]]} of ${root}: ${a}.`}}}
function gBassNote(qs){return function(){const q=pick(qs),root=pick(RTS(q)),inv=R(0,2),n=chordNotes(root,q),a=n[ORD3[inv][0]],fl=n.some(x=>x.includes('♭'))||flatish(root);
  return{type:'choice',noBoard:true,key:`bn${q}${root}${inv}`,text:`Which note is in the bass of ${trn(root,q)} (${n.join(' ')}) in ${INVN[inv]}?`,choices:mc(a,[...n,pcName(pcOf(a)+1,fl),pcName(pcOf(a)-1,fl)]),ans:a,hint:'Root position: root in the bass. 1st inversion: the 3rd. 2nd inversion: the 5th.',
   explain:`In ${INVN[inv]} the ${TONE[ORD3[inv][0]]} is the lowest note: ${a}.`}}}
function gSlash(qs){return function(){const q=pick(qs),root=pick(RTS(q)),inv=R(1,2),n=chordNotes(root,q),b=n[ORD3[inv][0]],a=INVN[inv];
  return{type:'choice',noBoard:true,key:`sl${q}${root}${inv}`,text:`The slash chord ${trSym(root,q)}/${b} means ${trn(root,q)} with ${b} in the bass. Which inversion is that?`,choices:mc(a,INVN),ans:a,hint:`${root}${CHORDS[q].sym} has the notes ${n.join(' ')}. Which chord tone is ${b}?`,
   explain:`${trn(root,q)} = ${n.join(' ')}. ${b} is the ${TONE[ORD3[inv][0]]}, so ${trSym(root,q)}/${b} is ${a}.`}}}
function gStepTh(){const q=pick(AL),root=pick(RTS(q)),a=R(0,2),st=[TSEM[q][0],TSEM[q][1]-TSEM[q][0],12-TSEM[q][1]][a],ans=st+' frets',n=chordNotes(root,q),nx=ORD3[(a+1)%3][0];
  return{type:'choice',noBoard:true,key:`sh${q}${root}${a}`,text:`Moving ${trn(root,q)} up the neck on one string set, the shape changes from ${INVN[a]} to ${INVN[(a+1)%3]}. By how many frets does the bass note rise on its string?`,choices:mc(ans,['3 frets','4 frets','5 frets','6 frets','7 frets']),ans,
   hint:'The bass moves from one chord tone to the next chord tone above it.',explain:`The bass moves from ${n[ORD3[a][0]]} to ${n[nx]}: ${ans} (${st} semitones on the same string).`}}
function gNextInv(qs){return function(){const o=pickLad(qs),{q,root,set,a,b,n}=o,ans=INVN[b.inv];
  return{type:'choice',key:'ni'+q+root+set.join('')+a.sh.map(p=>p.f).join('-'),text:`The labelled notes are ${trn(root,q)} in ${INVN[a.inv]} on the ${strTxt(set)}. The shape marked ? is the next one up the neck on the same strings. Which inversion is it?`,
   marks:[...shM(a.sh),...b.sh.map(p=>({s:p.s,f:p.f,t:'?',k:'q'}))],choices:mc(ans,INVN),ans,notes:mNotes(b.sh),hint:'Each note moves up to the next chord tone on its own string. Which chord tone is now in the bass?',
   explain:`The order of inversions repeats as you climb: root position → 1st → 2nd → root position an octave higher. After ${INVN[a.inv]} comes ${ans}: ${shTxt(b.sh)}.`}}}
function gNextClick(qs,sets=SETS3){return function(){const o=pickLad(qs,1,sets),{q,root,set,a,b,n}=o;
  return{type:'multi',key:'nc'+q+root+set.join('')+a.sh.map(p=>p.f).join('-'),text:`${trn(root,q)} in ${INVN[a.inv]} on the ${strTxt(set)} is marked. Click the three notes of the next shape up the neck on the same strings (${INVN[b.inv]}).`,
   marks:shM(a.sh),targets:tgs(b.sh),notes:mNotes(b.sh),hint:`${trn(root,q)} = ${n.join(' ')}. Each note moves up to the next chord tone on its own string.`,
   explain:`${INVN[b.inv][0].toUpperCase()+INVN[b.inv].slice(1)}: ${shTxt(b.sh)}. Every note moved up to the next chord tone on its own string.`}}}
function gBassClick(qs){return function(){const o=pickLad(qs),{q,root,set,a,b,n}=o,st=b.sh[0].f-a.sh[0].f;
  return{type:'click',key:'bc'+q+root+set.join('')+a.sh.map(p=>p.f).join('-'),text:`${trn(root,q)} in ${INVN[a.inv]} on the ${strTxt(set)} is marked. Click the bass note of the next inversion up (${INVN[b.inv]}) on the ${SN[set[0]]} string.`,
   marks:shM(a.sh),target:{s:b.sh[0].s,f:b.sh[0].f,t:b.sh[0].t},notes:mNotes(b.sh),hint:'On the bass string the new bass note is the next chord tone above the old one: how many semitones apart are they?',
   explain:`The bass moves from ${a.sh[0].name} to ${b.sh[0].name}, ${st} semitones up on the same string: fret ${a.sh[0].f} → fret ${b.sh[0].f}.`}}}
function gLadder(qs){return function(){const o=pickLad(qs,2),{q,root,set,a,b,c,n}=o;
  return{type:'multi',key:'ld'+q+root+set.join('')+a.sh.map(p=>p.f).join('-'),text:`${trn(root,q)} in ${INVN[a.inv]} on the ${strTxt(set)} is marked. Climb the neck on the same strings: click the notes of the next two shapes (${INVN[b.inv]}, then ${INVN[c.inv]}).`,
   marks:shM(a.sh),targets:[...tgs(b.sh),...tgs(c.sh)],notes:[...mNotes(a.sh),...mNotes(b.sh),...mNotes(c.sh)],hint:`${trn(root,q)} = ${n.join(' ')}. Each shape is the one before it with every note moved up to the next chord tone.`,
   explain:`${INVN[b.inv][0].toUpperCase()+INVN[b.inv].slice(1)}: ${shTxt(b.sh)}. ${INVN[c.inv][0].toUpperCase()+INVN[c.inv].slice(1)}: ${shTxt(c.sh)}.`}}}
/* augmented triads */
const augName=pc=>[NNF[pc],NN[pc]].find(r=>chordNotes(r,'aug').every(okN))||NNF[pc];
function gAugBass(){const root=pick(RTS('aug')),inv=R(0,2),n=chordNotes(root,'aug'),a=n[ORD3[inv][0]],fl=n.some(x=>x.includes('♭'))||flatish(root);
  return{type:'choice',noBoard:true,key:`ab${root}${inv}`,text:`Which note is in the bass of ${root} augmented (${n.join(' ')}) in ${INVN[inv]}?`,choices:mc(a,[...n,pcName(pcOf(a)+1,fl),pcName(pcOf(a)-1,fl)]),ans:a,hint:'Root position: root. 1st inversion: the 3rd. 2nd inversion: the 5th.',explain:`In ${INVN[inv]} the ${TONE[ORD3[inv][0]]} is the lowest note: ${a}.`}}
function gAugSame(){const root=pick(RTS('aug')),p=pcOf(root),o=pick([4,8]),a=augName((p+o)%12)+' augmented',own=[p,(p+4)%12,(p+8)%12];
  const pool=[0,1,2,3,4,5,6,7,8,9,10,11].filter(x=>!own.includes(x)).map(x=>augName(x)+' augmented');
  return{type:'choice',noBoard:true,key:'as'+root+o,text:`Which augmented triad contains exactly the same three pitches as ${root} augmented?`,choices:mc(a,pool),ans:a,hint:'Add 4 frets to each note of the chord and see what you get.',
   explain:`${root} augmented = ${chordNotes(root,'aug').join(' ')}. The notes are equally spaced (4 frets), so each one can be the root: ${root}+, ${augName((p+4)%12)}+ and ${augName((p+8)%12)}+ are the same three pitches.`}}
function gAugSlide(){for(let i=0;i<800;i++){const o=rShape(['aug'],[0,1,2]),{root,set,inv,sh,n}=o,k=pick([1,2]),mv=4*k;if(Math.max(...sh.map(p=>p.f))+mv>15)continue;
  const ni=(inv+k)%3,a=INVN[ni],nsh=sh.map(p=>({...p,f:p.f+mv}));
  return{type:'choice',key:`sd${shKey(o)}${k}`,text:`The labelled notes are ${root} augmented in ${INVN[inv]} on the ${strTxt(set)}. You slide the whole shape up ${mv} frets (new notes marked ?). Described as an inversion of ${root} augmented, what is it now?`,
   marks:[...shM(sh),...nsh.map(p=>({s:p.s,f:p.f,t:'?',k:'q'}))],choices:mc(a,INVN),ans:a,notes:mNotes(nsh),hint:`Sliding up ${mv} frets raises every note by ${k===1?'a major 3rd':'two major 3rds'}. Which chord tone ends up in the bass?`,
   explain:`${root} augmented = ${n.join(' ')}. Every note moves up ${mv} semitones to the next${k===2?'-but-one':''} chord tone, so the bass becomes ${n[ORD3[ni][0]]}, the ${TONE[ORD3[ni][0]]}: ${a}. The shape looks identical because the chord is symmetrical.`}}
  return gAugSlide()}
function gAugNotName(){const rs=rShape(['aug'],[0]),{root,sh}=rs,p=pcOf(root),own=[p,(p+4)%12,(p+8)%12],valid=own.map(x=>augName(x)+' augmented'),bad=[0,1,2,3,4,5,6,7,8,9,10,11].filter(x=>!own.includes(x)),a=augName(pick(bad))+' augmented',nn=chordNotes(root,'aug');
  return{type:'choice',key:'an'+shKey(rs),text:'These marked notes form an augmented triad. Which of these names does NOT fit it?',marks:sh.map(q=>({s:q.s,f:q.f,t:q.name,k:'q'})),choices:shuf([a,...valid]),ans:a,notes:mNotes(sh),
   hint:'Every note of an augmented triad can be the root: look at what is 4 and 8 semitones above each note.',explain:`The notes are ${nn.join(' ')}. Each one can act as the root, so ${valid.join(', ')} are all the same chord. ${a} would need different notes.`}}
const bank=sbank;
const bank21=bank('b21',[
 ['How many sets of three adjacent strings are there on a six-string guitar?','4',['3','5','6'],'Low E–A–D, A–D–G, D–G–B and G–B–high e.'],
 ['In a root-position triad on three adjacent strings, which note is on the lowest string?','The root',['The 3rd','The 5th','Any of the three'],'Root position means the root is the lowest note.'],
 ['Which two string sets give a root-position triad exactly the same shape?','Low E–A–D and A–D–G',['A–D–G and D–G–B','D–G–B and G–B–high e','Low E–A–D and G–B–high e'],'Both sets are tuned in two perfect 4ths; the G–B gap is a major 3rd (4 frets) and changes the shape.'],
 ['Why does a triad shape change on sets that contain both G and B?','The G–B gap is 4 semitones, not 5',['The B string is tuned lower than the G string','There are no chords on those strings','The root must be on the B string'],'Every other neighbouring gap is a perfect 4th (5 semitones); G–B is a major 3rd (4 semitones).'],
 ['In which set does a root-position major triad put two notes on the same fret?','G–B–high e',['D–G–B','A–D–G','Low E–A–D'],'For example C major: G string fret 5, B string fret 5, high e fret 3.'],
 ['How many different root-position shapes does one triad type have across the four adjacent string sets?','3',['4','2','1'],'Low E–A–D and A–D–G match, while D–G–B and G–B–high e each differ.'],
 ['You play the same root-position triad on the A–D–G strings and on the D–G–B strings. What stays the same?','The note names (root, 3rd, 5th)',['The fret numbers','The strings used','The fingering'],'Same chord, same three notes, but the shape on the neck differs.'],
 ['Which chord tone is on the highest string of a root-position triad?','The 5th',['The root','The 3rd','The 7th'],'Root position stacks root, 3rd, 5th from low to high.']]);
const bank22=bank('b22',[
 ['What is an inversion?','The same chord with a note other than the root in the bass',['A chord with its quality reversed','A chord played backwards','A chord with a new root'],'The notes are the same; only the lowest note changes.'],
 ['Which chord tone is in the bass in 1st inversion?','The 3rd',['The root','The 5th','The 7th'],'1st inversion: 3rd – 5th – root.'],
 ['Which chord tone is in the bass in 2nd inversion?','The 5th',['The root','The 3rd','The 7th'],'2nd inversion: 5th – root – 3rd.'],
 ['How many inversions does a triad have (not counting root position)?','2',['1','3','4'],'Three notes means three possible bass notes: root position plus two inversions.'],
 ['In C major, which inversion is C/E (E in the bass)?','1st inversion',['Root position','2nd inversion','3rd inversion'],'E is the 3rd of C.'],
 ['In C major, which inversion is C/G (G in the bass)?','2nd inversion',['Root position','1st inversion','3rd inversion'],'G is the 5th of C.'],
 ['What does the chord name after the slash show in G/B?','The note in the bass',['The new root','The chord quality','The key'],'G/B is G major with B (its 3rd) in the bass.'],
 ['Does an inversion change the chord name?','No, the chord is still the same triad (only the bass note changes)',['Yes, it becomes a different chord','Yes, it becomes minor','Only on the A string'],'C E G, E G C and G C E are all C major.'],
 ['In 1st inversion, which chord tone is on the highest string?','The root',['The 3rd','The 5th','None: it is a different note'],'1st inversion from low to high: 3rd – 5th – root.']]);
const bank23=bank('b23',[
 ['Moving up the neck on one string set, the order of triad shapes is…','root position, 1st inversion, 2nd inversion, root position again',['root position, 2nd inversion, 1st inversion','1st inversion, root position, 2nd inversion','all the same shape'],'Each shape moves every note to the next chord tone above it, and the cycle repeats an octave higher.'],
 ['After 2nd inversion on the same string set, which shape follows higher up the neck?','Root position, an octave higher',['1st inversion, an octave lower','A different chord','2nd inversion again'],'5th – root – 3rd moves up to root – 3rd – 5th.'],
 ['Which chord tone is on the highest string of a root-position triad?','The 5th',['The root','The 3rd','The 7th'],'Root position, low to high: root – 3rd – 5th.'],
 ['Which chord tone is on the highest string of a 2nd-inversion triad?','The 3rd',['The root','The 5th','The 7th'],'2nd inversion, low to high: 5th – root – 3rd.'],
 ['Which chord tone is on the highest string of a 1st-inversion triad?','The root',['The 3rd','The 5th','The 7th'],'1st inversion, low to high: 3rd – 5th – root.'],
 ['Going up the neck on one string set from root position to 1st inversion, the bass note moves from…','the root to the 3rd',['the root to the 5th','the 3rd to the 5th','the 5th to the root'],'Bass: root → 3rd → 5th → root.'],
 ['Three triad shapes (root position, 1st, 2nd) on one string set together span roughly…','an octave (12 frets)',['3 frets','5 frets','24 frets'],'The bass climbs root → 3rd → 5th → root, which adds up to 12 semitones.'],
 ['Why is it useful to know all three inversions on one string set?','You can play any chord near any position without jumping',['It changes the key','It makes chords louder','It replaces open chords'],'The same chord is available wherever your hand is, and chord changes can move by small steps.']]);
const bank24=bank('b24',[
 ['Every inversion of an augmented triad is…','another augmented triad with the same shape',['a minor triad','a diminished triad','a major triad'],'The notes are all a major 3rd apart, so each inversion looks identical.'],
 ['You slide an augmented triad shape 4 frets up on the same strings. What is the new chord?','The same chord in another inversion',['A minor triad','A different chord with new notes','A diminished triad'],'C E G♯ becomes E G♯ C: the same three pitches.'],
 ['How far must you slide an augmented triad shape to return to the same inversion?','12 frets',['4 frets','6 frets','8 frets'],'4 frets gives the next inversion, 8 frets the one after, 12 frets the same shape an octave higher.'],
 ['On one string set, an augmented triad shape repeats its look every…','4 frets',['3 frets','5 frets','7 frets'],'The notes are 4 semitones apart.'],
 ['Why do all inversions of an augmented triad look the same?','All the intervals between its notes are major 3rds',['It has no root','It uses only natural notes','It has a perfect 5th'],'4 + 4 + 4 = 12: three equal steps.'],
 ['C augmented in 1st inversion has E in the bass. What other root-position chord has the same notes?','E augmented',['E♭ augmented','C minor','E major'],'E G♯ C (E augmented) = C E G♯ (C augmented) in 1st inversion.'],
 ['How many different augmented triads (as sets of pitches) exist?','4',['3','6','12'],'Each set has 3 notes and 3 possible roots: 12 ÷ 3 = 4.'],
 ['From the bass of one augmented inversion to the bass of the next on one string, you move…','4 frets',['3 frets','5 frets','7 frets'],'Root → 3rd → 5th → root, each step a major 3rd.'],
 ['In C augmented (C E G♯), which note is in the bass in 2nd inversion?','G♯',['C','E','A♭'],'The 5th, spelled G♯ in C+.']]);

const flR=gFill(AL),flRI=gFill(AL,[0],true),flInv=gFill(I3,[1,2]),flInvAny=gFill(I3,[0,1,2],true),flAug=gFill(['aug'],[0,1,2],true);
const ftR=gFindTone(AL),ftInv=gFindTone(I3,[1,2]),ftAny=gFindTone(I3,[0,1,2]),ftAug=gFindTone(['aug'],[0,1,2]);
const frR=gFrets(AL),frInv=gFrets(I3,[1,2]),frAny=gFrets(I3,[0,1,2]);
const nmAll=gName(AL,AL),nmAny=gName(I3,I3,[0,1,2]),nsAll=gNameSym(AL),nsInv=gNameSym(I3,[0,1,2]);
const inAll=gInvName(I3),inAug=gInvName(['aug']),ivN=gInvNotes(I3),bnN=gBassNote(I3),slN=gSlash(['maj','min']);
const niN=gNextInv(I3),ncN=gNextClick(I3),bcN=gBassClick(I3),ldN=gLadder(I3),ncAug=gNextClick(['aug']),niAug=gNextInv(['aug']);

const LS={
 sets:{h:'triad-shapes-string-sets',n:'Lesson 21',title:'Triad shapes on all string sets',sub:'Root-position triads on the four sets of three adjacent strings.',
  ex:[['Concepts',[bank21,gSetOf]],['Fill the shape',[flR,flRI]],['Frets & tones',[frR,ftR]],['Name it',[nmAll,nsAll]]],
  test:[...rep(bank21,3),gSetOf,...rep(flR,3),...rep(flRI,2),...rep(frR,2),...rep(ftR,2),nmAll,nsAll]},
 inv:{h:'triad-inversions',n:'Lesson 22',title:'Triad inversions',sub:'Root position, 1st and 2nd inversion: which chord tone is in the bass.',
  ex:[['Concepts',[bank22,ivN,bnN,slN]],['Read the shape',[inAll,nsInv]],['Build it',[flInv,flInvAny,ftInv]],['Frets',[frInv,nmAny]]],
  test:[...rep(bank22,2),...rep(ivN,2),bnN,slN,...rep(inAll,3),...rep(flInv,2),flInvAny,ftInv,frInv,nmAny]},
 vert:{h:'triad-inversions-vertical',n:'Lesson 23',title:'Inversions up the neck',sub:'Moving through the inversions on one string set.',
  ex:[['Concepts',[bank23,gStepTh]],['Next shape',[niN,ncN,bcN]],['Climb the neck',[ldN,inAll]]],
  test:[...rep(bank23,2),...rep(gStepTh,2),...rep(niN,3),...rep(ncN,3),...rep(bcN,2),...rep(inAll,2),ldN]},
 aug:{h:'augmented-triad-inversions',n:'Lesson 24',title:'Augmented triad inversions',sub:'One shape, three names: every augmented inversion looks the same.',
  ex:[['Concepts',[bank24,gAugBass,gAugSame]],['Slide it',[gAugSlide,gAugNotName]],['Build it',[flAug,ftAug,ncAug]],['Read the shape',[inAug,niAug]]],
  test:[...rep(bank24,3),gAugBass,gAugSame,...rep(gAugSlide,3),gAugNotName,...rep(flAug,2),ftAug,ncAug,inAug,niAug]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 21–24 mixed.',
  ex:[['Lessons 21–22',[bank21,bank22,gSetOf,flR,frR,ftR,nmAll,nsAll,inAll,ivN,bnN,slN,flInv,ftInv]],['Lessons 23–24',[bank23,bank24,gStepTh,niN,ncN,bcN,ldN,gAugBass,gAugSame,gAugSlide,gAugNotName,flAug,ncAug]]],
  test:[bank21,bank22,bank23,bank24,gSetOf,ivN,bnN,gStepTh,gAugSame,flR,flInv,frAny,ftAny,nmAny,inAll,niN,ncN,bcN,gAugSlide,flAug]}};
const ORDER=['sets','inv','vert','aug','final'],STORE='gi-best-p6';

const shLine=(r,q,inv,set,lo=1)=>{const s=firstShape(r,q,inv,set,lo);return s?`${trn(r,q)}, ${INVN[inv]}, ${setLbl(set)} strings (low→high): frets ${s.map(p=>p.f).join('-')}`:''};
const NOTES={
 sets:`<div class="cols"><div><h3>Root-position triad shapes (frets relative to the root)</h3><table class="stack"><thead><tr><th>Strings</th><th>Major</th><th>Minor</th></tr></thead><tbody>${SETS3.map(st=>{const f=(q)=>{const r=firstShape('C',q,0,st),b=r[0].f;return r.map(p=>p.f-b>0?'+'+(p.f-b):p.f-b===0?'0':String(p.f-b).replace('-','−')).join(' ')};return`<tr><td>${setLbl(st)}</td><td>${f('maj')}</td><td>${f('min')}</td></tr>`}).join('')}</tbody></table><p class="small">Fret offsets of the 3rd and 5th compared with the root fret, low string to high string.</p></div>
  <div><h3>Key ideas</h3><ul><li>There are four sets of three adjacent strings; the root-position shape has the root on the lowest string of the set.</li><li>Low E–A–D and A–D–G give the same shape (two perfect 4ths); D–G–B and G–B–high e differ because of the major-3rd gap between G and B.</li><li>Every shape is movable: the root fret names the chord.</li><li>This lesson uses root-position, close-position triads (span of at most 4 frets).</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','maj',0,[1,2,3])}.</li><li>${shLine('C','maj',0,[2,3,4])}.</li><li>Play one chord on all four sets and say root, 3rd, 5th on each string.</li></ul></div></div>`,
 inv:`<div class="cols"><div><h3>C major in its three positions</h3><table class="stack"><thead><tr><th>Position</th><th>Low → high</th><th>Bass</th></tr></thead><tbody>${[0,1,2].map(i=>`<tr><td>${cap(INVN[i])}</td><td>${ORD3[i].map(x=>chordNotes('C','maj')[x]).join(' ')}</td><td>${TONE[ORD3[i][0]]}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>An inversion keeps the same three notes but changes which one is lowest.</li><li>Find the root: lowest note = root position; top note = 1st inversion; middle note = 2nd inversion.</li><li>Slash chords name the bass: C/E is 1st inversion, C/G is 2nd inversion.</li><li>Inversions shown here are close-position triads on three adjacent strings.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','maj',0,[2,3,4])}</li><li>${shLine('C','maj',1,[2,3,4])}</li><li>${shLine('C','maj',2,[2,3,4])}</li></ul></div></div>`,
 vert:`<div class="cols"><div><h3>Climbing one string set</h3><table class="stack"><thead><tr><th>Shape</th><th>Bass moves by (major)</th><th>Bass moves by (minor)</th></tr></thead><tbody><tr><td>Root pos. → 1st inv.</td><td>root → 3rd: 4 frets</td><td>3 frets</td></tr><tr><td>1st inv. → 2nd inv.</td><td>3rd → 5th: 3 frets</td><td>4 frets</td></tr><tr><td>2nd inv. → root pos.</td><td>5th → root: 5 frets</td><td>5 frets</td></tr></tbody></table><p class="small">The three steps add up to 12 frets: one octave.</p></div>
  <div><h3>Key ideas</h3><ul><li>On one string set the same chord appears as root position, 1st and 2nd inversion as you climb the neck, then repeats an octave higher.</li><li>Each note of the shape moves up to the next chord tone on its own string.</li><li>Top note: root position = 5th, 1st inversion = root, 2nd inversion = 3rd.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Climb C major on the D, G and B strings: ${[0,1,2].map(i=>{const s=ladder('C','maj',[2,3,4]).find(x=>x.inv===i);return s?s.sh.map(p=>p.f).join('-'):''}).filter(Boolean).join(', ')} (frets, low to high).</li><li>Do the same on G, B, high e, then on A, D, G.</li><li>Pick a note on the high e string and find which inversion has that note on top.</li></ul></div></div>`,
 aug:`<div class="cols"><div><h3>One shape, three roots</h3><table class="stack"><thead><tr><th>Slide</th><th>C+ becomes</th><th>Bass</th></tr></thead><tbody><tr><td>0 frets</td><td>C E G♯ (root position)</td><td>C</td></tr><tr><td>+4 frets</td><td>E G♯ C (1st inversion)</td><td>E</td></tr><tr><td>+8 frets</td><td>G♯ C E (2nd inversion)</td><td>G♯</td></tr><tr><td>+12 frets</td><td>C E G♯ again</td><td>C</td></tr></tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>An augmented triad is made of two major 3rds, so all its inversions are the same shape.</li><li>Slide the shape 4 frets: the same three pitches, a new bass note.</li><li>C+, E+ and A♭+ (G♯+) are three names for the same pitches; which name you use depends on the music around it.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','aug',0,[2,3,4])}. Slide it up 4, then 8 frets.</li><li>Find the same shape on the G, B and high e strings and on the A, D and G strings.</li></ul><p class="small">When one shape has three names, this workbook always calls the marked note the root.</p></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 21–24: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 25 builds triads on every note of the major scale: diatonic major scale triads.</p></div></div>`};
