/* ===== audio: plucked string (Karplus–Strong) ===== */
let ac=null;
function pluck(m,t0){const sr=ac.sampleRate,fq=440*2**((m-69)/12),len=Math.floor(sr*1.7),b=ac.createBuffer(1,len,sr),d=b.getChannelData(0),N=Math.max(2,Math.round(sr/fq));
  for(let i=0;i<N;i++)d[i]=Math.random()*2-1;
  for(let i=N;i<len;i++)d[i]=.996*.5*(d[i-N]+(i-N-1>=0?d[i-N-1]:0));
  const src=ac.createBufferSource(),gn=ac.createGain(),t=ac.currentTime+t0;src.buffer=b;gn.gain.setValueAtTime(.3,t);gn.gain.linearRampToValueAtTime(0,t+1.65);src.connect(gn).connect(ac.destination);src.start(t)}
/* default: notes one after another, then together (2–6 notes). pm 'seq' = melody only (scales), 'chord' = strum only, 'one' = single note */
function play(ns,mode){if(!ns||!ns.length)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume&&ac.resume();
  if(mode==='one'||ns.length===1)return pluck(ns[0],0);
  if(mode==='chord'){ns.forEach((m,j)=>pluck(m,j*.035));return}
  const step=ns.length>2?.32:.6;ns.forEach((m,j)=>pluck(m,j*step));if(mode!=='seq'&&ns.length<=6)ns.forEach((m,j)=>pluck(m,ns.length*step+.15+j*.03))}catch(e){}}

/* ===== state ===== */
let cur=ORDER[0],mode='practice',sel=new Set(),q=null,done=false,picked=null,st={streak:0,ok:0,n:0},T=null,showHint=false;
let best={};try{best=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){}
const $=id=>document.getElementById(id);
function prep(x){x.found=[];return x}
function gen(fns,seen){for(let k=0;k<40;k++){const x=pick(fns)();if(!seen.has(x.key)){seen.add(x.key);return prep(x)}}return prep(pick(fns)())}
function autoplay(){if(q.hide&&ac)play(q.notes,q.pm)}
function newQ(){const fns=(sel.size?LS[cur].ex.filter((e,i)=>sel.has(i+1)):LS[cur].ex).flatMap(e=>e[1]);q=gen(fns,new Set(q?[q.key]:[]));done=false;picked=null;showHint=false;render();autoplay()}
function startTest(){const seen=new Set();T={qs:shuf(LS[cur].test.map(f=>gen([f],seen))),i:0,a:[],done:false};q=T.qs[0];done=false;picked=null;showHint=false;render();autoplay()}
function setLesson(k,push){cur=k;mode='practice';sel=new Set();T=null;st={streak:0,ok:0,n:0};q=null;if(push!==false)try{history.replaceState(null,'','#'+LS[k].h)}catch(e){location.hash=LS[k].h}$('notes').innerHTML=NOTES[k];newQ()}
const ansLabel=x=>x.type==='choice'?x.ans:x.type==='multi'?`${x.targets.length} spots: ${x.targets.map(posTxt).join(', ')}`:where(x.target.s,x.target.f);
function answer(ok,label,pk){if(done)return;done=true;picked=pk;q.ok=ok;
  if(mode==='practice'){st.n++;if(ok){st.ok++;st.streak++}else st.streak=0}else T.a.push({q,ok,label});
  render();if(q.notes&&q.type!=='click'&&mode==='practice')play(q.notes,q.pm)}
function next(){if(!done)return;
  if(mode==='practice')return newQ();
  if(T.i<T.qs.length-1){T.i++;q=T.qs[T.i];done=false;picked=null;showHint=false;render();if(q.hide)play(q.notes,q.pm);return}
  T.done=true;const sc=T.a.filter(a=>a.ok).length;if(!(best[cur]>=sc)){best[cur]=sc;try{localStorage.setItem(STORE,JSON.stringify(best))}catch(e){}}render();window.scrollTo({top:0,behavior:'smooth'})}

/* ===== fretboard ===== */
const X=f=>f===0?62:90+(f-.5)*60,Y=s=>32+(5-s)*32;
const BASE=(()=>{let h=`<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a26" stop-opacity=".55"/><stop offset=".5" stop-color="#2b1b13" stop-opacity="0"/><stop offset="1" stop-color="#1a0f0a" stop-opacity=".6"/></linearGradient></defs><rect x="40" y="16" width="50" height="192" rx="6" fill="var(--panel)"/><rect x="90" y="16" width="900" height="192" rx="3" fill="#3a2418"/><rect x="90" y="16" width="900" height="192" rx="3" fill="url(#gr)"/>`;
  for(const f of [3,5,7,9,15])h+=`<circle cx="${X(f)}" cy="112" r="7" fill="#e9dfcf" opacity=".85"/>`;
  h+=`<circle cx="${X(12)}" cy="80" r="7" fill="#e9dfcf" opacity=".85"/><circle cx="${X(12)}" cy="144" r="7" fill="#e9dfcf" opacity=".85"/>`;
  for(let f=1;f<=15;f++)h+=`<line x1="${90+f*60}" y1="16" x2="${90+f*60}" y2="208" stroke="#b9b4ab" stroke-width="3"/><line x1="${89+f*60}" y1="16" x2="${89+f*60}" y2="208" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`;
  h+=`<rect x="86" y="14" width="8" height="196" rx="2" fill="#efe7d8"/>`;
  for(let s=0;s<6;s++)h+=`<line x1="40" y1="${Y(s)}" x2="990" y2="${Y(s)}" stroke="#cfc8bd" stroke-width="${(3.2-s*.42).toFixed(2)}"/><text x="20" y="${Y(s)}" fill="var(--mut)" font-size="15" font-weight="600" text-anchor="middle" dominant-baseline="central">${SL[s]}</text>`;
  for(let f=0;f<=15;f++)h+=`<text x="${X(f)}" y="225" fill="var(--mut)" font-size="13" font-weight="${[3,5,7,9,12,15].includes(f)?700:400}" text-anchor="middle">${f}</text>`;
  return h})();
const CELLS=(()=>{let h='';for(let s=0;s<6;s++)for(let f=0;f<=15;f++)h+=`<rect class="cell" data-s="${s}" data-f="${f}" x="${f===0?40:X(f)-30}" y="${Y(s)-16}" width="${f===0?48:60}" height="32"><title>${NN2[pcAt(s,f)]}</title></rect>`;return h})();
function board(ms,box){let h=BASE;
  if(box){const x1=box[0]===0?40:90+(box[0]-1)*60,x2=90+box[1]*60;h+=`<rect class="box" x="${x1}" y="14" width="${x2-x1}" height="196" rx="6"/>`}
  h+=CELLS;
  for(const m of ms)h+=`<g class="mk k-${m.k}"><circle cx="${X(m.f)}" cy="${Y(m.s)}" r="15"/><text x="${X(m.f)}" y="${Y(m.s)}"${String(m.t).length>2?' style="font-size:11px"':''}>${m.t}</text></g>`;
  $('fb').innerHTML=h}

/* ===== render ===== */
const same=(a,b)=>a&&b&&a.s===b.s&&a.f===b.f;
function render(){const L=LS[cur],n=L.test.length;
  $('tabs').innerHTML=ORDER.map(k=>{const b=best[k],p=b>=passMark(LS[k].test.length);return`<button class="tab" role="tab" data-k="${k}" aria-selected="${k===cur}"><b>${LS[k].n}: ${LS[k].title}</b><span>${b==null?'Not tested yet':`Best ${b}/${LS[k].test.length}${p?' · passed':''}`}</span></button>`}).join('');
  $('ttl').textContent=`${L.n}: ${L.title}`;$('sub').textContent=L.sub;
  {const num=(L.n.match(/\d+/)||[])[0],ico='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="5" fill="#fff"/><path d="M10 8.5v7l6-3.5z" fill="#e0561b"/></svg>',lk=(n,t)=>VIDEOS[n]?`<a class="vid" href="https://www.youtube.com/watch?v=${VIDEOS[n]}" target="_blank" rel="noopener">${ico}${t}</a>`:'';
   $('vid').innerHTML=num?lk(num,`Watch lesson ${num} on YouTube`):ORDER.filter(k=>/\d/.test(LS[k].n)).map(k=>{const m=LS[k].n.match(/\d+/)[0];return lk(m,`Lesson ${m}`)}).join('')}
  $('mPr').className=mode==='practice'?'on':'';$('mTe').className=mode==='test'?'on':'';
  $('chips').hidden=mode!=='practice';
  $('chips').innerHTML=['Mix all',...L.ex.map(e=>e[0])].map((c,j)=>{const on=j===0?!sel.size:sel.has(j);return`<button class="chip${on?' on':''}" data-x="${j}" aria-pressed="${on}">${c}</button>`}).join('');
  const fin=mode==='test'&&T&&T.done;$('quiz').hidden=fin;$('result').hidden=!fin;
  if(fin)return result();
  $('status').innerHTML=mode==='practice'?`<span>Exercise mode: hints and explanations as you go</span><span>Streak <b>${st.streak}</b></span><span>Correct <b>${st.ok}/${st.n}</b></span>`:`<span>Test · question <b>${T.i+1}</b> of ${T.qs.length}</span><span>Pass mark ${passMark(n)}/${n}</span><span>Answers are checked at the end</span>`;
  $('prompt').textContent=q.text;
  $('boardWrap').hidden=!!q.noBoard;
  if(!q.noBoard){let ms=q.hide&&!done?[]:q.marks.slice();const pr=mode==='practice';
    if(q.type==='multi')q.found.forEach(p=>ms.push({...p,t:pr?(q.targets.find(t=>same(t,p)).t||'✓'):'•',k:pr?'good':'q'}));
    if(done&&pr){(q.reveal||[]).forEach(r=>ms.push({...r,k:'good'}));
      if(q.type==='click'){if(picked&&!same(picked,q.target))ms.push({...picked,t:'✗',k:'bad'});ms.push({...q.target,t:q.target.t||'✓',k:'good'})}
      if(q.type==='multi'){q.targets.filter(t=>!q.found.some(p=>same(p,t))).forEach(t=>ms.push({...t,t:t.t||'✓',k:'good'}));if(picked)ms.push({...picked,t:'✗',k:'bad'})}}
    if(done&&!pr&&picked&&q.type!=='choice')ms.push({...picked,t:'•',k:'q'});
    board(ms,q.box)}
  $('choices').innerHTML=q.type==='choice'?q.choices.map((c,j)=>{let cl='';if(done){if(mode==='practice'){if(c===q.ans)cl=' good';else if(c===picked)cl=' bad'}else if(c===picked)cl=' sel'}return`<button class="ch${cl}" data-c="${j}"${done?' disabled':''}><kbd>${j+1}</kbd>${c}</button>`}).join(''):'';
  const fb=$('fbk');
  if(done&&mode==='practice')fb.innerHTML=`<b class="${q.ok?'ok':'no'}">${q.ok?'Correct.':'Not quite.'}</b> ${q.explain}`;
  else if(done)fb.textContent='Answer saved. On to the next one.';
  else{let h=showHint?`<b>Hint:</b> ${q.hint}`:'';
    if(q.type==='multi')h+=`${h?'<br>':''}<span class="small">Found ${q.found.length} of ${q.targets.length}. A wrong click ends the question.</span>`;
    else if(q.type==='click'&&!showHint)h='<span class="small">Click a fret on the board to answer.</span>';
    fb.innerHTML=h}
  $('next').disabled=!done;$('next').textContent=mode==='test'&&T.i===T.qs.length-1?'See my results':'Next';
  $('hear').hidden=!(q.notes&&(q.hide||done||mode==='practice'));
  $('hint').hidden=!(mode==='practice'&&!done&&!showHint&&q.hint)}
function result(){const n=T.qs.length,sc=T.a.filter(a=>a.ok).length,pm=passMark(n),pass=sc>=pm,miss=T.a.filter(a=>!a.ok),last=cur===ORDER[ORDER.length-1];
  $('result').innerHTML=`<div class="score"><div class="big">${sc}<small> / ${n}</small></div><div><h3>${pass?(sc===n?'Perfect. You own this lesson.':'Passed. This lesson is solid.'):'Not yet. Review the misses, practise, retake.'}</h3><p>Pass mark ${pm}/${n} · best so far ${best[cur]}/${n}</p><div class="acts"><button class="btn main" id="retake">Retake test</button><button class="btn" id="toPr">Back to practice</button>${pass&&!last?`<button class="btn" id="goNext">Next tab</button>`:''}</div></div></div>`+
  (miss.length?`<h3 style="font-size:26px;margin:28px 0 6px">What to review</h3>`+miss.map(a=>`<div class="miss"><p><b>${a.q.text}</b></p><p class="y">Your answer: ${a.label}</p><p class="c">Correct: ${ansLabel(a.q)}</p><p>${a.q.explain}</p></div>`).join(''):'<p style="margin-top:20px">No mistakes to review.</p>')}

/* ===== events ===== */
document.addEventListener('click',e=>{const t=e.target.closest('button,.cell');if(!t)return;
  if(t.classList.contains('cell')){const s=+t.dataset.s,f=+t.dataset.f,p={s,f};play([midi(s,f)],'one');if(!q||done||(T&&T.done))return;
    if(q.type==='click')answer(same(p,q.target),where(s,f),p);
    else if(q.type==='multi'){if(q.found.some(x=>same(x,p))||q.marks.some(m=>same(m,p)))return;
      if(q.targets.some(x=>same(x,p))){q.found.push(p);q.found.length===q.targets.length?answer(true,'found them all',null):render()}
      else answer(false,`${where(s,f)} (found ${q.found.length} of ${q.targets.length} first)`,p)}
    return}
  if(t.dataset.k)return setLesson(t.dataset.k);
  if(t.dataset.x!=null){const j=+t.dataset.x;if(j===0)sel.clear();else{sel.has(j)?sel.delete(j):sel.add(j);if(sel.size===LS[cur].ex.length)sel.clear()}q=null;return newQ()}
  if(t.dataset.c!=null){const c=q.choices[+t.dataset.c];return answer(c===q.ans,c,c)}
  switch(t.id){case'mPr':if(mode!=='practice'){mode='practice';T=null;q=null;newQ()}break;
   case'mTe':case'retake':mode='test';startTest();break;
   case'toPr':mode='practice';T=null;q=null;newQ();break;
   case'goNext':setLesson(ORDER[ORDER.indexOf(cur)+1]);break;
   case'next':next();break;case'hear':play(q.notes,q.pm);break;case'hint':showHint=true;render();break}});
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea')||e.metaKey||e.ctrlKey||e.altKey)return;if(!q||(T&&T.done))return;
  if(/^[1-4]$/.test(e.key)&&q.type==='choice'&&!done){const c=q.choices[+e.key-1];if(c)answer(c===q.ans,c,c)}
  else if(e.key==='Enter'&&done&&document.activeElement.tagName!=='BUTTON')next();
  else if(e.key.toLowerCase()==='h'&&q.notes&&!$('hear').hidden)play(q.notes,q.pm)});
const fromHash=()=>ORDER.find(k=>'#'+LS[k].h===location.hash)||ORDER[0];
addEventListener('hashchange',()=>{const k=fromHash();if(k!==cur)setLesson(k,false)});
setLesson(fromHash(),false);
