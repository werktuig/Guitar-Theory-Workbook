/* ===== Part 8: lessons 29–31 ===== */
/* ---------- shared voicing helpers ---------- */
const m3=x=>((x%3)+3)%3,m4=x=>((x%4)+4)%4;
const LB={maj:['R','3','5'],min:['R','♭3','5'],dim:['R','♭3','♭5'],aug:['R','3','♯5'],
 maj7:['R','3','5','7'],dom7:['R','3','5','♭7'],m7:['R','♭3','5','♭7'],m7b5:['R','♭3','♭5','♭7'],dim7:['R','♭3','♭5','𝄫7'],mMaj7:['R','♭3','5','7']};
const INVN=['root position','1st inversion','2nd inversion','3rd inversion'];
const TONE=['root','3rd','5th','7th'];
/* every playable way to sound pcs[i] on strings[i]: frets lo..hi (no open strings), pitch strictly rising, fret spread < span */
function vAll(strings,pcs,lo,hi,span){const out=[];
  const rec=(i,acc)=>{if(i===strings.length){const mn=Math.min(...acc),mx=Math.max(...acc);
      if(mx-mn<=span-1){const m=acc.map((f,j)=>midi(strings[j],f));if(m.every((x,j)=>j===0||x>m[j-1]))out.push(acc.slice())}return}
    for(let f=lo;f<=hi;f++)if(pcAt(strings[i],f)===pcs[i]){acc.push(f);rec(i+1,acc);acc.pop()}};
  rec(0,[]);return out}
function vOne(strings,pcs,lo,hi=15,span=4){const a=vAll(strings,pcs,lo,hi,span);if(!a.length)return null;
  a.sort((x,y)=>Math.max(...x)-Math.max(...y)||x[0]-y[0]);return a[0].map((f,i)=>({s:strings[i],f}))}
/* voicing of chord (root,q): order = chord-tone indices from lowest to highest string */
function mkV(root,q,strings,order,lo,span=4){const cn=chordNotes(root,q),pcs=order.map(i=>pcOf(cn[i])),p=vOne(strings,pcs,lo,15,span);
  return p?p.map((x,j)=>({...x,idx:order[j],name:cn[order[j]],deg:LB[q][order[j]]})):null}
const strList=st=>{const a=st.map(s=>SN[s]);return a.length>1?a.slice(0,-1).join(', ')+' and '+a[a.length-1]:a[0]};
const bx=(...vs)=>{const fs=vs.flat().map(p=>p.f);return[Math.max(0,Math.min(...fs)-1),Math.min(15,Math.max(...fs)+1)]};
const vNotes=v=>v.map(p=>midi(p.s,p.f));
const vTxt=v=>v.map(p=>`${p.name} (${SN[p.s]} string, fret ${p.f})`).join(', ');
const nmark=(p,mode)=>({s:p.s,f:p.f,t:mode==='deg'?p.deg:p.name,k:p.idx===0?'root':'q'});
/* roots whose chord spelling avoids double accidentals and awkward C♭/F♭/E♯/B♯ (dim7 may use one 𝄫 or the flats) */
function okSpell(q,r){const s=chordNotes(r,q).join(' ');if(/𝄪/.test(s))return false;const d=(s.match(/𝄫/g)||[]).length;
  if(q==='dim7')return d<=1;return d===0&&!/C♭|F♭|E♯|B♯/.test(s)}
const bad={test:s=>/𝄪|𝄫|C♭|F♭|E♯|B♯/.test(s)};
function rootFor(q,pool=KEASY){for(let i=0;i<120;i++){const r=pick(pool);if(okSpell(q,r))return r}return'C'}
const semiSpan=v=>midi(v[v.length-1].s,v[v.length-1].f)-midi(v[0].s,v[0].f);
const noteList=a=>a.join(' ');

const ROM7=['I','ii','iii','IV','V','vi','vii°'];
const swapCase=s=>s===s.toUpperCase()?s.toLowerCase():s.toUpperCase();
const keyTxt=k=>`${k} major: ${spellScale(k).join(' ')} ${k}`;
const altN=(n,d)=>{const a=ACC[n.slice(1)]+d;return Math.abs(a)<=1?n[0]+accTxt(a):null};

/* ---------- Lesson 29: open triads ---------- */
const OSETS=[[0,1,3],[1,2,4],[2,3,5],[0,2,3],[1,3,4],[2,4,5],[0,2,4],[1,3,5]];
const OORD=[[0,2,1],[1,0,2],[2,1,0]],OLAB=['root–5th–3rd','3rd–root–5th','5th–3rd–root'];
function oPick(inv,qs=['maj','min']){for(let t=0;t<500;t++){const q=pick(qs),root=rootFor(q),i=inv===undefined?R(0,2):inv,st=pick(OSETS),v=mkV(root,q,st,OORD[i],R(1,10));
  if(v&&semiSpan(v)>12)return{root,q,inv:i,st,v}}
  return{root:'C',q:'maj',inv:0,st:[1,2,4],v:mkV('C','maj',[1,2,4],OORD[0],1)}}
function cPick(){for(let t=0;t<300;t++){const q=pick(['maj','min']),root=rootFor(q),b=R(0,2),st=pick(SETS3),v=mkV(root,q,st,[b,b+1,b+2].map(m3),R(1,10));
  if(v&&semiSpan(v)<12)return{root,q,inv:b,st,v}}
  return{root:'C',q:'maj',inv:0,st:[3,4,5],v:mkV('C','maj',[3,4,5],[0,1,2],1)}}
const oExp=o=>`${chordSym(o.root,o.q)} = ${chordNotes(o.root,o.q).join(' ')}. ${cap(INVN[o.inv])} open triad (${OLAB[o.inv]}) on the ${strList(o.st)} strings: ${vTxt(o.v)}.`;
const oBank=sbank('ob',[
 ['What is an open triad?','A triad voiced over more than an octave',['A triad that uses open strings','A triad on the top three strings only','A triad with the root doubled'],'In an open triad the notes are spread: the lowest and highest notes are more than an octave apart. A close triad fits inside one octave.'],
 ['From low to high, what is the order of a root-position open triad?','Root – 5th – 3rd',['Root – 3rd – 5th','3rd – 5th – root','5th – root – 3rd'],'Close root position is R–3–5. Move the middle note (the 3rd) up an octave and the order becomes R–5–3: the 3rd now sits above the 5th.'],
 ['How do you turn a close triad into an open triad with the same bass note?','Move the middle note up an octave',['Add an open string','Double the root','Raise the whole chord an octave'],'The bass stays put and the middle note jumps over the top note: R–3–5 becomes R–5–3, 3–5–R becomes 3–R–5, and 5–R–3 becomes 5–3–R.'],
 ['What is the order of a 1st-inversion open triad, low to high?','3rd – root – 5th',['Root – 5th – 3rd','5th – 3rd – root','3rd – 5th – root'],'The bass note names the inversion. 1st inversion has the 3rd in the bass: 3–R–5.'],
 ['What is the order of a 2nd-inversion open triad, low to high?','5th – 3rd – root',['3rd – root – 5th','Root – 5th – 3rd','5th – root – 3rd'],'2nd inversion has the 5th in the bass: 5–3–R.'],
 ['Why are open triads usually fingered with one string skipped?','The notes are over an octave apart, so a string is skipped to keep the shape within about four frets',['Adjacent strings cannot be fretted together','The root must always be on the low E string','Skipped strings sound louder'],'On three adjacent strings an open voicing would need a huge stretch. Skipping a string brings the notes within reach, for example A–D–B or E–D–G.'],
 ['Which statement is true for all three open voicings of one triad?','They contain the same three notes, ordered differently from the bass up',['They contain different notes','They are all in root position','They all start on the root'],'Inversions rearrange the same three chord tones; only the bass note changes.'],
 ['A triad has its lowest and highest notes 16 semitones apart. Is it open or close?','Open (more than an octave)',['Close (within an octave)','It depends on the key','Neither: triads cannot be this wide'],'An octave is 12 semitones. More than 12 between lowest and highest means an open voicing.']]);
function oSpell(){const q=pick(['maj','min']),root=rootFor(q),inv=R(0,2),cn=chordNotes(root,q),ord=OORD[inv],a=ord.map(i=>cn[i]).join(' ');
  const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(p=>p.map(i=>cn[i]).join(' ')).filter(x=>x!==a);
  return{type:'choice',noBoard:true,key:`os${root}${q}${inv}`,text:`Which shows ${chordSym(root,q)} as an open triad in ${INVN[inv]}, notes listed from lowest to highest?`,choices:mc(a,perms),ans:a,
   hint:`${cap(INVN[inv])} has the ${['root','3rd','5th'][inv]} in the bass. The open pattern for it is ${OLAB[inv]}.`,
   explain:`${chordSym(root,q)} = ${cn.join(' ')}. ${cap(INVN[inv])} open triad (${OLAB[inv]}): ${a}. The other orders are different inversions or close voicings.`}}
function oBuild(){const o=oPick(),b=o.v[0],cn=chordNotes(o.root,o.q);
  return{type:'multi',key:`ob${o.root}${o.q}${o.inv}${o.st.join('')}`,box:bx(o.v),text:`${chordSym(o.root,o.q)} open triad in ${INVN[o.inv]} (${OLAB[o.inv]}, low to high) on the ${strList(o.st)} strings. The bass note is marked. Click the other two notes inside the shaded frets.`,
   marks:[nmark(b,'deg')],targets:o.v.slice(1).map(p=>({s:p.s,f:p.f,t:p.deg})),notes:vNotes(o.v),
   hint:`Spell the chord first (${cn.join(' ')}). Then find the next note of the pattern on each remaining string, close to the marked fret.`,explain:oExp(o)}}
function oTone(){const o=oPick(),h=R(0,2),p=o.v[h],tn=['root','3rd','5th'][p.idx];
  return{type:'click',key:`ot${o.root}${o.q}${o.inv}${h}${o.st.join('')}`,box:bx(o.v),text:`${chordSym(o.root,o.q)} open triad in ${INVN[o.inv]} on the ${strList(o.st)} strings. Two notes are shown; click the missing ${tn} (the ${SN[p.s]} string).`,
   marks:o.v.filter((x,i)=>i!==h).map(x=>nmark(x,'deg')),target:{s:p.s,f:p.f,t:p.deg},notes:vNotes(o.v),
   hint:`The ${tn} of ${chordSym(o.root,o.q)} is ${p.name}. Find it on the ${SN[p.s]} string inside the shaded frets.`,explain:`The missing ${tn} is ${p.name}. ${oExp(o)}`}}
function oInv(){const o=oPick(),b=o.v[0];
  return{type:'choice',key:`oi${o.root}${o.q}${o.inv}${o.st.join('')}`,text:`These notes spell ${chordSym(o.root,o.q)} as an open triad (the root is highlighted). Which inversion is it?`,
   marks:o.v.map(p=>({...nmark(p,'name')})),choices:INVN.slice(0,3),ans:INVN[o.inv],notes:vNotes(o.v),
   hint:'Look at the lowest-sounding note. Which chord tone is it?',explain:`The lowest note is ${b.name}, the ${['root','3rd','5th'][b.idx]} of ${chordSym(o.root,o.q)}, so this is ${INVN[o.inv]} (${OLAB[o.inv]}). ${oExp(o)}`}}
function oType(){const open=Math.random()<.5,o=open?oPick():cPick(),sp=semiSpan(o.v),a=open?'Open triad':'Close triad';
  return{type:'choice',key:`oy${open?1:0}${o.root}${o.q}${o.inv}${o.st.join('')}`,text:`These marks are the three notes of ${chordSym(o.root,o.q)}. Is the voicing an open triad or a close triad?`,
   marks:o.v.map(p=>nmark(p,'name')),choices:['Open triad','Close triad'],ans:a,notes:vNotes(o.v),
   hint:'Compare the lowest and highest notes: are they more than an octave (12 semitones) apart?',
   explain:`The lowest note is ${o.v[0].name} and the highest is ${o.v[2].name}: ${sp} semitones apart. ${open?`That is more than an octave, so it is open (one string is skipped). ${oExp(o)}`:`That is less than an octave and the notes sit on three adjacent strings, so it is a close triad: ${vTxt(o.v)}.`}`}}
function oChord(){const o=oPick(undefined,['maj','min','dim','aug']),r=o.v.find(p=>p.idx===0),cn=chordNotes(o.root,o.q);
  const ch=['maj','min','dim','aug'].map(x=>chordSym(o.root,x)),a=chordSym(o.root,o.q);
  return{type:'choice',key:`oc${o.root}${o.q}${o.inv}${o.st.join('')}`,text:`This open triad has its root ${o.root} marked R. Which chord is it?`,
   marks:o.v.map(p=>p.idx===0?{s:p.s,f:p.f,t:'R',k:'root'}:{s:p.s,f:p.f,t:'?',k:'q'}),choices:ch,ans:a,notes:vNotes(o.v),
   hint:`Name the other two notes, then measure the interval from ${o.root} to the 3rd and to the 5th.`,
   explain:`The notes are ${o.v.map(p=>p.name).join(', ')}. Measured from ${o.root}: a ${nm(o.q==='min'||o.q==='dim'?3:4)} to the 3rd and ${o.q==='dim'?'a diminished':o.q==='aug'?'an augmented':'a perfect'} 5th, so it is ${a}. ${oExp(o)}`}}

/* ---------- Lesson 30: harmonized major scale (triads) ---------- */
const dia3=k=>diatonic(k,'major',3);
function hDeg(){const key=pick(KEASY),d=R(1,7);return{key,d,c:dia3(key)[d-1],all:dia3(key)}}
const hBank=sbank('hb',[
 ['What does harmonizing the major scale mean?','Building one triad on each scale degree using only notes of the scale',['Playing the scale in two octaves','Adding a bass note to each scale note','Changing every chord to major'],'Stack two thirds on each of the seven notes, staying inside the key. That gives seven triads.'],
 ['What is the order of triad qualities in a major key?','Major, minor, minor, major, major, minor, diminished',['Major, major, minor, minor, major, minor, diminished','Minor, major, major, minor, minor, major, diminished','Major, minor, major, minor, major, minor, diminished'],'I ii iii IV V vi vii°. It is the same pattern in every major key.'],
 ['Which triads of a major key are major?','I, IV and V',['ii, iii and vi','I, ii and V','IV, V and vii°'],'Major triads are written with capital numerals: I, IV, V.'],
 ['Which degree carries the diminished triad?','vii°',['ii','iv','vi'],'In C major it is B–D–F: two stacked minor thirds.'],
 ['Which triads of a major key are minor?','ii, iii and vi',['I, IV and V','ii, V and vii°','iii, IV and vi'],'Minor triads are written with lower-case numerals: ii, iii, vi.'],
 ['When you play the harmonized scale up the neck on one string set, what usually stays the same?','The inversion and the string set',['The fret','The root note','The chord quality'],'Each note simply moves up to the next scale note, so the shape changes slightly to follow the major/minor/diminished qualities.'],
 ['Why is the triad on degree 7 diminished in C major (B D F)?','It stacks two minor thirds, B–D and D–F',['It contains a sharp','It starts on the 7th, so it is always minor','It has a major 3rd and perfect 5th'],'B–D is 3 semitones, D–F is 3 semitones: root, ♭3, ♭5 = diminished.'],
 ['How many different triad qualities appear in a major key?','3 (major, minor, diminished)',['2','4','7'],'Major (I IV V), minor (ii iii vi) and one diminished (vii°). Augmented triads do not occur.']]);
function hQual(){const{key,d,c}=hDeg(),a=c.sym,ch=['maj','min','dim','aug'].map(x=>chordSym(c.root,x));
  return{type:'choice',noBoard:true,key:`hq${key}${d}`,text:`In ${key} major, which triad is built on the ${ord(d)} degree (${c.roman})?`,choices:mc(a,ch),ans:a,
   hint:`Find the ${ord(d)} note of ${key} major, then stack the notes two and four letters above it from the scale.`,explain:`${keyTxt(key)}. The ${ord(d)} degree is ${c.root}; its triad uses scale notes ${c.notes.join(' ')} = ${a} (${c.roman}).`}}
function hRoman(){const{key,d,c}=hDeg(),a=c.roman;
  return{type:'choice',noBoard:true,key:`hr${key}${d}`,text:`In ${key} major, which Roman numeral does the chord ${c.sym} have?`,choices:mc(a,[...ROM7.filter(x=>x!==a),swapCase(a)]),ans:a,
   hint:`Which degree of ${key} major is ${c.root}? Capital numeral = major, lower case = minor, ° = diminished.`,explain:`${keyTxt(key)}. ${c.root} is degree ${d}, and ${c.notes.join('–')} is ${CHORDS[c.q].name}: ${a}.`}}
function hSetup(){for(let t=0;t<300;t++){const{key,d,c,all}=hDeg(),b=R(0,2),st=pick(SETS3),v=mkV(c.root,c.q,st,[b,b+1,b+2].map(m3),R(1,8));if(v)return{key,d,c,all,b,st,v}}
  const all=dia3('C');return{key:'C',d:1,c:all[0],all,b:0,st:[3,4,5],v:mkV('C','maj',[3,4,5],[0,1,2],1)}}
function hBoard(){const o=hSetup(),{key,d,c,b,st,v}=o;
  return{type:'multi',key:`hf${key}${d}${b}${st.join('')}`,box:bx(v),text:`${key} major, the ${c.roman} triad (${c.sym}) in ${INVN[b]} on the ${strList(st)} strings. The bass note is marked; click the other two notes inside the shaded frets.`,
   marks:[nmark(v[0],'name')],targets:v.slice(1).map(p=>({s:p.s,f:p.f,t:p.name})),notes:vNotes(v),
   hint:`${c.sym} contains ${c.notes.join(' ')}. Find the next note (from the bass up) on each string.`,explain:`${keyTxt(key)}. ${c.roman} = ${c.sym} = ${c.notes.join(' ')}. ${cap(INVN[b])} on the ${strList(st)} strings: ${vTxt(v)}.`}}
function hStep(){for(let t=0;t<400;t++){const key=pick(KEASY),d=R(1,5),all=dia3(key),c=all[d-1],n=all[d],b=R(0,2),st=pick(SETS3),v=mkV(c.root,c.q,st,[b,b+1,b+2].map(m3),R(1,7));if(!v)continue;
    const sc=spellScale(key),nv=v.map(p=>{const i=(d-1+2*p.idx)%7,step=(pcOf(sc[(i+1)%7])-pcOf(sc[i])+12)%12;return{s:p.s,f:p.f+step,name:sc[(i+1)%7],step}});
    if(nv.some(p=>p.f>15))continue;
    return{type:'multi',key:`hs${key}${d}${b}${st.join('')}`,box:bx(v,nv),text:`${key} major: the ${c.roman} triad (${c.sym}) is shown in ${INVN[b]} on the ${strList(st)} strings. Move every note up one step of the ${key} major scale to get the ${n.roman} triad (${n.sym}), and click the three new notes.`,
     marks:v.map(p=>({s:p.s,f:p.f,t:p.name,k:'ghost'})),targets:nv.map(p=>({s:p.s,f:p.f,t:p.name})),notes:[...vNotes(v)],
     hint:'Each note moves to the next scale note: 1 fret for a half step (3–4 and 7–8), 2 frets for a whole step.',
     explain:`${keyTxt(key)}. Each note steps up the scale: ${v.map((p,i)=>`${p.name}→${nv[i].name} (+${nv[i].step})`).join(', ')}. The result is ${n.sym} = ${n.notes.join(' ')} on the same strings.`}}
  return hStep()}
function hWhich(){const o=hSetup(),{key,d,c,all,b,st,v}=o,a=c.roman;
  return{type:'choice',key:`hw${key}${d}${b}${st.join('')}`,text:`These three notes come from the harmonized ${key} major scale. Which chord (Roman numeral) is it?`,
   marks:v.map(p=>({s:p.s,f:p.f,t:p.name,k:'q'})),choices:mc(a,ROM7.filter(x=>x!==a)),ans:a,notes:vNotes(v),
   hint:'Read the three note names, stack them in thirds to find the root, then count its degree in the key.',explain:`${keyTxt(key)}. The notes ${v.map(p=>p.name).join(', ')} are ${c.sym} (${c.notes.join(' ')}), the ${ord(d)} degree chord: ${a}.`}}
function hRootFind(){for(let t=0;t<200;t++){const key=pick(KEASY),s=R(0,1),r=rootFret(key,s,1),d=R(2,7),c=dia3(key)[d-1],f=rootFret(c.root,s,1);if(r<1||r>12||f<1||f>12||f===r)continue;
  return{type:'click',key:`hrf${key}${s}${d}`,box:[1,12],text:`The root of ${key} major (chord I) is marked. Click the root of the ${c.roman} chord on the ${SN[s]} string, frets 1–12.`,
   marks:[{s,f:r,t:'I',k:'root'}],target:{s,f,t:c.roman},notes:[midi(s,r),midi(s,f)],hint:`The ${c.roman} chord is built on the ${ord(d)} note of the ${key} major scale.`,
   explain:`${keyTxt(key)}. The ${ord(d)} degree is ${c.root} (${c.sym}), at fret ${f} of the ${SN[s]} string.`}}
  return hRootFind()}

/* ---------- Lesson 31: harmonized major scale in intervals ---------- */
const IQ={3:{3:'minor 3rd',4:'major 3rd'},4:{5:'perfect 4th',6:'augmented 4th'},5:{7:'perfect 5th',6:'diminished 5th'},6:{8:'minor 6th',9:'major 6th'}};
const NS={3:'3rd',4:'4th',5:'5th',6:'6th'};
function hiInfo(key,d,n){const sc=spellScale(key),a=sc[d-1],b=sc[(d-1+n-1)%7],semis=(pcOf(b)-pcOf(a)+12)%12;return{a,b,semis,name:IQ[n][semis]}}
const iBank=sbank('ib',[
 ['In a major key, on which degrees does a diatonic 3rd above make a MAJOR 3rd?','I, IV and V',['ii, iii and vi','I, ii and V','IV, V and vii'],'In C major: C–E, F–A and G–B are major 3rds. D–F, E–G, A–C and B–D are minor 3rds.'],
 ['On which degrees does a diatonic 6th above make a MINOR 6th?','iii, vi and vii',['I, IV and V','ii, iii and vi','I, IV and vii'],'In C major: E–C, A–F and B–G are minor 6ths. The other four degrees give major 6ths.'],
 ['Which diatonic 4th is not perfect?','The 4th above the 4th degree (F up to B in C major)',['The 4th above the root','The 4th above the 5th degree','The 4th above the 2nd degree'],'F–B is an augmented 4th (tritone), the only non-perfect diatonic 4th.'],
 ['Which diatonic 5th is not perfect?','The 5th above the 7th degree (B up to F in C major)',['The 5th above the root','The 5th above the 4th degree','The 5th above the 2nd degree'],'B–F is a diminished 5th (tritone), the only non-perfect diatonic 5th.'],
 ['What does a major 3rd become when you turn it upside down?','A minor 6th',['A major 6th','A perfect 4th','A minor 3rd'],'Inversion: the two numbers add to 9 and major becomes minor. C up to E (major 3rd) inverts to E up to C (minor 6th).'],
 ['Harmonizing a melody in diatonic 3rds means…','adding a note a 3rd above each melody note, using only notes of the key',['adding a note exactly 4 semitones above each melody note','adding the root under each melody note','playing every note twice'],'Because the 3rd is diatonic, its size alternates between major and minor to stay in the key.'],
 ['How many frets is a major 3rd on the same string?','4',['3','5','2'],'A major 3rd is 4 semitones = 4 frets; a minor 3rd is 3.'],
 ['A diatonic 3rd above the 7th degree of C major (B) is…','D, a minor 3rd',['D♯, a major 3rd','D♭, a diminished 3rd','C, a major 2nd'],'B up two scale notes is D (B–D = 3 semitones).']]);
function iQual(){const key=pick(KEASY),d=R(1,7),n=pick([3,3,6,6,4,5]),x=hiInfo(key,d,n),a=x.name;
  return{type:'choice',noBoard:true,key:`iq${key}${d}${n}`,text:`In ${key} major, what interval is it from ${x.a} up to the diatonic ${NS[n]} above it (${x.b})?`,
   choices:mc(a,[...Object.values(IQ[n]),'perfect 4th','major 6th','minor 3rd','major 3rd','perfect 5th','minor 6th']),ans:a,
   hint:`Count the semitones from ${x.a} to ${x.b} and compare with the interval names.`,explain:`${keyTxt(key)}. ${x.a} up to ${x.b} is ${x.semis} semitones: ${art(a)} ${a}.`}}
function iAbove(){const key=pick(KEASY),d=R(1,7),n=pick([3,3,6,6,4,5]),x=hiInfo(key,d,n),sc=spellScale(key),a=x.b;
  return{type:'choice',noBoard:true,key:`ia${key}${d}${n}`,text:`In ${key} major, which note is the diatonic ${NS[n]} above ${x.a}?`,
   choices:mc(a,[altN(a,1),altN(a,-1),sc[(d-1+n)%7],sc[(d+n-3+7)%7]].filter(Boolean)),ans:a,
   hint:`Count ${n} letters from ${x.a} (${x.a} is 1), then take that letter as it appears in the ${key} major scale.`,explain:`${keyTxt(key)}. Counting ${n} notes up from ${x.a} lands on ${a}: ${art(x.name)} ${x.name}.`}}
function iPlace(n){for(let t=0;t<300;t++){const key=pick(KEASY),d=R(1,7),x=hiInfo(key,d,n),s1=R(0,4),s2=s1+(n===6?2:1);if(s2>5)continue;
  const fs=allPc(pcOf(x.a),[s1],2,12);if(!fs.length)continue;const f=pick(fs).f,tf=shapeFret(s1,f,s2,x.semis);if(tf<1||tf>15||Math.abs(tf-f)>4)continue;
  return{key,d,n,x,s1,s2,f,tf}}
  return{key:'C',d:1,n:3,x:hiInfo('C',1,3),s1:1,s2:2,f:3,tf:2}}
function iName(){const p=iPlace(pick([3,3,4,5,6,6])),{key,x,s1,s2,f,tf,n}=p,a=nm(x.semis);
  return{type:'choice',key:`in${key}${p.d}${n}${s1}`,text:`Both marked notes belong to ${key} major. What interval is it from ${x.a} up to the note marked ?`,
   marks:[{s:s1,f,t:x.a,k:'root'},{s:s2,f:tf,t:'?',k:'q'}],choices:mc(a,near(x.semis)),ans:a,notes:[midi(s1,f),midi(s2,tf)],
   hint:`Add the string gap (${gap(s1,s2)} semitones) and the fret difference.`,explain:`${gap(s1,s2)} semitones between the strings ${tf-f>=0?'+':'−'} ${Math.abs(tf-f)} = ${x.semis}: ${art(a)} ${a} from ${x.a} up to ${x.b}.`}}
function iBoard(){const p=iPlace(pick([3,3,6,6,4,5])),{key,d,n,x,s1,s2,f,tf}=p;
  return{type:'click',key:`ib${key}${d}${n}${s1}`,box:[Math.max(0,Math.min(f,tf)-1),Math.min(15,Math.max(f,tf)+1)],text:`${key} major: ${x.a} (degree ${d}) is marked on the ${SN[s1]} string. Click the diatonic ${NS[n]} above it on the ${SN[s2]} string.`,
   marks:[{s:s1,f,t:x.a,k:'root'}],target:{s:s2,f:tf,t:x.b},notes:[midi(s1,f),midi(s2,tf)],
   hint:`Count ${n} letters up from ${x.a}, then check which note that is in ${key} major.`,explain:`${keyTxt(key)}. The diatonic ${NS[n]} above ${x.a} is ${x.b} (${art(x.name)} ${x.name}): fret ${tf} of the ${SN[s2]} string.`}}
function iRun(){for(let t=0;t<400;t++){const key=pick(KEASY),n=pick([3,3,6,6]),s1=R(0,3),s2=s1+(n===6?2:1);if(s2>5)continue;
  const lo=R(1,8),ps=keyPositions(key,[s1],lo,lo+6).sort((a,b)=>a.f-b.f).slice(0,4);if(ps.length<4)continue;
  const sc=spellScale(key),tg=ps.map(p=>{const x=hiInfo(key,p.deg,n),tf=shapeFret(s1,p.f,s2,x.semis);return{s:s2,f:tf,t:x.b,name:x.name,from:p.name}});
  if(tg.some(g=>g.f<1||g.f>15)||new Set(tg.map(g=>g.f)).size<4)continue;
  return{type:'multi',key:`ir${key}${n}${s1}${lo}`,box:bx(ps,tg),text:`Harmonize this run of ${key} major in ${NS[n]}s: for each marked note, click the diatonic ${NS[n]} above it on the ${SN[s2]} string.`,
   marks:ps.map(p=>({s:p.s,f:p.f,t:p.name,k:'root'})),targets:tg.map(g=>({s:g.s,f:g.f,t:g.t})),notes:ps.flatMap((p,i)=>[midi(p.s,p.f),midi(tg[i].s,tg[i].f)]),pm:'seq',
   hint:n===3?'Major 3rds fall only on degrees 1, 4 and 5. Every other degree takes a minor 3rd.':'Minor 6ths fall only on degrees 3, 6 and 7. Every other degree takes a major 6th.',
   explain:`${keyTxt(key)}. ${tg.map(g=>`${g.from}→${g.t} (${g.name})`).join(', ')}.`}}
  return iRun()}

const LS={
 open:{h:'open-triads',n:'Lesson 29',title:'Open triads',sub:'Spread the triad over more than an octave: root–5th–3rd and its inversions on skipped strings.',
  ex:[['Concepts',[oBank,oSpell]],['Build it',[oBuild,oTone]],['Read it',[oInv,oType,oChord]]],
  test:[...rep(oBank,2),...rep(oSpell,2),...rep(oBuild,3),...rep(oTone,3),...rep(oInv,2),oType,...rep(oChord,2)]},
 htri:{h:'harmonized-triads',n:'Lesson 30',title:'Harmonized major scale (triads)',sub:'One triad on every degree of the major scale, played up the neck.',
  ex:[['Theory',[hBank,hQual,hRoman]],['Triads on the neck',[hBoard,hStep,hRootFind]],['Name the chord',[hWhich]]],
  test:[...rep(hBank,2),...rep(hQual,2),...rep(hRoman,2),...rep(hBoard,3),...rep(hStep,2),...rep(hWhich,2),...rep(hRootFind,2)]},
 hint:{h:'harmonized-intervals',n:'Lesson 31',title:'Harmonized major scale (intervals)',sub:'Harmonize the scale in diatonic 3rds, 6ths and other two-note intervals.',
  ex:[['Theory',[iBank,iQual,iAbove]],['Name it',[iName]],['Play it',[iBoard,iRun]]],
  test:[...rep(iBank,2),...rep(iQual,3),iAbove,...rep(iName,3),...rep(iBoard,3),...rep(iRun,3)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 29–31 mixed.',
  ex:[['Lesson 29',[oBank,oSpell,oBuild,oTone,oInv,oType,oChord]],['Lesson 30',[hBank,hQual,hRoman,hBoard,hStep,hWhich,hRootFind]],['Lesson 31',[iBank,iQual,iAbove,iName,iBoard,iRun]]],
  test:[oBank,oSpell,oBuild,oBuild,oTone,oInv,oType,oChord,hBank,hQual,hRoman,hBoard,hStep,hWhich,hRootFind,iQual,iName,iBoard,iRun,iAbove]}};
const ORDER=['open','htri','hint','final'],STORE='gi-best-p8';
const exOpen=i=>{for(const st of OSETS){const v=mkV('C','maj',st,OORD[i],1);if(v&&semiSpan(v)>12)return{st,v}}return null};
const NOTES={
 open:`<div class="cols"><div><h3>Open triads on C major</h3><table class="stack"><thead><tr><th>Voicing</th><th>Low → high</th><th>Strings · frets (low → high)</th></tr></thead><tbody>${[0,1,2].map(i=>{const e=exOpen(i);return`<tr><td>${cap(INVN[i])}</td><td>${OLAB[i]}<br>${OORD[i].map(j=>chordNotes('C','maj')[j]).join(' ')}</td><td>${e?`${e.st.map(s=>SL[s]).join(' ')} · ${e.v.map(p=>p.f).join('–')}`:''}</td></tr>`}).join('')}</tbody></table>
  <p class="small">Assumption: an open triad is a close triad with its middle note moved up an octave, so the bass note (and the inversion name) stays the same.</p></div>
  <div><h3>Key ideas</h3><ul><li>Close triad: all three notes inside one octave. Open triad: more than an octave from lowest to highest.</li><li>Root position R–5–3, 1st inversion 3–R–5, 2nd inversion 5–3–R.</li><li>The wide spread needs a skipped string (for example A–D–B or E–D–G) to stay within four frets.</li><li>Every open shape is movable: the root sets the chord.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play C major as a close triad, then as an open triad with the same bass note. Hear how the sound opens up.</li><li>Play the three open inversions of one chord, then slide each shape 2 frets for the next chord.</li><li>Find a G major open triad on every skipped-string set.</li></ul></div></div>`,
 htri:`<div class="cols"><div><h3>Triads of C major</h3><div class="scroll"><table><thead><tr><th>Degree</th><th>Chord</th><th>Notes</th><th>Frets on G–B–e (root position)</th></tr></thead><tbody>${dia3('C').map(c=>{const v=mkV(c.root,c.q,[3,4,5],[0,1,2],1);return`<tr><td>${c.roman}</td><td>${c.sym}</td><td>${c.notes.join(' ')}</td><td>${v?v.map(p=>p.f).join('–'):''}</td></tr>`}).join('')}</tbody></table></div>
  <p class="small">Each row is the lowest voicing without open strings, so the vii° shape sits low on the neck. Add 12 frets (where possible) for the same shape one octave up.</p></div>
  <div><h3>Key ideas</h3><ul><li>One triad per scale degree: major, minor, minor, major, major, minor, diminished.</li><li>Hold the string set and inversion and every note steps up the scale: 1 fret for a half step, 2 frets for a whole step.</li><li>The same pattern of qualities works in every major key; only the note names change.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play all seven triads of G major in root position on the G–B–e strings.</li><li>Repeat on D–G–B, then in 1st inversion.</li><li>Say the Roman numeral and quality as you play each chord.</li></ul></div></div>`,
 hint:`<div class="cols"><div><h3>C major in diatonic 3rds and 6ths</h3><table class="stack"><thead><tr><th>Degree</th><th>3rd above</th><th>6th above</th></tr></thead><tbody>${[1,2,3,4,5,6,7].map(d=>{const a=hiInfo('C',d,3),b=hiInfo('C',d,6);return`<tr><td>${d} (${a.a})</td><td>${a.b} · ${a.name.split(' ')[0]}</td><td>${b.b} · ${b.name.split(' ')[0]}</td></tr>`}).join('')}</tbody></table>
  <p class="small">Assumption: “harmonizing in intervals” means adding one diatonic note above each scale note (usually a 3rd or a 6th), staying inside the key.</p></div>
  <div><h3>Key ideas</h3><ul><li>Diatonic means: stay inside the key. The interval size can change from note to note.</li><li>3rds: major on degrees 1, 4, 5, minor on 2, 3, 6, 7. 6ths: minor on 3, 6, 7, major on the rest.</li><li>Diatonic 4ths are perfect except F–B in C; diatonic 5ths are perfect except B–F.</li><li>Two-note intervals are the building blocks of triads and 7th chords.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play G major up the A string in 3rds with the D string below… above: each note with its diatonic 3rd on the next string.</li><li>Repeat in 6ths, skipping a string.</li><li>Name every interval aloud as you play.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 29–31: open triads, the harmonized scale in triads, and in intervals. 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lessons 32–36 move on to 7th chords: construction, close position, Drop 2 and Drop 3 voicings.</p></div></div>`};

