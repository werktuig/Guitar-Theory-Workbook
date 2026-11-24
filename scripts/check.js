// invariant checker: node check.js partN.js
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../src/core_a.js','utf8')+fs.readFileSync(__dirname+'/../src/'+process.argv[2],'utf8')+`
;({LS,ORDER,NOTES})`;
const {LS,ORDER,NOTES}=eval(src);
let bad=0;const ok=(c,m,q)=>{if(!c){bad++;if(bad<25)console.log('FAIL',m,JSON.stringify(q).slice(0,300))}};
const inR=p=>p&&p.s>=0&&p.s<=5&&p.f>=0&&p.f<=15&&Number.isInteger(p.f);
ok(typeof STORE!=='undefined'||true,'');const fns=new Set();for(const k of ORDER){ok(NOTES[k],'notes '+k);LS[k].ex.forEach(e=>e[1].forEach(f=>fns.add(f)));LS[k].test.forEach(f=>fns.add(f))}
for(const f of fns)for(let i=0;i<3000;i++){const q=f();
 ok(q&&q.text&&q.key&&q.explain,'basic '+f.name,q);if(!q)continue;
 ok(!/undefined|NaN|null/.test(q.text+q.explain+(q.hint||'')+JSON.stringify(q.choices||'')),'undef '+f.name,q);
 (q.marks||[]).forEach(m=>ok(inR(m),'mark '+f.name,q));(q.reveal||[]).forEach(m=>ok(inR(m),'reveal '+f.name,q));
 if(q.type==='choice'){ok(q.choices.includes(q.ans),'ans '+f.name,q);ok(new Set(q.choices).size===q.choices.length&&q.choices.length>=2,'dup '+f.name,q);ok(!q.noBoard||!(q.marks||[]).length,'nb')}
 if(q.type==='click')ok(inR(q.target)&&!(q.marks||[]).some(m=>m.s===q.target.s&&m.f===q.target.f),'target '+f.name,q);
 if(q.type==='multi'){ok(q.targets.length>=1&&q.targets.every(inR),'targets '+f.name,q);ok(new Set(q.targets.map(t=>t.s+'-'+t.f)).size===q.targets.length,'tdup '+f.name,q);ok(!q.targets.some(t=>(q.marks||[]).some(m=>m.s===t.s&&m.f===t.f)),'t-on-mark '+f.name,q)}
 (q.notes||[]).forEach(n=>ok(Number.isInteger(n)&&n>=40&&n<=100,'note '+f.name,q));
 ok(!q.pm||['seq','chord','one'].includes(q.pm),'pm '+f.name,q);ok(!q.box||(q.box[0]>=0&&q.box[1]<=15&&q.box[0]<=q.box[1]),'box '+f.name,q);ok(['choice','click','multi'].includes(q.type),'type '+f.name,q);
 if(q.type==='choice')ok(q.choices.length<=4,'max4 '+f.name,q);
}
for(const k of ORDER)console.log(k,'test len',LS[k].test.length);
console.log(bad?bad+' failures':'ALL OK',[...fns].length,'generators');
