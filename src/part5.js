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
/* ===== Part 5: lessons 16–20 (Triads) ===== */
const alt1=(n,fl,idx,delta)=>{const m=n.slice();m[idx]=pcName(pcOf(n[idx])+delta,fl);return m};
const fmtN=n=>n.join(' – ');

/* ---- theory generators ---- */
function gSpell(qs){return function(){const q=pick(qs),root=pick(RTS(q)),n=chordNotes(root,q),fl=n.some(x=>x.includes('♭'))||flatish(root),a=fmtN(n);
  const pool=TQ.filter(x=>x!==q).map(x=>chordNotes(root,x)).filter(m=>m.every(okN)).map(fmtN);
  for(const i of [1,2])for(const dl of [1,-1])pool.push(fmtN(alt1(n,fl,i,dl)));
  return{type:'choice',noBoard:true,key:'sp'+q+root,text:`Which notes spell the ${trn(root,q)} triad (root, 3rd, 5th)?`,choices:mc(a,pool),ans:a,
   hint:`Start from ${root}. The 3rd is a ${TIV[q][0]} up, the 5th is ${art(TIV[q][1])} ${TIV[q][1]} up. Use consecutive letters.`,
   explain:`${trn(root,q)} = ${CHORDS[q].f.replace(/b/g,'♭').replace(/#/g,'♯')}: ${n.join(' ')}. The 3rd is ${art(TIV[q][0])} ${TIV[q][0]} above ${root} (${n[1]}), the 5th is ${art(TIV[q][1])} ${TIV[q][1]} above (${n[2]}).`}}}
function gTone(qs){return function(){const q=pick(qs),root=pick(RTS(q)),d=R(1,2),n=chordNotes(root,q),a=n[d],fl=n.some(x=>x.includes('♭'))||flatish(root);
  const pool=[pcName(pcOf(a)+1,fl),pcName(pcOf(a)-1,fl),n[3-d],pcName(pcOf(a)+2,fl)];if(NN[pcOf(a)]!==a)pool.push(NN[pcOf(a)]);
  return{type:'choice',noBoard:true,key:`tn${q}${root}${d}`,text:`Which note is the ${TONE[d]} of the ${trn(root,q)} triad? (Use the correct letter name.)`,choices:mc(a,pool),ans:a,
   hint:`Count ${d===1?'3':'5'} letters from ${root} (${root} = 1), then adjust the accidental to make ${art(TIV[q][d-1])} ${TIV[q][d-1]}.`,
   explain:`${trn(root,q)}: ${n.join(' ')}. The ${TONE[d]} is ${art(TIV[q][d-1])} ${TIV[q][d-1]} above ${root}: ${a}.${NN[pcOf(a)]!==a?` (Not ${NN[pcOf(a)]}: the letter must be the ${d===1?'3rd':'5th'} one after ${root}.)`:''}`}}}
function gStack(qs){return function(){const q=pick(qs),root=pick(RTS(q)),m=R(0,2),n=chordNotes(root,q),
  t1=TSEM[q][0]===4?'major 3rd':'minor 3rd',t2=TSEM[q][1]-TSEM[q][0]===4?'major 3rd':'minor 3rd',A=['major 3rd + minor 3rd','minor 3rd + major 3rd','minor 3rd + minor 3rd','major 3rd + major 3rd'];
  const ex=`${trn(root,q)} = ${n.join(' ')}: ${root}→${n[1]} is ${art(t1)} ${t1}, ${n[1]}→${n[2]} is ${art(t2)} ${t2}.`;
  if(m===0){const a=trn(root,q);return{type:'choice',noBoard:true,key:`sa${q}${root}`,text:`Start on ${root}. Stack ${art(t1)} ${t1}, then ${art(t2)} ${t2} on top of it. Which triad do you have?`,choices:mc(a,TQ.map(x=>trn(root,x))),ans:a,hint:'Compare the two stacked thirds with the four triads you know.',explain:ex}}
  if(m===1){const a=`${t1} + ${t2}`;return{type:'choice',noBoard:true,key:`sb${q}${root}`,text:`Which two stacked 3rds (root→3rd, then 3rd→5th) build the ${trn(root,q)} triad?`,choices:mc(a,A),ans:a,hint:`Spell ${root} ${TN[q]}, then measure each step.`,explain:ex}}
  return{type:'choice',noBoard:true,key:`sc${q}${root}`,text:`In the ${trn(root,q)} triad (${n.join(' ')}), which interval lies between the 3rd (${n[1]}) and the 5th (${n[2]})?`,choices:mc(t2,['major 3rd','minor 3rd','perfect 4th','major 2nd']),ans:t2,hint:`Count the semitones from ${n[1]} to ${n[2]}.`,explain:ex}}}
const ALT=[['maj','min',1,-1],['min','maj',1,1],['maj','aug',2,1],['aug','maj',2,-1],['min','dim',2,-1],['dim','min',2,1]];
const altTxt=(d,dl)=>`${dl<0?'Lower':'Raise'} the ${TONE[d]} by a half step`;
function gAlterT(sel){const prs=ALT.filter(sel);return function(){for(let i=0;i<200;i++){const[a,b,d,dl]=pick(prs),root=pick(RTS(a).filter(r=>RTS(b).includes(r))),na=chordNotes(root,a),nb=chordNotes(root,b),ans=altTxt(d,dl);
  return{type:'choice',noBoard:true,key:`at${a}${b}${root}`,text:`To turn ${trn(root,a)} into ${trn(root,b)}, which single change do you make?`,choices:mc(ans,[altTxt(1,-1),altTxt(1,1),altTxt(2,-1),altTxt(2,1)]),ans,hint:'Compare the two formulas: only one chord tone differs.',
   explain:`${trn(root,a)} = ${na.join(' ')}; ${trn(root,b)} = ${nb.join(' ')}. Only the ${TONE[d]} changes (${na[d]} → ${nb[d]}): ${altTxt(d,dl).toLowerCase()}.`}}}}
function gIdNotes(qs){return function(){const q=pick(qs),root=pick(RTS(q)),n=chordNotes(root,q),a=trn(root,q);
  return{type:'choice',noBoard:true,key:'id'+q+root,text:`The notes ${fmtN(n)} (root first) make which triad?`,choices:mc(a,TQ.map(x=>trn(root,x))),ans:a,hint:`Measure root→3rd and root→5th in semitones.`,
   explain:`${root}→${n[1]} = ${TSEM[q][0]} semitones (${TIV[q][0]}), ${root}→${n[2]} = ${TSEM[q][1]} semitones (${TIV[q][1]}): ${a}.`}}}
const augName=pc=>[NNF[pc],NN[pc]].find(r=>chordNotes(r,'aug').every(okN))||NNF[pc];
function gAugSame(){const root=pick(RTS('aug')),p=pcOf(root),o=pick([4,8]),a=augName((p+o)%12)+' augmented',own=[p,(p+4)%12,(p+8)%12];
  const pool=[0,1,2,3,4,5,6,7,8,9,10,11].filter(x=>!own.includes(x)).map(x=>augName(x)+' augmented');
  return{type:'choice',noBoard:true,key:'as'+root+o,text:`Which augmented triad contains exactly the same three pitches as ${root} augmented?`,choices:mc(a,pool),ans:a,hint:'Add 4 frets to each note of the chord and see what you get.',
   explain:`${root} augmented = ${chordNotes(root,'aug').join(' ')}. The notes are equally spaced (4 frets), so each one can be the root: ${root}+, ${augName((p+4)%12)}+ and ${augName((p+8)%12)}+ are the same three pitches.`}}

/* ---- fretboard generators ---- */
function gClick(qs){return function(){for(let i=0;i<800;i++){const q=pick(qs),root=pick(RTS(q)),s1=R(0,4),s2=s1+R(1,2),d=R(1,2);if(s2>5)continue;const f=rootFret(root,s1,1);if(f<1||f>12)continue;
  const sem=TSEM[q][d-1],t=shapeFret(s1,f,s2,sem);if(t<0||t>15||Math.abs(t-f)>4)continue;const n=chordNotes(root,q),dd=sem-gap(s1,s2);
  return{type:'click',key:`ck${q}${root}${s1}${s2}${d}`,text:`Root of ${trn(root,q)}: ${wh(root,s1,f)} (marked). Click its ${TONE[d]} (${n[d]}) on the ${SN[s2]} string, within 4 frets of the root.`,marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:t,t:TLB[q][d]},notes:[midi(s1,f),midi(s2,t)],
   hint:`${cap(art(TIV[q][d-1]))} ${TIV[q][d-1]} is ${sem} semitones above the root; the ${SN[s1]}→${SN[s2]} string gap already covers ${gap(s1,s2)} of them.`,
   explain:`${n[d]} is ${art(TIV[q][d-1])} ${TIV[q][d-1]} (${sem} semitones) above ${root}. The ${SN[s1]}→${SN[s2]} gap is ${gap(s1,s2)} semitones, so ${sem} − ${gap(s1,s2)} = ${dd<0?'−'+(-dd):dd}: ${dd===0?'the same fret as the root':offTxt(dd)+' than the root'}, fret ${t}.${crossGB(s1,s2)?' (The G–B gap is 4, not 5.)':''}`}}}}
function gString(qs){return function(){for(let i=0;i<800;i++){const q=pick(qs),root=pick(RTS(q)),s=R(0,5),f=rootFret(root,s,1);if(f<1||f>7)continue;const n=chordNotes(root,q),[a,b]=TSEM[q];
  return{type:'multi',key:`gs${q}${root}${s}`,text:`Root of ${trn(root,q)}: ${wh(root,s,f)} (marked). Click its 3rd (${n[1]}) and 5th (${n[2]}) higher up the same string.`,marks:[{s,f,t:'R',k:'root'}],targets:[{s,f:f+a,t:TLB[q][1]},{s,f:f+b,t:TLB[q][2]}],notes:[midi(s,f),midi(s,f+a),midi(s,f+b)],
   hint:'On one string each fret is one semitone. Use the interval sizes of the triad.',explain:`${trn(root,q)} = ${n.join(' ')}. The 3rd is ${a} frets above the root (fret ${f+a}); the 5th is ${b} frets above (fret ${f+b}).`}}}}
function gFill(qs,invs=[0],any=false,sets=SETS3){return function(){const o=rShape(qs,invs,sets),{q,root,set,inv,sh,n}=o,gi=any?R(0,2):sh.findIndex(p=>p.deg===0),g=sh[gi],rest=sh.filter((_,i)=>i!==gi);
  return{type:'multi',key:'fl'+shKey(o)+gi,box:boxOfSh(sh),text:`${trn(root,q)} triad in ${INVN[inv]} on the ${strTxt(set)}. The marked note is the ${TONE[g.deg]} (${g.name}). Click the other two chord tones on the ${strTxt(rest.map(p=>p.s))} inside the shaded frets.`,
   marks:[{s:g.s,f:g.f,t:g.t,k:g.deg===0?'root':'q'}],targets:rest.map(p=>({s:p.s,f:p.f,t:p.t})),notes:mNotes(sh),
   hint:any?`First decide where the root of the triad is, then spell the chord: ${n.join(' ')}.`:`Spell the chord first (${n.join(' ')}), then find each note on its string inside the shaded frets.`,
   explain:`${trn(root,q)} = ${n.join(' ')}. This shape: ${shTxt(sh)}.`}}}
function gName(qs,opts,invs=[0]){return function(){const o=rShape(qs,invs),{q,root,sh,n,inv}=o,a=TN[q]+' triad';
  return{type:'choice',key:'gn'+shKey(o),text:`The note marked R is the root of this triad${inv===0?' (root position)':''}. What type of triad is it?`,
   marks:sh.map(p=>p.deg===0?{s:p.s,f:p.f,t:'R',k:'root'}:{s:p.s,f:p.f,t:'?',k:'q'}),choices:mc(a,opts.filter(x=>x!==q).map(x=>TN[x]+' triad').concat([a])),ans:a,notes:mNotes(sh),
   hint:'Measure from the root to each of the other notes in semitones (frets on one string, adjusted for the string gaps).',
   explain:`The shape is ${trn(root,q)}: ${shTxt(sh)}. Above ${root}, ${n[1]} is ${TSEM[q][0]} semitones (${TIV[q][0]}) and ${n[2]} is ${TSEM[q][1]} semitones (${TIV[q][1]}): ${a}.`}}}
function gNameSym(qs){return function(){const o=rShape(qs,[0]),{q,root,sh,n}=o,a=trn(root,q);
  return{type:'choice',key:'ns'+shKey(o),text:'These marked notes form a root-position triad (the lowest note is the root). Which chord is it?',marks:sh.map(p=>({s:p.s,f:p.f,t:p.name,k:p.deg===0?'root':'q'})),choices:mc(a,TQ.map(x=>trn(root,x))),ans:a,notes:mNotes(sh),
   hint:'Take the lowest note as the root and measure the other two notes against it.',explain:`Notes ${n.join(' ')}: ${root}→${n[1]} is ${art(TIV[q][0])} ${TIV[q][0]} and ${root}→${n[2]} is ${art(TIV[q][1])} ${TIV[q][1]}, so it is ${a}${q==='maj'?' (no suffix: just '+root+')':' ('+trSym(root,q)+')'}.`}}}
function gAll(qs,nStr=3){return function(){for(let i=0;i<800;i++){const q=pick(qs),root=pick(RTS(q)),a=R(0,6-nStr),st=[...Array(nStr).keys()].map(x=>a+x),lo=R(1,10),hi=lo+4,n=chordNotes(root,q),pcs=n.map(pcOf),tg=pcsPositions(pcs,st,lo,hi);if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`ga${q}${root}${st.join('')}${lo}`,box:[lo,hi],text:`Click every note of the ${trn(root,q)} triad (${n.join(' ')}) on the ${strTxt(st)} inside the shaded frets ${lo}–${hi}.`,marks:[],targets:tg.map(p=>({...p,t:TLB[q][pcs.indexOf(pcAt(p.s,p.f))]})),notes:sortSh(tg).map(p=>midi(p.s,p.f)),
   hint:`Find ${n[0]}, ${n[1]} and ${n[2]} on each string, but only inside the box.`,explain:`${n.join(' ')} inside frets ${lo}–${hi}: ${sortSh(tg).map(p=>`${n[pcs.indexOf(pcAt(p.s,p.f))]} (${SN[p.s]}, fret ${p.f})`).join(', ')}.`}}}}
function gAlterC(sel){const prs=ALT.filter(sel);return function(){const[a,b,d,dl]=pick(prs),o=rShape([a],[0],SETS3,),root=o.root;
  const root2=RTS(b).includes(root)?root:null;let oo=o;if(!root2){for(let i=0;i<500;i++){oo=rShape([a],[0]);if(RTS(b).includes(oo.root))break}}
  const{sh,root:rt,set}=oo,p=sh.find(x=>x.deg===d),t=p.f+dl;
  if(t<0||t>15||sh.some(x=>x.s===p.s&&x.f===t))return gAlterC(sel)();
  const na=chordNotes(rt,a),nb=chordNotes(rt,b);
  return{type:'click',key:`ac${a}${b}${rt}${set.join('')}${p.f}`,text:`This is ${trn(rt,a)} in root position. Change one note by one fret to make ${trn(rt,b)}: click where that note moves to.`,marks:sh.map(x=>({s:x.s,f:x.f,t:x.t,k:x.deg===0?'root':'q'})),target:{s:p.s,f:t,t:TLB[b][d]},notes:mNotes(sh),
   hint:'Compare the two formulas: which chord tone differs, and in which direction?',explain:`${trn(rt,a)} = ${na.join(' ')}; ${trn(rt,b)} = ${nb.join(' ')}. The ${TONE[d]} ${na[d]} moves a half step ${dl<0?'down':'up'} to ${nb[d]}: on the ${SN[p.s]} string that is fret ${p.f} → fret ${t}.`}}}
function gMove(qs){return function(){for(let i=0;i<800;i++){const q=pick(qs),rts=RTS(q),r1=pick(rts),s=R(0,5),f1=rootFret(r1,s,1);if(f1<1||f1>12)continue;const d=pick([-5,-4,-3,-2,-1,1,2,3,4,5]),f2=f1+d;if(f2<1||f2>15)continue;
  const r2=rts.find(r=>pcOf(r)===pcAt(s,f2));if(!r2)continue;const a=trn(r2,q),pool=rts.filter(r=>[1,2,10,11].includes((pcOf(r)-pcOf(r2)+12)%12)).map(r=>trn(r,q)).concat([trn(r1,q)]);
  return{type:'choice',key:`mv${q}${r1}${s}${d}`,text:`You play ${/^[AEF]/.test(r1)?'an':'a'} ${trn(r1,q)} shape with its root on the ${SN[s]} string at fret ${f1}. You slide the whole shape ${fr(Math.abs(d))} ${d>0?'up':'down'} (new root marked). Which triad is it now?`,marks:[{s,f:f1,t:'R',k:'ghost'},{s,f:f2,t:'R',k:'root'}],choices:mc(a,pool),ans:a,
   hint:'The shape stays the same: name the new root note, keep the quality.',explain:`Fret ${f2} of the ${SN[s]} string is ${r2}. Same shape, new root: ${a}.`}}
  return gMove(qs)()}}
const bank=(pre,items)=>sbank(pre,items);

const bank16=bank('b16',[
 ['What is a triad?','A three-note chord: root, 3rd and 5th',['Any chord played on three strings','Two notes a 3rd apart','Three chords in a row'],'A triad stacks a 3rd on the root, then another 3rd on top: root, 3rd, 5th.'],
 ['What is the formula of a major triad?','1 3 5',['1 ♭3 5','1 3 ♯5','1 ♭3 ♭5'],'Degrees 1, 3 and 5 of the major scale built on the root.'],
 ['Which two intervals above the root make a major triad?','Major 3rd and perfect 5th',['Minor 3rd and perfect 5th','Major 3rd and augmented 5th','Perfect 4th and perfect 5th'],'Root + major 3rd (4 frets) + perfect 5th (7 frets).'],
 ['How many semitones (frets on one string) is the 3rd above the root of a major triad?','4',['3','5','7'],'A major 3rd is 4 semitones.'],
 ['How many semitones is the 5th above the root of a major triad?','7',['6','8','5'],'A perfect 5th is 7 semitones.'],
 ['Which stacked 3rds build a major triad?','Major 3rd + minor 3rd',['Minor 3rd + major 3rd','Minor 3rd + minor 3rd','Major 3rd + major 3rd'],'4 + 3 = 7 semitones from root to 5th.'],
 ['Which chord symbol means a major triad?','C',['Cm','C°','C+'],'No suffix means major. m = minor, ° = diminished, + = augmented.'],
 ['You slide a major triad shape up 2 frets on the same strings. What do you get?','The major triad a whole step higher',['The same chord','The minor triad on the same root','The relative minor'],'The shape is movable: the root fret decides the chord name.'],
 ['Which scale degrees form the triad built on the root of a major scale?','1, 3 and 5',['1, 2 and 3','1, 4 and 5','1, 3 and 7'],'Skip one scale note between each chord tone: 1 (skip 2) 3 (skip 4) 5.']]);
const bank17=bank('b17',[
 ['What is the formula of a minor triad?','1 ♭3 5',['1 3 5','1 ♭3 ♭5','1 3 ♯5'],'The 3rd is lowered by a half step compared with major.'],
 ['Which note decides whether a triad sounds major or minor?','The 3rd',['The root','The 5th','The octave'],'Root and 5th are the same in both; the 3rd makes the difference.'],
 ['How many semitones is the 3rd above the root of a minor triad?','3',['4','5','2'],'A minor 3rd is 3 semitones (3 frets on one string).'],
 ['A minor triad is a major triad with…','the 3rd lowered by a half step',['the 5th lowered by a half step','the 3rd raised by a half step','the root lowered by a half step'],'C E G → C E♭ G.'],
 ['Which stacked 3rds build a minor triad?','Minor 3rd + major 3rd',['Major 3rd + minor 3rd','Minor 3rd + minor 3rd','Major 3rd + major 3rd'],'3 + 4 = 7 semitones from root to 5th: still a perfect 5th.'],
 ['Which chord symbol means a minor triad?','Cm',['C','C°','C+'],'Also written Cmin or C−.'],
 ['Which interval do major and minor triads share?','A perfect 5th above the root',['A minor 3rd above the root','A major 3rd above the root','A diminished 5th above the root'],'Both have root-to-5th = 7 semitones. Only the 3rd differs.'],
 ['Which note changes when you turn C major (C E G) into C minor?','E becomes E♭',['G becomes G♯','C becomes C♯','E becomes F'],'Lower the 3rd by a half step: C E♭ G.'],
 ['In a minor triad on A (A C E), which note is the minor 3rd?','C',['E','A','B'],'C is 3 semitones above A.']]);
const bank18=bank('b18',[
 ['What is the formula of a diminished triad?','1 ♭3 ♭5',['1 ♭3 5','1 3 ♭5','1 3 ♯5'],'A minor triad with the 5th lowered by a half step.'],
 ['Which interval is root to 5th in a diminished triad?','Diminished 5th (tritone)',['Perfect 5th','Augmented 5th','Minor 6th'],'6 semitones, half an octave.'],
 ['How many semitones is the 5th above the root of a diminished triad?','6',['7','8','5'],'♭5 = 6 semitones.'],
 ['Which stacked 3rds build a diminished triad?','Minor 3rd + minor 3rd',['Major 3rd + minor 3rd','Minor 3rd + major 3rd','Major 3rd + major 3rd'],'3 + 3 = 6 semitones.'],
 ['Compared with a minor triad, a diminished triad has…','a lowered 5th',['a raised 5th','a raised 3rd','a lowered 3rd'],'Cm = C E♭ G, C° = C E♭ G♭.'],
 ['Which chord symbol means a diminished triad?','C°',['C','Cm','C+'],'Also written Cdim.'],
 ['Which degree of the major scale carries a diminished triad?','The 7th (vii°)',['The 4th','The 2nd','The 1st'],'In C major: B D F.'],
 ['How does a diminished triad usually sound?','Tense and unstable',['Bright and settled','Open and hollow','Fully at rest'],'The tritone between root and 5th wants to resolve.'],
 ['Which notes make B diminished?','B – D – F',['B – D – F♯','B – D♯ – F♯','B♭ – D – F'],'B→D is 3 semitones, B→F is 6 semitones.'],
 ['Which of these does a diminished triad NOT contain?','A perfect 5th',['A minor 3rd','A diminished 5th','A root'],'Its 5th is lowered to a diminished 5th.']]);
const bank19=bank('b19',[
 ['What is the formula of an augmented triad?','1 3 ♯5',['1 3 5','1 ♭3 ♯5','1 3 ♭5'],'A major triad with the 5th raised by a half step.'],
 ['How many semitones is the 5th above the root of an augmented triad?','8',['7','6','9'],'♯5 = 8 semitones.'],
 ['Which stacked 3rds build an augmented triad?','Major 3rd + major 3rd',['Major 3rd + minor 3rd','Minor 3rd + major 3rd','Minor 3rd + minor 3rd'],'4 + 4 = 8 semitones.'],
 ['Compared with a major triad, an augmented triad has…','a raised 5th',['a lowered 5th','a lowered 3rd','a raised 3rd'],'C E G → C E G♯.'],
 ['Which chord symbol means an augmented triad?','C+',['C','Cm','C°'],'Also written Caug or C(♯5).'],
 ['Why can every note of an augmented triad act as its root?','The notes are equally spaced, 4 frets apart',['It has no 3rd','It uses only natural notes','It contains two perfect 5ths'],'4 + 4 + 4 = 12: the triad cuts the octave into three equal parts.'],
 ['How many different augmented triads (different sets of three pitches) exist?','4',['3','6','12'],'12 notes ÷ 3 notes per chord = 4 sets: C+/E+/G♯+, D♭+/F+/A+, D+/F♯+/A♯+, E♭+/G+/B+.'],
 ['Which scale produces only augmented triads when stacked in 3rds?','Whole-tone scale',['Major scale','Natural minor scale','Pentatonic scale'],'Every 3rd in a whole-tone scale is 2 whole steps = a major 3rd.'],
 ['You slide an augmented triad shape up 4 frets on the same strings. What do you get?','The same three notes in a different order',['A diminished triad','Three new notes','A minor triad'],'C E G♯ moved up a major 3rd gives E G♯ C: the same pitches.']]);
const bank20=bank('b20',[
 ['Which triad has a major 3rd and a perfect 5th?','Major',['Minor','Diminished','Augmented'],'Major: 1 3 5.'],
 ['Which triad has a minor 3rd and a perfect 5th?','Minor',['Major','Diminished','Augmented'],'Minor: 1 ♭3 5.'],
 ['Which triad has a minor 3rd and a diminished 5th?','Diminished',['Major','Minor','Augmented'],'Diminished: 1 ♭3 ♭5.'],
 ['Which triad has a major 3rd and an augmented 5th?','Augmented',['Major','Minor','Diminished'],'Augmented: 1 3 ♯5.'],
 ['Which triad has the widest span from root to 5th?','Augmented (8 semitones)',['Major (7)','Minor (7)','Diminished (6)'],'Aug 8, major and minor 7, diminished 6.'],
 ['Which two triads share a perfect 5th above the root?','Major and minor',['Major and augmented','Minor and diminished','Diminished and augmented'],'Both have 7 semitones from root to 5th.'],
 ['Which two triads share a minor 3rd above the root?','Minor and diminished',['Major and augmented','Major and minor','Minor and augmented'],'Both have 3 semitones from root to 3rd.'],
 ['Which triad cuts the octave into three equal 4-fret parts?','Augmented',['Diminished','Major','Minor'],'4 + 4 + 4 = 12.'],
 ['Which triad has a tritone between its root and 5th?','Diminished',['Augmented','Major','Minor'],'6 semitones from root to 5th.'],
 ['Which list orders the triads by root-to-5th span, smallest first?','Diminished, major and minor, augmented',['Augmented, major and minor, diminished','Major, minor, diminished, augmented','Minor, diminished, major, augmented'],'6, 7 and 7, 8 semitones.']]);

const AL=['maj','min','dim','aug'];
const spMaj=gSpell(['maj']),spMin=gSpell(['min']),spDim=gSpell(['dim']),spAug=gSpell(['aug']),spAll=gSpell(AL);
const tnMaj=gTone(['maj']),tnMin=gTone(['min']),tnDim=gTone(['dim']),tnAug=gTone(['aug']),tnAll=gTone(AL);
const stMaj=gStack(['maj']),stMin=gStack(['min']),stDim=gStack(['dim']),stAug=gStack(['aug']),stAll=gStack(AL);
const ckMaj=gClick(['maj']),ckMin=gClick(['min']),ckDim=gClick(['dim']),ckAug=gClick(['aug']),ckAll=gClick(AL);
const gsMaj=gString(['maj']),gsMin=gString(['min']),gsDim=gString(['dim']),gsAug=gString(['aug']),gsAll=gString(AL);
const flMaj=gFill(['maj']),flMin=gFill(['min']),flDim=gFill(['dim']),flAug=gFill(['aug']),flAll=gFill(AL),flAny=gFill(AL,[0],true);
const gaMaj=gAll(['maj']),gaMin=gAll(['min']),gaDim=gAll(['dim']),gaAug=gAll(['aug']),gaAll=gAll(AL);
const nmMaj=gName(['maj','min'],['maj','min']),nmMin=gName(['maj','min'],['maj','min']),nmDim=gName(['min','dim','maj'],['maj','min','dim']),nmAug=gName(AL,AL),nmAll=gName(AL,AL);
const nsAll=gNameSym(AL);
const atMin=gAlterT(a=>a[0]!=='dim'&&a[0]!=='aug'&&a[1]!=='dim'&&a[1]!=='aug'),atDim=gAlterT(a=>a[0]==='min'&&a[1]==='dim'||a[0]==='dim'),atAug=gAlterT(a=>a[0]==='aug'||a[1]==='aug'),atAll=gAlterT(()=>true);
const acMin=gAlterC(a=>a[0]!=='dim'&&a[0]!=='aug'&&a[1]!=='dim'&&a[1]!=='aug'),acDim=gAlterC(a=>a[0]==='min'&&a[1]==='dim'||a[0]==='dim'),acAug=gAlterC(a=>a[0]==='aug'||a[1]==='aug'),acAll=gAlterC(()=>true);
const idDim=gIdNotes(['min','dim']),idAug=gIdNotes(['maj','aug']),idAll=gIdNotes(AL);
const mvMaj=gMove(['maj']),mvMin=gMove(['min']),mvAll=gMove(AL);

const LS={
 maj:{h:'major-triads',n:'Lesson 16',title:'Major triads',sub:'Root, major 3rd and perfect 5th: spelling a major triad and finding it on the neck.',
  ex:[['Theory',[bank16,tnMaj,stMaj]],['Spell it',[spMaj]],['On the neck',[ckMaj,gsMaj,flMaj,gaMaj]],['Name & move',[nmMaj,mvMaj]]],
  test:[...rep(bank16,2),...rep(spMaj,2),tnMaj,stMaj,...rep(ckMaj,2),...rep(gsMaj,2),...rep(flMaj,3),gaMaj,nmMaj]},
 min:{h:'minor-triads',n:'Lesson 17',title:'Minor triads',sub:'Root, minor 3rd and perfect 5th: the major triad with a lowered 3rd.',
  ex:[['Theory',[bank17,tnMin,stMin,atMin]],['Spell it',[spMin]],['On the neck',[ckMin,gsMin,flMin,gaMin]],['Major ↔ minor',[acMin,nmMin,mvMin]]],
  test:[...rep(bank17,2),...rep(spMin,2),tnMin,atMin,...rep(ckMin,2),gsMin,...rep(flMin,2),gaMin,...rep(acMin,2),nmMin]},
 dim:{h:'diminished-triads',n:'Lesson 18',title:'Diminished triads',sub:'Root, minor 3rd and diminished 5th: two minor 3rds stacked.',
  ex:[['Theory',[bank18,tnDim,stDim,atDim]],['Spell it',[spDim,idDim]],['On the neck',[ckDim,gsDim,flDim,gaDim]],['Minor → diminished',[acDim,nmDim]]],
  test:[...rep(bank18,2),spDim,idDim,tnDim,atDim,...rep(ckDim,2),gsDim,...rep(flDim,2),gaDim,...rep(acDim,2),nmDim]},
 aug:{h:'augmented-triads',n:'Lesson 19',title:'Augmented triads',sub:'Root, major 3rd and augmented 5th: two major 3rds stacked.',
  ex:[['Theory',[bank19,tnAug,stAug,atAug]],['Spell it',[spAug,idAug]],['On the neck',[ckAug,gsAug,flAug,gaAug]],['Major → augmented',[acAug,nmAug,gAugSame]]],
  test:[...rep(bank19,2),spAug,idAug,tnAug,gAugSame,...rep(ckAug,2),gsAug,...rep(flAug,2),gaAug,...rep(acAug,2),nmAug]},
 cmp:{h:'triads-compared',n:'Lesson 20',title:'Four triad types compared',sub:'Major, minor, diminished and augmented side by side.',
  ex:[['Compare',[bank20,stAll,atAll]],['Spell & identify',[spAll,idAll,tnAll]],['On the neck',[nmAll,nsAll,flAny,ckAll]],['Build it',[gaAll,gsAll,acAll,mvAll]]],
  test:[...rep(bank20,2),spAll,idAll,atAll,stAll,...rep(nmAll,2),nsAll,flAny,ckAll,gsAll,gaAll,...rep(acAll,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 16–20 mixed.',
  ex:[['Theory',[bank16,bank17,bank18,bank19,bank20,spAll,tnAll,stAll,atAll,idAll,gAugSame]],['On the neck',[ckAll,gsAll,flAll,flAny,gaAll,nmAll,nsAll,acAll,mvAll]]],
  test:[bank16,bank19,bank20,spAll,tnAll,atAll,idAll,gAugSame,ckAll,ckAll,gsAll,flAll,flAny,gaAll,nmAll,nmAll,nsAll,acAll,acAll,mvAll]}};
const ORDER=['maj','min','dim','aug','cmp','final'],STORE='gi-best-p5';

const triRows=(q,roots)=>roots.map(r=>`<tr><td>${trSym(r,q)}</td><td>${chordNotes(r,q).join(' ')}</td></tr>`).join('');
const triTab=(q,roots)=>`<table class="stack"><thead><tr><th>Chord</th><th>Notes (1 – 3 – 5)</th></tr></thead><tbody>${triRows(q,roots)}</tbody></table>`;
const shLine=(r,q,set,lo)=>{const s=shapeOf(r,q,0,set,lo);return s?`${trn(r,q)} on the ${setName(set)} strings (low→high): frets ${s.map(p=>p.f).join('-')}`:''};
const cShape=(q,r)=>shLine(r,q,[2,3,4],6)||shLine(r,q,[2,3,4],1);
const NOTES={
 maj:`<div class="cols"><div><h3>Major triads</h3>${triTab('maj',['C','G','D','A','E','F','B♭'])}<p>Formula <b>1 3 5</b> = major 3rd (4 frets) + minor 3rd (3 frets).</p></div>
  <div><h3>Key ideas</h3><ul><li>A triad is three notes: the root, a 3rd above it and a 5th above it.</li><li>The major triad uses the major 3rd (4 semitones) and the perfect 5th (7 semitones).</li><li>Spell triads with consecutive letters: C, E, G (never C, F♭, G).</li><li>No suffix in a chord symbol means major.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','maj',[2,3,4],6)}. Say “root, 3rd, 5th” as you play each string.</li><li>Slide that shape up 2 frets: D major. Name the chord at every fret.</li><li>Find C, E and G on one string: frets 0 4 7 above any C.</li></ul><p class="small">Lessons 16–20 focus on triad theory and root-position shapes on adjacent strings; inversions follow in the next part. The shape exercises use a root-position triad on three adjacent strings.</p></div></div>`,
 min:`<div class="cols"><div><h3>Minor triads</h3>${triTab('min',['C','G','D','A','E','F','B♭'])}<p>Formula <b>1 ♭3 5</b> = minor 3rd (3 frets) + major 3rd (4 frets).</p></div>
  <div><h3>Key ideas</h3><ul><li>Lower the 3rd of a major triad by a half step and you have a minor triad.</li><li>The 3rd is the only note that tells major from minor: root and 5th stay put.</li><li>Minor chord symbols: Cm, Cmin or C−.</li><li>Minor shapes move like major ones: the root fret names the chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','min',[2,3,4],6)}. Compare it with C major: one finger moves one fret.</li><li>Play major, minor, major on the same three strings and listen to the 3rd change.</li><li>Find Am (A C E) in two places on the neck.</li></ul></div></div>`,
 dim:`<div class="cols"><div><h3>Diminished triads</h3>${triTab('dim',['C','D','E','F♯','G','A','B'])}<p>Formula <b>1 ♭3 ♭5</b> = minor 3rd + minor 3rd (3 + 3 frets).</p></div>
  <div><h3>Key ideas</h3><ul><li>Take a minor triad and lower the 5th by a half step.</li><li>Root to 5th is a tritone (6 semitones): no perfect 5th, so the chord sounds tense.</li><li>Symbol: C° (or Cdim). In a major key it sits on the 7th degree: B° in C major.</li><li>The 3rd is a minor 3rd, the 5th a diminished 5th.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','dim',[2,3,4],6)}. Compare with C minor: the top note drops a fret.</li><li>Play Cm, C°, Cm and listen to the 5th change.</li><li>Find B° (B D F) near the 7th fret of the A string.</li></ul></div></div>`,
 aug:`<div class="cols"><div><h3>Augmented triads</h3>${triTab('aug',['C','D','F','G','A♭','B♭'])}<p>Formula <b>1 3 ♯5</b> = major 3rd + major 3rd (4 + 4 frets).</p></div>
  <div><h3>Key ideas</h3><ul><li>Take a major triad and raise the 5th by a half step.</li><li>The three notes are equally spaced (4 frets apart), so the chord is symmetrical: C+, E+ and A♭+ (G♯+) share the same three pitches.</li><li>Only four different augmented triads exist.</li><li>Symbol: C+ or Caug.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>${shLine('C','aug',[2,3,4],6)}. Compare with C major: the top note rises a fret.</li><li>Play the shape, then slide it up 4 frets and listen: same chord, different bass note.</li><li>Find C+ on the G, B and high e strings.</li></ul><p class="small">The ♯5 is spelled as a raised 5th (G♯ in C+), not as a ♭6.</p></div></div>`,
 cmp:`<div class="cols"><div><h3>The four triads</h3><div class="scroll"><table><thead><tr><th>Triad</th><th>Formula</th><th>Thirds</th><th>Root→5th</th><th>On C</th></tr></thead><tbody>${TQ.map(q=>`<tr><td>${cap(TN[q])} (${CHORDS[q].sym||'—'})</td><td>${CHORDS[q].f.replace(/b/g,'♭').replace(/#/g,'♯')}</td><td>${TSEM[q][0]===4?'M3':'m3'} + ${TSEM[q][1]-TSEM[q][0]===4?'M3':'m3'}</td><td>${TSEM[q][1]}</td><td>${chordNotes('C',q).join(' ')}</td></tr>`).join('')}</tbody></table></div></div>
  <div><h3>Key ideas</h3><ul><li>Moving one note by a half step turns one triad into its neighbour: major ↔ minor (3rd), major ↔ augmented (5th), minor ↔ diminished (5th).</li><li>Major and minor have a perfect 5th; diminished has a smaller one and augmented a larger one.</li><li>Check the 3rd first (major or minor), then the 5th.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>On the D, G and B strings play C, Cm, C°, C+ in a row, moving one finger at a time.</li><li>Do the same on the A, D, G strings from the root of your choice.</li><li>Name the chord quality out loud by measuring the 3rd and 5th.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 16–20: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 21 shows triad shapes on all string sets.</p></div></div>`};
