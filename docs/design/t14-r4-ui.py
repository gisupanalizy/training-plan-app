"""R4: jeden minimalistyczny Postęp, dwie odmiany ćwiczeń."""
import base64,shutil
_font_dir=base.parent/'fonts'
if out.parent.resolve()!=base.parent.resolve():shutil.copytree(_font_dir,out.parent/'fonts',dirs_exist_ok=True)
_r4_fontface="@font-face{font-family:'Forma Inter';src:url(data:font/woff2;base64,"+base64.b64encode((_font_dir/'InterVariable.woff2').read_bytes()).decode()+") format('woff2');font-weight:100 900;font-style:normal;font-display:swap}"

def progress_screen(v):
 return '''<section class="progress-v4" data-initial-exercise="'''+('pullup' if v=='b' else 'bench')+'''">
 <h1>Postęp</h1>
 <label class="r4-exercise"><span class="r4-sr">Ćwiczenie</span><select data-r4-exercise><option value="bench">Wyciskanie leżąc (Sztanga)</option><option value="pullup">Podciąganie na drążku</option></select></label>
 <div class="r4-metrics" role="tablist" aria-label="Metryka wykresu"></div>
 <section id="r4-chart-panel" role="tabpanel" class="r4-chart-panel"><div class="r4-reading"><strong data-r4-value></strong><span data-r4-caption></span><button type="button" class="r4-method-trigger" aria-label="Jak liczymy szacowany 1RM" aria-expanded="false" aria-controls="r4-method-popover">'''+ico('info')+'''</button></div>
 <aside id="r4-method-popover" class="r4-method-popover" role="note" aria-label="Jak liczymy szacowany 1RM" hidden><strong>Jak liczymy szacowany 1RM?</strong><p>Ciężar serii dzielimy przez współczynnik liczby powtórzeń z tabeli referencyjnej Hevy.</p><p class="r4-formula">100 kg × 3 powt.<br><b>100 ÷ 0,94 ≈ 106,4 kg</b></p><p>Jeden punkt to najwyższy szacunek z serii danego treningu. Uwzględniamy 1–10 powtórzeń; pozostałych serii nie szacujemy.</p><details><summary>Współczynniki dla 1–10 powtórzeń</summary><p>1: 100% · 2: 97% · 3: 94% · 4: 92% · 5: 89% · 6: 86% · 7: 83% · 8: 81% · 9: 78% · 10: 75%</p></details><p>To szacunek, a nie zmierzony rekord. Nie zmienia 1RM wpisanego w profilu.</p></aside>
 <div class="r4-plot-wrap"><svg class="r4-plot" viewBox="0 0 350 220" tabindex="0" role="group" aria-label="Wykres postępu"></svg><output class="r4-point-note" aria-live="polite" hidden></output></div>
 <div class="r4-periods" role="group" aria-label="Zakres czasu">'''+''.join('<button data-r4-range="'+key+'" aria-pressed="'+str(key=='3m').lower()+'">'+label+'</button>' for key,label in [('1m','1M'),('3m','3M'),('6m','6M'),('1y','1R'),('all','Wszystko')])+'''</div><button class="r4-reset" data-r4-reset hidden>Przywróć wybrany zakres</button></section>
 <p class="r4-point-key">Punkt = trening · dotknij, aby zobaczyć wynik</p>
 <div class="r4-record-heading"><h2>Rekordy osobiste</h2><span>Cała historia</span></div><div class="r4-records" tabindex="0" role="region" aria-label="Rekordy osobiste, przewijaj w poziomie"></div>
 <details class="r4-details"><summary>O wykresie i danych</summary><div data-r4-explanation></div><p>Każdy punkt odpowiada treningowi z wpisanym wynikiem. Linia jedynie łączy wpisy, nie dodaje pomiarów pomiędzy nimi. Podpisy osi to orientacyjne daty; dotknięcie punktu pokazuje dokładną datę.</p><p>Dane przykładowe — to nie historia Twojego konta.</p><div class="r4-extra-zoom"><button type="button" data-r4-zoom="in" aria-label="Przybliż wykres">+</button><button type="button" data-r4-zoom="out" aria-label="Oddal wykres">−</button><button type="button" data-r4-zoom="reset">Reset powiększenia</button></div><p>Rozsuń lub zsuń dwa palce na wykresie. Klawiatura: + i − przybliżają, strzałki przesuwają, Home przywraca zakres.</p><fieldset class="r4-custom"><legend>Własny zakres</legend><label>Od<input type="date" name="r4-from" value="2026-01-01"></label><label>Do<input type="date" name="r4-to" value="2026-10-14"></label><button type="button" data-r4-custom>Ustaw daty</button><p data-r4-date-error role="status"></p></fieldset></details></section>'''

extra+=(base.parent/'t14-r4.css').read_text()
_r4_parent_render=render_frame
_r4_js=(base.parent/'t14-r4-interactions.js').read_text()
def render_frame(screen,v='a',si=0,ei=0,phase=0):
 html=_r4_parent_render(screen,v,si,ei,phase)
 if screen!='progress':return html
 html=html.replace(_credits,'').replace('<body>','<body class="progress-r4-page">').replace('</style>',_r4_fontface+'</style>')
 return html.replace('</script>',_r4_js+'</script>')
