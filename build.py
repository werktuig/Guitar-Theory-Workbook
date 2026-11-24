"""Build every part twice:
  dist/partN.html  - for the claude.ai artifacts (parts link to each other's artifact URLs from nav.json)
  docs/partN.html  - for GitHub Pages (parts link to each other inside the site), plus docs/index.html
Usage: python3 build.py [N ...]   (no numbers = all parts)
"""
import json,sys,os,html
P=json.load(open('src/parts.json'));nav=json.load(open('nav.json')) if os.path.exists('nav.json') else {}
only=[a for a in sys.argv[1:] if a.isdigit()]
head=open('src/head.html').read();A=open('src/core_a.js').read();B=open('src/core_b.js').read();V=open('videos.json').read()
os.makedirs('dist',exist_ok=True);os.makedirs('docs',exist_ok=True)
name=lambda i:P[i]["h1"].split(": ",1)[1]
YT='<a href="https://www.youtube.com/@Moveforwardguitar" target="_blank" rel="noopener" >Move Forward Guitar</a>'

def page(n,link):
  m=P[n];k=int(n);prev,nxt=str(k-1),str(k+1)
  allp=''.join(f'<li>{"<b>"+P[i]["label"]+": "+name(i)+"</b>" if i==n else (link(i,P[i]["label"]+": "+name(i)) or "<span>"+P[i]["label"]+" (coming)</span>")}</li>' for i in P)
  links=(link(prev,'← '+P[prev]['label']) if prev in P else '')+f' <span>{m["label"]}</span> '+(link(nxt,P[nxt]['label']+' →') if nxt in P else '')+f'<details class="allp"><summary>All parts</summary><ol>{allp}</ol></details>'
  out=head.replace('{{TITLE}}',m['title']).replace('{{H1}}',m['h1']).replace('{{INTRO}}',m['intro']+f' Video lessons by {YT} on YouTube.').replace('{{NAV}}',links)
  return out+'<script>\n{\nconst VIDEOS='+V+';\n'+A+'\n'+open(f'src/part{n}.js').read()+'\n'+B+'\n}\n</script>\n</body>\n</html>\n'

art_link=lambda i,t:f'<a href="{nav[i]}" target="_blank" rel="noopener">{t}</a>' if i in nav else ''
site_link=lambda i,t:f'<a href="part{i}.html">{t}</a>' if os.path.exists(f'src/part{i}.js') else ''

for n in P:
  if only and n not in only: continue
  if not os.path.exists(f'src/part{n}.js'): continue
  open(f'dist/part{n}.html','w').write(page(n,art_link))
  open(f'docs/part{n}.html','w').write(page(n,site_link).replace('<nav class="parts" aria-label="Workbook parts">','<nav class="parts" aria-label="Workbook parts"><a href="index.html">Home</a> ',1))

# landing page for GitHub Pages
rows=''.join(f'<a class="card" href="part{i}.html"><span class="n">{P[i]["label"]}</span><b>{html.escape(name(i))}</b><span class="l">{html.escape(" · ".join(x.split(". ",1)[1] for x in P[i].get("lessons",[]))) or html.escape(P[i]["intro"].split(": ",1)[1].rstrip(".").replace("<em>","").replace("</em>",""))}</span></a>' for i in P if os.path.exists(f'src/part{i}.js'))
idx=f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guitar Theory Workbook</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<style>
:root{{color-scheme:light dark;--bg:light-dark(#ffffff,#111214);--ink:light-dark(#121212,#f1efea);--mut:light-dark(#5f5f5f,#a7a7a7);--line:light-dark(#dcdcdc,#2e2f33);--acc:light-dark(#1f3fd6,#8ea2ff)}}
*{{box-sizing:border-box;min-width:0}}body{{margin:0;background:var(--bg);color:var(--ink);font:16.5px/1.55 "DM Sans",system-ui,sans-serif}}
header{{padding:clamp(36px,6vw,80px) 0 clamp(28px,4vw,44px);border-bottom:1px solid var(--ink)}}.wrap{{max-width:1200px;margin:0 auto;padding:0 max(5vw,16px)}}
h1{{font:500 clamp(48px,8vw,96px)/.96 "Fraunces",Georgia,serif;letter-spacing:-.025em;margin:0}}header p{{max-width:62ch;color:var(--mut);margin:18px 0 0}}header a{{color:var(--ink)}}
main{{max-width:1200px;margin:0 auto;padding:clamp(22px,4vw,48px) max(5vw,16px);display:grid;grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr));gap:0 32px}}
.card{{display:flex;flex-direction:column;gap:4px;padding:20px 0 22px;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}}
.card:hover b{{color:var(--acc)}}.card:focus-visible{{outline:3px solid var(--acc);outline-offset:2px}}.card .n{{font-size:12.5px;color:var(--acc);font-weight:600;letter-spacing:.01em}}.card b{{font:500 25px/1.1 "Fraunces",Georgia,serif;letter-spacing:-.01em}}.card .l{{font-size:14px;color:var(--mut)}}
footer{{max-width:1200px;margin:0 auto;padding:0 max(5vw,16px) 40px;color:var(--mut);font-size:14px}}footer a{{color:var(--ink)}}
</style></head><body>
<header><div class="wrap"><h1>Guitar Theory Workbook</h1><p>Practice exercises and tests for all 116 lessons of <em>Music Theory for Guitar</em>. Video lessons by {YT} on YouTube. Each part has an interactive fretboard, practice with hints, a 15-question test per lesson and a final check.</p></div></header>
<main>{rows}</main>
<footer>Scores are saved in your browser only. Source: <a href="https://github.com/werktuig/Guitar-Theory-Workbook">werktuig/Guitar-Theory-Workbook</a>.</footer>
</body></html>
'''
open('docs/index.html','w').write(idx)
open('docs/.nojekyll','w').write('')
print('built')
