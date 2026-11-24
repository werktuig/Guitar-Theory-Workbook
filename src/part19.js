/* ===== Part 19: lessons 76–80 ===== */
/* ---- shared mode helpers ---- */
const MN=m=>SCALES[m].name,MI=m=>MODES.indexOf(m);
const fx=t=>t.replace(/b/g,'♭').replace(/#/g,'♯');
const FTOK=m=>SCALES[m].f.split(' ');
const fmlTxt=m=>fx(SCALES[m].f);
const FSEM=m=>fmlSemis(SCALES[m].f);
const dl=(m,d)=>d===1?'R':fx(FTOK(m)[d-1]);
const dlN=(m,d)=>d===1?'1':fx(FTOK(m)[d-1]);
const odd=a=>a.some(n=>/𝄪|𝄫|^(E♯|B♯|F♭|C♭)/.test(n));
const BRIGHT=['lydian','ionian','mixolydian','dorian','aeolian','phrygian','locrian'];
/* parent-first context: root = degree i+1 of parent P */
function mctx(m,P0){for(let k=0;k<300;k++){const P=P0||pick(KEASY),i=MI(m),ps=spellScale(P),rt=ps[i],sc=scaleNotes(rt,m);if(odd(ps)||odd(sc))continue;return{P,rt,sc,i,m,ps}}throw new Error('mctx')}
/* root-first context (parallel modes) */
function pctx(m,R0){for(let k=0;k<300;k++){const rt=R0||pick(KEASY),sc=scaleNotes(rt,m);if(odd(sc))continue;return{rt,sc,m}}throw new Error('pctx')}
const parentOf=(rt,m)=>{const i=MI(m);return spellSteps(rt,[[(7-i)%7,(12-MAJ[i])%12]])[0]};
const sharpOf=x=>x.endsWith('♭')?x.slice(0,-1):x.endsWith('♯')?null:x+'♯';
const flatOf=x=>x.endsWith('♯')?x.slice(0,-1):x.endsWith('♭')?null:x+'♭';
/* a string whose root fret is 0..3, so the octave is reachable */
function strCtx(rt){const o=[];for(let s=0;s<6;s++){const r=rootFret(rt,s,0);if(r>=0&&r<=3)o.push({s,r})}return pick(o)}
const strPos=(rt,m,s,r)=>FSEM(m).map((x,j)=>({s,f:r+x,t:j===0?'R':dl(m,j+1),j})).concat([{s,f:r+12,t:'R',j:7}]);
const modeCard=(rt,m)=>`${rt} ${MN(m)}: ${scaleNotes(rt,m).join(' ')} ${rt}`;
const pcsOfMode=(rt,m)=>FSEM(m).map(x=>(pcOf(rt)+x)%12);
const aOrAn=w=>/^[AEIOU]/.test(w)?'an':'a';
/* alteration text of mode m relative to major, e.g. '♭3 ♭7' */
const altOf=m=>{const s=FSEM(m),o=[];s.forEach((x,i)=>{if(x!==MAJ[i])o.push(fx((x<MAJ[i]?'b':'#')+(i+1)))});return o.length?o.join(' '):'none'};
/* click the single (unique) position of pitch class pc on string s2 near fret f */
const nearPc=(pc,s2,f,lo=4,hi=4)=>allPc(pc,[s2],Math.max(0,f-lo),Math.min(15,f+hi));
/* box: notes of mode (rt,m) in frets lo..hi on given strings; roots become marks */
function boxSet(rt,m,strings,lo,hi){const pcs=pcsOfMode(rt,m),sc=scaleNotes(rt,m),all=pcsPositions(pcs,strings,lo,hi).map(p=>{const j=pcs.indexOf(pcAt(p.s,p.f));return{...p,j,name:sc[j],t:j===0?'R':dl(m,j+1)}});return{roots:all.filter(p=>p.j===0),rest:all.filter(p=>p.j!==0)}}
const bad1=x=>/^(E♯|B♯|F♭|C♭)|𝄪|𝄫/.test(x);
const qn=q=>CHORDS[q].name.replace(' (m7♭5)','');
/* ---- one-mode lesson factory ---- */
const MCH={ionian:{nm:'major 7th',d:7,lbl:'7',desc:'the major 7th, which separates it from Mixolydian’s ♭7',q:'maj7'},dorian:{nm:'natural 6th',d:6,lbl:'6',desc:'the natural 6th, which separates it from Aeolian’s ♭6',q:'m7'},phrygian:{nm:'♭2',d:2,lbl:'♭2',desc:'the ♭2, a half step above the root',q:'m7'},lydian:{nm:'♯4',d:4,lbl:'♯4',desc:'the ♯4, which separates it from Ionian’s natural 4',q:'maj7'},mixolydian:{nm:'♭7',d:7,lbl:'♭7',desc:'the ♭7, which separates it from Ionian’s major 7th',q:'dom7'},aeolian:{nm:'♭6',d:6,lbl:'♭6',desc:'the ♭6, which separates it from Dorian’s natural 6th',q:'m7'},locrian:{nm:'♭5',d:5,lbl:'♭5',desc:'the ♭5, the note that makes its tonic chord diminished',q:'m7b5'}};
function mkMode(m,items){const i=MI(m),nmx=MN(m),ch=MCH[m],QS=['maj7','dom7','m7','m7b5'];
 const bank=sbank('b'+m.slice(0,3),items);
 const spell=()=>{const c=mctx(m),alt=[2,3,4,5,6,7].filter(d=>FSEM(m)[d-1]!==MAJ[d-1]),d=alt.length&&Math.random()<.7?pick(alt):R(2,7),a=c.sc[d-1];
  const pool=[sharpOf(a),flatOf(a),c.ps[(d-1+i)%7],c.sc[d%7],spellScale(c.rt)[d-1]].filter(x=>x&&!odd([x]));
  return{type:'choice',noBoard:true,key:`${m}sp${c.rt}${d}`,text:`What is the ${ord(d)} note of ${c.rt} ${nmx}?`,ans:a,choices:mc(a,pool),hint:`${nmx} = ${fmlTxt(m)}. Build the major scale on ${c.rt} and alter the marked degrees, or start from the parent.`,explain:`${modeCard(c.rt,m)}. Degree ${d}${dlN(m,d)!==String(d)?` (${dlN(m,d)})`:''} is ${a}.`}};
 const parent=()=>{const c=mctx(m),ans=`${c.P} major`,pool=MODES.filter(x=>x!==m).map(x=>parentOf(c.rt,x)).filter(x=>!bad1(x)).map(x=>`${x} major`);
  return{type:'choice',noBoard:true,key:`${m}pa${c.rt}`,text:`${c.rt} ${nmx} is a mode of which major scale?`,ans,choices:mc(ans,pool),hint:`${nmx} starts on degree ${i+1} of its parent.`,explain:`${nmx} is mode ${i+1}, so ${c.rt} is degree ${i+1} of ${c.P} major (${c.ps.join(' ')}).`}};
 const chord=()=>{const c=pctx(m),ans=chordSym(c.rt,ch.q),cn=chordNotes(c.rt,ch.q);
  return{type:'choice',noBoard:true,key:`${m}ch${c.rt}`,text:`Which chord fits ${c.rt} ${nmx} best?`,ans,choices:mc(ans,QS.map(q=>chordSym(c.rt,q))),hint:`Stack 3rds on the root of the mode (degrees 1 3 5 7) and see which chord they make.`,explain:`${modeCard(c.rt,m)}. Degrees 1 3 5 7 are ${cn.join(' ')}: ${ans} (${qn(ch.q)}). The other chords contain a note the mode does not have.`}};
 const string=()=>{for(let n=0;n<200;n++){const c=mctx(m),x=strCtx(c.rt);if(!x)continue;const tg=strPos(c.rt,m,x.s,x.r).slice(1);
  return{type:'multi',key:`${m}st${c.rt}${x.s}`,text:`Play ${c.rt} ${nmx} up the ${SN[x.s]} string. The root is marked: click every note up to the octave.`,marks:[{s:x.s,f:x.r,t:'R',k:'root'}],targets:tg.map(p=>({s:p.s,f:p.f,t:p.t==='R'?'8':p.t})),notes:[midi(x.s,x.r),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`${nmx} = ${fmlTxt(m)}: start from the major pattern 2 2 1 2 2 2 1 and alter the marked degrees.`,explain:`${modeCard(c.rt,m)}. Frets: ${[x.r,...tg.map(p=>p.f)].join(', ')}.`}}throw new Error('string')};
 const char=()=>{for(let n=0;n<600;n++){const c=mctx(m),s=R(0,5),f=rootFret(c.rt,s,1),s2=R(0,5);if(f<1||f>11)continue;const nt=c.sc[ch.d-1],cand=nearPc(pcOf(nt),s2,f,5,5);if(cand.length!==1||(s2===s&&cand[0].f===f))continue;
  return{type:'click',key:`${m}cn${c.rt}${s}${s2}`,text:`The marked note is the root of ${c.rt} ${nmx}. Click its characteristic note, the ${ch.nm}, on the ${SN[s2]} string, within 5 frets of the root.`,marks:[{s,f,t:'R',k:'root'}],target:{s:s2,f:cand[0].f,t:ch.lbl},notes:[midi(s,f),midi(s2,cand[0].f)],hint:`Spell ${c.rt} ${nmx} and find degree ${ch.d}.`,explain:`${modeCard(c.rt,m)}. The characteristic note is ${ch.desc}: ${nt}, on the ${SN[s2]} string, ${fretTxt(cand[0].f)}.`}}throw new Error('char')};
 const parentRoot=()=>{for(let n=0;n<600;n++){const c=mctx(m),s=R(0,5),f=rootFret(c.rt,s,1),s2=R(0,5);if(f<1||f>11)continue;const tn=m==='ionian'?c.sc[5]:c.P,cand=nearPc(pcOf(tn),s2,f,5,5);if(cand.length!==1||(s2===s&&cand[0].f===f))continue;
  const what=m==='ionian'?'the root of its relative minor (the 6th degree)':'the root of its parent major scale';
  return{type:'click',key:`${m}pr${c.rt}${s}${s2}`,text:`The marked note is the root of ${c.rt} ${nmx}. Click ${what} on the ${SN[s2]} string, within 5 frets.`,marks:[{s,f,t:'R',k:'root'}],target:{s:s2,f:cand[0].f,t:tn},notes:[midi(s,f),midi(s2,cand[0].f)],hint:m==='ionian'?'The relative minor starts on the 6th degree, a major 6th above (or a minor 3rd below) the root.':`${nmx} starts on degree ${i+1}: the parent’s root is ${MAJ[i]} semitones below this note (or ${12-MAJ[i]} above).`,explain:m==='ionian'?`${c.rt} major: ${c.sc.join(' ')}. Its 6th degree is ${tn}, so ${tn} minor (Aeolian) shares its notes: ${SN[s2]} string, ${fretTxt(cand[0].f)}.`:`${nmx} is mode ${i+1}: ${c.rt} is ${MAJ[i]} semitones above the parent’s root ${c.P} (or ${12-MAJ[i]} below it). Find ${c.P} on the ${SN[s2]} string, ${fretTxt(cand[0].f)}.`}}throw new Error('parentRoot')};
 const boxMark=()=>{for(let n=0;n<600;n++){const c=mctx(m),a=R(0,4),lo=R(0,10),hi=lo+4,b=boxSet(c.rt,m,[a,a+1],lo,hi);if(b.rest.length<3||b.rest.length>8)continue;
  return{type:'multi',key:`${m}bx${c.rt}${a}${lo}`,box:[lo,hi],text:`Mark ${c.rt} ${nmx} on the ${SN[a]} and ${SN[a+1]} strings: the roots are marked. Click every other note of the mode inside the shaded frets ${lo}–${hi}.`,marks:b.roots.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:b.rest.map(p=>({s:p.s,f:p.f,t:p.t})),notes:[...b.roots,...b.rest].sort((x,y)=>midi(x.s,x.f)-midi(y.s,y.f)).map(p=>midi(p.s,p.f)),hint:`The notes are ${c.sc.join(' ')}.`,explain:`${modeCard(c.rt,m)}. In frets ${lo}–${hi}: ${b.rest.map(p=>`${p.name} (${SN[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}throw new Error('boxMark')};
 const chordTones=()=>{for(let n=0;n<200;n++){const c=mctx(m),x=strCtx(c.rt);if(!x)continue;const cn=chordNotes(c.rt,ch.q),tg=[3,5,7].map(d=>({s:x.s,f:x.r+FSEM(m)[d-1],t:dl(m,d)}));
  return{type:'multi',key:`${m}ct${c.rt}${x.s}`,text:`On the ${SN[x.s]} string, ${c.rt} ${nmx} starts at the marked root. Click the other three notes of ${chordSym(c.rt,ch.q)} (the chord this mode fits).`,marks:[{s:x.s,f:x.r,t:'R',k:'root'}],targets:tg,notes:[midi(x.s,x.r),...tg.map(p=>midi(p.s,p.f))],pm:'chord',hint:`${chordSym(c.rt,ch.q)} = ${CHORDS[ch.q].f.replace(/b/g,'♭')}: which scale degrees are those?`,explain:`${chordSym(c.rt,ch.q)} = ${cn.join(' ')}: degrees 3, 5 and 7 of ${nmx}. Frets: ${tg.map(p=>p.f).join(', ')}.`}}throw new Error('chordTones')};
 const nameNote=()=>{for(let n=0;n<600;n++){const c=mctx(m),s=R(0,5),f=rootFret(c.rt,s,1),s2=R(0,5),t=R(Math.max(0,f-4),Math.min(15,f+4));if(f<1||f>11||(s2===s&&t===f))continue;const pc=pcAt(s2,t),j=pcsOfMode(c.rt,m).indexOf(pc);if(j<1)continue;const a=c.sc[j];
  const pool=[sharpOf(a),flatOf(a),...c.sc,spellScale(c.rt)[j]].filter(x=>x&&!odd([x]));
  return{type:'choice',key:`${m}nn${c.rt}${s2}${t}`,text:`The marked root is the tonic of ${c.rt} ${nmx}. Which note of the mode is the ?`,marks:[{s,f,t:'R',k:'root'},{s:s2,f:t,t:'?',k:'q'}],notes:[midi(s,f),midi(s2,t)],ans:a,choices:mc(a,pool),hint:`Measure from the root, then spell ${c.rt} ${nmx}.`,explain:`${modeCard(c.rt,m)}. The ? is degree ${j+1}${dlN(m,j+1)!==String(j+1)?` (${dlN(m,j+1)})`:''}: ${a}.`}}throw new Error('nameNote')};
 const lessonEx=[['Formula & parent',[bank,spell,parent]],['Sound & chord',[chord,chordTones,char]],['On the neck',[string,boxMark,parentRoot,nameNote]]];
 const test=[...rep(bank,2),...rep(spell,2),...rep(parent,2),chord,...rep(string,2),...rep(char,2),parentRoot,boxMark,chordTones,nameNote];
 return{bank,spell,parent,chord,string,char,parentRoot,boxMark,chordTones,nameNote,ex:lessonEx,test,fin:[spell,chord,string,char,boxMark]}}
const modeNotes=(m,extra)=>{const i=MI(m),ch=MCH[m];return `<div class="cols"><div><h3>${MN(m)} at a glance</h3><table class="stack"><thead><tr><th></th><th></th></tr></thead><tbody><tr><td>Formula</td><td>${fmlTxt(m)}</td></tr><tr><td>Starts on</td><td>${ord(i+1)} degree of the major scale</td></tr><tr><td>Characteristic note</td><td>${ch.lbl}</td></tr><tr><td>Chord</td><td>${qn(ch.q)} (${ch.q==='dom7'?'7':CHORDS[ch.q].sym})</td></tr></tbody></table>
 <div class="scroll"><table><thead><tr><th>Parent</th><th>Mode</th><th>Notes</th></tr></thead><tbody>${['C','G','D','F','B♭'].map(P=>{const rt=spellScale(P)[i];return`<tr><td>${P} major</td><td>${rt} ${MN(m)}</td><td>${scaleNotes(rt,m).join(' ')}</td></tr>`}).join('')}</tbody></table></div></div>
 <div><h3>Key ideas</h3><ul>${extra.ideas.map(x=>`<li>${x}</li>`).join('')}</ul><h3 style="margin-top:22px">On your guitar</h3><ul>${extra.gtr.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`};
/* ---- family lessons ---- */
function mkFam(ms,pairs,spec,items,chordSpecial){const QS=['maj7','dom7','m7','m7b5'],names=ms.map(MN);
 const bank=sbank('fb'+ms[0].slice(0,2),items);
 const spell=()=>{const m=pick(ms),c=mctx(m),alt=[2,3,4,5,6,7].filter(d=>FSEM(m)[d-1]!==MAJ[d-1]),d=alt.length&&Math.random()<.7?pick(alt):R(2,7),a=c.sc[d-1];
  const pool=[sharpOf(a),flatOf(a),...ms.map(x=>scaleNotes(c.rt,x)[d-1]),c.sc[d%7]].filter(x=>x&&!odd([x]));
  return{type:'choice',noBoard:true,key:`fs${m}${c.rt}${d}`,text:`What is the ${ord(d)} note of ${c.rt} ${MN(m)}?`,ans:a,choices:mc(a,pool),hint:`${MN(m)} = ${fmlTxt(m)}.`,explain:`${modeCard(c.rt,m)}. Degree ${d}${dlN(m,d)!==String(d)?` (${dlN(m,d)})`:''} is ${a}.`}};
 const okR=KEASY.filter(k=>ms.every(m=>!odd(scaleNotes(k,m)))),chordMode=()=>{const rt=pick(okR);
  if(Math.random()<.4){const sp=chordSpecial,cn=chordNotes(rt,sp.q),ans=MN(sp.m);return{type:'choice',noBoard:true,key:`fc${rt}${sp.q}`,text:`Which of these modes fits ${chordSym(rt,sp.q)} (${qn(sp.q)})?`,ans,choices:mc(ans,names),hint:`Spell ${chordSym(rt,sp.q)} and see which mode contains all its notes.`,explain:`${chordSym(rt,sp.q)} = ${cn.join(' ')}. ${modeCard(rt,sp.m)} contains them all; ${sp.why}`}}
  for(let n=0;n<100;n++){const m=pick(ms),q=MCH[m].q,ans=chordSym(rt,q);return{type:'choice',noBoard:true,key:`fd${m}${rt}`,text:`Which chord fits ${rt} ${MN(m)} best?`,ans,choices:mc(ans,QS.map(x=>chordSym(rt,x))),hint:`Stack 3rds on the mode: degrees 1 3 5 7.`,explain:`${modeCard(rt,m)}. Degrees 1 3 5 7 = ${chordNotes(rt,q).join(' ')}: ${ans}.`}}};
 const string=()=>{for(let n=0;n<200;n++){const m=pick(ms),c=mctx(m),x=strCtx(c.rt);if(!x)continue;const tg=strPos(c.rt,m,x.s,x.r).slice(1);
  return{type:'multi',key:`fp${m}${c.rt}${x.s}`,text:`Play ${c.rt} ${MN(m)} up the ${SN[x.s]} string. The root is marked: click every note up to the octave.`,marks:[{s:x.s,f:x.r,t:'R',k:'root'}],targets:tg.map(p=>({s:p.s,f:p.f,t:p.t==='R'?'8':p.t})),notes:[midi(x.s,x.r),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`${MN(m)} = ${fmlTxt(m)}.`,explain:`${modeCard(c.rt,m)}. Frets: ${[x.r,...tg.map(p=>p.f)].join(', ')}.`}}throw new Error('fam string')};
 const oneNote=()=>{for(let n=0;n<800;n++){const[hi,lo,d]=pick(pairs),rt=pick(KEASY),a=scaleNotes(rt,hi),b=scaleNotes(rt,lo);if(odd(a)||odd(b))continue;const s=R(0,5),f=rootFret(rt,s,1),s2=R(0,5);if(f<1||f>11)continue;
  const pc=(pcOf(rt)+FSEM(lo)[d-1])%12,cand=nearPc(pc,s2,f,5,5);if(cand.length!==1)continue;
  return{type:'click',key:`fo${rt}${lo}${s}${s2}`,text:`${rt} ${MN(hi)} turns into ${rt} ${MN(lo)} by changing exactly one note. The root is marked. Click the new note on the ${SN[s2]} string, within 5 frets.`,marks:[{s,f,t:'R',k:'root'}],target:{s:s2,f:cand[0].f,t:dl(lo,d)},notes:[midi(s,f),midi(s2,cand[0].f)],hint:`Compare ${fmlTxt(hi)} with ${fmlTxt(lo)}: one number differs.`,explain:`${rt} ${MN(hi)}: ${a.join(' ')}. ${rt} ${MN(lo)}: ${b.join(' ')}. Only degree ${d} changes: ${a[d-1]} → ${b[d-1]} (${dl(lo,d)}). It is on the ${SN[s2]} string, ${fretTxt(cand[0].f)}.`}}throw new Error('fam one')};
 const chordTones=()=>{for(let n=0;n<200;n++){const m=pick(ms),c=mctx(m),x=strCtx(c.rt),q=MCH[m].q;if(!x)continue;const cn=chordNotes(c.rt,q),tg=[3,5,7].map(d=>({s:x.s,f:x.r+FSEM(m)[d-1],t:dl(m,d)}));
  return{type:'multi',key:`fz${m}${c.rt}${x.s}`,text:`On the ${SN[x.s]} string, ${c.rt} ${MN(m)} starts at the marked root. Click the other three notes of ${chordSym(c.rt,q)}, the chord this mode fits.`,marks:[{s:x.s,f:x.r,t:'R',k:'root'}],targets:tg,notes:[midi(x.s,x.r),...tg.map(p=>midi(p.s,p.f))],pm:'chord',hint:`${chordSym(c.rt,q)} = ${CHORDS[q].f.replace(/b/g,'♭')}: which scale degrees are those?`,explain:`${chordSym(c.rt,q)} = ${cn.join(' ')}: degrees 3, 5 and 7 of ${MN(m)}. Frets: ${tg.map(p=>p.f).join(', ')}.`}}throw new Error('fam ct')};
 const nameBoard=()=>{for(let n=0;n<200;n++){const m=pick(ms),c=pctx(m),x=strCtx(c.rt);if(!x)continue;const ps=strPos(c.rt,m,x.s,x.r).slice(0,7);
  return{type:'choice',key:`fn${m}${c.rt}${x.s}`,text:`The marked notes are a mode played from its root along the ${SN[x.s]} string, labelled by degree. Which mode is it?`,marks:ps.map(p=>({s:p.s,f:p.f,t:p.t,k:p.j===0?'root':'ghost'})),notes:ps.map(p=>midi(p.s,p.f)),pm:'seq',ans:MN(m),choices:mc(MN(m),names),hint:'Which degrees are flattened or sharpened compared with a major scale?',explain:`The degrees ${fmlTxt(m)} identify ${MN(m)}.`}}throw new Error('fam nb')};
 const box=()=>{for(let n=0;n<600;n++){const m=pick(ms),c=mctx(m),a=R(0,4),lo=R(0,10),hi=lo+4,b=boxSet(c.rt,m,[a,a+1],lo,hi);if(b.rest.length<3||b.rest.length>8)continue;
  return{type:'multi',key:`fx${m}${c.rt}${a}${lo}`,box:[lo,hi],text:`Mark ${c.rt} ${MN(m)} on the ${SN[a]} and ${SN[a+1]} strings: the roots are marked. Click every other note of the mode inside the shaded frets ${lo}–${hi}.`,marks:b.roots.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:b.rest.map(p=>({s:p.s,f:p.f,t:p.t})),notes:[...b.roots,...b.rest].sort((x,y)=>midi(x.s,x.f)-midi(y.s,y.f)).map(p=>midi(p.s,p.f)),hint:`The notes are ${c.sc.join(' ')}.`,explain:`${modeCard(c.rt,m)}. In frets ${lo}–${hi}: ${b.rest.map(p=>`${p.name} (${SN[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}throw new Error('fam box')};
 return{bank,spell,chordMode,string,oneNote,chordTones,nameBoard,box,
  ex:[['Compare the modes',[bank,nameBoard,oneNote]],['Spell & chords',[spell,chordMode,chordTones]],['On the neck',[string,box]]],
  test:[...rep(bank,3),...rep(spell,2),...rep(chordMode,2),...rep(string,2),...rep(oneNote,2),chordTones,...rep(nameBoard,2),box],
  fin:[bank,spell,chordMode,string,oneNote,nameBoard,box,chordTones,spell,string]}}
const famTable=ms=>`<div class="scroll"><table><thead><tr><th>Mode</th><th>Formula</th><th>Chord</th><th>Notes on C</th></tr></thead><tbody>${ms.map(m=>`<tr><td>${MN(m)}</td><td>${fmlTxt(m)}</td><td>${chordSym('C',MCH[m].q)}</td><td>${scaleNotes('C',m).join(' ')}</td></tr>`).join('')}</tbody></table></div>`;
const MX=mkMode('mixolydian',[
 ['Which formula does the Mixolydian mode follow?','1 2 3 4 5 6 ♭7',['1 2 3 ♯4 5 6 7','1 2 ♭3 4 5 6 ♭7','1 2 3 4 5 6 7'],'Mixolydian is major with a lowered 7th.'],
 ['What is the characteristic note of Mixolydian?','The ♭7',['The ♯4','The ♭3','The ♭2'],'The ♭7 separates it from Ionian’s major 7th.'],
 ['Which chord does Mixolydian fit?','Dominant 7th (for example G7)',['Major 7th','Minor 7th','Half-diminished'],'1 3 5 ♭7 is a dominant 7th chord.'],
 ['G Mixolydian uses the notes of which major scale?','C major',['G major','D major','F major'],'G is the 5th degree of C major.'],
 ['Compared with the major scale from the same root, Mixolydian has…','one lowered note: the 7th',['one raised note: the 4th','a lowered 3rd','no differences'],'G major has F♯; G Mixolydian has F.']]);
const AE=mkMode('aeolian',[
 ['Which formula does the Aeolian mode follow?','1 2 ♭3 4 5 ♭6 ♭7',['1 2 ♭3 4 5 6 ♭7','1 ♭2 ♭3 4 5 ♭6 ♭7','1 2 3 4 5 ♭6 ♭7'],'Aeolian is the natural minor scale.'],
 ['What is the characteristic note of Aeolian?','The ♭6',['The natural 6th','The ♭2','The ♯4'],'The ♭6 separates it from Dorian’s natural 6th.'],
 ['Which chord does Aeolian fit?','Minor 7th (for example Am7)',['Major 7th','Dominant 7th','Half-diminished'],'1 ♭3 5 ♭7.'],
 ['A Aeolian uses the notes of which major scale?','C major',['A major','G major','E major'],'A is the 6th degree of C major, so A Aeolian is C major’s relative minor.'],
 ['Aeolian is also known as…','the natural minor scale',['the harmonic minor scale','the melodic minor scale','the minor pentatonic scale'],'Natural minor = the 6th mode of the major scale.']]);
const LO=mkMode('locrian',[
 ['Which formula does the Locrian mode follow?','1 ♭2 ♭3 4 ♭5 ♭6 ♭7',['1 ♭2 ♭3 4 5 ♭6 ♭7','1 2 ♭3 4 ♭5 ♭6 ♭7','1 ♭2 3 4 ♭5 ♭6 ♭7'],'Locrian is Phrygian with a lowered 5th.'],
 ['What is the characteristic note of Locrian?','The ♭5',['The ♯4','The natural 6th','The ♭7'],'The ♭5 (with the ♭2) makes its tonic chord diminished.'],
 ['Which chord does Locrian fit?','Half-diminished (for example Bm7♭5)',['Minor 7th','Dominant 7th','Major 7th'],'1 ♭3 ♭5 ♭7.'],
 ['B Locrian uses the notes of which major scale?','C major',['B major','A major','G major'],'B is the 7th degree of C major.'],
 ['Why is Locrian rarely used as a home key?','Its tonic chord is diminished, so it is unstable',['It has too many sharps','It has no ♭3','It has no half steps'],'The ♭5 above the root gives a diminished triad.']]);
const MAJF=mkFam(['ionian','lydian','mixolydian'],[['lydian','ionian',4],['ionian','mixolydian',7]],null,[
 ['Which three modes are the major modes?','Ionian, Lydian and Mixolydian',['Dorian, Phrygian and Aeolian','Ionian, Dorian and Lydian','Lydian, Mixolydian and Locrian'],'All three have a major 3rd above the root.'],
 ['Which major mode has a ♯4?','Lydian',['Ionian','Mixolydian'],'1 2 3 ♯4 5 6 7.'],
 ['Which major mode has a ♭7?','Mixolydian',['Ionian','Lydian'],'1 2 3 4 5 6 ♭7.'],
 ['Which major mode has both a natural 4th and a major 7th?','Ionian',['Lydian','Mixolydian'],'It is the plain major scale.'],
 ['Which major mode is the brightest?','Lydian',['Ionian','Mixolydian'],'Brightness: Lydian, Ionian, Mixolydian.'],
 ['Which two major modes fit major 7th chords?','Ionian and Lydian',['Ionian and Mixolydian','Lydian and Mixolydian','Mixolydian only'],'Both have 1 3 5 7. Mixolydian’s ♭7 makes a dominant 7th instead.'],
 ['C Ionian, G Mixolydian and F Lydian have what in common?','They all use the notes of C major',['They share the same root','They all have a ♭7','They all have a ♯4'],'F, C and G are degrees 4, 1 and 5 of C major.'],
 ['Going from Lydian to Ionian to Mixolydian, each step…','flattens one note (♯4 → 4, then 7 → ♭7)',['sharpens one note','changes the root','adds a sharp to every note'],'Neighbouring major modes differ by one note.']],{m:'mixolydian',q:'dom7',why:'Ionian and Lydian have a major 7th that would clash with the ♭7 of the chord.'});
const MINF=mkFam(['dorian','phrygian','aeolian','locrian'],[['dorian','aeolian',6],['aeolian','phrygian',2],['phrygian','locrian',5]],null,[
 ['Which three modes are the minor modes?','Dorian, Phrygian and Aeolian',['Ionian, Lydian and Mixolydian','Dorian, Lydian and Aeolian','Phrygian, Aeolian and Locrian'],'All three have a ♭3 above the root and a 5th.'],
 ['Which minor mode has a natural 6th?','Dorian',['Phrygian','Aeolian'],'1 2 ♭3 4 5 6 ♭7.'],
 ['Which minor mode has a ♭2?','Phrygian',['Dorian','Aeolian'],'1 ♭2 ♭3 4 5 ♭6 ♭7.'],
 ['Which minor mode is the natural minor scale?','Aeolian',['Dorian','Phrygian'],'1 2 ♭3 4 5 ♭6 ♭7.'],
 ['Which minor mode is the brightest?','Dorian',['Phrygian','Aeolian'],'Order: Dorian, Aeolian, Phrygian.'],
 ['Which minor mode is the darkest?','Phrygian',['Dorian','Aeolian'],'Phrygian’s ♭2 and ♭6 make it the darkest of the three.'],
 ['Why is Locrian not counted among the minor modes?','Its ♭5 makes the tonic chord diminished, not minor',['It has a major 3rd','It has no ♭7','It is a major mode'],'Locrian: 1 ♭2 ♭3 4 ♭5 ♭6 ♭7, a diminished-type mode (m7♭5).'],
 ['Which chord does Locrian fit?','Half-diminished (m7♭5)',['Minor 7th','Dominant 7th','Major 7th'],'1 ♭3 ♭5 ♭7.']],{m:'locrian',q:'m7b5',why:'a minor 7th chord’s natural 5th would clash with the ♭5 Locrian already has.'});
const LS={
 mix:{h:'mixolydian',n:'Lesson 76',title:'Major scale modes: Mixolydian',sub:'The 5th mode: major with a ♭7.',ex:MX.ex,test:MX.test},
 aeo:{h:'aeolian',n:'Lesson 77',title:'Major scale modes: Aeolian',sub:'The 6th mode: the natural minor scale.',ex:AE.ex,test:AE.test},
 loc:{h:'locrian',n:'Lesson 78',title:'Major scale modes: Locrian',sub:'The 7th mode: the diminished-sounding mode.',ex:LO.ex,test:LO.test},
 maj:{h:'major-modes',n:'Lesson 79',title:'Major modes',sub:'Ionian, Lydian and Mixolydian compared.',ex:MAJF.ex,test:MAJF.test},
 min:{h:'minor-modes',n:'Lesson 80',title:'Minor modes',sub:'Dorian, Phrygian and Aeolian compared; Locrian as diminished.',ex:MINF.ex,test:MINF.test},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 76–80 mixed.',
  ex:[['Lessons 76–78',[...MX.fin.slice(0,4),...AE.fin.slice(0,4),...LO.fin.slice(0,4)]],['Lessons 79–80',[...MAJF.fin.slice(0,4),...MINF.fin.slice(0,4)]]],
  test:[...MX.fin.slice(0,4),...AE.fin.slice(0,4),...LO.fin.slice(0,4),MAJF.spell,MAJF.chordMode,MAJF.string,MAJF.oneNote,MINF.nameBoard,MINF.chordMode,MINF.string,MINF.box]}};
const ORDER=['mix','aeo','loc','maj','min','final'],STORE='gi-best-p19';
const NOTES={
 mix:modeNotes('mixolydian',{ideas:['Mixolydian: 1 2 3 4 5 6 ♭7, major with a lowered 7th.','It fits dominant 7th chords (G7).','Parent = the major key a perfect 5th below the root (a perfect 4th above).','Major scale from the same root with one flat added.'],gtr:['Play G Mixolydian using the notes of C major; stress the F.','Compare G major (F♯) with G Mixolydian (F).','Play the mode over a G7 chord.']}),
 aeo:modeNotes('aeolian',{ideas:['Aeolian: 1 2 ♭3 4 5 ♭6 ♭7, the natural minor scale.','It fits minor 7th chords (Am7).','Parent = the major key a minor 3rd above the root: the relative major.','The ♭6 separates it from Dorian.'],gtr:['Play A Aeolian using the notes of C major.','Compare A Dorian (F♯) with A Aeolian (F).','Find the ♭6 a half step above each 5th.']}),
 loc:modeNotes('locrian',{ideas:['Locrian: 1 ♭2 ♭3 4 ♭5 ♭6 ♭7, the darkest mode.','It fits half-diminished chords (Bm7♭5): the tonic chord is diminished.','Parent = the major key a half step above the root.','Because its tonic is unstable it is used on a single chord rather than as a key.'],gtr:['Play B Locrian using the notes of C major.','Compare B Phrygian with B Locrian: only the ♭5 differs.','Arpeggiate Bm7♭5 inside the mode.']}),
 maj:`<div class="cols"><div><h3>The major modes</h3>${famTable(['ionian','lydian','mixolydian'])}<p class="small">Assumption: “major modes” are the modes with a major 3rd: Ionian, Lydian and Mixolydian.</p></div>
  <div><h3>Key ideas</h3><ul><li>All three have a major 3rd and a perfect 5th above the root.</li><li>They differ in one note each step: ♯4 (Lydian), natural 4 and 7 (Ionian), ♭7 (Mixolydian).</li><li>Chords: maj7 for Ionian and Lydian, dominant 7th for Mixolydian.</li></ul><h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C Lydian, C Ionian and C Mixolydian from one root, moving one fret each time.</li><li>Pick out the one note that changes.</li><li>Play each mode over its chord.</li></ul></div></div>`,
 min:`<div class="cols"><div><h3>The minor modes (and Locrian)</h3>${famTable(['dorian','aeolian','phrygian','locrian'])}<p class="small">Assumption: the minor modes are Dorian, Aeolian and Phrygian (minor 3rd and perfect 5th). Locrian has a ♭5, so its tonic chord is diminished.</p></div>
  <div><h3>Key ideas</h3><ul><li>All three minor modes have ♭3 and a perfect 5th.</li><li>Dorian has the natural 6th; Aeolian ♭6; Phrygian adds the ♭2.</li><li>Order from brightest to darkest: Dorian, Aeolian, Phrygian, then Locrian.</li><li>Locrian fits m7♭5.</li></ul><h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A Dorian, A Aeolian and A Phrygian from one root; move one fret each time.</li><li>Play Bm7♭5 and the B Locrian notes.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 76–80: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 81 begins the next part of the course.</p></div></div>`};
