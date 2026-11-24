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

/* ===== Part 21: lessons 85–87 ===== */
const CH={dorian:[6,'♮6','natural 6th'],phrygian:[2,'♭2','flat 2nd'],lydian:[4,'♯4','sharp 4th'],mixolydian:[7,'♭7','flat 7th'],aeolian:[6,'♭6','flat 6th'],locrian:[5,'♭5','flat 5th']};
const K85=KEASY.filter(k=>k!=='F♯');
const PRG=[[2,5,1],[1,6,2,5],[3,6,2,5],[1,4,5,1],[1,6,4,5],[6,2,5,1],[1,4,2,5],[1,2,5,1]];
function mkProg(K){const t=pick(PRG),d=diatonic(K,'major',4);return{t,chords:t.map(x=>d[x-1]),txt:t.map(x=>d[x-1].sym).join(' – '),rom:t.map(x=>d[x-1].roman).join(' – ')}}
const uniq=(a,f)=>{const s=new Set();return a.filter(x=>{const k=f(x);if(s.has(k))return false;s.add(k);return true})};

/* ---------- Lesson 85: diatonic progressions ---------- */
function dpKey(){const K=pick(K85),pr=mkProg(K),need=pr.chords.flatMap(c=>c.notes.map(pcOf)),fits=k=>{const p=spellScale(k).map(pcOf);return need.every(x=>p.includes(x))},wrong=KEASY.filter(k=>k!==K&&!fits(k)),ans=`${K} major`;
  return{type:'choice',noBoard:true,key:`dk${K}${pr.t.join('')}`,text:`All the chords of this progression are diatonic to one key: ${pr.txt}. Which major scale covers every chord?`,choices:mc(ans,wrong.filter(k=>Math.abs(sigOf(k)-sigOf(K))<=3).concat(wrong).map(k=>`${k} major`)),ans,hint:'Look for a chord that fixes the key: a dominant 7th (V7) or a maj7 on the 4th degree.',explain:`${pr.txt} = ${pr.rom} in ${K} major (${spellScale(K).join(' ')}). One parent scale covers every chord; only the mode changes.`}}
function dpMode(){const K=pick(K85),pr=mkProg(K),c=pick(pr.chords),sc=MODES[c.deg-1],ans=`${c.root} ${dname(sc)}`;
  return{type:'choice',noBoard:true,key:`dm${K}${c.deg}${pr.t.join('')}`,text:`Progression in ${K} major: ${pr.txt}. Which mode do you play over ${c.sym}?`,choices:mc(ans,['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian'].map(x=>`${c.root} ${x}`)),ans,hint:`${c.sym} is built on a degree of ${K} major. The mode starts on that degree.`,explain:`${c.sym} is the ${c.roman} chord: degree ${c.deg} of ${K} major, so you play ${ans}: ${scaleNotes(c.root,sc).join(' ')} (the notes of ${K} major).`}}
function dpTarget(){for(let k=0;k<100;k++){const K=pick(K85),pr=mkProg(K),c=pick(pr.chords),a=R(0,2),strs=[a,a+1,a+2,a+3],box=rbox(K),ps=scPos(K,'major',strs,box[0],box[1]),cp=c.notes.map(pcOf),tg=ps.filter(p=>cp.includes(pcOf(p.name)));if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`dt${K}${c.deg}${a}`,box,text:`Progression in ${K} major: ${pr.txt}. One pattern covers it: the shaded ${K} major box. Over ${c.sym}, click every chord tone inside the box on the ${strTxt(strs)} strings. (Ghost notes are the other notes of the key.)`,marks:ps.filter(p=>!tg.includes(p)).map(p=>mk(p,'ghost',p.name)),targets:tg.map(p=>tgt(p,p.name)),notes:seqN(tg),pm:'seq',hint:`Spell ${c.sym} first. Its notes are every other note of the scale from ${c.root}.`,explain:`${c.sym} = ${c.notes.join(' ')} (${c.roman} in ${K} major). In the box: ${tg.map(p=>`${p.name} (${SL[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}
  return dpTarget()}
function dpRoot(){for(let k=0;k<150;k++){const K=pick(K85),pr=mkProg(K),c=pick(pr.chords),s=R(0,5),box=rbox(K),cand=scPos(K,'major',[s],box[0],box[1]).filter(p=>p.name===c.root);if(cand.length!==1)continue;const sc=MODES[c.deg-1];
  return{type:'click',key:`dr${K}${c.deg}${s}`,box,text:`Progression in ${K} major: ${pr.txt}. Over ${c.sym} you play ${c.root} ${dname(sc)}. Click its root on the ${SN[s]} string, inside the shaded ${K} major box.`,marks:[],target:tgt(cand[0],'R'),notes:[midi(cand[0].s,cand[0].f)],hint:'The root of the mode is the root of the chord.',explain:`${c.sym} is the ${c.roman} chord, so the mode ${c.root} ${dname(sc)} uses the same box as ${K} major, with ${c.root} as home. On the ${SN[s]} string it is at ${fretTxt(cand[0].f)}.`}}
  return dpRoot()}
function dpChordFor(){for(let k=0;k<100;k++){const K=pick(K85),pr=mkProg(K),c=pick(pr.chords),box=rbox(K),ps=scPos(K,'major',[0,1,2,3,4,5],box[0],box[1]),rs=ps.filter(p=>p.name===c.root);if(!rs.length)continue;const rt=pick(rs),syms=uniq(pr.chords,x=>x.sym).map(x=>x.sym);if(syms.length<3)continue;
  return{type:'choice',key:`dc${K}${c.deg}${pr.t.join('')}`,box,text:`Progression in ${K} major: ${pr.txt}. The shaded box is ${K} major and the marked note is the root of the mode you would play over one of these chords. Which chord?`,marks:[mk(rt,'root','R'),...ps.filter(p=>p!==rt).map(p=>mk(p,'ghost',p.name))],choices:mc(c.sym,syms.concat(diatonic(K,'major',4).map(x=>x.sym))),ans:c.sym,notes:seqN(ps),pm:'seq',hint:'Name the marked note, then find the chord of the progression that is built on it.',explain:`The marked note is ${c.root}. In ${K} major the chord built on ${c.root} is ${c.sym} (${c.roman}), so the mode is ${c.root} ${dname(MODES[c.deg-1])}.`}}
  return dpChordFor()}
const dpBank=sbank('db',[
 ['How many different parent scales do you need to solo over Dm7 – G7 – Cmaj7?','One: C major',['Three: one per chord','Two','None: use chromatic notes'],'All three chords are diatonic to C major. Only the note you treat as home changes: D Dorian, G Mixolydian, C Ionian.'],
 ['In a diatonic progression, what changes from chord to chord?','The mode: which scale note is home',['The key signature','The fretboard pattern','The tuning'],'The pattern and the notes are the same. You re-centre on each chord’s root.'],
 ['Which mode do you play over the IVmaj7 chord of a major key?','Lydian',['Ionian','Mixolydian','Dorian'],'The mode starting on degree 4 is Lydian. Its ♯4 is the key’s 7th degree seen from the IV root.'],
 ['Which mode do you play over the V7 chord of a major key?','Mixolydian',['Ionian','Lydian','Aeolian'],'The mode starting on degree 5 is Mixolydian, matching the chord’s ♭7.'],
 ['Which mode do you play over the Imaj7 chord of a major key?','Ionian',['Lydian','Dorian','Mixolydian'],'The mode starting on degree 1 is Ionian: the key’s own major scale.'],
 ['Why can one box be used over every chord of a diatonic progression?','Every chord’s notes come from the same key',['All chords share the same root','The box contains every note of the chromatic scale','Modes do not matter'],'The same seven notes serve every chord. You change your target notes, not your box.'],
 ['What should guide your note choice right after a chord change?','Chord tones of the new chord',['The old chord’s root','Only the 2nd degree','Any open string'],'Landing on a chord tone of the new chord makes the change audible in your line.']]);

/* ---------- Lesson 86: non-diatonic progressions ---------- */
const K86=KEASY.filter(k=>k!=='F♯');
const NDT=[
 {id:'V7/ii',deg:6,q:'dom7',sc:'mixolydian',tg:2},{id:'V7/iii',deg:7,q:'dom7',sc:'mixolydian',tg:3},{id:'V7/vi',deg:3,q:'dom7',sc:'mixolydian',tg:6},{id:'V7/V',deg:2,q:'dom7',sc:'mixolydian',tg:5},{id:'V7/IV',deg:1,q:'dom7',sc:'mixolydian',tg:4},
 {id:'♭VII',deg:0,q:'maj',sc:'lydian'},{id:'♭VII',deg:0,q:'maj',sc:'mixolydian'}];
const keyPcs=K=>spellScale(K).map(pcOf);
function ndPick(want){for(let k=0;k<200;k++){const K=pick(K86),t=pick(NDT),r=t.deg?spellScale(K)[t.deg-1]:spellF(K,'b7')[0];if(want&&!want(t))continue;if(!okSc(r,t.sc)||!okSc(r,'mixolydian')||!okSc(r,'lydian'))continue;
  const kp=keyPcs(K),cn=chordNotes(r,t.q),out=cn.filter(n=>!kp.includes(pcOf(n))),sn=scaleNotes(r,t.sc),sout=sn.filter(n=>!kp.includes(pcOf(n)));if(cn.some(n=>/[𝄪𝄫]/.test(n)))continue;
  const tgt0=t.tg?diatonic(K,'major',3)[t.tg-1].sym:null;
  return{K,t,r,sym:chordSym(r,t.q),out,sout,tsym:tgt0,why:t.tg?`the secondary dominant ${t.id}: it is the dominant 7th of ${tgt0} (a perfect 5th above ${diatonic(K,'major',3)[t.tg-1].root})`:`the ♭VII chord, borrowed from the parallel minor (${K} Mixolydian / ${K} Aeolian)`}}
  return ndPick(want)}
const NDTEM=[[['d',1],['n','V7/ii'],['d',2],['d',5]],[['d',1],['n','V7/V'],['d',5],['d',1]],[['d',1],['n','V7/vi'],['d',6],['d',4]],[['d',1],['n','♭VII'],['d',4],['d',1]],[['d',1],['n','V7/IV'],['d',4],['d',5]],[['d',6],['d',4],['n','V7/V'],['d',5]],[['d',2],['n','V7/iii'],['d',3],['d',6]]];
function ndWhichChord(){for(let k=0;k<200;k++){const K=pick(K86),tm=pick(NDTEM),tri=diatonic(K,'major',3),syms=[];let odd=null;
  for(const [kind,v] of tm){if(kind==='d')syms.push(tri[v-1].sym);else{const t=NDT.find(x=>x.id===v),r=t.deg?spellScale(K)[t.deg-1]:spellF(K,'b7')[0];if(!okSc(r,t.sc))odd='bad';odd=odd||{sym:chordSym(r,t.q),t,r};syms.push(chordSym(r,t.q))}}
  if(!odd||odd==='bad')continue;const kp=keyPcs(K),out=chordNotes(odd.r,odd.t.q).filter(n=>!kp.includes(pcOf(n)));const dist=uniq(syms,x=>x);if(dist.length<3||out.length<1)continue;
  return{type:'choice',noBoard:true,key:`wc${K}${odd.sym}${syms.join('')}`,text:`Progression in ${K} major: ${syms.join(' – ')}. Which chord is NOT diatonic to ${K} major?`,choices:mc(odd.sym,dist),ans:odd.sym,hint:`Spell each chord and compare its notes with ${K} major: ${spellScale(K).join(' ')}.`,explain:`${odd.sym} = ${chordNotes(odd.r,odd.t.q).join(' ')}. ${out.join(' and ')} ${out.length>1?'are':'is'} not in ${K} major (${spellScale(K).join(' ')}), so ${odd.sym} is outside the key. The other chords are all diatonic.`}}
  return ndWhichChord()}
function ndScale(){const x=ndPick(),m=['Mixolydian','Dorian','Lydian','Ionian','Aeolian'];
  if(x.t.q==='dom7'){const ans=`${x.r} Mixolydian`;
   return{type:'choice',noBoard:true,key:`ns${x.K}${x.t.id}`,text:`In ${x.K} major the chord ${x.sym} appears. It is the ${x.t.id}, pointing to ${x.tsym}. Which scale is the standard choice over it?`,choices:mc(ans,m.map(y=>`${x.r} ${y}`)),ans,hint:'It is a dominant 7th chord. Which mode matches a dominant 7th?',explain:`${x.sym} = ${chordNotes(x.r,'dom7').join(' ')}. A dominant 7th chord takes Mixolydian on its own root: ${scaleNotes(x.r,'mixolydian').join(' ')}. ${x.sout.join(', ')} ${x.sout.length>1?'are':'is'} outside ${x.K} major, so the scale changes for this chord.`}}
  const lyd=x.t.sc==='lydian',ans=`${x.r} ${lyd?'Lydian':'Mixolydian'}`,dd=['Dorian','Ionian','Aeolian',lyd?'Mixolydian':'Lydian'].map(y=>`${x.r} ${y}`);
  return{type:'choice',noBoard:true,key:`nb${x.K}${x.t.sc}`,text:lyd?`In ${x.K} major, ${x.sym} is the ♭VII chord. You want to stay as close to ${x.K} major as possible: only one note of the scale should change. Which scale?`:`In ${x.K} major, ${x.sym} is the ♭VII chord, borrowed from ${x.K} minor. You want the dark borrowed colour: the scale should have exactly the notes of ${x.K} natural minor. Which scale?`,choices:mc(ans,[ans,...dd]),ans,hint:lyd?`Which mode on ${x.r} has all the notes of ${x.K} major except one?`:`Spell ${x.K} natural minor, then find the mode of ${x.r} that uses those notes.`,explain:lyd?`${spellTxt(x.r,'lydian')}: it is ${x.K} major with ${x.r} in place of ${spellScale(x.K)[6]}, the smallest change. ${x.r} Mixolydian also works but brings in extra notes from the minor side.`:`${spellTxt(x.r,'mixolydian')}: it has the same notes as ${x.K} Aeolian (natural minor), the dark colour of the borrowed chord. ${x.r} Lydian also works if you want to stay in ${x.K} major.`}}
function ndTarget(){const x=ndPick();return ctTask(x.r,x.t.q,x.t.sc,'nt')}
function ndChange(){for(let k=0;k<100;k++){const x=ndPick(),box=rbox(x.r),ps=scPos(x.r,x.t.sc,[0,1,2,3,4,5],box[0],box[1]),kp=keyPcs(x.K),tg=ps.filter(p=>!kp.includes(pcOf(p.name)));if(!tg.length||tg.length>8)continue;
  return{type:'multi',key:`nc${x.K}${x.t.id}${x.t.sc}`,box,text:`Key of ${x.K} major, chord ${x.sym} (${x.t.id}). You play ${x.r} ${dname(x.t.sc)}. Click every note in the shaded box that is NOT in ${x.K} major. (Ghost notes are in the key.)`,marks:ps.filter(p=>!tg.includes(p)).map(p=>mk(p,'ghost',p.name)),targets:tg.map(p=>tgt(p,p.name)),notes:seqN(ps),pm:'seq',hint:`${x.K} major = ${spellScale(x.K).join(' ')}. Which note names of ${x.r} ${dname(x.t.sc)} are missing from it?`,explain:`${spellTxt(x.r,x.t.sc)}. Outside ${x.K} major: ${x.sout.join(', ')}. In the box: ${tg.map(p=>`${p.name} (${SL[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}
  return ndChange()}
function ndClickOut(){for(let k=0;k<300;k++){const x=ndPick();if(x.out.length!==1||pcOf(x.out[0])===pcOf(x.r))continue;const box=rbox(x.r),ps=scPos(x.r,x.t.sc,[0,1,2,3,4,5],box[0],box[1]),rs=ps.filter(p=>p.i===0),s=R(0,5),c=ps.filter(p=>p.s===s&&pcOf(p.name)===pcOf(x.out[0]));if(c.length!==1||!rs.length)continue;const rt=pick(rs);
  return{type:'click',key:`no${x.K}${x.t.id}${x.t.sc}${s}`,box,text:`Key of ${x.K} major. Over ${x.sym} (${x.t.id}) the root is marked. Click the one chord tone that is not in ${x.K} major, on the ${SN[s]} string, inside the shaded box.`,marks:[mk(rt,'root','R')],target:tgt(c[0],x.out[0]),notes:[midi(rt.s,rt.f),midi(c[0].s,c[0].f)],hint:`Spell ${x.sym} and check each note against ${x.K} major: ${spellScale(x.K).join(' ')}.`,explain:`${x.sym} = ${chordNotes(x.r,x.t.q).join(' ')}. Only ${x.out[0]} is outside ${x.K} major. On the ${SN[s]} string, inside the box, it is at ${(x=>x==='open'?'the open string':x)(fretTxt(c[0].f))}.`}}
  return ndClickOut()}
const ndBank=sbank('nk',[
 ['Why must you change scale when a non-diatonic chord appears?','The chord contains a note outside the key’s scale',['Every chord needs a new key signature','The tempo changes','The root must move down a 5th'],'A chord with a note outside the key would clash with that note of the parent scale.'],
 ['In C major, which chord is V7/ii?','A7',['G7','D7','E7'],'It is the dominant 7th a perfect 5th above Dm: A7.'],
 ['What is the standard scale over a secondary dominant such as A7 in C major?','A Mixolydian',['A Dorian','A Aeolian','C Ionian'],'Treat it as a dominant 7th: Mixolydian on its own root. The C♯ and F♯ are the new notes.'],
 ['Over a borrowed ♭VII major chord, which scale changes only one note of the major key?','Lydian on the chord root (B♭ Lydian in C)',['Mixolydian on the chord root','Dorian on the chord root','Locrian on the chord root'],'B♭ Lydian = B♭ C D E F G A: C major with B♭ in place of B.'],
 ['A7 resolving to Dm can also use the 5th mode of D harmonic minor. What is it called?','Phrygian dominant',['Lydian dominant','Dorian ♭2','Locrian'],'A Phrygian dominant = A B♭ C♯ D E F G: Mixolydian with ♭2 and ♭6, a darker colour that leans into D minor.'],
 ['After the non-diatonic chord has passed, what do you do?','Return to the scale of the key',['Stay in the last scale','Stop playing','Raise the tempo'],'The non-diatonic scale only lasts as long as the chord.'],
 ['In C major, the B♭ chord is…','♭VII, borrowed from C minor / C Mixolydian',['VII','V7/VI','♯IV'],'B♭ is a whole step below the root, a ♭VII, found in C Mixolydian and C Aeolian but not in C major.']]);

/* ---------- Lesson 87: modal vamps ---------- */
const VAMP={dorian:{rom:'i – IV',ch:[[1,1],[4,0]]},mixolydian:{rom:'I – ♭VII',ch:[[1,0],[7,0]]},lydian:{rom:'I – II',ch:[[1,0],[2,0]]},phrygian:{rom:'i – ♭II',ch:[[1,1],[2,0]]},aeolian:{rom:'i – ♭VI – ♭VII',ch:[[1,1],[6,0],[7,0]]}};
const VM=Object.keys(VAMP);
const vampChords=(r,sc)=>{const nn=scaleNotes(r,sc);return VAMP[sc].ch.map(([d,m])=>({root:nn[d-1],min:!!m,sym:nn[d-1]+(m?'m':''),notes:chordNotes(nn[d-1],m?'min':'maj'),deg:d}))};
const vampTxt=(r,sc)=>vampChords(r,sc).map(c=>c.sym).join(' – ');
const vRoot=sc=>pick(ROOTS.filter(x=>VM.every(m=>okSc(x,m))));
function mpName(){const sc=pick(VM),r=vRoot(),ans=`${r} ${dname(sc)}`,ch=vampChords(r,sc);
  return{type:'choice',noBoard:true,key:`vn${r}${sc}`,text:`Which mode does the vamp ${vampTxt(r,sc)} (${VAMP[sc].rom}) establish, with ${ch[0].sym} as home?`,choices:mc(ans,VM.map(m=>`${r} ${dname(m)}`)),ans,hint:'Compare the second chord with the chord built on the same degree of the major scale.',explain:`${VAMP[sc].rom} on ${r}: ${vampTxt(r,sc)}. The chords come from ${spellTxt(r,sc)}, so the home chord ${ch[0].sym} sounds like ${ans}.`}}
function mpChords(){const sc=pick(VM),r=vRoot(),ans=vampTxt(r,sc);
  return{type:'choice',noBoard:true,key:`vc${r}${sc}`,text:`Which chord vamp establishes ${r} ${dname(sc)}?`,choices:mc(ans,VM.filter(m=>m!==sc).map(m=>vampTxt(r,m))),ans,hint:`Think of the numerals: ${dname(sc)} uses ${VAMP[sc].rom}.`,explain:`${r} ${dname(sc)} vamp: ${VAMP[sc].rom} = ${ans}. Each wrong choice is a vamp for a different mode on ${r}.`}}
function chordWith(r,sc,note){const c=vampChords(r,sc).find(c=>c.notes.some(n=>pcOf(n)===pcOf(note)));return c?c.sym:null}
function mpChar(){const sc=pick(VM),r=vRoot(),c=CH[sc],cn=scaleNotes(r,sc)[c[0]-1],who=chordWith(r,sc,cn);
  const q=degAll(r,sc,c[0]-1,'vh',p=>`Vamp ${vampTxt(r,sc)} (${r} ${dname(sc)}). The root is marked. Click every ${c[1]} (${p.name}), the note that gives the vamp its mode, inside the shaded box.`);
  q.explain+=` The vamp supplies it through the ${who} chord.`;q.key='vh'+r+sc;return q}
function mpTarget(){for(let k=0;k<150;k++){const sc=pick(VM),r=vRoot(),chs=vampChords(r,sc),c=pick(chs),a=R(0,2),strs=[a,a+1,a+2,a+3],box=rbox(r),ps=scPos(r,sc,strs,box[0],box[1]),cp=c.notes.map(pcOf),tg=ps.filter(p=>cp.includes(pcOf(p.name)));if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`vt${r}${sc}${c.deg}${a}`,box,text:`Vamp ${vampTxt(r,sc)} in ${r} ${dname(sc)}. Over ${c.sym}, click every chord tone (${c.notes.join(' ')}) inside the shaded box on the ${strTxt(strs)} strings. (Ghost notes are the other mode notes.)`,marks:ps.filter(p=>!tg.includes(p)).map(p=>mk(p,'ghost',p.name)),targets:tg.map(p=>tgt(p,p.name)),notes:seqN(tg),pm:'seq',hint:`${c.sym} is a triad: root, ${c.min?'minor':'major'} 3rd and 5th. Which scale notes are they?`,explain:`${c.sym} = ${c.notes.join(' ')}, all inside ${spellTxt(r,sc)}. In the box: ${tg.map(p=>`${p.name} (${SL[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}
  return mpTarget()}
function mpClick(){for(let k=0;k<200;k++){const sc=pick(VM),r=vRoot(),chs=vampChords(r,sc),c=pick(chs.slice(1)),box=rbox(r),ps=scPos(r,sc,[0,1,2,3,4,5],box[0],box[1]),rs=ps.filter(p=>p.i===0),s=R(0,5),cand=ps.filter(p=>p.s===s&&p.i===c.deg-1);if(!rs.length||cand.length!==1)continue;const rt=pick(rs);
  return{type:'click',key:`vk${r}${sc}${c.deg}${s}`,box,text:`Vamp ${vampTxt(r,sc)} in ${r} ${dname(sc)} (home root marked). Click ${c.root}, the root of the ${c.sym} chord, on the ${SN[s]} string, inside the shaded box.`,marks:[mk(rt,'root','R')],target:tgt(cand[0],c.root),notes:[midi(rt.s,rt.f),midi(cand[0].s,cand[0].f)],hint:`Find ${c.root} on the ${SN[s]} string between the shaded frets.`,explain:`${c.sym} is built on degree ${c.deg} of ${r} ${dname(sc)} (${VAMP[sc].rom}). On the ${SN[s]} string, inside the box, ${c.root} is at ${fretTxt(cand[0].f)}.`}}
  return mpClick()}
const mpBank=sbank('vb',[
 ['What is a modal vamp?','A short repeating chord pattern that makes one mode sound like home',['A fast scale run','A chord with five notes','A key change'],'Repeating two or three chords gives the ear one home chord and one mode.'],
 ['Which chord pair is a typical Dorian vamp?','i – IV (Dm – G)',['I – ♭VII','I – II','i – ♭II'],'The major IV chord brings the natural 6th that defines Dorian.'],
 ['Which chord pair is a typical Mixolydian vamp?','I – ♭VII (G – F)',['i – IV','I – II','i – ♭VI'],'The ♭VII major chord contains the ♭7 that defines Mixolydian.'],
 ['Which chord pair is a typical Lydian vamp?','I – II (F – G)',['I – ♭VII','i – ♭II','i – IV'],'The major II chord contains the ♯4 (G major has B over an F root).'],
 ['Which chord pair is a typical Phrygian vamp?','i – ♭II (Em – F)',['i – IV','I – II','I – ♭VII'],'The ♭II major chord is built on the ♭2, the note that defines Phrygian.'],
 ['Which chord set is a typical Aeolian vamp?','i – ♭VI – ♭VII (Am – F – G)',['I – IV – V','i – IV','I – II'],'♭VI and ♭VII are both major chords from natural minor.'],
 ['What does a modal vamp avoid, to keep the mode clear?','A dominant V7 chord that pulls to a different home',['Playing in time','Using the root','Repeating chords'],'Strong cadences, like V7 resolving to I, re-define the home chord as a normal key.']]);

const LS={
 diat:{h:'solo-modes-diatonic',n:'Lesson 85',title:'Modes over diatonic progressions',sub:'One parent scale covers the whole progression; each chord gets its own mode.',
  ex:[['Parent & modes',[dpKey,dpMode,dpBank]],['One box, every chord',[dpTarget,dpRoot,dpChordFor]]],
  test:[...rep(dpKey,2),...rep(dpMode,4),dpBank,...rep(dpTarget,3),...rep(dpRoot,3),...rep(dpChordFor,2)]},
 non:{h:'solo-modes-non-diatonic',n:'Lesson 86',title:'Modes over non-diatonic progressions',sub:'When a chord is outside the key, change scale for that chord and come back.',
  ex:[['Spot the outsider',[ndWhichChord,ndClickOut]],['Choose the scale',[ndScale,ndBank]],['On the neck',[ndTarget,ndChange]]],
  test:[...rep(ndWhichChord,2),...rep(ndScale,3),ndBank,...rep(ndTarget,3),...rep(ndChange,3),...rep(ndClickOut,3)]},
 vamp:{h:'modal-chord-progressions',n:'Lesson 87',title:'Modal chord progressions',sub:'Vamps that make one mode sound like home.',
  ex:[['Name the vamp',[mpName,mpChords,mpBank]],['Play the vamp',[mpChar,mpTarget,mpClick]]],
  test:[...rep(mpName,3),...rep(mpChords,3),mpBank,...rep(mpChar,3),...rep(mpTarget,3),...rep(mpClick,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 85–87 mixed.',
  ex:[['Lesson 85',[dpKey,dpMode,dpBank,dpTarget,dpRoot,dpChordFor]],['Lesson 86',[ndWhichChord,ndScale,ndBank,ndTarget,ndChange,ndClickOut]],['Lesson 87',[mpName,mpChords,mpBank,mpChar,mpTarget,mpClick]]],
  test:[dpKey,dpMode,dpMode,dpTarget,dpTarget,dpRoot,dpChordFor,dpBank,ndWhichChord,ndScale,ndScale,ndTarget,ndChange,ndClickOut,mpName,mpName,mpChords,mpChar,mpTarget,mpClick]}};
const ORDER=['diat','non','vamp','final'],STORE='gi-best-p21';

const progRow=(t,K)=>{const d=diatonic(K,'major',4);return`<tr><td>${t.map(x=>d[x-1].roman).join(' – ')}</td><td>${t.map(x=>d[x-1].sym).join(' – ')}</td><td>${t.map(x=>d[x-1].root+' '+dname(MODES[x-1])).join(', ')}</td></tr>`};
const NOTES={
 diat:`<div class="cols"><div><h3>Chords and modes in C major</h3><table class="stack"><thead><tr><th>Chord</th><th>Degree</th><th>Mode</th></tr></thead><tbody>${diatonic('C','major',4).map(c=>`<tr><td>${c.sym}</td><td>${c.roman}</td><td>${c.root} ${dname(MODES[c.deg-1])}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>If every chord is diatonic, one parent scale covers the whole progression.</li><li>Each chord “owns” the mode that starts on its root: ii Dorian, V7 Mixolydian, IVmaj7 Lydian.</li><li>In practice: keep one box, move your home note and your chord-tone targets with the chords.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Loop Dm7 – G7 – Cmaj7 and play only the C major box.</li><li>On each chord, start and end phrases on a chord tone of that chord.</li><li>Then name the mode you are hearing on each chord.</li></ul></div></div>`,
 non:`<div class="cols"><div><h3>Common non-diatonic chords in C major</h3><table class="stack"><thead><tr><th>Chord</th><th>Name</th><th>Scale</th></tr></thead><tbody>${[['A7','V7/ii','A Mixolydian'],['E7','V7/vi','E Mixolydian'],['D7','V7/V','D Mixolydian'],['C7','V7/IV','C Mixolydian'],['B♭','♭VII','B♭ Lydian or B♭ Mixolydian']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table><p class="small">Mainstream choices only. A secondary dominant can also take a harmonic-minor-based sound (for example A Phrygian dominant, the 5th mode of D harmonic minor, into Dm). The ♭VII chord can take Lydian (stay close to the key) or Mixolydian (borrowed colour).</p></div>
  <div><h3>Key ideas</h3><ul><li>Spot the chord that has a note outside the key.</li><li>For that chord, switch to the scale built on its root (Mixolydian for a dominant 7th).</li><li>When the diatonic chords return, go back to the key’s scale.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Loop C – A7 – Dm – G7. Play C major, then A Mixolydian on A7 (C♯ and F♯), then back to C major.</li><li>Loop C – B♭ – F – C: try B♭ Lydian, then B♭ Mixolydian, and compare.</li></ul></div></div>`,
 vamp:`<div class="cols"><div><h3>Vamps that establish a mode</h3><table class="stack"><thead><tr><th>Mode</th><th>Vamp</th><th>In D (or nearest)</th></tr></thead><tbody>${VM.map(m=>`<tr><td>${dname(m)}</td><td>${VAMP[m].rom}</td><td>${vampTxt('D',m)}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>A vamp repeats a few chords so one chord feels like home. That sets the mode.</li><li>Each vamp contains the characteristic note: Dorian ♮6 (in IV), Mixolydian ♭7 (♭VII), Lydian ♯4 (II), Phrygian ♭2 (♭II), Aeolian ♭6 (♭VI).</li><li>Avoid a V7–I cadence if you want the mode to stay clear.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Loop Dm – G and play D Dorian, stressing the B.</li><li>Loop G – F and play G Mixolydian, stressing the F.</li><li>Loop F – G: play F Lydian and bring out the B.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 85–87: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 88, Minor Pentatonic Scale: five notes, five boxes.</p></div></div>`};
