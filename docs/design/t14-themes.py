"""Osobna galeria kolorów; uruchamiana przez t14-full-build.py z tym samym modelem."""
PALETTES=[
 dict(id='forest',name='Las',description='Obecna paleta. Spokojna zieleń, jasne tło i limonkowy akcent.',paper='#f6f7f2',surface='#ffffff',ink='#1c2420',muted='#556259',line='#dce3da',tint='#eaf0e7',primary='#183b31',accent='#d7f26d',onPrimary='#ffffff',onAccent='#183b31',hero='#183b31',heroInk='#ffffff',heroMuted='#d6e4d9',focus='#467d27',control='#73836c',hover='#2a5344',softHover='#e2ebdc',warning='#f2eedb',warningInk='#65551a',success='#36632d',skipped='#91792d',pending='#8a9882',illustration='#183b31',scheme='light'),
 dict(id='cobalt',name='Kobalt',description='Chłodna i precyzyjna. Wyraźny niebieski prowadzi do głównych działań.',paper='#f5f7fb',surface='#ffffff',ink='#18273b',muted='#52637b',line='#d7dfeb',tint='#e8eef8',primary='#164cb5',accent='#dce8ff',onPrimary='#ffffff',onAccent='#163e87',hero='#173e88',heroInk='#ffffff',heroMuted='#dae6ff',focus='#164cb5',control='#74829b',hover='#103b91',softHover='#dbe5f5',warning='#fff0d5',warningInk='#775017',success='#266448',skipped='#977531',pending='#7a8b9d',illustration='#173e88',scheme='light'),
 dict(id='copper',name='Miedź',description='Cieplejsza i łagodniejsza. Papierowe tło i mocna, miedziana akcja.',paper='#fcf8f3',surface='#ffffff',ink='#30241f',muted='#705c51',line='#e5d9cd',tint='#f3e8de',primary='#87472f',accent='#f4d8ad',onPrimary='#ffffff',onAccent='#62361f',hero='#6c3828',heroInk='#fffaf4',heroMuted='#f0ded2',focus='#8d4d30',control='#957563',hover='#6f3724',softHover='#ead8c8',warning='#f7edce',warningInk='#6d5217',success='#3d653b',skipped='#94713f',pending='#998b7a',illustration='#6c3828',scheme='light'),
 dict(id='ocean',name='Morska',description='Świeża i spokojna. Petrolowe działania oraz jasne, chłodne powierzchnie.',paper='#f3f8f9',surface='#ffffff',ink='#182f36',muted='#4f6870',line='#d4e4e6',tint='#e3f0f1',primary='#075d68',accent='#c8edf0',onPrimary='#ffffff',onAccent='#104c55',hero='#104c55',heroInk='#ffffff',heroMuted='#d2ebee',focus='#075d68',control='#70898e',hover='#064c56',softHover='#d4e9eb',warning='#f5edcf',warningInk='#70551c',success='#236749',skipped='#95732d',pending='#7d9395',illustration='#104c55',scheme='light'),
 dict(id='graphite',name='Grafit',description='Neutralna i oszczędna. Kolor ustępuje miejsca treści i kontrastowi.',paper='#f5f5f4',surface='#ffffff',ink='#252525',muted='#606060',line='#ddddda',tint='#eaeae7',primary='#303236',accent='#eceec5',onPrimary='#ffffff',onAccent='#303236',hero='#303236',heroInk='#ffffff',heroMuted='#e1e2e4',focus='#50545a',control='#81817c',hover='#1c1d20',softHover='#dedfdb',warning='#f5edd4',warningInk='#6b541c',success='#3c6246',skipped='#89733b',pending='#8c8f89',illustration='#303236',scheme='light'),
 dict(id='night',name='Noc',description='Na ciemniejsze otoczenie. Grafitowe powierzchnie i bursztynowe działania.',paper='#11181f',surface='#1c262f',ink='#f1f3f5',muted='#b5c1cc',line='#3a4854',tint='#293641',primary='#f2c66b',accent='#f2c66b',onPrimary='#282012',onAccent='#282012',hero='#293641',heroInk='#f1f3f5',heroMuted='#d0dbe3',focus='#f2c66b',control='#7d8d9b',hover='#ffdc8c',softHover='#344652',warning='#3c311c',warningInk='#f5d693',success='#a5d7ac',skipped='#d6b37b',pending='#8195a3',illustration='#293641',scheme='dark'),
]
# Mapowanie semantyczne istniejących kolorów. Nie zmienia wymiarów ani treści.
COLOR_ROLES={
 '#1c2420':'ink','#556259':'muted','#dce3da':'line','#f6f7f2':'paper','#d7f26d':'accent','#183b31':'primary','#eaf0e7':'tint','#fff':'surface',
 '#467d27':'focus','#627c43':'success','#658a2b':'success','#b9c5b5':'line','#36632d':'success','#3b6c43':'success','#95a58f':'control',
 '#2c5146':'hero','#c5d0bf':'line','#f4f7ed':'softHover','#2a5344':'hover','#c9e45f':'accent','#dce7d5':'softHover',
 '#d7e5db':'heroMuted','#d6e4d9':'heroMuted','#9dae95':'control','#92a283':'control','#5b7c3d':'success','#45604c':'hero',
 '#f0f5e8':'softHover','#6a8f32':'focus','#69796a':'muted','#b09b59':'skipped','#d7dfd2':'pending','#f2eedb':'warning','#65551a':'warningInk'}
THEME_CSS='''
:root{color-scheme:__SCHEME__}body{background:var(--paper);color:var(--ink)}
.btn{color:var(--on-primary)}.btn.secondary{color:var(--primary);background:var(--surface);border-color:var(--control)}
.btn.light,.planblock .btn,.private-track .btn,.homeplan .btn{background:var(--accent);color:var(--on-accent)}
.planblock,.feature-training,.login-band,.topband{background:var(--hero);color:var(--hero-ink)}
.planblock p,.planblock .desc,.planmeta,.feature-training p,.login-band p{color:var(--hero-muted)}
.private-track .sampleplan{background:var(--hero)}.thumb,.exercise-open .thumb,.detailtitle .thumb,.inventory-item .thumb{background:var(--illustration)}
.visual-neutral{color:var(--accent)}.exercise,.inline-detail,.sheet,.rounds button,.chart,.login-panel,.source-grid button,.dropzone{background:var(--surface)}
.tabs .on,.rounds .on{background:var(--surface);color:var(--primary)}.bottomnav .active{color:var(--primary)}
.fields input,.field input,.field select,.inline-edit input,.inline-edit select{background:var(--surface);color:var(--ink);border-color:var(--control);caret-color:var(--primary)}
input::placeholder{color:var(--muted);opacity:1}.btn:disabled{background:var(--tint);color:var(--muted)}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.exercise-open:focus-visible{outline-offset:-3px}.axis-text{fill:var(--muted)}.chart-legend i{outline:1px solid var(--muted)}
::selection{background:var(--accent);color:var(--on-accent)}*{scrollbar-color:var(--control) var(--paper);font-variant-numeric:tabular-nums}
'''


def theme_frame(html,p):
 html=re.sub(r'#[0-9a-fA-F]{3,8}\b',lambda m:p[COLOR_ROLES[m[0].lower()]] if m[0].lower() in COLOR_ROLES else m[0],html)
 html=html.replace('background:white','background:'+p['surface']).replace('color:white','color:'+p['heroInk'])
 roles={'surface':'surface','on-primary':'onPrimary','on-accent':'onAccent','hero':'hero','hero-ink':'heroInk','hero-muted':'heroMuted','illustration':'illustration','control':'control','focus':'focus'}
 variables=':root{'+''.join('--'+key+':'+p[value]+';' for key,value in roles.items())+'}'
 return html.replace('</style>',variables+THEME_CSS.replace('__SCHEME__',p['scheme'])+'</style>')
