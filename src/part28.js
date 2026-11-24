/* ===== Part 28: lessons 113–116 (advanced pentatonics, upper intervals, stacked chords, synonyms) ===== */
const FLN=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const pcName=(pc,fl=true)=>(fl?FLN:NN)[((pc%12)+12)%12];
const noDbl=a=>!a.some(x=>/[𝄪𝄫]/.test(x));
const mcp=(ans,pool)=>{const seen=new Set([pcOf(ans)]),o=[];for(const x of shuf(pool)){const p=pcOf(x);if(!seen.has(p)){seen.add(p);o.push(x)}if(o.length===3)break}return shuf([ans,...o])};
const perms=a=>a.length<2?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
const byPitch=a=>a.slice().sort((x,y)=>midi(x.s,x.f)-midi(y.s,y.f));
const sem=n=>`${n} semitone${n===1?'':'s'}`;
const fSym=f=>f.replace(/bb/g,'♭♭').replace(/b/g,'♭').replace(/#/g,'♯');
const shapeKey=m=>m.map(x=>x.s+'_'+x.f).join('');
const rootNm=(pc,q)=>{for(const n of [FLN[pc],NN[pc],...(pc===11?['C♭']:[])])if(noDbl(chordNotes(n,q)))return n;return FLN[pc]};
/* a playable voicing of chord q (any arrangement of the chord tones on adjacent strings, 4-fret span); root marked 'root', others 'ghost' */
function chordShape(rpc,q,sets=SETS4){const L=CHORDS[q].f.split(' ').map(t=>t==='1'?'R':fSym(t)),sm=fmlSemis(CHORDS[q].f).map(x=>x%12),opts=[];
  for(const st of sets)for(const p of perms(sm.map((x,i)=>i)))opts.push([st,p]);
  for(const[st,p]of shuf(opts)){const v=voicing(st,p.map(i=>(sm[i]+rpc)%12),0,12,4);if(v)return v.map((x,j)=>({s:x.s,f:x.f,t:L[p[j]],k:p[j]===0?'root':'ghost',pc:(sm[p[j]]+rpc)%12}))}
  return null}
/* same, but marks show note names */
function namedShape(rn,q,sets){const m=chordShape(pcOf(rn),q,sets);if(!m)return null;const nn=chordNotes(rn,q);return m.map(x=>({s:x.s,f:x.f,t:nn.find(n=>pcOf(n)===x.pc),k:x.k}))}

/* ---------- Lesson 113: advanced pentatonics ---------- */
const PENT={domPent:{f:'1 2 3 5 b7',name:'dominant pentatonic'},min6Pent:{f:'1 b3 4 5 6',name:'minor 6 pentatonic'},susPent:{f:'1 2 4 5 b7',name:'suspended (Egyptian) pentatonic'},inSen:{f:'1 b2 4 5 b7',name:'in-sen pentatonic'},hira:{f:'1 2 b3 5 b6',name:'hirajoshi pentatonic'}};
const PK=Object.keys(PENT);
const ptok=k=>PENT[k].f.split(' ').map(fSym);
const pform=k=>ptok(k).join(' ');
const pnotes=(r,k)=>spellF(r,PENT[k].f);
const proots=k=>KEASY.filter(r=>noDbl(pnotes(r,k)));
const ptxt=(r,k)=>`${r} ${PENT[k].name}: ${pnotes(r,k).join(' ')}`;
function pPos(root,k,strings,lo,hi){const n=pnotes(root,k),p=n.map(pcOf),T=ptok(k).map(t=>t==='1'?'R':t),o=[];for(const s of strings)for(let f=lo;f<=hi;f++){const i=p.indexOf(pcAt(s,f));if(i>=0)o.push({s,f,t:T[i],name:n[i],i})}return o}
function pSpell(){const k=pick(PK),r=pick(proots(k)),n=pnotes(r,k),d=R(2,5),a=n[d-1],pool=['b2','2','b3','3','4','b5','5','b6','6','b7','7'].map(t=>spellF(r,t)).filter(x=>noDbl([x]));
  return{type:'choice',noBoard:true,key:`ps${k}${r}${d}`,text:`The ${r} ${PENT[k].name} has the formula ${pform(k)}. What is its ${ord(d)} note?`,choices:mcp(a,pool.filter(x=>!n.includes(x)||x===a)),ans:a,hint:`Find the note a ${nm(fmlSemis(PENT[k].f)[d-1])} above ${r}.`,explain:`${ptxt(r,k)}. The ${ord(d)} note (${ptok(k)[d-1]}) is ${a}.`}}
function pId(){const k=pick(PK),rev=Math.random()<.5;
  if(rev){const a=pform(k),dis=PK.filter(x=>x!==k).map(pform);return{type:'choice',noBoard:true,key:'pf'+k,text:`What is the formula of the ${PENT[k].name}?`,choices:mc(a,dis),ans:a,hint:'Compare each formula with the major pentatonic 1 2 3 5 6 or the minor pentatonic 1 ♭3 4 5 ♭7.',explain:`${PENT[k].name} = ${a}. In C: ${pnotes('C',k).join(' ')}.`}}
  const a=PENT[k].name;return{type:'choice',noBoard:true,key:'pn'+k,text:`Which scale has the formula ${pform(k)}?`,choices:mc(a,PK.filter(x=>x!==k).map(x=>PENT[x].name)),ans:a,hint:'Compare with the major pentatonic 1 2 3 5 6 and the minor pentatonic 1 ♭3 4 5 ♭7.',explain:`${a} = ${pform(k)}. In C: ${pnotes('C',k).join(' ')}.`}}
function pOne(){for(let i=0;i<200;i++){const k=pick(PK),r=pick(proots(k)),s=R(0,5),f=rootFret(r,s,0);if(f>3)continue;const tg=pPos(r,k,[s],f+1,f+12).map(p=>({s:p.s,f:p.f,t:p.i===0?'8':p.t}));
  return{type:'multi',key:`po${k}${r}${s}`,text:`Play the ${r} ${PENT[k].name} (${pform(k)}) up the ${SN[s]} string: the root is marked. Click every scale note up to the octave.`,marks:[{s,f,t:'R',k:'root'}],targets:tg,notes:[midi(s,f),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`The notes are ${fmlSemis(PENT[k].f).slice(1).join(', ')} semitones above the root, then the octave.`,explain:`${ptxt(r,k)}. On the ${SN[s]} string: frets ${[f,...tg.map(p=>p.f)].join(', ')}.`}}return pOne()}
function pBox(){for(let i=0;i<300;i++){const k=pick(PK),r=pick(proots(k)),rs=R(0,4),f=rootFret(r,rs,2);if(f<2||f>10)continue;const lo=f-1,hi=f+3,st=[rs,rs+1],tg=pPos(r,k,st,lo,hi).filter(p=>!(p.s===rs&&p.f===f));if(tg.length<3||tg.length>8)continue;
  return{type:'multi',key:`pb${k}${r}${rs}`,box:[lo,hi],text:`${r} ${PENT[k].name} (${pform(k)}): the root is marked. Click every scale note on the ${SN[rs]} and ${SN[rs+1]} strings inside the shaded frets (${lo}–${hi}).`,marks:[{s:rs,f,t:'R',k:'root'}],targets:tg,notes:byPitch(pPos(r,k,st,lo,hi)).map(p=>midi(p.s,p.f)),pm:'seq',
   hint:'Spell the five notes first, then find each one on the two strings.',explain:`${ptxt(r,k)}. In frets ${lo}–${hi}: ${st.map(s=>`${SL[s]}: ${pPos(r,k,[s],lo,hi).map(p=>p.name+' ('+p.f+')').join(', ')}`).join(' · ')}.`}}return pBox()}
function pFind(){for(let i=0;i<300;i++){const k=pick(PK),r=pick(proots(k)),s=R(0,5),f=rootFret(r,s,1);if(f<1||f>11)continue;const s2=R(0,5),c=pPos(r,k,[s2],Math.max(0,f-4),Math.min(15,f+4)).filter(p=>p.i>0&&!(p.s===s&&p.f===f));if(!c.length)continue;const t=pick(c),d=(pcOf(t.name)-pcOf(r)+12)%12;
  return{type:'click',key:`pd${k}${r}${s}${t.i}${s2}`,text:`The ${r} ${PENT[k].name} root is marked. Click its ${t.t} (${t.name}) on the ${SN[s2]} string, within 4 frets of the root.`,marks:[{s,f,t:'R',k:'root'}],target:{s:t.s,f:t.f,t:t.t},notes:[midi(s,f),midi(t.s,t.f)],hint:`${t.name} is ${sem(d)} above the root (or ${12-d} below it).`,explain:`${ptxt(r,k)}. The ${t.t} is ${t.name}: ${SN[t.s]} string, ${fretTxt(t.f)}.`}}return pFind()}
function pName(){for(let i=0;i<300;i++){const k=pick(PK),r=pick(proots(k)),s=R(0,5),f=rootFret(r,s,1);if(f<1||f>11)continue;const s2=R(0,5),c=pPos(r,k,[s2],Math.max(0,f-4),Math.min(15,f+4)).filter(p=>p.i>0&&!(p.s===s&&p.f===f));if(!c.length)continue;const t=pick(c);
  return{type:'choice',key:`pq${k}${r}${s}${t.i}${s2}`,text:`The root of the ${r} ${PENT[k].name} (${pform(k)}) is marked. Which degree is the ?`,marks:[{s,f,t:'R',k:'root'},{s:t.s,f:t.f,t:'?',k:'q'}],choices:mc(t.t,ptok(k).slice(1)),ans:t.t,notes:[midi(s,f),midi(t.s,t.f)],hint:'Count the semitones from the root and match them to the formula.',explain:`${ptxt(r,k)}. The ? is ${t.name}, ${sem((pcOf(t.name)-pcOf(r)+12)%12)} above ${r}: the ${t.t}.`}}return pName()}
const pBank=sbank('pk',[
 ['How does the dominant pentatonic (1 2 3 5 ♭7) differ from the major pentatonic (1 2 3 5 6)?','The 6th is lowered to ♭7',['The 3rd is lowered','The 5th is raised','It has six notes'],'Dominant pentatonic: C D E G B♭. Major pentatonic: C D E G A.'],
 ['Which chord does the dominant pentatonic suit best?','A dominant 7th chord',['A minor 7th chord','A diminished 7th chord','A major 7th chord'],'It contains 1, 3, 5 and ♭7, the notes of a dominant 7th, plus the 9th.'],
 ['How does the minor 6 pentatonic (1 ♭3 4 5 6) differ from the minor pentatonic (1 ♭3 4 5 ♭7)?','The ♭7 is replaced by the 6th',['The ♭3 is replaced by the 3rd','The 4th is removed','It has an extra note'],'A minor 6 pentatonic: A C D E F♯. A minor pentatonic: A C D E G.'],
 ['The minor 6 pentatonic fits which chords?','Minor 6 and minor 7 chords (Dorian sound)',['Dominant 7♭9 chords','Augmented chords','Major 7 chords'],'It has the ♭3 and the natural 6th, the Dorian colour.'],
 ['Which notes do you remove from Mixolydian (1 2 3 4 5 6 ♭7) to get the dominant pentatonic?','The 4th and the 6th',['The 3rd and the 7th','The 2nd and the 5th','The root and the 5th'],'1 2 3 5 ♭7 is left: no half-step clash with the 3rd, no 6th.'],
 ['Which notes do you remove from Dorian (1 2 ♭3 4 5 6 ♭7) to get the minor 6 pentatonic?','The 2nd and the ♭7',['The 4th and the 6th','The ♭3 and the 5th','The root and the 6th'],'1 ♭3 4 5 6 is left.'],
 ['In this workbook, in-sen and hirajoshi are examples of…','Japanese pentatonic scales (in-sen 1 ♭2 4 5 ♭7, hirajoshi 1 2 ♭3 5 ♭6)',['Blues scales with six notes','Modes of the major pentatonic','Diminished scales'],'Several versions of these scales exist; the workbook uses these common forms. They contain half steps, unlike the major and minor pentatonics.'],
 ['How many notes does every scale in this lesson have?','5',['6','7','4'],'They are all pentatonic: five notes per octave.']]);

/* ---------- Lesson 114: upper interval shapes ---------- */
const UPL={'♭9':[13,'b9'],'9':[14,'9'],'♯9':[15,'#9'],'11':[17,'11'],'♯11':[18,'#11'],'♭13':[20,'b13'],'13':[21,'13']};
const UPK=Object.keys(UPL);
const upName=(r,u)=>spellF(r,UPL[u][1])[0];
function uLabel(){for(let i=0;i<300;i++){const s1=R(0,3),f=R(1,10),s2=R(s1+2,5),u=pick(UPK),t=shapeFret(s1,f,s2,UPL[u][0]);if(t<0||t>15||Math.abs(t-f)>4)continue;
  return{type:'choice',key:`ul${s1}${s2}${f}${u}`,text:'The ? is more than an octave above the root (R). Which upper interval is it?',marks:[{s:s1,f,t:'R',k:'root'},{s:s2,f:t,t:'?',k:'q'}],choices:mc(u,UPK),ans:u,notes:[midi(s1,f),midi(s2,t)],hint:`Count the semitones: the ${SN[s1]}→${SN[s2]} gap is ${gap(s1,s2)}, then add or subtract the fret difference.`,
   explain:`String gap ${gap(s1,s2)} ${t-f>=0?'+':'−'} ${Math.abs(t-f)} = ${UPL[u][0]} semitones: the ${u}. (${UPL[u][0]} − 12 = ${UPL[u][0]-12}, so it has the same note name as the ${UPL[u][0]-12===1?'♭2':UPL[u][0]-12===2?'2nd':UPL[u][0]-12===3?'♯2':UPL[u][0]-12===5?'4th':UPL[u][0]-12===6?'♯4':UPL[u][0]-12===8?'♭6':'6th'}.)`}}return uLabel()}
function uClick(){for(let i=0;i<300;i++){const r=pick(KEASY),s1=R(0,3),f=rootFret(r,s1,1),u=pick(UPK),s2=R(s1+2,5);if(f<1||f>10)continue;const t=shapeFret(s1,f,s2,UPL[u][0]),n=upName(r,u);if(t<0||t>15||Math.abs(t-f)>4||!noDbl([n])||pcAt(s2,t)!==pcOf(n))continue;
  return{type:'click',key:`uk${r}${s1}${s2}${u}`,text:`Root: ${r} on the ${SN[s1]} string, ${fretTxt(f)}. Click the ${u} (${n}) above it on the ${SN[s2]} string.`,marks:[{s:s1,f,t:'R',k:'root'}],target:{s:s2,f:t,t:u},notes:[midi(s1,f),midi(s2,t)],hint:`A ${u} is ${UPL[u][0]} semitones above the root. The ${SN[s1]}→${SN[s2]} gap is ${gap(s1,s2)}.`,
   explain:`${u} = ${UPL[u][0]} semitones = ${n} above ${r}. The string gap is ${gap(s1,s2)}, so go ${offTxt(t-f)}: fret ${t} (${n}).`}}return uClick()}
function uMulti(){for(let i=0;i<300;i++){const r=pick(KEASY),u=pick(['9','11','13','♯11','♭9','♯9']),n=upName(r,u);if(!noDbl([n]))continue;const s1=R(0,2),f=rootFret(r,s1,1);if(f<2||f>10)continue;const lo=f-1,hi=f+3,tg=allPc(pcOf(n),[0,1,2,3,4,5],lo,hi).filter(p=>!(p.s===s1&&p.f===f));if(tg.length<2||tg.length>7)continue;
  return{type:'multi',key:`um${r}${u}${s1}`,box:[lo,hi],text:`The root ${r} is marked. Click every ${n} (the ${u} of ${r}) inside the shaded frets (${lo}–${hi}). Any octave counts.`,marks:[{s:s1,f,t:'R',k:'root'}],targets:tg.map(p=>({...p,t:u})),notes:tg.map(p=>midi(p.s,p.f)),hint:`The ${u} of ${r} is ${UPL[u][0]} semitones above it, which is the same note name as ${UPL[u][0]-12} semitones above (one octave lower).`,
   explain:`${u} of ${r} = ${n}. In frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}}return uMulti()}
function uNoteQ(){const r=pick(KEASY),u=pick(UPK),a=upName(r,u);if(!noDbl([a]))return uNoteQ();const pool=UPK.filter(x=>x!==u).map(x=>upName(r,x)).concat(['2','4','6','7'].map(x=>spellF(r,x)[0])).filter(x=>noDbl([x]));
  return{type:'choice',noBoard:true,key:`un${r}${u}`,text:`What note is the ${u}${/^\d/.test(u)?'th':''} of ${r}?`,choices:mcp(a,pool),ans:a,hint:`A ${u} is ${UPL[u][0]} semitones above the root, or ${UPL[u][0]-12} above it in the lower octave.`,explain:`${u} of ${r} = ${a}: ${UPL[u][0]} semitones above ${r} (an octave plus ${UPL[u][0]-12}). The letter name follows the number: ${u.replace(/[♭♯]/,'')} − 7 = ${parseInt(u.replace(/[♭♯]/,''))-7}, so it is the ${ord(parseInt(u.replace(/[♭♯]/,''))-7)} letter above ${r[0]}, which is ${a[0]}.`}}
const uBank=sbank('ub',[
 ['How many semitones above the root is a ♭9?','13',['12','14','15'],'♭9 = minor 2nd (1) + octave (12).'],
 ['How many semitones above the root is a ♯9?','15',['14','16','13'],'♯9 = 9th (14) raised a half step. It is the same pitch as a minor 10th.'],
 ['How many semitones above the root is a ♯11?','18',['17','19','16'],'11th = 17; ♯11 = 18, an octave above the tritone.'],
 ['How many semitones above the root is a ♭13?','20',['21','19','22'],'13th = 21 semitones; ♭13 = 20 (octave + minor 6th).'],
 ['Which altered upper note sounds like a minor 3rd, an octave higher?','♯9',['♭9','♯11','♭13'],'♯9 = 15 semitones: 3 + 12.'],
 ['Which altered upper note sounds like the tritone (♭5), an octave higher?','♯11',['♯9','♭13','♭9'],'♯11 = 18 semitones: 6 + 12.'],
 ['Which altered upper note sounds like a minor 6th, an octave higher?','♭13',['♯11','♯9','♭9'],'♭13 = 20 semitones: 8 + 12.'],
 ['The 13th is the same note name as which simple interval?','6th',['4th','7th','5th'],'13 = 6 + 7. A natural 13th is 21 semitones above the root.']]);

/* ---------- Lesson 115: stacked interval chords ---------- */
const KIND={quartal:{semi:5,l:3,name:'Quartal (stacked 4ths)',int:'perfect 4th',lab:['R','4','♭7','♭10']},quintal:{semi:7,l:4,name:'Quintal (stacked 5ths)',int:'perfect 5th',lab:['R','5','9','13']},tertian:{name:'Tertian (stacked 3rds)',int:'3rd',lab:['R','3','5','7']}};
const stackSemis=(kind,n)=>kind==='tertian'?[0,4,7,11].slice(0,n):Array.from({length:n},(_,i)=>KIND[kind].semi*i);
const stackNotes=(r,kind,n)=>kind==='tertian'?chordNotes(r,n===3?'maj':'maj7'):spellSteps(r,Array.from({length:n},(_,i)=>[KIND[kind].l*i,KIND[kind].semi*i]));
const accN=a=>a.join('').replace(/[^♯♭𝄪𝄫]/g,'').length;
const stkName=(pc,n)=>{const c=[FLN[pc],NN[pc]].filter(x=>['quartal','quintal','tertian'].every(k=>noDbl(stackNotes(x,k,n))));if(!c.length)return null;return c.sort((x,y)=>accN(stackNotes(x,'quartal',n))-accN(stackNotes(y,'quartal',n)))[0]};
function stackShape(kind,rpc,n){const sm=stackSemis(kind,n).map(x=>x%12),combos=[];const rec=(a,start)=>{if(a.length===n){combos.push(a.slice());return}for(let s=start;s<6;s++){a.push(s);rec(a,s+1);a.pop()}};rec([],0);
  for(const st of shuf(combos)){if(st[n-1]-st[0]>n+1)continue;const v=voicing(st,sm.map(x=>(x+rpc)%12),0,12,4);if(v)return v.map((x,j)=>({s:x.s,f:x.f,t:KIND[kind].lab[j],k:j===0?'root':'ghost',pc:(sm[j]+rpc)%12}))}return null}
function sSpell(){for(let i=0;i<100;i++){const kind=pick(['quartal','quintal','tertian']),n=pick([3,4]),r=pick(KEASY);if(!['quartal','quintal','tertian'].every(k=>noDbl(stackNotes(r,k,n))))continue;const a=stackNotes(r,kind,n).join(' '),dis=['quartal','quintal','tertian'].filter(k=>k!==kind).map(k=>stackNotes(r,k,n).join(' ')).concat([chordNotes(r,n===3?'min':'m7').join(' ')]);
  return{type:'choice',noBoard:true,key:`ss${kind}${n}${r}`,text:kind==='tertian'?`Spell the ${n}-note tertian chord on ${r} (${n===3?'a major triad':'a maj7 chord'}), stacking 3rds with the lowest note first.`:`Spell the ${n}-note ${kind} chord on ${r}: stack ${n-1} ${KIND[kind].int}s up from ${r}, lowest note first.`,choices:mc(a,dis),ans:a,
   hint:kind==='tertian'?'Stack alternate letters: C E G B.':`Each note is ${kind==='quartal'?'5':'7'} semitones above the last and ${kind==='quartal'?'three':'four'} letters further along the alphabet.`,explain:`${r} ${kind} (${n} notes) = ${a}. ${kind==='tertian'?'Letters skip one each time (C E G B).':`Each step is a ${KIND[kind].int} (${KIND[kind].semi} semitones), ${KIND[kind].l+1} letter names apart.`}`}}return sSpell()}
function sType(){for(let i=0;i<100;i++){const kind=pick(['quartal','quintal','tertian']),n=pick([3,4]),r=pick(KEASY);if(!['quartal','quintal','tertian'].every(k=>noDbl(stackNotes(r,k,n))))continue;const a=KIND[kind].name,ns=stackNotes(r,kind,n);
  return{type:'choice',noBoard:true,key:`st${kind}${n}${r}`,text:`These notes are played from the bottom up: ${ns.join(' ')}. What type of chord is this?`,choices:mc(a,Object.values(KIND).map(x=>x.name).concat(['Secundal (stacked 2nds)'])),ans:a,hint:'Measure the interval between each pair of neighbouring notes.',
   explain:`${ns.join(' → ')}: each step is ${kind==='tertian'?'a 3rd (major or minor)':'a '+KIND[kind].int+' ('+KIND[kind].semi+' semitones)'}, so it is ${a.toLowerCase()}.`}}return sType()}
function sBarre(){for(let i=0;i<100;i++){const k=pick([3,4]),a=k===3?R(0,1):0,f=R(1,10),st=Array.from({length:k},(_,j)=>a+j),pc=pcAt(a,f),rn=stkName(pc,k);if(!rn)continue;const ns=stackNotes(rn,'quartal',k),m=st.map((s,j)=>({s,f,t:KIND.quartal.lab[j],k:j===0?'root':'ghost'})),ans=ns.join(' '),dis=[stackNotes(rn,'quintal',k),stackNotes(rn,'tertian',k),chordNotes(rn,k===3?'min':'m7')].map(x=>x.join(' '));
  return{type:'choice',key:`sb${k}${a}${f}`,text:`You play fret ${f} on the ${st.map(s=>SN[s]).join(', ')} strings (strings tuned in perfect 4ths). Which notes are you playing, lowest first?`,marks:m,choices:mc(ans,dis),ans,notes:m.map(x=>midi(x.s,x.f)),pm:'chord',hint:`The lowest note is ${note(a,f)}-ish: work out the name from the fret, then stack perfect 4ths.`.replace('-ish',''),
   explain:`Adjacent strings E–A–D–G are a perfect 4th apart, so the same fret on all of them stacks perfect 4ths: ${ns.join(' ')} (a quartal chord on ${rn}).`}}return sBarre()}
function sShape(){for(let i=0;i<200;i++){const kind=pick(['quartal','quintal','tertian']),n=pick([3,4]),pc=R(0,11),rn=stkName(pc,n);if(!rn)continue;const m=stackShape(kind,pc,n);if(!m)continue;const root=m.find(x=>x.k==='root'),rest=m.filter(x=>x.k!=='root'),ns=stackNotes(rn,kind,n),lo=Math.min(...m.map(x=>x.f)),hi=Math.max(...m.map(x=>x.f));
  return{type:'multi',key:`sh${kind}${n}${pc}${shapeKey(m)}`,box:[lo,hi],text:`${rn} ${kind} chord (${ns.join(' ')}): the root is marked. Click the other ${n-1} notes, one on each of the ${m.slice(1).map(x=>SN[x.s]+' string').join(', ')}, inside the shaded frets (${lo}–${hi}).`,marks:[root],targets:rest.map(x=>({s:x.s,f:x.f,t:x.t})),notes:byPitch(m).map(p=>midi(p.s,p.f)),pm:'chord',
   hint:`Each note is ${kind==='tertian'?'a 3rd':'a '+KIND[kind].int} above the last. Find that note on the next string.`,explain:`${ns.join(' ')}: ${m.map((x,j)=>`${ns[j]} on the ${SN[x.s]} string, ${fretTxt(x.f)}`).join(', ')}.`}}return sShape()}
function sIdentify(){for(let i=0;i<200;i++){const kind=pick(['quartal','quintal','tertian']),n=pick([3,4]),pc=R(0,11),rn=stkName(pc,n);if(!rn)continue;const m=stackShape(kind,pc,n);if(!m)continue;const ns=stackNotes(rn,kind,n),mk=m.map((x,j)=>({s:x.s,f:x.f,t:ns[j],k:x.k}));
  return{type:'choice',key:`si${kind}${n}${pc}${shapeKey(m)}`,text:'The notes of this chord are shown, root first (marked). What type of chord, stacking from the bottom up?',marks:mk,choices:mc(KIND[kind].name,Object.values(KIND).map(x=>x.name).concat(['Secundal (stacked 2nds)'])),ans:KIND[kind].name,notes:byPitch(m).map(p=>midi(p.s,p.f)),pm:'chord',hint:'Measure each step between neighbouring notes, from the lowest note up.',
   explain:`${ns.join(' → ')}: ${kind==='tertian'?'3rds':KIND[kind].int+'s ('+KIND[kind].semi+' semitones)'}, so ${KIND[kind].name.toLowerCase()}.`}}return sIdentify()}
const sBank=sbank('sk',[
 ['A tertian chord is built by stacking…','3rds',['4ths','5ths','2nds'],'1 3 5 7: every other note of the scale.'],
 ['In standard tuning, which pair of neighbouring strings is NOT a perfect 4th apart?','G and B (a major 3rd)',['E and A','A and D','D and G'],'E–A–D–G are 5 semitones apart; G–B is 4; B–e is 5 again.'],
 ['Playing the same fret on the E, A and D strings gives…','a quartal chord (stacked perfect 4ths)',['a major triad','a tertian chord','a quintal chord'],'E → A → D are each a perfect 4th apart.'],
 ['How many semitones is a perfect 5th, the interval stacked in a quintal chord?','7',['5','6','8'],'C → G is 7 semitones.'],
 ['Stack three perfect 5ths on C. Which notes do you get?','C G D A',['C F B♭ E♭','C E G B','C G B♭ F'],'Each note is 7 semitones above the last: C, G, D, A (1 5 9 13).'],
 ['D G C is a stack of perfect 4ths. The same notes as C G D rearranged show that…','a quintal triad is an inversion of a quartal triad',['quartal chords are tertian','quintal chords have a tritone','nothing, the chords are unrelated'],'C G D has two 5ths from the bottom; D G C has two 4ths. Same pitch classes.'],
 ['What interval pattern does a maj7 tertian chord stack (1 3 5 7)?','Major 3rd, minor 3rd, major 3rd',['Perfect 4th, perfect 4th, perfect 4th','Minor 3rd, minor 3rd, minor 3rd','Major 3rd, major 3rd, major 3rd'],'C E G B: 4 + 3 + 4 semitones.'],
 ['Why do quartal chords sound “open” or ambiguous?','They have no 3rd to say major or minor',['They are always loud','They contain a tritone','They use only open strings'],'Stacked 4ths avoid the 3rd, so the major/minor quality is not stated.']]);

/* ---------- Lesson 116: chord synonyms ---------- */
const SYN=[{a:'m7',b:'maj6',sa:'m7',sb:'6',off:3},{a:'m7b5',b:'m6',sa:'m7♭5',sb:'m6',off:3},{a:'sus2',b:'sus4',sa:'sus2',sb:'sus4',off:7}];
const YIDX={'m7>maj6':1,'m7b5>m6':1,'maj6>m7':3,'m6>m7b5':3,'sus2>sus4':2,'sus4>sus2':1};
const synRoot=(x,q1,q2)=>{const y=chordNotes(x,q1)[YIDX[q1+'>'+q2]];return noDbl(chordNotes(y,q2))?y:null};
const sameSet=(x,qx,y,qy)=>chordNotes(x,qx).map(pcOf).sort((a,b)=>a-b).join()===chordNotes(y,qy).map(pcOf).sort((a,b)=>a-b).join();
function synPair(){const t=pick(SYN),rev=Math.random()<.5,[q1,q2,s1,s2,o]=rev?[t.b,t.a,t.sb,t.sa,-t.off]:[t.a,t.b,t.sa,t.sb,t.off];
  for(let i=0;i<100;i++){const pc=R(0,11),x=rootNm(pc,q1),y=synRoot(x,q1,q2);if(!y)continue;if(!sameSet(x,q1,y,q2))throw new Error('syn');
   const dis=shuf([1,2,3,4,5,6,7,8,9,10,11].filter(z=>z!==((o+12)%12))).slice(0,3).map(z=>rootNm((pc+z)%12,q2)+s2).concat([x+s2]).filter(z=>z!==y+s2);
   return{type:'choice',noBoard:true,key:`sy${q1}${pc}`,text:`Which chord has exactly the same notes as ${x}${s1}?`,choices:mc(y+s2,dis),ans:y+s2,hint:`${t.a==='sus2'?'Re-read the notes with a different root':'Spell the chord, then ask which of its notes could be the root of a '+(rev?'minor 7th':'6th')+' chord'}.`,
    explain:`${x}${s1} = ${chordNotes(x,q1).join(' ')}; ${y}${s2} = ${chordNotes(y,q2).join(' ')}. Same notes, different root: ${t.a==='m7'?'Xm7 = (X+♭3)6: the 6th chord sits a minor 3rd above the minor 7th chord':t.a==='m7b5'?'Xm7♭5 = (X+♭3)m6':'Xsus2 = (X+5th)sus4'}. Which name you use depends on the bass note and the music around it.`}}return synPair()}
function synBoard(){for(let i=0;i<100;i++){const t=pick(SYN.slice(0,2)),pc=R(0,11),x=rootNm(pc,t.a),y=synRoot(x,t.a,t.b),m=namedShape(x,t.a);if(!m||!y)continue;const a=y+t.sb,dis=[x+t.sb,rootNm((pc+4)%12,t.b)+t.sb,rootNm((pc+8)%12,t.b)+t.sb,rootNm((pc+2)%12,t.b)+t.sb];
  return{type:'choice',key:`sb${t.a}${pc}${shapeKey(m)}`,text:`These notes are ${x}${t.sa} (root marked). Which ${t.sb==='6'?'6th':'minor 6th'} chord has exactly the same four notes?`,marks:m,choices:mc(a,dis),ans:a,notes:byPitch(m).map(p=>midi(p.s,p.f)),pm:'chord',hint:'Look at the note names: which of the four could be the root of a '+(t.sb==='6'?'major 6th':'minor 6th')+' chord (1 3 5 6 or 1 ♭3 5 6)?',
   explain:`${x}${t.sa} = ${chordNotes(x,t.a).join(' ')}; ${a} = ${chordNotes(y,t.b).join(' ')}. ${y} is the ${t.off===3?'♭3':'5th'} of ${x}, and the same four notes work from there.`}}return synBoard()}
function synOther(){for(let i=0;i<100;i++){const dim=Math.random()<.5,q=dim?'dim7':'aug',pc=R(0,11),x=rootNm(pc,q),m=namedShape(x,q,dim?SETS4:SETS3);if(!m)continue;const step=dim?3:4,sym=dim?'°7':'+',off=pick(dim?[3,6,9]:[4,8]),a=rootNm((pc+off)%12,q)+sym,dis=shuf([1,2,3,4,5,6,7,8,9,10,11].filter(z=>z%step!==0)).slice(0,3).map(z=>rootNm((pc+z)%12,q)+sym);
  return{type:'choice',key:`so${q}${pc}${off}${shapeKey(m)}`,text:`These notes are ${x}${sym} (root marked). Which other chord name fits the same notes?`,marks:m,choices:mc(a,dis),ans:a,notes:byPitch(m).map(p=>midi(p.s,p.f)),pm:'chord',hint:dim?'A diminished 7th chord is built from minor 3rds, so each note can be the root.':'An augmented triad is built from major 3rds, so each note can be the root.',
   explain:`${dim?'A °7 chord':'An augmented triad'} is symmetrical: ${[...Array(dim?4:3).keys()].map(j=>rootNm((pc+j*step)%12,q)+sym).join(' = ')}. So ${dim?'four':'three'} names, one set of notes.`}}return synOther()}
const RL=[{q:'m7',t:'maj9',tq:'maj9',sy:'maj9',off:-4},{q:'m7b5',t:'dom9',tq:'dom9',sy:'9',off:-4},{q:'maj7',t:'m9',tq:'m9',sy:'m9',off:-3},{q:'dim7',t:'7b9',tq:null,sy:'7♭9',off:-4}];
const rlFormula=r=>r.t==='7b9'?'1 3 5 b7 b9':CHORDS[r.t].f;
const rlNotes=(n,r)=>spellF(n,rlFormula(r));
function synRootless(){for(let i=0;i<100;i++){const r=pick(RL),pc=R(0,11),x=rootNm(pc,r.q),tpc=(pc+r.off+12)%12,tn=[FLN[tpc],NN[tpc]].find(n=>noDbl(rlNotes(n,r)))||FLN[tpc];
  const full=rlNotes(tn,r).map(pcOf).slice(1).sort((a,b)=>a-b).join(),part=chordNotes(x,r.q).map(pcOf).sort((a,b)=>a-b).join();if(full!==part)throw new Error('rootless '+r.t);
  const m=namedShape(x,r.q);if(!m)continue;const bad=r.q==='dim7'?(z=>z%3!==(((r.off%3)+3)%3)):(z=>z!==((r.off+12)%12)),dis=shuf([1,2,3,4,5,6,7,8,9,10,11].filter(z=>bad(z))).slice(0,3).map(z=>{const p=(pc+z)%12,nn=[FLN[p],NN[p]].find(n=>noDbl(rlNotes(n,r)))||FLN[p];return nn+r.sy});
  return{type:'choice',key:`rl${r.t}${pc}${shapeKey(m)}`,text:`These notes are ${x}${CHORDS[r.q].sym} (root marked). Played above a bass note and with no root of its own, which chord does it suggest?`,marks:m,choices:mc(tn+r.sy,dis),ans:tn+r.sy,notes:byPitch(m).map(p=>midi(p.s,p.f)),pm:'chord',hint:`Ask which chord has ${x} as its ${r.off===-3?'♭3':'3rd'}: ${r.off===-3?'a minor 3rd':'a major 3rd'} below ${x}.`,
   explain:`${tn}${r.sy} = ${rlNotes(tn,r).join(' ')}. Leave out the root ${tn} and ${rlNotes(tn,r).slice(1).join(' ')} remain: exactly ${x}${CHORDS[r.q].sym}. So ${x}${CHORDS[r.q].sym} is a rootless ${tn}${r.sy} voicing.${r.q==='dim7'?' (Because °7 has four names it also stands for three other 7♭9 chords.)':''}`}}return synRootless()}
function synFind(){for(let i=0;i<200;i++){const t=pick(SYN.slice(0,2)),pc=R(0,11),x=rootNm(pc,t.a),y=synRoot(x,t.a,t.b),ns=chordNotes(x,t.a),pcs=ns.map(pcOf),a=R(0,3),st=[a,a+1,a+2],lo=R(1,9),hi=lo+4,tg=[];
  for(const s of st)for(let f=lo;f<=hi;f++){const j=pcs.indexOf(pcAt(s,f));if(j>=0)tg.push({s,f,t:ns[j]})}if(!y||tg.length<4||tg.length>8||new Set(tg.map(p=>p.t)).size<4)continue;
  return{type:'multi',key:`sf${t.a}${pc}${a}${lo}`,box:[lo,hi],text:`${x}${t.sa} and ${y}${t.sb} are the same four notes (${ns.join(' ')}). Click every one of those notes on the ${st.map(s=>SN[s]).join(', ')} strings inside the shaded frets (${lo}–${hi}).`,marks:[],targets:tg,notes:byPitch(tg).map(p=>midi(p.s,p.f)),hint:'Spell the four notes first, then find each one on the three strings.',
   explain:`${x}${t.sa} = ${y}${t.sb} = ${ns.join(' ')}. In the shaded frets: ${tg.map(p=>`${p.t} (${SL[p.s]} string, ${fretTxt(p.f)})`).join(', ')}.`}}return synFind()}
const synBank=sbank('sy',[
 ['Am7 and C6 contain…','the same four notes (A C E G)',['different notes','only the same root','the same notes except the 7th'],'Am7 = A C E G; C6 = C E G A. Which name you use depends on the bass note and the context.'],
 ['Bm7♭5 has the same notes as which chord?','Dm6',['Bm6','D6','Bm7'],'Bm7♭5 = B D F A; Dm6 = D F A B.'],
 ['F♯m7♭5 has the same notes as which chord?','Am6',['F♯m6','A6','Am7'],'F♯m7♭5 = F♯ A C E; Am6 = A C E F♯.'],
 ['How many different names does a diminished 7th chord have?','4',['2','3','12'],'Each of its four notes can be the root: C°7 = E♭°7 = G♭°7 = A°7.'],
 ['How many different names does an augmented triad have?','3',['4','2','12'],'C+ = E+ = A♭+ (C E G♯).'],
 ['Csus2 (C D G) has the same notes as which chord?','Gsus4',['Fsus4','Dsus4','Gsus2'],'Gsus4 = G C D: the same three notes with G as the root.'],
 ['Cmaj9 without its root (E G B D) is the same as…','Em7',['Em7♭5','Gmaj7','Em6'],'Played without a root, maj9 = m7 built on its 3rd. That is a common rootless voicing.'],
 ['C9 without its root (E G B♭ D) is the same as…','Em7♭5',['Em7','Gm7','E°7'],'Dominant 9th minus root = m7♭5 built on the 3rd.']]);

const LS={
 pent:{h:'advanced-pentatonics',n:'Lesson 113',title:'Advanced pentatonic scales',sub:'Dominant, minor 6, suspended, in-sen and hirajoshi pentatonics.',
  ex:[['Spell it',[pSpell,pId]],['On the neck',[pOne,pBox]],['Degrees',[pFind,pName]],['Ideas',[pBank]]],
  test:[...rep(pSpell,2),...rep(pId,2),...rep(pOne,2),...rep(pBox,3),...rep(pFind,2),...rep(pName,2),...rep(pBank,2)]},
 upper:{h:'upper-interval-shapes',n:'Lesson 114',title:'Upper interval shapes',sub:'9ths, 11ths and 13ths as shapes from a root, plus ♭9, ♯9, ♯11 and ♭13.',
  ex:[['Name it',[uLabel]],['Play it',[uClick,uMulti]],['In a key',[uNoteQ]],['Ideas',[uBank]]],
  test:[...rep(uLabel,4),...rep(uClick,3),...rep(uMulti,3),...rep(uNoteQ,3),...rep(uBank,2)]},
 stack:{h:'stacked-interval-chords',n:'Lesson 115',title:'Stacked interval chords',sub:'Tertian (3rds), quartal (4ths) and quintal (5ths) chords on the neck.',
  ex:[['Spell it',[sSpell,sType]],['Same-fret shapes',[sBarre]],['Shapes on the neck',[sShape,sIdentify]],['Ideas',[sBank]]],
  test:[...rep(sSpell,2),...rep(sType,2),...rep(sBarre,3),...rep(sShape,3),...rep(sIdentify,3),...rep(sBank,2)]},
 syn:{h:'chord-synonyms',n:'Lesson 116',title:'Chord synonyms',sub:'The same notes with different names: Am7 = C6, Bm7♭5 = Dm6, °7 and augmented names, rootless voicings.',
  ex:[['Same notes',[synPair,synBoard]],['Symmetric chords',[synOther]],['Rootless',[synRootless,synFind]],['Ideas',[synBank]]],
  test:[...rep(synPair,3),...rep(synBoard,3),...rep(synOther,3),...rep(synRootless,2),...rep(synFind,2),...rep(synBank,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 113–116 mixed.',
  ex:[['Lessons 113–114',[pSpell,pId,pOne,pBox,pFind,pName,pBank,uLabel,uClick,uMulti,uNoteQ,uBank]],['Lessons 115–116',[sSpell,sType,sBarre,sShape,sIdentify,sBank,synPair,synBoard,synOther,synRootless,synFind,synBank]]],
  test:[pSpell,pId,pOne,pBox,pName,uLabel,uLabel,uClick,uMulti,uNoteQ,sSpell,sBarre,sShape,sIdentify,sBank,synPair,synBoard,synOther,synRootless,synFind]}};
const ORDER=['pent','upper','stack','syn','final'],STORE='gi-best-p28';

const NOTES={
 pent:`<div class="cols"><div><h3>Five more pentatonic scales (in C)</h3><table class="stack"><thead><tr><th>Scale</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${PK.map(k=>`<tr><td>${PENT[k].name}</td><td>${pform(k)}</td><td>${pnotes('C',k).join(' ')}</td></tr>`).join('')}</tbody></table><p class="small">Conventions used here: dominant pentatonic 1 2 3 5 ♭7; minor 6 pentatonic 1 ♭3 4 5 6; suspended (Egyptian) 1 2 4 5 ♭7; in-sen 1 ♭2 4 5 ♭7; hirajoshi 1 2 ♭3 5 ♭6. Other books list variants of the Japanese scales.</p></div>
  <div><h3>Key ideas</h3><ul><li>Dominant pentatonic = major pentatonic with the 6th lowered to ♭7. It fits dominant 7th chords.</li><li>Minor 6 pentatonic = minor pentatonic with the ♭7 raised to the 6th. It has a Dorian sound.</li><li>The Japanese scales contain half steps, so they sound very different from the major and minor pentatonics.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C dominant pentatonic over a C7 chord, then A minor 6 pentatonic over Am6.</li><li>Move the pentatonic box shapes and change the one note that differs.</li></ul></div></div>`,
 upper:`<div class="cols"><div><h3>Upper intervals above the root</h3><table class="stack"><thead><tr><th>Interval</th><th>Semitones</th><th>In C</th></tr></thead><tbody>${UPK.map(u=>`<tr><td>${u}</td><td>${UPL[u][0]}</td><td>${upName('C',u)}</td></tr>`).join('')}</tbody></table><p class="small">An upper interval is the simple interval plus an octave: 9 = 2nd + octave, 11 = 4th + octave, 13 = 6th + octave.</p></div>
  <div><h3>Key ideas</h3><ul><li>♭9 and ♯9 are the 9th lowered or raised a half step; ♯11 and ♭13 likewise.</li><li>On the neck, a 9th from a low-E root is on the D string, 4 frets above the root (2 strings up).</li><li>Alterations give dominant chords their tension colours.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Pick a root on the low E string and find ♭9, 9, ♯9, 11, ♯11, ♭13 and 13 on higher strings.</li><li>Play each against the root and describe the colour.</li></ul></div></div>`,
 stack:`<div class="cols"><div><h3>Three ways to stack</h3><table class="stack"><thead><tr><th>Type</th><th>Interval</th><th>From C (4 notes)</th></tr></thead><tbody>${['tertian','quartal','quintal'].map(k=>`<tr><td>${KIND[k].name}</td><td>${k==='tertian'?'3rds':KIND[k].semi+' semitones'}</td><td>${stackNotes('C',k,4).join(' ')}</td></tr>`).join('')}</tbody></table><p class="small">Here tertian = maj7 (1 3 5 7). Chords are read from the bottom up: C G D is quintal, but D G C is quartal (an inversion of the same notes).</p></div>
  <div><h3>Key ideas</h3><ul><li>Tertian chords state major or minor; quartal and quintal chords avoid the 3rd and sound open.</li><li>Standard tuning stacks perfect 4ths (E A D G): the same fret across those strings is a quartal chord.</li><li>Between G and B the gap is a major 3rd, so quartal shapes shift one fret there.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play fret 5 on E, A, D (and G): a stack of 4ths. Slide it up and down.</li><li>Build C G D shapes on skipped strings.</li></ul></div></div>`,
 syn:`<div class="cols"><div><h3>Same notes, different names</h3><table class="stack"><thead><tr><th>Chord A</th><th>= Chord B</th><th>Notes</th></tr></thead><tbody><tr><td>Am7</td><td>C6</td><td>${chordNotes('A','m7').join(' ')}</td></tr><tr><td>Bm7♭5</td><td>Dm6</td><td>${chordNotes('B','m7b5').join(' ')}</td></tr><tr><td>Csus2</td><td>Gsus4</td><td>${chordNotes('C','sus2').join(' ')}</td></tr><tr><td>C°7</td><td>E♭°7 = G♭°7 = A°7</td><td>C E♭ G♭ A (sounding)</td></tr><tr><td>C+</td><td>E+ = A♭+</td><td>${chordNotes('C','aug').join(' ')}</td></tr></tbody></table><p class="small">Rootless voicings (leave out the root): maj9 = m7 on its 3rd; 9 = m7♭5 on its 3rd; m9 = maj7 on its ♭3; 7♭9 = °7 on its 3rd. Checked by computing the note sets.</p></div>
  <div><h3>Key ideas</h3><ul><li>The name depends on which note you treat as the root: use the bass note and the context.</li><li>Xm7 = (X+♭3)6 and Xm7♭5 = (X+♭3)m6: relative major and minor relationships.</li><li>Symmetric chords (°7, augmented) have several roots.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play one Am7 shape, then play a C under it: you hear C6.</li><li>Play an Em7 shape over a C bass: Cmaj9.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 113–116: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>This is the last pack of the 116-lesson course: keep revisiting the earlier final checks to keep the theory fresh.</p></div></div>`};
