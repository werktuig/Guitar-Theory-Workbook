import json,sys,os
P=json.load(open('src/parts.json'));nav=json.load(open('nav.json')) if os.path.exists('nav.json') else {}
only=[a for a in sys.argv[1:] if a.isdigit()]
head=open('src/head.html').read();a=open('src/core_a.js').read();b=open('src/core_b.js').read()
def link(i,txt): return f'<a href="{nav[i]}" target="_blank" rel="noopener">{txt}</a>' if i in nav else ''
for n,m in P.items():
  if only and n not in only: continue
  if not os.path.exists(f'src/part{n}.js'): continue
  k=int(n);prev,nxt=str(k-1),str(k+1)
  allp=''.join(f'<li>{"<b>"+P[i]["label"]+": "+P[i]["h1"].split(": ",1)[1]+"</b>" if i==n else (link(i,P[i]["label"]+": "+P[i]["h1"].split(": ",1)[1]) or "<span>"+P[i]["label"]+" (coming)</span>")}</li>' for i in P)
  links=(link(prev,'← '+P[prev]['label']) if prev in P else '')+f' <span>{m["label"]}</span> '+(link(nxt,P[nxt]['label']+' →') if nxt in P else '')+f'<details class="allp"><summary>All parts</summary><ol>{allp}</ol></details>'
  page=head.replace('{{TITLE}}',m['title']).replace('{{H1}}',m['h1']).replace('{{INTRO}}',m['intro']+' Video lessons by <a href="https://www.youtube.com/@Moveforwardguitar" target="_blank" rel="noopener" style="color:#fff">Move Forward Guitar</a> on YouTube.').replace('{{NAV}}',links)
  V=open('videos.json').read()
  page+='<script>\n{\nconst VIDEOS='+V+';\n'+a+'\n'+open(f'src/part{n}.js').read()+'\n'+b+'\n}\n</script>\n</body>\n</html>\n'
  open(f'dist/part{n}.html','w').write(page)
print('built')
