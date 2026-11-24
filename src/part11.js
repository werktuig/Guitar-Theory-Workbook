/* ===== Part 11: lessons 42–44 (7th-chord progressions, finding the key, relative minor) ===== */
const keyByPc=pc=>KEASY.find(k=>pcOf(k)===((pc%12)+12)%12);
const D7=k=>diatonic(k,'major',4);
const scaleTxt=k=>`${k} major: ${spellScale(k).join(' ')}`;
const DASH=' – ';
const progRN=p=>p.map(d=>romanOf(d,['maj7','m7','m7','maj7','dom7','m7','m7b5'][d-1])).join(DASH);
const progSym=(k,p)=>p.map(d=>D7(k)[d-1].sym).join(DASH);
const chTxt=c=>`${c.sym} (${c.notes.join(' ')})`;
/* voicing whose pitch rises with the string number */
function vc(strings,pcs,lo=1,hi=15,span=4){let best=null;const cand=strings.map((s,i)=>{const o=[];for(let f=lo;f<=hi;f++)if(pcAt(s,f)===pcs[i])o.push(f);return o});
  const rec=(i,acc)=>{if(i===strings.length){const sp=Math.max(...acc)-Math.min(...acc);if(sp<=span-1){const sc=Math.max(...acc);if(!best||sc<best.sc)best={sc,v:acc.slice()}}return}
    for(const f of cand[i]){if(i>0&&midi(strings[i],f)<=midi(strings[i-1],acc[i-1]))continue;acc.push(f);rec(i+1,acc);acc.pop()}};
  rec(0,[]);return best?best.v.map((f,i)=>({s:strings[i],f})):null}
const ORDS=[[0,2,3,1],[0,1,2,3],[0,2,1,3],[1,0,2,3]];
/* a playable 4-note voicing of chord c (c.notes spelled): returns {v,ord} or null */
function anyVoicing(c){const pcs=c.notes.map(pcOf);for(let t=0;t<60;t++){const set=pick(SETS4),ord=pick(ORDS),v=vc(set,ord.map(i=>pcs[i]));if(v)return{v,ord}}return null}
const nameMarks=(c,r)=>r.v.map((p,i)=>({s:p.s,f:p.f,t:c.notes[r.ord[i]],k:r.ord[i]===0?'root':'q'}));
const playOf=v=>v.map(p=>midi(p.s,p.f));

/* ---------- Lesson 42: chord progressions with 7th chords ---------- */
const PROGS=[[2,5,1],[1,6,2,5],[3,6,2,5],[1,4,5,1],[1,6,4,5],[1,4,3,6],[2,5,1,6],[1,3,4,5],[6,2,5,1],[1,4,2,5]];
function pRoman(){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1];
  if(Math.random()<.5){const pool=[...ds.filter((x,i)=>i!==d-1).map(x=>x.sym),c.root+'maj7',c.root+'m7',c.root+'7',c.root+'m7♭5'];
    return{type:'choice',noBoard:true,key:`pr${k}${d}a`,text:`In ${k} major, which 7th chord is ${c.roman}?`,choices:mc(c.sym,pool),ans:c.sym,hint:`Spell the scale, take note number ${d}, then give it the 7th-chord quality that belongs to degree ${d}.`,explain:`${scaleTxt(k)}. Degree ${d} is ${c.root}, and the 7th chord built on it is ${chTxt(c)} = ${c.roman}.`}}
  const pool=ds.filter((x,i)=>i!==d-1).map(x=>x.roman);
  return{type:'choice',noBoard:true,key:`pr${k}${d}b`,text:`In ${k} major, what is the Roman numeral of ${c.sym}?`,choices:mc(c.roman,pool),ans:c.roman,hint:`Which degree of ${k} major is ${c.root}? Then decide: major 7th, minor 7th, dominant 7th or half-diminished?`,explain:`${scaleTxt(k)}. ${c.root} is degree ${d}, and ${chTxt(c)} is ${c.q==='maj7'?'a major 7th':c.q==='m7'?'a minor 7th':c.q==='dom7'?'a dominant 7th':'a half-diminished 7th'}: ${c.roman}.`}}
function pSpell(){const k=pickKey(),pi=R(0,PROGS.length-1),p=PROGS[pi],ds=D7(k),ans=progSym(k,p),k2=keyByPc(pcOf(k)+7);
  const d1=p.map(d=>ds[d-1].root+'7').join(DASH),d2=p.map(d=>{const c=ds[d-1];return c.root+(c.q==='maj7'?'m7':c.q==='m7'?'maj7':'m7')}).join(DASH),d3=progSym(k2,p),d4=p.map(d=>ds[d%7].sym).join(DASH);
  return{type:'choice',noBoard:true,key:`ps${k}${pi}`,text:`In ${k} major, which chords make the progression ${progRN(p)}?`,choices:mc(ans,[d1,d2,d3,d4]),ans,hint:`Find the root of each numeral in the ${k} major scale first, then add the 7th-chord quality of that degree.`,explain:`${scaleTxt(k)}. ${p.map(d=>`${ds[d-1].roman} = ${chTxt(ds[d-1])}`).join('; ')}. Answer: ${ans}.`}}
function pRootClick(){for(let t=0;t<120;t++){const k=pickKey(),s=R(0,1),r=rootFret(k,s,1),d=pick([2,3,4,5,6]),ds=D7(k),c=ds[d-1],tf=r+MAJ[d-1];if(r<1||tf>15)continue;
  return{type:'click',key:`pk${k}${s}${d}`,text:`${k} major: the root of ${ds[0].sym} (Imaj7) is marked on the ${SN[s]} string. On the same string, click the nearest higher root of ${c.sym} (${c.roman}).`,marks:[{s,f:r,t:'I',k:'root'}],target:{s,f:tf,t:c.roman.replace(/maj7|ø7|7/,'')},notes:[midi(s,r),midi(s,tf)],hint:`How many frets above the tonic is degree ${d} of the major scale?`,explain:`${scaleTxt(k)}. ${c.root} is degree ${d}, ${fr(MAJ[d-1])} above ${k} (${nm(MAJ[d-1])}). On the ${SN[s]} string: fret ${r} + ${MAJ[d-1]} = fret ${tf}.`}}}
function pGuide(){for(let t=0;t<200;t++){const k=pickKey(),ds=D7(k),v=R(1,3),s=R(0,5),A=v===1?ds[1]:ds[4],B=v===1?ds[4]:ds[0];
  /* v1: 7th of ii7 -> 3rd of V7 (down); v2: 7th of V7 -> 3rd of Imaj7 (down); v3: 3rd of V7 -> root of Imaj7 (up) */
  const from=v===3?A.notes[1]:A.notes[3],to=v===1?B.notes[1]:v===2?B.notes[1]:B.notes[0],fromT=v===3?'3':'♭7',toT=v===3?'R':'3',dir=v===3?1:-1;
  const cs=[];for(let f=2;f<=13;f++)if(pcAt(s,f)===pcOf(from))cs.push(f);if(!cs.length)continue;const f=pick(cs),tf=f+dir;
  const fromWho=v===1?`the 7th of ${A.sym} (ii7)`:v===2?`the 7th of ${A.sym} (V7)`:`the 3rd of ${A.sym} (V7)`,toWho=v===1?`the 3rd of ${B.sym} (V7)`:v===2?`the 3rd of ${B.sym} (Imaj7)`:`the root of ${B.sym} (Imaj7)`;
  return{type:'click',key:`pg${k}${v}${s}`,text:`${k} major: the marked note is ${fromWho}. It moves by a half step to ${toWho}. Click the note it moves to on the same string.`,marks:[{s,f,t:fromT,k:'q'}],target:{s,f:tf,t:toT},notes:[midi(s,f),midi(s,tf)],hint:'Spell the second chord and find which of its notes is a half step from the marked note, then decide if it is a fret up or down.',explain:`${A.sym} = ${A.notes.join(' ')}; ${B.sym} = ${B.notes.join(' ')}. ${from} moves ${dir<0?'down':'up'} a half step to ${to}: ${fr(1)} ${dir<0?'lower':'higher'} on the same string, fret ${tf}.`+(v===1?' Together with the 3rd of ii7 staying as the 7th of V7, this is the guide-tone line of ii–V–I.':'')}}}
function pIdent(){for(let t=0;t<120;t++){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1],r=anyVoicing(c);if(!r)continue;
  return{type:'choice',key:`pi${k}${d}${r.ord.join('')}${r.v[0].s}`,text:`These four notes (root marked) are a 7th chord from ${k} major. Which chord is it, as a Roman numeral?`,marks:nameMarks(c,r),choices:mc(c.roman,ds.filter((x,i)=>i!==d-1).map(x=>x.roman)),ans:c.roman,notes:playOf(r.v),pm:'chord',hint:`Find the chord quality from the notes (maj7, m7, dominant 7 or ø7), then find the root in the ${k} major scale.`,explain:`${chTxt(c)} is degree ${d} of ${k} major: ${c.roman}. ${scaleTxt(k)}.`}}}
const pBank=sbank('pb',[
 ['In a major key, which 7th chord is built on the 5th degree?','V7 (dominant 7th)',['Vmaj7','vm7','Vm7♭5'],'The 5th degree carries the only dominant 7th chord in the key: in C major, G B D F = G7.'],
 ['Which 7th chord is built on the 7th degree of a major key?','viiø7 (half-diminished)',['vii7','VIImaj7','vii°7 (fully diminished)'],'In C major it is B D F A = Bm7♭5. The fully diminished 7th (B D F A♭) is not diatonic to the major scale.'],
 ['Which chords of the harmonized major scale are major 7th chords?','Imaj7 and IVmaj7',['ii7 and V7','Imaj7 and V7','IVmaj7 and viiø7'],'Cmaj7 and Fmaj7 in C major. The others are m7 (ii, iii, vi), the dominant 7 (V) and the m7♭5 (vii).'],
 ['How many minor 7th chords are in the harmonized major scale?','3 (ii7, iii7, vi7)',['2','4','1'],'Dm7, Em7 and Am7 in C major.'],
 ['In ii7–V7–Imaj7, the V7 chord…','pulls toward the Imaj7 chord',['is the home chord','is unrelated to the other two','is always minor'],'V7 is the dominant: its 3rd (leading note) rises to the root and its 7th falls to the 3rd of I.'],
 ['In iii7–vi7–ii7–V7–Imaj7 every root moves…','down a perfect 5th (up a perfect 4th)',['up a whole step','down a minor 3rd','up a perfect 5th'],'In C: E → A → D → G → C, each one a 5th lower (or a 4th higher). This is the circle of fifths.'],
 ['Which two chords of a major key have a dominant function?','V7 and viiø7',['Imaj7 and IVmaj7','ii7 and iii7','vi7 and ii7'],'Both contain the tritone between the 4th and 7th degrees of the key and pull toward the tonic.'],
 ['In G7 → Cmaj7, the 7th of G7 (F) moves…','down a half step to E',['up a half step to F♯','up a whole step to G','down a whole step to E♭'],'The 7th of the dominant resolves down to the 3rd of the tonic chord; the 3rd of G7 (B) rises to C.']]);

/* ---------- Lesson 43: find the key of a song with 7th chords ---------- */
function fkClue(){const k=pickKey(),ds=D7(k),v=Math.random()<.55?5:7,c=ds[v-1],pc=pcOf(c.root),off=v===5?5:1,ans=k;
  const pool=v===5?[keyByPc(pc),keyByPc(pc+7),keyByPc(pc+2),keyByPc(pc+1)]:[keyByPc(pc),keyByPc(pc-1),keyByPc(pc+5),keyByPc(pc+7)];
  return{type:'choice',noBoard:true,key:`fc${k}${v}`,text:v===5?`A song contains the chord ${c.sym}. If it is the V7 chord (the only dominant 7th in a major key), which major key is the song in?`:`A song contains the chord ${c.sym}. If it is the viiø7 chord (the only half-diminished 7th in a major key), which major key is the song in?`,choices:mc(ans,pool),ans,hint:v===5?'V7 sits a perfect 5th above the tonic: go back down a perfect 5th from its root.':'The 7th degree is a half step below the tonic.',explain:v===5?`${c.sym} = ${c.notes.join(' ')} is V7. The tonic is a perfect 5th below its root (or a perfect 4th above): ${c.root} → ${k}. ${scaleTxt(k)}.`:`${c.sym} = ${c.notes.join(' ')} is viiø7. The tonic is a half step above its root: ${c.root} → ${k}. ${scaleTxt(k)}.`}}
const fitsKey=(kk,chs)=>chs.every(c=>D7(kk).some(x=>pcOf(x.root)===c.rpc&&x.q===c.q));
function fkProg(){for(let t=0;t<300;t++){const k=pickKey(),pi=R(0,PROGS.length-1),p=PROGS[pi],ds=D7(k),chs=[...new Set(p)].map(d=>({rpc:pcOf(ds[d-1].root),q:ds[d-1].q,c:ds[d-1]}));
  if(KEASY.filter(kk=>fitsKey(kk,chs)).length!==1)continue;
  const rank=shuf(KEASY.filter(kk=>kk!==k)).map(kk=>({kk,n:chs.filter(c=>D7(kk).some(x=>pcOf(x.root)===c.rpc&&x.q===c.q)).length})).sort((a,b)=>b.n-a.n).slice(0,3).map(x=>x.kk);
  const clue=chs.find(c=>c.q==='dom7'),clueTxt=clue?`${clue.c.sym} is the only dominant 7th, so it is V7 and the tonic is a perfect 5th below it: ${k}.`:'None of the chords is a dominant 7th or ø7, so compare the maj7 and m7 chords: only one key contains them all.';
  return{type:'choice',noBoard:true,key:`fp${k}${pi}`,text:`Which major key do all of these chords belong to? ${progSym(k,p)}`,choices:mc(k,rank),ans:k,hint:'Look for the dominant 7th (or the ø7) first: it points to one key. Then check the other chords.',explain:`${chs.map(c=>`${c.c.sym} = ${c.c.roman}`).join(', ')} in ${scaleTxt(k)}. ${clueTxt}`}}
  return fkClue()}
function fkRoot(){for(let t=0;t<120;t++){const k=pickKey(),ds=D7(k),v=Math.random()<.6?5:7,c=ds[v-1],s=R(0,3),cs=[];for(let f=1;f<=12;f++)if(pcAt(s,f)===pcOf(c.root))cs.push(f);if(!cs.length)continue;const f=pick(cs),off=v===5?5:1,tf=f+off;if(tf>15)continue;
  return{type:'click',key:`fr${k}${v}${s}${f}`,text:v===5?`${c.sym} is the V7 chord of its key. Its root is marked on the ${SN[s]} string. Click the key’s tonic on the same string: the nearest one above the marked note.`:`${c.sym} is the viiø7 chord of its key. Its root is marked on the ${SN[s]} string. Click the key’s tonic on the same string: the nearest one above the marked note.`,marks:[{s,f,t:v===5?'V7':'ø7',k:'q'}],target:{s,f:tf,t:'I'},notes:[midi(s,f),midi(s,tf)],hint:v===5?'The tonic is a perfect 5th below the root. The same note is a perfect 4th above it.':'The tonic is one half step above the 7th degree.',explain:v===5?`${c.root} is V7 of ${k}: a perfect 4th above ${c.root} (5 frets on the same string) is ${k}: fret ${tf}.`:`${c.root} is the 7th degree of ${k} major: the tonic is one fret higher: ${k} at fret ${tf}.`}}}
function fkVoicing(){for(let t=0;t<120;t++){const k=pickKey(),ds=D7(k),v=Math.random()<.55?5:7,c=ds[v-1],r=anyVoicing(c);if(!r)continue;const pc=pcOf(c.root);
  const pool=v===5?[keyByPc(pc),keyByPc(pc+7),keyByPc(pc+2),keyByPc(pc+1)]:[keyByPc(pc),keyByPc(pc-1),keyByPc(pc+5),keyByPc(pc+7)];
  return{type:'choice',key:`fv${k}${v}${r.ord.join('')}${r.v[0].s}`,text:`These notes are a 7th chord (root marked) that appears only once in a major key. Which major key does it come from?`,marks:nameMarks(c,r),choices:mc(k,pool),ans:k,notes:playOf(r.v),pm:'chord',hint:'Is it a dominant 7th (V7) or a half-diminished chord (viiø7)? Each one points to the tonic in its own way.',explain:v===5?`${c.notes.join(' ')} is ${c.sym}, a dominant 7th: V7. The tonic is a perfect 5th below the root: ${k}.`:`${c.notes.join(' ')} is ${c.sym}, a half-diminished chord: viiø7. The tonic is a half step above the root: ${k}.`}}}
function fkTonics(){const k=pickKey(),ds=D7(k),v=Math.random()<.55?5:7,c=ds[v-1],tg=allPc(pcOf(k),[0,1],0,12);
  return{type:'multi',key:`ft${k}${v}`,text:v===5?`${c.sym} is the V7 chord of its key. Click every note of the key’s tonic on the low E and A strings (frets 0–12).`:`${c.sym} is the viiø7 chord of its key. Click every note of the key’s tonic on the low E and A strings (frets 0–12).`,marks:[],targets:tg.map(p=>({...p,t:'I'})),notes:tg.map(p=>midi(p.s,p.f)),hint:v===5?'Name the tonic first: a perfect 5th below the root of V7.':'Name the tonic first: a half step above the root of viiø7.',explain:`${c.sym} is ${v===5?'V7':'viiø7'} of ${k} major, so the tonic is ${k}. On the low E and A strings it is at: ${tg.map(posTxt).join(', ')}.`}}
const fkBank=sbank('fb',[
 ['Which 7th chord quality appears only on the 5th degree of a major key?','The dominant 7th',['The major 7th','The minor 7th','The half-diminished 7th'],'Maj7 appears twice (I, IV), m7 three times (ii, iii, vi), m7♭5 once on vii, and the dominant 7th only on V.'],
 ['Why does a single Xmaj7 chord not tell you the key?','It could be I or IV, so two keys fit',['It only fits one key','It is always the tonic','It could be ii, iii or vi'],'Cmaj7 is I in C major and IV in G major.'],
 ['Why does a single Xm7 chord not tell you the key?','It could be ii, iii or vi, so three keys fit',['It could only be ii','It is always vi','It is always the tonic'],'Am7 is vi in C major, ii in G major and iii in F major.'],
 ['You see G7 in a progression. The tonic is probably…','C (a perfect 5th below G)',['D (a perfect 5th above G)','G itself','B♭'],'The dominant 7th resolves to the tonic a perfect 5th below (or a perfect 4th above) its root.'],
 ['The first chord of a song is not always the tonic. What is a more reliable clue?','Where the progression resolves, e.g. V7 → I',['The highest chord','The longest chord','Always the last chord played'],'Look for the chord that V7 resolves to, and the key that contains all the chords.'],
 ['You see Bm7♭5 in a progression. In which key is it the viiø7?','C major (a half step above B)',['A major','B major','G major'],'The 7th degree is a half step below the tonic: B → C.']]);

/* ---------- Lesson 44: relative minor scale & chord progressions ---------- */
const MINK=KEASY.map(relMinor),mByPc=pc=>MINK.find(m=>pcOf(m)===((pc%12)+12)%12);
const MRN=['i','ii','♭III','iv','v','♭VI','♭VII'],MLBL=['1','2','♭3','4','5','♭6','♭7'];
const mRoman=(d,q)=>MRN[d-1]+({m7:'7',m7b5:'ø7',maj7:'maj7',dom7:'7'})[q];
const MN7=mk=>diatonic(mk,'minor',4).map(c=>({...c,roman:mRoman(c.deg,c.q)}));
const MAJQ=['maj7','m7','m7','maj7','dom7','m7','m7b5'];
const minTxt=mk=>`${mk} natural minor: ${scaleNotes(mk,'minor').join(' ')}`;
const majOf=mk=>KEASY.find(k=>relMinor(k)===mk);
function rmName(){const k=pickKey(),mk=relMinor(k);
  if(Math.random()<.6){const pc=pcOf(k);return{type:'choice',noBoard:true,key:`rn${k}a`,text:`What is the relative minor of ${k} major?`,choices:mc(mk+' minor',[pc,pc+3,pc-2,pc-4].map(x=>mByPc(x)+' minor')),ans:mk+' minor',hint:'Count to the 6th degree of the major scale.',explain:`${scaleTxt(k)}. The 6th degree is ${mk}, so the relative minor is ${mk} minor: the same seven notes, starting on ${mk}.`}}
  const pc=pcOf(mk);return{type:'choice',noBoard:true,key:`rn${k}b`,text:`${mk} minor is the relative minor of which major key?`,choices:mc(k+' major',[pc,pc+9,pc+4,pc+2].map(x=>keyByPc(x)+' major')),ans:k+' major',hint:'Go up a minor 3rd (3 frets) from the minor root.',explain:`${mk} is the 6th degree of ${k} major (3 frets above ${mk}). ${scaleTxt(k)}.`}}
function rmFret(){for(let t=0;t<120;t++){const k=pickKey(),mk=relMinor(k),s=R(0,5),down=Math.random()<.5,rf=rootFret(down?k:mk,s,down?4:1);if(rf<0)continue;
  const tf=down?rf-3:rf+3;if(tf<1||tf>15||rf<1||rf>15)continue;
  return{type:'click',key:`rf${k}${s}${down?1:0}${rf}`,text:down?`${k} major: the root is marked on the ${SN[s]} string. Click the root of its relative minor on the same string, below the marked note.`:`${mk} minor: the root is marked on the ${SN[s]} string. Click the root of its relative major on the same string, above the marked note.`,marks:[{s,f:rf,t:down?'1':'1',k:'root'}],target:{s,f:tf,t:down?'6':'♭3'},notes:[midi(s,rf),midi(s,tf)],hint:down?'The relative minor is the 6th degree: how many frets below the tonic?':'The relative major root is a minor 3rd above the minor root.',explain:down?`${k} major → relative minor ${mk}: it is the 6th degree, a minor 3rd (3 frets) below. Fret ${rf} − 3 = fret ${tf}.`:`${mk} minor → relative major ${k}: a minor 3rd (3 frets) above. Fret ${rf} + 3 = fret ${tf}.`}}}
function rmRoots(){const k=pickKey(),mk=relMinor(k),tg=allPc(pcOf(mk),[0,1],0,12);
  return{type:'multi',key:`rr${k}`,text:`Click every note on the low E and A strings (frets 0–12) that is the root of ${k} major’s relative minor.`,marks:[],targets:tg.map(p=>({...p,t:'1'})),notes:tg.map(p=>midi(p.s,p.f)),hint:'Name the relative minor root first: the 6th degree of the major scale.',explain:`The relative minor of ${k} major is ${mk} minor. ${mk} on the low E and A strings: ${tg.map(posTxt).join(', ')}.`}}
function rmScale(){for(let t=0;t<200;t++){const k=pickKey(),mk=relMinor(k),s=R(0,5),r=rootFret(mk,s,1);if(r<1||r>3)continue;
  const tg=[];for(let f=r+1;f<=r+12;f++){const x=inKey(k,s,f);if(x)tg.push({s,f,t:f===r+12?'8':MLBL[(x.deg-6+7)%7]})}
  return{type:'multi',key:`rs${mk}${s}`,text:`${mk} natural minor (the relative minor of ${k} major): the root is marked on the ${SN[s]} string. Click every scale note up to the octave.`,marks:[{s,f:r,t:'1',k:'root'}],targets:tg,notes:[midi(s,r),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`Natural minor uses exactly the notes of ${k} major.`,explain:`${minTxt(mk)} = the notes of ${k} major from the 6th degree. On the ${SN[s]} string, from fret ${r}: ${[r,...tg.map(p=>p.f)].join(', ')} (W H W W H W W).`}}}
function rmChords(){const mk=pick(MINK),ms=MN7(mk),d=R(1,7),c=ms[d-1];
  if(Math.random()<.55){const pool=[...ms.filter((x,i)=>i!==d-1).map(x=>x.sym),c.root+'maj7',c.root+'7',c.root+'m7♭5',c.root+'m7'];
    return{type:'choice',noBoard:true,key:`rc${mk}${d}a`,text:`In ${mk} minor (natural minor), which 7th chord is built on the ${ord(d)} degree?`,choices:mc(c.sym,pool),ans:c.sym,hint:`Spell the natural minor scale, then stack thirds on degree ${d}. The chords are the same as in the relative major, in a different order.`,explain:`${minTxt(mk)}. Degree ${d} is ${c.root}: ${chTxt(c)} = ${c.roman}.`}}
  return{type:'choice',noBoard:true,key:`rc${mk}${d}b`,text:`In ${mk} minor (natural minor), what is the Roman numeral of ${c.sym}?`,choices:mc(c.roman,ms.filter((x,i)=>i!==d-1).map(x=>x.roman)),ans:c.roman,hint:`Which degree of ${mk} minor is ${c.root}? In minor the 3rd, 6th and 7th degree chords carry ♭.`,explain:`${minTxt(mk)}. ${c.root} is degree ${d}; ${chTxt(c)} is ${c.roman}. In natural minor the chords on degrees 3, 6 and 7 are written ♭III, ♭VI and ♭VII.`}}
const MPROGS=[[1,4,7,3],[1,7,6,7],[1,6,3,7],[1,4,5,1],[2,5,1],[1,7,6,5]];
function rmProg(){const mk=pick(MINK),pi=R(0,MPROGS.length-1),p=MPROGS[pi],ms=MN7(mk),rn=p.map(d=>ms[d-1].roman).join(DASH),ans=p.map(d=>ms[d-1].sym).join(DASH);
  const d1=p.map(d=>ms[d-1].root+MAJQ[d-1].replace('maj7','maj7').replace('m7b5','m7♭5').replace('dom7','7')).join(DASH),d2=p.map(d=>ms[d-1].root+'7').join(DASH),d3=p.map(d=>{const c=ms[d-1];return c.root+(c.q==='maj7'?'m7':c.q==='m7'?'maj7':'m7')}).join(DASH),d4=p.map(d=>ms[d%7].sym).join(DASH);
  return{type:'choice',noBoard:true,key:`rp${mk}${pi}`,text:`In ${mk} minor (natural minor), which chords make the progression ${rn}?`,choices:mc(ans,[d1,d2,d3,d4]),ans,hint:`Spell ${mk} natural minor, find each degree, then use the 7th-chord quality of that degree in minor.`,explain:`${minTxt(mk)}. ${p.map(d=>`${ms[d-1].roman} = ${chTxt(ms[d-1])}`).join('; ')}. Answer: ${ans}.`}}
function rmIdent(){for(let t=0;t<120;t++){const mk=pick(MINK),ms=MN7(mk),d=R(1,7),c=ms[d-1],r=anyVoicing(c);if(!r)continue;
  return{type:'choice',key:`ri${mk}${d}${r.ord.join('')}${r.v[0].s}`,text:`These four notes (root marked) are a 7th chord from ${mk} natural minor. Which chord is it, as a Roman numeral?`,marks:nameMarks(c,r),choices:mc(c.roman,ms.filter((x,i)=>i!==d-1).map(x=>x.roman)),ans:c.roman,notes:playOf(r.v),pm:'chord',hint:`Name the chord quality, then find the root as a degree of ${mk} minor.`,explain:`${chTxt(c)} is degree ${d} of ${mk} minor: ${c.roman}. ${minTxt(mk)}.`}}}
const rmBank=sbank('mb',[
 ['The relative minor of a major key starts on which degree of the major scale?','The 6th degree',['The 2nd degree','The 3rd degree','The 5th degree'],'C major: C D E F G A B. The 6th degree is A, so A minor is the relative minor.'],
 ['A major key and its relative minor share…','the same notes and key signature',['the same tonic','the same tonic chord','opposite key signatures'],'C major and A minor both have no sharps or flats. Only the home note differs.'],
 ['On the same string, how far below a major root is its relative minor root?','3 frets (a minor 3rd)',['2 frets','4 frets','5 frets'],'C to A is a minor 3rd down: 3 frets, e.g. fret 8 → fret 5 on the low E string.'],
 ['A song uses Am7, Dm7 and Em7 and keeps coming to rest on Am7. The key is…','A minor',['C major','D minor','E minor'],'These chords fit both C major (vi, ii, iii) and A minor (i, iv, v). The chord that feels like home decides: A minor.'],
 ['In A natural minor, what is Cmaj7?','♭IIImaj7',['Imaj7','IVmaj7','vi7'],'C is the 3rd degree of A minor, a minor third above the tonic: ♭IIImaj7.'],
 ['Natural minor is the same scale as…','Aeolian (the 6th mode of the major scale)',['Dorian','Mixolydian','the major scale starting on the same note'],'A Aeolian = A natural minor = C major starting on A.'],
 ['Which 7th chord is on the 5th degree of natural minor?','v7, a minor 7th (Em7 in A minor)',['V7, a dominant 7th','vø7, a half-diminished chord','Vmaj7'],'In natural minor the 5th-degree chord is minor 7th. The dominant 7th (E7) comes from the harmonic minor scale, covered later in the course.']]);

const LS={
 prog:{h:'seventh-chord-progressions',n:'Lesson 42',title:'Progressions with 7th chords',sub:'ii7–V7–Imaj7 and friends: Roman numerals and chords in every key.',
  ex:[['Numerals & chords',[pRoman,pSpell,pBank]],['Roots on the neck',[pRootClick]],['Voice leading & shapes',[pGuide,pIdent]]],
  test:[...rep(pRoman,2),...rep(pSpell,3),pBank,...rep(pRootClick,3),...rep(pGuide,3),...rep(pIdent,3)]},
 key:{h:'key-of-a-song-sevenths',n:'Lesson 43',title:'Find the key (7th chords)',sub:'Use dominant 7ths, ø7 and maj7 chords to name the key of a song.',
  ex:[['Clues & concepts',[fkClue,fkBank]],['Name the key',[fkProg]],['On the neck',[fkRoot,fkVoicing,fkTonics]]],
  test:[...rep(fkClue,3),...rep(fkProg,3),fkBank,...rep(fkRoot,3),...rep(fkVoicing,3),...rep(fkTonics,2)]},
 rel:{h:'relative-minor',n:'Lesson 44',title:'Relative minor & progressions',sub:'The 6th degree as a new home: scale, chords and progressions.',
  ex:[['Relative minor',[rmName,rmBank]],['On the neck',[rmFret,rmRoots,rmScale]],['Minor-key 7th chords',[rmChords,rmProg,rmIdent]]],
  test:[...rep(rmName,2),rmBank,...rep(rmFret,3),rmRoots,...rep(rmScale,2),...rep(rmChords,2),...rep(rmProg,2),...rep(rmIdent,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 42–44 mixed.',
  ex:[['Lesson 42',[pRoman,pSpell,pBank,pRootClick,pGuide,pIdent]],['Lesson 43',[fkClue,fkProg,fkBank,fkRoot,fkVoicing,fkTonics]],['Lesson 44',[rmName,rmBank,rmFret,rmRoots,rmScale,rmChords,rmProg,rmIdent]]],
  test:[pRoman,pSpell,pSpell,pRootClick,pGuide,pGuide,pIdent,fkClue,fkProg,fkProg,fkBank,fkRoot,fkVoicing,fkTonics,rmName,rmFret,rmScale,rmChords,rmProg,rmIdent]}};
const ORDER=['prog','key','rel','final'],STORE='gi-best-p11';

const cMaj=D7('C'),aMin=MN7('A');
const NOTES={
 prog:`<div class="cols"><div><h3>The 7th chords of C major</h3><table class="stack"><thead><tr><th>Numeral</th><th>Chord</th><th>Notes</th></tr></thead><tbody>${cMaj.map(c=>`<tr><td>${c.roman}</td><td>${c.sym}</td><td>${c.notes.join(' ')}</td></tr>`).join('')}</tbody></table>
  <p><b>ii7–V7–Imaj7</b> in C: ${progSym('C',[2,5,1])}<br><b>Imaj7–vi7–ii7–V7</b> in C: ${progSym('C',[1,6,2,5])}<br><b>iii7–vi7–ii7–V7</b> in C: ${progSym('C',[3,6,2,5])}</p></div>
  <div><h3>Key ideas</h3><ul><li>Write the numeral, then the chord quality: Imaj7, ii7, iii7, IVmaj7, V7, vi7, viiø7.</li><li>The numerals and qualities are the same in every major key; only the roots change.</li><li>V7 pulls to Imaj7: its 3rd rises to the root and its 7th falls to the 3rd.</li><li>In ii7–V7–Imaj7 the 7th of ii7 falls a half step to the 3rd of V7, which stays as the 7th of Imaj7; the 7th of V7 falls a half step to the 3rd of Imaj7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play ii7–V7–Imaj7 in C, F and B♭ with the same shapes, sliding to each new root.</li><li>Play only the 7ths and 3rds of the chords and watch the half-step moves.</li></ul></div></div>`,
 key:`<div class="cols"><div><h3>What a 7th chord tells you</h3><table class="stack"><thead><tr><th>Chord type</th><th>Degree</th><th>Keys it allows</th><th>Example</th></tr></thead><tbody>
  <tr><td>Dominant 7th (X7)</td><td>V7 only</td><td>1: a P5 below its root</td><td>G7 → C</td></tr>
  <tr><td>Half-diminished (Xm7♭5)</td><td>viiø7 only</td><td>1: a half step above its root</td><td>Bm7♭5 → C</td></tr>
  <tr><td>Major 7th (Xmaj7)</td><td>I or IV</td><td>2</td><td>Cmaj7 → C or G</td></tr>
  <tr><td>Minor 7th (Xm7)</td><td>ii, iii or vi</td><td>3</td><td>Am7 → G, F or C</td></tr></tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Start with the rare chords: one dominant 7th or one ø7 usually names the key.</li><li>Then check that every chord belongs to that key’s harmonized scale.</li><li>If only maj7 and m7 chords appear, compare the keys each chord allows: only one key fits them all.</li></ul><p class="small">Assumes a progression that stays diatonic to one major key (no borrowed chords or secondary dominants).</p>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play any dominant 7th and find its tonic with the P4-above shape (5 frets on the same string).</li><li>Play a ii7–V7 pair and name the Imaj7 it points to before you play it.</li></ul></div></div>`,
 rel:`<div class="cols"><div><h3>A minor and C major: same chords, new home</h3><table class="stack"><thead><tr><th>In A minor</th><th>Chord</th><th>In C major</th></tr></thead><tbody>${aMin.map((c,i)=>`<tr><td>${c.roman}</td><td>${c.sym}</td><td>${cMaj[i===0?5:(i+5)%7].roman}</td></tr>`).join('')}</tbody></table>
  <p class="small">Natural minor: ${minTxt('A')}. Relative minor = 6th degree of the major scale, 3 frets below its root.</p></div>
  <div><h3>Key ideas</h3><ul><li>Relative keys share a key signature and all seven notes.</li><li>The home chord decides major or minor: Cmaj7 → C major, Am7 → A minor.</li><li>Natural minor 7th chords: i7, iiø7, ♭IIImaj7, iv7, v7, ♭VImaj7, ♭VII7.</li><li>Minor progressions such as i7–iv7–♭VII7–♭IIImaj7 use the same chords as the relative major.</li></ul><p class="small">Assumes the natural minor scale. The raised 7th (V7 in minor) belongs to harmonic minor, later in the course.</p>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play a C major pattern, then move your focus 3 frets down to the minor root and play the same notes as A minor.</li><li>Play Am7–Dm7–G7–Cmaj7 and notice where it feels at rest.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 42–44: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 45 starts shell voicings: root, 3rd and 7th on three strings.</p></div></div>`};
