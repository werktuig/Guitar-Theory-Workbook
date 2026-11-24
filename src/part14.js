/* ---------- shared chord helpers (part-local) ---------- */
const QX={maj7s11:{f:'1 3 5 7 #11',sym:'maj7♯11',name:'major 7th ♯11'},m13:{f:'1 b3 5 b7 9 11 13',sym:'m13',name:'minor 13th'}};
const AQ=Object.assign({},CHORDS,QX);
const CK=['C','G','D','A','E','F','B♭','E♭','A♭','D♭'];
const dbl=a=>a.some(n=>/𝄪|𝄫/.test(n));
const tokq=q=>AQ[q].f.split(' ');
const tlab=t=>t==='1'?'R':t.replace('bb','𝄫').replace('b','♭').replace('#','♯');
const TNM={'1':'root','2':'2nd','3':'3rd','b3':'♭3','4':'4th','5':'5th','b5':'♭5','#5':'♯5','6':'6th','7':'major 7th','b7':'♭7','bb7':'𝄫7','9':'9th','11':'11th','#11':'♯11','13':'13th'};
const tnm=t=>TNM[t]||tlab(t);
const tsem=t=>fmlSemis(t)[0];
const cn=(r,q)=>spellF(r,AQ[q].f);
const csym=(r,q)=>r+AQ[q].sym;
const cpcs=(r,q)=>fmlSemis(AQ[q].f).map(x=>(pcOf(r)+x)%12);
const J=a=>a.join(' ');
const fTxt=q=>tokq(q).map(t=>t==='1'?'1':tlab(t)).join(' ');
const octTxt=(sm,eff)=>{const n=(eff-sm)/12;return n===1?'an octave higher':n===2?'two octaves higher':n===-1?'an octave lower':'in another octave'};
const abv=(sm,ref,tgt)=>sm===12?`${tgt} is the octave (12 semitones) above ${ref}`:sm===0?`${tgt} is the same note as ${ref}`:`${tgt} is ${sm} semitone${sm>1?'s':''} above ${ref}`;
const semi=n=>n+' semitone'+(n===1?'':'s');
const BADR=['C♭','F♭','E♯','B♯'];
const gTxt=(a,b)=>{const g=gap(a,b);return `${Math.abs(g)} semitones ${g<0?'lower':'higher'}`};
const uniqF=(s,f)=>f>=0&&f<=15&&allPc(pcAt(s,f),[s]).length===1;
function nearF(rs,rf,s2,semis){let b=-1;for(const o of[-12,0,12]){const t=shapeFret(rs,rf,s2,semis+o);if(t>=0&&t<=15&&(b<0||Math.abs(t-rf)<Math.abs(b-rf)))b=t}return b}
function rn(d,q){const r=ROMAN[d-1],l=r.toLowerCase();return({maj:r,min:l,dim:l+'°',aug:r+'+',maj7:r+'maj7',dom7:r+'7',m7:l+'7',m7b5:l+'ø7',dim7:l+'°7',maj6:r+'6',m6:l+'6',add9:r+'add9',maj9:r+'maj9',dom9:r+'9',m9:l+'9',m11:l+'11',dom13:r+'13',m13:l+'13',maj13:r+'maj13',sus2:r+'sus2',sus4:r+'sus4',sus47:r+'7sus4',maj7s11:r+'maj7♯11',mMaj7:l+'(maj7)',pow:r+'5'})[q]||r}
const isDia=(k,d,q)=>{const sc=spellScale(k),pcs=sc.map(pcOf);return cpcs(sc[d-1],q).every(p=>pcs.includes(p))};
const triQ=(k,d)=>diatonic(k,'major',3)[d-1].q;
const sevQ=(k,d)=>diatonic(k,'major',4)[d-1].q;
const sameSet=(a,b)=>[...new Set(a)].sort((x,y)=>x-y).join()===[...new Set(b)].sort((x,y)=>x-y).join();
function mkC(root,q,k,d){return{root,q,k,d,nt:cn(root,q),sym:csym(root,q),intro:k?`In ${k} major, ${rn(d,q)} is ${csym(root,q)}.`:`Take ${csym(root,q)}.`,ctx:k?`Key of ${k} major. `:''}}
function pickCh(d,forms,keys=CK){for(let i=0;i<300;i++){const k=pick(keys),sc=spellScale(k),q=pick(forms),nt=cn(sc[d-1],q);if(dbl(nt)||dbl(sc))continue;return mkC(sc[d-1],q,k,d)}throw new Error('pickCh')}
function pickR(qs,roots=CK){for(let i=0;i<200;i++){const r=pick(roots),q=pick(qs);if(dbl(cn(r,q)))continue;return mkC(r,q)}throw new Error('pickR')}
/* chord tones used in typical 3- and 4-string voicings (low to high order is searched) */
const CORE={maj:['1','3','5'],min:['1','b3','5'],dim:['1','b3','b5'],aug:['1','3','#5'],sus2:['1','2','5'],sus4:['1','4','5'],maj7:['1','3','5','7'],dom7:['1','3','5','b7'],m7:['1','b3','5','b7'],m7b5:['1','b3','b5','b7'],dim7:['1','b3','b5','bb7'],maj6:['1','3','5','6'],m6:['1','b3','5','6'],add9:['1','3','5','9'],maj7s11:['1','3','7','#11'],maj9:['1','3','7','9'],dom9:['1','3','b7','9'],dom13:['1','3','b7','13'],m9:['1','b3','b7','9'],m11:['1','b3','b7','11'],m13:['1','b3','b7','13'],maj13:['1','3','7','13'],sus47:['1','4','5','b7'],mMaj7:['1','b3','5','7']};
const permsOf=a=>a.length<2?[a]:a.flatMap((x,i)=>permsOf([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
const SETS3B=[[0,1,2],[1,2,3],[2,3,4],[3,4,5]];
/* build a playable voicing: tones in `orders` are listed low to high (pitch ascending), one per string */
function mkV(root,q,o={}){const Tn=o.tones||CORE[q]||tokq(q),n=Tn.length,sets=o.sets||(n<=3?SETS3B:SETS4),orders=o.orders||permsOf(Tn.slice(1)).map(p=>[Tn[0],...p]),full=cn(root,q),tk=tokq(q);
 for(let a=0;a<80;a++){const set=pick(sets),od=pick(orders),lo=o.lo||R(3,7),pcs=od.map(t=>(pcOf(root)+tsem(t))%12),v=voicing(set,pcs,lo,Math.min(14,lo+8),4);
  if(!v)continue;const m=v.map(p=>midi(p.s,p.f));if(m.some((x,i)=>i&&x<=m[i-1]))continue;
  return v.map((p,i)=>({s:p.s,f:p.f,tok:od[i],t:tlab(od[i]),name:full[tk.indexOf(od[i])]||''}))}return null}
const shapeStr=v=>v.map(p=>`${tnm(p.tok)} ${SL[p.s]} string fret ${p.f}`).join(', ');
const strNames=v=>v.map(p=>SN[p.s]).join(', ');
const notesOf=v=>v.map(p=>midi(p.s,p.f)).sort((a,b)=>a-b);
const TPOOL=['3rd','♭3','4th','5th','♭5','♯5','6th','♭7','major 7th','9th','11th','♯11','13th'];
const EQV={'4th':'11th','11th':'4th','6th':'13th','13th':'6th','♭5':'♯11','♯11':'♭5'};
const tonePool=a=>TPOOL.filter(x=>x!==a&&EQV[a]!==x);
/* click one chord tone from a marked root */
function toneQ(c,o={}){const tk=tokq(c.q),Tn=o.tones||tk.slice(1);
 for(let i=0;i<500;i++){const rs=R(0,2),f0=allPc(pcOf(c.root),[rs],1,11);if(!f0.length)continue;const rf=f0[0].f,t0=pick(Tn),idx=tk.indexOf(t0),sm=tsem(t0),s2=R(rs+1,5),t=nearF(rs,rf,s2,sm);
  if(t<0||Math.abs(t-rf)>5||!uniqF(s2,t))continue;const eff=t-rf+gap(rs,s2),nm2=c.nt[idx];
  return{type:'click',key:`tq${c.sym}${rs}${t0}${s2}`,text:`${c.intro} Its root is marked. Click its ${tnm(t0)} (${nm2}) on the ${SN[s2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:s2,f:t,t:tlab(t0)},notes:[midi(rs,rf),midi(s2,t)],
   hint:`The ${tnm(t0)} sits ${sm} semitones above the root. Between the ${SN[rs]} and ${SN[s2]} strings the open-string gap is ${gap(rs,s2)} semitones.`,
   explain:`${c.sym} = ${J(c.nt)} (formula ${fTxt(c.q)}). The ${tnm(t0)} is ${nm2}, ${sm} semitones above the root${eff!==sm?` (played ${octTxt(sm,eff)}: ${semi(Math.abs(eff))} ${eff<0?'below':'above'} the root pitch)`:''}. The ${SN[rs]}→${SN[s2]} gap is ${gap(rs,s2)} semitones, so it sits ${t===rf?'on the same fret as the root':offTxt(t-rf)+' than the root'}: fret ${t}.`}}
 throw new Error('toneQ '+c.sym)}
/* click the other chord tones of a voicing, root marked */
function voiceQ(c,o={}){for(let i=0;i<80;i++){const v=mkV(c.root,c.q,o.v||{});if(!v)continue;const tg=v.slice(1);if(!tg.every(p=>uniqF(p.s,p.f)))continue;
  const list=tg.map(p=>`the ${tnm(p.tok)} (${p.name}) on the ${SN[p.s]} string`).join(', ');
  return{type:'multi',key:`vq${c.sym}${v.map(p=>p.s+p.tok).join('')}`,text:`${c.intro} Its root is marked on the ${SN[v[0].s]} string. Click ${list}.`,marks:[{s:v[0].s,f:v[0].f,t:'R',k:'root'}],targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:notesOf(v),pm:'chord',
   hint:`Find each note on its own string, close to the root (all within 4 frets): ${J(c.nt)}.`,
   explain:`${c.sym} = ${J(c.nt)}. This shape uses the ${strNames(v)} strings: ${shapeStr(v)}.`}}
 throw new Error('voiceQ '+c.sym)}
/* name the chord from a labelled shape */
const FALLQ=['maj','min','dim','sus2','sus4','m7','dom7','maj7','m7b5'];
const missTxt=(c,v)=>{const have=v.map(p=>p.tok),miss=tokq(c.q).filter(t=>!have.includes(t));return miss.length?` (the ${miss.map(tnm).join(' and ')} ${miss.length>1?'are':'is'} left out)`:''};
function identQ(c,pool,o={}){for(let i=0;i<80;i++){const v=mkV(c.root,c.q,o.v||{});if(!v)continue;const have=v.map(p=>p.tok);
  const cand=[...new Set([...pool,...FALLQ])].filter(x=>x!==c.q&&!have.every(t=>tokq(x).includes(t))&&!sameSet(cpcs(c.root,x),cpcs(c.root,c.q)));if(cand.length<3)continue;
  return{type:'choice',key:`iq${c.sym}${v.map(p=>p.s+p.tok).join('')}`,text:`${c.ctx}This shape sits on the ${strNames(v)} strings. The root is ${c.root} (marked R) and each other note shows its chord-tone number. Which chord is it?`,marks:v.map(p=>({s:p.s,f:p.f,t:p.t,k:p.tok==='1'?'root':'q'})),choices:mc(c.sym,cand.map(x=>csym(c.root,x))),ans:c.sym,notes:notesOf(v),pm:'chord',
   hint:'Read the numbers off the shape and compare them with the chord formulas.',
   explain:`The shape holds ${v.map(p=>p.t).join(' ')} (${v.map(p=>p.name).join(' ')}): that is ${c.sym} = ${J(c.nt)}${missTxt(c,v)}.`}}
 throw new Error('identQ '+c.sym)}
/* measure an unlabelled note from the root */
function measQ(c,o={}){const tk=tokq(c.q);for(let i=0;i<80;i++){const v=mkV(c.root,c.q,o.v||{});if(!v)continue;const j=R(1,v.length-1),ans=tnm(v[j].tok);
  return{type:'choice',key:`mq${c.sym}${v.map(p=>p.s+p.tok).join('')}${j}`,text:`${c.ctx}Chord: ${c.sym}, with its root ${c.root} marked R. Which chord tone is the ?`,marks:v.map((p,x)=>({s:p.s,f:p.f,t:x===0?'R':x===j?'?':'•',k:x===0?'root':x===j?'q':'ghost'})),choices:mc(ans,tonePool(ans)),ans,notes:notesOf(v),pm:'chord',
   hint:'Work out the note name under the ?, then count its interval above the root.',
   explain:`The ? is ${v[j].name} on the ${SN[v[j].s]} string, fret ${v[j].f}. From ${c.root} that is the ${ans} of ${c.sym} (${J(c.nt)}).`}}
 throw new Error('measQ '+c.sym)}
/* click a root (or any note) a fixed interval from a marked reference note */
function relQ(ref,sm,tgt,text,key,why,o={}){for(let i=0;i<500;i++){const rs=o.rs!==undefined?o.rs:R(0,2),f0=allPc(pcOf(ref),[rs],1,11);if(!f0.length)continue;const rf=f0[0].f,s2=o.s2?o.s2(rs):R(rs,Math.min(5,rs+2)),t=nearF(rs,rf,s2,sm);if(t<0||Math.abs(t-rf)>6||(s2===rs&&t===rf)||!uniqF(s2,t))continue;
  const eff=t-rf+gap(rs,s2);
  return{type:'click',key:key+rs+s2,text:text.replace('§',SN[s2]),marks:[{s:rs,f:rf,t:'R',k:'root'}],target:{s:s2,f:t,t:tgt},notes:[midi(rs,rf),midi(s2,t)],
   hint:`${abv(sm,ref,tgt)}${s2===rs?', so count frets along the string.':`. The ${SN[rs]}→${SN[s2]} open-string gap is ${gTxt(rs,s2)}.`}`,
   explain:`${why} ${abv(sm,ref,tgt)}${eff!==sm?` (played ${octTxt(sm,eff)}: ${semi(Math.abs(eff))} ${eff<0?'below':'above'} ${ref})`:''}. ${s2===rs?`On the same string that is ${fr(Math.abs(t-rf))} ${t>rf?'higher':'lower'}`:`The ${SN[rs]}→${SN[s2]} gap is ${gTxt(rs,s2)}, so it sits ${t===rf?'on the same fret as the root':offTxt(t-rf)+' than the root'}`}: fret ${t}.`}}
 throw new Error('relQ '+key)}
/* degree-root click inside a key (reference = key root) */
function degRootQ(ds,o={}){for(let i=0;i<300;i++){const k=pick(CK),d=pick(ds),sc=spellScale(k);if(dbl(sc))continue;const q=o.q?o.q(k,d):triQ(k,d),sym=csym(sc[d-1],q);
  return relQ(k,MAJ[d-1],sc[d-1],`${k} major: the I chord root (${k}) is marked. Click the root of the ${rn(d,q)} chord (${sc[d-1]}) on the § string.`,`dr${k}${d}`,`${k} major: ${J(sc)}. The ${ord(d)} degree is ${sc[d-1]}, so the ${rn(d,q)} chord is built on it.`)}}

const rt=f=>()=>{for(let i=0;i<60;i++){try{return f()}catch(e){if(!/^(toneQ|voiceQ|identQ|measQ|relQ|pickCh|pickR|retry)/.test(e.message))throw e}}throw new Error('retry exhausted '+f)};

const scTxt=k=>`${k} major: ${spellScale(k).join(' ')}`;
const outN=(k,root,q)=>cn(root,q).filter(n=>!spellScale(k).map(pcOf).includes(pcOf(n)));
const named=(pre,o)=>{for(const[k,f]of Object.entries(o))Object.defineProperty(f,'name',{value:pre+k});return o};
const SPELLPOOL=['maj','min','dim','maj7','dom7','m7','maj6','m6','add9','sus4','sus2','m7b5','maj9','dom9','m9','m11','mMaj7'];
const chordTable=(root,forms)=>`<table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${forms.map(q=>`<tr><td>${csym(root,q)}</td><td>${fTxt(q)}</td><td>${J(cn(root,q))}</td></tr>`).join('')}</tbody></table>`;

const keyIdeas=(a,b)=>`<div><h3>Key ideas</h3><ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul><h3 style="margin-top:22px">On your guitar</h3><ul>${b.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
/* ===== Part 14: lessons 53–57 ===== */
function mkDeg(d,forms,pool,rootQ){const O={};
 O.Spell=()=>{const c=pickCh(d,forms),sc=spellScale(c.k),oth=SPELLPOOL.filter(q=>q!==c.q&&!sameSet(cpcs(c.root,q),cpcs(c.root,c.q))).map(q=>cn(c.root,q)).filter(a=>!dbl(a)).map(J);
  return{type:'choice',noBoard:true,key:`sp${d}${c.k}${c.q}`,text:`${c.k} major: the chord on the ${ord(d)} degree is built on ${c.root}. Which notes spell ${c.sym}?`,choices:mc(J(c.nt),oth),ans:J(c.nt),
   hint:`Spell ${c.k} major first, then pick the notes the formula ${fTxt(c.q)} asks for.`,explain:`${c.sym}: formula ${fTxt(c.q)} from ${c.root} gives ${J(c.nt)}. Every note is in ${scTxt(c.k)}, so ${c.sym} is the diatonic ${rn(d,c.q)} chord.`}};
 O.Root=()=>degRootQ([d],rootQ?{q:()=>rootQ}:{});
 O.Tone=rt(()=>toneQ(pickCh(d,forms)));
 O.Voice=rt(()=>voiceQ(pickCh(d,forms)));
 O.Ident=rt(()=>identQ(pickCh(d,forms),pool));
 O.Meas=rt(()=>measQ(pickCh(d,forms)));
 return O}
/* ---------- Lesson 53: IV ---------- */
const IVF=['maj','maj7','maj6','add9','maj7s11'];
const IV_=named('iv',mkDeg(4,IVF,['maj','maj7','maj6','add9','maj7s11','maj9','dom7','min']));
const ivBank=sbank('ivb',[
 ['What quality is the chord on the 4th degree of a major scale?','Major (IV)',['Minor (iv)','Diminished','Dominant 7th'],'In C major the IV chord is F A C. The triads run I ii iii IV V vi vii°, so IV is major.'],
 ['Which degrees of a major scale carry a maj7 chord?','I and IV',['I and V','IV and V','ii and V'],'Cmaj7 = C E G B and Fmaj7 = F A C E are both diatonic to C major. Only I and IV give a major triad plus a major 7th.'],
 ['What does a 6 chord add to a major triad?','The 6th (F6 = F A C D)',['The 7th','The 9th','The ♭7'],'F6 = F A C D. The D is the 2nd degree of C major, so the chord stays diatonic.'],
 ['What is the difference between Fadd9 and Fmaj9?','Fadd9 has no 7th',['Fadd9 has no 3rd','Fadd9 has a ♭7','Nothing: they are the same chord'],'Fadd9 = F A C G (1 3 5 9). Fmaj9 = F A C E G also contains the major 7th.'],
 ['Why is Fmaj7♯11 diatonic in C major?','Its ♯11 is B, the 7th degree of C major',['Its ♯11 is B♭','Every ♯11 is diatonic','It contains no 7th'],'Fmaj7♯11 = F A C E B. B is a ♯11 above F (a tritone) and it is in C major. A B♭ would be the natural 11th, which is not in the key.'],
 ['Which mode gives the scale for the IVmaj7♯11 chord?','Lydian (F Lydian)',['Dorian','Mixolydian','Phrygian'],'F Lydian = F G A B C D E: the notes of C major, with a ♯4 (B) that becomes the chord’s ♯11.']]);
/* ---------- Lesson 54: V ---------- */
const VF=['maj','dom7','dom9','dom13','sus4','sus47'];
const V_=named('v',mkDeg(5,VF,['maj','dom7','dom9','dom13','sus4','sus47','maj7','m7']));
const vBank=sbank('vb',[
 ['What quality is the V chord in a major key?','Major (V), and V7 with a ♭7 added',['Minor','Diminished','Augmented'],'In C major V is G B D, and G7 = G B D F. The V7 is the only diatonic dominant 7th chord.'],
 ['Which two notes of G7 form its tritone?','B and F (the 3rd and ♭7)',['G and D','D and F','G and B'],'B to F is 6 semitones. This tritone pulls G7 towards C: B rises to C and F falls to E.'],
 ['What is the formula of a 9 chord such as G9?','1 3 5 ♭7 9',['1 3 5 7 9','1 ♭3 5 ♭7 9','1 3 5 9'],'A 9 chord is a dominant 7th with the 9th added: G B D F A.'],
 ['Which note is the 13th of G13 in C major?','E',['F','A','C'],'The 13th is the 6th an octave up: G A B C D E. E belongs to C major, so G13 is diatonic.'],
 ['In a sus4 chord, which note replaces the 3rd?','The 4th',['The 2nd','The 6th','The 7th'],'Gsus4 = G C D. The C takes the place of the B.'],
 ['What is the formula of 7sus4 (e.g. G7sus4)?','1 4 5 ♭7',['1 3 5 ♭7','1 4 5 7','1 2 5 ♭7'],'G7sus4 = G C D F: the 4th (C) replaces the 3rd (B) of G7.'],
 ['What often happens after a Vsus4?','The 4th falls to the 3rd: Vsus4 → V',['It jumps to ii','It resolves to vii°','It becomes a minor chord'],'In C: Gsus4 (G C D) → G (G B D). The C falls a half step to B.']]);
/* ---------- Lesson 55: V fingerings ---------- */
const vfRoot=rt(()=>degRootQ([5],{q:()=>'dom7'}));
const vfTone=rt(()=>toneQ(pickCh(5,['maj','dom7','dom9'])));
const vfShell=rt(()=>{const ch=pickCh(5,['dom7']),o=pick([{sets:[[0,2,3]],orders:[['1','b7','3']],w:'root, ♭7 and 3rd'},{sets:[[1,3,4]],orders:[['1','b7','3']],w:'root, ♭7 and 3rd'},{sets:[[0,1,2],[1,2,3]],orders:[['1','3','b7']],w:'root, 3rd and ♭7'}]);
  const c={...ch,intro:`${ch.intro} Play it as a shell voicing (${o.w}, no 5th).`};return voiceQ(c,{v:{tones:['1','3','b7'],sets:o.sets,orders:o.orders}})});
function vfBox(){for(let i=0;i<300;i++){const c=pickCh(5,['maj','dom7']),a=R(0,3),st=[a,a+1,a+2],lo=R(2,10),hi=lo+3,tk=tokq(c.q),pcs=cpcs(c.root,c.q);
  const tg=pcsPositions(pcs,st,lo,hi).map(p=>({s:p.s,f:p.f,t:tlab(tk[pcs.indexOf(pcAt(p.s,p.f))])}));if(tg.length<3||tg.length>7)continue;
  return{type:'multi',key:`vb${c.sym}${a}${lo}`,box:[lo,hi],text:`${c.intro} Click every note of ${c.sym} (${J(c.nt)}) on the ${st.map(s=>SN[s]).join(', ')} strings inside the shaded frets ${lo}–${hi}.`,marks:[],targets:tg,notes:tg.map(p=>midi(p.s,p.f)).sort((x,y)=>x-y),pm:'chord',
   hint:`Find the notes ${J(c.nt)} one string at a time. In a 4-fret box each string holds at most one of each note.`,
   explain:`${c.sym} = ${J(c.nt)}. Inside frets ${lo}–${hi} on the ${st.map(s=>SN[s]).join(', ')} strings: ${tg.map(p=>`${c.nt[pcs.indexOf(pcAt(p.s,p.f))]} (${SL[p.s]} string, fret ${p.f})`).join(', ')}.`}}
  throw new Error('vfBox')}
function vfInv(){for(let i=0;i<300;i++){const c=pickCh(5,['maj','dom7']),tk=CORE[c.q],n=tk.length,inv=R(0,n-1),od=[...tk.slice(inv),...tk.slice(0,inv)];
  const v=mkV(c.root,c.q,{orders:[od],sets:n===3?SETS3B:SETS4,tones:tk});if(!v)continue;const ans=INV[inv];
  return{type:'choice',key:`vi${c.sym}${v.map(p=>p.s+p.tok).join('')}`,text:`${c.intro} It is played on these strings; the marks show note names and the lowest note is the bass. Which inversion is this?`,marks:v.map(p=>({s:p.s,f:p.f,t:p.name,k:p.tok==='1'?'root':'q'})),choices:mc(ans,INV.slice(0,n)),ans,notes:notesOf(v),pm:'chord',
   hint:`${c.sym} = ${J(c.nt)}. Which of those notes is lowest in the shape?`,explain:`${c.sym} = ${J(c.nt)}. The bass is ${v[0].name}, the ${tnm(v[0].tok)} of the chord, so this is ${ans}${inv?'':' (the root is in the bass)'}.`}}
  throw new Error('vfInv')}
const vfBank=sbank('vfb',[
 ['A shell voicing of V7 leaves out which note?','The 5th',['The root','The 3rd','The ♭7'],'Root, 3rd and ♭7 are enough to say “dominant 7th”. The 5th adds little, so it is dropped.'],
 ['From a I root on the low E string, where is the V root on the A string?','Two frets higher',['The same fret','Five frets higher','One fret lower'],'V is a perfect 5th above I. The P5 shape is next string, 2 frets higher (3 frets across the G–B pair). Example: G at E-string fret 3 → D at A-string fret 5.'],
 ['Which inversion of a V7 chord has the 3rd in the bass?','First inversion',['Root position','Second inversion','Third inversion'],'Root position has the root in the bass; 1st inversion the 3rd; 2nd the 5th; 3rd the ♭7.'],
 ['Why are shell voicings popular for V7?','They keep the two defining tones (3rd and ♭7) with few notes',['They contain every note of the chord','They only work on the top strings','They avoid the root'],'The 3rd and ♭7 form the tritone that makes the chord dominant, so three notes are enough.'],
 ['You slide a V7 shape up 12 frets. What do you get?','The same chord, one octave higher',['The IV chord','The relative minor','A different chord quality'],'12 frets is an octave, so the note names stay the same.'],
 ['In G7 = G B D F, which note is the leading tone of C major?','B (the 3rd)',['F (the ♭7)','D (the 5th)','G (the root)'],'B is a half step below C. The tritone B–F resolves to C–E.']]);
/* ---------- Lesson 56: vi ---------- */
const VIF=['min','m7','m9','m11'];
const VI_=named('vi',mkDeg(6,VIF,['min','m7','m9','m11','m6','maj','dom7','m7b5']));
function viDia(){const k=pick(CK),sc=spellScale(k),root=sc[5],ok=pick(['m7','m9','m11']),bad=shuf(['m6','mMaj7','m7b5','m13','dom7','maj7']).filter(q=>!isDia(k,6,q)).slice(0,3);
  return{type:'choice',noBoard:true,key:`vd${k}${ok}`,text:`${k} major: which of these chords is diatonic on the 6th degree (${root})?`,choices:mc(csym(root,ok),bad.map(q=>csym(root,q))),ans:csym(root,ok),
   hint:`Spell each chord and check every note against ${scTxt(k)}.`,explain:`${csym(root,ok)} = ${J(cn(root,ok))}: all in ${k} major. ${bad.map(q=>{const o=outN(k,root,q);return `${csym(root,q)} = ${J(cn(root,q))} contains ${J(o)}, which ${o.length>1?'are':'is'} not in the key`}).join('; ')}.`}}
const viBank=sbank('vib',[
 ['What quality is the triad on the 6th degree of a major scale?','Minor (vi)',['Major','Diminished','Augmented'],'In C major, vi is A C E: the relative minor.'],
 ['Which chord is the vi7 of C major?','Am7 (A C E G)',['A7','Amaj7','Am7♭5'],'Stack thirds on A inside C major: A C E G is a minor 7th chord.'],
 ['What is the formula of m9 (Am9 = A C E G B)?','1 ♭3 5 ♭7 9',['1 ♭3 5 7 9','1 3 5 ♭7 9','1 ♭3 ♭5 ♭7 9'],'It is a minor 7th with the 9th added. The B is a 9th above A and sits in C major.'],
 ['Which notes does Am11 contain?','A C E G B D',['A C E G B♭ D','A C♯ E G B D','A C E F♯ B D'],'Am11 = 1 ♭3 5 ♭7 9 11. The D is the 11th (a 4th an octave up) and is in C major.'],
 ['Why is Am6 (A C E F♯) not diatonic to C major?','The F♯ is not in C major',['The C is not in the key','Minor 6th chords never exist','The E is not in the key'],'Above A, the key’s 6th note is F natural (a minor 6th, the ♭13), so the major 6th F♯ is outside C major. The m6 chord is diatonic on ii instead (Dm6 = D F A B).'],
 ['Which mode fits the vi chord of a major key?','Aeolian (natural minor)',['Dorian','Phrygian','Mixolydian'],'A Aeolian = A B C D E F G: the notes of C major starting from A.'],
 ['How is Am7 related to C6?','They contain the same notes',['They share only two notes','C6 has an extra F♯','They are in different keys'],'Am7 = A C E G and C6 = C E G A. Same notes, different root.']]);
/* ---------- Lesson 57: vii ---------- */
const VIIF=['dim','m7b5'];
const VII_=named('vii',mkDeg(7,VIIF,['dim','m7b5','min','m7','dom7','dim7']));
function viiRootless(){const k=pick(CK),sc=spellScale(k),vr=sc[4],c=pickCh(7,VIIF,[k]),tri=c.q==='dim',ans=tri?`${vr}7`:`${vr}9`,
  dis=tri?[`${vr}9`,`${vr}sus4`,`${vr}m7`]:[`${vr}7`,`${vr}sus4`,`${vr}m7`];
  return{type:'choice',noBoard:true,key:`vr${k}${c.q}`,text:`In ${k} major, ${c.sym} contains the same notes as which V chord with its root removed?`,choices:mc(ans,dis),ans,
   hint:`Spell V7 or V9 in ${k} and see which notes are left when you drop the root.`,explain:tri?`${vr}7 = ${J(cn(vr,'dom7'))}. Drop the root and ${J(c.nt)} remains, which is ${c.sym}. So ${c.sym} is a rootless ${vr}7.`:`${vr}9 = ${J(cn(vr,'dom9'))}. Drop the root and ${J(c.nt)} remains, which is ${c.sym}. So ${c.sym} is a rootless ${vr}9.`}}
function viiLink(){const k=pick(CK),sc=spellScale(k);if(dbl(cn(sc[4],'dom7'))||dbl(sc))return viiLink();const c=mkC(sc[4],'dom7',k,5),q=toneQ(c,{tones:['3']});
  return{...q,key:'vl'+q.key,text:`${c.intro} The vii° chord of ${k} major is built on its 3rd. The root of ${c.sym} is marked: click the 3rd (${c.nt[1]}), which is the root of ${csym(sc[6],'dim')}, on the ${SN[q.target.s]} string.`,explain:q.explain+` That 3rd is the root of ${csym(sc[6],'dim')} (${J(cn(sc[6],'dim'))}).`}}
function viiFrom(){const k=pick(CK),sc=spellScale(k);if(dbl(cn(sc[4],'dom7'))||dbl(sc))return viiFrom();const c=mkC(sc[4],'dom7',k,5),q=voiceQ(c),dm=csym(sc[6],'dim');
  if(q.targets.length!==3)return viiFrom();
  return{...q,key:'vf'+q.key,text:q.text+` These three notes spell ${dm}.`,explain:q.explain+` The 3rd, 5th and ♭7 (${c.nt.slice(1).join(' ')}) form the vii° triad ${dm}.`}}
const viiBank=sbank('viib',[
 ['What quality is the triad on the 7th degree of a major scale?','Diminished (vii°)',['Minor','Major','Augmented'],'In C major, vii° is B D F: two minor thirds stacked.'],
 ['What is the 7th chord on vii called?','m7♭5 (half-diminished, ø7)',['°7','maj7','m7'],'In C major: B D F A = Bm7♭5 (also written Bø7).'],
 ['What is the formula of m7♭5?','1 ♭3 ♭5 ♭7',['1 ♭3 ♭5 𝄫7','1 ♭3 5 ♭7','1 3 ♭5 ♭7'],'Bm7♭5 = B D F A. The fully diminished 7th chord would lower the 7th again (B D F A♭).'],
 ['How do Bm7♭5 and B°7 differ?','Bm7♭5 has A, B°7 has A♭',['They are the same chord','B°7 has no ♭5','Bm7♭5 has a major 3rd'],'Bm7♭5 = B D F A (diatonic to C). B°7 = B D F A♭ (not diatonic).'],
 ['Why does vii° sound unstable?','It contains a tritone (B–F)',['It has no root','It is a minor 3rd chord','It is always loud'],'The tritone wants to resolve: B up to C, F down to E, giving a C chord.'],
 ['The vii chord is a rootless version of which chord?','V7 (or V9 for the 7th chord)',['IV','ii7','I'],'G7 without G is B D F; G9 without G is B D F A. That is why vii° acts like V.']]);

const LS={
 iv:{h:'iv-chords',n:'Lesson 53',title:'IV chords & construction',sub:'The chord on the 4th degree: maj, maj7, 6, add9 and maj7♯11.',
  ex:[['Construction',[IV_.Spell,ivBank]],['Find it',[IV_.Root,IV_.Tone]],['Voicings',[IV_.Voice,IV_.Ident,IV_.Meas]]],
  test:[...rep(IV_.Spell,3),...rep(ivBank,2),...rep(IV_.Root,2),...rep(IV_.Tone,3),...rep(IV_.Voice,2),...rep(IV_.Ident,2),IV_.Meas]},
 v:{h:'v-chords',n:'Lesson 54',title:'V chords & construction',sub:'The dominant chord: maj, 7, 9, 13, sus4 and 7sus4.',
  ex:[['Construction',[V_.Spell,vBank]],['Find it',[V_.Root,V_.Tone]],['Voicings',[V_.Voice,V_.Ident,V_.Meas]]],
  test:[...rep(V_.Spell,3),...rep(vBank,2),...rep(V_.Root,2),...rep(V_.Tone,3),...rep(V_.Voice,2),...rep(V_.Ident,2),V_.Meas]},
 vf:{h:'v-fingerings',n:'Lesson 55',title:'V chord fingerings',sub:'Locating the V chord and its tones on the neck.',
  ex:[['Locate the root',[vfRoot,vfTone]],['Shell voicings',[vfShell]],['Box & inversions',[vfBox,vfInv,vfBank]]],
  test:[...rep(vfRoot,2),...rep(vfTone,3),...rep(vfShell,3),...rep(vfBox,3),...rep(vfInv,3),vfBank]},
 vi:{h:'vi-chords',n:'Lesson 56',title:'vi chords & construction',sub:'The relative-minor chord: m, m7, m9 and m11.',
  ex:[['Construction',[VI_.Spell,viDia,viBank]],['Find it',[VI_.Root,VI_.Tone]],['Voicings',[VI_.Voice,VI_.Ident,VI_.Meas]]],
  test:[...rep(VI_.Spell,2),...rep(viDia,2),viBank,...rep(VI_.Root,2),...rep(VI_.Tone,3),...rep(VI_.Voice,2),...rep(VI_.Ident,2),VI_.Meas]},
 vii:{h:'vii-chords',n:'Lesson 57',title:'vii chords & construction',sub:'The diminished and half-diminished chords, and how they relate to V7.',
  ex:[['Construction',[VII_.Spell,viiBank]],['Link to V7',[viiRootless,viiLink,viiFrom]],['On the neck',[VII_.Root,VII_.Tone,VII_.Voice,VII_.Ident]]],
  test:[...rep(VII_.Spell,2),viiBank,...rep(viiRootless,2),...rep(viiLink,2),...rep(viiFrom,2),...rep(VII_.Tone,2),...rep(VII_.Voice,2),VII_.Ident,VII_.Root]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 53–57 mixed.',
  ex:[['Lessons 53–55',[IV_.Spell,IV_.Tone,IV_.Voice,IV_.Ident,V_.Spell,V_.Tone,V_.Voice,V_.Meas,vfRoot,vfShell,vfBox,vfInv]],['Lessons 56–57',[VI_.Spell,viDia,VI_.Tone,VI_.Voice,VII_.Spell,viiRootless,viiFrom,viiLink]]],
  test:[IV_.Spell,IV_.Tone,IV_.Voice,IV_.Ident,V_.Spell,V_.Tone,V_.Voice,V_.Meas,vfRoot,vfShell,vfBox,vfInv,VI_.Spell,viDia,VI_.Tone,VI_.Voice,VII_.Spell,viiRootless,viiFrom,viiLink]}};
const ORDER=['iv','v','vf','vi','vii','final'],STORE='gi-best-p14';

const NOTES={
 iv:`<div class="cols"><div><h3>IV chords in C major</h3>${chordTable('F',IVF)}<p class="small">The IV chord is on the 4th degree. Maj7♯11 is diatonic only here: the ♯11 (B) is the key’s 7th degree.</p></div>
  ${keyIdeas(['The chord on degree 4 is major: F A C in C major.','Every note you add (E, D, G, B) is a note of C major, so all five chords are diatonic.','The IV chord is the one place where a ♯11 stays in the key (Lydian).'],['Find F on the low E string (fret 1) and play the chord tones R 3 5 7 on four strings.','Play F6 and Fadd9 over the same bass note and hear the 6th and 9th colours.'])}</div>`,
 v:`<div class="cols"><div><h3>V chords in C major</h3>${chordTable('G',VF)}<p class="small">Assumption: 13 chords use the formula 1 3 5 ♭7 9 13; 11ths are left out because the natural 11th clashes with the major 3rd.</p></div>
  ${keyIdeas(['V is major; adding the ♭7 gives V7, the only diatonic dominant 7th.','9 and 13 are diatonic here too: A is the 9th, E the 13th.','sus4 replaces the 3rd (B) with the 4th (C), which then falls back to B.'],['Play G7, G9 and G13 and listen for the extra colour on top.','Play Gsus4 → G and G7sus4 → G7 to hear the 4th resolve.'])}</div>`,
 vf:`<div class="cols"><div><h3>Moving V on the neck</h3><table class="stack"><thead><tr><th>Idea</th><th>Shape</th></tr></thead><tbody><tr><td>V root from I root</td><td>next string, 2 frets up (3 across G–B), or same string 7 frets up</td></tr><tr><td>V7 shell (E string)</td><td>root, ♭7 on the D string, 3rd on the G string</td></tr><tr><td>V7 shell (A string)</td><td>root, ♭7 on the G string, 3rd on the B string</td></tr><tr><td>Inversions</td><td>name them by the lowest note: root, 3rd, 5th, ♭7</td></tr></tbody></table></div>
  ${keyIdeas(['Learn where V sits relative to I before you learn shapes.','Shell voicings carry the 3rd and ♭7: the pull towards I.','Inversions change only the bass note, not the chord name.'],['Play a V7 shell on the E-string root, then slide to the I chord a perfect 5th below.','Name the lowest note of any V7 you play and say which inversion it is.'])}</div>`,
 vi:`<div class="cols"><div><h3>vi chords in C major</h3>${chordTable('A',VIF)}<p class="small">m6 is not diatonic on vi: Am6 needs F♯. The m6 chord is diatonic on ii (Dm6 = D F A B).</p></div>
  ${keyIdeas(['vi is the relative minor: Am is built on the 6th degree and shares all its notes with C major.','m7, m9 and m11 stay inside the key; m6 and m13 need F♯, so they do not.','Think of vi as the home chord of A Aeolian.'],['Play Am7 then C6: same notes, different bass.','Add the 9th and 11th one string at a time: Am7 → Am9 → Am11.'])}</div>`,
 vii:`<div class="cols"><div><h3>vii chords in C major</h3>${chordTable('B',VIIF)}<table class="stack" style="margin-top:14px"><thead><tr><th>V chord</th><th>Without the root</th></tr></thead><tbody><tr><td>G7</td><td>${J(cn('G','dom7').slice(1))} = ${csym('B','dim')}</td></tr><tr><td>G9</td><td>${J(cn('G','dom9').slice(1))} = ${csym('B','m7b5')}</td></tr></tbody></table></div>
  ${keyIdeas(['vii° is two stacked minor 3rds; m7♭5 (ø7) adds a major 3rd on top.','Both contain the tritone B–F, which is why they pull to I.','vii° is the V7 chord with its root removed, so it works as a V substitute.'],['Play G7, then Bdim over the same strings: the top three notes are the same.','Resolve Bm7♭5 to Cmaj7 and listen to B → C and F → E.'])}</div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 53–57: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 58 starts Part 15 with suspended chords (sus, sus2, sus4), followed by power chords and slash chords.</p></div></div>`};
