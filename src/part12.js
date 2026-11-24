/* ===== Part 12: lessons 45–47 (shell voicings, harmonized scale with shells, drop 2&4) ===== */
const keyByPc=pc=>KEASY.find(k=>pcOf(k)===((pc%12)+12)%12);
const D7=k=>diatonic(k,'major',4);
const scaleTxt=k=>`${k} major: ${spellScale(k).join(' ')}`;
const chTxt=c=>`${c.sym} (${c.notes.join(' ')})`;
const noDbl=a=>!a.some(n=>/[𝄫𝄪]/.test(n));
const lt=l=>l==='R'?'root':/^\d$/.test(l)?l+(l==='3'?'rd':'th'):l;
const rootFor=q=>{for(let i=0;i<60;i++){const r=pickKey();if(noDbl(chordNotes(r,q)))return r}return'C'};
/* voicing whose pitch rises with the string number (lowest-fret solution, frets lo..hi) */
function vc(strings,pcs,lo=1,hi=15,span=4){let best=null;const cand=strings.map((s,i)=>{const o=[];for(let f=lo;f<=hi;f++)if(pcAt(s,f)===pcs[i])o.push(f);return o});
  const rec=(i,acc)=>{if(i===strings.length){const sp=Math.max(...acc)-Math.min(...acc);if(sp<=span-1){const sc=Math.max(...acc);if(!best||sc<best.sc)best={sc,v:acc.slice()}}return}
    for(const f of cand[i]){if(i>0&&midi(strings[i],f)<=midi(strings[i-1],acc[i-1]))continue;acc.push(f);rec(i+1,acc);acc.pop()}};
  rec(0,[]);return best?best.v.map((f,i)=>({s:strings[i],f})):null}
const strNames=set=>set.map(s=>SN[s]).join(', ');
const tabOf=v=>{const a=Array(6).fill('x');v.forEach(p=>a[p.s]=p.f);return a.join(' ')};
const boxOfV=v=>{const fs=v.map(p=>p.f);return[Math.max(0,Math.min(...fs)-1),Math.min(15,Math.max(...fs)+1)]};
const playOf=v=>v.map(p=>midi(p.s,p.f));

/* ---------- shell voicings ---------- */
const SHQ=['maj7','dom7','m7'];
const SHP=[{tones:[0,3,1],name:'R–7–3',sets:[[0,2,3],[1,3,4]]},{tones:[0,1,3],name:'R–3–7',sets:[[0,1,2],[1,2,3]]}];
const third=q=>['m7','m7b5','mMaj7'].includes(q)?'♭3':'3',seventh=q=>['maj7','mMaj7'].includes(q)?'7':'♭7';
const shLbl=(q,i)=>i===0?'R':i===1?third(q):seventh(q);
const shellNotes=(root,q)=>{const n=chordNotes(root,q);return[n[0],n[1],n[3]]};
/* shell of chord (root,q): shape sh, string set index; returns {v,labels,names} or null */
function shellOf(root,q,sh,set){const n=chordNotes(root,q),pcs=sh.tones.map(i=>pcOf(n[i])),v=vc(set,pcs);if(!v)return null;
  return{v,labels:sh.tones.map(i=>shLbl(q,i===3?2:i)),names:sh.tones.map(i=>n[i]),sh,set}}
function anyShell(root,q,shIdx){for(let t=0;t<40;t++){const sh=shIdx==null?pick(SHP):SHP[shIdx],r=shellOf(root,q,sh,pick(sh.sets));if(r)return r}return null}
const shMarks=(r,hide)=>r.v.map((p,i)=>({s:p.s,f:p.f,t:i===hide?'?':r.labels[i],k:i===0?'root':i===hide?'q':'q'}));
const shNameMarks=r=>r.v.map((p,i)=>({s:p.s,f:p.f,t:r.names[i],k:i===0?'root':'q'}));

/* ---------- Lesson 45: shell voicings ---------- */
function shNotes(){const q=pick(SHQ),root=rootFor(q),n=chordNotes(root,q),ans=shellNotes(root,q),alt3=q==='m7'?spellF(root,'3'):spellF(root,'b3'),alt7=q==='maj7'?spellF(root,'b7'):spellF(root,'7');
  const sets=[[n[0],n[2],n[3]],[n[0],n[1],n[2]],[n[0],alt3[2]?alt3[alt3.length-1]:'',n[3]],[n[0],n[1],alt7[alt7.length-1]]].filter(a=>noDbl(a)&&a.every(x=>x));
  const a=ans.join(' ');return{type:'choice',noBoard:true,key:`sn${root}${q}`,text:`Which notes make the shell voicing of ${chordSym(root,q)} (root, 3rd and 7th)?`,choices:mc(a,sets.map(x=>x.join(' '))),ans:a,hint:`Spell the full chord first, then keep only the root, 3rd and 7th.`,explain:`${chordSym(root,q)} = ${n.join(' ')}. Leave out the 5th (${n[2]}): the shell is ${ans.join(' ')}.`}}
const shBank=sbank('sb',[
 ['Which chord tones does a shell voicing keep?','Root, 3rd and 7th',['Root, 5th and 7th','Root, 3rd and 5th','3rd, 5th and 7th'],'A shell is the skeleton of a 7th chord: root, 3rd and 7th. The 5th is left out.'],
 ['Why can the 5th be left out of a 7th chord?','It does not decide the chord type, so it is the least needed note',['It is always out of tune','It is too high to reach','It would make the chord minor'],'The 3rd (major or minor) and the 7th (major or minor) define the sound. The 5th only adds fullness.'],
 ['Which two notes of a shell voicing are the guide tones?','The 3rd and the 7th',['The root and the 5th','The root and the 7th','The 3rd and the 5th'],'They carry the quality of the chord and move by half steps from chord to chord.'],
 ['How many notes does a shell voicing have?','3',['2','4','5'],'Root, 3rd and 7th.'],
 ['Which note of a shell voicing tells you whether the chord is major or minor?','The 3rd',['The root','The 7th','The 5th'],'A major 3rd means a major-type chord, a minor 3rd means a minor-type chord.'],
 ['Which shell has a major 3rd and a minor 7th?','The dominant 7th (R 3 ♭7)',['Major 7th (R 3 7)','Minor 7th (R ♭3 ♭7)','Minor-major 7th (R ♭3 7)'],'C7 = C E B♭.'],
 ['Cm7 and Cm7♭5 have the same shell voicing because…','both are R ♭3 ♭7 (C E♭ B♭): only the missing 5th differs',['both have a major 3rd','both have a major 7th','their roots are different'],'Without the 5th you cannot tell them apart from the shell alone; the context (the key) decides.'],
 ['In G7 → Cmaj7 shells, what happens to the 7th of G7 (F)?','It falls a half step to the 3rd of Cmaj7 (E)',['It rises a half step to F♯','It stays on F','It falls a whole step to D'],'The 7th of the dominant resolves down by a half step to the 3rd of the tonic chord.']]);
function shBuild(){for(let t=0;t<100;t++){const q=pick(SHQ),root=rootFor(q),r=anyShell(root,q);if(!r)continue;const sh=r.sh;
  const tg=r.v.slice(1).map((p,i)=>({...p,t:r.labels[i+1]}));
  return{type:'multi',key:`sb${root}${q}${sh.name}${r.v[0].s}`,box:boxOfV(r.v),text:`Build the shell voicing of ${chordSym(root,q)} as ${sh.name} on the ${strNames(r.set)} strings (lowest to highest). The root is marked: click the other two notes inside the shaded frets.`,marks:[{s:r.v[0].s,f:r.v[0].f,t:'R',k:'root'}],targets:tg,notes:playOf(r.v),pm:'chord',hint:`${chordSym(root,q)} = ${chordNotes(root,q).join(' ')}. In ${sh.name} the notes go up the strings in that order: find each one on its string.`,explain:`${chordSym(root,q)} shell (${r.names.join(' ')}), ${sh.name}: ${r.v.map((p,i)=>`${r.labels[i]} on the ${SN[p.s]} string at fret ${p.f}`).join(', ')}. Fret pattern ${tabOf(r.v)} (x = not played).`}}}
function shName(){for(let t=0;t<100;t++){const q=pick(SHQ),root=rootFor(q),r=anyShell(root,q);if(!r)continue;const opts=[['maj7','maj7'],['dom7','7'],['m7','m7'],['mMaj7','m(maj7)']].map(x=>root+x[1]),ans=root+CHORDS[q].sym;
  return{type:'choice',key:`sm${root}${q}${r.sh.name}${r.v[0].s}`,text:`This shell voicing has no 5th (root marked, ${r.sh.name} from low to high). Which chord is it?`,marks:shNameMarks(r),choices:mc(ans,opts),ans,notes:playOf(r.v),pm:'chord',hint:'Is the 3rd major or minor? Is the 7th major or minor? Measure each from the root.',explain:`${r.names.join(' ')} = root, ${lt(r.labels[1])}, ${lt(r.labels[2])}: ${ans}.${q==='m7'?' (The same three notes also fit a m7♭5 chord; here the ♭5 is not played.)':''}`}}}
function shDegree(){for(let t=0;t<100;t++){const q=pick(SHQ),root=rootFor(q),r=anyShell(root,q);if(!r)continue;const h=R(1,2),ans=r.labels[h],other=r.labels[3-h];
  return{type:'choice',key:`sd${root}${q}${r.sh.name}${h}${r.v[0].s}`,text:`In this shell voicing the root and the ${other} are labelled. What is the note marked ? (${root} is the root.)`,marks:shMarks(r,h),choices:mc(ans,['♭3','3','♭7','7']),ans,notes:playOf(r.v),pm:'chord',hint:`Count the semitones from the root up to the ? note (ignore octaves). A 3rd is 3 or 4 semitones, a 7th is 10 or 11.`,explain:`${r.names[h]} is ${[3,4].includes((pcOf(r.names[h])-pcOf(root)+12)%12)?(third(q)==='3'?'a major':'a minor')+' 3rd':(seventh(q)==='7'?'a major':'a minor')+' 7th'} above ${root}: ${(pcOf(r.names[h])-pcOf(root)+12)%12} semitones, so it is the ${lt(ans)}.`}}}
function shFind(){for(let t=0;t<100;t++){const q=pick(SHQ),root=rootFor(q),r=anyShell(root,q);if(!r)continue;const h=R(1,2),sh=r.sh,tp=r.v[h],other=r.v[3-h],ol=r.labels[3-h];
  return{type:'click',key:`sf${root}${q}${sh.name}${h}${r.v[0].s}`,box:boxOfV(r.v),text:`${chordSym(root,q)} shell, ${sh.name} on the ${strNames(r.set)} strings. The root and the ${lt(ol)} are marked. Click the missing ${lt(r.labels[h])} on the ${SN[tp.s]} string, inside the shaded frets.`,marks:[{s:r.v[0].s,f:r.v[0].f,t:'R',k:'root'},{s:other.s,f:other.f,t:ol,k:'q'}],target:{...tp,t:r.labels[h]},notes:playOf(r.v),pm:'chord',hint:`${chordSym(root,q)} = ${chordNotes(root,q).join(' ')}. Which of these is the ${lt(r.labels[h])}? Then find it on that string.`,explain:`The ${lt(r.labels[h])} of ${chordSym(root,q)} is ${r.names[h]}: on the ${SN[tp.s]} string at fret ${tp.f}. Full shell: ${tabOf(r.v)}.`}}}

/* ---------- Lesson 46: harmonized major scale with shells ---------- */
const shellOfC=c=>[c.notes[0],c.notes[1],c.notes[3]];
function hsNotes(){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1],ans=shellOfC(c),n=c.notes,nb=ds[d%7],
  sets=[[n[0],n[1],n[2]],[n[0],n[2],n[3]],shellOfC(nb),[n[0],n[1],spellF(c.root,c.q==='maj7'?'b7':'7').pop()]].filter(noDbl);
  const a=ans.join(' ');return{type:'choice',noBoard:true,key:`hn${k}${d}`,text:`In ${k} major, which notes make the shell voicing (root, 3rd, 7th) of the ${c.roman} chord?`,choices:mc(a,sets.map(x=>x.join(' '))),ans:a,hint:`Find degree ${d} of the scale, build its 7th chord, then drop the 5th.`,explain:`${scaleTxt(k)}. ${c.roman} = ${chTxt(c)}. Without the 5th (${n[2]}): ${a}.`}}
function hsRoman(){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1],a=c.roman;
  return{type:'choice',noBoard:true,key:`hr${k}${d}`,text:`In ${k} major, a shell voicing has the notes ${shellOfC(c).join(' ')} (root, 3rd, 7th). Which chord of the harmonized scale is it?`,choices:mc(a,ds.filter((x,i)=>i!==d-1).map(x=>x.roman)),ans:a,hint:`The first note is the root: which degree of ${k} major is it? Then check the quality.`,explain:`${shellOfC(c)[0]} is degree ${d} of ${k} major. ${chTxt(c)} = ${a}, so its shell is ${shellOfC(c).join(' ')}.${c.q==='m7b5'?' (A ø7 chord has the same shell shape as a m7 chord; the key tells them apart.)':''}`}}
const hsBank=sbank('hb',[
 ['Which chords of a major key share the shell shape R ♭3 ♭7?','ii7, iii7, vi7 and viiø7',['Imaj7 and IVmaj7','V7 only','Imaj7, V7 and viiø7'],'All four have a minor 3rd and a minor 7th. Without the 5th, m7 and m7♭5 look the same.'],
 ['Which chords of a major key have a major 3rd and a major 7th?','Imaj7 and IVmaj7',['ii7 and V7','V7 only','iii7 and vi7'],'Cmaj7 (C E B) and Fmaj7 (F A E) in C major.'],
 ['Which chord of the harmonized major scale has the shell R 3 ♭7?','V7',['Imaj7','ii7','viiø7'],'Only the dominant 7th has a major 3rd and a minor 7th.'],
 ['With shells and the root on the low E string, moving from the I chord to the ii chord moves the root…','up 2 frets',['up 1 fret','up 3 frets','down 2 frets'],'The 2nd degree is a major 2nd (2 frets) above the tonic on the same string.'],
 ['Moving the root from V up to the I chord (G to C on the same string) means moving…','up 5 frets',['up 7 frets','up 2 frets','up 4 frets'],'A perfect 4th higher (or a perfect 5th lower: 7 frets down).'],
 ['In ii7–V7–Imaj7 with shells, the 3rd of ii7 (F in C) becomes…','the 7th of V7 (the same note)',['the root of V7','the 3rd of V7','the 5th of V7'],'Dm7 shell D F C, G7 shell G B F, Cmaj7 shell C E B: F stays, C falls to B, B stays, F falls to E.']]);
function hsChain(){for(let t=0;t<120;t++){const k=pickKey(),s=R(0,1),r=rootFret(k,s,1);if(r<1)continue;const ds=D7(k),cand=shuf([2,3,4,5,6,7]).filter(d=>r+MAJ[d-1]<=15).slice(0,R(2,3));if(cand.length<2)continue;cand.sort((a,b)=>a-b);
  const tg=cand.map(d=>({s,f:r+MAJ[d-1],t:ds[d-1].roman.replace(/maj7|ø7|7/,'')}));
  return{type:'multi',key:`hc${k}${s}${cand.join('')}`,text:`${k} major: the root of ${ds[0].sym} (Imaj7) is marked on the ${SN[s]} string. On the same string, click the roots of ${cand.map(d=>ds[d-1].sym+' ('+ds[d-1].roman+')').join(', ')}, between the marked note and its octave.`,marks:[{s,f:r,t:'I',k:'root'}],targets:tg,notes:[midi(s,r),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`Each root is the scale degree measured from the tonic: 2nd = 2 frets, 3rd = 4, 4th = 5, 5th = 7, 6th = 9, 7th = 11.`,explain:`${scaleTxt(k)}. ${cand.map(d=>`${ds[d-1].root} (degree ${d}): fret ${r} + ${MAJ[d-1]} = ${r+MAJ[d-1]}`).join('; ')}.`}}
  return hsChain()}
function hsShell(){for(let t=0;t<120;t++){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1],r=anyShell(c.root,c.q);if(!r)continue;const sh=r.sh;
  return{type:'multi',key:`hs${k}${d}${sh.name}${r.v[0].s}`,box:boxOfV(r.v),text:`In ${k} major, the root of the ${c.roman} chord is marked. Build its shell voicing as ${sh.name} on the ${strNames(r.set)} strings: click the 3rd and the 7th inside the shaded frets.`,marks:[{s:r.v[0].s,f:r.v[0].f,t:'R',k:'root'}],targets:r.v.slice(1).map((p,i)=>({...p,t:r.labels[i+1]})),notes:playOf(r.v),pm:'chord',hint:`Spell the ${c.roman} chord from the ${k} major scale; keep only the root, 3rd and 7th.`,explain:`${scaleTxt(k)}. ${c.roman} = ${chTxt(c)}, shell ${r.names.join(' ')}. ${r.v.map((p,i)=>`${r.labels[i]} on the ${SN[p.s]} string at fret ${p.f}`).join(', ')}.`}}
  return hsShell()}
function hsClick(){for(let t=0;t<120;t++){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1],r=anyShell(c.root,c.q);if(!r)continue;const h=R(1,2),tp=r.v[h],o=r.v[3-h],ol=r.labels[3-h];
  return{type:'click',key:`hk${k}${d}${r.sh.name}${h}${r.v[0].s}`,box:boxOfV(r.v),text:`In ${k} major, this is a shell voicing of the ${c.roman} chord (${r.sh.name}, ${strNames(r.set)} strings). The root and the ${lt(ol)} are marked. Click the missing ${lt(r.labels[h])} on the ${SN[tp.s]} string, inside the shaded frets.`,marks:[{s:r.v[0].s,f:r.v[0].f,t:'R',k:'root'},{s:o.s,f:o.f,t:ol,k:'q'}],target:{...tp,t:r.labels[h]},notes:playOf(r.v),pm:'chord',hint:`${c.roman} in ${k} is built from the ${k} major scale. Name the chord, then its ${r.labels[h]}.`,explain:`${c.roman} = ${chTxt(c)}. The ${lt(r.labels[h])} is ${r.names[h]}: on the ${SN[tp.s]} string at fret ${tp.f}.`}}
  return hsClick()}
function hsName(){for(let t=0;t<120;t++){const k=pickKey(),ds=D7(k),d=R(1,7),c=ds[d-1],r=anyShell(c.root,c.q);if(!r)continue;
  return{type:'choice',key:`hm${k}${d}${r.sh.name}${r.v[0].s}`,text:`This shell voicing (root marked) is built on a degree of ${k} major. Which chord of the harmonized scale is it?`,marks:shNameMarks(r),choices:mc(c.roman,ds.filter((x,i)=>i!==d-1).map(x=>x.roman)),ans:c.roman,notes:playOf(r.v),pm:'chord',hint:`Name the root as a degree of ${k} major, then check the 3rd and 7th.`,explain:`${r.names.join(' ')}: root ${c.root} is degree ${d} of ${k} major, so the chord is ${c.roman} = ${chTxt(c)}.${c.q==='m7b5'?' Its shell looks like a m7 shell: in this key the 7th degree carries the ø7 chord.':''}`}}
  return hsName()}

/* ---------- Lesson 47: drop 2 & 4 ---------- */
const Q4=['maj7','dom7','m7','m7b5'],D24SETS=[[0,1,3,4],[1,2,4,5]];
const TL=q=>({maj7:['R','3','5','7'],dom7:['R','3','5','♭7'],m7:['R','♭3','5','♭7'],m7b5:['R','♭3','♭5','♭7']})[q];
const O24=[[0,2,1,3],[1,3,2,0],[2,0,3,1],[3,1,0,2]]; /* chord-tone index low to high, per inversion */
const ORD24=['R–5–3–7','3–7–5–R','5–R–7–3','7–3–R–5'];
function d24Of(root,q,inv,set){const n=chordNotes(root,q),o=O24[inv],pcs=o.map(i=>pcOf(n[i]));let v=vc(set,pcs,1,15,4);if(!v)v=vc(set,pcs,1,15,5);if(!v)return null;
  return{v,o,names:o.map(i=>n[i]),labels:o.map(i=>TL(q)[i]),set,inv}}
function anyD24(root,q,inv){for(let t=0;t<20;t++){const r=d24Of(root,q,inv==null?R(0,3):inv,pick(D24SETS));if(r)return r}return null}
const d24Names=r=>r.v.map((p,i)=>({s:p.s,f:p.f,t:r.names[i],k:'q'}));
function d24Order(){const q=pick(Q4),k=rootFor(q),inv=R(0,3),n=chordNotes(k,q),close=[0,1,2,3].map(i=>n[(i+inv)%4]),c=close,
  ans=[c[0],c[2],c[1],c[3]].join(' '),dis=[[c[2],c[0],c[1],c[3]],[c[1],c[0],c[2],c[3]],[c[1],c[2],c[0],c[3]],[c[0],c[1],c[2],c[3]]].map(a=>a.join(' '));
  return{type:'choice',noBoard:true,key:`do${k}${q}${inv}`,text:`Close-position ${chordSym(k,q)}, ${INV[inv]}: ${c.join(' ')} (low to high). Drop the 2nd-highest and the 4th-highest notes by an octave. What is the new order, from lowest to highest?`,choices:mc(ans,dis),ans,hint:'Count from the top: the highest note is 1st, the next is 2nd. Both dropped notes end up below the others, in their original order.',explain:`Close: ${c.join(' ')}. From the top: ${c[3]} (1st), ${c[2]} (2nd), ${c[1]} (3rd), ${c[0]} (4th). Drop ${c[2]} and ${c[0]} an octave: ${c[0]} and ${c[2]} now sit below ${c[1]} and ${c[3]}. Result: ${ans}.`}}
function d24Formula(){const inv=R(0,3),ans=ORD24[inv],pool=[...ORD24.filter((x,i)=>i!==inv),'5–R–3–7'];
  return{type:'choice',noBoard:true,key:`df${inv}`,text:`In which order do the chord tones of a ${INV[inv]} drop 2&4 voicing sound, from lowest to highest? (Root position has the root in the bass, 1st inversion the 3rd, and so on.)`,choices:mc(ans,pool),ans,hint:`Start with the bass tone for a ${INV[inv]} chord. The close voicing above it is 3 notes stacked in 3rds; then drop the 2nd and 4th highest.`,explain:`${INV[inv]}: ${ans}. Always the bass tone first, then the dropped 2nd-highest note, then the remaining two. Root position R–5–3–7, 1st inversion 3–7–5–R, 2nd inversion 5–R–7–3, 3rd inversion 7–3–R–5.`}}
const d24Bank=sbank('db',[
 ['In a drop 2&4 voicing, which notes of the close-position chord drop by an octave?','The 2nd-highest and the 4th-highest',['Only the 2nd-highest','The 3rd-highest','The highest and the lowest'],'Drop 2 lowers the 2nd-highest note; drop 2&4 lowers the 4th-highest as well.'],
 ['How many notes does a drop 2&4 voicing of a 7th chord have?','4 (the same four chord tones)',['3','5','6'],'Dropping notes by an octave rearranges the chord tones; it does not add or remove any.'],
 ['Which string set is typical for a drop 2&4 voicing on guitar?','Four strings with one string skipped (E A G B)',['Four adjacent strings','Only the three highest strings','Two strings played together'],'The skipped string sits between the 2nd and 3rd notes (low to high), so the voicing stays within reach of one hand.'],
 ['How wide is a drop 2&4 voicing compared with a close-position 7th chord?','Almost two octaves, much wider',['The same width','Narrower','Only a perfect 5th'],'Cmaj7 close position spans less than an octave; as drop 2&4 (C G E B) it spans nearly two octaves.'],
 ['What is the bass note of a root position drop 2&4 voicing?','The root',['The 3rd','The 5th','The 7th'],'The 4th-highest note of the close voicing is the root; it is dropped and becomes the bass.'],
 ['What is the difference between drop 2 and drop 2&4?','Drop 2&4 also lowers the 4th-highest note',['Drop 2&4 raises one note','Drop 2&4 omits the 5th','There is no difference'],'Drop 2 moves only the 2nd-highest note down an octave.']]);
function d24Build(){for(let t=0;t<100;t++){const q=pick(Q4),root=rootFor(q),inv=R(0,3),r=anyD24(root,q,inv);if(!r)continue;
  return{type:'multi',key:`db${root}${q}${inv}${r.v[0].s}`,box:boxOfV(r.v),text:`Build ${chordSym(root,q)} as a ${INV[inv]} drop 2&4 voicing on the ${strNames(r.set)} strings (low to high: ${ORD24[inv]}). The bass note is marked: click the other three chord tones inside the shaded frets.`,marks:[{s:r.v[0].s,f:r.v[0].f,t:r.labels[0],k:r.o[0]===0?'root':'q'}],targets:r.v.slice(1).map((p,i)=>({...p,t:r.labels[i+1]})),notes:playOf(r.v),pm:'chord',hint:`${chordSym(root,q)} = ${chordNotes(root,q).join(' ')}. Follow the order ${ORD24[inv]} up the strings.`,explain:`${chordSym(root,q)} = ${chordNotes(root,q).join(' ')}; ${INV[inv]} drop 2&4 is ${ORD24[inv]} = ${r.names.join(' ')}: ${r.v.map((p,i)=>`${r.names[i]} on the ${SN[p.s]} string (fret ${p.f})`).join(', ')}. Frets: ${tabOf(r.v)}.`}}
  return d24Build()}
function d24Click(){for(let t=0;t<100;t++){const q=pick(Q4),root=rootFor(q),inv=R(0,3),r=anyD24(root,q,inv);if(!r)continue;const h=R(1,3),tp=r.v[h];
  return{type:'click',key:`dk${root}${q}${inv}${h}${r.v[0].s}`,box:boxOfV(r.v),text:`${chordSym(root,q)}, ${INV[inv]} drop 2&4 on the ${strNames(r.set)} strings (low to high: ${ORD24[inv]}). Three notes are marked: click the missing ${lt(r.labels[h])} on the ${SN[tp.s]} string, inside the shaded frets.`,marks:r.v.map((p,i)=>i===h?null:{s:p.s,f:p.f,t:r.labels[i],k:r.o[i]===0?'root':'q'}).filter(Boolean),target:{...tp,t:r.labels[h]},notes:playOf(r.v),pm:'chord',hint:`${chordSym(root,q)} = ${chordNotes(root,q).join(' ')}. Which of these notes is the ${lt(r.labels[h])}?`,explain:`The ${lt(r.labels[h])} of ${chordSym(root,q)} is ${r.names[h]}: on the ${SN[tp.s]} string at fret ${tp.f}. Full voicing ${tabOf(r.v)}.`}}
  return d24Click()}
function d24Name(){for(let t=0;t<100;t++){const q=pick(Q4),root=rootFor(q),r=anyD24(root,q);if(!r)continue;const ans=chordSym(root,q);
  return{type:'choice',key:`dn${root}${q}${r.inv}${r.v[0].s}`,text:'These four notes are a drop 2&4 voicing of a 7th chord. Which chord is it?',marks:d24Names(r),choices:mc(ans,Q4.map(x=>chordSym(root,x))),ans,notes:playOf(r.v),pm:'chord',hint:'Rearrange the four notes into stacked 3rds to find the root, then check the 3rd, 5th and 7th.',explain:`${r.names.join(' ')} rearranged in thirds: ${chordNotes(root,q).join(' ')} = ${ans}.`}}
  return d24Name()}
function d24Inv(){for(let t=0;t<100;t++){const q=pick(Q4),root=rootFor(q),inv=R(0,3),r=anyD24(root,q,inv);if(!r)continue;
  return{type:'choice',key:`di${root}${q}${inv}${r.v[0].s}`,text:`These notes are a drop 2&4 voicing of ${chordSym(root,q)}. Which inversion is it? (Judge by the lowest note.)`,marks:d24Names(r),choices:INV.slice(),ans:INV[inv],notes:playOf(r.v),pm:'chord',hint:`${chordSym(root,q)} = ${chordNotes(root,q).join(' ')}. Which chord tone is in the bass?`,explain:`The lowest note is ${r.names[0]}, the ${lt(r.labels[0])} of ${chordSym(root,q)}: ${INV[inv]} (${ORD24[inv]}).`}}
  return d24Inv()}

const LS={
 shell:{h:'shell-voicings',n:'Lesson 45',title:'Shell voicings',sub:'Root, 3rd and 7th on three strings: the skeleton of a 7th chord.',
  ex:[['Concepts & spelling',[shNotes,shBank]],['Build the shell',[shBuild,shFind]],['Read the shell',[shName,shDegree]]],
  test:[...rep(shNotes,2),shBank,...rep(shBuild,4),...rep(shName,3),...rep(shDegree,3),...rep(shFind,2)]},
 harm:{h:'harmonized-scale-shells',n:'Lesson 46',title:'Harmonized scale with shells',sub:'The seven 7th chords of a major key as root–3rd–7th shells.',
  ex:[['Spell the shells',[hsNotes,hsRoman,hsBank]],['Roots on the neck',[hsChain]],['Build & read shells',[hsShell,hsClick,hsName]]],
  test:[...rep(hsNotes,2),...rep(hsRoman,2),hsBank,...rep(hsChain,3),...rep(hsShell,3),...rep(hsClick,2),...rep(hsName,2)]},
 d24:{h:'drop-2-and-4',n:'Lesson 47',title:'Drop 2 & 4 chords',sub:'Lower the 2nd- and 4th-highest notes of a close voicing by an octave.',
  ex:[['Concepts & order',[d24Order,d24Formula,d24Bank]],['Build the voicing',[d24Build,d24Click]],['Read the voicing',[d24Name,d24Inv]]],
  test:[...rep(d24Order,2),...rep(d24Formula,2),d24Bank,...rep(d24Build,3),...rep(d24Click,2),...rep(d24Name,3),...rep(d24Inv,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 45–47 mixed.',
  ex:[['Lesson 45',[shNotes,shBank,shBuild,shFind,shName,shDegree]],['Lesson 46',[hsNotes,hsRoman,hsBank,hsChain,hsShell,hsClick,hsName]],['Lesson 47',[d24Order,d24Formula,d24Bank,d24Build,d24Click,d24Name,d24Inv]]],
  test:[shNotes,shBank,shBuild,shBuild,shName,shDegree,shFind,hsNotes,hsRoman,hsChain,hsChain,hsShell,hsShell,hsName,d24Order,d24Formula,d24Build,d24Click,d24Name,d24Inv]}};
const ORDER=['shell','harm','d24','final'],STORE='gi-best-p12';

const cShell=(q,sh)=>{const r=shellOf('C',q,sh,sh.sets[0]);return r?tabOf(r.v):'—'};
const NOTES={
 shell:`<div class="cols"><div><h3>Shell voicings of C chords</h3><table class="stack"><thead><tr><th>Chord</th><th>Shell</th><th>R–7–3</th><th>R–3–7</th></tr></thead><tbody>${SHQ.map(q=>`<tr><td>${chordSym('C',q)}</td><td>${shellNotes('C',q).join(' ')}</td><td>${cShell(q,SHP[0])}</td><td>${cShell(q,SHP[1])}</td></tr>`).join('')}</tbody></table>
  <p class="small">Frets from the low E string up (x = not played): R–7–3 uses the E, D and G strings with the A string skipped; R–3–7 uses the E, A and D strings. Shells with the root on the A string are the same shapes, one string set higher. Cm7♭5 has the same shell as Cm7 (C E♭ B♭).</p></div>
  <div><h3>Key ideas</h3><ul><li>Shell = root + 3rd + 7th. The 5th is left out because it does not decide the chord type.</li><li>The 3rd and the 7th are the guide tones: major or minor 3rd, major or minor 7th.</li><li>Two shapes: R–7–3 (skips a string) and R–3–7 (three adjacent strings).</li><li>Shells leave space for the melody, the bass line or a second guitarist.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7, C7 and Cm7 shells on the low E string, changing only the 3rd and 7th.</li><li>Slide the R–7–3 shape up 2 frets at a time and name each chord.</li></ul></div></div>`,
 harm:`<div class="cols"><div><h3>Shells of the C major scale</h3><table class="stack"><thead><tr><th>Numeral</th><th>Chord</th><th>Shell (R 3 7)</th></tr></thead><tbody>${D7('C').map(c=>`<tr><td>${c.roman}</td><td>${c.sym}</td><td>${shellOfC(c).join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Take each 7th chord of the key and keep root, 3rd and 7th.</li><li>Only three shell types occur: major 7th (I, IV), dominant 7th (V) and minor 7th (ii, iii, vi, and vii looks the same).</li><li>With the root on one string, the roots follow the scale: 2, 2, 1, 2, 2, 2 frets between degrees.</li><li>The viiø7 shell is R ♭3 ♭7, identical to a m7 shell; the key tells you which it is.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the C major shells in order on one string set, moving the shape up the neck.</li><li>Play ii–V–I in three keys with shells and watch the guide tones move by half steps.</li></ul></div></div>`,
 d24:`<div class="cols"><div><h3>Drop 2&4: order of the chord tones</h3><table class="stack"><thead><tr><th>Inversion</th><th>Low to high</th><th>Cmaj7</th></tr></thead><tbody>${[0,1,2,3].map(i=>`<tr><td>${cap(INV[i])}</td><td>${ORD24[i]}</td><td>${O24[i].map(j=>chordNotes('C','maj7')[j]).join(' ')}</td></tr>`).join('')}</tbody></table>
  <p class="small">Played on four strings with one skipped (E A G B, or A D B e). Inversions are named by the lowest note. A root-position voicing can need a 5-fret stretch.</p></div>
  <div><h3>Key ideas</h3><ul><li>Start from a close-position 7th chord. Lower the 2nd-highest and the 4th-highest notes by an octave.</li><li>The same four notes are spread over almost two octaves.</li><li>The bass is the lowest note of the close voicing, so the inversion name stays the same.</li><li>Compare: drop 2 lowers only the 2nd-highest note.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7 in all four inversions of drop 2&4 on the E A G B strings.</li><li>Do the same with Dm7 and G7 and connect them as ii–V–I.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 45–47: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 48 starts the chord-by-chord look at the major scale: all the chords that can function as the I chord.</p></div></div>`};
