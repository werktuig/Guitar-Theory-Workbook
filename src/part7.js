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
/* ===== Part 7: lessons 25–28 (Diatonic triads & progressions) ===== */
const KP=KEASY.filter(k=>k!=='F♯');
const dk=k=>diatonic(k,'major',3),d7=k=>diatonic(k,'major',4);
const QN={maj:'major',min:'minor',dim:'diminished'};
const rnum=d=>diatonic('C','major',3)[d-1].roman.replace('°','');
const romTxt=r=>r.join(' – ');
const PR=[[1,4,5,1],[1,5,6,4],[2,5,1],[1,6,4,5],[1,4,6,5],[6,4,1,5],[1,4,1,5],[1,6,2,5]];
const FUNC=d=>[0,'tonic','subdominant (predominant)','tonic','subdominant (predominant)','dominant','tonic','dominant'][d];
const sc=k=>`${k} major: ${spellScale(k).join(' ')}`;
function shapeFor(root,q,sets=SETS3){for(let i=0;i<3000;i++){const set=pick(sets),sh=shapeOf(root,q,0,set,R(1,10));if(sh)return{set,sh}}return null}
const diaTxt=k=>dk(k).map(c=>c.sym).join(' ');

/* ---- theory ---- */
function gDiaQ(){const k=pick(KP),d=R(1,7),c=dk(k)[d-1],a=c.sym,pool=['maj','min','dim'].map(q=>trSym(c.root,q));
  return{type:'choice',noBoard:true,key:`dq${k}${d}`,text:`In ${k} major, which triad is built on the ${ord(d)} degree (${c.root})?`,choices:mc(a,pool.concat([trSym(c.root,'aug')])),ans:a,hint:`Spell ${k} major, then take every other note starting on ${c.root}.`,
   explain:`${sc(k)}. Stack 3rds on ${c.root}: ${c.notes.join(' ')} = ${c.sym} (${romanOf(d,c.q)}).`}}
function gDiaQual(){const d=R(1,7),q=dk('C')[d-1].q,a=QN[q];
  return{type:'choice',noBoard:true,key:'dl'+d,text:`In any major key, what type of triad is built on the ${ord(d)} degree?`,choices:['major','minor','diminished'],ans:a,hint:'Try it in C major: stack 3rds on that degree and measure.',
   explain:`The pattern is I major, ii minor, iii minor, IV major, V major, vi minor, vii° diminished. In C: ${diaTxt('C')}.`}}
function gDiaRoman(){const k=pick(KP),d=R(1,7),c=dk(k)[d-1],a=c.roman,pool=dk(k).map(x=>x.roman);
  return{type:'choice',noBoard:true,key:`dr${k}${d}`,text:`In ${k} major, which Roman numeral labels the chord ${c.sym}?`,choices:mc(a,pool),ans:a,hint:`Which degree of ${k} major is ${c.root}? Capitals = major, lower case = minor, ° = diminished.`,
   explain:`${c.root} is the ${ord(d)} degree of ${k} major and the triad is ${QN[c.q]}: ${a}.`}}
function gDiaNotes(){const k=pick(KP),d=R(1,7),c=dk(k)[d-1],a=fmtN(c.notes),fl=c.notes.some(x=>x.includes('♭')),pool=[];for(const i of [1,2])for(const dl of [1,-1]){const m=c.notes.slice();m[i]=pcName(pcOf(m[i])+dl,fl);pool.push(fmtN(m))}
  return{type:'choice',noBoard:true,key:`dn${k}${d}`,text:`Which notes make the ${c.roman} chord in ${k} major?`,choices:mc(a,pool),ans:a,hint:'Take the scale degrees d, d+2 and d+4.',explain:`${sc(k)}. The ${c.roman} chord is ${c.sym}: ${c.notes.join(' ')}.`}}
const fmtN=n=>n.join(' – ');
function gHarm7(){const k=pick(KP),d=R(1,7),c=d7(k)[d-1],a=c.sym,pool=['maj7','dom7','m7','m7b5'].map(q=>trSym(c.root,q));
  return{type:'choice',noBoard:true,key:`h7${k}${d}`,text:`In ${k} major, which seventh chord is built on the ${ord(d)} degree (${c.root})?`,choices:mc(a,pool),ans:a,hint:`Stack four notes of ${k} major: degrees d, d+2, d+4, d+6.`,
   explain:`${sc(k)}. On ${c.root}: ${c.notes.join(' ')} = ${c.sym} (${c.roman}).`}}
function gHarm7Roman(){const k=pick(KP),d=R(1,7),c=d7(k)[d-1],a=c.roman,pool=d7(k).map(x=>x.roman);
  return{type:'choice',noBoard:true,key:`hr${k}${d}`,text:`In ${k} major, which Roman numeral labels the seventh chord ${c.sym}?`,choices:mc(a,pool),ans:a,hint:`Find the degree of ${c.root}, then decide the quality.`,explain:`${c.root} is degree ${d} of ${k} major: ${c.sym} = ${a}.`}}
function gOdd(){const k=pick(KP),dd=dk(k),d=R(1,7),c=dd[d-1],q=pick(['maj','min','dim'].filter(x=>x!==c.q)),a=trSym(c.root,q),others=shuf(dd.filter((_,i)=>i!==d-1)).slice(0,3).map(x=>x.sym);
  return{type:'choice',noBoard:true,key:`od${k}${d}${q}`,text:`Which of these chords does NOT belong to ${k} major (triads from its scale)?`,choices:shuf([a,...others]),ans:a,hint:'Check each chord against the diatonic triads of the key.',
   explain:`${k} major triads: ${diaTxt(k)}. ${a} is not one of them: the diatonic chord on ${c.root} is ${c.sym}.`}}
function gFunc(){const d=R(1,7),k=pick(KP),c=dk(k)[d-1],a=FUNC(d);
  return{type:'choice',noBoard:true,key:`fu${k}${d}`,text:`In ${k} major, what is the function of the ${c.roman} chord (${c.sym})?`,choices:['tonic','subdominant (predominant)','dominant'],ans:a,hint:'Tonic: I iii vi. Subdominant: ii IV. Dominant: V vii°.',explain:`${c.roman} is a ${a} chord. Families: tonic I iii vi; subdominant ii IV; dominant V vii°.`}}
function gProgSpell(){const k=pick(KP),p=pick(PR),dd=dk(k),a=p.map(d=>dd[d-1].sym).join(' – '),pool=[];
  for(let i=0;i<p.length;i++){const c=dd[p[i]-1],q=pick(['maj','min'].filter(x=>x!==c.q));const m=p.map(d=>dd[d-1].sym);m[i]=trSym(c.root,q);pool.push(m.join(' – '))}
  const m=p.map(d=>dd[d-1].sym);m.reverse();pool.push(m.join(' – '));
  return{type:'choice',noBoard:true,key:`ps${k}${p.join('')}`,text:`In ${k} major, which chords play the progression ${romTxt(p.map(d=>dd[d-1].roman))}?`,choices:mc(a,pool),ans:a,hint:`List the triads of ${k} major first.`,explain:`${k} major: ${diaTxt(k)}. ${romTxt(p.map(d=>dd[d-1].roman))} = ${a}.`}}
function gProgRoman(){const k=pick(KP),p=pick(PR),dd=dk(k),a=romTxt(p.map(d=>dd[d-1].roman)),pool=[];
  for(let i=0;i<4;i++){const q=p.slice();const j=R(0,q.length-1);q[j]=((q[j]+R(1,5))%7)+1;pool.push(romTxt(q.map(d=>dd[d-1].roman)))}
  return{type:'choice',noBoard:true,key:`pr${k}${p.join('')}`,text:`In ${k} major the chords are ${p.map(d=>dd[d-1].sym).join(' – ')}. Which Roman numerals describe them?`,choices:mc(a,pool),ans:a,hint:`Find each chord root's degree in ${k} major.`,explain:`${k} major: ${diaTxt(k)}. So ${p.map(d=>dd[d-1].sym).join(' – ')} = ${a}.`}}
const BL=[1,1,1,1,4,4,1,1,5,4,1,5];
function gBlues(){const k=pick(KP),bar=R(1,12),d=BL[bar-1],sp=spellScale(k),ch=[1,4,5].map(x=>sp[x-1]+'7'),a=sp[d-1]+'7';
  return{type:'choice',noBoard:true,key:`bl${k}${bar}`,text:`In a standard 12-bar blues in ${k}, which chord is played in bar ${bar}? (Use dominant 7th chords.)`,choices:ch,ans:a,hint:'12-bar blues: I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7.',
   explain:`In ${k}: I7 = ${ch[0]}, IV7 = ${ch[1]}, V7 = ${ch[2]}. Bars 1–4 I7, 5–6 IV7, 7–8 I7, 9 V7, 10 IV7, 11 I7, 12 V7 (turnaround). Bar ${bar} is ${romanOf(d,'dom7')} = ${a}. (A quick-change variant plays IV7 in bar 2.)`}}
function gKeyFromChords(){for(let i=0;i<500;i++){const k=pick(KP),dd=dk(k),n=R(3,4),degs=shuf([1,2,3,4,5,6]).slice(0,n).sort((a,b)=>a-b),cs=degs.map(d=>dd[d-1].sym),
  fits=KEASY.filter(x=>cs.every(c=>dk(x).some(y=>y.sym===c)));if(fits.length!==1)continue;const near=KEASY.filter(x=>x!==k&&Math.abs(sigOf(x)-sigOf(k))<=2);
  return{type:'choice',noBoard:true,key:`kf${k}${degs.join('')}`,text:`A song uses the chords ${cs.join(', ')}. Which major key do they all belong to?`,choices:mc(k,near),ans:k,hint:'Spell the triads of a likely key, or collect the notes of the chords and compare them with key signatures.',
   explain:`${k} major: ${diaTxt(k)}. ${cs.join(', ')} are ${degs.map(d=>dd[d-1].roman).join(', ')}: all diatonic to ${k} and to no other major key.`}}
  return gKeyFromChords()}
function gKeyV7(){const k=pick(KP),v=spellScale(k)[4],near=KEASY.filter(x=>x!==k&&Math.abs(sigOf(x)-sigOf(k))<=3);
  return{type:'choice',noBoard:true,key:'kv'+k,text:`A progression has ${v}7 followed by ${k}. Which major key does the ${v}7 point to?`,choices:mc(k,near),ans:k,hint:'A dominant 7th chord resolves to the chord a perfect 5th below it.',
   explain:`${v}7 is the V7 of the key a perfect 5th below ${v}: ${k}. It resolves to ${k}, the I chord. ${sc(k)}.`}}
/* ---- fretboard ---- */
function gDiaFill(){for(let i=0;i<500;i++){const k=pick(KP),d=R(1,7),c=dk(k)[d-1];if(!c.notes.every(okN))continue;const o=shapeFor(c.root,c.q);if(!o)continue;const{set,sh}=o,rt=sh.find(p=>p.deg===0),rest=sh.filter(p=>p.deg!==0);
  return{type:'multi',key:`df${k}${d}${set.join('')}${sh.map(p=>p.f).join('-')}`,box:boxOfSh(sh),text:`In ${k} major the ${c.roman} chord is ${c.sym} (${c.notes.join(' ')}). Its root is marked on the ${strTxt(set)}. Click the other two chord tones on the ${strTxt(rest.map(p=>p.s))} inside the shaded frets.`,
   marks:[{s:rt.s,f:rt.f,t:'R',k:'root'}],targets:rest.map(p=>({s:p.s,f:p.f,t:p.t})),notes:mNotes(sh),hint:`${c.sym} = ${c.notes.join(' ')}. Find each note on its string inside the box.`,explain:`${c.roman} in ${k} = ${c.sym}: ${shTxt(sh)}.`}}
  return gDiaFill()}
function gDiaName(){for(let i=0;i<500;i++){const k=pick(KP),d=R(1,7),c=dk(k)[d-1];if(!c.notes.every(okN))continue;const o=shapeFor(c.root,c.q);if(!o)continue;const{sh}=o,a=QN[c.q]+' triad';
  return{type:'choice',key:`dm${k}${d}${sh.map(p=>p.f).join('-')}`,text:`The marked R is the ${ord(d)} degree of ${k} major (${c.root}), the root of a triad built from the key's notes. What type of triad is it?`,marks:sh.map(p=>p.deg===0?{s:p.s,f:p.f,t:'R',k:'root'}:{s:p.s,f:p.f,t:'?',k:'q'}),
   choices:mc(a,['major triad','minor triad','diminished triad']),ans:a,notes:mNotes(sh),hint:'Measure the 3rd and 5th above the root, or use the pattern of the major scale chords.',explain:`${c.roman} in ${k} is ${c.sym} (${c.notes.join(' ')}): a ${a}. ${shTxt(sh)}.`}}
  return gDiaName()}
function gDegRoot(){for(let i=0;i<500;i++){const k=pick(KP),s=R(0,5),f=rootFret(k,s,1),d=R(2,7);if(f<2||f>7)continue;const t=f+MAJ[d-1];if(t>15)continue;const c=dk(k)[d-1];
  return{type:'click',key:`dg${k}${s}${d}`,text:`The root of the I chord (${k}) is marked on the ${SN[s]} string. Click the root of the ${c.roman} chord (${c.sym}) on the same string, above the I root.`,marks:[{s,f,t:'I',k:'root'}],target:{s,f:t,t:rnum(d)},notes:[midi(s,f),midi(s,t)],
   hint:`Which degree of ${k} major is ${c.root}? Use the major scale steps up the string.`,explain:`${c.root} is degree ${d} of ${k} major, ${MAJ[d-1]} frets above the root: fret ${t}. ${c.sym} is the ${c.roman} chord.`}}
  return gDegRoot()}
function gHarmRoots(){for(let i=0;i<500;i++){const k=pick(KP),s=R(0,5),f=rootFret(k,s,1);if(f<2||f>4)continue;const dd=dk(k);
  return{type:'multi',key:`hm${k}${s}`,text:`The root of the I chord (${k}) is marked on the ${SN[s]} string. Click the roots of the other six chords of ${k} major (${diaTxt(k)}) up the string.`,marks:[{s,f,t:'I',k:'root'}],targets:[2,3,4,5,6,7].map(d=>({s,f:f+MAJ[d-1],t:rnum(d)})),notes:[2,3,4,5,6,7].map(d=>midi(s,f+MAJ[d-1])),
   hint:'The chord roots are the notes of the major scale: W W H W W W H.',explain:`${dd.map(c=>`${c.roman} ${c.sym}`).join(', ')}. Roots on the ${SN[s]} string: ${[1,2,3,4,5,6,7].map(d=>f+MAJ[d-1]).join(', ')}.`}}
  return gHarmRoots()}
function gProgRoots(){for(let i=0;i<500;i++){const k=pick(KP),s=R(0,5),f=rootFret(k,s,1),p=pick(PR.filter(x=>x.includes(1))),ds=[...new Set(p)].filter(x=>x!==1);if(f<2||f>7||ds.some(d=>f+MAJ[d-1]>15))continue;const dd=dk(k);
  return{type:'multi',key:`pq${k}${s}${p.join('')}`,text:`In ${k} major the progression is ${romTxt(p.map(d=>dd[d-1].roman))}. The I root is marked on the ${SN[s]} string. Click the roots of the other chords above it.`,marks:[{s,f,t:'I',k:'root'}],targets:ds.map(d=>({s,f:f+MAJ[d-1],t:rnum(d)})),notes:[f,...ds.map(d=>f+MAJ[d-1])].map(x=>midi(s,x)),
   hint:`Find each chord's root as a degree of ${k} major.`,explain:`${romTxt(p.map(d=>dd[d-1].roman))} = ${p.map(d=>dd[d-1].sym).join(' – ')}. Roots above the I root: ${ds.map(d=>`${dd[d-1].root} (fret ${f+MAJ[d-1]})`).join(', ')}.`}}
  return gProgRoots()}
function gKeyRoots(){for(let i=0;i<800;i++){const k=pick(KP),s=R(0,5),dd=dk(k),degs=shuf([1,2,3,4,5,6]).slice(0,R(3,4)),cs=degs.map(d=>dd[d-1]),fits=KEASY.filter(x=>cs.every(c=>dk(x).some(y=>y.sym===c.sym)));if(fits.length!==1)continue;
  const fs=cs.map(c=>rootFret(c.root,s,1));if(fs.some(f=>f<1||f>15)||new Set(fs).size<fs.length)continue;const near=KEASY.filter(x=>x!==k&&Math.abs(sigOf(x)-sigOf(k))<=2);
  return{type:'choice',key:`kr${k}${s}${degs.join('')}`,text:`The roots of these chords are marked on the ${SN[s]} string with their chord symbols. All the chords belong to one major key. Which key?`,marks:cs.map((c,j)=>({s,f:fs[j],t:c.sym,k:'q'})),choices:mc(k,near),ans:k,
   hint:'Read the chord symbols and find the one major key that contains all of them.',explain:`${k} major: ${diaTxt(k)}. ${cs.map(c=>c.sym).join(', ')} are ${cs.map(c=>c.roman).join(', ')} there, and no other major key has them all.`}}
  return gKeyRoots()}
function gResolve(){for(let i=0;i<500;i++){const k=pick(KP),s=R(0,5),dd=dk(k),v=dd[4],ii=dd[1],fv=rootFret(v.root,s,8),f2=rootFret(ii.root,s,1);if(fv<8||fv>15)continue;const t=fv-7;if(t===f2||f2>15)continue;
  return{type:'click',key:`rs${k}${s}`,text:`The roots of the ii chord (${ii.sym}) and the V chord (${v.sym}) of an unknown major key are marked on the ${SN[s]} string. Click the root of the key's I chord below the V root.`,marks:[{s,f:f2,t:ii.sym,k:'q'},{s,f:fv,t:v.sym,k:'q'}],target:{s,f:t,t:'I'},notes:[midi(s,f2),midi(s,fv),midi(s,t)],
   hint:'V resolves to I: the I root is a perfect 5th below V.',explain:`${v.sym} is V and ${ii.sym} is ii of ${k} major. A perfect 5th (7 frets) below the V root is the tonic ${k}: fret ${t}.`}}
  return gResolve()}
const bank=sbank;
const bank25=bank('b25',[
 ['What are diatonic triads?','Triads built on each note of a scale using only that scale\'s notes',['Triads that use only open strings','Triads with a ♭5','Chords that use every note of the chromatic scale'],'Stack 3rds on each degree, staying inside the scale.'],
 ['What is the quality pattern of triads in a major scale?','Major, minor, minor, major, major, minor, diminished',['Major, major, minor, major, minor, minor, diminished','Minor, major, major, minor, minor, major, diminished','Major, minor, major, minor, major, minor, diminished'],'I ii iii IV V vi vii°.'],
 ['Which triads in a major key are major?','I, IV and V',['ii, iii and vi','I, ii and V','IV, V and vii°'],'Capital numerals = major.'],
 ['Which triads in a major key are minor?','ii, iii and vi',['I, IV and V','ii, V and vii°','iii, IV and vi'],'Lower case = minor.'],
 ['Which degree carries the diminished triad in a major key?','The 7th (vii°)',['The 2nd','The 4th','The 5th'],'In C major: B D F.'],
 ['In C major, which triad is built on the 6th degree?','Am',['A','Em','F'],'A C E: minor, the relative minor chord.'],
 ['Which numerals use capital letters?','Major chords',['Minor chords','Diminished chords','Chords on odd degrees'],'I IV V are major; ii iii vi are minor; vii° is diminished.'],
 ['Why are there three kinds of triads in one major scale?','Different 3rds fit on different degrees, giving major, minor and diminished',['The scale changes key','Only the root changes','Chords must be altered to fit'],'Half steps fall between 3–4 and 7–8, so the stacked 3rds differ.'],
 ['In C major, which triad is built on the 3rd degree?','Em',['E','E°','G'],'E G B.']]);
const bank26=bank('b26',[
 ['What does it mean to harmonize the major scale?','Build a chord on every degree using only scale notes',['Play it in thirds only','Add a bass note','Change the key on each note'],'Seven degrees give seven chords.'],
 ['What is the pattern of seventh chords in a major key?','maj7, m7, m7, maj7, 7, m7, m7♭5',['maj7, maj7, 7, m7, m7, 7, m7♭5','7, m7, m7, maj7, maj7, m7, m7♭5','m7, maj7, 7, maj7, m7, m7♭5, 7'],'Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.'],
 ['Which seventh chord is built on the 5th degree of a major scale?','Dominant 7th',['Major 7th','Minor 7th','Half-diminished'],'In C major: G B D F = G7.'],
 ['Which seventh chord is built on the 7th degree of a major scale?','Half-diminished (m7♭5)',['Dominant 7th','Minor 7th','Major 7th'],'In C major: Bm7♭5.'],
 ['Which degrees carry major 7th chords?','I and IV',['I and V','ii and vi','V and vii'],'Cmaj7 and Fmaj7 in C.'],
 ['Which degrees carry minor 7th chords?','ii, iii and vi',['I, IV and V','ii and vii','iii, IV and vi'],'Dm7, Em7, Am7 in C.'],
 ['Which is the only dominant 7th chord in the harmonized major scale?','V7',['I7','IV7','ii7'],'Only the 5th degree stacks M3, m3, m3.'],
 ['In C major, which seventh chord is on the 2nd degree?','Dm7',['D7','Dmaj7','Dm7♭5'],'D F A C.'],
 ['How many notes does a seventh chord have?','4',['3','5','6'],'Root, 3rd, 5th and 7th.']]);
const bank27=bank('b27',[
 ['What is a chord progression?','A series of chords played one after another',['A single chord strummed','A scale on one string','Two notes at once'],'Progressions give music its harmonic movement.'],
 ['In a major key, which chord usually feels like "home"?','I',['IV','V','ii'],'The tonic chord.'],
 ['Which chord creates the strongest pull back to I?','V (or V7)',['ii','vi','IV'],'The dominant resolves to the tonic.'],
 ['Which chords are subdominant (predominant) chords?','ii and IV',['I and vi','V and vii°','iii and V'],'They lead towards the dominant.'],
 ['Which chords belong to the tonic family?','I, iii and vi',['ii, IV','V, vii°','I, V'],'They share notes with I.'],
 ['Which chords belong to the dominant family?','V and vii°',['I and vi','ii and IV','iii and vi'],'Both contain the leading tone.'],
 ['What is the first chord in a 12-bar blues?','I7',['IV7','V7','ii7'],'I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7.'],
 ['How many bars does a standard blues have?','12',['8','16','10'],'Three lines of four bars.'],
 ['In a 12-bar blues, bars 5 and 6 use…','IV7',['I7','V7','ii7'],'Bars 5–6 go to the IV chord.'],
 ['In ii – V – I, what does the V chord do?','Resolves to I',['Moves to ii','Changes key','Stays on V'],'ii (predominant) leads to V (dominant) which resolves to I.']]);
const bank28=bank('b28',[
 ['What is the first step to find the key of a chord progression?','List the chords and look for the one major key that contains them all',['Count the bars','Pick the first chord as the key','Play only the bass notes'],'The key is the scale whose diatonic chords match the chords used.'],
 ['A dominant 7th chord usually points to…','the chord a perfect 5th below it',['the chord a 4th below it','the chord a 2nd above it','no particular chord'],'V7 resolves to I.'],
 ['If a progression ends on a major chord that feels like home, that chord is probably…','the I chord',['the V chord','the ii chord','the vii° chord'],'Final chords often are the tonic, but verify with the other chords.'],
 ['A diminished triad in a progression often tells you…','it is the vii° chord of the key a half step above its root',['it is the I chord','it is the IV chord','the key is minor only'],'B° is vii° of C major.'],
 ['Am, F, C and G all belong to which major key?','C major',['F major','G major','A major'],'vi, IV, I, V in C.'],
 ['Why can a minor chord feel like home in a progression of major-key chords?','It may be the vi chord of the relative minor key',['It is a wrong note','It is the IV chord','Minor chords never occur in major keys'],'Am F C G could feel like A minor or C major; they share the same chords.'],
 ['The chords G, C and D belong to which major key?','G major',['C major','D major','F major'],'I, IV and V of G.'],
 ['Which tool helps quickly check chords against keys?','Spelling the diatonic triads of candidate keys',['Tuning the guitar','Using only open chords','Counting frets'],'Compare the chord symbols with I ii iii IV V vi vii° of each candidate.']]);
const dgT=[gDiaFill,gDiaName];
const LS={
 tri:{h:'diatonic-triads',n:'Lesson 25',title:'Diatonic major scale triads',sub:'Stack 3rds on each degree: I ii iii IV V vi vii°.',
  ex:[['Concepts',[bank25,gDiaQual,gDiaRoman]],['In a key',[gDiaQ,gDiaNotes]],['On the neck',[gDiaFill,gDiaName,gDegRoot]]],
  test:[...rep(bank25,2),...rep(gDiaQ,2),gDiaQual,gDiaRoman,gDiaNotes,...rep(gDiaFill,4),...rep(gDiaName,3),gDegRoot]},
 harm:{h:'harmonized-major-scale',n:'Lesson 26',title:'Harmonized major scale',sub:'A chord on every degree: triads and seventh chords.',
  ex:[['Concepts',[bank26,gOdd]],['Seventh chords',[gHarm7,gHarm7Roman]],['Chord roots',[gDegRoot,gHarmRoots]],['Shapes',[gDiaFill,gDiaName]]],
  test:[...rep(bank26,2),...rep(gHarm7,3),gHarm7Roman,gOdd,...rep(gDegRoot,3),...rep(gHarmRoots,2),...rep(gDiaFill,2),gDiaName]},
 prog:{h:'major-scale-chord-progressions',n:'Lesson 27',title:'Major scale chord progressions',sub:'Common progressions, chord functions and the 12-bar blues.',
  ex:[['Concepts',[bank27,gFunc,gBlues]],['Spell it',[gProgSpell,gProgRoman]],['On the neck',[gProgRoots,gDegRoot,gDiaFill]]],
  test:[bank27,...rep(gProgSpell,2),...rep(gProgRoman,2),gFunc,gBlues,...rep(gProgRoots,3),...rep(gDegRoot,2),...rep(gDiaFill,3)]},
 key:{h:'find-key-of-progression',n:'Lesson 28',title:'Find the key of a progression',sub:'Work out the key of a song from its chords.',
  ex:[['Concepts',[bank28,gKeyV7]],['From the chords',[gKeyFromChords,gOdd]],['On the neck',[gKeyRoots,gResolve]]],
  test:[...rep(bank28,2),...rep(gKeyFromChords,3),...rep(gKeyV7,2),...rep(gKeyRoots,4),...rep(gResolve,3),gDegRoot]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 25–28 mixed.',
  ex:[['Lessons 25–26',[bank25,bank26,gDiaQ,gDiaRoman,gDiaNotes,gHarm7,gOdd,gDiaFill,gDiaName,gDegRoot,gHarmRoots]],['Lessons 27–28',[bank27,bank28,gProgSpell,gProgRoman,gFunc,gBlues,gKeyFromChords,gKeyV7,gProgRoots,gKeyRoots,gResolve]]],
  test:[bank25,bank27,bank28,gDiaQ,gHarm7,gProgSpell,gFunc,gKeyFromChords,gKeyV7,gDiaFill,gDiaFill,gDiaName,gDegRoot,gHarmRoots,gProgRoots,gProgRoots,gKeyRoots,gKeyRoots,gResolve,gOdd]}};
const ORDER=['tri','harm','prog','key','final'],STORE='gi-best-p7';
const triRowD=k=>`<tr><td>${k}</td><td>${dk(k).map(c=>c.sym).join(' ')}</td></tr>`;
const NOTES={
 tri:`<div class="cols"><div><h3>Triads of C major</h3><table class="stack"><thead><tr><th>Degree</th><th>Chord</th><th>Notes</th></tr></thead><tbody>${dk('C').map(c=>`<tr><td>${c.roman}</td><td>${c.sym}</td><td>${c.notes.join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Stack 3rds on each degree, using only notes of the scale.</li><li>Quality pattern: major, minor, minor, major, major, minor, diminished.</li><li>Roman numerals: capitals for major, lower case for minor, ° for diminished.</li><li>The pattern is the same in every major key.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play ${diaTxt('G')} (G major) on the D, G and B strings.</li><li>Find vii° of C (B°) and say why it sounds unstable.</li></ul><p class="small">Key examples avoid F♯ major, whose vii° (E♯°) needs unusual spellings.</p></div></div>`,
 harm:`<div class="cols"><div><h3>Harmonized C major</h3><div class="scroll"><table><thead><tr><th>Degree</th><th>Triad</th><th>Seventh chord</th></tr></thead><tbody>${dk('C').map((c,i)=>`<tr><td>${c.roman} / ${d7('C')[i].roman}</td><td>${c.sym}</td><td>${d7('C')[i].sym}</td></tr>`).join('')}</tbody></table></div></div>
  <div><h3>Key ideas</h3><ul><li>Harmonizing a scale means building a chord on every degree.</li><li>Triads: I ii iii IV V vi vii°. Seventh chords: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.</li><li>The chord roots are the notes of the scale.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play the seven chord roots up the A string, naming each chord.</li><li>Play the triads of G major on the D, G and B strings in order.</li></ul><p class="small">Assumption: the lesson covers both triads and seventh chords; triads were introduced in lesson 25.</p></div></div>`,
 prog:`<div class="cols"><div><h3>Common progressions in C</h3><table class="stack"><thead><tr><th>Numerals</th><th>Chords</th></tr></thead><tbody>${PR.slice(0,6).map(p=>`<tr><td>${romTxt(p.map(d=>dk('C')[d-1].roman))}</td><td>${p.map(d=>dk('C')[d-1].sym).join(' ')}</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Tonic (I iii vi), subdominant (ii IV), dominant (V vii°).</li><li>The common motion: tonic → subdominant → dominant → tonic.</li><li>12-bar blues: I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play I – IV – V – I in G on the D, G and B strings.</li><li>Play a 12-bar blues in A using A7, D7 and E7.</li></ul></div></div>`,
 key:`<div class="cols"><div><h3>Finding the key</h3><table class="stack"><thead><tr><th>Clue</th><th>Means</th></tr></thead><tbody><tr><td>All chords fit one major scale</td><td>That is the key</td></tr><tr><td>X7 appears</td><td>Key a P5 below X</td></tr><tr><td>Diminished triad</td><td>vii° of the key a half step above</td></tr><tr><td>Ends on a stable chord</td><td>Probably I</td></tr></tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>List the chords, then test candidate keys against their diatonic triads.</li><li>V7 points to I, a perfect 5th below.</li><li>The same chords can sound like the major key or its relative minor (Am F C G: C major or A minor).</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Take a song you know, write its chords and find the key.</li></ul><p class="small">Assumption: progressions here are diatonic to a major key.</p></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 25–28: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 29 moves on to the next topic after major-key progressions.</p></div></div>`};
