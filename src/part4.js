/* ===== Part 4: lessons 12–15 ===== */
const keyByPc=pc=>KEASY.find(k=>pcOf(k)===pc);
const scaleTxt=k=>`${k} major: ${spellScale(k).join(' ')} ${k}`;
const nameK=(k,s,f)=>(inKey(k,s,f)||{name:note(s,f)}).name;
const whereK=(k,s,f)=>`${nameK(k,s,f)} on the ${SN[s]} string, ${fretTxt(f)}`;
const sigShort=n=>n===0?'none':n>0?`${n} sharp${n>1?'s':''}`:`${-n} flat${n<-1?'s':''}`;
const ALLK=KS.map(k=>k[0]);
const keyBySig=n=>KS.find(k=>k[1]===n)[0];
const degLbl=d=>d===1?'1st (root)':ord(d);
/* a root position plus nearby key notes */
function anchor(){for(let k=0;k<80;k++){const key=pick(KEASY),s=R(0,5),f=rootFret(key,s,R(1,9));if(f>=1&&f<=12)return{key,s,f}}return{key:'G',s:0,f:3}}

/* ---------- Lesson 12: fretboard insight ---------- */
function fDegName(){for(let k=0;k<120;k++){const{key,s,f}=anchor(),s2=R(0,5),t=f+R(-4,4);if(t<0||t>15||(s2===s&&t===f))continue;const x=inKey(key,s2,t);if(!x||x.deg===1)continue;const a=degLbl(x.deg);
  return{type:'choice',key:`fd${s2}${x.deg}`,text:`In ${key} major (root marked), which scale degree is the ?`,marks:[{s,f,t:'R',k:'root'},{s:s2,f:t,t:'?',k:'q'}],choices:mc(a,[2,3,4,5,6,7].map(degLbl)),ans:a,notes:[midi(s,f),midi(s2,t)],hint:'Measure the interval from the root using shapes, then turn it into a degree.',explain:`The ? is ${x.name}, ${Math.abs(midi(s2,t)-midi(s,f))} semitones ${midi(s2,t)>midi(s,f)?'above':'below'} this root. Degree ${x.deg} of ${key} major is a ${nm(MAJ[x.deg-1])} above the root in any octave${midi(s2,t)<midi(s,f)?`, so below the root it shows up as a ${nm(12-MAJ[x.deg-1])} down`:''}.`}}}
function fFind(){for(let k=0;k<120;k++){const{key,s,f}=anchor(),d=R(2,7),s2=R(0,5),c=keyPositions(key,[s2],Math.max(0,f-4),Math.min(15,f+4)).filter(p=>p.deg===d);if(c.length!==1)continue;
  return{type:'click',key:`ff${s2}${d}`,text:`The ${key} major root is marked. Click the ${ord(d)} degree (${c[0].name}) on the ${SN[s2]} string, within 4 frets of the root.`,marks:[{s,f,t:'R',k:'root'}],target:{...c[0],t:String(d)},notes:[midi(s,f),midi(c[0].s,c[0].f)],hint:`Degree ${d} is a ${nm(MAJ[d-1])} above the root (or a ${nm(12-MAJ[d-1])} below it).`,explain:`${scaleTxt(key)}. Degree ${d} is ${c[0].name}: on the ${SN[s2]} string near the root that is fret ${c[0].f}.`}}}
function fRoots(){const key=pick(KEASY),a=R(0,4),st=[a,a+1],tg=allPc(pcOf(key),st);
  return{type:'multi',key:`fr${key}${a}`,text:`Click every ${key} on the ${SN[a]} and ${SN[a+1]} strings (frets 0–15). These are anchor points for any ${key} major pattern.`,marks:[],targets:tg.map(p=>({...p,t:'R'})),notes:tg.map(p=>midi(p.s,p.f)),hint:'Find one, then use 12 frets, the unison shape (5 frets, 4 across G–B) or octave shapes.',explain:`${key}: ${tg.map(posTxt).join(', ')}.`}}
function fDegAll(){const{key,s,f}=anchor(),d=pick([3,5,7,4,6,2]),lo=Math.max(0,f-3),hi=Math.min(15,f+3),tg=keyPositions(key,[0,1,2,3,4,5],lo,hi).filter(p=>p.deg===d);if(!tg.length)return fDegAll();
  return{type:'multi',key:`fa${d}${lo}`,box:[lo,hi],text:`In ${key} major, click every ${ord(d)} degree (${spellScale(key)[d-1]}) inside the shaded frets ${lo}–${hi}.`,marks:[{s,f,t:'R',k:'root'}],targets:tg.map(p=>({...p,t:String(d)})),notes:tg.map(p=>midi(p.s,p.f)),hint:`Degree ${d} is the ${nm(MAJ[d-1])} shape from each root.`,explain:`${spellScale(key)[d-1]} in frets ${lo}–${hi}: ${tg.map(posTxt).join(', ')}.`}}

/* ---------- Lesson 13: major scale keys ---------- */
const kBank=sbank('kb',[
 ['What is a key?','A set of notes (a scale) built around a home note',['A single chord','A tuning','Any song in 4/4'],'A song in G major uses the notes of the G major scale and feels “at home” on G.'],
 ['A key signature tells you…','which notes are sharp or flat throughout the piece',['how fast to play','which chords to use','the time signature'],'Instead of writing ♯ or ♭ on every note, they are listed once at the start.'],
 ['How many major key signatures are there, counting every spelling?','15',['12','7','24'],'C, 7 sharp keys and 7 flat keys = 15. Three pairs sound the same: B/C♭, F♯/G♭, C♯/D♭, so you hear 12 different keys.'],
 ['F♯ major and G♭ major…','sound the same but are spelled differently',['are different pitches','both have 6 sharps','both have 6 flats'],'They are enharmonic keys: F♯ has 6 sharps, G♭ has 6 flats.'],
 ['A major key never contains…','both sharps and flats',['more than 3 sharps','the note C','a half step'],'Each major key uses only sharps or only flats (or neither, for C).'],
 ['Which key has no sharps or flats?','C major',['G major','F major','A major'],'C D E F G A B.'],
 ['On guitar, changing key with a movable pattern means…','moving the root to a new fret',['learning new fingerings','retuning','changing strings'],'The shape stays; the root note sets the key.']]);
function kCount(){const[k,n]=pick(KS),a=sigShort(n);
  return{type:'choice',noBoard:true,key:'kc'+k,text:`How many sharps or flats does ${k} major have?`,choices:mc(a,[sigShort(n+1),sigShort(n-1),sigShort(-n||2),sigShort(n+2),sigShort(n-2)].filter(x=>!/^(8|9|-)/.test(x))),ans:a,hint:'Sharp keys: G D A E B F♯ C♯ (1–7). Flat keys: F B♭ E♭ A♭ D♭ G♭ C♭ (1–7).',explain:`${k} major has ${sigTxt(n)}. ${scaleTxt(k)}.`}}
function kNotIn(){const k=pick(KEASY),sc=spellScale(k),pcs=sc.map(pcOf),out=pick([0,1,2,3,4,5,6,7,8,9,10,11].filter(p=>!pcs.includes(p)));
  const odd=(sigOf(k)<0?['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B']:NN)[out];
  return{type:'choice',noBoard:true,key:`kn${k}`,text:`Which of these notes is NOT in the key of ${k} major?`,choices:shuf([odd,...shuf(sc.slice(1)).slice(0,3)]),ans:odd,hint:'Spell the scale, or start from the key signature.',explain:`${scaleTxt(k)}. ${odd} is not in it.`}}
function kWhichKey(){const k=pick(KEASY),sc=spellScale(k),n=pick(sc.slice(1).filter(x=>x.length>1).concat(sc.slice(1,3)));
  const others=shuf(KEASY.filter(x=>!spellScale(x).includes(n))).slice(0,3);
  return{type:'choice',noBoard:true,key:`kw${n}`,text:`Which of these keys contains the note ${n}?`,choices:shuf([k,...others]),ans:k,hint:'Check each key signature for that note.',explain:`${scaleTxt(k)}. None of the other keys has ${n}.`}}

/* ---------- Lesson 14: construction, sharps & flats ---------- */
function kOrder(){const sh=Math.random()<.5,n=R(1,7),L=sh?SHARPS:FLATS,a=L[n-1];
  return{type:'choice',noBoard:true,key:`ko${sh}${n}`,text:`In the order of ${sh?'sharps':'flats'}, what is the ${ord(n)} ${sh?'sharp':'flat'}?`,choices:mc(a,L.filter(x=>x!==a)),ans:a,hint:sh?'“Father Charles Goes Down And Ends Battle.”':'“Battle Ends And Down Goes Charles’ Father” (the sharps backwards).',explain:`Sharps: ${SHARPS.join(' ')}. Flats: ${FLATS.join(' ')} (the same letters in reverse).`}}
function kSet(){const[k,n]=pick(KS.filter(x=>x[1]!==0));const L=n>0?SHARPS:FLATS,m=Math.abs(n),fmt=a=>a.join(' ');
  const a=fmt(L.slice(0,m)),dis=[m>1?fmt(L.slice(0,m-1)):fmt(L.slice(0,m+1)),m<7?fmt(L.slice(0,m+1)):fmt(L.slice(0,m-2)),fmt(L.slice(1,m+1)),fmt((n>0?FLATS:SHARPS).slice(0,m))];
  return{type:'choice',noBoard:true,key:'ks'+k,text:`Which ${n>0?'sharps':'flats'} are in ${k} major?`,choices:mc(a,dis),ans:a,hint:`How many ${n>0?'sharps':'flats'} does ${k} have? Take that many from the start of the order.`,explain:`${k} major has ${sigTxt(n)}: always the first ${m} of the order of ${n>0?'sharps':'flats'}.`}}
function kCircle(){const sh=Math.random()<.5,n=sh?R(0,6):-R(0,6),k=keyBySig(n),nx=keyBySig(sh?n+1:n-1);
  return{type:'choice',noBoard:true,key:`kq${sh}${n}`,text:`Starting from ${k} major, which key has one more ${sh?'sharp':'flat'}?`,choices:mc(nx,[keyBySig(sh?Math.min(7,n+2):Math.max(-7,n-2)),keyBySig(sh?n-1||-1:n+1||1),keyByPc((pcOf(nx)+1)%12)||'E',keyByPc((pcOf(k)+(sh?5:7))%12)]),ans:nx,hint:sh?'Go up a perfect 5th (7 frets).':'Go up a perfect 4th (5 frets).',explain:sh?`Up a perfect 5th from ${k} is ${nx}, which adds one sharp (its 7th degree). This is the circle of fifths.`:`Up a perfect 4th from ${k} is ${nx}, which adds one flat (its 4th degree). Flat keys move round the circle in 4ths.`}}
const cBank=sbank('cb',[
 ['Why does G major need an F♯?','Its 7th degree must be a half step below G',['Because G is a sharp key by name','To avoid two Fs','Its 4th degree must be raised'],'W W H W W W H from G: E to the 7th must be a whole step and the 7th to G a half step, so F becomes F♯.'],
 ['Why does F major need a B♭?','Its 4th degree must be a half step above A',['Because F is a flat key by name','Its 7th degree must be lowered','To avoid using A twice'],'From F: G (W) A (W) then a half step: B♭, not B.'],
 ['Each new sharp key (G, D, A…) adds its sharp on which degree?','The 7th',['The 4th','The 3rd','The root'],'The new sharp is the leading note, a half step below the new key.'],
 ['Each new flat key (F, B♭, E♭…) adds its flat on which degree?','The 4th',['The 7th','The 5th','The 2nd'],'The new flat is the 4th degree of the new key.'],
 ['On the circle of fifths, moving clockwise (up a 5th)…','adds a sharp or removes a flat',['adds a flat','keeps the same signature','changes to a minor key'],'C → G → D → A…: each step up a perfect 5th adds one sharp.']]);
function kFret(){const k=pick(KEASY.filter(x=>x!=='C')),s=R(0,5),tg=keyPositions(k,[s],0,12).filter(p=>p.name.length>1);
  return{type:'multi',key:`kf${k}${s}`,text:`On the ${SN[s]} string (frets 0–12), click every note of ${k} major that is a ${sigOf(k)>0?'sharp':'flat'}.`,marks:[],targets:tg.map(p=>({...p,t:p.name})),notes:tg.map(p=>midi(p.s,p.f)),hint:`${k} major has ${sigTxt(sigOf(k))}.`,explain:`${k} major has ${sigTxt(sigOf(k))}. On the ${SN[s]} string: ${tg.map(p=>`${p.name} (${fretTxt(p.f)})`).join(', ')}.`}}

/* ---------- Lesson 15: how to find sharps & flats ---------- */
function kFromSharps(){const n=R(1,7),k=keyBySig(n),last=SHARPS[n-1];
  return{type:'choice',noBoard:true,key:'fs'+n,text:`A key signature has these sharps: ${SHARPS.slice(0,n).join(' ')}. Which major key is it?`,choices:mc(k,[last,keyBySig(n-1>0?n-1:2),keyBySig(n<7?n+1:5),keyBySig(-n)]),ans:k,hint:'The key is a half step above the last sharp.',explain:`Last sharp ${last}, up a half step = ${k}. ${k} major has ${sigTxt(n)}.`}}
function kFromFlats(){const n=R(1,7),k=keyBySig(-n);
  return{type:'choice',noBoard:true,key:'ff'+n,text:`A key signature has these flats: ${FLATS.slice(0,n).join(' ')}. Which major key is it?`,choices:mc(k,[FLATS[n-1],keyBySig(-(n<7?n+1:5)),keyBySig(n),keyBySig(-(n>1?n-1:3))]),ans:k,hint:n===1?'One flat is the special case you memorise.':'The key is the second-to-last flat.',explain:n===1?'One flat (B♭) = F major: the one flat key you memorise.':`The second-to-last flat is ${FLATS[n-2]}, so it is ${k} major.`}}
function kLast(){const[k,n]=pick(KS.filter(x=>x[1]!==0));const sh=n>0,a=sh?SHARPS[n-1]:FLATS[-n-1];
  return{type:'choice',noBoard:true,key:'kl'+k,text:`What is the last ${sh?'sharp':'flat'} in the key signature of ${k} major?`,choices:mc(a,(sh?SHARPS:FLATS).filter(x=>x!==a)),ans:a,hint:sh?'For sharp keys, the last sharp is a half step below the key note.':'For flat keys, the key note is the second-to-last flat; the last flat comes one step further in the order.',explain:`${k} major has ${sigTxt(n)}, so the last one is ${a}.`}}
const rBank=sbank('rb',[
 ['Shortcut for sharp keys:','The key is a half step above the last sharp',['The key is the last sharp','The key is the second-to-last sharp','The key is a 5th below the last sharp'],'Last sharp F♯ → G; last sharp C♯ → D; last sharp G♯ → A.'],
 ['Shortcut for flat keys:','The key is the second-to-last flat',['The key is the last flat','The key is a half step above the last flat','The key is a 4th below the first flat'],'B♭ E♭ → B♭ major; B♭ E♭ A♭ → E♭ major.'],
 ['Which flat key does not follow the second-to-last-flat rule?','F major (one flat)',['B♭ major','E♭ major','C♭ major'],'With only one flat there is no second-to-last; F major (B♭) is memorised.'],
 ['Which major key has exactly one sharp?','G major',['D major','F major','E major'],'G major: F♯.'],
 ['Which major key has exactly one flat?','F major',['B♭ major','G major','D minor'],'F major: B♭.'],
 ['A key with 3 sharps is…','A major',['E♭ major','D major','E major'],'F♯ C♯ G♯: last sharp G♯ + half step = A.'],
 ['A key with 3 flats is…','E♭ major',['A major','B♭ major','A♭ major'],'B♭ E♭ A♭: second-to-last flat = E♭.']]);

const LS={
 insight:{h:'fretboard-insight',n:'Lesson 12',title:'Fretboard insight',sub:'Seeing every note of a key as a degree around its roots.',
  ex:[['Which degree?',[fDegName]],['Find a degree',[fFind]],['Roots everywhere',[fRoots]],['Every 3rd, 5th…',[fDegAll]]],
  test:[...rep(fDegName,5),...rep(fFind,5),...rep(fRoots,2),...rep(fDegAll,3)]},
 keys:{h:'major-scale-keys',n:'Lesson 13',title:'Major scale keys',sub:'What a key is and which notes belong to it.',
  ex:[['Concepts',[kBank]],['How many?',[kCount]],['In or out?',[kNotIn,kWhichKey]]],
  test:[...rep(kBank,4),...rep(kCount,5),...rep(kNotIn,3),...rep(kWhichKey,3)]},
 build:{h:'keys-construction',n:'Lesson 14',title:'Construction, sharps & flats',sub:'Order of sharps and flats, and the circle of fifths.',
  ex:[['Order',[kOrder]],['Which ones?',[kSet]],['Circle of fifths',[kCircle,cBank]],['On the fretboard',[kFret]]],
  test:[...rep(kOrder,3),...rep(kSet,4),...rep(kCircle,3),...rep(cBank,2),...rep(kFret,3)]},
 find:{h:'find-sharps-flats',n:'Lesson 15',title:'Finding sharps & flats',sub:'Name any key from its signature, and back again.',
  ex:[['From sharps',[kFromSharps]],['From flats',[kFromFlats]],['Last accidental',[kLast]],['Rules',[rBank]]],
  test:[...rep(kFromSharps,4),...rep(kFromFlats,4),...rep(kLast,4),...rep(rBank,3)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 12–15 mixed.',
  ex:[['Lesson 12',[fDegName,fFind,fRoots,fDegAll]],['Lessons 13–15',[kBank,kCount,kNotIn,kWhichKey,kOrder,kSet,kCircle,cBank,kFret,kFromSharps,kFromFlats,kLast,rBank]]],
  test:[fDegName,fDegName,fFind,fFind,fRoots,fDegAll,kBank,kCount,kCount,kNotIn,kWhichKey,kOrder,kSet,kSet,kCircle,kFret,kFromSharps,kFromFlats,kLast,rBank]}};
const ORDER=['insight','keys','build','find','final'],STORE='gi-best-p4';

const sigRow=([k,n])=>`<tr><td>${k}</td><td>${sigShort(n)}</td><td>${n===0?'—':(n>0?SHARPS:FLATS).slice(0,Math.abs(n)).join(' ')}</td></tr>`;
const NOTES={
 insight:`<div class="cols"><div><h3>Degrees as shapes around a root</h3><table class="stack"><thead><tr><th>Degree</th><th>Above the root</th><th>Below the root</th></tr></thead><tbody>${[2,3,4,5,6,7].map(d=>`<tr><td>${d}</td><td>${cap(nm(MAJ[d-1]))}</td><td>${cap(nm(12-MAJ[d-1]))} below</td></tr>`).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>Find the roots of the key first (lessons 4–6).</li><li>Every other note is an interval shape from the nearest root (lesson 3).</li><li>A degree below the root is the inversion: the 5th is a 4th below, the 3rd is a minor 6th below.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Pick a key, mark every root on the neck, then play only the 3rds, then only the 5ths.</li><li>Improvise using just 1, 3 and 5 around one root.</li></ul></div></div>`,
 keys:`<div class="cols"><div><h3>All 15 major keys</h3><div class="scroll"><table><thead><tr><th>Key</th><th>Signature</th><th>Accidentals</th></tr></thead><tbody>${KS.map(sigRow).join('')}</tbody></table></div></div>
  <div><h3>Key ideas</h3><ul><li>A key is the set of notes of a scale, centred on its root.</li><li>The key signature lists the sharps or flats once, at the start.</li><li>B/C♭, F♯/G♭ and C♯/D♭ are the same sounds spelled two ways.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play one movable pattern in G, D and A, and name the sharp each new key adds.</li><li>Then F, B♭ and E♭, naming each new flat.</li></ul></div></div>`,
 build:`<div class="cols"><div><h3>Orders and the circle</h3><p><b>Sharps:</b> ${SHARPS.join(' ')}<br><span class="small">Father Charles Goes Down And Ends Battle</span></p><p><b>Flats:</b> ${FLATS.join(' ')}<br><span class="small">Battle Ends And Down Goes Charles’ Father</span></p>
  <p><b>Circle of fifths:</b> C → G → D → A → E → B → F♯ → C♯ (up a 5th each time, +1 sharp)<br>C → F → B♭ → E♭ → A♭ → D♭ → G♭ → C♭ (up a 4th each time, +1 flat)</p></div>
  <div><h3>Key ideas</h3><ul><li>A new sharp key adds a sharp on its 7th degree.</li><li>A new flat key adds a flat on its 4th degree.</li><li>On guitar, up a 5th is 7 frets, or the P5 shape: next string, 2 frets higher.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Walk the circle with power-chord (P5) shapes: each new root is the 5th of the last.</li></ul></div></div>`,
 find:`<div class="cols"><div><h3>The two shortcuts</h3><ul><li><b>Sharp keys:</b> go a half step above the last sharp. F♯ C♯ G♯ D♯ → E major.</li><li><b>Flat keys:</b> take the second-to-last flat. B♭ E♭ A♭ D♭ → A♭ major.</li><li><b>Exceptions:</b> C has none; F has one flat (B♭).</li></ul>
  <h3 style="margin-top:22px">Backwards: from key to signature</h3><p>Sharp key: the last sharp is a half step below the key note, so take sharps up to it (A → G♯ → F♯ C♯ G♯). Flat key: find the key note in the order of flats and add one more (E♭ → B♭ E♭ A♭).</p></div>
  <div><h3>On your guitar</h3><ul><li>Name a key, say its signature, then play the scale and check you hit those sharps or flats.</li><li>Pick a song you know, find its key, and play the scale over it.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes everything: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lesson 16 starts on triads: major, minor, diminished and augmented, all built from these scales.</p></div></div>`};
