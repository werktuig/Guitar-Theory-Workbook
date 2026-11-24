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
/* ===== Part 15: lessons 58–62 ===== */
const P4N=r=>spellSteps(r,[[3,5]])[0],P5N=r=>spellSteps(r,[[4,7]])[0];
const NATS=['C','D','E','F','G','A','B'];
/* ---------- Lesson 58: suspended chords ---------- */
const susSpell=()=>{for(let i=0;i<99;i++){const c=pickR(['sus2','sus4','sus47']),oth=['maj','min','sus2','sus4','sus47','dom7','add9'].filter(q=>q!==c.q&&!sameSet(cpcs(c.root,q),cpcs(c.root,c.q))).map(q=>J(cn(c.root,q)));
  return{type:'choice',noBoard:true,key:`ss${c.sym}`,text:`Which notes spell ${c.sym}?`,choices:mc(J(c.nt),oth),ans:J(c.nt),hint:`Start from the major scale of ${c.root}; the formula is ${fTxt(c.q)}.`,explain:`${c.sym}: formula ${fTxt(c.q)} from ${c.root} gives ${J(c.nt)}. There is no 3rd: it is replaced by the ${c.q==='sus2'?'2nd':'4th'}.`}}};
function susSwap(){for(let i=0;i<99;i++){const r=pick(CK),a=pick(['sus2','sus4']),b=a==='sus4'?'sus2':'sus4',r2=a==='sus4'?P4N(r):P5N(r);if(dbl([r2,...cn(r2,b)]))continue;
  const ans=csym(r2,b),pool=[csym(r,b),csym(P5N(r),b),csym(P4N(r),b),csym(P4N(P4N(r)),b),csym(P5N(P5N(r)),b),csym(r2,a)].filter(x=>x!==ans&&!sameSet(cpcs(x.replace(/sus.*/,''),b),cpcs(r,a)));
  if(pool.some(x=>dbl([x])))continue;
  return{type:'choice',noBoard:true,key:`sw${r}${a}`,text:`Which ${b} chord has exactly the same notes as ${csym(r,a)}?`,choices:mc(ans,pool),ans,hint:`Spell ${csym(r,a)}, then try each of its notes as a new root.`,
   explain:`${csym(r,a)} = ${J(cn(r,a))}. ${ans} = ${J(cn(r2,b))}: the same three notes with a different root. ${a==='sus4'?'A sus4 chord equals the sus2 chord a perfect 4th higher':'A sus2 chord equals the sus4 chord a perfect 5th higher'}.`}}throw new Error('susSwap')}
const susShift=rt(()=>{const c=pickR(['maj']),kind=pick(['sus4','sus2']),v=mkV(c.root,'maj',{orders:[['1','3','5']]});if(!v)throw new Error('pickR');
  const th=v[1],tf=th.f+(kind==='sus4'?1:-2),sym=csym(c.root,kind);if(tf<0||!uniqF(th.s,tf)||v.some(p=>p.s===th.s&&p.f===tf))throw new Error('pickR');
  const nn=cn(c.root,kind)[1];
  return{type:'click',key:`sh${c.root}${kind}${th.s}`,text:`This ${c.root} major shape shows R 3 5. To make ${sym}, the 3rd is replaced by the ${kind==='sus4'?'4th':'2nd'}. Click where the 3rd moves to on the same ${SN[th.s]} string.`,marks:v.map(p=>({s:p.s,f:p.f,t:p.t,k:p.tok==='1'?'root':'q'})),target:{s:th.s,f:tf,t:kind==='sus4'?'4':'2'},notes:[midi(th.s,th.f),midi(th.s,tf)],
   hint:`A major 3rd is 4 semitones above the root. A ${kind==='sus4'?'4th is 5':'2nd is 2'} semitones above it.`,
   explain:`${c.root} major = ${J(c.nt)}. For ${sym} (${J(cn(c.root,kind))}) the 3rd (${c.nt[1]}) becomes ${nn}: ${kind==='sus4'?'1 fret higher':'2 frets lower'} on the ${SN[th.s]} string, fret ${tf}.`}});
const susTone=rt(()=>toneQ(pickR(['sus2','sus4','sus47'])));
const susVoice=rt(()=>voiceQ(pickR(['sus2','sus4','sus47'])));
const susIdent=rt(()=>identQ(pickR(['sus2','sus4','sus47']),['maj','min','sus2','sus4','sus47','dom7']));
const susMeas=rt(()=>measQ(pickR(['sus2','sus4','sus47'])));
const susBank=sbank('sub',[
 ['What does the “sus” in sus4 stand for?','Suspended: the 3rd is replaced by the 4th',['Super: an extra 7th is added','Subdominant chord','Sustained fingering'],'Csus4 = C F G. The F is suspended in place of the E.'],
 ['Which notes does Csus2 contain?','C D G',['C E G','C F G','C D♯ G'],'The 2nd (D) replaces the 3rd: formula 1 2 5.'],
 ['A chord written just “Csus” normally means…','Csus4',['Csus2','C with a ♭3','Csus9'],'By convention a bare “sus” is sus4. (Convention, not a law: check the chart.)'],
 ['Why is a sus chord neither major nor minor?','It has no 3rd',['It has no root','It has no 5th','It has two 3rds'],'The 3rd decides major or minor. Sus chords replace it.'],
 ['Dsus4 (D G A) usually resolves to…','D (G falls to F♯)',['Dm','G','D7sus2'],'The 4th falls a half step to the major 3rd: G → F♯.'],
 ['What is the formula of 7sus4?','1 4 5 ♭7',['1 3 5 ♭7','1 4 5 7','1 2 5 ♭7'],'G7sus4 = G C D F.']]);
/* ---------- Lesson 59: power chords ---------- */
const nat=()=>pick(NATS);
const pwTone=rt(()=>{const r=nat(),five=Math.random()<.5,sm=five?7:12,tn=five?P5N(r):r;
  return relQ(r,sm,tn,`Power chord ${r}5. The root ${r} is marked. Click the ${five?`5th (${tn})`:`octave (${tn})`} on the § string.`,`pt${r}${five}`,`${r}5 = ${r} + ${P5N(r)} (root and 5th, often doubled at the octave).`,{s2:rs=>rs+(five?1:2),rs:R(0,five?3:2)})});
const pwBuild=rt(()=>{const r=nat(),rs=R(0,3),f0=allPc(pcOf(r),[rs],1,11);if(!f0.length)throw new Error('pickR');const rf=f0[0].f,t5=nearF(rs,rf,rs+1,7),t8=nearF(rs,rf,rs+2,12);
  if(t5<0||t8<0||Math.abs(t5-rf)>4||Math.abs(t8-rf)>4||!uniqF(rs+1,t5)||!uniqF(rs+2,t8))throw new Error('pickR');
  return{type:'multi',key:`pb${r}${rs}`,text:`Build the three-note power chord ${r}5 (root, 5th, octave). The root is marked on the ${SN[rs]} string. Click the 5th (${P5N(r)}) on the ${SN[rs+1]} string and the octave (${r}) on the ${SN[rs+2]} string.`,marks:[{s:rs,f:rf,t:'R',k:'root'}],targets:[{s:rs+1,f:t5,t:'5'},{s:rs+2,f:t8,t:'8'}],notes:[midi(rs,rf),midi(rs+1,t5),midi(rs+2,t8)],pm:'chord',
   hint:`The 5th is 7 semitones above the root and the octave 12. Use the open-string gaps between neighbouring strings.`,explain:`${r}5 = ${r} ${P5N(r)} ${r}. The 5th is ${t5===rf?'on the same fret':offTxt(t5-rf)+' than the root'} on the next string; the octave is ${t8===rf?'on the same fret':offTxt(t8-rf)+' than the root'} two strings up.`}});
const pwName=rt(()=>{const r=nat(),rs=R(0,3),f0=allPc(pcOf(r),[rs],1,11);if(!f0.length)throw new Error('pickR');const rf=f0[0].f,t5=nearF(rs,rf,rs+1,7),t8=nearF(rs,rf,rs+2,12);
  if(t5<0||t8<0||Math.abs(t5-rf)>4||Math.abs(t8-rf)>4)throw new Error('pickR');
  return{type:'choice',key:`pn${r}${rs}`,text:`This power chord has its root (R) on the ${SN[rs]} string. Which chord is it?`,marks:[{s:rs,f:rf,t:'R',k:'root'},{s:rs+1,f:t5,t:'5',k:'q'},{s:rs+2,f:t8,t:'R',k:'q'}],choices:mc(r+'5',NATS.map(x=>x+'5')),ans:r+'5',notes:[midi(rs,rf),midi(rs+1,t5),midi(rs+2,t8)],pm:'chord',
   hint:`Name the note under the R: it is on the ${SN[rs]} string at fret ${rf}.`,explain:`The root is ${where(rs,rf)}, so the chord is ${r}5 (${r} ${P5N(r)} ${r}).`}});
const pwRoot=rt(()=>{const r=nat(),s=R(0,2),f0=allPc(pcOf(r),[s],4,11);if(!f0.length)throw new Error('pickR');
  return{type:'click',key:`pr${r}${s}`,text:`To play ${r}5 with its root on the ${SN[s]} string, click the root note ${r}.`,marks:[],target:{s,f:f0[0].f,t:'R'},notes:[midi(s,f0[0].f)],hint:`Find ${r} on the ${SN[s]} string using the open-string note and the musical alphabet.`,explain:`${r} is at fret ${f0[0].f} of the ${SN[s]} string. The 5th (${P5N(r)}) would be on the next string up.`}});
const pwInv=rt(()=>{const r=nat();return relQ(r,7,P5N(r),`Inverted power chord: the 5th goes in the bass, a perfect 4th below the root ${r}. The root is marked. Click the 5th (${P5N(r)}) on the § string.`,`pi${r}`,`In the inverted power chord (${P5N(r)}–${r}) the 5th sits below the root.`,{s2:rs=>rs-1,rs:R(1,3)})});
const pwKey=()=>{for(let i=0;i<99;i++){const k=pick(CK),sc=spellScale(k),pcs=sc.map(pcOf),bad=sc[6],good=shuf(sc.slice(0,6)).slice(0,3);if(dbl(sc)||dbl([P5N(bad)]))continue;
  const ans=bad+'5';return{type:'choice',noBoard:true,key:`pk${k}`,text:`In ${k} major, which of these power chords contains a note outside the key?`,choices:mc(ans,good.map(x=>x+'5')),ans,hint:`A power chord is a root and a perfect 5th above it. Check the 5th of each against ${scTxt(k)}.`,explain:`${bad}5 = ${bad} ${P5N(bad)}, but ${P5N(bad)} is not in ${k} major (the diatonic chord on ${bad} is diminished: its 5th is a ♭5). Every other degree has a perfect 5th inside the key.`}}throw new Error('pwKey')};
const pwBank=sbank('pwb',[
 ['What notes make up a power chord?','Root and 5th (often with the octave)',['Root, 3rd and 5th','Root, 4th and 5th','Root and 3rd'],'C5 = C G (+ C). There is no 3rd.'],
 ['Is a power chord major or minor?','Neither: it has no 3rd',['Major','Minor','Diminished'],'The 3rd decides major or minor; power chords leave it out.'],
 ['Which interval separates the two different notes of a power chord?','Perfect 5th',['Major 3rd','Perfect 4th','Minor 7th'],'Root to 5th is 7 semitones. Inverted, the same two notes are a perfect 4th apart.'],
 ['How many different note names does a three-string power chord (R 5 8) contain?','2',['3','1','4'],'Root, 5th, and the root again an octave up.'],
 ['What happens if you put the 5th in the bass?','The shape becomes a perfect 4th (inverted power chord)',['It becomes a minor chord','It becomes a major chord','Nothing changes'],'G–C is a 4th; C–G is a 5th: the same two note names.'],
 ['Why do rock guitarists like power chords on distorted guitars?','Without a 3rd the sound stays clearer',['They contain more notes','They are always minor','They avoid the root'],'Thirds beat against each other when heavily distorted; two notes stay cleaner.']]);
/* ---------- Lesson 60: more on major scale chords ---------- */
const DPOOL=['maj','min','dim','maj7','dom7','m7','m7b5','maj6','m6','add9','maj9','dom9','m9','m11','dom13','maj13','m13','sus2','sus4','sus47','maj7s11','mMaj7'];
const degsOf=q=>[1,2,3,4,5,6,7].filter(d=>isDia('C',d,q));
function dWhich(){for(let i=0;i<200;i++){const k=pick(CK),sc=spellScale(k),d=R(1,7);if(dbl(sc))continue;const ok=DPOOL.filter(q=>isDia(k,d,q)),bad=DPOOL.filter(q=>!isDia(k,d,q));const a=pick(ok),bs=shuf(bad).slice(0,3);
  if(dbl(cn(sc[d-1],a))||bs.some(q=>dbl(cn(sc[d-1],q))))continue;
  return{type:'choice',noBoard:true,key:`dw${k}${d}${a}`,text:`${k} major: which chord can be built on the ${ord(d)} degree (${sc[d-1]}) using only notes of the key?`,choices:mc(csym(sc[d-1],a),bs.map(q=>csym(sc[d-1],q))),ans:csym(sc[d-1],a),hint:`Spell each chord and compare every note with ${scTxt(k)}.`,
   explain:`${csym(sc[d-1],a)} = ${J(cn(sc[d-1],a))}: all in the key. ${bs.map(q=>{const o=outN(k,sc[d-1],q);return `${csym(sc[d-1],q)} contains ${J(o)}, which ${o.length>1?'are':'is'} not in ${k} major`}).join('; ')}.`}}throw new Error('dWhich')}
function dWhere(){const qs=DPOOL.filter(q=>q!=='mMaj7'&&q!=='dim'&&degsOf(q).length>=1&&degsOf(q).length<=5);
  for(let i=0;i<200;i++){const k=pick(CK),sc=spellScale(k),q=pick(qs);if(dbl(sc))continue;const ds=degsOf(q),ans=ds.map(d=>rn(d,q)).join(', ');const alt=new Set();
   for(let t=0;t<60&&alt.size<3;t++){const n=shuf([1,2,3,4,5,6,7]).slice(0,ds.length).sort((a,b)=>a-b),s=n.map(d=>rn(d,q)).join(', ');if(s!==ans)alt.add(s)}
   const fail=[1,2,3,4,5,6,7].find(d=>!ds.includes(d));
   return{type:'choice',noBoard:true,key:`dh${k}${q}`,text:`In ${k} major, on which degrees can a ${AQ[q].name} chord (like ${csym(sc[ds[0]-1],q)}) be built using only notes of the key?`,choices:mc(ans,[...alt]),ans,hint:`Spell the chord on each degree and check it against ${scTxt(k)}.`,
    explain:`${ds.map(d=>`${csym(sc[d-1],q)} = ${J(cn(sc[d-1],q))}`).join('; ')} ${ds.length>1?'are':'is'} diatonic. ${fail?`On degree ${fail}, ${csym(sc[fail-1],q)} contains ${J(outN(k,sc[fail-1],q))}, which is outside the key.`:''}`}}throw new Error('dWhere')}
const pickDia=()=>{const d=R(1,7),forms=DPOOL.filter(q=>q!=='mMaj7'&&CORE[q]&&isDia('C',d,q));return pickCh(d,forms)};
const dRoman=rt(()=>{const c=pickDia(),v=mkV(c.root,c.q);if(!v)throw new Error('pickR');const d=c.d,ans=rn(d,c.q),dis=[rn(d%7+1,c.q),rn((d+2)%7+1,c.q),...DPOOL.filter(q=>q!==c.q&&!sameSet(cpcs(c.root,q),cpcs(c.root,c.q))&&isDia(c.k,d,q)).slice(0,2).map(q=>rn(d,q))].filter(x=>x!==ans);
  return{type:'choice',key:`dr${c.k}${d}${c.q}${v.map(p=>p.s).join('')}`,text:`Key of ${c.k} major. The root (R) of this shape is marked and the other notes show chord-tone numbers. Which Roman-numeral chord is it?`,marks:v.map(p=>({s:p.s,f:p.f,t:p.t,k:p.tok==='1'?'root':'q'})),choices:mc(ans,dis),ans,notes:notesOf(v),pm:'chord',
   hint:'Name the note under the R, find its degree in the key, then read the chord quality from the numbers.',explain:`The root is ${c.root}, degree ${d} of ${c.k} major (${J(spellScale(c.k))}). The shape holds ${v.map(p=>p.t).join(' ')}: ${c.sym} = ${J(c.nt)}, written ${ans}.`}});
const dIdent=rt(()=>identQ(pickDia(),DPOOL));
const dTone=rt(()=>toneQ(pickDia()));
const dVoice=rt(()=>voiceQ(pickDia()));
const dBank=sbank('db',[
 ['Which degrees of a major scale carry a m7 chord?','ii, iii and vi',['I, IV and V','ii, V and vii','iii, IV and vi'],'In C major: Dm7, Em7, Am7. I and IV are maj7, V is 7, vii is m7♭5.'],
 ['On which single degree is the 7th chord a dominant 7th?','V',['I','IV','vii'],'G7 = G B D F is the only dominant 7th chord in C major.'],
 ['The m6 chord (e.g. Dm6 = D F A B) is diatonic on which degree?','ii only',['vi only','ii and vi','iii and vi'],'Am6 would need F♯ and Em6 would need C♯. Only Dm6 fits C major.'],
 ['On which degrees is a sus4 chord diatonic?','I, ii, iii, V and vi',['I, ii, IV, V and vi','ii, iii, IV, V and vii','I, IV and V only'],'Fsus4 = F B♭ C needs B♭, and Bsus4 = B E F♯ needs F♯: both are outside C major, so IV and vii are out.'],
 ['On which degrees is a sus2 chord diatonic?','I, ii, IV, V and vi',['I, ii, iii, V and vi','I, IV and V only','ii, iii and vii'],'Esus2 would need F♯ and Bsus2 needs C♯, so iii and vii are out.'],
 ['Which chord type is diatonic only on IV?','maj7♯11',['maj7','maj9','add9'],'Fmaj7♯11 = F A C E B. The ♯11 (B) is the only place a major 7th chord’s ♯11 sits in the key.']]);
/* ---------- Lesson 61: progressions with more options ---------- */
const RICH={1:['maj7','maj9','add9','maj6'],2:['m7','m9','m11'],3:['m7'],4:['maj7','add9','maj6','maj7s11'],5:['dom7','dom9','dom13','sus47'],6:['m7','m9','m11'],7:['m7b5']};
const PGL=[[1,4,5,1],[1,6,4,5],[1,5,6,4],[2,5,1],[1,6,2,5],[1,3,4,5],[6,4,1,5],[1,4,6,5],[1,2,5,1],[4,5,3,6]];
const bsyms=(k,ds)=>ds.map(d=>csym(spellScale(k)[d-1],triQ(k,d)));
const broman=(k,ds)=>ds.map(d=>romanOf(d,triQ(k,d))).join('–');
function pgMake(){for(let i=0;i<200;i++){const k=pick(CK),sc=spellScale(k),ds=pick(PGL);if(dbl(sc))continue;const cs=ds.map(d=>mkC(sc[d-1],pick(RICH[d]),k,d));if(cs.some(c=>dbl(c.nt)))continue;
  return{k,ds,cs,syms:cs.map(c=>c.sym).join(' – '),prog:`${broman(k,ds)} (${bsyms(k,ds).join(' – ')})`}}throw new Error('pgMake')}
function pgRich(){for(let i=0;i<100;i++){const p=pgMake(),bads=[];const pos=shuf(p.ds.map((d,j)=>j));
  for(const j of pos){const d=p.ds[j],qs=shuf(['maj7','dom7','m7','maj6','m6','dom9','m9','m7b5','maj']).filter(q=>!isDia(p.k,d,q)&&!sameSet(cpcs(p.cs[j].root,q),cpcs(p.cs[j].root,p.cs[j].q)));if(!qs.length)continue;
   const q=qs[0],sy=p.cs.map((c,x)=>x===j?csym(c.root,q):c.sym).join(' – ');if(!bads.some(b=>b.s===sy)&&!dbl(cn(p.cs[j].root,q)))bads.push({s:sy,j,q})}
  if(bads.length<3)continue;const b3=bads.slice(0,3);
  return{type:'choice',noBoard:true,key:`pr${p.k}${p.syms}`,text:`${p.k} major, ${p.prog}. Which richer version uses only chords from the key?`,choices:mc(p.syms,b3.map(b=>b.s)),ans:p.syms,hint:'Check each chord’s notes against the key; one chord in each wrong version has a note outside it.',
   explain:`${p.cs.map(c=>`${c.sym} = ${J(c.nt)}`).join('; ')}: all diatonic. ${b3.map(b=>{const c=p.cs[b.j],o=outN(p.k,c.root,b.q);return `${csym(c.root,b.q)} contains ${J(o)}, outside ${p.k} major`}).join('; ')}.`}}throw new Error('pgRich')}
function pgRoman(){const p=pgMake(),ans=p.cs.map(c=>rn(c.d,c.q)).join(' – '),alt=new Set();
  for(let t=0;t<80&&alt.size<3;t++){const j=R(0,p.cs.length-1),c=p.cs[j],w=Math.random()<.5?rn(c.d,pick(['maj7','dom7','m7','maj','min'].filter(q=>q!==c.q))):rn(R(1,7),c.q),s=p.cs.map((x,i)=>i===j?w:rn(x.d,x.q)).join(' – ');if(s!==ans)alt.add(s)}
  return{type:'choice',noBoard:true,key:`pm${p.k}${p.syms}`,text:`The progression ${p.syms} is in ${p.k} major. Which Roman numerals describe it?`,choices:mc(ans,[...alt]),ans,hint:`Find each root’s degree in ${scTxt(p.k)}, then add the chord quality.`,explain:`${p.cs.map(c=>`${c.sym} = ${rn(c.d,c.q)}`).join('; ')}.`}}
function pgCommon(){const p=pgMake(),j=R(0,p.cs.length-2),a=p.cs[j],b=p.cs[j+1],cm=a.nt.filter(n=>b.nt.some(m=>pcOf(m)===pcOf(n))),ans=String(cm.length);
  return{type:'choice',noBoard:true,key:`pc${p.k}${a.sym}${b.sym}`,text:`How many notes do ${a.sym} and ${b.sym} have in common?`,choices:mc(ans,['0','1','2','3','4']),ans,hint:`Spell both chords and compare the note names.`,explain:`${a.sym} = ${J(a.nt)}; ${b.sym} = ${J(b.nt)}. ${cm.length?`Shared: ${J(cm)}.`:'No note is shared.'} Smooth progressions keep common tones.`}}
const pgRoots=rt(()=>{const p=pgMake(),s=R(0,1),pos=[];for(const c of p.cs){const f=allPc(pcOf(c.root),[s],1,11)[0];if(!f)throw new Error('pickR');if(!pos.some(x=>x.f===f.f))pos.push({s,f:f.f,t:c.root})}
  if(pos.length<3)throw new Error('pickR');
  return{type:'multi',key:`pg${p.k}${p.syms}${s}`,text:`${p.k} major: ${p.syms}. Click the root of each chord on the ${SN[s]} string (frets 1–11).`,marks:[],targets:pos,notes:pos.map(x=>midi(x.s,x.f)),pm:'seq',hint:`The roots are ${p.cs.map(c=>c.root).filter((x,i,a)=>a.indexOf(x)===i).join(', ')}. Find each on the ${SN[s]} string.`,explain:`Roots on the ${SN[s]} string: ${pos.map(x=>`${x.t} (fret ${x.f})`).join(', ')}.`}});
const pgCtx=(p,c)=>({...c,intro:`Progression in ${p.k} major: ${p.syms}. The ${rn(c.d,c.q)} chord is ${c.sym}.`,ctx:`Key of ${p.k} major. `});
const pgVoice=rt(()=>{const p=pgMake();return voiceQ(pgCtx(p,pick(p.cs)))});
const pgTone=rt(()=>{const p=pgMake();return toneQ(pgCtx(p,pick(p.cs)))});
const pgIdent=rt(()=>{const p=pgMake(),c=pick(p.cs);return identQ(pgCtx(p,c),[...RICH[c.d],triQ(p.k,c.d),'dom7','maj7','m7'])});
/* ---------- Lesson 62: slash chords ---------- */
function slPlace(){for(let i=0;i<600;i++){const root=pick(CK),q=pick(['maj','min']),tk=tokq(q),bt=pick([tk[1],tk[2],'2']),c=mkC(root,q);
  const bn=bt==='2'?spellF(root,'1 2')[1]:c.nt[tk.indexOf(bt)];if(dbl(c.nt)||dbl([bn]))continue;
  const set=pick([[2,3,4],[3,4,5]]),v=mkV(root,q,{sets:[set]});if(!v)continue;const sb=set[0]-R(1,2);if(sb<0)continue;const low=Math.min(...v.map(p=>midi(p.s,p.f))),avg=v.reduce((a,p)=>a+p.f,0)/3;
  const cand=allPc(pcOf(bn),[sb],0,15).filter(p=>midi(p.s,p.f)<low&&Math.abs(p.f-avg)<=5);if(!cand.length)continue;
  return{c,q,bt,bn,v,sb,bf:cand[0].f,slash:`${root}${q==='min'?'m':''}/${bn}`}}throw new Error('slPlace')}
const slMarks=x=>[...x.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),{s:x.sb,f:x.bf,t:x.bn,k:'q'}];
const slNotes=x=>[midi(x.sb,x.bf),...notesOf(x.v)];
const slRole=x=>x.bt==='2'?'not a chord tone (the 9th above the root)':x.bt==='5'?'the 5th (second inversion)':'the 3rd (first inversion)';
function slName(){const x=slPlace(),r=x.c.root,qs=x.q==='min'?'m':'',others=[x.c.nt[1],x.c.nt[2]].filter(n=>n!==x.bn),
  pool=[...others.map(n=>`${r}${qs}/${n}`),`${x.bn}/${r}`,`${r}${x.q==='min'?'':'m'}/${x.bn}`].filter(s=>s!==x.slash);
  return{type:'choice',key:`sn${x.slash}${x.v[0].s}`,text:`Name this chord. The lowest note is the bass; marks show note names.`,marks:slMarks(x),choices:mc(x.slash,pool),ans:x.slash,notes:slNotes(x),pm:'chord',hint:'Find the lowest note, then ask which chord the other notes spell.',
   explain:`The notes are ${slMarks(x).map(m=>m.t).join(' ')}. The upper notes spell ${x.c.sym} (${J(x.c.nt)}) and the lowest note is ${x.bn}, so it is ${x.slash}.`}}
function slClick(){for(let i=0;i<200;i++){const x=slPlace();if(!uniqF(x.sb,x.bf))continue;
  return{type:'click',key:`sc${x.slash}${x.sb}`,text:`Play ${x.slash}. The upper strings already play ${x.c.sym}. Click the bass note ${x.bn} on the ${SN[x.sb]} string.`,marks:x.v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),target:{s:x.sb,f:x.bf,t:x.bn},notes:slNotes(x),pm:'chord',hint:`Find ${x.bn} on the ${SN[x.sb]} string.`,
   explain:`${x.slash} = ${x.c.sym} with ${x.bn} in the bass (${slRole(x)}). ${x.bn} is at fret ${x.bf} of the ${SN[x.sb]} string.`}}throw new Error('slClick')}
function slTone(){const x=slPlace(),ans=slRole(x),all=['the 3rd (first inversion)','the 5th (second inversion)','not a chord tone (the 9th above the root)','the root'];
  return{type:'choice',key:`st${x.slash}${x.v[0].s}`,text:`This shape plays ${x.slash}. What is the bass note ${x.bn} in relation to ${x.c.sym}?`,marks:slMarks(x),choices:all,ans,notes:slNotes(x),pm:'chord',hint:`Spell ${x.c.sym} and see whether ${x.bn} is one of its notes.`,explain:`${x.c.sym} = ${J(x.c.nt)}. ${x.bn} is ${ans}.`}}
const slBuild=rt(()=>{const x=slPlace(),tg=x.v.map(p=>({s:p.s,f:p.f,t:p.t}));if(!x.v.every(p=>uniqF(p.s,p.f)))throw new Error('pickR');
  return{type:'multi',key:`sb${x.slash}${x.v.map(p=>p.s+p.tok).join('')}`,text:`Play ${x.slash}. The bass ${x.bn} is marked on the ${SN[x.sb]} string. Click ${x.v.map(p=>`the ${tnm(p.tok)} (${p.name}) on the ${SN[p.s]} string`).join(', ')}.`,marks:[{s:x.sb,f:x.bf,t:x.bn,k:'root'}],targets:tg,notes:slNotes(x),pm:'chord',hint:`Find each note on its own string, close together (within 4 frets).`,
   explain:`${x.slash} = ${x.c.sym} (${J(x.c.nt)}) over ${x.bn}: ${shapeStr(x.v)}.`}});
function slInv(){const x=slPlace(),ans=x.bt==='2'?'Not an inversion: the bass is not a chord tone':x.bt==='5'?'Second inversion':'First inversion';
  return{type:'choice',noBoard:true,key:`si${x.slash}`,text:`Which description fits ${x.slash}?`,choices:['Root position','First inversion','Second inversion','Not an inversion: the bass is not a chord tone'],ans,hint:`Spell ${x.c.sym} and find where ${x.bn} is in it.`,explain:`${x.c.sym} = ${J(x.c.nt)}. ${x.bn} is ${slRole(x)}, so ${x.slash} is: ${ans.toLowerCase()}.`}}
function slLine(){for(let i=0;i<99;i++){const k=pick(CK),sc=spellScale(k);if(dbl(sc))continue;const t=Math.random()<.5;
  const lead=t?`${sc[0]} – ? – ${sc[5]}`:`${sc[1]} – ? – ${sc[3]}`,mid=t?sc[6]:sc[2],A=t?csym(sc[0],'maj'):csym(sc[1],'min'),B=t?csym(sc[5],'min'):csym(sc[3],'maj'),
   ans=t?`${sc[4]}/${sc[6]}`:`${sc[0]}/${sc[2]}`,pool=t?[`${sc[4]}/${sc[1]}`,`${sc[0]}/${sc[4]}`,`${sc[3]}/${sc[0]}`]:[`${sc[0]}/${sc[4]}`,`${sc[4]}/${sc[6]}`,`${sc[3]}/${sc[0]}`];
  return{type:'choice',noBoard:true,key:`sl${k}${t}`,text:`In ${k} major: ${A} – ? – ${B}. Which slash chord gives a stepwise bass line ${lead}?`,choices:mc(ans,pool),ans,hint:'The middle chord must have the missing bass note at the bottom.',
   explain:`The bass note between ${t?sc[0]+' and '+sc[5]:sc[1]+' and '+sc[3]} is ${mid}. ${ans} is ${t?csym(sc[4],'maj'):csym(sc[0],'maj')} with ${mid} (its ${t?'3rd':'3rd'}) in the bass.`}}throw new Error('slLine')}
const slBank=sbank('slb',[
 ['What does the note after the slash in C/E tell you?','The note in the bass',['The next chord','The key','An added 9th'],'C/E is a C major chord with E as the lowest note.'],
 ['Which slash chord is C in first inversion?','C/E',['C/G','E/C','G/C'],'First inversion = 3rd in the bass: C E G with E lowest. C/G is second inversion.'],
 ['Why is F/G not an inversion of F?','G is not a note of F major (F A C)',['G is the root of F','F/G has no 3rd','F/G is minor'],'The bass G is a 2nd above F, i.e. the 9th: a non-chord-tone bass.'],
 ['Which chord is D/F♯?','D major with F♯ (its 3rd) in the bass',['D minor with F♯ in the bass','F♯ major over D','D7'],'D F♯ A with F♯ lowest: first inversion.'],
 ['Why choose G/B instead of plain G?','To put B in the bass for a smoother bass line',['To make the chord minor','To add a 7th','To change the key'],'For example C – G/B – Am walks C – B – A.'],
 ['How many different note names does G/B contain?','3 (G, B, D)',['4','2','5'],'B is already in the G triad, so no new note is added.']]);

const LS={
 sus:{h:'suspended-chords',n:'Lesson 58',title:'Suspended chords',sub:'sus2, sus4 and 7sus4: the 3rd replaced by the 2nd or 4th.',
  ex:[['Construction',[susSpell,susSwap,susBank]],['Neck shapes',[susShift,susTone]],['Voicings',[susVoice,susIdent,susMeas]]],
  test:[...rep(susSpell,2),...rep(susSwap,2),susBank,...rep(susShift,3),...rep(susTone,2),...rep(susVoice,2),...rep(susIdent,2),susMeas]},
 pw:{h:'power-chords',n:'Lesson 59',title:'Power chords',sub:'Root and 5th: shapes, names and inversions.',
  ex:[['Shape',[pwTone,pwBuild]],['Name & find',[pwName,pwRoot]],['Inversion',[pwInv]],['Theory',[pwKey,pwBank]]],
  test:[...rep(pwTone,3),...rep(pwBuild,2),...rep(pwName,3),...rep(pwRoot,2),...rep(pwInv,2),pwKey,...rep(pwBank,2)]},
 more:{h:'more-major-chords',n:'Lesson 60',title:'More major scale chords',sub:'Which extensions, sus and 6 chords are diatonic on which degree.',
  ex:[['Which are diatonic?',[dWhich,dWhere,dBank]],['Name it on the neck',[dRoman,dIdent]],['Find the tones',[dTone,dVoice]]],
  test:[...rep(dWhich,3),...rep(dWhere,2),dBank,...rep(dRoman,3),...rep(dIdent,2),...rep(dTone,2),...rep(dVoice,2)]},
 prog:{h:'progressions-more-options',n:'Lesson 61',title:'Progressions: more chords',sub:'Swapping basic chords for richer diatonic ones.',
  ex:[['Choose & name',[pgRich,pgRoman,pgCommon]],['Roots',[pgRoots]],['Voicings',[pgVoice,pgTone,pgIdent]]],
  test:[...rep(pgRich,2),...rep(pgRoman,2),pgCommon,...rep(pgRoots,3),...rep(pgVoice,3),...rep(pgTone,2),...rep(pgIdent,2)]},
 slash:{h:'slash-chords',n:'Lesson 62',title:'Slash chords',sub:'Inversions and bass-note chords such as C/E, D/F♯ and F/G.',
  ex:[['What is the bass?',[slInv,slTone]],['Name & build on the neck',[slName,slBuild,slClick]],['Bass lines',[slLine,slBank]]],
  test:[...rep(slInv,2),...rep(slLine,2),slBank,...rep(slName,3),...rep(slClick,3),...rep(slTone,2),...rep(slBuild,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 58–62 mixed.',
  ex:[['Lessons 58–60',[susSpell,susSwap,susShift,susTone,susVoice,pwTone,pwBuild,pwName,pwInv,dWhich,dRoman,dTone]],['Lessons 61–62',[pgRich,pgRoots,pgVoice,pgIdent,slInv,slName,slClick,slBuild]]],
  test:[susSpell,susSwap,susShift,susTone,susVoice,pwTone,pwBuild,pwName,pwInv,dWhich,dRoman,dTone,pgRich,pgRoots,pgVoice,pgIdent,slInv,slName,slClick,slBuild]}};
const ORDER=['sus','pw','more','prog','slash','final'],STORE='gi-best-p15';

const NOTES={
 sus:`<div class="cols"><div><h3>Suspended chords</h3><table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>C</th><th>G</th></tr></thead><tbody>${['sus2','sus4','sus47'].map(q=>`<tr><td>${AQ[q].sym}</td><td>${fTxt(q)}</td><td>${J(cn('C',q))}</td><td>${J(cn('G',q))}</td></tr>`).join('')}</tbody></table><p class="small">Assumption: a bare “sus” means sus4.</p></div>
  ${keyIdeas(['A sus chord replaces the 3rd with the 2nd or 4th, so it is neither major nor minor.','Asus4 and Dsus2 contain the same notes (A D E).','A suspended 4th usually falls to the 3rd: Dsus4 → D.'],['Play an open Dsus4, then lift the finger to D.','Take any major triad shape and move the 3rd 1 fret up (sus4) or 2 frets down (sus2).'])}</div>`,
 pw:`<div class="cols"><div><h3>Power chord shapes</h3><table class="stack"><thead><tr><th>Root string</th><th>5th</th><th>Octave</th></tr></thead><tbody>${[0,1,2,3].map(s=>`<tr><td>${SN[s]}</td><td>${SN[s+1]} string, ${shapeFret(s,5,s+1,7)-5} frets up</td><td>${SN[s+2]} string, ${shapeFret(s,5,s+2,12)-5} frets up</td></tr>`).join('')}</tbody></table></div>
  ${keyIdeas(['A power chord is the root and the 5th (plus the octave): no 3rd, so neither major nor minor.','The shape moves anywhere: the root decides the name.','In a major key, every degree but vii has a perfect 5th inside the key.'],['Play A5 on the low E string (fret 5), then slide the shape to D5 and E5.','Flip a power chord so the 5th is in the bass and hear the 4th shape.'])}</div>`,
 more:`<div class="cols"><div><h3>Diatonic chords in C major</h3><div class="scroll"><table><thead><tr><th>Degree</th><th>Diatonic chords from the family list</th></tr></thead><tbody>${[1,2,3,4,5,6,7].map(d=>`<tr><td>${rn(d,triQ('C',d))}</td><td>${DPOOL.filter(q=>q!=='mMaj7'&&isDia('C',d,q)).map(q=>csym(spellScale('C')[d-1],q)).join(' ')}</td></tr>`).join('')}</tbody></table></div></div>
  ${keyIdeas(['A chord is diatonic if every note, including the extensions, is in the key.','Some colours are only diatonic on one degree: dominant 7th/9th/13th on V, maj7♯11 on IV, m6 on ii.','Test it by spelling the chord and checking against the scale.'],['Play Dm6 and Am6: only the first fits C major.','Pick a degree and add 7, 9 and 11 one at a time, checking each note.'])}</div>`,
 prog:`<div class="cols"><div><h3>Richer versions in C major</h3><table class="stack"><thead><tr><th>Basic</th><th>Richer</th></tr></thead><tbody><tr><td>C – Am – F – G</td><td>Cmaj7 – Am7 – Fmaj7 – G7</td></tr><tr><td>Dm – G – C</td><td>Dm9 – G13 – Cmaj9</td></tr><tr><td>C – F – G – C</td><td>Cadd9 – Fmaj7 – Gsus4 – C6</td></tr></tbody></table></div>
  ${keyIdeas(['Replace each basic chord by a richer chord on the same degree.','Stay diatonic: use only the chords the previous lessons showed on each degree.','Keep common tones between chords to make the change smooth.'],['Play I–vi–IV–V with maj7, m7, maj7, 7.','Try the same progression in other keys using root-on-A-string shapes.'])}</div>`,
 slash:`<div class="cols"><div><h3>Slash chords</h3><table class="stack"><thead><tr><th>Chord</th><th>Bass is…</th></tr></thead><tbody>${[['C','E'],['G','B'],['D','F♯'],['F','G']].map(([r,b])=>`<tr><td>${r}/${b}</td><td>${r==='F'?'not a chord tone (the 9th)':b===cn(r,'maj')[1]?'the 3rd (first inversion)':'the 5th'}</td></tr>`).join('')}</tbody></table><p class="small">Assumption: the note after the slash is always the bass.</p></div>
  ${keyIdeas(['The letter after the slash is the lowest note.','When the bass is the 3rd or 5th the chord is an inversion; otherwise it is a bass-note chord such as F/G.','Slash chords create stepwise bass lines: C – G/B – Am.'],['Play C, C/E and C/G and listen to the bass change.','Play C – G/B – Am – C/G with the bass on the E and A strings.'])}</div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 58–62: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 63 starts Part 16 with chord progressions with borrowed chords.</p></div></div>`};
