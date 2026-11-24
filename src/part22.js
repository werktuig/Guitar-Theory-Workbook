/* ---------- shared helpers for this part ---------- */
const LB=f=>f.split(' ').map(t=>t.replace(/^bb/,'𝄫').replace(/^b/,'♭').replace(/^#/,'♯'));
const ROOTS=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const okSc=(r,sc)=>scaleNotes(r,sc).every(n=>!/[𝄪𝄫]/.test(n)&&!/^(E♯|B♯|C♭|F♭)$/.test(n));
const sname=sc=>SCALES[sc].name;
const strTxt=a=>{const n=a.map(s=>SN[s]);return n.length===1?n[0]:n.slice(0,-1).join(', ')+' and '+n[n.length-1]};
/* scale positions on the neck: {s,f,name,i (0-based degree index),t (short degree label)} */
function scPos(root,sc,strings,lo,hi){const nn=scaleNotes(root,sc),lb=LB(SCALES[sc].f);if(sc==='dorian')lb[5]='♮6';const o=[];for(const s of strings)for(let f=lo;f<=hi;f++){const i=nn.findIndex(n=>pcOf(n)===pcAt(s,f));if(i>=0)o.push({s,f,name:nn[i],i,t:i===0?'R':lb[i]})}return o}
const dlabels=sc=>{const lb=LB(SCALES[sc].f);if(sc==='dorian')lb[5]='♮6';return lb};
const seqN=ps=>ps.slice().sort((a,b)=>midi(a.s,a.f)-midi(b.s,b.f)).map(p=>midi(p.s,p.f));
const rbox=r=>{const f=rootFret(r,0,1);return[f-1,f+2]};
const eqp=(a,b)=>a.s===b.s&&a.f===b.f;
const mk=(p,k,t)=>({s:p.s,f:p.f,t:t===undefined?p.t:t,k});
const tgt=(p,t)=>({s:p.s,f:p.f,t:t===undefined?p.t:t});
const MODEROOT=(P,d)=>spellScale(P)[d-1];
const dname=sc=>sname(sc);
const spellTxt=(r,sc)=>`${r} ${dname(sc)}: ${scaleNotes(r,sc).join(' ')}`;
/* chord tones in a box on four strings */
function ctTask(root,q,sc,tag){for(let k=0;k<80;k++){const a=R(0,2),strs=[a,a+1,a+2,a+3],box=rbox(root),ps=scPos(root,sc,strs,box[0],box[1]),cp=chordNotes(root,q).map(pcOf),tg=ps.filter(p=>cp.includes(pcOf(p.name)));if(tg.length<3||tg.length>8)continue;const sym=chordSym(root,q);
  return{type:'multi',key:`${tag}${root}${q}${sc}${a}`,box,text:`Over ${sym} you play ${root} ${dname(sc)}. Click every chord tone of ${sym} inside the shaded box on the ${strTxt(strs)} strings. (Ghost notes are the other scale notes.)`,marks:ps.filter(p=>!tg.includes(p)).map(p=>mk(p,'ghost')),targets:tg.map(p=>tgt(p)),notes:seqN(tg),pm:'seq',hint:chordNotes(root,q).length===3?'Chord tones here are scale degrees 1, 3 and 5. The ghost notes are the others.':'Chord tones are every other note of the scale: degrees 1, 3, 5 and 7. The ghost notes are the 2nd, 4th and 6th.',explain:`${sym} = ${chordNotes(root,q).join(' ')}. ${spellTxt(root,sc)}. Chord tones in the box: ${tg.map(p=>`${p.name} (${fretTxt(p.f)}, ${SL[p.s]} string)`).join(', ')}.`}}
  return ctTask(root,q,sc,tag)}
/* click one degree on one string, root marked */
function degClick(root,sc,q,tag,idxs,txtFn){for(let k=0;k<120;k++){const box=rbox(root),ps=scPos(root,sc,[0,1,2,3,4,5],box[0],box[1]),i=pick(idxs),s=R(0,5),c=ps.filter(p=>p.s===s&&p.i===i),rs=ps.filter(p=>p.i===0);if(c.length!==1||!rs.length)continue;const rt=pick(rs);
  return{type:'click',key:`${tag}${root}${sc}${i}${s}`,box,text:txtFn(c[0],i),marks:[mk(rt,'root','R')],target:tgt(c[0]),notes:[midi(rt.s,rt.f),midi(c[0].s,c[0].f)],hint:`Spell ${root} ${dname(sc)} first (${scaleNotes(root,sc).join(' ')}), then find that note on the ${SN[s]} string inside the box.`,explain:`${spellTxt(root,sc)}. The ${c[0].t} is ${c[0].name}: on the ${SN[s]} string, inside the box, it is at ${(x=>x==='open'?'the open string':x)(fretTxt(c[0].f))}.`}}
  return degClick(root,sc,q,tag,idxs,txtFn)}
/* click every occurrence of one degree in the box, root marked */
function degAll(root,sc,i,tag,txt){for(let k=0;k<80;k++){const box=rbox(root),ps=scPos(root,sc,[0,1,2,3,4,5],box[0],box[1]),tg=ps.filter(p=>p.i===i),rs=ps.filter(p=>p.i===0);if(!tg.length||tg.length>6||!rs.length)continue;const rt=pick(rs);
  return{type:'multi',key:`${tag}${root}${sc}${i}`,box,text:txt(tg[0]),marks:[mk(rt,'root','R')],targets:tg.map(p=>tgt(p)),notes:seqN(tg),hint:`Spell ${root} ${dname(sc)}, find the note, then look for it on every string inside the box.`,explain:`${spellTxt(root,sc)}. The ${tg[0].t} is ${tg[0].name}: ${tg.map(p=>`${SL[p.s]} string ${fretTxt(p.f)}`).join(', ')}.`}}
  return degAll(root,sc,i,tag,txt)}

/* ===== Part 22: lessons 88–91 ===== */
const CH={dorian:[6,'♮6','natural 6th'],phrygian:[2,'♭2','flat 2nd'],lydian:[4,'♯4','sharp 4th'],mixolydian:[7,'♭7','flat 7th'],aeolian:[6,'♭6','flat 6th'],locrian:[5,'♭5','flat 5th']};
const KN={min:'minor',maj:'major'},PS={min:'minPent',maj:'majPent'},POFF=[0,3,5,7,10];
const PROOTS={min:['C','C♯','D','E♭','E','F','F♯','G','G♯','A','B♭','B'],maj:['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B']};
const okN=n=>!/[𝄪𝄫]/.test(n)&&!/^(E♯|B♯|C♭|F♭)$/.test(n);
const okP=(r,kind)=>scaleNotes(r,PS[kind]).every(okN);
const pent=(r,kind)=>scaleNotes(r,PS[kind]);
const pname=(r,kind)=>`${r} ${KN[kind]} pentatonic`;
const wordT=t=>t==='R'?'root':t;
const PLB={min:['R','♭3','4','5','♭7'],maj:['R','2','3','5','6']};
/* one pentatonic box: two notes per string. j = 0..4 numbered like the minor pentatonic boxes (box 1 of a major pentatonic = box 1 of its relative minor) */
function penBox(r,kind,j){const sc=PS[kind],nn=scaleNotes(r,sc),pcs=nn.map(pcOf),lb=PLB[kind],nr=kind==='min'?pcOf(r):(pcOf(r)+9)%12,f0=((nr-4)%12+12)%12,base=(f0+POFF[j])%12,res=[];
  for(const c of [base,base+12]){const notes=[];let top=-1,ok=true;
    for(let s=0;s<6&&ok;s++){let first=-1;if(s===0)first=c;else for(let f=0;f<=15;f++)if(midi(s,f)>top&&pcs.includes(pcAt(s,f))){first=f;break}
      if(first<0||first>15){ok=false;break}let second=-1;for(let f=first+1;f<=15;f++)if(pcs.includes(pcAt(s,f))){second=f;break}
      if(second<0){ok=false;break}
      for(const f of [first,second]){const i=pcs.indexOf(pcAt(s,f));notes.push({s,f,name:nn[i],i,t:lb[i]})}top=midi(s,second)}
    if(ok)res.push(notes)}
  if(!res.length)return null;const notes=pick(res),fr=notes.map(n=>n.f);return{notes,lo:Math.min(...fr),hi:Math.max(...fr)}}
function rndBox(kind,jfix){for(let k=0;k<400;k++){const r=pick(PROOTS[kind].filter(x=>okP(x,kind))),j=jfix===undefined?R(0,4):jfix,b=penBox(r,kind,j);if(b)return{r,j,...b,box:[b.lo,b.hi]}}return rndBox(kind,jfix)}
const boxTxt=(b,kind)=>`${pname(b.r,kind)}, box ${b.j+1}`;
const lowNote=(b,kind)=>`${b.notes[0].name}, ${b.notes[0].t==='R'?'the root':'degree '+b.notes[0].t}`;
const byStr=(notes,strs)=>strs.map(s=>`${SL[s]}: ${notes.filter(n=>n.s===s).map(n=>`${n.name} (${n.f})`).join(', ')}`).join(' · ');
const diffList=(a,b)=>a.filter(n=>!b.map(pcOf).includes(pcOf(n)));

function pnMake(KK){const sc=PS[KK],first=KK==='min'?0:1,lbl=PLB[KK];
 const spell=()=>{const r=pick(PROOTS[KK].filter(x=>okP(x,KK))),ans=pent(r,KK).join(' '),wf=KK==='min'?['1 2 3 5 6','1 b3 4 5 7','1 2 b3 5 b7','1 b3 4 b5 b7']:['1 b3 4 5 b7','1 2 3 5 7','1 2 b3 5 6','1 3 4 5 6'],pool=wf.map(f=>spellF(r,f).join(' ')).filter(x=>okN(x.split(' ')[0])&&!/[𝄪𝄫]/.test(x));
  return{type:'choice',noBoard:true,key:`${KK}sp${r}`,text:`Which notes make up the ${pname(r,KK)} scale?`,choices:mc(ans,pool),ans,hint:`The ${KN[KK]} pentatonic is ${lbl.map(x=>x==='R'?'1':x).join(' ')} measured from the root.`,explain:`${pname(r,KK)} = ${lbl.map(x=>x==='R'?'1':x).join(' ')} = ${ans}.`}};
 const fill=j=>()=>{for(let k=0;k<300;k++){const b=rndBox(KK,j),a=R(0,3),strs=[a,a+1,a+2],mkr=b.notes[0],tg=b.notes.filter(n=>strs.includes(n.s)&&!eqp(n,mkr));if(tg.length<4)continue;
  return{type:'multi',key:`${KK}fl${b.r}${b.j}${a}`,box:b.box,text:`${boxTxt(b,KK)}. The lowest note of the box (${lowNote(b,KK)}) is marked on the low E string. Click the other notes of the box on the ${strTxt(strs)} strings (two per string).`,marks:[mk(mkr,mkr.i===0?'root':'q',mkr.t)],targets:tg.map(n=>tgt(n,n.name)),notes:seqN(b.notes.filter(n=>strs.includes(n.s))),pm:'seq',hint:`Spell the scale (${pent(b.r,KK).join(' ')}), then find those notes inside the shaded frets: each string holds two.`,explain:`${pname(b.r,KK)} = ${pent(b.r,KK).join(' ')}. Box ${b.j+1}, frets ${b.lo}–${b.hi}: ${byStr(b.notes,strs)}.`}}
  return fill(j)()};
 const roots=()=>{for(let k=0;k<200;k++){const b=rndBox(KK),tg=b.notes.filter(n=>n.i===0);if(!tg.length)continue;
  return{type:'multi',key:`${KK}rt${b.r}${b.j}`,box:b.box,text:`${boxTxt(b,KK)} (shaded). The ghost notes are its other notes. Click every root (${b.r}) inside the box.`,marks:b.notes.filter(n=>n.i!==0).map(n=>mk(n,'ghost',n.t)),targets:tg.map(n=>tgt(n,'R')),notes:seqN(b.notes),pm:'seq',hint:`The root is ${b.r}. Look for it on every string of the box.`,explain:`${pname(b.r,KK)}, box ${b.j+1}, frets ${b.lo}–${b.hi}: the root ${b.r} is at ${tg.map(n=>`${SL[n.s]} string, fret ${n.f}`).join('; ')}.`}}
  return roots()};
 const click=()=>{for(let k=0;k<300;k++){const b=rndBox(KK),rs=b.notes.filter(n=>n.i===0),i=R(1,4),s=R(0,5),c=b.notes.filter(n=>n.s===s&&n.i===i);if(!rs.length||c.length!==1)continue;const rt=pick(rs);
  return{type:'click',key:`${KK}ck${b.r}${b.j}${s}${i}`,box:b.box,text:`${boxTxt(b,KK)} (shaded). One root is marked. Click degree ${lbl[i]} (${c[0].name}) on the ${SN[s]} string, inside the box.`,marks:[mk(rt,'root','R')],target:tgt(c[0],lbl[i]),notes:[midi(rt.s,rt.f),midi(c[0].s,c[0].f)],hint:`Spell ${pname(b.r,KK)} (${pent(b.r,KK).join(' ')}) and find degree ${lbl[i]} on that string.`,explain:`${pname(b.r,KK)} = ${pent(b.r,KK).join(' ')}. Degree ${lbl[i]} is ${c[0].name}: on the ${SN[s]} string, inside the box, fret ${c[0].f}.`}}
  return click()};
 const deg=()=>{for(let k=0;k<200;k++){const b=rndBox(KK),rs=b.notes.filter(n=>n.i===0);if(!rs.length)continue;const rt=pick(rs),x=pick(b.notes.filter(n=>n.i>0)),ans=lbl[x.i];
  return{type:'choice',key:`${KK}dg${b.r}${b.j}${x.s}${x.f}`,box:b.box,text:`${boxTxt(b,KK)}. The root is marked. Which degree of the scale is the ?`,marks:[mk(rt,'root','R'),mk(x,'q','?')],choices:mc(ans,lbl.slice(1)),ans,notes:[midi(rt.s,rt.f),midi(x.s,x.f)],hint:'Measure the interval from the root using the shapes you know.',explain:`${pname(b.r,KK)} = ${pent(b.r,KK).join(' ')}. The ? is ${x.name}, degree ${ans} of the scale.`}}
  return deg()};
 return{spell,fill1:fill(first),fillN:fill(),roots,click,deg}}
const MIN=pnMake('min'),MAJ5=pnMake('maj');

const mnBank=sbank('pb',[
 ['What is the minor pentatonic formula?','1 ♭3 4 5 ♭7',['1 2 3 5 6','1 ♭3 4 ♭5 5 ♭7','1 2 ♭3 5 ♭7'],'Five notes: the natural minor scale without its 2nd and ♭6.'],
 ['How many notes does a pentatonic scale have?','5',['7','6','8'],'“Penta” means five.'],
 ['Which two notes of the natural minor scale are left out of the minor pentatonic?','The 2nd and the ♭6',['The ♭3 and the ♭7','The 4th and the 5th','The root and the 5th'],'Natural minor: 1 2 ♭3 4 5 ♭6 ♭7. Remove the 2nd and ♭6.'],
 ['How many notes per string does a pentatonic box have?','2',['1','3','4'],'Five notes in a compact box give two notes on each of the six strings.'],
 ['In a minor pentatonic box with the root on the low E string, where is the 4th relative to the root?','5 frets higher on the same string, or the root’s next string, same fret',['2 frets higher','7 frets higher','1 fret higher'],'A perfect 4th is 5 semitones: 5 frets up on one string, or the same fret on the next string.'],
 ['How many pentatonic boxes are there up the neck?','5',['3','7','12'],'One box starts on each note of the scale, and they join end to end across the neck.'],
 ['Which note of the minor pentatonic gives it its minor sound?','The ♭3',['The 4th','The 5th','The root'],'The ♭3 distinguishes minor from major.']]);
const mjBank=sbank('jb',[
 ['What is the major pentatonic formula?','1 2 3 5 6',['1 ♭3 4 5 ♭7','1 2 3 4 5','1 3 5 6 7'],'Five notes: the major scale without its 4th and 7th.'],
 ['Which two notes of the major scale are left out of the major pentatonic?','The 4th and the 7th',['The 2nd and the 6th','The 3rd and the 5th','The root and the 5th'],'Major: 1 2 3 4 5 6 7. Remove the 4th and 7th, the two notes that clash most with chord tones.'],
 ['Which note gives the major pentatonic its major sound?','The major 3rd',['The 2nd','The 5th','The 6th'],'The 3rd is major, as in the major scale.'],
 ['How many boxes does the major pentatonic have, compared with the minor pentatonic?','5, with the same shapes',['3, different shapes','7','12, in all keys'],'The major pentatonic uses the same five shapes as its relative minor pentatonic.'],
 ['In C major pentatonic, which notes sit a whole step apart?','C–D, D–E, G–A',['E–G','A–C','C–E'],'C D E G A: the gaps are 2, 2, 3, 2, 3 semitones.'],
 ['Which interval gap is found twice in a pentatonic scale?','A minor 3rd (3 semitones)',['A tritone','A semitone','A major 7th'],'Pentatonic scales have no half steps; each has two minor-3rd gaps and three whole steps.'],
 ['Which of these is a pentatonic degree set for major?','1 2 3 5 6',['1 ♭3 4 5 ♭7','1 ♭2 3 5 6','1 3 4 5 7'],'Major pentatonic = 1 2 3 5 6.']]);
MIN.bank=mnBank;MAJ5.bank=mjBank;

/* ---------- Lesson 90: major vs minor pentatonic ---------- */
const relPair=()=>{for(let k=0;k<100;k++){const M=pick(PROOTS.maj),m=relMinor(M);if(okP(M,'maj')&&okP(m,'min')&&okN(m))return{M,m}}return{M:'C',m:'A'}};
function rvPair(){const{M,m}=relPair(),toMaj=Math.random()<.5;
  if(toMaj){const ans=`${M} major pentatonic`;return{type:'choice',noBoard:true,key:`rp1${M}`,text:`${pname(m,'min')} has the same notes as which major pentatonic scale?`,choices:mc(ans,[pname(m,'maj'),...PROOTS.maj.filter(x=>x!==M&&x!==m).map(x=>pname(x,'maj'))]),ans,hint:'The relative major root is a minor 3rd above the minor root.',explain:`${pname(m,'min')} = ${pent(m,'min').join(' ')}. ${pname(M,'maj')} = ${pent(M,'maj').join(' ')}: the same five notes. The relative major is 3 semitones above the minor root.`}}
  const ans=`${m} minor pentatonic`;return{type:'choice',noBoard:true,key:`rp2${M}`,text:`${pname(M,'maj')} has the same notes as which minor pentatonic scale?`,choices:mc(ans,[pname(M,'min'),...PROOTS.min.filter(x=>x!==m&&x!==M).map(x=>pname(x,'min'))]),ans,hint:'The relative minor root is a minor 3rd below the major root (the 6th degree).',explain:`${pname(M,'maj')} = ${pent(M,'maj').join(' ')}. ${pname(m,'min')} = ${pent(m,'min').join(' ')}: the same five notes. The relative minor is the 6th degree of the major.`}}
function rvName(){for(let k=0;k<100;k++){const{M,m}=relPair(),j=R(0,4),b=penBox(m,'min',j);if(!b)continue;const fr=b.notes.map(n=>n.f),box=[Math.min(...fr),Math.max(...fr)],ans=`${M} major pentatonic`;
  return{type:'choice',key:`rn${M}${j}`,box,text:`The ghost notes are box ${j+1} of ${pname(m,'min')}. Which major pentatonic scale uses exactly the same five notes?`,marks:b.notes.map(n=>mk(n,'ghost',n.name)),choices:mc(ans,[pname(m,'maj'),pname(spellScale(M)[3],'maj'),pname(spellScale(M)[4],'maj'),pname(spellScale(M)[1],'maj')]),ans,notes:seqN(b.notes),pm:'seq',hint:'Name the five notes, then find the major pentatonic that contains them: its root is a minor 3rd above the minor root.',explain:`The notes are ${pent(m,'min').join(' ')}. ${pname(M,'maj')} = ${pent(M,'maj').join(' ')}: the same notes, so the box shape is the same. The other choices each contain a note not in the box.`}}
  return rvName()}
function rvDegree(){for(let k=0;k<100;k++){const{M,m}=relPair(),j=R(0,4),b=penBox(m,'min',j);if(!b)continue;const fr=b.notes.map(n=>n.f),box=[Math.min(...fr),Math.max(...fr)],rs=b.notes.filter(n=>n.i===0);if(!rs.length)continue;const rt=pick(rs),x=pick(b.notes.filter(n=>n.i>0)),ans=['6','1','2','3','5'][x.i];
  return{type:'choice',key:`rd${m}${j}${x.s}${x.f}`,box,text:`The marked note is the root of ${pname(m,'min')}. The ? is one of its notes. What degree is the ? in the relative major pentatonic, ${pname(M,'maj')}?`,marks:[mk(rt,'root','R'),mk(x,'q','?')],choices:mc(ans,['1','2','3','5','6']),ans,notes:[midi(rt.s,rt.f),midi(x.s,x.f)],hint:'Name the ? first, then count its degree from the major root.',explain:`The ? is ${x.name}, degree ${PLB.min[x.i]} of ${pname(m,'min')}. In ${pname(M,'maj')} (${pent(M,'maj').join(' ')}) the same note is degree ${ans}.`}}
  return rvDegree()}
function rvRoots(){for(let k=0;k<100;k++){const{M,m}=relPair(),j=R(0,4),b=penBox(m,'min',j);if(!b)continue;const fr=b.notes.map(n=>n.f),box=[Math.min(...fr),Math.max(...fr)],toMaj=Math.random()<.5,r=toMaj?M:m,tg=b.notes.filter(n=>pcOf(n.name)===pcOf(r));if(!tg.length||tg.length>4)continue;
  return{type:'multi',key:`rr${m}${j}${toMaj}`,box,text:`The ghost notes are box ${j+1} of ${pname(m,'min')}, which is also box ${j+1} of ${pname(M,'maj')}. Click every ${r}, the root of the ${toMaj?'major':'minor'} pentatonic, inside the box.`,marks:b.notes.filter(n=>!tg.includes(n)).map(n=>mk(n,'ghost',n.name)),targets:tg.map(n=>tgt(n,'R')),notes:seqN(b.notes),pm:'seq',hint:`Same shape, different root: which empty spots are ${r}?`,explain:`The shape holds ${pent(m,'min').join(' ')}. The ${toMaj?'major':'minor'} root ${r} is at ${tg.map(n=>`${SL[n.s]} string, fret ${n.f}`).join('; ')}.`}}
  return rvRoots()}
function rvClick(){for(let k=0;k<200;k++){const{M,m}=relPair(),j=R(0,4),b=penBox(m,'min',j);if(!b)continue;const fr=b.notes.map(n=>n.f),box=[Math.min(...fr),Math.max(...fr)],rs=b.notes.filter(n=>n.i===0),s=R(0,5),c=b.notes.filter(n=>n.s===s&&pcOf(n.name)===pcOf(M));if(!rs.length||c.length!==1)continue;const rt=pick(rs);
  return{type:'click',key:`rk${m}${j}${s}`,box,text:`Box ${j+1} of ${pname(m,'min')} (shaded); one ${m} is marked. Click ${M}, the root of the relative major pentatonic, on the ${SN[s]} string, inside the box.`,marks:[mk(rt,'root','R')],target:tgt(c[0],M),notes:[midi(rt.s,rt.f),midi(c[0].s,c[0].f)],hint:`${M} is a minor 3rd above ${m}. Find it on that string within the shaded frets.`,explain:`${m} to ${M} is a minor 3rd (3 semitones). On the ${SN[s]} string, inside the box, ${M} is at fret ${c[0].f}.`}}
  return rvClick()}
function rvDiff(){for(let k=0;k<100;k++){const r=pick(PROOTS.maj.filter(x=>okP(x,'maj')&&okP(x,'min'))),mj=pent(r,'maj'),mn=pent(r,'min'),onlyMaj=Math.random()<.5,ans=(onlyMaj?diffList(mj,mn):diffList(mn,mj)).join(', '),opp=(onlyMaj?diffList(mn,mj):diffList(mj,mn)).join(', '),com=mj.filter(n=>mn.includes(n)).join(', ');if(!ans||!com)continue;
  const nat=scaleNotes(r,'minor'),other=(onlyMaj?diffList(mj,mn):diffList(mn,mj)).slice(0,2).concat(nat.filter(n=>!mj.includes(n)&&!mn.includes(n))).join(', ');
  return{type:'choice',noBoard:true,key:`rf${r}${onlyMaj}`,text:`Same root, ${r}. Which notes are in ${pname(r,onlyMaj?'maj':'min')} but not in ${pname(r,onlyMaj?'min':'maj')}?`,choices:mc(ans,[opp,com,other]),ans,hint:`Spell both scales (formulas 1 2 3 5 6 and 1 ♭3 4 5 ♭7) and compare.`,explain:`${pname(r,'maj')} = ${mj.join(' ')}; ${pname(r,'min')} = ${mn.join(' ')}. Only in the ${onlyMaj?'major':'minor'}: ${ans}. In both: ${com}.`}}
  return rvDiff()}
const rvBank=sbank('rb',[
 ['What does “relative” mean for A minor and C major pentatonic?','They contain exactly the same notes',['They have the same root','They have the same formula','They are a 5th apart'],'A C D E G in both; only the note you treat as home differs.'],
 ['Where is the relative minor of a major pentatonic root?','A minor 3rd below (the 6th degree)',['A minor 3rd above','A perfect 5th above','A whole step below'],'C major pent → A minor pent: A is 3 semitones below C.'],
 ['You play the A minor pentatonic box 1 (frets 5–8). The same shape is also…','C major pentatonic box 1',['A major pentatonic','E minor pentatonic','G major pentatonic'],'Same notes, same positions. Only the root changes: A (minor) or C (major).'],
 ['How do you get A major pentatonic (parallel) from the A minor pentatonic shape?','Slide the shape down 3 frets',['Slide the shape up 3 frets','Slide it up 5 frets','Use the same frets'],'A major pent has the notes of F♯ minor pent: F♯ is 3 semitones below A.'],
 ['Which pentatonic sounds brighter?','Major pentatonic',['Minor pentatonic','Neither, they are identical','Only in minor keys'],'The major 3rd and 6th give it a bright, open sound; the ♭3 and ♭7 give the minor a darker, bluesy one.'],
 ['Which note do major and minor pentatonic scales with the same root have in common?','The root and the 5th (only)',['The 3rd','The 6th','The 2nd and 4th'],'A major pent: A B C♯ E F♯. A minor pent: A C D E G. Shared: A and E.'],
 ['To switch from the minor to its relative major sound over the same notes, you…','change which note feels like home (the root)',['change the shape','retune','change fingerings'],'Land on and emphasise the relative major root, over a major chord.']]);

/* ---------- Lesson 91: pentatonics from modes ---------- */
const MODEKIND={ionian:'maj',lydian:'maj',mixolydian:'maj',dorian:'min',aeolian:'min',phrygian:'min'};
const MOD6=Object.keys(MODEKIND);
const subsetOf=(r,kind,modeNotes)=>{const p=pent(r,kind).map(pcOf),m=modeNotes.map(pcOf);return p.every(x=>m.includes(x))};
function pmFit(){for(let k=0;k<100;k++){const sc=pick(MOD6),r=pick(ROOTS.filter(x=>okSc(x,sc))),kind=MODEKIND[sc],ok2=kind==='maj'?'min':'maj';if(!okP(r,kind))continue;const box=rbox(r),ps=scPos(r,sc,[0,1,2,3,4,5],box[0],box[1]),rs=ps.filter(p=>p.i===0);if(!rs.length)continue;const rt=pick(rs),mn=scaleNotes(r,sc),ans=pname(r,kind);
  const cand=[];for(const x of ROOTS)for(const kk of ['maj','min'])if(okP(x,kk)&&!subsetOf(x,kk,mn))cand.push(pname(x,kk));
  return{type:'choice',key:`mf${r}${sc}`,box,text:`You play ${r} ${dname(sc)} (root marked). Which pentatonic scale on the same root fits it?`,marks:[mk(rt,'root','R'),...ps.filter(p=>p!==rt).map(p=>mk(p,'ghost',p.t))],choices:mc(ans,[pname(r,ok2),...shuf(cand.filter(c=>c!==pname(r,ok2)))]),ans,notes:seqN(ps),pm:'seq',hint:kind==='maj'?'Does this mode have a major 3rd or a minor 3rd?':'Does this mode have a minor 3rd or a major 3rd?',explain:`${spellTxt(r,sc)} has a ${kind==='maj'?'major':'minor'} 3rd, so the ${KN[kind]} pentatonic fits: ${pname(r,kind)} = ${pent(r,kind).join(' ')}, all of them inside the mode. The ${KN[ok2]} pentatonic on ${r} would add a note the mode does not have.`}}
  return pmFit()}
function pmAvoid(){for(let k=0;k<100;k++){const sc=pick(MOD6),r=pick(ROOTS.filter(x=>okSc(x,sc))),kind=MODEKIND[sc];if(!okP(r,kind))continue;const mn=scaleNotes(r,sc),pn=pent(r,kind),out=mn.filter(n=>!pn.map(pcOf).includes(pcOf(n)));if(out.length!==2)continue;const ans=out.join(' and '),pairs=[];for(let a=1;a<7;a++)for(let b=a+1;b<7;b++){const t=`${mn[a]} and ${mn[b]}`;if(t!==ans)pairs.push(t)}
  return{type:'choice',noBoard:true,key:`ma${r}${sc}`,text:`Which two notes of ${r} ${dname(sc)} are left out of ${pname(r,kind)}?`,choices:mc(ans,pairs),ans,hint:`Compare ${r} ${dname(sc)} (7 notes) with the ${KN[kind]} pentatonic (5 notes).`,explain:`${spellTxt(r,sc)}. ${pname(r,kind)} = ${pn.join(' ')}. Left out: ${ans} (${out.map(n=>dlabels(sc)[mn.indexOf(n)]).join(' and ')}), the notes that clash most with the chord tones.`}}
  return pmAvoid()}
function pmInside(){for(let k=0;k<100;k++){const K=pick(KEASY),d=R(1,6),kind=[1,4,5].includes(d)?'maj':'min',n=spellScale(K)[d-1];if(!okP(n,kind))continue;const ks=spellScale(K),cand=[];for(const x of ks)for(const kk of ['maj','min'])if(okP(x,kk)&&!subsetOf(x,kk,ks))cand.push(pname(x,kk));const ans=pname(n,kind),opp=pname(n,kind==='maj'?'min':'maj');if(!cand.includes(opp))continue;
  return{type:'choice',noBoard:true,key:`mi${K}${d}`,text:`Which pentatonic scale built on the ${ord(d)} degree of ${K} major (${n}) uses only notes of ${K} major?`,choices:mc(ans,[opp,...shuf(cand.filter(c=>c!==opp))]),ans,hint:'Degrees 1, 4 and 5 take the major pentatonic; degrees 2, 3 and 6 take the minor.',explain:`${K} major = ${ks.join(' ')}. The pentatonic on degree ${d} is ${ans} = ${pent(n,kind).join(' ')}: every note is in ${K} major. (1, 4, 5 → major; 2, 3, 6 → minor; the 7th degree has no pentatonic.)`}}
  return pmInside()}
function pmRemove(){for(let k=0;k<100;k++){const sc=pick(MOD6),r=pick(ROOTS.filter(x=>okSc(x,sc))),kind=MODEKIND[sc];if(!okP(r,kind))continue;const box=rbox(r),ps=scPos(r,sc,[0,1,2,3,4,5],box[0],box[1]),pn=pent(r,kind).map(pcOf),tg=ps.filter(p=>!pn.includes(pcOf(p.name))),rs=ps.filter(p=>p.i===0);if(!tg.length||tg.length>8||!rs.length)continue;const rt=pick(rs);
  return{type:'multi',key:`mr${r}${sc}`,box,text:`${r} ${dname(sc)} with the root marked. Ghost notes belong to ${pname(r,kind)}. Click every other note of the mode inside the shaded box: the ones the pentatonic leaves out.`,marks:ps.filter(p=>!tg.includes(p)&&p!==rt).map(p=>mk(p,'ghost',p.name)).concat([mk(rt,'root','R')]),targets:tg.map(p=>tgt(p,p.name)),notes:seqN(tg),pm:'seq',hint:`${pname(r,kind)} = ${pent(r,kind).join(' ')}. Which two notes of the mode are missing from it?`,explain:`${spellTxt(r,sc)}; ${pname(r,kind)} = ${pent(r,kind).join(' ')}. Left out: ${[...new Set(tg.map(p=>p.name))].join(' and ')}: ${tg.map(p=>`${SL[p.s]} string fret ${p.f}`).join(', ')}.`}}
  return pmRemove()}
function pmSkip(){for(let k=0;k<200;k++){const sc=pick(MOD6),r=pick(ROOTS.filter(x=>okSc(x,sc))),kind=MODEKIND[sc];if(!okP(r,kind))continue;const box=rbox(r),ps=scPos(r,sc,[0,1,2,3,4,5],box[0],box[1]),pn=pent(r,kind).map(pcOf),rs=ps.filter(p=>p.i===0),s=R(0,5),c=ps.filter(p=>p.s===s&&!pn.includes(pcOf(p.name)));if(!rs.length||c.length!==1)continue;const rt=pick(rs);
  return{type:'click',key:`mk${r}${sc}${s}`,box,text:`${r} ${dname(sc)} (root marked). On the ${SN[s]} string, inside the shaded box, click the one note that ${pname(r,kind)} does not use.`,marks:[mk(rt,'root','R')],target:tgt(c[0],c[0].name),notes:[midi(rt.s,rt.f),midi(c[0].s,c[0].f)],hint:`${pname(r,kind)} = ${pent(r,kind).join(' ')}. Which of the mode’s notes is not in that list?`,explain:`${spellTxt(r,sc)}; ${pname(r,kind)} = ${pent(r,kind).join(' ')}. On the ${SN[s]} string the omitted note is ${c[0].name}, at fret ${c[0].f}.`}}
  return pmSkip()}
function pmClickPent(){for(let k=0;k<200;k++){const K=pick(KEASY),d=R(1,6),kind=[1,4,5].includes(d)?'maj':'min',n=spellScale(K)[d-1];if(!okP(n,kind))continue;const a=R(0,2),strs=[a,a+1,a+2,a+3],box=rbox(K),ps=scPos(K,'major',strs,box[0],box[1]),pn=pent(n,kind).map(pcOf),tg=ps.filter(p=>pn.includes(pcOf(p.name))),gh=ps.filter(p=>!pn.includes(pcOf(p.name)));if(tg.length<4||tg.length>8)continue;
  return{type:'multi',key:`mp${K}${d}${a}`,box,text:`Inside the shaded ${K} major box, click every note of ${pname(n,kind)} on the ${strTxt(strs)} strings. (Ghost notes are the two ${K} major notes it leaves out.)`,marks:gh.map(p=>mk(p,'ghost',p.name)),targets:tg.map(p=>tgt(p,p.name)),notes:seqN(tg),pm:'seq',hint:`${pname(n,kind)} = ${pent(n,kind).join(' ')}. It uses 5 of the 7 notes of ${K} major.`,explain:`${pname(n,kind)} = ${pent(n,kind).join(' ')}, the pentatonic on degree ${d} of ${K} major. In the box: ${tg.map(p=>`${p.name} (${SL[p.s]} string, fret ${p.f})`).join(', ')}.`}}
  return pmClickPent()}
const pmBank=sbank('mb',[
 ['A pentatonic scale is a mode with which notes removed?','The notes that clash most with the chord tones (avoid notes)',['The root and 5th','All the flats','The 3rd and 7th'],'Pentatonic = the mode minus its two most difficult notes, leaving a safe 5-note subset.'],
 ['Which pentatonics fit Ionian, Lydian and Mixolydian?','The major pentatonic',['The minor pentatonic','Neither','The blues scale'],'All three have a major 3rd and no clashes with a major pentatonic built on the same root.'],
 ['Which pentatonics fit Dorian, Aeolian and Phrygian?','The minor pentatonic',['The major pentatonic','Neither','The whole tone scale'],'All three have a minor 3rd. The minor pentatonic skips the 2nd (or ♭2) and the 6th (or ♭6).'],
 ['On which degrees of a major scale does a major pentatonic fit inside the scale?','1, 4 and 5',['2, 3 and 6','1, 3 and 5','4, 5 and 7'],'C, F and G major pentatonic only use notes of C major.'],
 ['On which degrees of a major scale does a minor pentatonic fit inside the scale?','2, 3 and 6',['1, 4 and 5','1, 3 and 5','5, 6 and 7'],'D, E and A minor pentatonic only use notes of C major.'],
 ['Does the major scale have a pentatonic on its 7th degree?','No: neither the major nor the minor fits',['Yes, a major one','Yes, a minor one','Yes, both'],'B major pent has F♯ and B minor pent has F♯, which are not in C major.'],
 ['Which note does the major pentatonic skip compared with Mixolydian (besides the 4th)?','The ♭7',['The 3rd','The 6th','The 2nd'],'Mixolydian 1 2 3 4 5 6 ♭7 loses the 4th and ♭7 to give 1 2 3 5 6.']]);

const LS={
 minp:{h:'minor-pentatonic',n:'Lesson 88',title:'Minor pentatonic scale',sub:'1 ♭3 4 5 ♭7: five notes and five boxes.',
  ex:[['Spell it',[MIN.spell,MIN.bank]],['Fill a box',[MIN.fill1,MIN.fillN]],['Roots & degrees',[MIN.roots,MIN.click,MIN.deg]]],
  test:[...rep(MIN.spell,2),...rep(MIN.bank,2),...rep(MIN.fill1,2),...rep(MIN.fillN,3),...rep(MIN.roots,2),...rep(MIN.click,2),...rep(MIN.deg,2)]},
 majp:{h:'major-pentatonic',n:'Lesson 89',title:'Major pentatonic scale',sub:'1 2 3 5 6: the major scale without its 4th and 7th.',
  ex:[['Spell it',[MAJ5.spell,MAJ5.bank]],['Fill a box',[MAJ5.fill1,MAJ5.fillN]],['Roots & degrees',[MAJ5.roots,MAJ5.click,MAJ5.deg]]],
  test:[...rep(MAJ5.spell,2),...rep(MAJ5.bank,2),...rep(MAJ5.fill1,2),...rep(MAJ5.fillN,3),...rep(MAJ5.roots,2),...rep(MAJ5.click,2),...rep(MAJ5.deg,2)]},
 vs:{h:'major-vs-minor-pentatonic',n:'Lesson 90',title:'Major vs minor pentatonic',sub:'Relative pairs share notes and shapes; only the root changes.',
  ex:[['Relative pairs',[rvPair,rvBank]],['Same shape',[rvName,rvDegree]],['Roots & notes',[rvRoots,rvClick,rvDiff]]],
  test:[...rep(rvPair,3),rvBank,...rep(rvName,3),...rep(rvDegree,2),...rep(rvRoots,2),...rep(rvClick,2),...rep(rvDiff,2)]},
 modes:{h:'pentatonics-from-modes',n:'Lesson 91',title:'Pentatonics from modes',sub:'A pentatonic is a mode minus its avoid notes; which pentatonics sit inside a major scale.',
  ex:[['Which pentatonic?',[pmFit,pmAvoid]],['Inside a key',[pmInside,pmBank]],['On the neck',[pmRemove,pmSkip,pmClickPent]]],
  test:[...rep(pmFit,3),...rep(pmAvoid,2),...rep(pmInside,2),pmBank,...rep(pmRemove,2),...rep(pmSkip,2),...rep(pmClickPent,3)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 88–91 mixed.',
  ex:[['Lessons 88–89',[MIN.spell,MIN.fillN,MIN.roots,MIN.click,MIN.deg,MIN.bank,MAJ5.spell,MAJ5.fillN,MAJ5.roots,MAJ5.click,MAJ5.deg,MAJ5.bank]],['Lessons 90–91',[rvPair,rvName,rvDegree,rvRoots,rvClick,rvDiff,rvBank,pmFit,pmAvoid,pmInside,pmBank,pmRemove,pmSkip,pmClickPent]]],
  test:[MIN.spell,MIN.fillN,MIN.click,MIN.deg,MIN.roots,MAJ5.spell,MAJ5.fillN,MAJ5.click,MAJ5.deg,MAJ5.roots,rvPair,rvName,rvDegree,rvClick,rvDiff,pmFit,pmAvoid,pmInside,pmRemove,pmClickPent]}};
const ORDER=['minp','majp','vs','modes','final'],STORE='gi-best-p22';

const boxRows=(r,kind)=>[0,1,2,3,4].map(j=>{const b=penBox(r,kind,j),n=b.notes[0];return`<tr><td>${j+1}</td><td>${n.name} (${wordT(n.t)})</td><td>${b.notes.filter(x=>x.s===0).map(x=>x.f).join(', ')}</td><td>${Math.min(...b.notes.map(x=>x.f))}–${Math.max(...b.notes.map(x=>x.f))}</td></tr>`}).join('');
const NOTES={
 minp:`<div class="cols"><div><h3>${pname('A','min')}</h3><p><b>${pent('A','min').join(' ')}</b> = 1 ♭3 4 5 ♭7</p><table class="stack"><thead><tr><th>Box</th><th>Starts on (low E)</th><th>Low E frets</th><th>Fret range</th></tr></thead><tbody>${boxRows('A','min')}</tbody></table><p class="small">Numbering: box 1 starts on the root on the low E string, box 2 on the ♭3, box 3 on the 4th, box 4 on the 5th and box 5 on the ♭7. Each box has two notes per string. Shown for A; move every box by the same number of frets for another key.</p></div>
  <div><h3>Key ideas</h3><ul><li>Natural minor without its 2nd and ♭6: five notes, no half steps.</li><li>Five boxes connect end to end up the neck, two notes per string.</li><li>Box 1 (root on the low E string, frets 5–8 for A) is the one to learn first.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play box 1 in A, up and down, finding the three A roots.</li><li>Slide the same shape to fret 7 for B, fret 3 for G.</li><li>Learn box 2 and join it to box 1.</li></ul></div></div>`,
 majp:`<div class="cols"><div><h3>${pname('C','maj')}</h3><p><b>${pent('C','maj').join(' ')}</b> = 1 2 3 5 6</p><table class="stack"><thead><tr><th>Box</th><th>Starts on (low E)</th><th>Low E frets</th><th>Fret range</th></tr></thead><tbody>${boxRows('C','maj')}</tbody></table><p class="small">Assumption: the five major pentatonic boxes are the same shapes as the minor pentatonic boxes of the relative minor, and keep the same numbers (box 1 of C major = box 1 of A minor, frets 5–8). The box that starts on the root on the low E string is box 2.</p></div>
  <div><h3>Key ideas</h3><ul><li>Major scale without its 4th and 7th: 1 2 3 5 6.</li><li>Bright and open; the major 3rd is the characteristic note.</li><li>Same five shapes as the relative minor pentatonic, just a new root.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C major pentatonic from the root on the low E string (fret 8).</li><li>Play G major pentatonic with the root on the low E string (fret 3).</li><li>Find every root in the box and play around it.</li></ul></div></div>`,
 vs:`<div class="cols"><div><h3>Relative pairs</h3><table class="stack"><thead><tr><th>Major pent</th><th>Minor pent</th><th>Notes</th></tr></thead><tbody>${['C','G','D','F','B♭','E♭'].map(M=>`<tr><td>${M}</td><td>${relMinor(M)}</td><td>${pent(M,'maj').join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>The relative minor root is the 6th degree of the major: a minor 3rd below.</li><li>Same notes, same shapes, same frets. Only the root you stress changes the sound.</li><li>Parallel scales (same root) differ: A major pent has B C♯ F♯; A minor pent has C D G.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A minor pentatonic box 1 (frets 5–8) over an Am chord, then over a C chord.</li><li>Find every C inside the box and finish phrases on it.</li><li>Slide the shape 3 frets down for A major pentatonic.</li></ul></div></div>`,
 modes:`<div class="cols"><div><h3>Pentatonic = mode minus its avoid notes</h3><table class="stack"><thead><tr><th>Mode</th><th>Pentatonic</th><th>Left out</th></tr></thead><tbody>${MOD6.map(m=>{const r='C',kind=MODEKIND[m],mn=scaleNotes(r,m),pn=pent(r,kind),out=mn.filter(n=>!pn.map(pcOf).includes(pcOf(n)));return`<tr><td>${r} ${dname(m)}</td><td>${pname(r,kind)}</td><td>${out.join(' ')}</td></tr>`}).join('')}</tbody></table>
  <h3 style="margin-top:22px">Inside C major</h3><table class="stack"><thead><tr><th>Degree</th><th>Pentatonic</th></tr></thead><tbody>${[1,2,3,4,5,6].map(d=>{const n=spellScale('C')[d-1],kind=[1,4,5].includes(d)?'maj':'min';return`<tr><td>${d}</td><td>${pname(n,kind)}</td></tr>`}).join('')}</tbody></table><p class="small">Assumption: the pentatonic is built on the mode’s root. Phrygian takes the minor pentatonic with some care: its ♭2 is simply left out. Locrian has no standard pentatonic here.</p></div>
  <div><h3>Key ideas</h3><ul><li>Major pentatonic fits Ionian, Lydian and Mixolydian; minor pentatonic fits Dorian, Aeolian and Phrygian.</li><li>Inside a major scale: degrees 1, 4, 5 give major pentatonics; degrees 2, 3, 6 give minor ones.</li><li>Pentatonics are safe: they drop the notes that clash with chord tones.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Over Dm7, play D minor pentatonic, then add the B for D Dorian.</li><li>Over Fmaj7, play F major pentatonic, then add B for F Lydian.</li><li>Play every pentatonic that lives inside C major, in one position.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 88–91: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>The following lessons build on these pentatonic scales.</p></div></div>`};
