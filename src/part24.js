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

/* ===== Part 24: lessons 96-98 ===== */
const Q3=['maj','min','dim','aug'],Q7=['maj7','dom7','m7','m7b5'],QALL=[...Q3,...Q7];
const ALT={maj:'min',min:'maj',dim:'min',aug:'maj',maj7:'dom7',dom7:'maj7',m7:'m7b5',m7b5:'m7'};
const DW={'3':'3rd','b3':'♭3rd','5':'5th','b5':'♭5th','#5':'♯5th','7':'major 7th','b7':'♭7th'};
const aToks=q=>CHORDS[q].f.split(' ');
const aCtx=(qs)=>{const q=pick(qs);return hTry(()=>{const r=pick(HR),cn=chordNotes(r,q);if(!hOk(cn))return null;return{q,r,cn,sym:chordSym(r,q),toks:aToks(q),name:CHORDS[q].name}})};
const aSizePool=q=>(CHORDS[q].f.split(' ').length===3?Q3:Q7);
const aFormula=q=>aToks(q).map(hTokN).join(' ');

/* ---------- Lesson 96: arpeggios ---------- */
const a96Spell=()=>{const x=aCtx(QALL),a=x.cn.join(' '),pool=aSizePool(x.q).filter(q=>q!==x.q).map(q=>chordNotes(x.r,q).join(' ')).filter(t=>!/𝄪|𝄫/.test(t));
  return{type:'choice',noBoard:true,key:'a6s'+x.q+x.r,text:`Which notes make up the ${x.sym} arpeggio?`,choices:mc(a,pool),ans:a,hint:`${x.sym} is a ${x.name} chord: ${aFormula(x.q)}.`,
   explain:`${x.sym} = ${aFormula(x.q)} from ${x.r}: ${a}. An arpeggio plays those chord tones one at a time.`}};
const a96Tone=()=>{const x=aCtx(QALL),i=R(1,x.cn.length-1),a=x.cn[i],alt=chordNotes(x.r,ALT[x.q]),pool=[...x.cn.filter((_,j)=>j!==i),alt[i]],w=DW[x.toks[i]];
  return{type:'choice',noBoard:true,key:'a6t'+x.q+x.r+i,text:`In ${x.sym}, which note is the ${w}?`,choices:mc(a,pool),ans:a,hint:`Spell ${x.sym} from the root using its formula (${aFormula(x.q)}).`,
   explain:`${x.sym} = ${x.cn.join(' ')} (${aFormula(x.q)}). The ${w} is ${a}.`}};
const a96Qual=()=>hTry(()=>{const x=aCtx(QALL),n=x.cn.length,st=pick(n===3?SETS3:SETS4),inv=R(0,n-1),order=x.cn.map((_,i)=>(i+inv)%n),v=voicing(st,order.map(i=>pcOf(x.cn[i])),1,12,4);if(!v)return null;
  const marks=v.map((p,j)=>({s:p.s,f:p.f,t:hTok(x.toks[order[j]]),k:order[j]===0?'root':'q'})),pool=aSizePool(x.q).filter(q=>q!==x.q).map(q=>chordSym(x.r,q));
  return{type:'choice',key:`a6q${x.q}${x.r}${inv}${st[0]}`,text:`This one-note-per-string shape is an arpeggio with root ${x.r}. Which arpeggio is it?`,marks,choices:mc(x.sym,pool),ans:x.sym,notes:v.map(p=>midi(p.s,p.f)),pm:'seq',
   hint:'Read the interval labels: which combination of 3rd, 5th and 7th do they make?',
   explain:`The labels are ${order.map(i=>hTok(x.toks[i])).join(' ')} (low to high): ${aFormula(x.q)} = ${x.name}. With root ${x.r} that is ${x.sym} (${x.cn.join(' ')}), played in ${INV[inv]} on the ${setName(st)} strings.`}});
const a96Box=()=>hTry(()=>{const x=aCtx(QALL),b=hBox(x.r,x.cn.length===3?3:4,4),[lo,hi]=b.box,pts=hFPos(x.r,CHORDS[x.q].f,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<2||tg.length>8)return null;
  return{type:'multi',key:`a6b${x.q}${x.r}${b.st[0]}${lo}`,box:b.box,text:`Play the ${x.sym} arpeggio on the ${hStr(b.st)}, frets ${lo}–${hi}. The roots are marked. Click every other chord tone.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),
   targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',hint:`${x.sym} = ${aFormula(x.q)} from ${x.r}. Spell it first.`,
   explain:`${x.sym} = ${x.cn.join(' ')}. In frets ${lo}–${hi} on the ${hStr(b.st)}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const a96Click=()=>hTry(()=>{const x=aCtx(QALL),i=R(1,x.cn.length-1),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;const off=fmlSemis(CHORDS[x.q].f)[i]%12,s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),t=hClickT(rs,rf,off,[s2]);if(!t)return null;
  return{type:'click',key:`a6c${x.q}${x.r}${i}${s2}`,text:`${x.sym}: its root is marked. Click the ${DW[x.toks[i]]} of ${x.sym} (${x.cn[i]}) on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:hTok(x.toks[i])},notes:[midi(rs,rf),midi(t.s,t.f)],
   hint:`The ${DW[x.toks[i]]} is ${hSem(off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,
   explain:`${x.cn[i]} is ${hSem(off)} above ${x.r}. ${hPath(rs,rf,s2,t.f)}`}});
const a96Bank=sbank('a6b',[
 ['What is an arpeggio?','The notes of a chord played one after another',['A chord strummed fast','A scale with a chord name','A chord with extra notes'],'Arpeggio = “broken chord”: the same notes as the chord, played one at a time.'],
 ['How many different notes does a triad arpeggio have?','3',['2','4','5'],'Root, 3rd and 5th. A 7th-chord arpeggio adds the 7th: 4 notes.'],
 ['Which note do you add to a C major triad arpeggio (C E G) to get a Cmaj7 arpeggio?','B',['B♭','A','D'],'The major 7th above C is B. B♭ would give C7.'],
 ['Which note do you add to a C major triad arpeggio (C E G) to get a C7 arpeggio?','B♭',['B','A','D'],'The ♭7th above C is B♭: dominant 7th.'],
 ['What is the difference between Am7 and Am7♭5 arpeggios?','The 5th is lowered: E becomes E♭',['The 3rd is raised','The 7th is raised','The root changes'],'Am7 = A C E G; Am7♭5 = A C E♭ G.'],
 ['Which of these arpeggios has the notes C E G B?','Cmaj7',['C7','Cm7','Cm(maj7)'],'C E G is major, B is the major 7th: Cmaj7. Cm(maj7) would have E♭.'],
 ['Why practise arpeggios across several strings rather than one?','The chord tones lie in one fret area, one or two per string',['Chord notes only exist on one string','It is the only way to play in tune','One string always gives the best tone'],'The neck repeats chord tones on every string, so one position holds all of them.']]);

/* ---------- Lesson 97: soloing with arpeggios ---------- */
const a97Guide=()=>{const x=aCtx(Q7),a=hJoin([x.cn[1],x.cn[3]]),pool=[[0,1],[0,2],[0,3],[1,2],[2,3]].map(p=>hJoin(p.map(i=>x.cn[i])));
  return{type:'choice',noBoard:true,key:'a7g'+x.q+x.r,text:`Which two notes are the guide tones of ${x.sym}?`,choices:mc(a,pool),ans:a,hint:'Guide tones are the two chord tones that define the chord’s quality.',
   explain:`${x.sym} = ${x.cn.join(' ')}. The guide tones are the 3rd (${x.cn[1]}) and the 7th (${x.cn[3]}): the 3rd says major or minor, the 7th says maj7, dominant or minor 7th.`}};
const A97P=[[2,5,'ii7','V7'],[5,1,'V7','Imaj7']];
const a97Lead=()=>{const key=pick(KEASY),d=diatonic(key,'major',4),[i1,i2,l1,l2]=pick(A97P),c1=d[i1-1],c2=d[i2-1],a=c2.notes[1],pool=[...c2.notes.filter((_,j)=>j!==1),c1.notes[1]];
  return{type:'choice',noBoard:true,key:`a7l${key}${i1}`,text:`In ${key} major the chords go ${c1.sym} (${l1}) → ${c2.sym} (${l2}). The 7th of ${c1.sym} moves a half step down to which note?`,choices:mc(a,pool),ans:a,
   hint:`Find the 7th of ${c1.sym}, then go one half step down.`,explain:`${c1.sym} = ${c1.notes.join(' ')}; its 7th is ${c1.notes[3]}. A half step lower is ${a}, the 3rd of ${c2.sym} (${c2.notes.join(' ')}). Guide tones move by the smallest step.`}};
const a97Move=()=>hTry(()=>{const key=pick(KEASY),d=diatonic(key,'major',4),[i1,i2,l1,l2]=pick(A97P),c1=d[i1-1],c2=d[i2-1],n7=c1.notes[3],s=R(0,5),fs=hFrets(s,pcOf(n7),5,12);if(!fs.length)return null;const f=pick(fs);
  return{type:'click',key:`a7m${key}${i1}${s}`,text:`In ${key} major the chords go ${c1.sym} → ${c2.sym}. The 7th of ${c1.sym} (${n7}) is marked. Click the 3rd of ${c2.sym} on the same string.`,marks:[{s,f,t:'♭7',k:'q'}],target:{s,f:f-1,t:'3'},notes:[midi(s,f),midi(s,f-1)],
   hint:'Guide tones usually resolve by the smallest step. Which direction does the 7th go?',explain:`${n7} is the 7th of ${c1.sym}. It falls a half step to ${c2.notes[1]}, the 3rd of ${c2.sym}. On the same string that is one fret lower: fret ${f-1}.`}});
const a97Target=()=>hTry(()=>{const x=aCtx(Q7),i=pick([1,3]),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;const off=fmlSemis(CHORDS[x.q].f)[i]%12,s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),t=hClickT(rs,rf,off,[s2]);if(!t)return null;
  return{type:'click',key:`a7t${x.q}${x.r}${i}${s2}`,text:`The chord changes to ${x.sym}; its root is marked. Land on the ${DW[x.toks[i]]} (a guide tone, ${x.cn[i]}) on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:hTok(x.toks[i])},notes:[midi(rs,rf),midi(t.s,t.f)],
   hint:`The ${DW[x.toks[i]]} is ${hSem(off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,
   explain:`${x.cn[i]} is the ${DW[x.toks[i]]} of ${x.sym}: ${hSem(off)} above ${x.r}. ${hPath(rs,rf,s2,t.f)}`}});
const a97GT=()=>hTry(()=>{const x=aCtx(Q7),b=hBox(x.r,6,4),[lo,hi]=b.box,pts=hFPos(x.r,CHORDS[x.q].f,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t==='3'||p.t==='♭3'||p.t==='7'||p.t==='♭7');if(!marks.length||tg.length<2||tg.length>8)return null;
  return{type:'multi',key:`a7q${x.q}${x.r}${lo}`,box:b.box,text:`${x.sym}: the roots are marked. Click every guide tone (3rd and 7th) in the shaded frets ${lo}–${hi}.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(tg),
   hint:`The guide tones of ${x.sym} are ${x.cn[1]} and ${x.cn[3]}.`,explain:`${x.sym} = ${x.cn.join(' ')}. Guide tones: ${x.cn[1]} (3rd) and ${x.cn[3]} (7th). In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const A97N=[[2,5],[5,1],[6,2],[1,4],[4,5],[1,6]];
const a97Next=()=>{const key=pick(KEASY),d=diatonic(key,'major',4),[i1,i2]=pick(A97N),c1=d[i1-1],c2=d[i2-1],a=c2.notes.join(' '),pool=d.filter((_,j)=>j+1!==i2).map(c=>c.notes.join(' '));
  return{type:'choice',noBoard:true,key:`a7n${key}${i1}${i2}`,text:`Over ${c1.sym} you want to lead into the next chord, ${c2.sym}. Which notes make the arpeggio of the next chord that you can start on the last beat?`,choices:mc(a,pool),ans:a,
   hint:'You want the chord you are heading to, not the one you are leaving.',explain:`The next chord is ${c2.sym} = ${a}. Starting its arpeggio just before the change makes the move audible. ${c1.sym} (${c1.notes.join(' ')}) is the chord you are leaving.`}};
const a97Bank=sbank('a7b',[
 ['Which chord tones are called guide tones?','The 3rd and the 7th',['The root and 5th','The 5th and 9th','The root and 3rd'],'They define the chord’s quality; the root is usually in the bass and the 5th is not needed to name the chord.'],
 ['Why are the 3rd and 7th good notes to land on when the chord changes?','They tell the listener which chord is playing',['They are the loudest notes on the guitar','They are always the lowest notes','They never clash'],'Different chords usually have different 3rds and 7ths, so landing on them outlines the change.'],
 ['In a ii–V–I, the 7th of the ii chord falls by a half step to which note of the V chord?','Its 3rd',['Its root','Its 7th','Its 5th'],'In C: Dm7 (7th = C) → G7 (3rd = B).'],
 ['In a ii–V–I, the 7th of the V7 chord falls by a half step to which note of the I chord?','Its 3rd',['Its root','Its 5th','Its 7th'],'In C: G7 (7th = F) → Cmaj7 (3rd = E).'],
 ['Which chord tone is the least important for outlining a chord when soloing?','The 5th',['The 3rd','The 7th','The ♭3rd of a minor chord'],'The 5th is the same in most chords of the same family, so it does not define the quality.'],
 ['What does playing the arpeggio of the next chord early do?','It anticipates the change and leads the ear into it',['It changes the key','It makes the solo slower','It is only used in minor keys'],'You switch on the last beat so the new chord’s notes arrive just as it begins.']]);

/* ---------- Lesson 98: blues scales ---------- */
const BK={min:{sc:'blues',base:'minPent',name:'minor blues',pname:'minor pentatonic',blue:'b5',off:6,bl:'♭5'},maj:{sc:'majBlues',base:'majPent',name:'major blues',pname:'major pentatonic',blue:'b3',off:3,bl:'♭3'}};
const bCtx=(kind)=>{const k=kind||pick(['min','maj']),K=BK[k];return hTry(()=>{const r=pick(HR),sc=scaleNotes(r,K.sc),base=scaleNotes(r,K.base),blue=spellF(r,'1 '+K.blue)[1];if(!hOk(sc)||!hOk(base))return null;return{k,K,r,sc,base,blue}})};
const b98Spell=()=>{const x=bCtx(),a=x.sc.join(' '),pool=x.k==='min'?[scaleNotes(x.r,'minPent'),scaleNotes(x.r,'majBlues'),scaleNotes(x.r,'aeolian'),scaleNotes(x.r,'dorian')]:[scaleNotes(x.r,'majPent'),scaleNotes(x.r,'blues'),scaleNotes(x.r,'major'),scaleNotes(x.r,'mixolydian')];
  return{type:'choice',noBoard:true,key:'b8s'+x.k+x.r,text:`Which notes make up the ${x.r} ${x.K.name} scale?`,choices:mc(a,pool.map(p=>p.join(' '))),ans:a,hint:`${x.r} ${x.K.pname} plus one extra note: the ${x.K.bl}.`,
   explain:`${x.r} ${x.K.pname} = ${x.base.join(' ')}. Add the ${x.K.bl} (${x.blue}): ${x.r} ${x.K.name} = ${a} (${SCALES[x.K.sc].f.split(' ').map(hTokN).join(' ')}).`}};
const b98Add=()=>{const x=bCtx(),a=x.blue,pool2=['b2','2','b6','6','b7','4','b3'].map(t=>spellF(x.r,'1 '+t)[1]).filter(n=>!x.sc.includes(n)&&hNice(n));
  return{type:'choice',noBoard:true,key:'b8a'+x.k+x.r,text:`Which single note turns ${x.r} ${x.K.pname} into the ${x.r} ${x.K.name} scale?`,choices:mc(a,pool2),ans:a,hint:`The blue note is the ${x.K.bl}.`,
   explain:`${x.r} ${x.K.pname}: ${x.base.join(' ')}. The ${x.K.bl} is ${x.blue}${x.k==='min'?` (also thought of as the ♯4)`:''}. Adding it gives ${x.sc.join(' ')}.`}};
const b98Rel=()=>{const r=hRoot(q=>{const m=relMinor(q);return hNice(m)&&hOk(scaleNotes(q,'majBlues'))&&hOk(scaleNotes(m,'blues'))});const m=relMinor(r),sw=Math.random()<.5,sc=spellScale(r),
  a=sw?`${m} minor blues`:`${r} major blues`,pool=sw?[r,sc[1],sc[3],sc[4]].map(n=>`${n} minor blues`):[m,spellScale(m)[2],spellScale(m)[3],spellScale(m)[4]].map(n=>`${n} major blues`);
  return{type:'choice',noBoard:true,key:'b8r'+sw+r,text:sw?`${r} major blues has exactly the same notes as which minor blues scale?`:`${m} minor blues has exactly the same notes as which major blues scale?`,choices:mc(a,pool),ans:a,hint:'Relative major and minor share their notes: the minor root is the 6th degree of the major scale.',
   explain:`${r} major blues = ${scaleNotes(r,'majBlues').join(' ')}. ${m} minor blues = ${scaleNotes(m,'blues').join(' ')}. Same notes: ${m} is the 6th degree of ${r} major.`}};
const b98Blue=()=>hTry(()=>{const x=bCtx(),b=hBox(x.r,6,4),[lo,hi]=b.box,bp=hFPos(x.r,SCALES[x.K.base].f,b.st,lo,hi),bn=hPcs([{pc:(pcOf(x.r)+x.K.off)%12,t:x.K.bl,name:x.blue,i:0}],b.st,lo,hi);if(bn.length<1||bn.length>6)return null;
  return{type:'multi',key:`b8b${x.k}${x.r}${lo}`,box:b.box,text:`The marked notes are ${x.r} ${x.K.pname}. Click every blue note (the ${x.K.bl} of ${x.r}) in the shaded frets ${lo}–${hi} to make it ${x.K.name}.`,marks:bp.map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'ghost'})),targets:bn.map(p=>({s:p.s,f:p.f,t:x.K.bl})),notes:hNotes([...bp,...bn]),pm:'seq',
   hint:`The ${x.K.bl} is ${hSem(x.K.off)} above the root: ${x.blue}.`,explain:`${x.r} ${x.K.name} adds ${x.blue} (${x.K.bl}). In frets ${lo}–${hi}: ${bn.map(posTxt).join(', ')}.`}});
const b98Click=()=>hTry(()=>{const x=bCtx(),rs=R(0,5),rf=rootFret(x.r,rs,R(2,9));if(rf<2||rf>11)return null;const s2=pick([0,1,2,3,4,5].filter(s=>s!==rs)),t=hClickT(rs,rf,x.K.off,[s2]);if(!t)return null;
  return{type:'click',key:`b8c${x.k}${x.r}${s2}`,text:`Root of ${x.r} ${x.K.name} marked. Click its blue note (${x.blue}) on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:x.K.bl},notes:[midi(rs,rf),midi(t.s,t.f)],
   hint:`The blue note is the ${x.K.bl}: ${hSem(x.K.off)} above the root. The ${SN[rs]}→${SN[s2]} gap is ${hG(rs,s2)}.`,explain:`${x.blue} is ${hSem(x.K.off)} above ${x.r}. ${hPath(rs,rf,s2,t.f)}`}});
const b98Name=()=>hTry(()=>{const x=bCtx(),b=hBox(x.r,6,5),[lo,hi]=b.box,pts=hFPos(x.r,SCALES[x.K.sc].f,b.st,lo,hi),ts=new Set(pts.map(p=>p.t));
  if(x.k==='min'?!ts.has('♭5'):!(ts.has('♭3')&&ts.has('3')))return null;if(pts.length>22)return null;
  const a=x.K.name,pool=['minor blues','major blues','minor pentatonic','major pentatonic'];
  return{type:'choice',key:`b8n${x.k}${x.r}${lo}`,text:`These are the notes of one scale in frets ${lo}–${hi}, with root ${x.r}. Which scale is it?`,box:b.box,marks:pts.map(p=>({s:p.s,f:p.f,t:p.t,k:p.t==='R'?'root':'q'})),choices:mc(a,pool),ans:a,notes:hNotes(pts),pm:'seq',
   hint:x.k==='min'?'Which note is more than a minor pentatonic or a major scale would have?':'Look for both the ♭3 and the major 3 in the same scale.',
   explain:x.k==='min'?`The ♭5 together with ♭3 4 5 ♭7 is the minor blues: ${x.sc.join(' ')}. The minor pentatonic has no ♭5.`:`Both ♭3 and 3 appear, with 2 5 6: that is the major blues: ${x.sc.join(' ')}. The major pentatonic has no ♭3.`}});
const b98Pent=()=>hTry(()=>{const x=bCtx(),b=hBox(x.r,2,4),[lo,hi]=b.box,pts=hFPos(x.r,SCALES[x.K.sc].f,b.st,lo,hi),marks=pts.filter(p=>p.t==='R'),tg=pts.filter(p=>p.t!=='R');if(!marks.length||tg.length<3||tg.length>8)return null;
  return{type:'multi',key:`b8p${x.k}${x.r}${b.st[0]}${lo}`,box:b.box,text:`Play ${x.r} ${x.K.name} on the ${hStr(b.st)}, frets ${lo}–${hi}. The roots are marked. Click every other scale note.`,marks:marks.map(p=>({s:p.s,f:p.f,t:'R',k:'root'})),targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:hNotes(pts),pm:'seq',
   hint:`${x.r} ${x.K.name}: ${SCALES[x.K.sc].f.split(' ').map(hTokN).join(' ')}.`,explain:`${x.r} ${x.K.name} = ${x.sc.join(' ')}. In frets ${lo}–${hi}: ${tg.map(p=>`${p.name} (${SL[p.s]} ${p.f})`).join(', ')}.`}});
const b98Bank=sbank('b8b',[
 ['What is the formula of the minor blues scale?','1 ♭3 4 ♭5 5 ♭7',['1 ♭3 4 5 ♭7','1 2 ♭3 3 5 6','1 2 ♭3 4 5 ♭6 ♭7'],'Minor pentatonic (1 ♭3 4 5 ♭7) plus the ♭5 blue note.'],
 ['What is the formula of the major blues scale?','1 2 ♭3 3 5 6',['1 ♭3 4 ♭5 5 ♭7','1 2 3 5 6','1 2 3 4 5 6 7'],'Major pentatonic (1 2 3 5 6) plus the ♭3 blue note.'],
 ['How many notes does the minor blues scale have?','6',['5','7','8'],'Five pentatonic notes plus the ♭5.'],
 ['Which note is the “blue note” in the minor blues scale?','The ♭5',['The ♭3','The 4th','The ♭7'],'The ♭5 sits between the 4th and 5th, so it is usually a passing note, not a place to rest.'],
 ['In the major blues scale, which note is the blue note?','The ♭3',['The ♭5','The 6th','The 2nd'],'The ♭3 sits next to the major 3rd; sliding from ♭3 to 3 is the classic sound.'],
 ['How is the blue note usually used?','As a passing note between the 4th and 5th',['As the final note of a phrase','As the root','Only on open strings'],'It adds tension; resolve to the 4th or 5th (in the minor blues).'],
 ['A minor blues and C major blues…','contain the same six notes',['have no notes in common','share only the root','have the same root'],'A C D E♭ E G: the same set, a different tonal centre.']]);

const LS={
 arp:{h:'arpeggios',n:'Lesson 96',title:'Arpeggios',sub:'Triad and 7th-chord arpeggios: chord tones across the strings.',
  ex:[['Spell & name',[a96Spell,a96Tone,a96Bank]],['Read the shape',[a96Qual]],['On the neck',[a96Box,a96Click]]],
  test:[...rep(a96Spell,2),...rep(a96Tone,2),a96Bank,...rep(a96Qual,4),...rep(a96Box,3),...rep(a96Click,3)]},
 solo:{h:'solo-with-arpeggios',n:'Lesson 97',title:'How to solo with arpeggios',sub:'Land on guide tones (3rd and 7th) and lead into the next chord.',
  ex:[['Guide tones',[a97Guide,a97GT,a97Target,a97Bank]],['Voice leading',[a97Lead,a97Move]],['Next chord',[a97Next]]],
  test:[...rep(a97Guide,2),...rep(a97Lead,2),a97Next,a97Bank,...rep(a97GT,3),...rep(a97Move,3),...rep(a97Target,3)]},
 blues:{h:'blues-scales',n:'Lesson 98',title:'The blues scales',sub:'Minor blues = minor pentatonic + ♭5; major blues = major pentatonic + ♭3.',
  ex:[['Spell it',[b98Spell,b98Add,b98Rel,b98Bank]],['Blue notes',[b98Blue,b98Click]],['Shapes',[b98Name,b98Pent]]],
  test:[...rep(b98Spell,2),...rep(b98Add,2),b98Rel,b98Bank,...rep(b98Blue,3),...rep(b98Click,2),...rep(b98Name,2),...rep(b98Pent,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 96–98 mixed.',
  ex:[['Lesson 96',[a96Spell,a96Tone,a96Qual,a96Box,a96Click,a96Bank]],['Lessons 97–98',[a97Guide,a97GT,a97Move,a97Target,a97Next,a97Bank,b98Spell,b98Add,b98Rel,b98Blue,b98Click,b98Name,b98Pent,b98Bank]]],
  test:[a96Spell,a96Tone,a96Qual,a96Qual,a96Box,a96Click,a96Bank,a97Guide,a97Lead,a97GT,a97Move,a97Target,a97Next,b98Spell,b98Add,b98Rel,b98Blue,b98Click,b98Name,b98Pent]}};
const ORDER=['arp','solo','blues','final'],STORE='gi-best-p24';

const arpTable=qs=>`<table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${qs.map(q=>`<tr><td>${chordSym('C',q)}</td><td>${aFormula(q)}</td><td>${chordNotes('C',q).join(' ')}</td></tr>`).join('')}</tbody></table>`;
const gtTable=()=>{const d=diatonic('C','major',4);return `<table class="stack"><thead><tr><th>Chord</th><th>3rd</th><th>7th</th></tr></thead><tbody>${[2,5,1].map(i=>`<tr><td>${d[i-1].sym}</td><td>${d[i-1].notes[1]}</td><td>${d[i-1].notes[3]}</td></tr>`).join('')}</tbody></table>`};
const bluesTable=()=>`<div class="scroll"><table><thead><tr><th>Scale</th><th>Formula</th><th>In A</th><th>In C</th></tr></thead><tbody>${['minPent','blues','majPent','majBlues'].map(s=>`<tr><td>${cap(SCALES[s].name)}</td><td>${SCALES[s].f.split(' ').map(hTokN).join(' ')}</td><td>${scaleNotes('A',s).join(' ')}</td><td>${scaleNotes('C',s).join(' ')}</td></tr>`).join('')}</tbody></table></div>`;
const NOTES={
 arp:`<div class="cols"><div><h3>Triads and 7th chords</h3>${arpTable([...Q3,...Q7])}</div>
  <div><h3>Key ideas</h3><ul><li>An arpeggio is the chord played one note at a time: 3 notes for a triad, 4 for a 7th chord.</li><li>On guitar the chord tones sit in one fret area with one or two notes per string.</li><li>Change one note of a shape and the quality changes: ♮7 → ♭7 turns maj7 into 7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C, Cmaj7, C7 and Cm7 arpeggios in one position, changing a single note each time.</li><li>Pick up and down across adjacent strings, naming each chord tone.</li><li>Find every root in the box first, then the 3rds.</li></ul></div></div>`,
 solo:`<div class="cols"><div><h3>Guide tones in a ii–V–I (C)</h3>${gtTable()}<p class="small">Notice the voice leading: C (7th of Dm7) → B (3rd of G7), and F (7th of G7) → E (3rd of Cmaj7): each moves a half step down.</p></div>
  <div><h3>Key ideas</h3><ul><li>Target a chord tone, ideally the 3rd or 7th, on the first beat of each new chord.</li><li>Guide tones define the chord; the 5th does not.</li><li>Begin the next chord’s arpeggio on the last beat before the change to lead into it.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Over Dm7 – G7 – Cmaj7 play only 3rds and 7ths, one per bar.</li><li>Add the other chord tones around them as an arpeggio.</li><li>Play the arpeggio of G7 on beat 4 of the Dm7 bar.</li></ul></div></div>`,
 blues:`<div class="cols"><div><h3>Blues scales</h3>${bluesTable()}<p class="small">Assumption: “blues scales” means the common six-note minor blues and the six-note major blues; the blue note is the ♭5 (minor) or ♭3 (major).</p></div>
  <div><h3>Key ideas</h3><ul><li>Minor blues = minor pentatonic + ♭5.</li><li>Major blues = major pentatonic + ♭3.</li><li>A minor blues and C major blues have the same notes: relative scales.</li><li>Use the blue note as a passing note, not a place to stop.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play A minor pentatonic, then add E♭ between D and E.</li><li>Play C major pentatonic and slide from E♭ up to E.</li><li>Play both blues scales in the same position and compare.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 96–98: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 99 starts the next part, melodic and harmonic minor, with the Melodic Minor Scale.</p></div></div>`};
