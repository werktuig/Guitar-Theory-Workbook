/* ===== Part 18: lessons 72–75 ===== */
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
const IO=mkMode('ionian',[
 ['Which formula does the Ionian mode follow?','1 2 3 4 5 6 7',['1 2 ♭3 4 5 6 ♭7','1 2 3 ♯4 5 6 7','1 2 3 4 5 6 ♭7'],'Ionian is the major scale itself: W W H W W W H.'],
 ['On which degree of the major scale does Ionian start?','The 1st',['The 2nd','The 6th','The 4th'],'Mode 1 is the parent scale played from its own root.'],
 ['Which chord does Ionian fit?','Major 7th (for example Cmaj7)',['Dominant 7th','Minor 7th','Half-diminished'],'1 3 5 7 of the major scale is a major 7th chord.'],
 ['Which note do you avoid holding on a major chord in Ionian, because it clashes with the 3rd?','The 4th',['The 5th','The 6th','The 7th'],'The natural 4th sits a half step above the major 3rd; Lydian’s ♯4 avoids this.'],
 ['What is the parent key of C Ionian?','C major',['A major','F major','G major'],'Ionian has the same root as its parent: it is the major key.']]);
const DO=mkMode('dorian',[
 ['Which formula does the Dorian mode follow?','1 2 ♭3 4 5 6 ♭7',['1 2 ♭3 4 5 ♭6 ♭7','1 2 3 4 5 6 ♭7','1 ♭2 ♭3 4 5 ♭6 ♭7'],'Dorian is minor with a natural 6th.'],
 ['What is the characteristic note of Dorian?','The natural 6th',['The ♭2','The ♯4','The ♭6'],'The natural 6th sets it apart from Aeolian (natural minor), which has ♭6.'],
 ['Which chord does Dorian fit?','Minor 7th (for example Dm7)',['Major 7th','Dominant 7th','Half-diminished'],'1 ♭3 5 ♭7: Dm7 in D Dorian.'],
 ['D Dorian uses the notes of which major scale?','C major',['D major','F major','G major'],'D is the 2nd degree of C major.'],
 ['Compared with natural minor (Aeolian), Dorian has…','a raised (natural) 6th',['a lowered 2nd','a raised 4th','a lowered 5th'],'A Dorian = A natural minor with F♯ instead of F.']]);
const PH=mkMode('phrygian',[
 ['Which formula does the Phrygian mode follow?','1 ♭2 ♭3 4 5 ♭6 ♭7',['1 2 ♭3 4 5 ♭6 ♭7','1 ♭2 ♭3 4 ♭5 ♭6 ♭7','1 2 ♭3 4 5 6 ♭7'],'Phrygian is natural minor with a lowered 2nd.'],
 ['What is the characteristic note of Phrygian?','The ♭2',['The natural 6th','The ♯4','The ♭5'],'The half step above the root gives Phrygian its dark, Spanish-flavoured sound.'],
 ['Which chord does Phrygian fit?','Minor 7th (for example Em7)',['Major 7th','Dominant 7th','Half-diminished'],'1 ♭3 5 ♭7. The ♭2 is its colour note.'],
 ['E Phrygian uses the notes of which major scale?','C major',['E major','G major','D major'],'E is the 3rd degree of C major.'],
 ['Compared with natural minor (Aeolian), Phrygian has…','a lowered 2nd',['a raised 6th','a raised 4th','a lowered 5th'],'E Aeolian has F♯; E Phrygian has F.']]);
const LY=mkMode('lydian',[
 ['Which formula does the Lydian mode follow?','1 2 3 ♯4 5 6 7',['1 2 3 4 5 6 7','1 2 3 4 5 6 ♭7','1 2 ♭3 ♯4 5 6 7'],'Lydian is major with a raised 4th.'],
 ['What is the characteristic note of Lydian?','The ♯4',['The ♭7','The ♭2','The natural 6th'],'The ♯4 is a tritone above the root and gives the “floating” sound.'],
 ['Which chord does Lydian fit?','Major 7th (for example Fmaj7)',['Dominant 7th','Minor 7th','Half-diminished'],'1 3 5 7; the ♯4 appears as ♯11 when you extend it.'],
 ['F Lydian uses the notes of which major scale?','C major',['F major','G major','B♭ major'],'F is the 4th degree of C major.'],
 ['Compared with the major scale from the same root, Lydian has…','one raised note: the 4th',['one lowered note: the 7th','two lowered notes','no differences'],'F major has B♭; F Lydian has B natural.']]);
const LS={
 io:{h:'ionian',n:'Lesson 72',title:'Major scale modes: Ionian',sub:'The 1st mode: the major scale itself.',ex:IO.ex,test:IO.test},
 dor:{h:'dorian',n:'Lesson 73',title:'Major scale modes: Dorian',sub:'The 2nd mode: minor with a natural 6th.',ex:DO.ex,test:DO.test},
 phr:{h:'phrygian',n:'Lesson 74',title:'Major scale modes: Phrygian',sub:'The 3rd mode: minor with a ♭2.',ex:PH.ex,test:PH.test},
 lyd:{h:'lydian',n:'Lesson 75',title:'Major scale modes: Lydian',sub:'The 4th mode: major with a ♯4.',ex:LY.ex,test:LY.test},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 72–75 mixed.',
  ex:[['Ionian & Dorian',[...IO.fin,...DO.fin]],['Phrygian & Lydian',[...PH.fin,...LY.fin]]],
  test:[...IO.fin,...DO.fin,...PH.fin,...LY.fin]}};
const ORDER=['io','dor','phr','lyd','final'],STORE='gi-best-p18';
const NOTES={
 io:modeNotes('ionian',{ideas:['Ionian is the major scale: the 1st mode, formula 1 2 3 4 5 6 7.','Its chord is the major 7th (1 3 5 7); the parent key has the same name as the root.','Its relative minor is the 6th degree: the same notes as Aeolian.','The natural 4th is the note to treat with care over a major chord.'],gtr:['Play C Ionian up one string, then land on Cmaj7.','Find the relative minor root a minor 3rd below and play the same notes from there.','Play the mode in a box from a 6th-string root.']})+'<p class="small">Ionian is taught here as the major scale; characteristic note: its major 7th, versus Mixolydian’s ♭7.</p>',
 dor:modeNotes('dorian',{ideas:['Dorian: 1 2 ♭3 4 5 6 ♭7, minor with a natural 6th.','It fits minor 7th chords (Dm7).','Parent = the major key a whole step below the root.','Aeolian with the 6th raised a fret.'],gtr:['Play D Dorian using the notes of C major.','Play A Aeolian, then raise the 6th (F → F♯) to hear Dorian.','Click the natural 6th above a minor root in several places.']}),
 phr:modeNotes('phrygian',{ideas:['Phrygian: 1 ♭2 ♭3 4 5 ♭6 ♭7.','The ♭2 is a half step above the root: the characteristic note.','It fits minor 7th chords (Em7).','Parent = the major key a major 3rd below the root.'],gtr:['Play E Phrygian using the notes of C major; stress the F.','Compare E Aeolian (F♯) with E Phrygian (F).','Find the ♭2 one fret above each root.']}),
 lyd:modeNotes('lydian',{ideas:['Lydian: 1 2 3 ♯4 5 6 7, major with a raised 4th.','It fits major 7th chords (Fmaj7); the ♯4 is the colour note.','Parent = the major key a perfect 4th below the root (a perfect 5th above).','The brightest mode.'],gtr:['Play F Lydian using the notes of C major; stress the B.','Compare F major (B♭) with F Lydian (B).','Find the ♯4 a tritone above the root.']}),
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 72–75: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 76: Major Scale Modes (Mixolydian).</p></div></div>`};
