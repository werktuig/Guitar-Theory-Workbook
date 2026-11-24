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
/* ===== Part 16: lessons 63–67 ===== */
const stp=(r,l,s)=>spellSteps(r,[[l,s]])[0];
/* ---------- Lesson 63: borrowed chords ---------- */
const BORR=[
 {rs:'iv',r7:'iv7',li:3,sm:5,q:'min',q7:'m7'},
 {rs:'♭III',r7:'♭IIImaj7',li:2,sm:3,q:'maj',q7:'maj7'},
 {rs:'♭VI',r7:'♭VImaj7',li:5,sm:8,q:'maj',q7:'maj7'},
 {rs:'♭VII',r7:'♭VII7',li:6,sm:10,q:'maj',q7:'dom7'},
 {rs:'ii°',r7:'iiø7',li:1,sm:2,q:'dim',q7:'m7b5'}];
function bPick(o={}){for(let i=0;i<300;i++){const k=pick(CK),sc=spellScale(k),b=pick(BORR),sev=o.sev===undefined?Math.random()<.4:o.sev,r=stp(k,b.li,b.sm),q=sev?b.q7:b.q;if(dbl(sc)||dbl(cn(r,q))||BADR.includes(r))continue;
  const c=mkC(r,q);c.k=k;c.b=b;c.num=sev?b.r7:b.rs;c.intro=`In ${k} major, ${c.num} (borrowed from ${k} minor) is ${c.sym}.`;c.ctx=`Key of ${k} major. `;return c}throw new Error('pickCh')}
const bwSpell=()=>{const c=bPick({sev:false}),k=c.k,sc=spellScale(k),b=c.b,nat=sc[b.li],dia=csym(nat,triQ(k,b.li+1)),pool=[dia,csym(nat,'maj'),csym(c.root,c.q==='maj'?'min':'maj'),csym(nat,'min')].filter(x=>x!==c.sym);
  return{type:'choice',noBoard:true,key:`bs${k}${b.rs}`,text:`In ${k} major, which chord is ${b.rs}, borrowed from ${k} minor?`,choices:mc(c.sym,pool),ans:c.sym,hint:`Spell the ${k} natural minor scale and build the triad on the matching degree.`,
   explain:`${k} natural minor: ${J(scaleNotes(k,'minor'))}. ${b.rs} sits on ${c.root} (${b.sm} semitones above ${k}), so it is ${c.sym} = ${J(c.nt)}. The diatonic chord on the ${ord(b.li+1)} degree of ${k} major would be ${dia}.`}};
const bwName=()=>{const c=bPick({sev:false}),ans=c.b.rs,pool=BORR.map(x=>x.rs).concat(['IV','vi','VI']).filter(x=>x!==ans);
  return{type:'choice',noBoard:true,key:`bn${c.k}${ans}`,text:`${c.sym} is a borrowed chord in ${c.k} major. Which Roman numeral is it?`,choices:mc(ans,pool),ans,hint:`Find ${c.root} among the notes of ${c.k} major and ${c.k} minor.`,explain:`${c.root} is ${c.b.sm} semitones above ${c.k}: a ${ans} chord from ${c.k} minor (${J(scaleNotes(c.k,'minor'))}).`}};
function bwProg(){const T=[[1,'B',4,1],[1,4,'B',1],[1,'B',5,1],[4,'B',1,5],[1,6,'B',1],[1,'B',6,5]];for(let i=0;i<99;i++){const k=pick(CK),sc=spellScale(k),t=pick(T),c=bPick({sev:false});if(c.k!==k){continue}
  const cs=t.map(x=>x==='B'?c.sym:csym(sc[x-1],triQ(k,x))),pos=t.indexOf('B');if(dbl(sc)||new Set(cs).size<3)continue;
  return{type:'choice',noBoard:true,key:`bp${k}${cs.join('')}`,text:`In ${k} major: ${cs.join(' – ')}. Which chord is borrowed (not in the key)?`,choices:mc(c.sym,cs.filter(x=>x!==c.sym)),ans:c.sym,hint:`Check each chord against ${scTxt(k)}.`,explain:`${c.sym} = ${J(c.nt)} contains ${J(outN(k,c.root,c.q))}, which is not in ${k} major. It is ${c.num}, borrowed from ${k} minor. The others are diatonic.`}}throw new Error('bwProg')}
const bwRoot=rt(()=>{const c=bPick({sev:false});return relQ(c.k,c.b.sm,c.root,`${c.k} major: the I root is marked. Click the root of ${c.b.rs} (${c.root}) on the § string.`,`br${c.k}${c.b.rs}`,`${c.b.rs} is a chord borrowed from ${c.k} minor.`)});
const bwVoice=rt(()=>voiceQ(bPick()));
const bwTone=rt(()=>toneQ(bPick()));
const bwIdent=rt(()=>{const c=bPick();return identQ(c,['maj','min','dim','m7','maj7','dom7','m7b5'])});
const bwFlat=rt(()=>{const iv=Math.random()<.5,k=pick(CK),sc=spellScale(k);if(dbl(sc))throw new Error('pickR');const root=sc[iv?3:1],q=iv?'maj':'min',c=mkC(root,q),v=mkV(root,q,{orders:[CORE[q]]});if(!v)throw new Error('pickR');
  const tk=iv?'3':'5',p=v.find(x=>x.tok===tk),tf=p.f-1,nn=iv?stp(k,5,8):spellF(root,'1 b3 b5')[2];if(!uniqF(p.s,tf))throw new Error('pickR');
  return{type:'click',key:`bf${k}${iv}${p.s}`,text:iv?`${k} major: the IV chord ${c.sym} is shown (R 3 5). To borrow iv (${csym(root,'min')}) from ${k} minor, lower the 3rd by a half step. Click the new note on the same ${SN[p.s]} string.`:`${k} major: the ii chord ${c.sym} is shown (R ♭3 5). To borrow ii° (${csym(root,'dim')}) from ${k} minor, lower the 5th by a half step. Click the new note on the same ${SN[p.s]} string.`,
   marks:v.map(x=>({s:x.s,f:x.f,t:x.t,k:x.tok==='1'?'root':'q'})),target:{s:p.s,f:tf,t:iv?'♭3':'♭5'},notes:[midi(p.s,p.f),midi(p.s,tf)],hint:'A half step down is one fret toward the nut.',
   explain:iv?`IV = ${J(c.nt)}; iv = ${J(cn(root,'min'))}. The 3rd ${c.nt[1]} drops to ${nn} (the ♭6 of ${k}): fret ${tf}.`:`ii = ${J(c.nt)}; ii° = ${J(cn(root,'dim'))}. The 5th ${c.nt[2]} drops to ${nn}: fret ${tf}.`}});
const bwBank=sbank('bwb',[
 ['Where do borrowed chords come from?','The parallel minor (same root as the major key)',['The relative minor','The dominant key','The next sharp key'],'C major borrows from C minor (parallel), not A minor (relative).'],
 ['Which chord is iv in C major?','Fm (F A♭ C)',['F major','F♯°','Dm'],'It is the triad on the 4th degree of C natural minor.'],
 ['Which notes of C natural minor are not in C major?','E♭, A♭ and B♭',['F♯, C♯ and G♯','E♭ only','D♭, G♭ and A♭'],'C minor has E♭, A♭ and B♭ where C major has E, A and B. Borrowed chords bring these in.'],
 ['B♭ in C major is…','♭VII, borrowed from C minor',['VII','vii°','♭VI'],'B♭ D F: the triad on the ♭7 degree.'],
 ['What is the difference between borrowing a chord and modulating?','Borrowing keeps the home key; modulating changes it',['They are the same','Borrowing needs a key signature change','Modulation never uses minor chords'],'A borrowed chord is a colour inside the same key.'],
 ['How does ii° differ from ii in C major?','Dm becomes D°: the 5th A drops to A♭',['The root moves','The 3rd rises','It becomes major'],'D° = D F A♭, from C natural minor.']]);
/* ---------- Lesson 64: secondary dominants ---------- */
const SDS=[2,3,4,5,6];
function sdPick(o={}){for(let i=0;i<300;i++){const k=pick(CK),sc=spellScale(k),d=pick(o.ds||SDS),tr=sc[d-1],r=stp(tr,4,7);if(dbl(sc)||dbl(cn(r,'dom7'))||BADR.includes(r))continue;
  const tn=romanOf(d,triQ(k,d)),c=mkC(r,'dom7');c.k=k;c.d2=d;c.tn=tn;c.tgt=csym(tr,triQ(k,d));c.num=`V7/${tn}`;c.intro=`In ${k} major, ${c.num} is ${c.sym}, the dominant 7th of ${c.tgt}.`;c.ctx=`Key of ${k} major. `;return c}throw new Error('pickCh')}
const sdSpell=()=>{const c=sdPick(),k=c.k,sc=spellScale(k),pool=SDS.filter(d=>d!==c.d2).map(d=>csym(stp(sc[d-1],4,7),'dom7')).concat([csym(c.root,'m7')]).filter(x=>!x.includes('𝄪')).filter(x=>x!==c.sym);
  return{type:'choice',noBoard:true,key:`sd${k}${c.d2}`,text:`In ${k} major, which chord is ${c.num}?`,choices:mc(c.sym,pool),ans:c.sym,hint:`${c.num} is the dominant 7th of ${c.tgt}: a perfect 5th above ${c.tgt}'s root.`,
   explain:`${c.tn} is ${c.tgt}. A perfect 5th above ${sc[c.d2-1]} is ${c.root}, so ${c.num} = ${c.sym} = ${J(c.nt)}.`}};
const sdTarget=()=>{const c=sdPick(),sc=spellScale(c.k),ans=c.num,pool=SDS.filter(d=>d!==c.d2).map(d=>`V7/${romanOf(d,triQ(c.k,d))}`);
  return{type:'choice',noBoard:true,key:`st${c.k}${c.d2}`,text:`In ${c.k} major, what Roman numeral labels ${c.sym}?`,choices:mc(ans,pool),ans,hint:`${c.sym} should resolve down a perfect 5th to a chord of the key.`,explain:`${c.sym} resolves down a 5th to ${c.tgt}, the ${c.tn} chord, so it is ${ans}.`}};
const sdRes=()=>{const c=sdPick(),sc=spellScale(c.k),pool=[1,2,3,4,5,6].filter(d=>d!==c.d2).map(d=>csym(sc[d-1],triQ(c.k,d)));
  return{type:'choice',noBoard:true,key:`sr${c.k}${c.d2}`,text:`In ${c.k} major, ${c.num} (${c.sym}) normally resolves to which chord?`,choices:mc(c.tgt,pool),ans:c.tgt,hint:`The secondary dominant is the V7 of its target.`,explain:`${c.num} means “V7 of ${c.tn}”: ${c.sym} resolves to ${c.tgt}.`}};
const sdRoot=rt(()=>{const c=sdPick();return relQ(c.k,(MAJ[c.d2-1]+7)%12,c.root,`${c.k} major: the I root is marked. Click the root of ${c.num} (${c.root}) on the § string.`,`sr${c.k}${c.d2}`,`${c.num} is the dominant 7th of ${c.tgt}: its root is a perfect 5th above ${spellScale(c.k)[c.d2-1]}.`)});
const sdVoice=rt(()=>voiceQ(sdPick()));
const sdTone=rt(()=>toneQ(sdPick()));
const sdOut=rt(()=>{const c=sdPick({ds:[2,4,5,6]}),v=mkV(c.root,'dom7');if(!v)throw new Error('pickR');const o=outN(c.k,c.root,'dom7');if(o.length!==1)throw new Error('pickR');
  return{type:'choice',key:`so${c.k}${c.d2}${v.map(p=>p.s).join('')}`,text:`This ${c.sym} shape is ${c.num} in ${c.k} major. The marks show note names. Which note is NOT in ${c.k} major?`,marks:v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),choices:mc(o[0],c.nt.filter(n=>n!==o[0])),ans:o[0],notes:notesOf(v),pm:'chord',hint:`Compare each note with ${scTxt(c.k)}.`,
   explain:`${c.sym} = ${J(c.nt)}. ${o[0]} is the 3rd: it is the leading tone of ${c.tgt} and is outside ${c.k} major. The other notes are in the key.`}});
const sdIdent=rt(()=>{const c=sdPick();return identQ(c,['dom7','m7','maj7','min','maj'])});
const sdSharp=rt(()=>{const k=pick(CK),sc=spellScale(k),d=pick([1,2,3,6]);if(dbl(sc))throw new Error('pickR');const root=sc[d-1],q=d===1?'maj7':'m7',c=mkC(root,q),v=mkV(root,q,{orders:[CORE[q]]});if(!v)throw new Error('pickR');
  const tk=d===1?'7':'b3',p=v.find(x=>x.tok===tk),tf=p.f+(d===1?-1:1),tgtD={1:4,2:5,3:6,6:2}[d],tn=romanOf(tgtD,triQ(k,tgtD));if(!uniqF(p.s,tf))throw new Error('pickR');
  return{type:'click',key:`sh${k}${d}${p.s}`,text:`${k} major: ${c.sym} (${rn(d,q)}) is shown. Change it into ${csym(root,'dom7')}, which is V7/${tn}, by moving one note. Click where that note goes on the same ${SN[p.s]} string.`,marks:v.map(x=>({s:x.s,f:x.f,t:x.t,k:x.tok==='1'?'root':'q'})),target:{s:p.s,f:tf,t:d===1?'♭7':'3'},notes:[midi(p.s,p.f),midi(p.s,tf)],
   hint:d===1?'A dominant 7th has a ♭7 where a maj7 has a 7.':'A dominant 7th has a major 3rd where a minor 7th has a ♭3.',explain:`${c.sym} = ${J(c.nt)}; ${csym(root,'dom7')} = ${J(cn(root,'dom7'))}. ${d===1?`The ${c.nt[3]} drops to ${cn(root,'dom7')[3]}`:`The ${c.nt[1]} rises to ${cn(root,'dom7')[1]}`}: ${d===1?'1 fret lower':'1 fret higher'}, fret ${tf}. ${csym(root,'dom7')} is the dominant of ${csym(sc[tgtD-1],triQ(k,tgtD))}.`}});
const sdBank=sbank('sdb',[
 ['What is V7/ii in C major?','A7 (the dominant 7th of Dm)',['G7','D7','E7'],'A perfect 5th above D is A: A7 = A C♯ E G resolves to Dm.'],
 ['What is V7/V in C major?','D7',['G7','A7','F7'],'A perfect 5th above G is D. D7 contains F♯.'],
 ['What is V7/IV in C major?','C7 (a dominant 7th on the tonic)',['F7','G7','E7'],'A perfect 5th above F is C. C7 has a B♭ that leads down to A in F.'],
 ['Which note of a secondary dominant is usually outside the key?','Its 3rd (the leading tone of the target)',['Its root','Its 5th','Nothing: it is always diatonic'],'In A7 (V7/ii) the C♯ is the leading tone to D.'],
 ['What interval separates the root of V7/x from the root of x?','Perfect 5th above',['Perfect 5th below','Major 3rd above','Minor 7th above'],'The V chord of any key sits a perfect 5th above its tonic.'],
 ['Which diatonic chord is usually not tonicised with a secondary dominant?','vii°',['ii','vi','V'],'A diminished chord is too unstable to act as a target, so V7/vii is rare.']]);
/* ---------- Lesson 65: blues ---------- */
const BARS=['I','I','I','I','IV','IV','I','I','V','IV','I','V'];
function bl(){for(let i=0;i<99;i++){const k=pick(CK),I=k,IV=P4N(k),V=P5N(k);if(dbl([...cn(I,'dom7'),...cn(IV,'dom7'),...cn(V,'dom7')]))continue;return{k,m:{I:csym(I,'dom7'),IV:csym(IV,'dom7'),V:csym(V,'dom7')},r:{I,IV,V}}}}
const P4N=r=>spellSteps(r,[[3,5]])[0],P5N=r=>spellSteps(r,[[4,7]])[0];
const blBar=()=>{const b=bl(),n=R(1,12),ans=b.m[BARS[n-1]];
  return{type:'choice',noBoard:true,key:`bb${b.k}${n}`,text:`12-bar blues in ${b.k}: which chord is played in bar ${n}?`,choices:mc(ans,Object.values(b.m)),ans,hint:`Remember the bar pattern: I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7.`,explain:`Bar ${n} is ${BARS[n-1]}7. In ${b.k}: I7 = ${b.m.I}, IV7 = ${b.m.IV}, V7 = ${b.m.V}.`}};
const blSeq=()=>{const b=bl(),g=R(0,2),pat=[BARS.slice(0,4),BARS.slice(4,8),BARS.slice(8,12)].map(a=>a.map(x=>b.m[x]).join(' ')),ans=pat[g],rom=[BARS.slice(0,4),BARS.slice(4,8),BARS.slice(8,12)][g].map(x=>x+'7').join(' ');
  return{type:'choice',noBoard:true,key:'bq'+b.k+g,text:`12-bar blues in ${b.k}: which chords make up bars ${g*4+1}–${g*4+4}?`,choices:mc(ans,[...pat,[b.m.V,b.m.V,b.m.I,b.m.I].join(' ')]),ans,hint:'Four bars of I, then IV IV I I, then the turnaround.',explain:`The form is I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7. Bars ${g*4+1}–${g*4+4} are ${rom}, which in ${b.k} is ${ans}.`}};
const blRoot=rt(()=>{const b=bl(),f4=Math.random()<.5,t=f4?'IV':'V';return relQ(b.k,f4?5:7,b.r[t],`12-bar blues in ${b.k}: the I7 root is marked. Click the root of ${t}7 (${b.r[t]}) on the § string.`,`bro${b.k}${t}`,`${t}7 is built on the ${f4?'4th':'5th'} degree of ${b.k}.`)});
const blAll=rt(()=>{const b=bl(),rs=R(0,2),f0=allPc(pcOf(b.k),[rs],1,9);if(!f0.length)throw new Error('pickR');const rf=f0[0].f,t4=nearF(rs,rf,rs+1,5),t5=nearF(rs,rf,rs+1,7);
  if(t4<0||t5<0||t4===t5||!uniqF(rs+1,t4)||!uniqF(rs+1,t5)||Math.abs(t5-rf)>4)throw new Error('pickR');
  return{type:'multi',key:`ba${b.k}${rs}`,text:`12-bar blues in ${b.k}: the I7 root is marked on the ${SN[rs]} string. On the ${SN[rs+1]} string, click the root of IV7 (${b.r.IV}) and the root of V7 (${b.r.V}).`,marks:[{s:rs,f:rf,t:'R',k:'root'}],targets:[{s:rs+1,f:t4,t:'IV'},{s:rs+1,f:t5,t:'V'}],notes:[midi(rs,rf),midi(rs+1,t4),midi(rs+1,t5)],pm:'seq',
   hint:'IV is a perfect 4th above I and V a perfect 5th above I.',explain:`${b.k} → ${b.r.IV} (IV) is ${t4===rf?'the same fret':offTxt(t4-rf)} on the next string; ${b.r.V} (V) is ${offTxt(t5-rf)} than the I root on the next string.`}});
const blCh=(()=>{return()=>{const b=bl(),t=pick(['I','IV','V']),c=mkC(b.r[t],'dom7');c.intro=`12-bar blues in ${b.k}: ${t}7 is ${c.sym}.`;c.ctx=`12-bar blues in ${b.k}. `;return c}})();
const blShell=rt(()=>{const ch=blCh(),o=pick([{sets:[[0,2,3]],orders:[['1','b7','3']],w:'root, ♭7 and 3rd'},{sets:[[1,3,4]],orders:[['1','b7','3']],w:'root, ♭7 and 3rd'},{sets:[[0,1,2],[1,2,3]],orders:[['1','3','b7']],w:'root, 3rd and ♭7'}]);
  return voiceQ({...ch,intro:`${ch.intro} Play it as a shell voicing (${o.w}).`},{v:{tones:['1','3','b7'],sets:o.sets,orders:o.orders}})});
const blTone=rt(()=>toneQ(blCh()));
const blIdent=rt(()=>identQ(blCh(),['dom7','maj7','m7','dom9','sus47']));
const blBank=sbank('blb',[
 ['How many bars is the standard blues form?','12',['8','16','10'],'Three lines of four bars.'],
 ['Which three chords make up the basic blues?','I7, IV7 and V7',['I, ii and V','i, iv and v','I, vi and V'],'In A: A7, D7, E7.'],
 ['What is the “turnaround” in a 12-bar blues?','The last bar or two (often ending on V7) that leads back to the start',['The first bar','The IV chord','A key change'],'Bars 11–12: I7 then V7.'],
 ['A common variant puts which chord in bar 2 (the “quick change”)?','IV7',['V7','vi7','ii7'],'The basic form keeps I7 in bar 2; the quick-change variant plays IV7 there.'],
 ['Why are all three blues chords dominant 7ths?','The ♭7 is the blues sound, even on I and IV',['They are all V chords','It makes them minor','It keeps them diatonic'],'The ♭7 of I7 and IV7 is borrowed from the blues/Mixolydian colour.'],
 ['In the basic form, bars 5 and 6 are…','IV7 and IV7',['I7 and I7','V7 and IV7','IV7 and I7'],'Bars 5–6: IV7 IV7, then bars 7–8: I7 I7.']]);
/* ---------- Lesson 66: chord families ---------- */
const FAM={1:0,3:0,6:0,2:1,4:1,5:2,7:2},FN=['Tonic family','Subdominant family','Dominant family'],FD=[[1,3,6],[2,4],[5,7]];
const fsym=(k,d)=>csym(spellScale(k)[d-1],triQ(k,d));
function fk(){for(let i=0;i<99;i++){const k=pick(CK);if(!dbl(spellScale(k))&&![1,2,3,4,5,6,7].some(d=>dbl(cn(spellScale(k)[d-1],triQ(k,d)))))return k}}
const cfFunc=()=>{const k=fk(),d=R(1,7),ans=FN[FAM[d]];return{type:'choice',noBoard:true,key:`cf${k}${d}`,text:`In ${k} major, which chord family does ${fsym(k,d)} (${romanOf(d,triQ(k,d))}) belong to?`,choices:FN.slice(),ans,hint:'Tonic: I iii vi. Subdominant: ii IV. Dominant: V vii°.',explain:`${fsym(k,d)} is ${romanOf(d,triQ(k,d))}, a member of the ${ans.toLowerCase()}.`}};
const cfMembers=()=>{const k=fk(),f=R(0,2),ds=FD[f],txt=x=>x.map(d=>fsym(k,d)).join(', '),ans=txt(ds),pool=FD.filter((_,i)=>i!==f).map(txt).concat([txt([1,4,5])]);
  return{type:'choice',noBoard:true,key:`cm${k}${f}`,text:`Which chords of ${k} major form the ${FN[f].toLowerCase()}?`,choices:mc(ans,pool),ans,hint:'Tonic: I iii vi. Subdominant: ii IV. Dominant: V vii°.',explain:`${FN[f]}: ${ds.map(d=>`${romanOf(d,triQ(k,d))} (${fsym(k,d)})`).join(', ')}.`}};
const cfSwap=()=>{const k=fk(),f=R(0,2),a=pick(FD[f]),rest=FD[f].filter(d=>d!==a),ans=fsym(k,pick(rest)),pool=FD.flatMap((g,i)=>i===f?[]:g).map(d=>fsym(k,d));
  return{type:'choice',noBoard:true,key:`cw${k}${a}`,text:`In ${k} major you want to replace ${fsym(k,a)} (${romanOf(a,triQ(k,a))}) with another chord of the same family. Which one works?`,choices:mc(ans,pool),ans,hint:`${romanOf(a,triQ(k,a))} belongs to the ${FN[f].toLowerCase()}.`,explain:`${fsym(k,a)} is in the ${FN[f].toLowerCase()} together with ${rest.map(d=>fsym(k,d)).join(' and ')}. The other choices belong to different families.`}};
const cfRoot=rt(()=>{const k=fk(),f=R(0,2),ds=f===0?[3,6]:FD[f],sc=spellScale(k),rs=R(0,2),f0=allPc(pcOf(k),[rs],1,11);if(!f0.length)throw new Error('pickR');const rf=f0[0].f,s2=R(rs,Math.min(5,rs+2)),tg=[];
  for(const d of ds){const t=nearF(rs,rf,s2,MAJ[d-1]);if(t<0||Math.abs(t-rf)>6||!uniqF(s2,t)||(s2===rs&&t===rf))throw new Error('pickR');tg.push({s:s2,f:t,t:romanOf(d,triQ(k,d))})}
  return{type:'multi',key:`cr${k}${f}${rs}${s2}`,text:`${k} major: the I root is marked. On the ${SN[s2]} string, click the roots of the ${f===0?'other two tonic-family chords':'two '+FN[f].toLowerCase()+' chords'} (${ds.map(d=>romanOf(d,triQ(k,d))).join(' and ')}).`,marks:[{s:rs,f:rf,t:'R',k:'root'}],targets:tg,notes:[midi(rs,rf),...tg.map(p=>midi(p.s,p.f))],pm:'seq',
   hint:`Their roots are ${ds.map(d=>sc[d-1]).join(' and ')}.`,explain:`${FN[f]}: ${ds.map(d=>`${romanOf(d,triQ(k,d))} = ${fsym(k,d)}`).join(', ')}. On the ${SN[s2]} string: ${tg.map(p=>`${sc[ds[tg.indexOf(p)]-1]} at fret ${p.f}`).join(', ')}.`}});
const cfPick=()=>{const k=fk(),d=R(1,7),c=mkC(spellScale(k)[d-1],triQ(k,d),k,d);c.fam=FAM[d];c.intro=`In ${k} major, ${rn(d,c.q)} (${FN[FAM[d]].toLowerCase()}) is ${c.sym}.`;return c};
const cfShape=rt(()=>{const c=cfPick(),v=mkV(c.root,c.q);if(!v)throw new Error('pickR');
  return{type:'choice',key:`cs${c.k}${c.d}${v.map(p=>p.s).join('')}`,text:`Key of ${c.k} major. The root (R) of this triad shape is marked; the other notes show chord-tone numbers. Which chord family does the chord belong to?`,marks:v.map(p=>({s:p.s,f:p.f,t:p.t,k:p.tok==='1'?'root':'q'})),choices:FN.slice(),ans:FN[c.fam],notes:notesOf(v),pm:'chord',
   hint:'Name the root, find its degree in the key, then use the family lists.',explain:`The root is ${c.root}, degree ${c.d} of ${c.k} major; the shape (${v.map(p=>p.t).join(' ')}) is ${c.sym}, ${rn(c.d,c.q)}: ${FN[c.fam].toLowerCase()}.`}});
const cfTone=rt(()=>toneQ(cfPick()));
const cfVoice=rt(()=>voiceQ(cfPick()));
const cfBank=sbank('cfb',[
 ['Which chords form the tonic family?','I, iii and vi',['I, IV and V','ii, IV and vi','V and vii°'],'They share many notes with I and give a sense of rest.'],
 ['Which chords form the subdominant (pre-dominant) family?','ii and IV',['I and vi','V and vii°','iii and vi'],'They move away from home and prepare the dominant.'],
 ['Which chords form the dominant family?','V and vii°',['ii and IV','I and iii','IV and vi'],'Both contain the tension that wants to resolve to I.'],
 ['A typical flow of chord families is…','Tonic → subdominant → dominant → tonic',['Dominant → subdominant → tonic','Tonic → dominant → subdominant','Subdominant → tonic → dominant'],'For example I – IV – V – I or I – ii – V – I.'],
 ['Why can vi replace I?','Both are in the tonic family and share two notes',['They share no notes','vi is the dominant','vi is always minor'],'Am (A C E) and C (C E G) share C and E.'],
 ['Why is vii° in the dominant family?','It contains the tritone of V7 and resolves to I',['It contains the tonic note','It is major','It is the relative minor'],'B D F is the top of G7, so it works like V.']]);
/* ---------- Lesson 67: more non-diatonic ---------- */
const trN=r=>spellSteps(r,[[4,6]])[0];
function trPick(){for(let i=0;i<99;i++){const x=pick(CK),s=trN(x);if(!dbl([...cn(x,'dom7'),...cn(s,'dom7')]))return{x,s}}}
const ndTri=()=>{const t=trPick(),k=pick(CK),sc=spellScale(k),useKey=Math.random()<.5&&!dbl(sc),X=useKey?sc[4]:t.x,S=trN(X);if(dbl(cn(S,'dom7')))return ndTri();const ans=csym(S,'dom7'),pool=[csym(P5N(X),'dom7'),csym(P4N(X),'dom7'),csym(stp(X,6,10),'dom7'),csym(trN(P5N(X)),'dom7')].filter(x=>x!==ans);
  return{type:'choice',noBoard:true,key:`nt${X}${useKey?k:''}`,text:useKey?`In ${k} major, which chord is the tritone substitute for V7 (${csym(X,'dom7')})?`:`Which chord is the tritone substitute for ${csym(X,'dom7')}?`,choices:mc(ans,pool),ans,hint:'The substitute’s root is 6 semitones from the original root.',explain:`A tritone from ${X} is ${S}, so ${csym(X,'dom7')} → ${ans}. ${csym(X,'dom7')} = ${J(cn(X,'dom7'))}; ${ans} = ${J(cn(S,'dom7'))}.`}};
const ndShare=()=>{const t=trPick(),n=cn(t.x,'dom7'),m=cn(t.s,'dom7'),ans=`${n[1]} and ${n[3]}`,pool=[`${n[0]} and ${n[1]}`,`${n[0]} and ${n[2]}`,`${n[2]} and ${n[3]}`,`${n[1]} and ${n[2]}`];
  return{type:'choice',noBoard:true,key:`ns${t.x}`,text:`${csym(t.x,'dom7')} and its tritone substitute ${csym(t.s,'dom7')} share two sounding notes. Which two, as spelled in ${csym(t.x,'dom7')}?`,choices:mc(ans,pool),ans,hint:'Spell both chords and compare the sounding pitches.',explain:`${csym(t.x,'dom7')} = ${J(n)}; ${csym(t.s,'dom7')} = ${J(m)}. The 3rd and ♭7 of one chord are the ♭7 and 3rd of the other (${n[1]} sounds as ${m[3]} and ${n[3]} sounds as ${m[1]}).`}};
const NDI=[{rs:'♭II',li:1,sm:1,q:'maj',label:'Neapolitan ♭II'},{rs:'♭II7',li:1,sm:1,q:'dom7',label:'tritone substitute'},{rs:'♯I°7',li:0,sm:1,q:'dim7',label:'passing chord'},{rs:'♯II°7',li:1,sm:3,q:'dim7',label:'passing chord'},{rs:'♯IV°7',li:3,sm:6,q:'dim7',label:'passing chord'}];
const ndName=()=>{for(let i=0;i<99;i++){const k=pick(CK),sc=spellScale(k),b=pick(NDI),r=stp(k,b.li,b.sm);if(dbl(sc)||dbl(cn(r,b.q))||!/^[A-G][♯♭]?$/.test(r)||BADR.includes(r))continue;const ans=b.rs,pool=NDI.map(x=>x.rs).concat(['II','VII']).filter(x=>x!==ans);
  return{type:'choice',noBoard:true,key:`nn${k}${ans}`,text:`In ${k} major, which Roman numeral labels the non-diatonic chord ${csym(r,b.q)}?`,choices:mc(ans,pool),ans,hint:`Find the root’s distance from ${k}, then read the chord type.`,explain:`${r} is ${b.sm} semitone${b.sm>1?'s':''} above ${k} (${b.sm===1&&b.li===1?'a lowered 2nd degree':'a raised degree'}); ${csym(r,b.q)} = ${J(cn(r,b.q))} is ${ans} (${b.label}).`}}throw new Error('ndName')};
const ndDim=()=>{for(let i=0;i<99;i++){const k=pick(CK),sc=spellScale(k),t=pick([[0,1,1,2,'I','ii'],[1,3,2,3,'ii','iii'],[3,6,4,5,'IV','V']]),r=stp(k,t[0],t[1]);if(dbl(sc)||dbl(cn(r,'dim7'))||r.length>2||BADR.includes(r))continue;
  const ans=csym(r,'dim7'),pool=[csym(sc[t[0]],'dim7'),csym(sc[t[2]],'dim7'),csym(sc[6],'dim7')].filter(x=>x!==ans&&!sameSet(cpcs(x.replace('°7',''),'dim7'),cpcs(r,'dim7')));if(pool.length<3)continue;
  return{type:'choice',noBoard:true,key:`nd${k}${t[0]}`,text:`In ${k} major, which diminished 7th chord can pass between ${t[4]} and ${t[5]} (a half step above the first root, a half step below the second)?`,choices:mc(ans,pool),ans,hint:`Find the note a half step above the root of ${t[4]}.`,explain:`${sc[t[0]]} up a half step is ${r}, and ${r} is a half step below ${sc[t[2]]}. ${ans} = ${J(cn(r,'dim7'))} slides chromatically into ${t[5]}.`}}throw new Error('ndDim')};
const ndRoot=rt(()=>{const t=trPick();return relQ(t.x,6,t.s,`Tritone substitution: replace ${csym(t.x,'dom7')} with the dominant 7th a tritone away. The root ${t.x} is marked. Click the root of the substitute (${t.s}) on the § string.`,`nr${t.x}`,`The substitute for ${csym(t.x,'dom7')} is ${csym(t.s,'dom7')}.`,{rs:R(0,2)})});
const ndPass=rt(()=>{const k=pick(CK),sc=spellScale(k),t=pick([[0,1,'I','ii'],[1,3,'ii','iii'],[3,6,'IV','V']]),r=stp(k,t[0],t[1]);if(dbl(sc)||dbl(cn(r,'dim7'))||r.length>2||BADR.includes(r))throw new Error('pickR');
  return relQ(sc[t[0]],1,r,`${k} major: the root of ${t[2]} (${sc[t[0]]}) is marked. Click the root of the passing diminished 7th chord ${csym(r,'dim7')} (between ${t[2]} and ${t[3]}) on the § string.`,`np${k}${t[0]}`,`The passing chord ${csym(r,'dim7')} has its root a half step above ${sc[t[0]]}.`)});
const ndCh=()=>{const t=trPick();if(Math.random()<.6){const c=mkC(t.s,'dom7');c.intro=`${csym(t.x,'dom7')} is replaced by its tritone substitute ${c.sym}.`;c.ctx=`Tritone substitute for ${csym(t.x,'dom7')}. `;return c}const c=mkC(t.x,'dim7');c.intro=`${c.sym} is a diminished 7th passing chord.`;c.ctx='';return c};
const ndVoice=rt(()=>voiceQ(ndCh()));
const ndTone=rt(()=>toneQ(ndCh()));
const ndIdent=rt(()=>identQ(ndCh(),['dom7','dim7','m7b5','m7','maj7']));
const ndBank=sbank('ndb',[
 ['What is a tritone substitution?','Replacing a dominant 7th with the dominant 7th a tritone away',['Replacing V with IV','Changing a chord to minor','Adding a 9th'],'G7 → D♭7.'],
 ['Why does D♭7 work in place of G7?','They share the same two guide tones (3rd and ♭7), swapped',['They share the same root','They are in the same key signature','They share all four notes'],'G7: B and F. D♭7: F and C♭ (=B).'],
 ['D♭7 resolves to C because…','its root falls by a half step to C',['its root falls a 5th','its root rises a 4th','it has no tritone'],'The bass moves chromatically D♭ → C.'],
 ['What is the ♭II chord in C major?','D♭ major (the Neapolitan chord)',['D major','D♭ minor','C♯°'],'D♭ F A♭: a major chord on the lowered 2nd degree, often followed by V or I.'],
 ['A ♯I°7 chord (C♯°7 in C) usually connects…','I and ii',['IV and V','V and I','ii and V'],'The bass climbs C – C♯ – D.'],
 ['Which of these is a mainstream “outside” chord that still resolves strongly?','The tritone substitute ♭II7',['A random chromatic chord','A minor chord on the 7th degree','A chord a 2nd above V'],'Its tritone guide tones are the same as V7’s.']]);

const LS={
 bor:{h:'borrowed-chords',n:'Lesson 63',title:'Borrowed chords',sub:'Chords from the parallel minor: iv, ♭III, ♭VI, ♭VII and ii°.',
  ex:[['Spell & name',[bwSpell,bwName,bwProg,bwBank]],['On the neck',[bwRoot,bwTone,bwVoice]],['Shapes',[bwFlat,bwIdent]]],
  test:[...rep(bwSpell,2),...rep(bwName,2),...rep(bwProg,2),bwBank,...rep(bwRoot,2),...rep(bwVoice,2),bwTone,...rep(bwFlat,2),bwIdent]},
 sec:{h:'secondary-dominants',n:'Lesson 64',title:'Secondary dominants',sub:'V7/ii, V7/iii, V7/IV, V7/V and V7/vi.',
  ex:[['Spell & name',[sdSpell,sdTarget,sdRes,sdBank]],['Find it',[sdRoot,sdTone,sdVoice]],['Shapes',[sdOut,sdIdent,sdSharp]]],
  test:[...rep(sdSpell,2),sdTarget,sdRes,sdBank,...rep(sdRoot,2),...rep(sdVoice,2),...rep(sdTone,2),sdOut,sdIdent,...rep(sdSharp,2)]},
 blues:{h:'blues-progressions',n:'Lesson 65',title:'Basic blues progressions',sub:'The 12-bar blues with I7, IV7 and V7.',
  ex:[['The form',[blBar,blSeq,blBank]],['Roots',[blRoot,blAll]],['Voicings',[blShell,blTone,blIdent]]],
  test:[...rep(blBar,3),blSeq,...rep(blBank,2),...rep(blRoot,2),...rep(blAll,2),...rep(blShell,2),...rep(blTone,2),blIdent]},
 fam:{h:'chord-families',n:'Lesson 66',title:'Chord families',sub:'Tonic, subdominant and dominant function.',
  ex:[['Function',[cfFunc,cfMembers,cfSwap,cfBank]],['On the neck',[cfRoot,cfShape]],['Chord tones',[cfTone,cfVoice]]],
  test:[...rep(cfFunc,2),cfMembers,...rep(cfSwap,2),cfBank,...rep(cfRoot,3),...rep(cfShape,3),cfTone,...rep(cfVoice,2)]},
 non:{h:'non-diatonic-progressions',n:'Lesson 67',title:'More non-diatonic chords',sub:'Tritone substitutes, passing diminished chords and ♭II.',
  ex:[['Tritone sub',[ndTri,ndShare,ndRoot,ndVoice]],['Passing & ♭II',[ndDim,ndPass,ndName]],['Shapes',[ndTone,ndIdent,ndBank]]],
  test:[...rep(ndTri,2),ndShare,ndName,...rep(ndDim,2),ndBank,...rep(ndRoot,2),ndPass,...rep(ndVoice,2),...rep(ndTone,2),ndIdent]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 63–67 mixed.',
  ex:[['Lessons 63–65',[bwSpell,bwName,bwRoot,bwVoice,bwFlat,sdSpell,sdRoot,sdVoice,sdSharp,sdOut,blBar,blRoot,blAll,blShell]],['Lessons 66–67',[cfFunc,cfRoot,cfShape,ndTri,ndRoot,ndPass]]],
  test:[bwSpell,bwName,bwRoot,bwVoice,bwFlat,sdSpell,sdRoot,sdVoice,sdSharp,sdOut,blBar,blRoot,blAll,blShell,cfFunc,cfRoot,cfShape,ndTri,ndRoot,ndPass]}};
const ORDER=['bor','sec','blues','fam','non','final'],STORE='gi-best-p16';

const NOTES={
 bor:`<div class="cols"><div><h3>Borrowed chords in C major</h3><table class="stack"><thead><tr><th>Numeral</th><th>Chord</th><th>Notes</th></tr></thead><tbody>${BORR.map(b=>{const r=stp('C',b.li,b.sm);return`<tr><td>${b.rs}</td><td>${csym(r,b.q)}</td><td>${J(cn(r,b.q))}</td></tr>`}).join('')}</tbody></table><p class="small">Assumption: “borrowed” means from the parallel natural minor (C minor for C major).</p></div>
  ${keyIdeas(['Same root, different mode: C major borrows from C minor.','The borrowed chord brings a note outside the key (E♭, A♭ or B♭).','iv, ♭VI and ♭VII are the most common; ♭VII–I and iv–I give a darker cadence.'],['Play C – F – Fm – C and listen to the A turning into A♭.','Try C – A♭ – B♭ – C.'])}</div>`,
 sec:`<div class="cols"><div><h3>Secondary dominants in C major</h3><table class="stack"><thead><tr><th>Name</th><th>Chord</th><th>Resolves to</th></tr></thead><tbody>${SDS.map(d=>{const tr=spellScale('C')[d-1],r=stp(tr,4,7);return`<tr><td>V7/${romanOf(d,triQ('C',d))}</td><td>${csym(r,'dom7')}</td><td>${csym(tr,triQ('C',d))}</td></tr>`}).join('')}</tbody></table></div>
  ${keyIdeas(['A secondary dominant is a dominant 7th a perfect 5th above a chord of the key.','Its 3rd is usually a note outside the key: the leading tone of the target.','V7/vii is rare because vii° is not stable enough to be tonicised.'],['Play C – A7 – Dm – G7 – C.','Turn any m7 chord into a dominant 7th by raising its ♭3 one fret.'])}</div>`,
 blues:`<div class="cols"><div><h3>12-bar blues</h3><table class="stack"><thead><tr><th>Bars</th><th>Chords</th></tr></thead><tbody><tr><td>1–4</td><td>I7 I7 I7 I7</td></tr><tr><td>5–8</td><td>IV7 IV7 I7 I7</td></tr><tr><td>9–12</td><td>V7 IV7 I7 V7</td></tr></tbody></table><table class="stack" style="margin-top:14px"><thead><tr><th>Key</th><th>I7</th><th>IV7</th><th>V7</th></tr></thead><tbody>${['A','E','G','C'].map(k=>`<tr><td>${k}</td><td>${csym(k,'dom7')}</td><td>${csym(P4N(k),'dom7')}</td><td>${csym(P5N(k),'dom7')}</td></tr>`).join('')}</tbody></table><p class="small">Variant: the quick-change form plays IV7 in bar 2. Questions use the basic form.</p></div>
  ${keyIdeas(['Three chords, all dominant 7ths.','IV is a perfect 4th above I and V a perfect 5th: the same shapes on every key.','Bar 12 (V7) is the turnaround back to the top.'],['Play a 12-bar blues in A with the root on the 5th string.','Move the same shapes to E (root on the 6th string).'])}</div>`,
 fam:`<div class="cols"><div><h3>Chord families in C major</h3><table class="stack"><thead><tr><th>Family</th><th>Chords</th></tr></thead><tbody>${FD.map((g,i)=>`<tr><td>${FN[i]}</td><td>${g.map(d=>`${romanOf(d,triQ('C',d))} (${fsym('C',d)})`).join(', ')}</td></tr>`).join('')}</tbody></table></div>
  ${keyIdeas(['Chords with the same function can replace each other.','The usual flow is tonic → subdominant → dominant → tonic.','vii° is in the dominant family: it is the top of V7.'],['Play C – F – G – C, then C – Dm – G – Am: same functions, different chords.','Replace the I in a progression with vi or iii.'])}</div>`,
 non:`<div class="cols"><div><h3>Mainstream non-diatonic chords in C</h3><table class="stack"><thead><tr><th>Idea</th><th>Chord</th></tr></thead><tbody><tr><td>Tritone sub of G7</td><td>${csym(trN('G'),'dom7')} (${J(cn(trN('G'),'dom7'))})</td></tr><tr><td>♭II (Neapolitan)</td><td>${csym('D♭','maj')}</td></tr><tr><td>♯I°7 (I → ii)</td><td>${csym('C♯','dim7')}</td></tr><tr><td>♯IV°7 (IV → V)</td><td>${csym('F♯','dim7')}</td></tr></tbody></table><p class="small">Assumption: only the most common non-diatonic chords are covered.</p></div>
  ${keyIdeas(['The tritone substitute shares the 3rd and ♭7 (swapped) with the original dominant.','Its root descends by a half step to the target: D♭7 → C.','A passing °7 chord slides chromatically between two diatonic chords.'],['Play Dm7 – D♭7 – Cmaj7.','Play C – C♯°7 – Dm7 – G7 – C.'])}</div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 63–67: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 68 starts Part 17 with key modulation, followed by the modes of the major scale.</p></div></div>`};
