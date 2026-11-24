const hPath=(rs,rf,s2,tf)=>{const D=midi(s2,tf)-midi(rs,rf),g=OPEN[s2]-OPEN[rs],n=x=>x<0?'−'+(-x):String(x);return`${(D>=0&&D<12)?'':`On the ${SN[s2]} string the nearest one sounds ${Math.abs(D)} semitones ${D>=0?'above':'below'} the marked note (same note name, different octave). `}The ${SN[rs]}→${SN[s2]} string gap is ${n(g)} semitones, so ${n(D)} − (${n(g)}) = ${n(tf-rf)}: ${hRel(tf-rf)}, fret ${tf}.`};
/* ===== helpers shared by parts 23-25 (prefix h) ===== */
const hNice=n=>n.length<=2&&!/^(E♯|B♯|C♭|F♭)$/.test(n);
const hOk=a=>a.every(hNice);
const hTokN=t=>t.replace(/^bb/,'♭♭').replace(/^b/,'♭').replace(/^#/,'♯').replace(/^x/,'𝄪');
const hTok=t=>t==='1'?'R':hTokN(t);
const HR=['C','D','E','F','G','A','B','F♯','C♯','G♯','D♯','A♯','B♭','E♭','A♭','D♭','G♭'];
const hTry=fn=>{for(let i=0;i<800;i++){const q=fn();if(q)return q}throw new Error('generator failed: '+fn)};
const hRoot=test=>{for(let i=0;i<500;i++){const r=pick(HR);if(test(r))return r}throw new Error('no root')};
const hFrets=(s,pc,lo=0,hi=15)=>{const o=[];for(let f=lo;f<=hi;f++)if(pcAt(s,f)===pc)o.push(f);return o};
const hNearF=(s,pc,f0)=>{const c=hFrets(s,pc);return c.length?c.sort((a,b)=>Math.abs(a-f0)-Math.abs(b-f0))[0]:-1};
/* click target `off` semitones above the note at (rs,rf), on one of strs; the pitch class must occur only once on that string */
function hClickT(rs,rf,off,strs){const o=[];for(const s of strs){const c=hFrets(s,(pcAt(rs,rf)+off)%12);if(c.length===1&&Math.abs(c[0]-rf)<=5&&!(s===rs&&c[0]===rf))o.push({s,f:c[0]})}return o.length?pick(o):null}
const hNotes=p=>p.slice().sort((a,b)=>midi(a.s,a.f)-midi(b.s,b.f)).map(x=>midi(x.s,x.f));
function hPcs(items,strings,lo,hi){const o=[];for(const s of strings)for(let f=lo;f<=hi;f++){const it=items.find(i=>i.pc===pcAt(s,f));if(it)o.push({s,f,t:it.t,name:it.name,i:it.i})}return o}
const hFItems=(root,fm)=>{const tk=fm.split(' '),nn=spellF(root,fm),sm=fmlSemis(fm),rp=pcOf(root);return tk.map((t,i)=>({pc:(rp+sm[i])%12,t:hTok(t),name:nn[i],i}))};
const hFPos=(root,fm,st,lo,hi)=>hPcs(hFItems(root,fm),st,lo,hi);
/* a hand-sized box: nStr adjacent strings, one of them carrying a root of `root` */
function hBox(root,nStr,w){for(let i=0;i<400;i++){const a=R(0,6-nStr),st=[...Array(nStr)].map((_,j)=>a+j),rs=pick(st),rf=rootFret(root,rs,R(1,9));if(rf<1||rf>12)continue;const lo=Math.max(0,rf-R(0,w-1)),hi=lo+w;if(hi>15)continue;return{st,rs,rf,box:[lo,hi]}}
  const st=[...Array(nStr)].map((_,j)=>j),rf=rootFret(root,0,1),lo=Math.min(rf-1,15-w);return{st,rs:0,rf,box:[lo,lo+w]}}
const hMarks=(pts,rootPc)=>pts.map(p=>({s:p.s,f:p.f,t:p.t,k:pcAt(p.s,p.f)===rootPc?'root':'ghost'}));
const hPl=(w)=>w+'s';
const hStr=st=>st.length===1?`${SN[st[0]]} string`:st.length===2?`${SN[st[0]]} and ${SN[st[1]]} strings`:`${st.slice(0,-1).map(s=>SN[s]).join(', ')} and ${SN[st[st.length-1]]} strings`;
const hJoin=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const hSub=(a,k)=>{const o=[];const rec=(i,acc)=>{if(acc.length===k){o.push(acc.slice());return}for(let j=i;j<a.length;j++){acc.push(a[j]);rec(j+1,acc);acc.pop()}};rec(0,[]);return o};
const hSem=n=>n+' semitone'+(n===1?'':'s');
const hRel=d=>d===0?'on the same fret as the root':`${fr(Math.abs(d))} ${d>0?'higher':'lower'} than the root`;
const hG=(a,b)=>{const g=gap(a,b);return g<0?'−'+(-g):''+g};

/* ===== Part 25: lessons 99-103 ===== */
const MEL=['Melodic minor','Dorian ♭2','Lydian augmented','Lydian dominant','Mixolydian ♭6','Locrian ♮2','Altered'];
const MELF=['1 2 b3 4 5 6 7','1 b2 b3 4 5 6 b7','1 2 3 #4 #5 6 7','1 2 3 #4 5 6 b7','1 2 3 4 5 b6 b7','1 2 b3 4 b5 b6 b7','1 b2 b3 b4 b5 b6 b7'];
const HARM=['Harmonic minor','Locrian ♮6','Ionian ♯5','Dorian ♯4','Phrygian dominant','Lydian ♯2','Super Locrian ♭♭7'];
const HARMF=['1 2 b3 4 5 b6 7','1 b2 b3 4 b5 6 b7','1 2 3 4 #5 6 7','1 2 b3 #4 5 6 b7','1 b2 3 4 5 b6 b7','1 #2 3 #4 5 6 7','1 b2 b3 b4 b5 b6 bb7'];
const MMK={mel:{sc:'melMinor',nm:'melodic minor',MN:MEL,MF:MELF},harm:{sc:'harmMinor',nm:'harmonic minor',MN:HARM,MF:HARMF}};
const DWD={'2':'2nd','b3':'♭3rd','4':'4th','5':'5th','6':'6th','b6':'♭6th','7':'major 7th'};
const rot=(a,d)=>a.slice(d-1).concat(a.slice(0,d-1));
const mmCtx=k=>{const K=MMK[k];return hTry(()=>{const r=pick(HR),sc=scaleNotes(r,K.sc);if(!hOk(sc))return null;return{k,K,r,sc,d7:diatonic(r,K.sc,4),d3:diatonic(r,K.sc,3),toks:SCALES[K.sc].f.split(' ')}})};
const noDbl=a=>a.filter(t=>!/𝄪|𝄫/.test(t));
const mmModeCtx=k=>{const x=mmCtx(k),d=R(2,7),mr=rot(x.sc,d);return{...x,d,mr,mroot:mr[0],mname:x.K.MN[d-1],mf:x.K.MF[d-1],mtoks:x.K.MF[d-1].split(' ')}};

/* spell the scale */
const mkSpell=k=>()=>{const x=mmCtx(k),a=x.sc.join(' '),others=k==='mel'?['minor','harmMinor','dorian','major']:['minor','melMinor','dorian','major'],pool=noDbl(others.map(s=>scaleNotes(x.r,s).join(' ')));
  return{type:'choice',noBoard:true,key:`${k}sp${x.r}`,text:`Which notes make up the ${x.r} ${x.K.nm} scale?`,choices:mc(a,pool),ans:a,hint:`${x.r} ${x.K.nm} = ${x.toks.map(hTokN).join(' ')}. Compare it with ${x.r} major.`,
   explain:`${x.r} ${x.K.nm} (${x.toks.map(hTokN).join(' ')}) = ${a}.`}};
/* scale on two strings */
const mkBoard=k=>()=>hTry(()=>{const x=mmCtx(k),b=hBox(x.r,2,4),[lo,hi]=b.box,pts=hFPos(x.r,SCALES[x.K.sc].f,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<3||tg.length>8)return null;
  return{type:'multi',key:`${k}bd${x.r}${b.st[0]}${lo}`,box:b.box,text:`Play ${x.r} ${x.K.nm} on the ${hStr(b.st)}, frets ${lo}–${hi}. The roots are marked. Click every other scale note.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`${x.r} ${x.K.nm}: ${x.sc.join(' ')}.`,explain:`${x.r} ${x.K.nm} = ${x.sc.join(' ')}. In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
/* click a degree */
const mkClick=k=>()=>hTry(()=>{const x=mmCtx(k),t=pick(k==='mel'?['2','b3','4','6','7']:['2','b3','4','b6','7']),i=x.toks.indexOf(t),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;
  const off=fmlSemis(SCALES[x.K.sc].f)[i],s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),tt=hClickT(rs,rf,off,[s2]);if(!tt)return null;
  return{type:'click',key:`${k}ck${x.r}${t}${s2}`,text:`Root of ${x.r} ${x.K.nm} marked. Click its ${DWD[t]} (${x.sc[i]}) on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:tt.s,f:tt.f,t:hTokN(t)},notes:[midi(rs,rf),midi(tt.s,tt.f)],
   hint:`The ${DWD[t]} is ${hSem(off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,explain:`${x.sc[i]} is ${hSem(off)} above ${x.r}. ${hPath(rs,rf,s2,tt.f)}`}});
/* name a degree */
const mkDeg=k=>()=>hTry(()=>{const x=mmCtx(k),i=R(1,6),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),f2=hNearF(s2,pcOf(x.sc[i]),rf);if(f2<0||Math.abs(f2-rf)>5)return null;
  const a=hTokN(x.toks[i]);
  return{type:'choice',key:`${k}dg${x.r}${i}`,text:`${x.r} ${x.K.nm}: the root is marked R. The ? is a note of the scale. Which degree is it?`,marks:[{s:rs,f:rf,t:'R',k:'root'},{s:s2,f:f2,t:'?',k:'q'}],choices:mc(a,x.toks.slice(1).map(hTokN)),ans:a,notes:[midi(rs,rf),midi(s2,f2)],
   hint:'Count the semitones above the root and match them to the scale formula.',explain:`The ? is ${x.sc[i]}: ${hSem((pcOf(x.sc[i])-pcOf(x.r)+12)%12)} above ${x.r}, the ${a} of ${x.K.nm} (${x.toks.map(hTokN).join(' ')}).`}});
/* raised notes versus natural minor */
const mkRaised=k=>()=>hTry(()=>{const x=mmCtx(k),b=hBox(x.r,6,4),[lo,hi]=b.box,nat=hFPos(x.r,SCALES.minor.f,b.st,lo,hi),rp=pcOf(x.r),items=(k==='mel'?[{pc:(rp+9)%12,t:'6',name:x.sc[5],i:5},{pc:(rp+11)%12,t:'7',name:x.sc[6],i:6}]:[{pc:(rp+11)%12,t:'7',name:x.sc[6],i:6}]),tg=hPcs(items,b.st,lo,hi);
  if(tg.length<1||tg.length>8)return null;
  return{type:'multi',key:`${k}rs${x.r}${lo}`,box:b.box,text:`The marks show ${x.r} natural minor. ${k==='mel'?'Melodic':'Harmonic'} minor raises ${k==='mel'?'two notes':'one note'} of it. Click every raised note in the shaded frets ${lo}–${hi}.`,marks:nat.map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'ghost'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes([...nat,...tg]),pm:'seq',
   hint:`Natural minor is 1 2 ♭3 4 5 ♭6 ♭7. Compare it with ${x.K.nm}: ${x.toks.map(hTokN).join(' ')}.`,
   explain:k==='mel'?`${x.r} natural minor has ${spellF(x.r,'b6')[0]} and ${spellF(x.r,'b7')[0]}; melodic minor raises them to ${x.sc[5]} (6) and ${x.sc[6]} (7). In frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`:`${x.r} natural minor has ${spellF(x.r,'b7')[0]}; harmonic minor raises it to ${x.sc[6]} (7). In frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}});

/* ---------- Lesson 99: melodic minor ---------- */
const c99Spell=mkSpell('mel'),c99Board=mkBoard('mel'),c99Click=mkClick('mel'),c99Deg=mkDeg('mel'),c99Raised=mkRaised('mel');
const c99Lower=()=>{const r=hRoot(q=>hOk(spellScale(q))&&hOk(scaleNotes(q,'melMinor'))),maj=spellScale(r),mel=scaleNotes(r,'melMinor'),a=`${maj[2]} becomes ${mel[2]}`,
  flat=n=>n.endsWith('♯')?n[0]:n+'♭',pool=noDbl([1,3,4,5,6].map(i=>`${maj[i]} becomes ${flat(maj[i])}`)).filter(t=>!/ [CF]♭$/.test(t));
  return{type:'choice',noBoard:true,key:'c9l'+r,text:`Which single note of ${r} major must be lowered to get ${r} melodic minor?`,choices:mc(a,pool),ans:a,hint:`Compare ${r} major (1 2 3 4 5 6 7) with 1 2 ♭3 4 5 6 7.`,
   explain:`${r} major: ${maj.join(' ')}. ${r} melodic minor: ${mel.join(' ')}. Only the 3rd changes: ${maj[2]} → ${mel[2]}.`}};
const c99Bank=sbank('c9b',[
 ['What is the melodic minor formula used in this course (the jazz, or ascending, form)?','1 2 ♭3 4 5 6 7',['1 2 ♭3 4 5 ♭6 ♭7','1 2 ♭3 4 5 ♭6 7','1 2 3 4 5 6 7'],'Major scale with a ♭3, or natural minor with a raised 6th and 7th.'],
 ['Melodic minor is the major scale with which single change?','The 3rd is lowered',['The 7th is lowered','The 6th is lowered','The 2nd is lowered'],'1 2 3 4 5 6 7 → 1 2 ♭3 4 5 6 7.'],
 ['Compared with natural minor, melodic minor has a raised…','6th and 7th',['3rd and 7th','6th only','2nd and 4th'],'♭6 → ♮6 and ♭7 → ♮7.'],
 ['Between which degrees does melodic minor have half steps?','2–♭3 and 7–8',['3–4 and 7–8','5–♭6 and 7–8','4–5 and 6–7'],'1 W 2 H ♭3 W 4 W 5 W 6 W 7 H 8.'],
 ['Which 7th chord is built on the root of a melodic minor scale?','m(maj7)',['m7','maj7','m7♭5'],'1 ♭3 5 7: minor triad with a major 7th. In A: A C E G♯.'],
 ['Lowering the 7th of melodic minor by a half step gives which scale?','Dorian',['Natural minor','Harmonic minor','Phrygian'],'1 2 ♭3 4 5 6 7 → 1 2 ♭3 4 5 6 ♭7 is Dorian. Natural minor would also need a ♭6.']]);

/* ---------- Lesson 100: melodic minor chords and modes ---------- */
const mkChord=k=>()=>{const x=mmCtx(k),d=R(1,7),c=x.d7[d-1],pool=noDbl(['mMaj7','m7','augMaj7','dom7','m7b5','maj7','dim7'].map(q=>chordSym(c.root,q)));
  return{type:'choice',noBoard:true,key:`${k}ch${x.r}${d}`,text:`In ${x.r} ${x.K.nm}, which 7th chord is built on the ${ord(d)} degree (${c.root})?`,choices:mc(c.sym,pool),ans:c.sym,hint:`Stack 3rds from ${c.root} using only notes of ${x.r} ${x.K.nm} (${x.sc.join(' ')}).`,
   explain:`Notes of ${x.r} ${x.K.nm}: ${x.sc.join(' ')}. From ${c.root}, skip alternate notes: ${c.notes.join(' ')} = ${c.sym} (${c.roman}).`}};
const mkRoman=k=>()=>{const x=mmCtx(k),d=R(1,7),c=x.d7[d-1],pool=x.d7.map(y=>y.roman).filter(y=>y!==c.roman);
  return{type:'choice',noBoard:true,key:`${k}rm${x.r}${d}`,text:`In ${x.r} ${x.K.nm}, the chord on ${c.root} is ${c.sym}. Which Roman numeral labels it?`,choices:mc(c.roman,pool),ans:c.roman,hint:'Count the scale degree of the root, then use capitals for major-third chords and small letters for minor-third chords.',
   explain:`${c.root} is the ${ord(d)} degree of ${x.r} ${x.K.nm}, and the chord is ${c.sym}: ${c.roman}.`}};
const mkMode=k=>()=>{const x=mmModeCtx(k);return{type:'choice',noBoard:true,key:`${k}md${x.r}${x.d}`,text:`In ${x.r} ${x.K.nm} (${x.sc.join(' ')}), the mode that starts on the ${ord(x.d)} degree (${x.mroot}) is called…`,choices:mc(x.mname,x.K.MN.filter((_,i)=>i!==x.d-1)),ans:x.mname,
  hint:`Write the notes from ${x.mroot} and compare the formula with a major scale or natural minor.`,explain:`Starting on ${x.mroot}: ${x.mr.join(' ')} = ${x.mf.split(' ').map(hTokN).join(' ')}: ${x.mroot} ${x.mname}.`}};
const mkParent=k=>()=>{const x=mmModeCtx(k),a=`${x.r} ${x.K.nm}`,pool=x.sc.filter(n=>n!==x.r).map(n=>`${n} ${x.K.nm}`);
  return{type:'choice',noBoard:true,key:`${k}pa${x.r}${x.d}`,text:`${x.mroot} ${x.mname} is the ${ord(x.d)} mode of which ${x.K.nm} scale?`,choices:mc(a,pool),ans:a,hint:`Which scale has ${x.mroot} as its ${ord(x.d)} degree and contains the notes of this mode?`,
   explain:`${x.mroot} ${x.mname} = ${x.mr.join(' ')}. Those are the notes of ${a} (${x.sc.join(' ')}), and ${x.mroot} is its ${ord(x.d)} degree.`}};
const mkTones=k=>()=>hTry(()=>{const x=mmCtx(k),d=R(1,7),c=x.d7[d-1],b=hBox(c.root,4,4),[lo,hi]=b.box,pts=hFPos(c.root,CHORDS[c.q].f,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<2||tg.length>8)return null;
  return{type:'multi',key:`${k}tn${x.r}${d}${b.st[0]}${lo}`,box:b.box,text:`In ${x.r} ${x.K.nm}, the chord on the ${ord(d)} degree is ${c.sym}. Play its arpeggio on the ${hStr(b.st)}, frets ${lo}–${hi}: the roots are marked. Click every other chord tone.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`${c.sym} = ${CHORDS[c.q].f.split(' ').map(hTokN).join(' ')} from ${c.root}.`,explain:`${c.sym} = ${c.notes.join(' ')} (${c.roman} of ${x.r} ${x.K.nm}). In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const mkModeBoard=k=>()=>hTry(()=>{const x=mmModeCtx(k),sp=spellF(x.mroot,x.mf);if(sp.join()!==x.mr.join())return null;const b=hBox(x.mroot,2,4),[lo,hi]=b.box,pts=hFPos(x.mroot,x.mf,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<3||tg.length>8)return null;
  return{type:'multi',key:`${k}mb${x.r}${x.d}${b.st[0]}${lo}`,box:b.box,text:`Play ${x.mroot} ${x.mname} (the ${ord(x.d)} mode of ${x.r} ${x.K.nm}) on the ${hStr(b.st)}, frets ${lo}–${hi}. The roots are marked. Click every other scale note.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`Use the notes of ${x.r} ${x.K.nm} (${x.sc.join(' ')}), starting from ${x.mroot}.`,explain:`${x.mroot} ${x.mname} = ${x.mr.join(' ')}. In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const MELCK={2:['b2',1],3:['#5',8],4:['#4',6],5:['b6',8],6:['2',2]},HARMCK={2:['6',9],3:['#5',8],4:['#4',6],5:['3',4],6:['#2',3]};
const mkModeClick=k=>()=>hTry(()=>{const x=mmModeCtx(k),M=k==='mel'?MELCK:HARMCK;if(!M[x.d])return null;const [tok,off]=M[x.d],i=x.mtoks.indexOf(tok),rs=R(0,5),rf=rootFret(x.mroot,rs,R(2,9));if(i<0||rf<2||rf>11)return null;
  const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),tt=hClickT(rs,rf,off,[s2]);if(!tt)return null;const nmN=x.mr[i];
  return{type:'click',key:`${k}mc${x.r}${x.d}${s2}`,text:`Root of ${x.mroot} ${x.mname} marked. Click its ${hTokN(tok)} (${nmN}), a characteristic note of this mode, on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:tt.s,f:tt.f,t:hTokN(tok)},notes:[midi(rs,rf),midi(tt.s,tt.f)],
   hint:`The ${hTokN(tok)} is ${hSem(off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,explain:`${x.mroot} ${x.mname} = ${x.mr.join(' ')}. ${nmN} (${hTokN(tok)}) is ${hSem(off)} above ${x.mroot}. ${hPath(rs,rf,s2,tt.f)}`}});
const c100Chord=mkChord('mel'),c100Roman=mkRoman('mel'),c100Mode=mkMode('mel'),c100Parent=mkParent('mel'),c100Tones=mkTones('mel'),c100Board=mkModeBoard('mel'),c100Click=mkModeClick('mel');
const c100Bank=sbank('c10b',[
 ['Which 7th chords of melodic minor are dominant 7th chords?','IV7 and V7',['II7 and V7','III+maj7 and V7','V7 and VIIø7'],'In A melodic minor: D7 (IV) and E7 (V). The 3rd-degree chord is C+maj7.'],
 ['Which melodic minor mode is called the altered scale?','The 7th mode',['The 5th mode','The 4th mode','The 2nd mode'],'In A melodic minor it starts on G♯: G♯ A B C D E F♯, used over G♯7 (altered dominant).'],
 ['Which melodic minor mode is called Lydian dominant?','The 4th mode',['The 3rd mode','The 5th mode','The 6th mode'],'In A melodic minor it starts on D: D E F♯ G♯ A B C: a major scale with ♯4 and ♭7, played over D7.'],
 ['Which chord quality sits on the 3rd degree of melodic minor?','+maj7 (major 7th with augmented 5th)',['m7♭5','m7','7'],'In A melodic minor: C E G♯ B = C+maj7. Its scale is Lydian augmented.'],
 ['Which chord does Locrian ♮2 fit?','m7♭5',['m7','maj7','dim7'],'It is the 6th mode of melodic minor: the chord on the 6th degree is m7♭5.'],
 ['Which mode of melodic minor has a minor 3rd, a ♭9 and a natural 6th?','Dorian ♭2',['Locrian ♮2','Mixolydian ♭6','Lydian dominant'],'1 ♭2 ♭3 4 5 6 ♭7: Dorian with a ♭2, the 2nd mode.']]);

/* ---------- Lesson 101: harmonic minor ---------- */
const h101Spell=mkSpell('harm'),h101Board=mkBoard('harm'),h101Click=mkClick('harm'),h101Deg=mkDeg('harm'),h101Raised=mkRaised('harm');
const h101Raise=()=>{const r=hRoot(q=>hOk(scaleNotes(q,'minor'))&&hOk(scaleNotes(q,'harmMinor'))),nat=scaleNotes(r,'minor'),har=scaleNotes(r,'harmMinor'),a=`${nat[6]} becomes ${har[6]}`,
  up=n=>n.endsWith('♭')?n[0]:n+'♯',pool=noDbl([1,2,3,4,5].map(i=>`${nat[i]} becomes ${up(nat[i])}`));
  return{type:'choice',noBoard:true,key:'h1r'+r,text:`Which single note of ${r} natural minor is raised to get ${r} harmonic minor?`,choices:mc(a,pool),ans:a,hint:'Harmonic minor is natural minor 1 2 ♭3 4 5 ♭6 ♭7 with one note changed.',
   explain:`${r} natural minor: ${nat.join(' ')}. ${r} harmonic minor: ${har.join(' ')}. Only the 7th changes: ${nat[6]} → ${har[6]} (the leading tone).`}};
const h101Int=()=>{const r=hRoot(q=>hOk(scaleNotes(q,'harmMinor'))),h=scaleNotes(r,'harmMinor');
  return{type:'choice',noBoard:true,key:'h1i'+r,text:`In ${r} harmonic minor, how many semitones (frets) are there from the ♭6 (${h[5]}) up to the 7th (${h[6]})?`,choices:['1 semitone','2 semitones','3 semitones','4 semitones'],ans:'3 semitones',hint:'Count the frets on one string from the ♭6 to the 7th.',
   explain:`${h[5]} to ${h[6]} is 3 semitones: an augmented 2nd. It sounds like a minor 3rd but is spelled as a 2nd (like F to G♯ in A harmonic minor), because the notes are neighbouring letters.`}};
const h101Aug=()=>hTry(()=>{const r=hRoot(q=>hOk(scaleNotes(q,'harmMinor'))),h=scaleNotes(r,'harmMinor'),s=R(0,5),fs=hFrets(s,pcOf(h[5]),1,8);if(!fs.length)return null;const f=pick(fs),t=f+3;if(t<4||t>11)return null;
  return{type:'click',key:`h1a${r}${s}`,text:`${r} harmonic minor: the ♭6 (${h[5]}) is marked. Click the 7th (${h[6]}), the note an augmented 2nd above it, on the same string.`,marks:[{s,f,t:'♭6',k:'q'}],target:{s,f:t,t:'7'},notes:[midi(s,f),midi(s,t)],
   hint:'An augmented 2nd is one fret more than a whole step.',explain:`${h[5]} → ${h[6]} is an augmented 2nd: 3 semitones. On the same string that is 3 frets higher: fret ${t}.`}});
const h101Bank=sbank('h1b',[
 ['What is the harmonic minor formula?','1 2 ♭3 4 5 ♭6 7',['1 2 ♭3 4 5 6 7','1 2 ♭3 4 5 ♭6 ♭7','1 2 3 4 5 ♭6 7'],'Natural minor with a raised 7th.'],
 ['Which note is raised in harmonic minor compared with natural minor?','The 7th',['The 6th','The 3rd','The 5th'],'♭7 → ♮7: it gives a leading tone a half step below the tonic.'],
 ['Which interval in harmonic minor sounds like a minor 3rd but is spelled as a 2nd?','The augmented 2nd between ♭6 and 7',['The major 2nd between 1 and 2','The tritone between ♭3 and ♭6','The perfect 4th between 4 and 5'],'F to G♯ in A harmonic minor: 3 semitones.'],
 ['Why was the 7th raised in the first place?','To give the key a leading tone, so V is major',['To make the scale brighter overall','To avoid half steps','To remove the ♭6'],'With G♯ in A minor, the V chord is E (E G♯ B) and E7 pulls to Am.'],
 ['Which triad is built on the 5th degree of harmonic minor?','Major',['Minor','Diminished','Augmented'],'In A: E G♯ B. In natural minor it is Em.'],
 ['Which 7th chord is built on the root of harmonic minor?','m(maj7)',['m7','maj7','m7♭5'],'1 ♭3 5 7: in A: A C E G♯.']]);

/* ---------- Lesson 102: harmonic minor chords and modes ---------- */
const i102Chord=mkChord('harm'),i102Roman=mkRoman('harm'),i102Mode=mkMode('harm'),i102Parent=mkParent('harm'),i102Tones=mkTones('harm'),i102Board=mkModeBoard('harm'),i102Click=mkModeClick('harm');
const i102Dom=()=>{const x=mmCtx('harm'),v=x.sc[4],a=`${v} Phrygian dominant`,pool=[`${v} Mixolydian`,`${v} Lydian ♯2`,`${v} Dorian ♯4`,`${v} Ionian ♯5`,`${v} Locrian ♮6`];
  return{type:'choice',noBoard:true,key:'i1d'+x.r,text:`In ${x.r} harmonic minor the V chord is ${x.d7[4].sym}. Which mode of ${x.r} harmonic minor starts on ${v}?`,choices:mc(a,pool),ans:a,hint:`Count five notes up the scale from ${x.r}, then write the scale from there.`,
   explain:`${x.r} harmonic minor: ${x.sc.join(' ')}. From ${v}: ${rot(x.sc,5).join(' ')} = 1 ♭2 3 4 5 ♭6 ♭7: Phrygian dominant, the scale for ${x.d7[4].sym} when it resolves to ${x.r}m.`}};
const i102Bank=sbank('i10b',[
 ['Which 7th chord is built on the 7th degree of harmonic minor?','°7 (fully diminished 7th)',['m7♭5','m7','7'],'In A harmonic minor: G♯ B D F = G♯°7.'],
 ['Which 7th chord is built on the 3rd degree of harmonic minor?','+maj7',['maj7','m7','7'],'In A: C E G♯ B = C+maj7 (Ionian ♯5).'],
 ['Which 7th chord is built on the 5th degree of harmonic minor?','7 (dominant 7th)',['maj7','m7','m7♭5'],'In A: E G♯ B D = E7, the V7 of the minor key.'],
 ['Which mode of harmonic minor is called Phrygian dominant?','The 5th mode',['The 3rd mode','The 4th mode','The 6th mode'],'1 ♭2 3 4 5 ♭6 ♭7: starting on E in A harmonic minor.'],
 ['Which mode of harmonic minor has a ♭2 and a ♮6 and is used over m7♭5 chords?','Locrian ♮6',['Phrygian dominant','Lydian ♯2','Dorian ♯4'],'It is the 2nd mode: the chord on the 2nd degree is m7♭5.'],
 ['Which chord is built on the 6th degree of harmonic minor?','maj7',['m7','7','+maj7'],'In A: F A C E = Fmaj7, with Lydian ♯2 as its scale.']]);

/* ---------- Lesson 103: comparison ---------- */
const CMP={minor:'natural minor',harmMinor:'harmonic minor',melMinor:'melodic minor'};
const CMPK=['minor','harmMinor','melMinor'];
const kRoot=()=>hRoot(q=>CMPK.every(s=>hOk(scaleNotes(q,s))));
const k103Name=()=>{const r=kRoot(),s=pick(CMPK),a=CMP[s],n=scaleNotes(r,s);
  return{type:'choice',noBoard:true,key:'k3n'+s+r,text:`Which scale is ${n.join(' ')}?`,choices:mc(a,[...Object.values(CMP),`${r} Dorian`.replace(r+' ','')]),ans:a,hint:`Look at the 6th and 7th notes of the scale starting on ${r}, and compare them with natural minor.`,
   explain:`${r} natural minor: ${scaleNotes(r,'minor').join(' ')}. Harmonic: ${scaleNotes(r,'harmMinor').join(' ')}. Melodic: ${scaleNotes(r,'melMinor').join(' ')}. The given notes match ${a}.`}};
const k103Diff=()=>{const r=kRoot(),PR=[['minor','harmMinor'],['minor','melMinor'],['harmMinor','melMinor']],ch=(a,b)=>{const A=scaleNotes(r,a),B=scaleNotes(r,b),o=[];for(let i=0;i<7;i++)if(pcOf(A[i])!==pcOf(B[i]))o.push(`${A[i]} becomes ${B[i]}`);return hJoin(o)},
  [a,b]=pick(PR),ans=ch(a,b),pool=[...PR.map(p=>ch(p[0],p[1])),`${scaleNotes(r,'minor')[2]} becomes ${spellF(r,'3')[0]}`];
  return{type:'choice',noBoard:true,key:`k3d${a}${b}${r}`,text:`Which notes change when you go from ${r} ${CMP[a]} to ${r} ${CMP[b]}?`,choices:mc(ans,pool),ans,hint:`Write both scales out, one under the other, and compare degree by degree.`,
   explain:`${r} ${CMP[a]}: ${scaleNotes(r,a).join(' ')}. ${r} ${CMP[b]}: ${scaleNotes(r,b).join(' ')}. Changes: ${ans}.`}};
const k103Raised=()=>hTry(()=>{const r=kRoot(),s=pick(['harmMinor','melMinor']),b=hBox(r,6,4),[lo,hi]=b.box,nat=hFPos(r,SCALES.minor.f,b.st,lo,hi),rp=pcOf(r),sc=scaleNotes(r,s),items=s==='melMinor'?[{pc:(rp+9)%12,t:'6',name:sc[5],i:5},{pc:(rp+11)%12,t:'7',name:sc[6],i:6}]:[{pc:(rp+11)%12,t:'7',name:sc[6],i:6}],tg=hPcs(items,b.st,lo,hi);
  if(tg.length<1||tg.length>8)return null;
  return{type:'multi',key:`k3r${s}${r}${lo}`,box:b.box,text:`The marks show ${r} natural minor. Click every note that ${r} ${CMP[s]} has instead of a natural-minor note, in the shaded frets ${lo}–${hi}.`,marks:nat.map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'ghost'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes([...nat,...tg]),pm:'seq',
   hint:`Natural minor: 1 2 ♭3 4 5 ♭6 ♭7. ${CMP[s]}: ${SCALES[s].f.split(' ').map(hTokN).join(' ')}.`.replace('. harmonic','. Harmonic').replace('. melodic','. Melodic'),explain:`${r} ${CMP[s]} = ${sc.join(' ')}. It raises ${s==='melMinor'?`${spellF(r,'b6')[0]} to ${sc[5]} and ${spellF(r,'b7')[0]} to ${sc[6]}`:`${spellF(r,'b7')[0]} to ${sc[6]}`}. In frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}});
const k103Click=()=>hTry(()=>{const r=kRoot(),s=pick(['harmMinor','melMinor']),t=s==='melMinor'?pick(['6','7']):'7',sc=scaleNotes(r,s),i=t==='6'?5:6,off=t==='6'?9:11,rs=R(0,5),rf=rootFret(r,rs,R(2,9));if(rf<2||rf>11)return null;
  const s2=pick([0,1,2,3,4,5].filter(x=>x!==rs)),tt=hClickT(rs,rf,off,[s2]);if(!tt)return null;
  return{type:'click',key:`k3c${s}${r}${t}${s2}`,text:`Root of ${r} ${CMP[s]} marked. Click its natural ${t==='6'?'6th':'7th'} (${sc[i]}), a note that natural minor does not have, on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:tt.s,f:tt.f,t:t},notes:[midi(rs,rf),midi(tt.s,tt.f)],
   hint:`It is ${hSem(off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,explain:`${sc[i]} is ${hSem(off)} above ${r} (natural minor has ${spellF(r,t==='6'?'b6':'b7')[0]} here). ${hPath(rs,rf,s2,tt.f)}`}});
const k103Show=()=>hTry(()=>{const r=kRoot(),s=pick([...CMPK,'dorian']),b=hBox(r,6,5),[lo,hi]=b.box,pts=hFPos(r,SCALES[s].f,b.st,lo,hi),ts=new Set(pts.map(p=>p.t));
  if(!(ts.has('♭6')||ts.has('6'))||!(ts.has('♭7')||ts.has('7')))return null;if(pts.length>22)return null;const sixes=pts.filter(p=>p.t==='6'||p.t==='♭6'),sevens=pts.filter(p=>p.t==='7'||p.t==='♭7');if(!sixes.length||!sevens.length)return null;
  const nm_=s==='dorian'?'Dorian':CMP[s],pool=[...Object.values(CMP),'Dorian'];
  return{type:'choice',key:`k3s${s}${r}${lo}`,text:`These are the notes of one scale with root ${r}, frets ${lo}–${hi}. Which scale is it?`,box:b.box,marks:pts.map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'q'})),choices:mc(nm_,pool),ans:nm_,notes:hNotes(pts),pm:'seq',
   hint:'Check the labels on the 6th and 7th degrees: each of the four scales has a different pair.',explain:`The 6th and 7th degrees are ${ts.has('♭6')?'♭6':'6'} and ${ts.has('♭7')?'♭7':'7'}: ${nm_} (${scaleNotes(r,s).join(' ')}). Natural minor has ♭6 ♭7, harmonic ♭6 7, melodic 6 7, Dorian 6 ♭7.`}});
const k103Tri=()=>{const r=kRoot(),s=pick(CMPK),d=pick([3,4,5,6,7]),c=diatonic(r,s==='minor'?'minor':s,3)[d-1],ans=c.sym,pool=[...CMPK.map(z=>diatonic(r,z==='minor'?'minor':z,3)[d-1].sym),...['','m','°','+'].map(q=>c.root+q)];
  return{type:'choice',noBoard:true,key:`k3t${s}${r}${d}`,text:`In ${r} ${CMP[s]}, which triad is built on the ${ord(d)} degree (${c.root})?`,choices:mc(ans,pool),ans,hint:`Stack 3rds from ${c.root} using only notes of ${r} ${CMP[s]} (${scaleNotes(r,s).join(' ')}).`,
   explain:`${r} ${CMP[s]}: ${scaleNotes(r,s).join(' ')}. From ${c.root}: ${c.notes.join(' ')} = ${c.sym}.`}};
const k103Bank=sbank('k3b',[
 ['Which minor scale has an augmented 2nd between its ♭6 and 7?','Harmonic minor',['Natural minor','Melodic minor','Dorian'],'♭6 to ♮7 is 3 semitones. Natural minor has ♭6–♭7 (whole step), melodic minor has 6–7 (whole step).'],
 ['Which minor scale has no raised notes compared with natural minor, because it is natural minor?','Natural minor (Aeolian)',['Harmonic minor','Melodic minor','Dorian'],'1 2 ♭3 4 5 ♭6 ♭7: the reference scale.'],
 ['Which scales give the key a leading tone (a half step below the tonic)?','Harmonic and melodic minor',['Natural minor only','Natural and harmonic minor','None of them'],'Both raise the 7th: G♯ in A minor. Natural minor has G.'],
 ['What is the only difference between harmonic and melodic minor?','The 6th: ♭6 in harmonic, natural 6 in melodic',['The 7th','The 3rd','The 5th'],'Harmonic 1 2 ♭3 4 5 ♭6 7; melodic 1 2 ♭3 4 5 6 7.'],
 ['What does the V chord in a minor key become when the 7th is raised?','Major (or dominant 7th)',['Minor','Diminished','Augmented'],'A natural minor has Em; with G♯ it is E or E7, a stronger pull to Am.'],
 ['Which of these has the natural 6th and ♭7th?','Dorian',['Natural minor','Harmonic minor','Melodic minor'],'Dorian is 1 2 ♭3 4 5 6 ♭7: the natural 6th with the flat 7th.']]);

const LS={
 mel:{h:'melodic-minor-scale',n:'Lesson 99',title:'Melodic minor scale',sub:'Major scale with a ♭3: 1 2 ♭3 4 5 6 7.',
  ex:[['Spell it',[c99Spell,c99Lower,c99Bank]],['On the neck',[c99Board,c99Click,c99Deg]],['vs natural minor',[c99Raised]]],
  test:[...rep(c99Spell,2),c99Lower,...rep(c99Bank,2),...rep(c99Board,3),...rep(c99Click,2),...rep(c99Deg,2),...rep(c99Raised,3)]},
 melc:{h:'melodic-minor-chords-modes',n:'Lesson 100',title:'Melodic minor chords & modes',sub:'Its seven 7th chords and the seven modes.',
  ex:[['Chords',[c100Chord,c100Roman,c100Tones,c100Bank]],['Modes',[c100Mode,c100Parent,c100Board,c100Click]]],
  test:[...rep(c100Chord,2),...rep(c100Mode,2),c100Parent,c100Bank,...rep(c100Tones,3),...rep(c100Board,3),...rep(c100Click,3)]},
 harm:{h:'harmonic-minor-scale',n:'Lesson 101',title:'Harmonic minor scale',sub:'Natural minor with a raised 7th: 1 2 ♭3 4 5 ♭6 7.',
  ex:[['Spell it',[h101Spell,h101Raise,h101Int,h101Bank]],['On the neck',[h101Board,h101Click,h101Deg,h101Aug,h101Raised]]],
  test:[...rep(h101Spell,2),h101Raise,h101Int,h101Bank,...rep(h101Board,2),...rep(h101Click,2),...rep(h101Deg,2),...rep(h101Aug,2),...rep(h101Raised,2)]},
 harmc:{h:'harmonic-minor-chords-modes',n:'Lesson 102',title:'Harmonic minor chords & modes',sub:'Its seven 7th chords and the seven modes.',
  ex:[['Chords',[i102Chord,i102Roman,i102Tones,i102Bank]],['Modes',[i102Mode,i102Parent,i102Dom,i102Board,i102Click]]],
  test:[...rep(i102Chord,2),...rep(i102Mode,2),i102Parent,i102Dom,i102Bank,...rep(i102Tones,3),...rep(i102Board,2),...rep(i102Click,2)]},
 cmp:{h:'minor-scales-comparison',n:'Lesson 103',title:'Minor scales comparison',sub:'Natural, harmonic and melodic minor side by side.',
  ex:[['Spot the scale',[k103Name,k103Diff,k103Tri,k103Bank]],['On the neck',[k103Raised,k103Click,k103Show]]],
  test:[...rep(k103Name,2),...rep(k103Diff,2),...rep(k103Tri,2),k103Bank,...rep(k103Raised,3),...rep(k103Click,2),...rep(k103Show,3)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 99–103 mixed.',
  ex:[['Lessons 99–100',[c99Spell,c99Lower,c99Board,c99Click,c99Deg,c99Raised,c99Bank,c100Chord,c100Roman,c100Mode,c100Parent,c100Tones,c100Board,c100Click,c100Bank]],['Lessons 101–103',[h101Spell,h101Raise,h101Int,h101Board,h101Click,h101Aug,h101Raised,h101Bank,i102Chord,i102Mode,i102Dom,i102Tones,i102Board,i102Click,k103Name,k103Diff,k103Tri,k103Raised,k103Click,k103Show,k103Bank]]],
  test:[c99Spell,c99Lower,c99Board,c99Raised,c99Click,c100Chord,c100Mode,c100Tones,c100Board,h101Spell,h101Raise,h101Aug,h101Click,i102Chord,i102Mode,i102Tones,k103Name,k103Diff,k103Raised,k103Show]}};
const ORDER=['mel','melc','harm','harmc','cmp','final'],STORE='gi-best-p25';

/* ---------- NOTES ---------- */
const mmScaleTable=()=>`<div class="scroll"><table><thead><tr><th>Scale</th><th>Formula</th><th>In A</th></tr></thead><tbody>${['minor','harmMinor','melMinor','major'].map(s=>`<tr><td>${cap(SCALES[s].name)}</td><td>${SCALES[s].f.split(' ').map(hTokN).join(' ')}</td><td>${scaleNotes('A',s).join(' ')}</td></tr>`).join('')}</tbody></table></div>`;
const mmChordTable=k=>{const K=MMK[k],d=diatonic('A',K.sc,4),t=diatonic('A',K.sc,3);return `<div class="scroll"><table><thead><tr><th>Degree</th><th>Mode (from this note)</th><th>Triad</th><th>7th chord</th><th>Numeral</th></tr></thead><tbody>${d.map((c,i)=>`<tr><td>${i+1}</td><td>${c.root} ${K.MN[i]}</td><td>${t[i].sym}</td><td>${c.sym}</td><td>${c.roman}</td></tr>`).join('')}</tbody></table></div>`};
const NOTES={
 mel:`<div class="cols"><div><h3>Melodic minor in A</h3>${mmScaleTable()}<p class="small">Assumption: “melodic minor” means the jazz form, the same going up and down: 1 2 ♭3 4 5 6 7. In classical practice it descends as natural minor.</p></div>
  <div><h3>Key ideas</h3><ul><li>Major scale with a ♭3, or natural minor with raised 6th and 7th.</li><li>Half steps are between 2–♭3 and 7–8.</li><li>The 7th chord on the root is m(maj7): A C E G♯.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A major, then lower only the C♯ to C.</li><li>Play A natural minor and raise the F and G to F♯ and G♯.</li><li>Play the scale up one string, then in a box of three strings.</li></ul></div></div>`,
 melc:`<div class="cols"><div><h3>Chords and modes of A melodic minor</h3>${mmChordTable('mel')}</div>
  <div><h3>Key ideas</h3><ul><li>Seven 7th chords: m(maj7), m7, +maj7, 7, 7, m7♭5, m7♭5.</li><li>Each degree starts a mode: Dorian ♭2, Lydian augmented, Lydian dominant, Mixolydian ♭6, Locrian ♮2, altered.</li><li>One scale, many chord colours: the 4th mode fits D7, the 7th mode fits an altered G♯7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play D Lydian dominant with the notes of A melodic minor over a D7 chord.</li><li>Play G♯ altered over G♯7 and listen to the tension.</li><li>Build each 7th chord on the A string root, then play its arpeggio.</li></ul></div></div>`,
 harm:`<div class="cols"><div><h3>Harmonic minor in A</h3>${mmScaleTable()}</div>
  <div><h3>Key ideas</h3><ul><li>Natural minor with a raised 7th: 1 2 ♭3 4 5 ♭6 7.</li><li>The raised 7th is the leading tone, so V is major: E or E7 pulls to Am.</li><li>♭6 to 7 is an augmented 2nd (3 frets): the exotic sound of the scale.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A natural minor and raise only the G to G♯.</li><li>Play the F–G♯ jump on one string: 3 frets apart.</li><li>Play E7 then Am and use G♯ as the leading tone.</li></ul></div></div>`,
 harmc:`<div class="cols"><div><h3>Chords and modes of A harmonic minor</h3>${mmChordTable('harm')}</div>
  <div><h3>Key ideas</h3><ul><li>Seven 7th chords: m(maj7), m7♭5, +maj7, m7, 7, maj7, °7.</li><li>The V7 chord (E7) is dominant: its scale is the 5th mode, Phrygian dominant.</li><li>The 7th-degree chord is diminished 7th (G♯°7), the leading-tone chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play E Phrygian dominant over E7, then resolve to Am.</li><li>Play the notes of A harmonic minor starting from each degree.</li><li>Play G♯°7 then Am and notice the half-step pull.</li></ul></div></div>`,
 cmp:`<div class="cols"><div><h3>Three minor scales in A</h3><div class="scroll"><table><thead><tr><th>Scale</th><th>6th</th><th>7th</th><th>Notes</th></tr></thead><tbody>${CMPK.map(s=>`<tr><td>${cap(CMP[s])}</td><td>${scaleNotes('A',s)[5]}</td><td>${scaleNotes('A',s)[6]}</td><td>${scaleNotes('A',s).join(' ')}</td></tr>`).join('')}</tbody></table></div></div>
  <div><h3>Key ideas</h3><ul><li>All three share 1 2 ♭3 4 5; only the 6th and 7th differ.</li><li>Natural: ♭6 ♭7. Harmonic: ♭6 7. Melodic: 6 7.</li><li>Harmonic and melodic both have the leading tone, so V is major.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A natural, harmonic and melodic minor in one position, changing only the F and G.</li><li>Over Am, E7 and Am play harmonic minor on E7.</li><li>Sing the 6th and 7th of each scale before you play them.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 99–103: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>The next part of the course continues with further scales and modes after the minor scales.</p></div></div>`};
