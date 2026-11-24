import sys,random,os
DIST=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist'))
from playwright.sync_api import sync_playwright
def answer(pg):
    ch=pg.locator('#choices .ch:not([disabled])')
    if ch.count(): ch.nth(random.randrange(ch.count())).click(); return
    for _ in range(40):
        if not pg.locator('#next').is_disabled(): return
        s,f=random.randrange(6),random.randrange(16)
        pg.locator(f'.cell[data-s="{s}"][data-f="{f}"]').dispatch_event('click')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    for n in [int(x) for x in sys.argv[1:]] or [1,2,3,4]:
        pg=b.new_page(viewport={'width':1100,'height':900});errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
        pg.goto(f'file://{DIST}/part{n}.html');pg.wait_for_timeout(300)
        tabs=pg.locator('.tab').count()
        for t in range(tabs):
            pg.locator('.tab').nth(t).click()
            chips=pg.locator('.chip').count()
            for c in range(chips):
                pg.locator('.chip').nth(c).click()
                for _ in range(6):
                    h=pg.locator('#hint')
                    if h.is_visible(): h.click()
                    answer(pg); pg.locator('#next').click()
            pg.click('#mTe')
            k=0
            while pg.locator('#quiz').is_visible() and k<30:
                answer(pg); pg.locator('#next').click(); k+=1
            assert pg.locator('#result').is_visible(), 'no result'
            pass
        pg.locator('.tab').nth(0).click()
        
        print(n,'tabs',tabs,'errors',errs[:5])
        m=b.new_page(viewport={'width':375,'height':800});m.goto(f'file://{DIST}/part{n}.html');m.wait_for_timeout(200)
        print(n,'mobile scrollW',m.evaluate('document.documentElement.scrollWidth'));m.close()
    b.close()
