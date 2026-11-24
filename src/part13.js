const fmtF=f=>f.replace(/bb(?=\d)/g,'𝄫').replace(/b(?=\d)/g,'♭').replace(/#(?=\d)/g,'♯');
/* ===== Part 13: lessons 48–52 (I, ii and iii chords of the major scale) ===== */
const keyByPc=pc=>KEASY.find(k=>pcOf(k)===((pc%12)+12)%12);
const scaleTxt=k=>`${k} major: ${spellScale(k).join(' ')}`;
const noDbl=a=>!a.some(n=>/[𝄫𝄪]/.test(n));
const lt=l=>l==='R'?'root':/^\d+$/.test(l)?l+(l==='3'?'rd':'th'):l;
function vc(strings,pcs,lo=1,hi=15,span=4){let best=null;const cand=strings.map((s,i)=>{const o=[];for(let f=lo;f<=hi;f++)if(pcAt(s,f)===pcs[i])o.push(f);return o});
  const rec=(i,acc)=>{if(i===strings.length){const sp=Math.max(...acc)-Math.min(...acc);if(sp<=span-1){const sc=Math.max(...acc);if(!best||sc<best.sc)best={sc,v:acc.slice()}}return}
    for(const f of cand[i]){if(i>0&&midi(strings[i],f)<=midi(strings[i-1],acc[i-1]))continue;acc.push(f);rec(i+1,acc);acc.pop()}};
  rec(0,[]);return best?best.v.map((f,i)=>({s:strings[i],f})):null}
const strNames=set=>set.map(s=>SN[s]).join(', ');
const tabOf=v=>{const a=Array(6).fill('x');v.forEach(p=>a[p.s]=p.f);return a.join(' ')};
const boxOfV=v=>{const fs=v.map(p=>p.f);return[Math.max(0,Math.min(...fs)-1),Math.min(15,Math.max(...fs)+1)]};
const playOf=v=>v.map(p=>midi(p.s,p.f));
const tokLbl=t=>t==='1'?'R':t.replace('b','♭').replace('#','♯');

/* ---------- chord families ---------- */
const C_=(id,sym,f,name)=>({id,sym,f,name});
const ROLE={
 1:{rn:'I',fam:[C_('maj','','1 3 5','major triad'),C_('maj7','maj7','1 3 5 7','major 7th'),C_('6','6','1 3 5 6','major 6th'),C_('69','6/9','1 3 5 6 9','six-nine'),C_('add9','add9','1 3 5 9','add9'),C_('maj9','maj9','1 3 5 7 9','major 9th'),C_('maj13','maj13','1 3 5 7 9 13','major 13th')],
  bad:[C_('m','m','1 b3 5'),C_('7','7','1 3 5 b7'),C_('m7','m7','1 b3 5 b7'),C_('aug','+','1 3 #5'),C_('dim','°','1 b3 b5'),C_('maj7s11','maj7♯11','1 3 5 7 #11')]},
 2:{rn:'ii',fam:[C_('m','m','1 b3 5','minor triad'),C_('m7','m7','1 b3 5 b7','minor 7th'),C_('m6','m6','1 b3 5 6','minor 6th'),C_('m9','m9','1 b3 5 b7 9','minor 9th'),C_('m11','m11','1 b3 5 b7 9 11','minor 11th')],
  bad:[C_('maj7','maj7','1 3 5 7'),C_('7','7','1 3 5 b7'),C_('m7b5','m7♭5','1 b3 b5 b7'),C_('mM7','m(maj7)','1 b3 5 7'),C_('m7b9','m7♭9','1 b3 5 b7 b9'),C_('dim','°','1 b3 b5')]},
 3:{rn:'iii',fam:[C_('m','m','1 b3 5','minor triad'),C_('m7','m7','1 b3 5 b7','minor 7th')],
  bad:[C_('m9','m9','1 b3 5 b7 9'),C_('m6','m6','1 b3 5 6'),C_('m11','m11','1 b3 5 b7 9 11'),C_('mM7','m(maj7)','1 b3 5 7'),C_('maj7','maj7','1 3 5 7'),C_('7','7','1 3 5 b7'),C_('m7b5','m7♭5','1 b3 b5 b7')]}};
const TN=(l,tok,semis,txt,avoid)=>({l,tok,semis,txt,avoid});
const TONES={
 1:[TN('3','3',4,'major 3rd'),TN('5','5',7,'perfect 5th'),TN('6','6',9,'major 6th'),TN('7','7',11,'major 7th'),TN('9','9',14,'9th')],
 2:[TN('♭3','b3',3,'minor 3rd'),TN('5','5',7,'perfect 5th'),TN('6','6',9,'major 6th'),TN('♭7','b7',10,'minor 7th'),TN('9','9',14,'9th'),TN('11','11',17,'11th')],
 3:[TN('♭3','b3',3,'minor 3rd'),TN('5','5',7,'perfect 5th'),TN('♭7','b7',10,'minor 7th'),TN('11','11',17,'11th'),TN('♭9','b9',13,'minor 9th',1),TN('♭13','b13',20,'minor 13th',1)]};
const cs=(root,c)=>root+c.sym;
const cn=(root,c)=>c.sym===''?`the ${root} major triad`:root+c.sym;
const tnTxt=tn=>/^\d+$/.test(tn.l)?tn.txt:`${tn.txt} (${tn.l})`;
const notesOf=(root,c)=>spellF(root,c.f);
const tokTxt=f=>f.split(' ').map(t=>t==='1'?'root':lt(tokLbl(t))).join(', ');
const outside=(k,notes)=>{const pcs=spellScale(k).map(pcOf);return notes.find(n=>!pcs.includes(pcOf(n)))};
const rootOf=(k,d)=>spellScale(k)[d-1];
function alterTokens(f){const t=f.split(' '),o=[];for(let i=1;i<t.length;i++){const x=t[i],y=/^[b#]/.test(x)?x.slice(1):'b'+x,z=/^[b#]/.test(x)?x:'#'+x;for(const w of[y,z]){const u=t.slice();u[i]=w;o.push(u.join(' '))}}return o}

/* ---------- generic generators by role (1 = I, 2 = ii, 3 = iii) ---------- */
const mkNotes=d=>()=>{const ro=ROLE[d],k=pickKey(),root=rootOf(k,d),c=pick(ro.fam),n=notesOf(root,c);
  if(Math.random()<.5){const ans=n.join(' '),dis=alterTokens(c.f).map(f=>notesOf(root,{f})).filter(noDbl).map(a=>a.join(' ')).filter(x=>x!==ans);
    return{type:'choice',noBoard:true,key:`n${d}${k}${c.id}a`,text:`In ${k} major, which notes make ${cn(root,c)} (the ${ro.rn} chord)?`,choices:mc(ans,dis),ans,hint:`Build it from the ${k} major scale: ${c.f.replace(/\b9\b/,'9 (= 2)').replace(/\b11\b/,'11 (= 4)').replace(/\b13\b/,'13 (= 6)')}. Spell each degree from ${root}.`,explain:`${cn(root,c)} has the formula ${fmtF(c.f)}: ${tokTxt(c.f)}. In ${k} major: ${ans}.`}}
  const ans=cs(root,c),pool=[...ro.fam.map(x=>cs(root,x)),...ro.bad.filter(x=>noDbl(notesOf(root,x))).slice(0,2).map(x=>cs(root,x))];
  return{type:'choice',noBoard:true,key:`n${d}${k}${c.id}b`,text:`In ${k} major, which chord on ${root} is made of these notes: ${n.join(' ')}?`,choices:mc(ans,pool),ans,hint:`Name the intervals above ${root}: which are 3rd, 5th, 6th, 7th or 9th?`,explain:`${n.join(' ')} over ${root} = ${fmtF(c.f)} (${tokTxt(c.f)}): ${cn(root,c)}.`}};
const mkWhich=d=>()=>{const ro=ROLE[d],k=pickKey(),root=rootOf(k,d),bad=shuf(ro.bad.filter(b=>noDbl(notesOf(root,b)))),why=b=>`${cs(root,b)} has ${outside(k,notesOf(root,b))}, which is not in ${k} major`;
  if(Math.random()<.5){const c=pick(ro.fam),b3=bad.slice(0,3),ans=cs(root,c);
    return{type:'choice',noBoard:true,key:`w${d}${k}${c.id}a`,text:`Which of these chords can function as the ${ro.rn} chord in ${k} major?`,choices:mc(ans,b3.map(b=>cs(root,b))),ans,hint:`Spell each chord and test its notes against the ${k} major scale.`,explain:`${ans} = ${notesOf(root,c).join(' ')}: all in ${k} major (${spellScale(k).join(' ')}). But ${b3.map(why).join('; ')}.`}}
  const b=bad[0],fam=shuf(ro.fam).slice(0,3),ans=cs(root,b);
  return{type:'choice',noBoard:true,key:`w${d}${k}${b.id}b`,text:`Which of these chords can NOT function as the ${ro.rn} chord in ${k} major?`,choices:mc(ans,fam.map(c=>cs(root,c))),ans,hint:`One of them has a note that is not in the ${k} major scale.`,explain:`${why(b)}. The others (${fam.map(c=>cs(root,c)+' = '+notesOf(root,c).join(' ')).join('; ')}) use only notes of ${k} major.`}};
function place(root,semis){for(let t=0;t<300;t++){const s1=R(0,4),f=rootFret(root,s1,1),s2=R(s1+1,5);if(f<1||f>12)continue;const tf=f+semis-gap(s1,s2);if(tf<0||tf>15||Math.abs(tf-f)>4)continue;return{s1,f,s2,t:tf}}return null}
const mkExtra=d=>()=>{const ro=ROLE[d];for(let t=0;t<100;t++){const k=pickKey(),root=rootOf(k,d),tn=pick(TONES[d].filter(x=>!x.avoid)),p=place(root,tn.semis);if(!p)continue;const nn=spellF(root,tn.tok)[0];
  return{type:'click',key:`x${d}${k}${tn.l}${p.s1}${p.s2}`,text:`${k} major: the root of the ${ro.rn} chord (${root}) is marked on the ${SN[p.s1]} string. Click its ${tnTxt(tn)} on the ${SN[p.s2]} string.`,marks:[{s:p.s1,f:p.f,t:'R',k:'root'}],target:{s:p.s2,f:p.t,t:tn.l},notes:[midi(p.s1,p.f),midi(p.s2,p.t)],hint:`A ${tn.txt} is ${tn.semis} semitones. The ${SN[p.s1]}→${SN[p.s2]} string gap is ${gap(p.s1,p.s2)} semitones.`,explain:`The ${tnTxt(tn)} of ${root} is ${nn}: ${tn.semis} semitones above the root. String gap ${gap(p.s1,p.s2)} ${p.t-p.f>=0?'+':'−'} ${Math.abs(p.t-p.f)} fret${Math.abs(p.t-p.f)===1?'':'s'} = ${tn.semis}, so fret ${p.t} on the ${SN[p.s2]} string.`}}
  return mkExtra(d)()};
const mkDegree=d=>()=>{const ro=ROLE[d];for(let t=0;t<100;t++){const k=pickKey(),root=rootOf(k,d),tn=pick(TONES[d]),p=place(root,tn.semis);if(!p)continue;const nn=spellF(root,tn.tok)[0],ans=tn.l;
  const pool=TONES[d].map(x=>x.l).concat(d===1?['♭3','♭7']:['3','7']);
  return{type:'choice',key:`g${d}${k}${tn.l}${p.s1}${p.s2}`,text:`The root of the ${ro.rn} chord of ${k} major (${root}) is marked. Which chord tone is the ? note?`,marks:[{s:p.s1,f:p.f,t:'R',k:'root'},{s:p.s2,f:p.t,t:'?',k:'q'}],choices:mc(ans,pool),ans,notes:[midi(p.s1,p.f),midi(p.s2,p.t)],hint:`Measure the interval from the root: string gap ${gap(p.s1,p.s2)} semitones, then add or subtract the fret difference.`,explain:`${nn} is ${tn.semis} semitones above ${root} (${gap(p.s1,p.s2)} ${p.t-p.f>=0?'+':'−'} ${Math.abs(p.t-p.f)}): ${art(tn.txt)} ${tn.txt}, the ${lt(ans)}${tn.avoid?' (diatonic, but an avoid note over this chord)':''}.`}}
  return mkDegree(d)()};
const mkTones=d=>()=>{const ro=ROLE[d];for(let t=0;t<200;t++){const k=pickKey(),root=rootOf(k,d),c=pick(ro.fam.filter(x=>x.f.split(' ').length<=4)),ss=pick([[0,1,2],[1,2,3],[2,3,4]]),r=rootFret(root,ss[0],2);if(r<2||r>10)continue;
  const toks=c.f.split(' '),nms=notesOf(root,c),pcs=nms.map(pcOf),box=[r-1,r+3],tg=[];for(const s of ss)for(let f=box[0];f<=box[1];f++){const i=pcs.indexOf(pcAt(s,f));if(i>=0&&!(s===ss[0]&&f===r))tg.push({s,f,t:tokLbl(toks[i]),nn:nms[i]})}
  if(tg.length<2||tg.length>8)continue;
  return{type:'multi',key:`t${d}${k}${c.id}${ss[0]}`,box,text:`Click every note of ${cn(root,c)} (the ${ro.rn} chord of ${k} major) on the ${strNames(ss)} strings, inside the shaded frets. The root is marked.`,marks:[{s:ss[0],f:r,t:'R',k:'root'}],targets:tg.map(p=>({s:p.s,f:p.f,t:p.t})),notes:[midi(ss[0],r),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`${cn(root,c)} = ${notesOf(root,c).join(' ')}. Find each of these notes on each string.`,explain:`${cn(root,c)} = ${notesOf(root,c).join(' ')}. Inside frets ${box[0]}–${box[1]}: ${tg.map(p=>`${p.nn} (${SN[p.s]} string, fret ${p.f})`).join(', ')}.`}}
  return mkTones(d)()};
const mkMap=d=>()=>{const ro=ROLE[d],k=pickKey(),sc=spellScale(k),root=sc[d-1],tn=pick(TONES[d]),pc=(pcOf(root)+tn.semis)%12,i=sc.findIndex(n=>pcOf(n)===pc),lab=j=>`${ord(j+1)} degree (${sc[j]})`;
  const pool=[0,1,2,3,4,5,6].filter(j=>j!==i).map(lab);
  return{type:'choice',noBoard:true,key:`m${d}${k}${tn.l}`,text:`In ${k} major, the ${tnTxt(tn)} of the ${ro.rn} chord (${root}) is which degree of the key?`,choices:mc(lab(i),pool),ans:lab(i),hint:`Spell the chord tone from ${root}, then find it in ${scaleTxt(k)}.`,explain:`The ${tnTxt(tn)} above ${root} is ${sc[i]}, the ${ord(i+1)} degree of ${k} major.${tn.avoid?' It is in the key, but it clashes with a chord tone (an avoid note).':''}`}};

/* ---------- concept banks ---------- */
const icBank=sbank('ib',[
 ['What does a 6 chord add to a major triad?','The 6th (A in C)',['The 7th (B in C)','The 9th (D in C)','The 4th (F in C)'],'C6 = C E G A.'],
 ['What does a 6/9 chord contain?','A major triad plus the 6th and the 9th (no 7th)',['A major triad plus the 7th and the 9th','A major triad plus the 6th and the 7th','Only the 6th and the 9th'],'C6/9 = C E G A D.'],
 ['What is the difference between add9 and maj9?','maj9 includes the 7th; add9 does not',['add9 includes the 7th; maj9 does not','add9 is minor','There is no difference'],'Cadd9 = C E G D; Cmaj9 = C E G B D.'],
 ['Which note over a I chord is usually avoided?','The 4th (11th)',['The 6th','The 7th','The 9th'],'F sits a half step above E (the 3rd) in C major and clashes with it.'],
 ['Which chord tones of Cmaj7 are in the C major scale?','All of them',['Only C E and G','Everything except B','Only C and G'],'C E G B are degrees 1, 3, 5 and 7.'],
 ['The I chord belongs to which chord family?','Tonic',['Subdominant','Dominant','Predominant'],'I, iii and vi are the tonic family.']]);
const iiBankL=[
 ['Why does Dm6 fit C major?','Its 6th (B) is the 7th degree of C major, so it stays in the key',['Its 6th is outside the key but sounds fine','It has no 6th','D minor is not in C major'],'Dm6 = D F A B: all in C major.'],
 ['Is Am6 diatonic on the vi chord of C major?','No: its 6th (F♯) is outside the key',['Yes, like Dm6','Yes, it is the same as Dm7','Only in A minor'],'Am6 = A C E F♯. The ii chord is Dorian (natural 6th); vi is Aeolian (♭6).'],
 ['Which scale fits a ii chord?','Dorian',['Phrygian','Lydian','Locrian'],'The 2nd mode of the major scale: D E F G A B C over Dm.'],
 ['Which chord family does ii belong to?','Subdominant (predominant)',['Tonic','Dominant','None'],'ii and IV lead toward V.'],
 ['Why is Dm(maj7) not a ii chord in C major?','Its major 7th (C♯) is outside the key',['It has no 3rd','It has a 6th','It is a major chord'],'D F A C♯: C♯ is not in C major.'],
 ['Is Dm9 diatonic to C major?','Yes: all of D F A C E are in the key',['No: the 9th (E) is outside the key','No: the 7th (C) is outside the key','Only as D7(9)'],'Dm9 = D F A C E. The 9th of ii is the 3rd degree of the key.']];
const iiBank=sbank('ii',iiBankL);
const iiiBank=sbank('ij',[
 ['Why does Em9 not fit on the iii degree of C major?','Its 9th (F♯) is outside the key',['Its 9th is too low','It has no 3rd','E minor is not diatonic'],'Em9 = E G B D F♯. C major has F natural.'],
 ['Which two notes of C major are the avoid notes over Em7?','F (♭9) and C (♭13)',['A and B','G and D','D and F♯'],'F is a half step above E and C is a half step above B: both are in the key but clash with a chord tone.'],
 ['Which chords can function as iii in a major key?','Minor triad and minor 7th',['Minor 9th and minor 11th','Minor 6th and minor 9th','Major 7th and dominant 7th'],'The only natural extension on iii is the 11th; the 9th is outside the key.'],
 ['Which chord family does iii belong to?','Tonic (with I and vi)',['Subdominant','Dominant','Predominant'],'Em7 shares E, G and B with Cmaj7, so it can stand in for the tonic.'],
 ['Which mode fits the iii chord of a major key?','Phrygian',['Dorian','Aeolian','Lydian'],'E Phrygian = C major starting on E: E F G A B C D.'],
 ['Which tension can you add to Em7 in C major without leaving the key or causing a clash?','The 11th (A)',['The 9th (F♯)','The ♭9 (F)','The 13th (C♯)'],'A is in the key and a whole step above G.']]);

/* ---------- fingering templates ---------- */
const FT=(id,sym,tones,sets,omit)=>({id,sym,tones,sets,omit});
const ALL3=[[0,1,2,3],[1,2,3,4],[2,3,4,5]];
const TPL_I=[FT('maj7a','maj7',['1','5','7','3'],ALL3),FT('maj7b','maj7',['1','3','5','7'],[[1,2,3,4],[2,3,4,5]]),FT('6','6',['1','5','6','3'],ALL3),FT('add9','add9',['1','3','5','9'],ALL3),FT('maj9','maj9',['1','3','7','9'],ALL3,'5th'),FT('69','6/9',['1','3','6','9'],ALL3,'5th')];
const TPL_II=[FT('m7','m7',['1','5','b7','b3'],ALL3),FT('m6','m6',['1','5','6','b3'],ALL3),FT('m9','m9',['1','b3','b7','9'],ALL3,'5th'),FT('m11','m11',['1','11','b7','b3'],ALL3,'5th and 9th')];
function fvOf(root,tpl,set){const names=spellF(root,tpl.tones.join(' ')),v=vc(set,names.map(pcOf));return v?{v,tpl,set,names,labels:tpl.tones.map(tokLbl)}:null}
function anyFV(root,TPL){for(let t=0;t<60;t++){const tpl=pick(TPL),r=fvOf(root,tpl,pick(tpl.sets));if(r)return r}return null}
const fvNote=r=>r.tpl.omit?` (the ${r.tpl.omit} ${r.tpl.omit.includes('and')?'are':'is'} left out)`:'';
const uniq=a=>[...new Set(a)];
const mkFBuild=(d,TPL)=>()=>{const ro=ROLE[d];for(let t=0;t<100;t++){const k=pickKey(),root=rootOf(k,d),r=anyFV(root,TPL);if(!r)continue;const sym=cs(root,r.tpl);
  return{type:'multi',key:`fb${d}${k}${r.tpl.id}${r.set[0]}`,box:boxOfV(r.v),text:`${sym} is the ${ro.rn} chord of ${k} major. Build it as ${r.tpl.tones.map(x=>tokLbl(x)).join('–')} (low to high) on the ${strNames(r.set)} strings. The root is marked: click the other three notes inside the shaded frets.`,marks:[{s:r.v[0].s,f:r.v[0].f,t:'R',k:'root'}],targets:r.v.slice(1).map((p,i)=>({...p,t:r.labels[i+1]})),notes:playOf(r.v),pm:'chord',hint:`${sym} = ${notesOf(root,{f:r.tpl.tones.join(' ')}).join(' ')} in the order of the shape. Find each note on its string.`,explain:`${sym}${fvNote(r)}: ${r.names.join(' ')}. ${r.v.map((p,i)=>`${r.names[i]} on the ${SN[p.s]} string (fret ${p.f})`).join(', ')}. Frets: ${tabOf(r.v)}.`}}
  return mkFBuild(d,TPL)()};
const mkFName=(d,TPL)=>()=>{const ro=ROLE[d];for(let t=0;t<100;t++){const k=pickKey(),root=rootOf(k,d),r=anyFV(root,TPL);if(!r)continue;const syms=uniq(TPL.map(x=>cs(root,x))),ans=cs(root,r.tpl);
  return{type:'choice',key:`fm${d}${k}${r.tpl.id}${r.set[0]}`,text:`These four notes (root marked) are a voicing of the ${ro.rn} chord of ${k} major. Which chord is it?`,marks:r.v.map((p,i)=>({s:p.s,f:p.f,t:r.names[i],k:i===0?'root':'q'})),choices:mc(ans,syms),ans,notes:playOf(r.v),pm:'chord',hint:`Name the intervals above the root: which of the 3rd, 5th, 6th, 7th, 9th or 11th do you hear?`,explain:`${r.names.join(' ')} over ${r.names[0]}: ${r.tpl.tones.map(tokLbl).join(' ')} = ${ans}${fvNote(r)}.`}}
  return mkFName(d,TPL)()};
const mkFDegree=(d,TPL)=>()=>{const ro=ROLE[d];for(let t=0;t<100;t++){const k=pickKey(),root=rootOf(k,d),r=anyFV(root,TPL);if(!r)continue;const h=R(1,3),ans=r.labels[h],sym=cs(root,r.tpl);
  const pool=r.labels.slice(1).concat(d===1?['♭3','♭7']:['3','7']);
  return{type:'choice',key:`fd${d}${k}${r.tpl.id}${h}${r.set[0]}`,text:`${sym} (the ${ro.rn} chord of ${k} major) is played in this voicing. The notes are labelled by degree except one. Which chord tone is the ? note?`,marks:r.v.map((p,i)=>({s:p.s,f:p.f,t:i===h?'?':r.labels[i],k:i===0?'root':'q'})),choices:mc(ans,pool),ans,notes:playOf(r.v),pm:'chord',hint:`${sym} = ${r.names.join(' ')}. Which of these is the note at the ?`,explain:`The ? is ${r.names[h]}, the ${lt(ans)} of ${sym}. Voicing: ${r.names.map((n,i)=>n+' ('+r.labels[i]+')').join(', ')}.`}}
  return mkFDegree(d,TPL)()};
const mkFClick=(d,TPL)=>()=>{const ro=ROLE[d];for(let t=0;t<100;t++){const k=pickKey(),root=rootOf(k,d),r=anyFV(root,TPL);if(!r)continue;const h=R(1,3),tp=r.v[h],sym=cs(root,r.tpl);
  return{type:'click',key:`fc${d}${k}${r.tpl.id}${h}${r.set[0]}`,box:boxOfV(r.v),text:`${sym} (the ${ro.rn} chord of ${k} major), ${r.tpl.tones.map(tokLbl).join('–')} on the ${strNames(r.set)} strings. Three notes are marked: click the missing ${lt(r.labels[h])} on the ${SN[tp.s]} string, inside the shaded frets.`,marks:r.v.map((p,i)=>i===h?null:{s:p.s,f:p.f,t:r.labels[i],k:i===0?'root':'q'}).filter(Boolean),target:{...tp,t:r.labels[h]},notes:playOf(r.v),pm:'chord',hint:`${sym} = ${r.names.join(' ')}. Which one is the ${lt(r.labels[h])}?`,explain:`The ${lt(r.labels[h])} of ${sym} is ${r.names[h]}: on the ${SN[tp.s]} string at fret ${tp.f}. Full voicing ${tabOf(r.v)}.`}}
  return mkFClick(d,TPL)()};
const mkFSlide=(d,TPL)=>()=>{for(let t=0;t<200;t++){const k=pickKey(),root=rootOf(k,d),r=anyFV(root,TPL);if(!r)continue;const dl=pick([-4,-3,-2,-1,1,2,3,4,5]),nv=r.v.map(p=>({s:p.s,f:p.f+dl}));if(nv.some(p=>p.f<1||p.f>15))continue;
  const nr=keyByPc(pcOf(root)+dl),ans=nr+r.tpl.sym,pool=[1,-1,2,-2,5,7].map(x=>keyByPc(pcOf(nr)+x)+r.tpl.sym);
  return{type:'choice',key:`fs${d}${k}${r.tpl.id}${dl}${r.set[0]}`,text:`This ${cs(root,r.tpl)} shape (ghost marks, root on the ${SN[r.v[0].s]} string at fret ${r.v[0].f}) is slid ${fr(Math.abs(dl))} ${dl>0?'up':'down'}. Which chord is it now?`,marks:[...r.v.map((p,i)=>({...p,t:r.labels[i],k:'ghost'})),...nv.map((p,i)=>({...p,t:r.labels[i],k:i===0?'root':'q'}))],choices:mc(ans,pool),ans,notes:playOf(nv),pm:'chord',hint:'The shape stays the same; only the root moves. Name the new root note.',explain:`The root moves from ${root} (fret ${r.v[0].f}) to ${nr} (fret ${nv[0].f}) on the ${SN[r.v[0].s]} string, so the chord is ${ans}.`}}
  return mkFSlide(d,TPL)()};

/* ---------- Lesson 49 bank ---------- */
const ifBank=sbank('fb',[
 ['A movable chord shape gets its name from…','its root note',['its highest note','the first fret used','the number of strings'],'Slide the same shape and the chord changes to the chord of the new root.'],
 ['Which voicing contains both the 6th and the 9th above the root?','6/9',['maj9','add9','maj7'],'C6/9 = C E G A D (the voicings here omit the 5th: C E A D).'],
 ['Why can maj9 and 6/9 voicings leave out the 5th?','The root and 3rd define the chord; the 5th adds little',['The 5th clashes with the 9th','There are only four strings','The 5th is not in the key'],'Root, 3rd and the colour tones are the important notes.'],
 ['Which note do Cmaj7 and Cmaj9 not share?','The 9th (D)',['The 7th (B)','The 3rd (E)','The root (C)'],'Cmaj9 = Cmaj7 plus D.'],
 ['In a Cmaj7 voicing R–5–7–3 the notes from low to high are…','C G B E',['C E G B','C B G E','E G B C'],'Root, 5th, 7th, 3rd: C G B E.']]);
/* ---------- Lesson 51 helper: I root to ii root ---------- */
function iiFromI(){for(let t=0;t<120;t++){const k=pickKey(),s=R(0,5),r=rootFret(k,s,1),sc=spellScale(k);if(r<1||r+2>15)continue;
  return{type:'click',key:`ff${k}${s}${r}`,text:`${k} major: the root of the I chord (${k}) is marked on the ${SN[s]} string. Click the root of the ii chord (${sc[1]}) on the same string, above the marked note.`,marks:[{s,f:r,t:'I',k:'root'}],target:{s,f:r+2,t:'ii'},notes:[midi(s,r),midi(s,r+2)],hint:'The ii chord is built on the 2nd degree of the scale.',explain:`${scaleTxt(k)}. The 2nd degree ${sc[1]} is a major 2nd (2 frets) above ${k}: fret ${r} + 2 = fret ${r+2}. Any ii voicing built on that root sits 2 frets higher than the matching I voicing.`}}
  return iiFromI()}
const iiFBank=sbank('if',[
 ['In the m9 voicing here (R–♭3–♭7–9), which note is left out?','The 5th',['The 3rd','The 7th','The root'],'Dm9 = D F A C E; the voicing D F C E leaves out A.'],
 ['In the m11 voicing here (R–11–♭7–♭3), which notes are left out?','The 5th and the 9th',['The 3rd and 7th','The root','Only the 5th'],'Dm11 = D F A C E G; the four-note voicing is D G C F.'],
 ['Which two minor chords share the shape R–5–?–♭3 with a different top-note colour?','m7 (♭7) and m6 (6)',['m9 and m11','m and m7','m6 and m9'],'Dm7 = D A C F, Dm6 = D A B F.'],
 ['A Cmaj7 voicing is slid up 2 frets and becomes Dmaj7. To get the ii chord of C major, what else must change?','The 3rd becomes minor (F♯ → F) and the 7th becomes ♭7 (C♯ → C)',['Nothing: Dmaj7 is the ii chord','Only the root','The 5th becomes a 6th'],'The ii chord of C major is Dm7 = D F A C: minor 3rd and minor 7th.']]);

/* ---------- final glue ---------- */
const icNotes=mkNotes(1),icWhich=mkWhich(1),icExtra=mkExtra(1),icDegree=mkDegree(1),icTones=mkTones(1);
const iiNotes=mkNotes(2),iiWhich=mkWhich(2),iiExtra=mkExtra(2),iiDegree=mkDegree(2),iiTones=mkTones(2),iiMap=mkMap(2);
const iiiNotes=mkNotes(3),iiiWhich=mkWhich(3),iiiExtra=mkExtra(3),iiiDegree=mkDegree(3),iiiTones=mkTones(3),iiiMap=mkMap(3);
const ifBuild=mkFBuild(1,TPL_I),ifName=mkFName(1,TPL_I),ifDegree=mkFDegree(1,TPL_I),ifClick=mkFClick(1,TPL_I),ifSlide=mkFSlide(1,TPL_I);
const iiBuild=mkFBuild(2,TPL_II),iiName=mkFName(2,TPL_II),iiFDegree=mkFDegree(2,TPL_II),iiFClick=mkFClick(2,TPL_II),iiSlide=mkFSlide(2,TPL_II);
function iiiAvoid(){for(let t=0;t<200;t++){const k=pickKey(),root=rootOf(k,3),ss=pick([[0,1,2],[1,2,3],[2,3,4]]),r=rootFret(root,ss[0],2);if(r<2||r>10)continue;
  const box=[r-1,r+3],p9=(pcOf(root)+1)%12,p13=(pcOf(root)+8)%12,tg=[];for(const s of ss)for(let f=box[0];f<=box[1];f++){if(pcAt(s,f)===p9)tg.push({s,f,t:'♭9'});if(pcAt(s,f)===p13)tg.push({s,f,t:'♭13'})}
  if(tg.length<2||tg.length>8)continue;const sc=spellScale(k);
  return{type:'multi',key:`va${k}${ss[0]}`,box,text:`${k} major: the root of the iii chord (${root}) is marked. Click both avoid notes of iii (the ♭9 and the ♭13, both in the key) on the ${strNames(ss)} strings inside the shaded frets.`,marks:[{s:ss[0],f:r,t:'R',k:'root'}],targets:tg,notes:[midi(ss[0],r),...tg.map(p=>midi(p.s,p.f))],pm:'seq',hint:`The ♭9 is a half step above the root; the ♭13 is a half step above the 5th.`,explain:`Over ${root}: ♭9 = ${spellF(root,'b9')[0]} (degree 4 of ${k} major) and ♭13 = ${spellF(root,'b13')[0]} (the tonic). They are in the key but clash with the root and the 5th. Found: ${tg.map(p=>`${p.t==='♭9'?spellF(root,'b9')[0]:spellF(root,'b13')[0]} (${SN[p.s]} string, fret ${p.f})`).join(', ')}.`}}
  return iiiAvoid()}

const LS={
 i:{h:'i-chords-construction',n:'Lesson 48',title:'I chords & construction',sub:'maj, maj7, 6, 6/9, add9, maj9: every chord that can be the I chord.',
  ex:[['Construction',[icNotes,icBank]],['Which chords?',[icWhich]],['On the neck',[icExtra,icDegree,icTones]]],
  test:[...rep(icNotes,3),...rep(icWhich,3),icBank,...rep(icExtra,3),...rep(icDegree,3),...rep(icTones,2)]},
 ifing:{h:'i-chords-fingerings',n:'Lesson 49',title:'I chords fingerings',sub:'Voicings of the I chords on the neck: build them and name their notes.',
  ex:[['Build the shape',[ifBuild,ifClick]],['Read the shape',[ifName,ifDegree]],['Move it',[ifSlide,ifBank]]],
  test:[...rep(ifBuild,3),...rep(ifName,3),...rep(ifDegree,3),...rep(ifClick,3),...rep(ifSlide,2),ifBank]},
 ii:{h:'ii-chords-construction',n:'Lesson 50',title:'ii chords & construction',sub:'m, m7, m6, m9, m11: the chords that fit on the 2nd degree.',
  ex:[['Construction',[iiNotes,iiMap]],['Which chords?',[iiWhich]],['On the neck',[iiExtra,iiDegree,iiTones]]],
  test:[...rep(iiNotes,2),...rep(iiWhich,2),...rep(iiMap,2),...rep(iiExtra,3),...rep(iiDegree,3),...rep(iiTones,3)]},
 iifing:{h:'ii-chords-fingerings',n:'Lesson 51',title:'ii chords fingerings',sub:'Voicings of m7, m6, m9 and m11 on the neck.',
  ex:[['Build the shape',[iiBuild,iiFClick]],['Read the shape',[iiName,iiFDegree]],['Move it',[iiSlide,iiFromI,iiFBank]]],
  test:[...rep(iiBuild,3),...rep(iiName,3),...rep(iiFDegree,2),...rep(iiFClick,3),iiSlide,...rep(iiFromI,2),iiFBank]},
 iii:{h:'iii-chords-construction',n:'Lesson 52',title:'iii chords & construction',sub:'Only m and m7: why the 9th is out and the ♭9 and ♭13 are avoided.',
  ex:[['Construction',[iiiNotes,iiiMap,iiiBank]],['Which chords?',[iiiWhich]],['On the neck',[iiiExtra,iiiDegree,iiiTones,iiiAvoid]]],
  test:[...rep(iiiWhich,2),...rep(iiiNotes,2),...rep(iiiMap,2),iiiBank,...rep(iiiExtra,2),...rep(iiiDegree,2),...rep(iiiAvoid,2),...rep(iiiTones,2)]},
 final:{h:'final-check',n:'Final',title:'Final check',sub:'Lessons 48–52 mixed.',
  ex:[['Lessons 48–49',[icNotes,icWhich,icExtra,icDegree,icTones,ifBuild,ifName,ifClick,ifSlide]],['Lessons 50–51',[iiNotes,iiWhich,iiMap,iiExtra,iiDegree,iiTones,iiBuild,iiName,iiFromI]],['Lesson 52',[iiiNotes,iiiWhich,iiiMap,iiiBank,iiiExtra,iiiDegree,iiiAvoid,iiiTones]]],
  test:[icNotes,icWhich,icExtra,icDegree,ifBuild,ifName,ifClick,ifSlide,iiNotes,iiWhich,iiExtra,iiDegree,iiTones,iiMap,iiBuild,iiName,iiFromI,iiiWhich,iiiExtra,iiiAvoid]}};
const ORDER=['i','ifing','ii','iifing','iii','final'],STORE='gi-best-p13';

const famRows=(d,root)=>ROLE[d].fam.map(c=>`<tr><td>${cs(root,c)}</td><td>${fmtF(c.f)}</td><td>${notesOf(root,c).join(' ')}</td></tr>`).join('');
const tplRows=(TPL,root)=>TPL.map(t=>{const r=fvOf(root,t,t.sets[0]);return`<tr><td>${root+t.sym}</td><td>${t.tones.map(tokLbl).join('–')}</td><td>${strNames(t.sets[0]).replace(/low /g,'')}</td><td>${r?tabOf(r.v):'—'}</td></tr>`}).join('');
const NOTES={
 i:`<div class="cols"><div><h3>I chords in C major</h3><table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${famRows(1,'C')}</tbody></table>
  <p class="small">Assumes the course counts a chord as a I chord when every note is in the major scale and the 3rd is major. Chords with ♭3, ♭7, ♯5 or ♯11 (Cm, C7, C+, Cmaj7♯11) leave the key.</p></div>
  <div><h3>Key ideas</h3><ul><li>Start with the major triad 1 3 5 and add notes from the scale: 6, 7, 9 (= 2), 13 (= 6).</li><li>6/9 = 1 3 5 6 9; maj9 = 1 3 5 7 9; add9 = 1 3 5 9 (no 7th).</li><li>The 4th (11th) is usually avoided: it clashes with the major 3rd.</li><li>Every I chord is in the tonic family and sounds at rest.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play a C major triad, then add A (C6), B (Cmaj7), D (Cadd9) one at a time.</li><li>Find each added note from the root with the interval shapes.</li></ul></div></div>`,
 ifing:`<div class="cols"><div><h3>I chord voicings (C shapes)</h3><div class="scroll"><table><thead><tr><th>Chord</th><th>Low to high</th><th>Strings</th><th>Frets (low E to e)</th></tr></thead><tbody>${tplRows(TPL_I,'C')}</tbody></table></div>
  <p class="small">x = not played. Each shape also exists one string set higher. maj9 and 6/9 voicings leave out the 5th.</p></div>
  <div><h3>Key ideas</h3><ul><li>All of these are movable: the root note names the chord.</li><li>Read a shape by the degree of each note: R, 3, 5, 6, 7 or 9.</li><li>Slide the same shape 2 frets higher and the root, and the chord name, move up a whole step.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7, C6 and Cadd9 with the same root and say which note changes between them.</li><li>Slide Cmaj7 up 2 frets: Dmaj7. Is that the ii chord? (No: ii is minor.)</li></ul></div></div>`,
 ii:`<div class="cols"><div><h3>ii chords in C major (on D)</h3><table class="stack"><thead><tr><th>Chord</th><th>Formula</th><th>Notes</th></tr></thead><tbody>${famRows(2,'D')}</tbody></table>
  <p class="small">All of these notes are in C major. Chords on ii are minor (♭3) and use ♭7, natural 6, 9 and 11; Dm(maj7), Dm7♭5 and Dm7♭9 are not in the key.</p></div>
  <div><h3>Key ideas</h3><ul><li>ii is the 2nd mode (Dorian): its natural 6th (B) is a note of the key, so m6 fits.</li><li>The ♭7 of ii is the tonic of the key: Dm7 contains C.</li><li>The 9th (E) and 11th (G) of ii are the 3rd and 5th of the key.</li><li>ii is a subdominant (predominant) chord that leads to V.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Dm, Dm7, Dm6, Dm9 in turn from the same root and name the note you add each time.</li><li>Play Dm7 → G7 → Cmaj7 and notice how the ii chord prepares V.</li></ul></div></div>`,
 iifing:`<div class="cols"><div><h3>ii chord voicings (D shapes)</h3><div class="scroll"><table><thead><tr><th>Chord</th><th>Low to high</th><th>Strings</th><th>Frets (low E to e)</th></tr></thead><tbody>${tplRows(TPL_II,'D')}</tbody></table></div>
  <p class="small">x = not played. m9 omits the 5th; the four-note m11 omits the 5th and the 9th (so it also reads as m7 with an added 11th).</p></div>
  <div><h3>Key ideas</h3><ul><li>The root of ii is 2 frets above the root of I on the same string.</li><li>Move a minor voicing to the ii root and you are playing the ii chord.</li><li>Name each note by degree: R, ♭3, 5, 6, ♭7, 9, 11.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Cmaj7, then the m7 shape 2 frets higher: Dm7.</li><li>Compare Dm7 and Dm6: only the ♭7 changes to a 6th.</li></ul></div></div>`,
 iii:`<div class="cols"><div><h3>The iii chord in C major (on E)</h3><table class="stack"><thead><tr><th>Tone</th><th>Note</th><th>In C major?</th></tr></thead><tbody>${[['R','1'],['♭3','b3'],['5','5'],['♭7','b7'],['9','9'],['♭9','b9'],['11','11'],['6','6'],['♭13','b13']].map(([l,t])=>{const n=spellF('E',t)[0],inK=spellScale('C').map(pcOf).includes(pcOf(n));return`<tr><td>${l}</td><td>${n}</td><td>${inK?(l==='♭9'||l==='♭13'?'yes, avoid note':'yes'):'no'}</td></tr>`}).join('')}</tbody></table></div>
  <div><h3>Key ideas</h3><ul><li>iii chords are m and m7 (Em, Em7).</li><li>iii is the 3rd mode (Phrygian): its 2nd (♭9) is a half step above the root.</li><li>The ♭9 (F) and ♭13 (C) are in the key but clash with the root and the 5th, so they are avoid notes.</li><li>The natural 9th (F♯) and 6th (C♯) are not in the key, so m9 and m6 do not fit.</li><li>The 11th (A) is in the key and sounds fine added to Em7.</li><li>iii belongs to the tonic family with I and vi.</li></ul>
  <h3 style="margin-top:22px">On your guitar</h3><ul><li>Play Em7 and add F♯: hear it leave the key of C. Then try F: it clashes with E.</li><li>Play Cmaj7 → Em7 and notice how little changes.</li></ul></div></div>`,
 final:`<div class="cols"><div><h3>Before the final check</h3><ul><li>Pass each lesson test first (13/15).</li><li>The final mixes lessons 48–52: 20 questions, pass mark 17.</li></ul></div><div><h3>Next in the course</h3><p>Lessons 53–57 continue with the IV, V, vi and vii chords of the major scale.</p></div></div>`};
