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

/* ===== Part 23: lessons 92-95 ===== */
/* chord-scale contexts for the pentatonic lessons */
const PX={
 m7:{chord:'m7',scale:'dorian',pent:'minPent',idx:[0,4,1],pos:['root','5th','2nd'],wrong:[2,3,5,6],wpos:['♭3rd','4th','6th','♭7th'],
  lab:['root','9th','♭3rd','11th','5th','13th','♭7th'],tl:['R','9','♭3','11','5','13','♭7']},
 maj7:{chord:'maj7',scale:'lydian',pent:'majPent',idx:[0,4,1],pos:['root','5th','2nd'],wrong:[2,3,5,6],wpos:['3rd','♯4th','6th','7th'],
  lab:['root','9th','3rd','♯11th','5th','13th','7th'],tl:['R','9','3','♯11','5','13','7']},
 dom7:{chord:'dom7',scale:'mixolydian',pent:'majPent',idx:[0,3,6],pos:['root','4th','♭7th'],wrong:[1,2,4,5],wpos:['2nd','3rd','5th','6th'],
  lab:['root','9th','3rd','11th','5th','13th','♭7th'],tl:['R','9','3','11','5','13','♭7']}};
function pCtx(kinds){const kind=pick(kinds),c=PX[kind];
  return hTry(()=>{const r=pick(HR),cn=scaleNotes(r,c.scale),rs=c.idx.map(j=>cn[j]),pn=rs.map(x=>scaleNotes(x,c.pent));
    if(!hOk(cn)||!pn.every(hOk))return null;
    return{kind,c,r,cn,rs,pn,sym:r+CHORDS[c.chord].sym,sc:`${r} ${SCALES[c.scale].name}`,pname:SCALES[c.pent].name,pl:SCALES[c.pent].name.replace('pentatonic','pentatonics')}})}
const pcItems=x=>x.cn.map((n,i)=>({pc:pcOf(n),t:x.c.tl[i],name:n,i}));
const pAdded=(x,k)=>{const base=x.pn[0].map(pcOf),idxs=x.pn[k].filter(n=>!base.includes(pcOf(n))).map(n=>x.cn.findIndex(m=>pcOf(m)===pcOf(n))).sort((a,b)=>a-b);return idxs};

/* which three pentatonics fit (lessons 92 and 93) */
const mkSet=kinds=>()=>{const x=pCtx(kinds),c=x.c,ans=hJoin(x.rs),wr=c.wrong.map(j=>x.cn[j]),pool=[];
  hSub(wr,2).forEach(p=>pool.push(hJoin([x.rs[0],...p])));wr.forEach(w=>{pool.push(hJoin([x.rs[0],x.rs[1],w]));pool.push(hJoin([x.rs[0],x.rs[2],w]))});
  return{type:'choice',noBoard:true,key:`set${x.kind}${x.r}`,text:`Over ${x.sym} (${x.sc}: ${x.cn.join(' ')}), which three ${x.pl} all fit?`,choices:mc(ans,pool),ans,
   hint:`A pentatonic fits only if every one of its notes is in ${x.sc}. Spell a candidate and check.`,
   explain:`${x.sc}: ${x.cn.join(' ')}. The pentatonics built on its ${c.pos.join(', ')} are ${hJoin(x.rs)}: ${x.rs.map((n,i)=>`${n} = ${x.pn[i].join(' ')}`).join(' · ')}. Every note is in the scale. A pentatonic from any other degree brings in a note the scale does not have.`}};
/* which note(s) does the pentatonic add */
const mkAdd=kinds=>()=>{const x=pCtx(kinds),c=x.c,k=pick([1,2]),idxs=pAdded(x,k),ans=idxs.map(i=>x.cn[i]).join(' and '),pool=idxs.length===1?x.cn:hSub(x.cn,2).map(p=>p.join(' and '));
  return{type:'choice',noBoard:true,key:`add${x.kind}${x.r}${k}`,text:`Over ${x.sym}, the ${x.rs[k]} ${x.pname} is built on the ${c.pos[k]} of ${x.sc}. Which ${idxs.length===1?'note does':'notes does'} it add to ${x.r} ${x.pname}?`,choices:mc(ans,pool),ans,
   hint:`Spell both pentatonics and see what ${x.r} ${x.pname} is missing.`,
   explain:`${x.r} ${x.pname}: ${x.pn[0].join(' ')}. ${x.rs[k]} ${x.pname}: ${x.pn[k].join(' ')}. New: ${idxs.map(i=>`${x.cn[i]} (the ${c.lab[i]} of ${x.sym})`).join(' and ')}.`}};
/* identify the degree on the board */
const mkId=kinds=>()=>hTry(()=>{const x=pCtx(kinds),c=x.c,k=pick([1,2]),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;
  const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),f2=hNearF(s2,pcOf(x.rs[k]),rf);if(f2<0||Math.abs(f2-rf)>5)return null;const ans=c.pos[k];
  return{type:'choice',key:`id${x.kind}${x.r}${k}`,text:`${x.sym}: its root is marked R. The ? is the root of one of the ${x.pl} that fit over it. Which degree of ${x.sc} is the ?`,
   marks:[{s:rs,f:rf,t:'R',k:'root'},{s:s2,f:f2,t:'?',k:'q'}],choices:mc(ans,[...c.wpos,c.pos[3-k]]),ans,notes:[midi(rs,rf),midi(s2,f2)],
   hint:`Measure the interval from the root to the ? and match it to a degree of ${x.sc}.`,
   explain:`The ? is ${x.rs[k]}, the ${c.pos[k]} of ${x.sc} (${x.cn.join(' ')}). The ${x.rs[k]} ${x.pname} (${x.pn[k].join(' ')}) stays inside the scale, so it fits over ${x.sym}.`}});
/* click the added notes */
const mkAddB=kinds=>()=>hTry(()=>{const x=pCtx(kinds),c=x.c,k=pick([1,2]),idxs=pAdded(x,k),b=hBox(x.r,6,4),[lo,hi]=b.box,items=pcItems(x),basePcs=x.pn[0].map(pcOf);
  const marks=hPcs(items.filter(i=>basePcs.includes(i.pc)),b.st,lo,hi).map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'ghost'})),tg=hPcs(items.filter(i=>idxs.includes(i.i)),b.st,lo,hi);
  if(tg.length<1||tg.length>8)return null;
  return{type:'multi',key:`ab${x.kind}${x.r}${k}${lo}`,box:b.box,text:`Over ${x.sym}, the marked notes are ${x.r} ${x.pname}. The ${x.rs[k]} ${x.pname} (built on the ${c.pos[k]}) adds ${idxs.length===1?'one note':'two notes'} to it. Click every added note in the shaded frets ${lo}–${hi}.`,
   marks,targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(tg),
   hint:`Spell ${x.rs[k]} ${x.pname} and compare it with the marked scale: which note is new?`,
   explain:`${x.rs[k]} ${x.pname}: ${x.pn[k].join(' ')}. New notes: ${idxs.map(i=>`${x.cn[i]} (${c.lab[i]})`).join(' and ')}. In frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}});
/* play the pentatonic on two strings */
const mkPent=kinds=>()=>hTry(()=>{const x=pCtx(kinds),c=x.c,k=pick([0,1,2]),root=x.rs[k],b=hBox(root,2,4),[lo,hi]=b.box,pts=hFPos(root,SCALES[c.pent].f,b.st,lo,hi);
  const marks=pts.filter(p=>p.t==='R').map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<2||tg.length>8)return null;
  return{type:'multi',key:`pe${x.kind}${x.r}${k}${b.st[0]}${lo}`,box:b.box,text:`Over ${x.sym} you play ${root} ${x.pname} (built on the ${c.pos[k]} of ${x.sc}). On the ${hStr(b.st)}, frets ${lo}–${hi}, the roots are marked. Click every other scale note.`,
   marks,targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`Spell ${root} ${x.pname}: ${SCALES[c.pent].f.split(' ').map(hTokN).join(' ')} from the root.`,
   explain:`${root} ${x.pname}: ${x.pn[k].join(' ')}. In frets ${lo}–${hi} on the ${hStr(b.st)}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
/* click the root of the pentatonic */
const mkFrets=kinds=>()=>hTry(()=>{const x=pCtx(kinds),c=x.c,k=pick([1,2]),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;
  const off=(pcOf(x.rs[k])-pcOf(x.r)+12)%12,s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),t=hClickT(rs,rf,off,[s2]);if(!t)return null;
  return{type:'click',key:`fr${x.kind}${x.r}${k}${s2}`,text:`${x.sym}: its root is marked. Click ${x.rs[k]}, the root of the ${x.pname} built on the ${c.pos[k]} of ${x.sc}, on the ${SN[s2]} string.`,
   marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:'R'},notes:[midi(rs,rf),midi(t.s,t.f)],
   hint:`${x.rs[k]} is ${hSem(off)} above ${x.r}. Use the string gap (${hG(rs,s2)} semitones) to find the fret.`,
   explain:`${x.rs[k]} is the ${c.pos[k]} of ${x.sc}: ${hSem(off)} above ${x.r}. ${hPath(rs,rf,s2,t.f)}`}});

/* ---------- Lesson 92 ---------- */
const m92Set=mkSet(['m7']),m92Add=mkAdd(['m7']),m92Id=mkId(['m7']),m92AddB=mkAddB(['m7']),m92Pent=mkPent(['m7']),m92Frets=mkFrets(['m7']);
const m92Bank=sbank('m92b',[
 ['Over a m7 chord played as Dorian, the minor pentatonics that fit are built on the…','root, 5th and 2nd',['root, 4th and ♭7th','root, ♭3rd and 5th','root, 4th and 6th'],'Over Am7 (A Dorian: A B C D E F♯ G) those are A, E and B minor pentatonic. A pentatonic on the 4th (D) contains F♮, which is not in Dorian.'],
 ['Why does E minor pentatonic work over Am7?','All its notes (E G A B D) belong to A Dorian',['It has the same root as the chord','It is the arpeggio of Am7','It contains the ♭5'],'Fit means every note is in the chord scale. E G A B D are all in A Dorian; the chord itself still sounds from the A bass.'],
 ['Which extension does the minor pentatonic built on the 5th of a m7 chord add to the root minor pentatonic?','The 9th',['The ♭9th','The ♯11th','The ♭13th'],'Over Am7: E minor pentatonic (E G A B D) adds B, the 9th, to A minor pentatonic (A C D E G).'],
 ['Which extensions does the minor pentatonic built on the 2nd of a m7 chord add to the root minor pentatonic?','The 9th and 13th',['The 9th and 11th','The ♭9th and 13th','The 11th and ♭7th'],'Over Am7: B minor pentatonic (B D E F♯ A) adds B (9th) and F♯ (13th). D is already in A minor pentatonic as the 11th.'],
 ['Taken together, A, E and B minor pentatonic contain…','all seven notes of A Dorian',['only the five notes of A minor pentatonic','all seven notes of A natural minor','all twelve notes'],'A C D E G + B + F♯ = A B C D E F♯ G: A Dorian. Natural minor would need F, not F♯.'],
 ['Why switch between several pentatonics over one chord?','The fingering is similar but each brings different colour notes',['The chord notes change','The key changes','Pentatonics only work in pairs'],'You stay in one area of the neck and change which notes are available: root pentatonic is the safest, the others add 9th and 13th.']]);

/* ---------- Lesson 93 ---------- */
const m93Set=mkSet(['maj7','dom7']),m93Add=mkAdd(['maj7','dom7']),m93Id=mkId(['maj7','dom7']),m93AddB=mkAddB(['maj7','dom7']),m93Pent=mkPent(['maj7','dom7']),m93Frets=mkFrets(['maj7','dom7']);
const m93Bank=sbank('m93b',[
 ['Over a maj7 chord (Lydian), the major pentatonics that fit are built on the…','root, 5th and 2nd',['root, 4th and ♭7th','root, ♭3rd and 5th','root, 2nd and 6th'],'Over Cmaj7: C, G and D major pentatonic. D major pentatonic brings in F♯, which Lydian has.'],
 ['Which note does the major pentatonic built on the 5th of a maj7 chord add to the root major pentatonic?','The major 7th',['The ♭7th','The 11th','The ♯11th'],'Over Cmaj7: G major pentatonic (G A B D E) adds B, the major 7th, to C major pentatonic (C D E G A).'],
 ['Which colour notes does the major pentatonic built on the 2nd of a maj7 chord add?','The ♯11th and the 7th',['The ♭9th and the 7th','The 11th and the ♭7th','The ♭13th and the 7th'],'Over Cmaj7: D major pentatonic (D E F♯ A B) adds F♯ (♯11) and B (7) to C major pentatonic.'],
 ['Over a dominant 7 chord (Mixolydian), the major pentatonics that fit are built on the…','root, 4th and ♭7th',['root, 5th and 2nd','root, 2nd and 6th','root, ♭3rd and ♭7th'],'Over C7: C, F and B♭ major pentatonic. All their notes are in C Mixolydian (C D E F G A B♭).'],
 ['Why is the major pentatonic on the 5th a poor choice over a dominant 7 chord?','It contains the major 7th, which clashes with the ♭7th',['It has no root','It contains the ♭3rd','It has six notes'],'Over C7, G major pentatonic (G A B D E) has B natural against the chord’s B♭.'],
 ['Which chord scale supplies the ♯11 that the D major pentatonic adds over Cmaj7?','Lydian',['Mixolydian','Dorian','Locrian'],'C Lydian is C D E F♯ G A B: its ♯4 (= ♯11) is F♯, a note of D major pentatonic.']]);

/* ---------- Lesson 94: minor pentatonic over m7♭5 ---------- */
const M5L={1:'♭2nd (♭9th)',3:'♭3rd',6:'♭5th',8:'♭6th (♭13th)',10:'♭7th'},M5T={1:'♭9',3:'♭3',6:'♭5',8:'♭13',10:'♭7'};
const m5Ctx=()=>hTry(()=>{const r=pick(HR),cn=chordNotes(r,'m7b5'),sc=scaleNotes(r,'locrian'),x=cn[1],pn=scaleNotes(x,'minPent');if(!hOk(cn)||!hOk(sc)||!hOk(pn))return null;
  return{r,cn,sc,x,pn,sym:r+'m7♭5',off:pn.map(n=>(pcOf(n)-pcOf(r)+12)%12)}});
const m5Items=c=>c.pn.map((n,i)=>({pc:pcOf(n),t:M5T[c.off[i]],name:n,i}));
const m94Which=()=>{const c=m5Ctx(),a=`${c.x} minor pentatonic`,pool=[c.r,spellF(c.r,'5')[0],spellF(c.r,'2')[0],c.sc[5]].map(n=>`${n} minor pentatonic`);
  return{type:'choice',noBoard:true,key:'m4w'+c.r,text:`Which minor pentatonic do you play over ${c.sym}?`,choices:mc(a,pool),ans:a,
   hint:`Look for the chord tone that is a minor third above the root.`,
   explain:`${c.sym} = ${c.cn.join(' ')}. Its ♭3 is ${c.x}, so play ${c.x} minor pentatonic: ${c.pn.join(' ')}. It holds the chord’s ♭3, ♭5 and ♭7 (${c.cn.slice(1).join(' ')}) plus ${c.pn[2]} (♭6) and ${c.pn[4]} (♭2), all in ${c.r} Locrian (${c.sc.join(' ')}).`}};
const m94Spell=()=>{const c=m5Ctx(),a=c.pn.join(' '),pool=[scaleNotes(c.r,'minPent'),scaleNotes(spellF(c.r,'5')[0],'minPent'),scaleNotes(c.sc[5],'minPent'),scaleNotes(c.sc[1],'minPent')].map(p=>p.join(' '));
  return{type:'choice',noBoard:true,key:'m4s'+c.r,text:`Spell the minor pentatonic that fits over ${c.sym}.`,choices:mc(a,pool),ans:a,hint:`${c.sym} has a ♭3. Start the pentatonic there: 1 ♭3 4 5 ♭7.`,
   explain:`The ♭3 of ${c.sym} is ${c.x}. ${c.x} minor pentatonic (1 ♭3 4 5 ♭7) = ${a}.`}};
const m94Fn=()=>hTry(()=>{const c=m5Ctx(),i=R(0,4),n=c.pn[i],rs=R(0,5),rf=rootFret(c.r,rs,R(2,9));if(rf<2||rf>11)return null;const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),f2=hNearF(s2,pcOf(n),rf);if(f2<0||Math.abs(f2-rf)>5)return null;
  const a=M5L[c.off[i]];
  return{type:'choice',key:`m4f${c.r}${i}`,text:`${c.sym}: its root is marked R. The ? is a note of ${c.x} minor pentatonic. What is it, measured from the chord root?`,marks:[{s:rs,f:rf,t:'R',k:'root'},{s:s2,f:f2,t:'?',k:'q'}],
   choices:mc(a,[...Object.values(M5L),'4th','major 3rd','5th']),ans:a,notes:[midi(rs,rf),midi(s2,f2)],hint:'Count the semitones from the root up to the ? (add 12 if it is lower than the root).',
   explain:`The ? is ${n}. From ${c.r} that is ${hSem(c.off[i])}: the ${a} of ${c.sym}. The chord has ${c.cn.join(' ')}; ${c.x} minor pentatonic = ${c.pn.join(' ')}.`}});
const m94Tones=()=>hTry(()=>{const c=m5Ctx(),b=hBox(c.r,3,4),[lo,hi]=b.box,pts=hPcs(m5Items(c),b.st,lo,hi),chordPcs=c.cn.map(pcOf);
  const tg=pts.filter(p=>chordPcs.includes(pcAt(p.s,p.f))),oth=pts.filter(p=>!chordPcs.includes(pcAt(p.s,p.f)));if(tg.length<2||tg.length>8||!oth.length)return null;
  return{type:'multi',key:`m4t${c.r}${b.st[0]}${lo}`,box:b.box,text:`${c.sym}, ${c.x} minor pentatonic on the ${hStr(b.st)}, frets ${lo}–${hi}. The notes that are not chord tones are marked. Click every chord tone of ${c.sym} (${c.cn.join(' ')}).`,
   marks:oth.map(p=>({s:p.s,f:p.f,t:p.t,k:'ghost'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`${c.sym} contains ♭3, ♭5 and ♭7 from this pentatonic, but not its root.`,
   explain:`${c.sym} = ${c.cn.join(' ')}. In ${c.x} minor pentatonic (${c.pn.join(' ')}) the chord tones are ${c.pn[0]} (♭3), ${c.pn[1]} (♭5) and ${c.pn[3]} (♭7). ${c.pn[2]} (♭13) and ${c.pn[4]} (♭9) are colour notes. Chord tones here: ${tg.map(posTxt).join(', ')}.`}});
const m94Find=()=>hTry(()=>{const c=m5Ctx(),rs=R(0,5),rf=rootFret(c.r,rs,R(2,9));if(rf<2||rf>11)return null;const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),t=hClickT(rs,rf,3,[s2]);if(!t)return null;
  return{type:'click',key:`m4c${c.r}${s2}`,text:`${c.sym}: its root is marked. Click the root of the minor pentatonic that fits (${c.x}) on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:'♭3'},notes:[midi(rs,rf),midi(t.s,t.f)],
   hint:`It is built on a chord tone, not on the root. The string gap is ${hG(rs,s2)} semitones.`,
   explain:`The pentatonic root is the ♭3 of ${c.sym}: ${c.x}, a minor 3rd (3 semitones) above ${c.r}. ${hPath(rs,rf,s2,t.f)}`}});
const m94Pent=()=>hTry(()=>{const c=m5Ctx(),b=hBox(c.x,2,4),[lo,hi]=b.box,pts=hFPos(c.x,SCALES.minPent.f,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<2||tg.length>8)return null;
  return{type:'multi',key:`m4p${c.r}${b.st[0]}${lo}`,box:b.box,text:`Over ${c.sym} you play ${c.x} minor pentatonic. On the ${hStr(b.st)}, frets ${lo}–${hi}, its roots are marked. Click every other scale note.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),
   targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',hint:`${c.x} minor pentatonic: 1 ♭3 4 5 ♭7 from ${c.x}.`,
   explain:`${c.x} minor pentatonic = ${c.pn.join(' ')}. In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const m94Bank=sbank('m94b',[
 ['Bm7♭5 contains B D F A. Which minor pentatonic do you play over it?','D minor pentatonic',['B minor pentatonic','F♯ minor pentatonic','E minor pentatonic'],'Build it on the ♭3 (D): D F G A C. B minor pentatonic has F♯ against the chord’s F.'],
 ['Which chord tones of a m7♭5 chord are contained in the minor pentatonic built on its ♭3?','♭3, ♭5 and ♭7',['root, ♭3 and ♭5','root and ♭7','3rd and 5th'],'Over Bm7♭5: D (♭3), F (♭5) and A (♭7) are in D F G A C. The root B is not.'],
 ['In D minor pentatonic over Bm7♭5, the note C is the…','♭9 (♭2nd)',['9th','♭13th','11th'],'C is a half step above B: the ♭2, the colour note of Locrian.'],
 ['In D minor pentatonic over Bm7♭5, the note G is the…','♭13th (♭6th)',['13th','11th','♭7th'],'G is 8 semitones above B: the ♭6, the colour note of Locrian.'],
 ['D minor pentatonic has the same notes as which major pentatonic?','F major pentatonic',['D major pentatonic','B major pentatonic','C major pentatonic'],'Relative major: D F G A C = F G A C D. Relative pairs share notes.'],
 ['Bm7♭5 often appears as ii in A minor (Bm7♭5 – E7 – Am). The same D minor pentatonic works because…','all its notes are in A natural minor',['it contains the E7 chord','it has the leading tone G♯','it is built on the tonic'],'D F G A C are all in A natural minor (A B C D E F G).']]);

/* ---------- Lesson 95: mode pentatonics ---------- */
/* convention: keep the 7th-chord tones (1, 3rd, 5th, 7th) plus one colour note; drop the other two notes */
const MP={ionian:{keep:[0,1,2,4,6],col:1},dorian:{keep:[0,2,4,5,6],col:5},phrygian:{keep:[0,1,2,4,6],col:1},lydian:{keep:[0,2,3,4,6],col:3},mixolydian:{keep:[0,1,2,4,6],col:1},aeolian:{keep:[0,2,4,5,6],col:5},locrian:{keep:[0,1,2,4,6],col:1}};
const mpToks=m=>SCALES[m].f.split(' ');
const mpFm=m=>MP[m].keep.map(i=>mpToks(m)[i]).join(' ');
const mpDrop=m=>[0,1,2,3,4,5,6].filter(i=>!MP[m].keep.includes(i));
function mpCtx(modes=MODES){const m=pick(modes);return hTry(()=>{const r=pick(HR),sc=scaleNotes(r,m);if(!hOk(sc))return null;const keep=MP[m].keep.map(i=>sc[i]),drop=mpDrop(m).map(i=>sc[i]);return{m,r,sc,keep,drop,name:SCALES[m].name,toks:mpToks(m)}})}
const mpDropTxt=(m)=>hJoin(mpDrop(m).map(i=>hTokN(mpToks(m)[i])));
const m95Drop=()=>{const x=mpCtx(),a=mpDropTxt(x.m),pool=hSub([1,2,3,4,5,6],2).map(p=>hJoin(p.map(i=>hTokN(x.toks[i]))));
  return{type:'choice',noBoard:true,key:'m95d'+x.m+x.r,text:`Using this lesson’s convention, which two notes do you remove from ${x.r} ${x.name} (${x.sc.join(' ')}) to get its mode pentatonic?`,choices:mc(a,pool),ans:a,
   hint:`Keep the chord tones of the mode’s 7th chord (1, 3rd, 5th, 7th) and its colour note; the other two go.`,
   explain:`${x.r} ${x.name}: ${x.sc.join(' ')}. Keep ${x.keep.join(' ')} (${mpFm(x.m).split(' ').map(hTokN).join(' ')}); remove ${x.drop.join(' and ')} (${a}).`}};
const m95Notes=()=>{const x=mpCtx(),a=x.keep.join(' '),pool=hSub([1,2,3,4,5,6],2).filter(p=>p.join()!==mpDrop(x.m).join()).map(p=>x.sc.filter((_,i)=>!p.includes(i)).join(' '));
  return{type:'choice',noBoard:true,key:'m95n'+x.m+x.r,text:`Spell the ${x.name} pentatonic on ${x.r}.`,choices:mc(a,pool),ans:a,hint:`Spell ${x.r} ${x.name}, then remove the two notes the convention drops.`,
   explain:`${x.r} ${x.name}: ${x.sc.join(' ')}. Remove ${x.drop.join(' and ')}: ${a} (${mpFm(x.m).split(' ').map(hTokN).join(' ')}).`}};
const MPC=[['dorian','natural minor (Aeolian)','6','♮6'],['phrygian','natural minor (Aeolian)','b2','♭2'],['lydian','major (Ionian)','#4','♯4'],['mixolydian','major (Ionian)','b7','♭7']];
const m95Char=()=>{const [m,par,tok,sy]=pick(MPC),r=hRoot(q=>hOk(scaleNotes(q,m))&&MPC.every(z=>hOk(spellF(q,z[2])))),a=`the ${sy} (${spellF(r,tok)[0]})`,pool=MPC.filter(z=>z[0]!==m).map(z=>`the ${z[3]} (${spellF(r,z[2])[0]})`);
  return{type:'choice',noBoard:true,key:'m95c'+m+r,text:`Which single note makes ${r} ${SCALES[m].name} different from ${r} ${par}?`,choices:mc(a,pool),ans:a,hint:`Spell both scales and compare them note by note.`,
   explain:`${r} ${SCALES[m].name}: ${scaleNotes(r,m).join(' ')}. Compared with ${par} it has ${sy} (${spellF(r,tok)[0]}); everything else is the same. That is its characteristic note.`}};
const m95Pent=()=>hTry(()=>{const x=mpCtx(),b=hBox(x.r,pick([2,3]),4),[lo,hi]=b.box,pts=hFPos(x.r,mpFm(x.m),b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<2||tg.length>8)return null;
  return{type:'multi',key:`m95p${x.m}${x.r}${b.st[0]}${lo}${b.st.length}`,box:b.box,text:`Play the ${x.r} ${x.name} pentatonic on the ${hStr(b.st)}, frets ${lo}–${hi}. The roots are marked. Click every other note of the pentatonic.`,
   marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`First spell ${x.r} ${x.name} and cross out the two removed notes.`,
   explain:`${x.r} ${x.name} pentatonic = ${x.keep.join(' ')} (removed: ${x.drop.join(', ')}). In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const m95Removed=()=>hTry(()=>{const x=mpCtx(),b=hBox(x.r,3,4),[lo,hi]=b.box,keepPts=hFPos(x.r,mpFm(x.m),b.st,lo,hi),dropFm=mpDrop(x.m).map(i=>x.toks[i]).join(' ');
  const dropItems=hFItems(x.r,x.toks.join(' ')).filter(it=>mpDrop(x.m).includes(it.i)),tg=hPcs(dropItems,b.st,lo,hi);if(tg.length<1||tg.length>7)return null;
  return{type:'multi',key:`m95r${x.m}${x.r}${b.st[0]}${lo}`,box:b.box,text:`The marks show the ${x.r} ${x.name} pentatonic on the ${hStr(b.st)}. Click every note of the full ${x.r} ${x.name} scale that was removed, in frets ${lo}–${hi}.`,
   marks:keepPts.map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'ghost'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes([...keepPts,...tg]),pm:'seq',
   hint:`Spell the whole mode. Which two letters are missing from the marked notes?`,
   explain:`${x.r} ${x.name}: ${x.sc.join(' ')}. The pentatonic keeps ${x.keep.join(' ')}, so ${x.drop.join(' and ')} (${dropFm.split(' ').map(hTokN).join(', ')}) were removed. In frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}});
const m95Deg=()=>hTry(()=>{const x=mpCtx(),i=pick(MP[x.m].keep.slice(1)),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),f2=hNearF(s2,pcOf(x.sc[i]),rf);if(f2<0||Math.abs(f2-rf)>5)return null;
  const a=hTokN(x.toks[i]),pool=x.toks.slice(1).map(hTokN);
  return{type:'choice',key:`m95g${x.m}${x.r}${i}`,text:`${x.r} ${x.name} pentatonic: the root is marked R. The ? is another note of the pentatonic. Which degree of the mode is it?`,marks:[{s:rs,f:rf,t:'R',k:'root'},{s:s2,f:f2,t:'?',k:'q'}],
   choices:mc(a,pool),ans:a,notes:[midi(rs,rf),midi(s2,f2)],hint:'Count the semitones above the root and match them to the mode’s formula.',
   explain:`The ? is ${x.sc[i]}: ${hSem((pcOf(x.sc[i])-pcOf(x.r)+12)%12)} above ${x.r}, the ${a} of ${x.name} (${SCALES[x.m].f.split(' ').map(hTokN).join(' ')}).`}});
const MPCLK=['dorian','phrygian','lydian','aeolian','locrian'];
const m95Click=()=>hTry(()=>{const x=mpCtx(MPCLK),i=MP[x.m].col,tok=x.toks[i],rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;const off=(pcOf(x.sc[i])-pcOf(x.r)+12)%12,s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),t=hClickT(rs,rf,off,[s2]);if(!t)return null;
  return{type:'click',key:`m95k${x.m}${x.r}${s2}`,text:`Root of ${x.r} ${x.name} marked. Click its ${hTokN(tok)} (${x.sc[i]}), the colour note kept in the pentatonic, on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:hTokN(tok)},notes:[midi(rs,rf),midi(t.s,t.f)],
   hint:`The ${hTokN(tok)} is ${hSem(off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,
   explain:`${x.sc[i]} is ${hSem(off)} above ${x.r}. ${hPath(rs,rf,s2,t.f)}`}});
const m95Bank=sbank('m95b',[
 ['How many notes does a mode pentatonic have?','5',['7','6','4'],'Two of the seven notes are removed.'],
 ['In this lesson’s convention, which notes are always kept in every mode pentatonic?','The chord tones 1, 3rd, 5th and 7th',['Only the root and 5th','The 2nd and 6th','The 4th and 7th'],'The mode’s 7th chord (maj7, m7, 7, m7♭5) is kept, plus one colour note.'],
 ['Which pair of notes is removed from Ionian to get 1 2 3 5 7?','4 and 6',['2 and 4','6 and 7','3 and 7'],'C D E F G A B → remove F and A → C D E G B.'],
 ['Which pair is removed from Dorian (1 2 ♭3 4 5 6 ♭7) to keep the ♮6?','2 and 4',['♭3 and 5','6 and ♭7','4 and 6'],'A Dorian: A C E F♯ G keeps the Am7 chord tones plus F♯; B and D are removed.'],
 ['Which note is the colour note kept in the Phrygian pentatonic?','♭2',['♭6','4','♮6'],'E Phrygian pentatonic: E F G B D (1 ♭2 ♭3 5 ♭7).'],
 ['Which note is the colour note kept in the Lydian pentatonic?','♯4',['♭7','♮2','♭6'],'C Lydian pentatonic: C E F♯ G B (1 3 ♯4 5 7).'],
 ['Why remove two notes from a mode?','The pentatonic is easier to use and avoids the notes that clash',['Modes have too many notes to play','To change the key','To make the scale minor'],'The two dropped notes are the least stable ones, so the remaining five sound good over the mode’s chord.']]);

const LS={
 minadv:{h:'advanced-minor-pentatonic',n:'Lesson 92',title:'Advanced minor pentatonic',sub:'Three minor pentatonics over one m7 chord: root, 5th and 2nd.',
  ex:[['Which pentatonics',[m92Set,m92Id,m92Bank]],['Colour notes',[m92Add,m92AddB]],['On the neck',[m92Frets,m92Pent]]],
  test:[...rep(m92Set,2),...rep(m92Add,2),m92Bank,...rep(m92Id,2),...rep(m92AddB,3),...rep(m92Pent,2),...rep(m92Frets,3)]},
 majadv:{h:'advanced-major-pentatonic',n:'Lesson 93',title:'Advanced major pentatonic',sub:'Several major pentatonics over maj7 and dominant 7 chords.',
  ex:[['Which pentatonics',[m93Set,m93Id,m93Bank]],['Colour notes',[m93Add,m93AddB]],['On the neck',[m93Frets,m93Pent]]],
  test:[...rep(m93Set,2),...rep(m93Add,2),m93Bank,...rep(m93Id,2),...rep(m93AddB,3),...rep(m93Pent,2),...rep(m93Frets,3)]},
 m7b5:{h:'pentatonic-over-m7b5',n:'Lesson 94',title:'Minor pentatonic over m7♭5',sub:'Build the minor pentatonic on the ♭3 of a m7♭5 chord.',
  ex:[['Which pentatonic',[m94Which,m94Spell,m94Bank]],['Chord tones & colour',[m94Fn,m94Tones]],['On the neck',[m94Find,m94Pent]]],
  test:[...rep(m94Which,2),...rep(m94Spell,2),m94Bank,...rep(m94Fn,3),...rep(m94Tones,2),...rep(m94Find,3),...rep(m94Pent,2)]},
 modepent:{h:'mode-pentatonic-scales',n:'Lesson 95',title:'Mode pentatonic scales',sub:'Remove two notes from each mode and keep its colour.',
  ex:[['Remove two notes',[m95Drop,m95Notes,m95Bank,m95Char]],['On the neck',[m95Pent,m95Removed]],['Degrees & colour',[m95Deg,m95Click]]],
  test:[m95Drop,m95Notes,m95Char,m95Bank,...rep(m95Pent,3),...rep(m95Removed,2),...rep(m95Deg,3),...rep(m95Click,3)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 92–95 mixed.',
  ex:[['Lessons 92–93',[m92Set,m92Add,m92Id,m92AddB,m92Pent,m92Frets,m92Bank,m93Set,m93Add,m93Id,m93AddB,m93Pent,m93Frets,m93Bank]],['Lessons 94–95',[m94Which,m94Spell,m94Fn,m94Tones,m94Find,m94Pent,m94Bank,m95Drop,m95Notes,m95Char,m95Pent,m95Removed,m95Deg,m95Click,m95Bank]]],
  test:[m92Set,m92Add,m92AddB,m92Frets,m92Pent,m93Set,m93Add,m93AddB,m93Id,m93Frets,m94Which,m94Fn,m94Tones,m94Find,m94Bank,m95Drop,m95Notes,m95Pent,m95Removed,m95Click]}};
const ORDER=['minadv','majadv','m7b5','modepent','final'],STORE='gi-best-p23';

/* ---------- NOTES ---------- */
const pTable=(kind,r)=>{const c=PX[kind],cn=scaleNotes(r,c.scale),rs=c.idx.map(j=>cn[j]),pn=rs.map(x=>scaleNotes(x,c.pent)),x={cn,pn,c};
  return `<table class="stack"><thead><tr><th>Built on</th><th>Pentatonic</th><th>Notes</th><th>Adds</th></tr></thead><tbody>${rs.map((n,k)=>{const ad=k?pAdded(x,k).map(i=>`${cn[i]} (${c.tl[i]})`).join(', '):'–';return `<tr><td>${c.pos[k]}</td><td>${n} ${SCALES[c.pent].name}</td><td>${pn[k].join(' ')}</td><td>${ad}</td></tr>`}).join('')}</tbody></table>`};
const m5Table=(r)=>{const cn=chordNotes(r,'m7b5'),x=cn[1],pn=scaleNotes(x,'minPent'),L={1:'♭9',3:'♭3 (chord tone)',6:'♭5 (chord tone)',8:'♭13',10:'♭7 (chord tone)'};
  return `<table class="stack"><thead><tr><th>Note</th><th>Over ${r}m7♭5</th></tr></thead><tbody>${pn.map(n=>`<tr><td>${n}</td><td>${L[(pcOf(n)-pcOf(r)+12)%12]}</td></tr>`).join('')}</tbody></table>`};
const mpTable=()=>`<div class="scroll"><table><thead><tr><th>Mode</th><th>Formula</th><th>Pentatonic</th><th>Removed</th><th>In C</th></tr></thead><tbody>${MODES.map(m=>{const sc=scaleNotes('C',m);return `<tr><td>${SCALES[m].name}</td><td>${SCALES[m].f.split(' ').map(hTokN).join(' ')}</td><td>${mpFm(m).split(' ').map(hTokN).join(' ')}</td><td>${mpDropTxt(m)}</td><td>${MP[m].keep.map(i=>sc[i]).join(' ')}</td></tr>`}).join('')}</tbody></table></div>`;
const NOTES={
 minadv:`<div class="cols"><div><h3>Over Am7 (A Dorian)</h3>${pTable('m7','A')}<p class="small">Assumption: the chord is played in a Dorian context (natural 6th), so the 4th (D minor pentatonic, with F♮) is left out.</p></div>
  <div><h3>Key ideas</h3><ul><li>A minor pentatonic fits a m7 chord on its own, but its notes only use the root, ♭3, 11th, 5th and ♭7.</li><li>The pentatonics built on the 5th and 2nd stay inside the Dorian scale and add the 9th and 13th.</li><li>Together they cover all seven notes of the chord scale: you change colour without changing hand position much.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play a groove on Am7 and solo with A, then E, then B minor pentatonic, 4 bars each.</li><li>Find where the three pentatonics overlap in the same box.</li><li>Land on a new colour note (B or F♯) and resolve to a chord tone.</li></ul></div></div>`,
 majadv:`<div class="cols"><div><h3>Over Cmaj7 (C Lydian)</h3>${pTable('maj7','C')}<h3 style="margin-top:18px">Over C7 (C Mixolydian)</h3>${pTable('dom7','C')}<p class="small">Assumption: maj7 is treated as Lydian so the ♯11 from the 2nd-degree pentatonic is allowed; on a plain Ionian chord skip it. On dominant chords the pentatonic on the 5th is avoided (its B clashes with B♭).</p></div>
  <div><h3>Key ideas</h3><ul><li>Over maj7: major pentatonics on the root, 5th and 2nd.</li><li>Over dom7: major pentatonics on the root, 4th and ♭7th.</li><li>Check by spelling: every note of the pentatonic must be in the chord scale.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Over Cmaj7 play C, G and D major pentatonic, listening for the 7th and ♯11.</li><li>Over C7 play C, F and B♭ major pentatonic; hear how the ♭7 appears.</li><li>Slide the same shape to move between the three pentatonics.</li></ul></div></div>`,
 m7b5:`<div class="cols"><div><h3>Over Bm7♭5 (B D F A)</h3>${m5Table('B')}<p class="small">Assumption: the chord scale is Locrian. The root B is not in the pentatonic; play it as a target note when you want it.</p></div>
  <div><h3>Key ideas</h3><ul><li>Build the minor pentatonic on the ♭3 of the chord: Bm7♭5 → D minor pentatonic.</li><li>It contains the chord’s ♭3, ♭5 and ♭7, so the chord sound is always present.</li><li>It adds ♭9 and ♭13 (C and G), the Locrian colour notes.</li><li>D minor pentatonic = F major pentatonic: the same five notes.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the Bm7♭5 chord, then solo in D minor pentatonic around fret 10.</li><li>Find B, the root, as a target note outside the box.</li><li>Try ii–V–i in A minor: Bm7♭5 – E7 – Am.</li></ul></div></div>`,
 modepent:`<div class="cols"><div><h3>Mode pentatonics</h3>${mpTable()}<p class="small">Convention used here (other teachers do it differently): keep the chord tones of the mode’s 7th chord (1, 3rd, 5th, 7th) and one colour note; remove the other two notes. The colour note is the characteristic note of the mode: ♮6 for Dorian, ♭2 for Phrygian, ♯4 for Lydian, ♭6 for Aeolian, ♭2 for Locrian; Ionian and Mixolydian keep the 2nd.</p></div>
  <div><h3>Key ideas</h3><ul><li>Remove two notes from the seven-note mode to get five.</li><li>The kept notes give the chord sound and the mode’s colour.</li><li>The removed notes are the ones most likely to clash.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A Dorian, then the A Dorian pentatonic (A C E F♯ G).</li><li>Play E Phrygian pentatonic over an Em7 chord: hear the ♭2.</li><li>Compare C Lydian pentatonic with C major pentatonic.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 92–95: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 96 starts the next part, arpeggios and blues scales, with Arpeggios.</p></div></div>`};
