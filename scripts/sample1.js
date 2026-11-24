const fs=require('fs');const file=process.argv[2];const r=eval(fs.readFileSync(__dirname+'/../src/core_a.js','utf8')+fs.readFileSync(__dirname+'/../src/'+file,'utf8')+';({LS,ORDER,SL})');const SL=r.SL;
const seen=new Set();for(const k of r.ORDER)for(const e of r.LS[k].ex)for(const f of e[1]){if(seen.has(f))continue;seen.add(f);const q=f();
const pos=p=>SL[p.s]+p.f+(p.t?'('+p.t+')':'');
console.log(`[${k}:${f.name}] ${q.text}${q.marks&&q.marks.length?' {'+q.marks.map(pos).join(' ')+'}':''}\n  A: ${q.type==='choice'?q.ans+'  ['+q.choices.filter(c=>c!==q.ans).join(' / ')+']':q.type==='click'?pos(q.target):q.targets.map(pos).join(' ')}\n  E: ${q.explain.replace(/<[^>]+>/g,'')}`)}
