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

/* ===== Part 20: lessons 81–84 ===== */
const CH={dorian:[6,'♮6','natural 6th'],phrygian:[2,'♭2','flat 2nd'],lydian:[4,'♯4','sharp 4th'],mixolydian:[7,'♭7','flat 7th'],aeolian:[6,'♭6','flat 6th'],locrian:[5,'♭5','flat 5th']};
const modeIn=(P,d)=>{const mr=MODEROOT(P,d),sc=MODES[d-1],box=rbox(P);return{P,d,mr,sc,box,ps:scPos(mr,sc,[0,1,2,3,4,5],box[0],box[1])}};
const roleName=(q,i)=>({0:'root',2:'3rd',4:'5th',6:q==='dom7'||q==='m7'||q==='m7b5'?'♭7':'major 7th'})[i];

/* ---------- Lesson 81: mode scale patterns ---------- */
function mdWhich(){for(let k=0;k<80;k++){const P=pick(KEASY),d=R(2,7),m=modeIn(P,d),rs=m.ps.filter(p=>p.i===0);if(!rs.length)continue;const rt=pick(rs),ans=`${m.mr} ${dname(m.sc)}`;
  return{type:'choice',key:`mw${P}${d}`,box:m.box,text:`The shaded box holds the notes of ${P} major. If the marked note (${m.mr}) is your root, which mode are you playing?`,marks:[mk(rt,'root','R'),...m.ps.filter(p=>p!==rt).map(p=>mk(p,'ghost',p.name))],choices:mc(ans,MODES.map(x=>`${m.mr} ${dname(x)}`)),ans,notes:seqN(m.ps),pm:'seq',hint:`Which degree of ${P} major is ${m.mr}? Count along ${spellScale(P).join(' ')}.`,explain:`${m.mr} is degree ${d} of ${P} major, so the same notes seen from ${m.mr} are ${ans}: ${scaleNotes(m.mr,m.sc).join(' ')}. Same pattern, different root.`}}
  return mdWhich()}
function mdFill(){for(let k=0;k<100;k++){const P=pick(KEASY),d=R(1,7),m=modeIn(P,d),a=R(0,3),strs=[a,a+1,a+2],rs=m.ps.filter(p=>p.i===0);if(!rs.length)continue;const rt=pick(rs),tg=m.ps.filter(p=>strs.includes(p.s)&&!eqp(p,rt));if(tg.length<4||tg.length>8)continue;
  return{type:'multi',key:`mf${P}${d}${a}`,box:m.box,text:`Mode: ${m.mr} ${dname(m.sc)} (the root is marked). Click every note of this mode inside the shaded box on the ${strTxt(strs)} strings.`,marks:[mk(rt,'root','R')],targets:tg.map(p=>tgt(p,p.name)),notes:seqN(m.ps.filter(p=>strs.includes(p.s))),pm:'seq',hint:`${m.mr} ${dname(m.sc)} uses the notes of ${P} major. Name the notes on each string inside the box.`,explain:`${spellTxt(m.mr,m.sc)} (the notes of ${P} major). In the box: ${strs.map(s=>`${SL[s]}: ${m.ps.filter(p=>p.s===s).map(p=>`${p.name} (${p.f})`).join(', ')}`).join(' · ')}.`}}
  return mdFill()}
function mdRoot(){for(let k=0;k<120;k++){const P=pick(KEASY),d=R(2,7),m=modeIn(P,d),s=R(0,5),c=m.ps.filter(p=>p.s===s&&p.i===0);if(c.length!==1)continue;
  return{type:'click',key:`mr${P}${d}${s}`,box:m.box,text:`The shaded box is the ${P} major pattern. Click the root of ${m.mr} ${dname(m.sc)} on the ${SN[s]} string, inside the box.`,marks:[],target:tgt(c[0],'R'),notes:[midi(c[0].s,c[0].f)],hint:`${m.mr} ${dname(m.sc)} is a mode of ${P} major. Which note is its root, and where does that note sit on the ${SN[s]} string in the box?`,explain:`${m.mr} is degree ${d} of ${P} major (${spellScale(P).join(' ')}). On the ${SN[s]} string, inside the box, it is at ${(x=>x==='open'?'the open string':x)(fretTxt(c[0].f))}.`}}
  return mdRoot()}
function mdChar(){for(let k=0;k<100;k++){const P=pick(KEASY),d=R(2,7),m=modeIn(P,d),c=CH[m.sc],tg=m.ps.filter(p=>p.i===c[0]-1),rs=m.ps.filter(p=>p.i===0);if(!tg.length||!rs.length)continue;const rt=pick(rs);
  return{type:'multi',key:`mc${P}${d}`,box:m.box,text:`The marked note is the root of ${m.mr} ${dname(m.sc)}. Click every ${c[1]} (${tg[0].name}, the ${c[2]}) of this mode inside the shaded box.`,marks:[mk(rt,'root','R')],targets:tg.map(p=>tgt(p)),notes:seqN(tg),hint:`The ${c[1]} is the note that gives ${dname(m.sc)} its colour. Name it, then look for it on every string in the box.`,explain:`${spellTxt(m.mr,m.sc)}. The ${c[1]} is ${tg[0].name}: ${tg.map(p=>`${SL[p.s]} string ${fretTxt(p.f)}`).join(', ')}.`}}
  return mdChar()}
function mdDegree(){for(let k=0;k<100;k++){const P=pick(KEASY),d=R(2,7),m=modeIn(P,d),rs=m.ps.filter(p=>p.i===0),qs=m.ps.filter(p=>p.i>0);if(!rs.length)continue;const rt=pick(rs),x=pick(qs),lb=dlabels(m.sc),ans=lb[x.i];
  return{type:'choice',key:`md${P}${d}${x.i}`,box:m.box,text:`The marked note is the root of ${m.mr} ${dname(m.sc)}. Which degree of the mode is the ?`,marks:[mk(rt,'root','R'),mk(x,'q','?')],choices:mc(ans,lb.slice(1)),ans,notes:[midi(rt.s,rt.f),midi(x.s,x.f)],hint:`Spell ${m.mr} ${dname(m.sc)} and number the notes 1–7, then work out which one the ? is from the root.`,explain:`${spellTxt(m.mr,m.sc)}. The ? is ${x.name}, degree ${x.i+1} of the mode, written ${ans}.`}}
  return mdDegree()}
function mdParent(){const P=pick(KEASY),d=R(2,7),mr=MODEROOT(P,d),sc=MODES[d-1],ans=`${P} major`;
  return{type:'choice',noBoard:true,key:`mp${P}${d}`,text:`Which major scale has exactly the same notes as ${mr} ${dname(sc)}?`,choices:mc(ans,[`${mr} major`,...KEASY.filter(k=>k!==P&&k!==mr).map(k=>`${k} major`)]),ans,hint:`${mr} is the ${ord(d)} degree of the parent scale. Count back to the 1st degree.`,explain:`${spellTxt(mr,sc)} = ${spellScale(P).join(' ')} (${P} major) started on its ${ord(d)} degree.`}}
const mdBank=sbank('mb',[
 ['What stays the same when you play different modes of one major scale in one box?','The notes and the fretboard pattern',['The root note','The mode name','The characteristic note'],'The pattern on the neck is identical. Only the note you treat as home changes, and with it the mode.'],
 ['How many modes does the major scale have?','7, one starting on each degree',['5','8','12'],'Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian and Locrian: one per degree.'],
 ['A pattern holds the notes of C major. You land on and resolve to D. The mode is…','D Dorian',['D Ionian','D Phrygian','C Dorian'],'D is the 2nd degree of C major, so the same notes become D Dorian (D E F G A B C).'],
 ['What decides which mode you hear in one pattern?','The note you emphasise as the root',['The speed you play','Which string you start on','The key signature'],'The key signature stays the same; the mode comes from where you resolve.'],
 ['C Ionian and D Dorian are in series. What does that mean?','They share the same notes (same parent scale)',['They share the same root','They have the same formula','They sound identical'],'Series = modes of the same parent scale. Same root with different modes is called parallel (C Ionian, C Dorian).'],
 ['Which of these is the brightest mode?','Lydian',['Dorian','Aeolian','Locrian'],'Brightness order: Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian.'],
 ['Which mode is the darkest?','Locrian',['Phrygian','Aeolian','Dorian'],'Locrian has the most flats (♭2 ♭3 ♭5 ♭6 ♭7).']]);

/* ---------- Lesson 82: solo over major chords ---------- */
function sPick(){const r=pick(ROOTS.filter(x=>okSc(x,'lydian')&&okSc(x,'mixolydian'))),q=pick(['maj7','maj7','dom7','maj','dom7']),sym=chordSym(r,q),ans=q==='dom7'?'Mixolydian':'Ionian or Lydian';
  return{type:'choice',noBoard:true,key:`sp${r}${q}`,text:`Which mode of ${r} fits over ${sym}?`,choices:mc(ans,['Mixolydian','Ionian or Lydian','Dorian','Aeolian','Locrian','Phrygian']),ans,hint:q==='dom7'?'A dominant 7th has a major 3rd and a flat 7th. Which major-type mode has a ♭7?':'A major chord has a major 3rd. Which modes keep a major 3rd and a major 7th?',explain:q==='dom7'?`${sym} = ${chordNotes(r,q).join(' ')}. The ♭7 rules out Ionian and Lydian; ${spellTxt(r,'mixolydian')} fits.`:`${sym} has a major 3rd (and a major 7th if it is a maj7). ${spellTxt(r,'ionian')} fits; ${spellTxt(r,'lydian')} is the brighter alternative (♯4).`}}
function sOfMode(){const sc=pick(['ionian','lydian','mixolydian']),r=pick(ROOTS.filter(x=>okSc(x,sc))),q=sc==='mixolydian'?'dom7':'maj7',ans=chordSym(r,q);
  return{type:'choice',noBoard:true,key:`so${r}${sc}`,text:`You solo with ${r} ${dname(sc)} over one chord. Which chord is it?`,choices:mc(ans,[chordSym(r,'m7'),chordSym(r,'m7b5'),chordSym(r,q==='dom7'?'maj7':'dom7'),chordSym(r,'min')]),ans,hint:sc==='mixolydian'?'Look at the 3rd and the 7th of the scale.':'Look at the 3rd and the 7th of the scale, and remember the ♯4 is just a colour note.',explain:`${spellTxt(r,sc)}: stacking 3rds gives ${chordNotes(r,q).join(' ')} = ${ans}.`}}
function sTarget(){const c=pick([['maj7','ionian'],['maj7','lydian'],['dom7','mixolydian']]),r=pick(ROOTS.filter(x=>okSc(x,c[1])));return ctTask(r,c[0],c[1],'st')}
function sClick(){const c=pick([['maj7','ionian'],['maj7','lydian'],['dom7','mixolydian']]),r=pick(ROOTS.filter(x=>okSc(x,c[1]))),sym=chordSym(r,c[0]);
  return degClick(r,c[1],c[0],'sk',[2,4,6],(p,i)=>`Over ${sym} you play ${r} ${dname(c[1])} (root marked). Click the ${roleName(c[0],i)} of ${sym} (${p.name}) on the ${SN[p.s]} string, inside the shaded box.`)}
function sColour(){const c=pick([['lydian','maj7',3],['mixolydian','dom7',6]]),r=pick(ROOTS.filter(x=>okSc(x,c[0]))),sym=chordSym(r,c[1]);
  return degAll(r,c[0],c[2],'sc',p=>c[0]==='lydian'?`Over ${sym} you play ${r} Lydian (root marked). Click every ♯4 (${p.name}), the note that makes it Lydian instead of Ionian, inside the shaded box.`:`Over ${sym} you play ${r} Mixolydian (root marked). Click every ♭7 (${p.name}), the note that makes it Mixolydian instead of Ionian, inside the shaded box.`)}
function sRole(){const c=pick([['maj7','ionian'],['maj7','lydian'],['dom7','mixolydian']]);for(let k=0;k<100;k++){const r=pick(ROOTS.filter(x=>okSc(x,c[1]))),box=rbox(r),ps=scPos(r,c[1],[0,1,2,3,4,5],box[0],box[1]),rs=ps.filter(p=>p.i===0),x=pick(ps.filter(p=>p.i>0));if(!rs.length)continue;const rt=pick(rs),lb=dlabels(c[1]),tag=i=>`${lb[i]} (${i%2===0?'chord tone':'passing tone'})`,ans=tag(x.i),sym=chordSym(r,c[0]);
  return{type:'choice',key:`sr${r}${c[1]}${x.i}`,box,text:`Over ${sym} you play ${r} ${dname(c[1])} (root marked). What is the ? in relation to the chord?`,marks:[mk(rt,'root','R'),mk(x,'q','?')],choices:mc(ans,[1,2,3,4,5,6].map(tag)),ans,notes:[midi(rt.s,rt.f),midi(x.s,x.f)],hint:'Work out the interval from the root, then ask whether it is the 3rd, 5th or 7th of the chord.',explain:`${spellTxt(r,c[1])}. The ? is ${x.name}, degree ${x.i+1} of the scale. ${sym} = ${chordNotes(r,c[0]).join(' ')}, so it is a ${x.i%2===0?'chord tone: aim for it on strong beats':'passing tone (scale note outside the chord): use it to connect chord tones'}.`}}
  return sRole()}
const sBank=sbank('sb',[
 ['Over a maj7 chord, which two modes fit best?','Ionian or Lydian',['Dorian or Aeolian','Mixolydian or Dorian','Phrygian or Locrian'],'Both have a major 3rd and major 7th. Lydian adds a ♯4 for a brighter, floating colour.'],
 ['Over a dominant 7th chord, the standard mode is…','Mixolydian',['Ionian','Dorian','Lydian'],'Mixolydian is the major scale with a ♭7, matching the chord’s ♭7.'],
 ['Why does plain Ionian clash over a dominant 7th chord?','Its major 7th fights the chord’s ♭7',['It has no 3rd','It is too dark','Its root is wrong'],'A major 7th (e.g. B over C7) sits a half step above the chord’s ♭7 (B♭) and sounds wrong when held.'],
 ['What does Lydian change compared with Ionian?','The 4th is raised a half step (♯4)',['The 7th is lowered','The 3rd is lowered','The 2nd is lowered'],'Lydian = major scale with a ♯4. It removes the 4th, which clashes with the 3rd when sustained over a maj7 chord.'],
 ['Which note of the Ionian scale is usually not sustained over a maj7 chord?','The 4th',['The 3rd','The 5th','The 6th'],'The 4th is a half step above the chord’s 3rd and clashes if held. Lydian’s ♯4 avoids this.'],
 ['What does “target chord tones” mean when soloing?','Land on notes of the chord (1 3 5 7) on strong beats',['Play only the root','Avoid the 3rd','Play every scale note equally'],'Use the mode for colour and passing notes, and resolve phrases onto chord tones.'],
 ['Which chord tones define a dominant 7th chord’s sound?','The major 3rd and the ♭7',['The root and 5th','The 2nd and 4th','The ♯4 and 7'],'The 3rd and 7th (the guide tones) tell the ear what chord it is.']]);

/* ---------- Lesson 83: solo over minor chords ---------- */
const MNCTX={2:'dorian',3:'phrygian',6:'aeolian'};
function mnCtx(){const K=pick(KEASY),d=pick([2,2,3,6,6]),ch=diatonic(K,'major',4)[d-1],sc=MNCTX[d],ans=`${ch.root} ${dname(sc)}`;
  return{type:'choice',noBoard:true,key:`mx${K}${d}`,text:`In the key of ${K} major, ${ch.sym} is the ${ch.roman} chord. Which mode do you play over it?`,choices:mc(ans,['Dorian','Phrygian','Aeolian','Mixolydian','Lydian'].map(x=>`${ch.root} ${x}`)),ans,hint:'Which degree of the key is the chord built on? The mode starts on the same degree of the same major scale.',explain:`${ch.sym} is built on degree ${d} of ${K} major, so the mode that starts there is ${ans}: ${scaleNotes(ch.root,sc).join(' ')}, the notes of ${K} major. (ii → Dorian, iii → Phrygian, vi → Aeolian.)`}}
function mnTarget(){const sc=pick(['dorian','aeolian','phrygian']),r=pick(ROOTS.filter(x=>okSc(x,sc)));return ctTask(r,'m7',sc,'mt')}
function mnChar(){const sc=pick(['dorian','aeolian','phrygian']),r=pick(ROOTS.filter(x=>okSc(x,sc))),c=CH[sc];
  return degAll(r,sc,c[0]-1,'mh',p=>`Over ${chordSym(r,'m7')} you play ${r} ${dname(sc)} (root marked). Click every ${c[1]} (${p.name}), its characteristic note, inside the shaded box.`)}
function mnClick(){const sc=pick(['dorian','aeolian','phrygian']),r=pick(ROOTS.filter(x=>okSc(x,sc)));
  return degClick(r,sc,'m7','mk',[1,2,3,4,5,6],(p)=>`Over ${chordSym(r,'m7')} you play ${r} ${dname(sc)} (root marked). Click the ${p.t} (${p.name}) on the ${SN[p.s]} string, inside the shaded box.`)}
const mnDiffV=[['dorian','aeolian','6th only',[5]],['aeolian','phrygian','2nd only',[1]],['dorian','phrygian','2nd and 6th',[1,5]]];
function mnDiff(){const v=pick(mnDiffV),r=pick(ROOTS.filter(x=>okSc(x,'dorian')&&okSc(x,'aeolian')&&okSc(x,'phrygian'))),a=scaleNotes(r,v[0]),b=scaleNotes(r,v[1]);
  return{type:'choice',noBoard:true,key:`mn${r}${v[0]}${v[1]}`,text:`Which degrees are different between ${r} ${dname(v[0])} and ${r} ${dname(v[1])}?`,choices:mc(v[2],['6th only','2nd only','2nd and 6th','3rd and 7th']),ans:v[2],hint:'Spell both scales and compare note by note.',explain:`${r} ${dname(v[0])}: ${a.join(' ')}. ${r} ${dname(v[1])}: ${b.join(' ')}. ${v[3].map(i=>`Degree ${i+1}: ${a[i]} → ${b[i]}`).join('; ')}.`}}
const mnBank=sbank('nb',[
 ['Over a ii7 chord in a major key (e.g. Dm7 in C), the usual mode is…','Dorian',['Phrygian','Aeolian','Mixolydian'],'The mode that starts on degree 2 of the key is Dorian.'],
 ['Over a iii7 chord in a major key (e.g. Em7 in C), the usual mode is…','Phrygian',['Dorian','Aeolian','Locrian'],'The mode that starts on degree 3 is Phrygian: its ♭2 is a half step above the root.'],
 ['Over a vi7 chord in a major key (e.g. Am7 in C), the usual mode is…','Aeolian',['Dorian','Phrygian','Lydian'],'The mode that starts on degree 6 is Aeolian (natural minor).'],
 ['Which of Dorian, Aeolian and Phrygian is the brightest?','Dorian',['Aeolian','Phrygian','They are equal'],'Dorian has a natural 6th, Aeolian a ♭6, Phrygian a ♭2 as well. More flats means darker.'],
 ['Which note is the characteristic note of Dorian?','The natural 6th',['The ♭2','The ♭6','The ♯4'],'Dorian is minor with a natural 6th. Compared with Aeolian that is the only change.'],
 ['What gives Phrygian its Spanish-sounding colour?','The ♭2, a half step above the root',['The ♮6','The ♯4','The major 7th'],'The ♭2 leans onto the root and is the most striking Phrygian note.'],
 ['All minor 7th chords have the same four chord tones. What differs between the three modes?','The colour notes between the chord tones',['The 3rd','The root','The ♭7'],'R ♭3 5 ♭7 are in all three; the 2nd, 4th and 6th change the colour.']]);

/* ---------- Lesson 84: solo over m7b5 chords ---------- */
const VK=KEASY.filter(k=>k!=='F♯');
function lcCtx(){const K=pick(VK),ch=diatonic(K,'major',4)[6],ans=`${ch.root} Locrian`;
  return{type:'choice',noBoard:true,key:`lx${K}`,text:`In the key of ${K} major, ${ch.sym} is the vii chord. Which mode do you play over it?`,choices:mc(ans,['Locrian','Phrygian','Aeolian','Dorian'].map(x=>`${ch.root} ${x}`)),ans,hint:'The mode starts on the same degree of the key as the chord does.',explain:`${ch.sym} (${ch.roman}) is built on degree 7 of ${K} major, so the mode is ${ans}: ${scaleNotes(ch.root,'locrian').join(' ')}, the notes of ${K} major.`}}
function lcMajor(){const P=pick(VK),r=MODEROOT(P,7),ans=`${P} major`;
  return{type:'choice',noBoard:true,key:`lm${P}`,text:`${r} Locrian has the same notes as which major scale?`,choices:mc(ans,[`${r} major`,...KEASY.filter(k=>k!==P&&k!==r).map(k=>`${k} major`)]),ans,hint:'Locrian is the 7th mode, so the root is the 7th degree of its parent scale: a half step below the parent root.',explain:`${spellTxt(r,'locrian')}. Starting from the next note up (${P}) gives ${spellScale(P).join(' ')}: ${P} major.`}}
function lcTarget(){const r=pick(ROOTS.filter(x=>okSc(x,'locrian')));return ctTask(r,'m7b5','locrian','lt')}
function lcChar(){const r=pick(ROOTS.filter(x=>okSc(x,'locrian'))),i=pick([4,1]);
  return degAll(r,'locrian',i,'lh',p=>`Over ${chordSym(r,'m7b5')} you play ${r} Locrian (root marked). Click every ${i===4?'♭5':'♭2'} (${p.name}) inside the shaded box${i===4?', the note that separates Locrian from Phrygian':', the note a half step above the root'}.`)}
function lcClick(){const r=pick(ROOTS.filter(x=>okSc(x,'locrian'))),sym=chordSym(r,'m7b5');
  return degClick(r,'locrian','m7b5','lk',[2,4,6],(p,i)=>`Over ${sym} you play ${r} Locrian (root marked). Click the ${i===2?'♭3':i===4?'♭5':'♭7'} of ${sym} (${p.name}) on the ${SN[p.s]} string, inside the shaded box.`)}
function lcDegree(){for(let k=0;k<100;k++){const r=pick(ROOTS.filter(x=>okSc(x,'locrian'))),box=rbox(r),ps=scPos(r,'locrian',[0,1,2,3,4,5],box[0],box[1]),rs=ps.filter(p=>p.i===0);if(!rs.length)continue;const rt=pick(rs),x=pick(ps.filter(p=>p.i>0)),lb=dlabels('locrian'),ans=lb[x.i];
  return{type:'choice',key:`ld${r}${x.i}`,box,text:`The marked note is the root of ${r} Locrian. Which degree of the mode is the ?`,marks:[mk(rt,'root','R'),mk(x,'q','?')],choices:mc(ans,lb.slice(1)),ans,notes:[midi(rt.s,rt.f),midi(x.s,x.f)],hint:'Spell the mode (1 ♭2 ♭3 4 ♭5 ♭6 ♭7) and measure the interval from the root.',explain:`${spellTxt(r,'locrian')}. The ? is ${x.name}, degree ${x.i+1} of the mode, written ${ans}.`}}
  return lcDegree()}
function lcPent(){const r=pick(ROOTS.filter(x=>{const n=spellF(x,'1 b3 b5 b7');return n.every(y=>!/[𝄪𝄫]/.test(y))&&!/^[CF]♭$/.test(n[1])&&!/^[EB]♯$/.test(n[1])})),sym=chordSym(r,'m7b5'),b3=spellF(r,'1 b3')[1],ans=`${b3} minor pentatonic`;
  return{type:'choice',noBoard:true,key:`lp${r}`,text:`A common way to solo over ${sym} is to play a minor pentatonic scale built on one of its chord tones. Which one?`,choices:mc(ans,[`${r} minor pentatonic`,`${spellF(r,'1 b5')[1]} minor pentatonic`,`${spellF(r,'1 2')[1]} minor pentatonic`,`${r} major pentatonic`]),ans,hint:'Look for the chord tone a minor 3rd above the root.',explain:`${sym} = ${chordNotes(r,'m7b5').join(' ')}. The ♭3 is ${b3}, and ${b3} minor pentatonic (${scaleNotes(b3,'minPent').join(' ')}) contains the chord’s ♭3, ♭5 and ♭7, and every one of its notes belongs to ${r} Locrian.`}}
const lcBank=sbank('lb',[
 ['What is the Locrian formula?','1 ♭2 ♭3 4 ♭5 ♭6 ♭7',['1 2 ♭3 4 ♭5 ♭6 ♭7','1 ♭2 ♭3 4 5 ♭6 ♭7','1 2 3 4 ♭5 6 7'],'Locrian is the 7th mode of the major scale: every degree except the 4th is flattened.'],
 ['Which chord does Locrian fit?','m7♭5 (half-diminished)',['Dominant 7th','Major 7th','Minor 7th'],'The 7th chord on the 7th degree of a major scale is m7♭5; its mode is Locrian.'],
 ['On which degree of a major scale does Locrian start?','The 7th',['The 2nd','The 4th','The 6th'],'B Locrian uses the notes of C major.'],
 ['What is the only difference between Locrian and Phrygian?','The 5th: ♭5 in Locrian, perfect 5th in Phrygian',['The 2nd','The 6th','The 3rd'],'Phrygian 1 ♭2 ♭3 4 5 ♭6 ♭7 vs Locrian 1 ♭2 ♭3 4 ♭5 ♭6 ♭7.'],
 ['Why is Locrian rarely used as a home key?','Its tonic triad is diminished and unstable',['It has no 3rd','It has too few notes','It cannot be played on guitar'],'The root, ♭3 and ♭5 form a diminished triad, so it rarely feels like home.'],
 ['In a major key, which chord is the m7♭5 chord?','The vii chord (viiø7)',['The ii chord','The iii chord','The V chord'],'In C major: Bm7♭5, the viiø7 chord.']]);

const LS={
 pat:{h:'mode-scale-patterns',n:'Lesson 81',title:'Mode scale patterns',sub:'One pattern in one box becomes a different mode depending on which note you treat as the root.',
  ex:[['Name the mode',[mdWhich,mdParent,mdBank]],['Fill the box',[mdFill,mdRoot]],['Mode notes',[mdChar,mdDegree]]],
  test:[...rep(mdWhich,3),...rep(mdFill,2),...rep(mdRoot,2),...rep(mdChar,3),...rep(mdDegree,2),...rep(mdParent,2),mdBank]},
 maj:{h:'solo-modes-major-chords',n:'Lesson 82',title:'Solo with modes over major chords',sub:'Ionian or Lydian over maj7, Mixolydian over dominant 7th, and aiming at chord tones.',
  ex:[['Choose the mode',[sPick,sOfMode,sBank]],['Chord tones',[sTarget,sClick,sRole]],['Mode colours',[sColour]]],
  test:[...rep(sPick,3),...rep(sOfMode,2),sBank,...rep(sTarget,3),...rep(sClick,2),...rep(sColour,2),...rep(sRole,2)]},
 min:{h:'solo-modes-minor-chords',n:'Lesson 83',title:'Solo with modes over minor chords',sub:'Dorian, Aeolian or Phrygian over m7: choose by where the chord sits in the key.',
  ex:[['Pick from context',[mnCtx,mnBank]],['Chord tones',[mnTarget,mnClick]],['Mode colours',[mnChar,mnDiff]]],
  test:[...rep(mnCtx,4),mnBank,...rep(mnTarget,3),...rep(mnClick,2),...rep(mnChar,3),...rep(mnDiff,2)]},
 loc:{h:'solo-modes-m7b5-chords',n:'Lesson 84',title:'Solo with modes over m7♭5 chords',sub:'Locrian over the vii chord of a major key.',
  ex:[['Name the mode',[lcCtx,lcMajor,lcBank]],['On the neck',[lcTarget,lcChar,lcClick,lcDegree]],['Pentatonic idea',[lcPent]]],
  test:[...rep(lcCtx,3),...rep(lcMajor,2),lcBank,...rep(lcPent,2),...rep(lcTarget,2),...rep(lcChar,2),lcClick,...rep(lcDegree,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 81–84 mixed.',
  ex:[['Lessons 81–82',[mdWhich,mdFill,mdRoot,mdChar,mdDegree,mdParent,mdBank,sPick,sOfMode,sTarget,sClick,sColour,sRole,sBank]],['Lessons 83–84',[mnCtx,mnTarget,mnChar,mnClick,mnDiff,mnBank,lcCtx,lcMajor,lcTarget,lcChar,lcClick,lcDegree,lcPent,lcBank]]],
  test:[mdWhich,mdFill,mdChar,mdParent,mdDegree,sPick,sOfMode,sTarget,sClick,sColour,mnCtx,mnCtx,mnTarget,mnChar,mnDiff,lcCtx,lcMajor,lcTarget,lcChar,lcPent]}};
const ORDER=['pat','maj','min','loc','final'],STORE='gi-best-p20';

const modeRow=(m,i)=>`<tr><td>${dname(m)}</td><td>${i+1}</td><td>${scaleNotes(spellScale('C')[i],m).join(' ')}</td><td>${LB(SCALES[m].f).join(' ')}</td></tr>`;
const NOTES={
 pat:`<div class="cols"><div><h3>The seven modes of C major</h3><div class="scroll"><table><thead><tr><th>Mode</th><th>Degree</th><th>Notes</th><th>Formula</th></tr></thead><tbody>${MODES.map(modeRow).join('')}</tbody></table></div></div>
  <div><h3>Key ideas</h3><ul><li>One box of fretboard notes is one pattern. Start from a different note and you hear a different mode.</li><li>To name the mode: find the root’s degree in the parent major scale.</li><li>Each mode has a characteristic note: Dorian ♮6, Phrygian ♭2, Lydian ♯4, Mixolydian ♭7, Aeolian ♭6, Locrian ♭5.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the C major box from fret 7 of the low E string, but start and finish on D: that is D Dorian.</li><li>Keep the same box and resolve on E, then G: hear Phrygian, then Mixolydian.</li><li>Find the characteristic note of each mode inside the box.</li></ul></div></div>`,
 maj:`<div class="cols"><div><h3>Modes for major-type chords</h3><table class="stack"><thead><tr><th>Chord</th><th>Mode</th><th>In C</th></tr></thead><tbody><tr><td>maj / maj7</td><td>Ionian</td><td>${scaleNotes('C','ionian').join(' ')}</td></tr><tr><td>maj7 (brighter)</td><td>Lydian</td><td>${scaleNotes('C','lydian').join(' ')}</td></tr><tr><td>dominant 7th</td><td>Mixolydian</td><td>${scaleNotes('C','mixolydian').join(' ')}</td></tr></tbody></table><p class="small">Assumption: the mode starts on the chord root (Cmaj7 → C Ionian or C Lydian, C7 → C Mixolydian).</p></div>
  <div><h3>Key ideas</h3><ul><li>The chord names the mode: major 3rd and major 7th → Ionian or Lydian; major 3rd and ♭7 → Mixolydian.</li><li>Chord tones (1 3 5 7) are the stable targets; the other scale notes connect them.</li><li>Lydian’s ♯4 avoids the clash of the 4th over a maj7 chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Over Gmaj7 play G Ionian, then G Lydian, and hear the C versus C♯.</li><li>Over G7 play G Mixolydian and land on F (the ♭7) at the end of phrases.</li><li>Start every phrase on a chord tone.</li></ul></div></div>`,
 min:`<div class="cols"><div><h3>Which minor mode?</h3><table class="stack"><thead><tr><th>Chord in a major key</th><th>Mode</th><th>In C</th></tr></thead><tbody>${[2,3,6].map(d=>{const ch=diatonic('C','major',4)[d-1];return`<tr><td>${ch.roman} (${ch.sym})</td><td>${dname(MNCTX[d])}</td><td>${scaleNotes(ch.root,MNCTX[d]).join(' ')}</td></tr>`}).join('')}</tbody></table><p class="small">Assumption: the chord is diatonic to a major key. A minor chord on its own with no context: Dorian is the usual first choice; Aeolian is darker.</p></div>
  <div><h3>Key ideas</h3><ul><li>All three modes share R ♭3 5 ♭7. The 2nd, 4th and 6th give the colour.</li><li>Dorian ♮6 is the brightest, Aeolian ♭6 is darker, Phrygian ♭2 is the darkest of the three.</li><li>Context decides: ii → Dorian, iii → Phrygian, vi → Aeolian.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Over Dm7 play D Dorian and bring out the B.</li><li>Over Em7 (same C major notes!) lean on the F.</li><li>Over Am7 hold the F and end on A.</li></ul></div></div>`,
 loc:`<div class="cols"><div><h3>Locrian and m7♭5</h3><table class="stack"><thead><tr><th>Item</th><th>In C major</th></tr></thead><tbody><tr><td>vii chord</td><td>${diatonic('C','major',4)[6].sym} = ${diatonic('C','major',4)[6].notes.join(' ')}</td></tr><tr><td>Locrian</td><td>${scaleNotes('B','locrian').join(' ')}</td></tr><tr><td>Formula</td><td>${LB(SCALES.locrian.f).join(' ')}</td></tr><tr><td>Alternative</td><td>${spellF('B','1 b3')[1]} minor pentatonic over ${chordSym('B','m7b5')}</td></tr></tbody></table><p class="small">Assumption: here m7♭5 is the vii chord of a major key. As the ii chord of a minor key, Locrian ♮2 is also used.</p></div>
  <div><h3>Key ideas</h3><ul><li>Locrian is the 7th mode: it starts a half step below the parent major root.</li><li>It is the only mode with a diminished tonic triad, so it works over a chord and rarely as a home key.</li><li>The ♭5 separates it from Phrygian.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play B Locrian in the C major box and stress the F.</li><li>Arpeggiate B D F A, then fill in the Locrian notes between.</li><li>Try D minor pentatonic over Bm7♭5.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 81–84: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 85, Solo with Modes Diatonic Chord Progressions: one parent scale across a whole progression.</p></div></div>`};
