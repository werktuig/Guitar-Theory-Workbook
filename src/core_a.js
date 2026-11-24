/* ===== shared helpers ===== */
const OPEN=[40,45,50,55,59,64],SN=['low E','A','D','G','B','high e'],SL=['E','A','D','G','B','e'];
const NN=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const NN2=['C','C♯/D♭','D','D♯/E♭','E','F','F♯/G♭','G','G♯/A♭','A','A♯/B♭','B'];
const IV=[['P1','unison'],['m2','minor 2nd'],['M2','major 2nd'],['m3','minor 3rd'],['M3','major 3rd'],['P4','perfect 4th'],['TT','tritone (aug 4th / dim 5th)'],['P5','perfect 5th'],['m6','minor 6th'],['M6','major 6th'],['m7','minor 7th'],['M7','major 7th'],['P8','octave']];
const CUE=['','“Jaws” theme','“Happy Birthday” (“-py” → “Birth-”)','“Greensleeves” opening','“When the Saints Go Marching In”','“Here Comes the Bride”','“The Simpsons” theme','“Star Wars” main theme leap','“The Entertainer” (high-note leap)','“My Bonnie Lies Over the Ocean”','original “Star Trek” theme','“Take On Me” chorus leap','“Somewhere Over the Rainbow”'];
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[R(0,a.length-1)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const nm=i=>IV[i][1],ab=i=>IV[i][0],cap=s=>s[0].toUpperCase()+s.slice(1);
const gap=(a,b)=>OPEN[b]-OPEN[a],pcAt=(s,f)=>(OPEN[s]+f)%12,note=(s,f)=>NN[pcAt(s,f)],midi=(s,f)=>OPEN[s]+f;
const fr=n=>n===1?'1 fret':n+' frets';
const fretTxt=f=>f?'fret '+f:'open';
const posTxt=t=>`${SL[t.s]} string ${fretTxt(t.f)}`;
const where=(s,f)=>`${note(s,f)} on the ${SN[s]} string, ${fretTxt(f)}`;
const offTxt=d=>d===0?'same fret':`${fr(Math.abs(d))} ${d>0?'higher':'lower'}`;
const mc=(ans,pool)=>shuf([ans,...shuf([...new Set(pool)].filter(x=>x!==ans)).slice(0,3)]);
const near=i=>[i-3,i-2,i-1,i+1,i+2,i+3].filter(x=>x>=1&&x<=12).sort((a,b)=>Math.abs(a-i)-Math.abs(b-i)).slice(0,4).map(nm);
const crossGB=(a,b)=>a<=3&&b>=4;
const art=w=>/^(octave|aug|unison|11th|8th|18th|eleventh|eighth)/i.test(w)?'an':'a';
const rep=(f,n)=>Array(n).fill(f);
const passMark=n=>Math.ceil(n*.85);
const ord=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');
/* every (string,fret) on frets lo..hi whose pitch class is pc */
const allPc=(pc,strings=[0,1,2,3,4,5],lo=0,hi=15)=>{const o=[];for(const s of strings)for(let f=lo;f<=hi;f++)if(pcAt(s,f)===pc)o.push({s,f});return o};
/* every (string,fret) sounding exactly midi m */
const allMidi=m=>{const o=[];for(let s=0;s<6;s++){const f=m-OPEN[s];if(f>=0&&f<=15)o.push({s,f})}return o};
/* fret on string s2 that sounds `semis` above (s1,f) */
const shapeFret=(s1,f,s2,semis)=>f+semis-gap(s1,s2);

/* ===== note spelling and keys ===== */
const LET='CDEFGAB',LPC=[0,2,4,5,7,9,11],MAJ=[0,2,4,5,7,9,11];
const ACC={'':0,'♯':1,'♭':-1,'𝄪':2,'𝄫':-2};
const pcOf=n=>(LPC[LET.indexOf(n[0])]+ACC[n.slice(1)]+12)%12;
const accTxt=a=>({0:'',1:'♯',[-1]:'♭',2:'𝄪',[-2]:'𝄫'})[a];
function spellScale(k){const li=LET.indexOf(k[0]),rpc=pcOf(k);return MAJ.map((iv,d)=>{const L=(li+d)%7,pc=(rpc+iv)%12,a=((pc-LPC[L]+18)%12)-6;return LET[L]+accTxt(a)})}
/* key name -> signature count (+ sharps, − flats) */
const KS=[['C',0],['G',1],['D',2],['A',3],['E',4],['B',5],['F♯',6],['C♯',7],['F',-1],['B♭',-2],['E♭',-3],['A♭',-4],['D♭',-5],['G♭',-6],['C♭',-7]];
const KEASY=KS.filter(k=>Math.abs(k[1])<=6&&k[0]!=='G♭').map(k=>k[0]); /* 12 practical keys, F♯ used for 6 sharps */
const SHARPS=['F♯','C♯','G♯','D♯','A♯','E♯','B♯'],FLATS=['B♭','E♭','A♭','D♭','G♭','C♭','F♭'];
const sigOf=k=>KS.find(x=>x[0]===k)[1];
const sigTxt=n=>n===0?'no sharps or flats':n>0?`${n} sharp${n>1?'s':''} (${SHARPS.slice(0,n).join(' ')})`:`${-n} flat${n<-1?'s':''} (${FLATS.slice(0,-n).join(' ')})`;
/* name of the note at (s,f) inside key k, or null if not in key */
const inKey=(k,s,f)=>{const sc=spellScale(k),i=sc.findIndex(n=>pcOf(n)===pcAt(s,f));return i<0?null:{deg:i+1,name:sc[i]}};
const keyPositions=(k,strings,lo,hi)=>{const o=[];for(const s of strings)for(let f=lo;f<=hi;f++){const x=inKey(k,s,f);if(x)o.push({s,f,t:x.deg===1?'R':String(x.deg),name:x.name,deg:x.deg})}return o};
const rootFret=(k,s,lo=0)=>{const pc=pcOf(k);for(let f=lo;f<=15;f++)if(pcAt(s,f)===pc)return f;return-1};

/* static question bank: [text, answer, distractors, explanation, hint?] */
const sbank=(pre,items)=>()=>{const i=R(0,items.length-1),[text,ans,dis,explain,hint]=items[i];return{type:'choice',noBoard:true,key:pre+i,text,ans,choices:mc(ans,dis),explain,hint:hint||'Think it through on your guitar before you choose.'}};

/* ===== formulas: chords, scales, modes (letter-correct spelling) ===== */
/* formula string like '1 b3 5 b7' or '1 2 b3 4 5 b6 7'; degrees > 7 allowed (9, 11, 13) */
const fml=f=>f.split(' ').map(t=>{const m=t.match(/^(bb|b|#|x)?(\d+)$/),d=+m[2],a={bb:-2,b:-1,'#':1,x:2}[m[1]]||0;return[(d-1)%7,MAJ[(d-1)%7]+12*Math.floor((d-1)/7)+a]});
const fmlSemis=f=>fml(f).map(x=>x[1]);
function spellSteps(root,steps){const li=LET.indexOf(root[0]),rpc=pcOf(root);return steps.map(([l,st])=>{const L=(li+l)%7,pc=(rpc+st)%12,a=((pc-LPC[L]+18)%12)-6;return Math.abs(a)<=2?LET[L]+accTxt(a):NN[pc]})}
const spellF=(root,f)=>spellSteps(root,fml(f));
const CHORDS={
 maj:{f:'1 3 5',sym:'',name:'major'},min:{f:'1 b3 5',sym:'m',name:'minor'},dim:{f:'1 b3 b5',sym:'°',name:'diminished'},aug:{f:'1 3 #5',sym:'+',name:'augmented'},
 sus2:{f:'1 2 5',sym:'sus2',name:'suspended 2nd'},sus4:{f:'1 4 5',sym:'sus4',name:'suspended 4th'},pow:{f:'1 5',sym:'5',name:'power chord'},
 maj7:{f:'1 3 5 7',sym:'maj7',name:'major 7th'},dom7:{f:'1 3 5 b7',sym:'7',name:'dominant 7th'},m7:{f:'1 b3 5 b7',sym:'m7',name:'minor 7th'},
 m7b5:{f:'1 b3 b5 b7',sym:'m7♭5',name:'half-diminished (m7♭5)'},dim7:{f:'1 b3 b5 bb7',sym:'°7',name:'diminished 7th'},mMaj7:{f:'1 b3 5 7',sym:'m(maj7)',name:'minor-major 7th'},
 aug7:{f:'1 3 #5 b7',sym:'+7',name:'augmented 7th'},augMaj7:{f:'1 3 #5 7',sym:'+maj7',name:'augmented major 7th'},
 maj6:{f:'1 3 5 6',sym:'6',name:'major 6th'},m6:{f:'1 b3 5 6',sym:'m6',name:'minor 6th'},sus47:{f:'1 4 5 b7',sym:'7sus4',name:'7sus4'},
 add9:{f:'1 3 5 9',sym:'add9',name:'add 9'},maj9:{f:'1 3 5 7 9',sym:'maj9',name:'major 9th'},dom9:{f:'1 3 5 b7 9',sym:'9',name:'dominant 9th'},m9:{f:'1 b3 5 b7 9',sym:'m9',name:'minor 9th'},
 m11:{f:'1 b3 5 b7 9 11',sym:'m11',name:'minor 11th'},dom13:{f:'1 3 5 b7 9 13',sym:'13',name:'dominant 13th'},maj13:{f:'1 3 5 7 9 13',sym:'maj13',name:'major 13th'}};
const SCALES={
 major:{f:'1 2 3 4 5 6 7',name:'major'},ionian:{f:'1 2 3 4 5 6 7',name:'Ionian'},dorian:{f:'1 2 b3 4 5 6 b7',name:'Dorian'},phrygian:{f:'1 b2 b3 4 5 b6 b7',name:'Phrygian'},
 lydian:{f:'1 2 3 #4 5 6 7',name:'Lydian'},mixolydian:{f:'1 2 3 4 5 6 b7',name:'Mixolydian'},aeolian:{f:'1 2 b3 4 5 b6 b7',name:'Aeolian'},locrian:{f:'1 b2 b3 4 b5 b6 b7',name:'Locrian'},
 minor:{f:'1 2 b3 4 5 b6 b7',name:'natural minor'},majPent:{f:'1 2 3 5 6',name:'major pentatonic'},minPent:{f:'1 b3 4 5 b7',name:'minor pentatonic'},
 blues:{f:'1 b3 4 b5 5 b7',name:'blues'},majBlues:{f:'1 2 b3 3 5 6',name:'major blues'},melMinor:{f:'1 2 b3 4 5 6 7',name:'melodic minor'},harmMinor:{f:'1 2 b3 4 5 b6 7',name:'harmonic minor'},
 wholeTone:{f:'1 2 3 #4 #5 b7',name:'whole tone'},dimWH:{f:'1 2 b3 4 b5 #5 6 7',name:'whole-half diminished'},dimHW:{f:'1 b2 #2 3 #4 5 6 b7',name:'half-whole diminished'}};
const MODES=['ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian'];
const chordNotes=(root,q)=>spellF(root,CHORDS[q].f);
const chordSym=(root,q)=>root+CHORDS[q].sym;
const scaleNotes=(root,sc)=>spellF(root,SCALES[sc].f);
/* identify chord quality from semitones above root (mod 12), e.g. [0,4,7] -> 'maj' */
const qualityOf=semis=>{const k=[...new Set(semis.map(x=>((x%12)+12)%12))].sort((a,b)=>a-b).join();return Object.keys(CHORDS).find(q=>[...new Set(fmlSemis(CHORDS[q].f).map(x=>x%12))].sort((a,b)=>a-b).join()===k)||null};
const ROMAN=['I','II','III','IV','V','VI','VII'];
const romanOf=(deg,q)=>{const r=ROMAN[deg-1],lo=r.toLowerCase();return({maj:r,min:lo,dim:lo+'°',aug:r+'+',maj7:r+'maj7',dom7:r+'7',m7:lo+'7',m7b5:lo+'ø7',dim7:lo+'°7',mMaj7:lo+'(maj7)',augMaj7:r+'+maj7'})[q]||r};
/* stack 3rds on each degree of a 7-note scale: size 3 = triads, 4 = 7th chords */
function diatonic(root,sc='major',size=3){const n=scaleNotes(root,sc),s=fmlSemis(SCALES[sc].f);return n.map((x,i)=>{const idx=[0,2,4,6].slice(0,size).map(o=>(i+o)%7),semis=idx.map(j=>((s[j]-s[i])%12+12)%12),q=qualityOf(semis);return{deg:i+1,root:x,notes:idx.map(j=>n[j]),q,sym:x+(CHORDS[q]?CHORDS[q].sym:'?'),roman:romanOf(i+1,q)}})}
/* fretboard positions of a set of pitch classes */
const pcsPositions=(pcs,strings=[0,1,2,3,4,5],lo=0,hi=15)=>{const o=[];for(const s of strings)for(let f=lo;f<=hi;f++)if(pcs.includes(pcAt(s,f)))o.push({s,f});return o};
/* find a voicing: strings[i] must play pitch class pcs[i]; all frets in lo..hi, max fret span ≤ span (open strings ignored for span if allowOpen). Returns [{s,f}] or null; picks the lowest-fret solution. */
function voicing(strings,pcs,lo=0,hi=15,span=4,allowOpen=false){let best=null;const cand=strings.map((s,i)=>{const o=[];for(let f=lo;f<=hi;f++)if(pcAt(s,f)===pcs[i])o.push(f);return o});
  const rec=(i,acc)=>{if(i===strings.length){const fs=acc.filter(f=>!(allowOpen&&f===0)),sp=fs.length?Math.max(...fs)-Math.min(...fs):0;if(sp<=span-1){const sc=Math.max(...acc);if(!best||sc<best.sc)best={sc,v:acc.slice()}}return}for(const f of cand[i]){acc.push(f);rec(i+1,acc);acc.pop()}};
  rec(0,[]);return best?best.v.map((f,i)=>({s:strings[i],f})):null}
/* string sets for 3- and 4-note voicings, low to high */
const SETS3=[[0,1,2],[1,2,3],[2,3,4],[3,4,5]],SETS4=[[0,1,2,3],[1,2,3,4],[2,3,4,5]];
const setName=st=>st.map(s=>SL[s]).join('');
/* inversion name for a 3-note or 4-note chord */
const INV=['root position','1st inversion','2nd inversion','3rd inversion'];
const pickKey=()=>pick(KEASY);
const relMinor=k=>spellScale(k)[5];
