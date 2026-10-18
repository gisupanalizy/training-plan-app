"""Doprecyzowanie mock-upów T14; wykonywane w kontekście generycznego generatora."""
import shutil
_asset_dir=base.parent/'exercise-assets'
_asset_info=json.loads((_asset_dir/'manifest.json').read_text())
if out.parent.resolve()!=base.parent.resolve():
 shutil.copytree(_asset_dir,out.parent/'exercise-assets',dirs_exist_ok=True)
_asset_slugs={e['slug'] for e in _asset_info['assets']}
# Dokładne warianty. Brak dopasowania nigdy nie podstawia podobnego ćwiczenia.
_visuals={
 'przysiad ze sztangą':'squat','przysiad przedni':'front-squat','front squat':'front-squat',
 'wyciskanie leżąc':'bench-press','bench press':'bench-press','wiosłowanie hantlą':'one-arm-dumbbell-row',
 'podciąganie':'pull-up','pull up':'pull-up','bar dip':'dip','dip z obciążeniem':'weighted-dip',
 'chin up z obciążeniem':'weighted-chin-up','martwy ciąg':'deadlift','romanian deadlift':'romanian-deadlift',
 'pike push up':'pike-push-up','hip abduction machine':'hip-abduction-machine','leg press':'leg-press',
 'wyciskanie nad głowę':'overhead-press','side plank':'side-plank','side plank (druga strona)':'side-plank',
 'deska':'plank'}
def iconfor(text):
 key=re.sub(r'\s+',' ',text.lower()).strip()
 return _visuals.get(key,'neutral')
def exicon(key):
 if key in _asset_slugs:
  return f'<img class="movement library-visual" src="exercise-assets/{key}.svg" alt="Ilustracja ćwiczenia z biblioteki Workout Guide" draggable="false">'
 return '<span class="visual-neutral" title="Brak dokładnej ilustracji tego wariantu">ĆW<span>WŁASNE</span></span>'
def summary(ex,ei,editable=False):
 load=ex.get('kg') or ex['intensity'];loadlabel='Obciążenie' if ex.get('kg') else 'Intens. źródłowa'
 label=('Superseria '+ex['code'].split()[0].replace('ss','')) if ex['code'].startswith('ss') else ('Zakres serii' if '–' in normal(ex['count']) else 'Zalecenie z planu')
 content=f'<span class="exercise-top"><span class="thumb">{exicon(iconfor(ex["name"]))}</span><span class="ename"><strong>{E(name(ex))}</strong><small>{E(label)}</small></span>{ico("chevron","chev")}</span><span class="metrics"><span><small>Serie × cel</small><strong>{E(goal(ex))}</strong></span><span><small>{loadlabel}</small><strong>{E(load)}</strong></span><span><small>Przerwa</small><strong>{E(rest(ex))}</strong></span></span>'
 html=f'<article class="exercise"><button class="exercise-open" data-go="detail" data-ex="{ei}" aria-label="Otwórz szczegóły: {E(name(ex))}">{content}</button>'
 if editable:html+='<button class="textbtn edit-series" data-inline>Edytuj serie</button><div class="inline-edit" hidden><label>Serie<input value="'+E(ex['count'])+'"></label><label>Cel<input value="'+E(ex['reps'])+'"></label><button class="btn secondary" data-local>Zastosuj w makiecie</button></div>'
 return html+'</article>'
def inventory(ex,i):
 original='<small>'+E(ex['original'])+'</small>' if name(ex)!=ex['original'] else ''
 return f'<article class="inventory-item"><div class="inventory-title"><span class="inventory-number">{i+1}</span><span class="thumb">{exicon(iconfor(ex["name"]))}</span><span class="inventory-name"><strong>{E(name(ex))}</strong>{original}<small>{E(ex["code"] or ex["group"])}</small></span></div><div class="inventory-tools"><button class="textbtn" data-inline>Zmień nazwę</button><div class="inline-edit" hidden><label>Nazwa ćwiczenia<input value="{E(name(ex))}"></label><button class="btn secondary" data-rename>Zastosuj nazwę</button></div><span class="reorder-controls"><button class="iconbtn" data-reorder="up" aria-label="Przesuń ćwiczenie wcześniej">{ico("back")}</button><button class="iconbtn" data-reorder="down" aria-label="Przesuń ćwiczenie później">{ico("chevron")}</button></span></div></article>'
def prescription_review(ex,i):
 group='<span class="pill">'+E(ex['code'])+'</span>' if ex['code'].startswith('ss') else ''
 load=ex.get('kg') or ex['intensity']
 return '<section class="prescription-review"><h3>'+E(name(ex))+'</h3>'+group+'<div class="prescription-grid"><div><small>Serie × cel</small><strong>'+E(goal(ex))+'</strong></div><div><small>Przerwa</small><strong>'+E(rest(ex))+'</strong></div><div><small>'+('Obciążenie' if ex.get('kg') else 'Intensywność źródłowa')+'</small><strong>'+E(load)+'</strong></div><div><small>Kilogramy</small><strong>'+E(ex.get('kg') or 'Nie podano')+'</strong></div></div><details class="parameter-edit"><summary>Edytuj parametry</summary><div class="inline-edit"><label>Serie<input value="'+E(ex['count'])+'"></label><label>Powtórzenia / czas<input value="'+E(ex['reps'])+'"></label><label>Przerwa<input value="'+E(ex['rest'])+'"></label><label>Obciążenie (kg)<input placeholder="Nie podano" inputmode="decimal"></label><button class="btn secondary" data-local>Zastosuj parametry</button></div></details></section>'
def review_screen(v,si,phase):
 s=data['sessions'][si];ex=s['exercises'][0]
 steps='<div class="review-steps">'+''.join(f'<button data-phase="{i}" aria-current="{"step" if i==phase else "false"}" class="{"on" if i==phase else ""}">{i+1}. {t}</button>' for i,t in enumerate(['Ćwiczenia','Serie','Podsum.']))+'</div>'
 titles=['Nazwy i kolejność','Serie i obciążenia','Cały plan do zatwierdzenia']
 descriptions=['Sprawdź, czy rozpoznano właściwe ćwiczenia. Tu zmieniasz nazwy i kolejność, bez analizowania serii.','Sprawdź serie, cel, intensywność lub kg, przerwy i superserie. Nazwy ćwiczeń zostały przejrzane w kroku 1.','Obejrzyj wszystkie treningi, stan potwierdzeń i pozostałe niejasności przed utworzeniem planu.']
 h='<h1>Sprawdź import</h1><p class="sub">'+E(data['name'])+'</p>'+steps+'<section class="step-purpose"><h2>'+titles[phase]+'</h2><p>'+descriptions[phase]+'</p></section>'
 issue='<details class="issue" '+('open' if phase>0 else '')+'><summary>Interpretacja źródła wymaga wyjaśnienia</summary><p>Znaczenie intensywności %, X oraz UM zachowujemy bez zgadywania. Odpowiedź jest potrzebna przed zatwierdzeniem planu.</p><button class="textbtn" data-inline>Wyjaśnij zapis</button><div class="inline-edit" hidden><label>Znaczenie procentu<select><option>Nie rozstrzygnięto</option>Potwierdzony procent 1RM</option>Intensywność opisowa</option></select></label><button class="btn secondary" data-local>Zapisz odpowiedź w makiecie</button></div></details>'
 if phase==2:
  totals='<div class="review-totals"><div><strong>'+str(len(data['sessions']))+'</strong><small>Treningi</small></div><div><strong>'+str(sum(len(s['exercises']) for s in data['sessions']))+'</strong><small>Ćwiczenia</small></div></div>'
  statuses='<div class="review-checks"><p>Lista ćwiczeń <strong>__EXERCISES_STATUS__</strong></p><p>Parametry serii <strong>__SERIES_STATUS__</strong></p></div>'
  days=''.join('<details class="final-session"><summary>Trening '+E(s['label'])+' · '+str(len(s['exercises']))+' ćwiczeń</summary>'+''.join('<p><strong>'+E(name(e))+'</strong><br>'+E(goal(e))+' · '+E(e['intensity'])+' · '+E(rest(e))+'</p>' for e in s['exercises'])+'</details>' for s in data['sessions'])
  return h+totals+statuses+days+issue+button('Zapisz korektę',None,True,extra='data-info="Symulacja korekty. Bez zapisu do API."')+button('Zatwierdź i utwórz plan',None,extra='disabled aria-describedby="publish-note"')+'<p class="helper" id="publish-note">Najpierw rozwiąż niejasności. Plan nie zostaje utworzony przez samo przejście między krokami.</p>'
 draft=('<div class="inventory-list">'+''.join(inventory(e,i) for i,e in enumerate(s['exercises']))+'</div>') if phase==0 else ''.join(prescription_review(e,i) for i,e in enumerate(s['exercises']))
 nextlabel='Potwierdź ćwiczenia i przejdź do serii' if phase==0 else 'Potwierdź parametry i przejdź do podsumowania'
 nextbutton=button(nextlabel,None,extra=f'data-phase="{phase+1}" data-confirm="{phase}"')
 if v=='a':return h+sessiontabs(si)+draft+(source(ex) if phase==0 else issue)+nextbutton
 if v=='b':
  intro='<div class="note distinct"><strong>'+('Najpierw rozpoznanie ćwiczeń' if phase==0 else 'Najpierw niejasne parametry')+'</strong>'+('Nazwy i kolejność są niezależnym etapem. Zalecenia pojawią się po przejściu do serii.' if phase==0 else 'Wyjaśnij podstawę procentu, potem sprawdź konkretne cele i przerwy.')+'</div>'
  return h+intro+sessiontabs(si)+(issue if phase else '')+draft+source(ex)+nextbutton
 src=f'<img class="source-preview" src="source-{s["page"]}.png" alt="Źródłowa strona PDF">' if data.get('private') else '<div class="source-placeholder"><h3>Oryginał dokumentu</h3><p>Źródło obok wybranej części propozycji.</p></div>'
 return h+sessiontabs(si)+'<div class="tabs"><button data-show-source>Oryginał</button><button data-show-draft class="on">'+('Lista ćwiczeń' if phase==0 else 'Parametry')+'</button></div><section id="source-pane" hidden>'+src+'</section><section id="draft-pane">'+draft+'</section>'+issue+nextbutton

_weight=[60,60,62.5,None,62.5,65,65,67.5]
_dates=['02.09','08.09','14.09','20.09','26.09','02.10','08.10','14.10']
def fmt(x):return str(round(x,2)).replace('.',',').removesuffix(',0')
def line_chart(kind='weight',metric='bench',period='8'):
 values=list(_weight);dates=list(_dates)
 if metric=='squat':values=[v-20 if v is not None else None for v in values]
 if period=='4':values=values[-4:];dates=dates[-4:]
 if kind=='volume':values=[v*15 if v is not None else None for v in values]
 low,high=(0,1200) if kind=='volume' else ((30,60) if metric=='squat' else (50,75))
 title='Objętość porównywalnych serii' if kind=='volume' else 'Największy wpisany ciężar'
 unit='kg·powt.' if kind=='volume' else 'kg'
 xmin,xmax,ymin,ymax=42,310,28,164
 X=lambda i:xmin+i*(xmax-xmin)/(len(values)-1)
 Y=lambda val:ymax-(val-low)*(ymax-ymin)/(high-low)
 grid='';ticks=[low,(low+high)/2,high]
 for val in ticks:
  y=Y(val);grid+=f'<path d="M42 {y:.1f}H310" stroke="#dce3da"/><text x="35" y="{y+4:.1f}" text-anchor="end">{fmt(val)}</text>'
 line='';points=[]
 if kind=='weight':
  segment=[]
  for i,val in enumerate(values):
   if val is None:
    if len(segment)>1:line+='<polyline points="'+' '.join(segment)+'"/>'
    segment=[]
   else:segment.append(f'{X(i):.1f},{Y(val):.1f}')
  if len(segment)>1:line+='<polyline points="'+' '.join(segment)+'"/>'
 for i,val in enumerate(values):
  x=X(i);label=f'{dates[i]} · '+(fmt(val)+' '+unit if val is not None else 'brak danych')
  if val is None:points.append(f'<g><path d="M{x-4} 157l8 8m-8 0 8-8" stroke="#69796a"/><text x="{x}" y="151" text-anchor="middle">brak</text></g>')
  else:
   mark=f'<rect x="{x-10:.1f}" y="{Y(val):.1f}" width="20" height="{ymax-Y(val):.1f}" rx="3"/>' if kind=='volume' else f'<circle cx="{x:.1f}" cy="{Y(val):.1f}" r="5"/>'
   points.append(f'<g tabindex="0" role="button" data-point="{label}" aria-label="{label}">{mark}<circle cx="{x:.1f}" cy="{Y(val):.1f}" r="17" fill="transparent"/></g>')
 dates_svg=''.join(f'<text x="{X(i):.1f}" y="185" text-anchor="middle">{d}</text>' for i,d in enumerate(dates) if len(values)<=4 or i in [0,2,4,7])
 svg=f'<svg class="progress-plot" data-chart="{kind}" viewBox="0 0 330 213" role="img" aria-label="{title}, {unit}, dane demonstracyjne"><g class="axis-text">{grid}<text x="9" y="17">{unit}</text>{dates_svg}<text x="178" y="207" text-anchor="middle">Data treningu</text></g><g fill="none" stroke="#183b31" stroke-width="3">{line}</g><g fill="#183b31">'+''.join(points)+'</g></svg>'
 return '<section class="chart progress-chart"><h2>'+title+'</h2>'+svg+'<p class="chart-readout" role="status">Wybierz punkt, aby zobaczyć wartość.</p><p class="chart-source">Dane demonstracyjne · brak danych nie oznacza zera.</p></section>'
def completion_chart():
 complete=[18,21,20,22];skipped=[2,1,3,0];pending=[4,2,1,2];labels=['21.09','28.09','05.10','12.10'];bars=''
 for i,x in enumerate([75,140,205,270]):
  y=164
  for val,color in [(complete[i],'#183b31'),(skipped[i],'#b09b59'),(pending[i],'#d7dfd2')]:
   h=val/24*130;y-=h;bars+=f'<rect x="{x-14}" y="{y:.1f}" width="28" height="{h:.1f}" fill="{color}"/>'
  bars+=f'<text x="{x}" y="185" text-anchor="middle">{labels[i]}</text>'
 return '<section class="chart progress-chart"><h2>Wymagane serie · ostatnie 4 tygodnie</h2><svg data-chart="completion" class="progress-plot" viewBox="0 0 330 213" role="img" aria-label="Serie wykonane, pominięte i oczekujące, cztery tygodnie, dane demonstracyjne"><g class="axis-text"><path d="M42 34H310M42 99H310M42 164H310" stroke="#dce3da"/><text x="8" y="20">Serie</text><text x="35" y="38" text-anchor="end">24</text><text x="35" y="103" text-anchor="end">12</text><text x="35" y="168" text-anchor="end">0</text>'+bars+'<text x="178" y="207" text-anchor="middle">Tydzień od poniedziałku</text></g></svg><div class="chart-legend"><span><i style="background:#183b31"></i>Wykonane</span><span><i style="background:#b09b59"></i>Pominięte</span><span><i style="background:#d7dfd2"></i>Oczekujące</span></div><p class="chart-source">Dane demonstracyjne · opcjonalne i dodatkowe liczone osobno.</p></section>'
def progress_screen(v):
 controls='<label class="field">Ćwiczenie i wariant<select data-metric><option value="bench">Wyciskanie leżąc · przykład</option><option value="squat">Przysiad przedni · przykład</option></select></label><div class="tabs range-tabs" role="group" aria-label="Okres"><button data-period="4">4 tygodnie</button><button data-period="8" class="on">8 tygodni</button></div>'
 h='<h1>Postęp</h1>'+demo()+controls
 table='<table class="series"><caption>Ostatnie wpisy · przykład</caption><thead><tr><th>Data</th><th>Powt.</th><th>Ciężar</th></tr></thead><tbody><tr><td>14.10</td><td>5</td><td>67,5 kg</td></tr><tr><td>08.10</td><td>5</td><td>65 kg</td></tr><tr><td>02.10</td><td>5</td><td>65 kg</td></tr></tbody></table>'
 strength='<div class="progress-stats"><section><small>Ostatni wpis</small><strong>67,5 kg × 5</strong><span>14 października</span></section><section><small>Zmiana ciężaru</small><strong>+7,5 kg</strong><span>w wybranym okresie</span></section></div>'
 if v=='a':return h+'<div data-chart-slot="weight">'+line_chart()+'</div>'+strength+table+'<p class="source-note">To wpisane wyniki serii, bez wyliczania1RM. Porównuj ten sam wariant i liczbę powtórzeń.</p>'
 if v=='b':return h+'<div data-chart-slot="volume">'+line_chart('volume')+'</div><div class="progress-stats"><section><small>Ostatnia objętość</small><strong>1012,5</strong><span>kg·powt. · 3 serie</span></section><section><small>Wykonanie serii</small><strong>3 z 3</strong><span>serie wymagane</span></section></div><div class="note distinct"><strong>Co jest sumowane?</strong>Wpisane kg × powtórzenia dla porównywalnych serii z obciążeniem zewnętrznym. Braki, masa ciała i asysta nie stają się zerem.</div>'+table
 return h+'<div data-chart-slot="weight">'+line_chart()+'</div>'+strength+completion_chart()+'<div class="separate-counts"><p><span>Opcjonalne · przykład</span><strong>4 z 6</strong></p><p><span>Dodatkowe · przykład</span><strong>2 serie</strong></p></div>'+table
_original_new_screen=new_screen
def new_screen(screen,v,si,phase=0):
 if screen=='review':return review_screen(v,si,phase)
 if screen=='progress':return progress_screen(v)
 return _original_new_screen(screen,v,si,phase)
_original_render_frame=render_frame
_credits='<p class="asset-credit">Ilustracje: <a href="https://github.com/bryllim/workout-guide" target="_blank" rel="noreferrer">Workout Guide · Bryl Lim / Everkinetic</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Oryginalne pliki, bez modyfikacji; pomniejszone w UI. Brak dokładnego wariantu = neutralne oznaczenie.</p>'
extra+='''
.exercise-open{display:block;width:100%;border:0;padding:0;text-align:left;background:none;color:inherit;border-radius:13px}.exercise-open .exercise-top{display:flex}.exercise-open .metrics{display:grid}.exercise-open:hover{background:#f0f5e8}.exercise-open:focus-visible{outline:3px solid #467d27;outline-offset:-3px}.exercise-open .thumb,.detailtitle .thumb{background:#183b31}.library-visual{object-fit:contain;padding:0;transform:scale(1.35)}.thumb{overflow:hidden}.visual-neutral{display:flex;flex-direction:column;align-items:center;justify-content:center;color:#d7f26d;font-weight:800;font-size:17px;line-height:1.2;width:100%;height:100%}.visual-neutral>span{font-size:6px;letter-spacing:.05em;margin-top:4px}.asset-credit{margin-left:18px;margin-right:18px;font-size:10px;line-height:1.5;color:#556259;border-top:1px solid var(--line);padding-top:16px;margin-top:24px}.asset-credit a{text-decoration:underline;text-underline-offset:2px}.private-track{cursor:grab;touch-action:pan-x pan-y;user-select:none}.private-track.is-dragging{cursor:grabbing;scroll-snap-type:none!important;scroll-behavior:auto!important}.private-track img{pointer-events:none}.step-purpose{margin:18px 0 12px}.step-purpose h2{font-size:20px}.step-purpose p{font-size:13px;color:var(--muted);margin-top:8px;line-height:1.55}.inventory-item{padding:13px 0;border-bottom:1px solid var(--line)}.inventory-title{display:flex;gap:10px;align-items:center}.inventory-number{font-size:12px;color:var(--muted);width:14px;flex:none}.inventory-item .thumb{width:44px;height:46px;flex:none;background:#183b31}.inventory-item .movement{width:44px;height:44px}.inventory-name{min-width:0;flex:1}.inventory-name strong{display:block;font-size:15px;line-height:1.35}.inventory-name small{display:block;color:var(--muted);font-size:11px;margin-top:4px;line-height:1.4}.inventory-tools{display:flex;align-items:center;justify-content:space-between;margin-left:24px;flex-wrap:wrap}.inventory-tools>.textbtn{font-size:12px}.inventory-tools .inline-edit{width:100%;order:3}.reorder-controls{display:flex;gap:4px}.reorder-controls .iconbtn{min-width:44px;min-height:44px}.reorder-controls .ico{transform:rotate(90deg);width:17px;height:17px}.prescription-review{background:white;border:1px solid var(--line);border-radius:13px;padding:15px;margin-bottom:12px}.prescription-review h3{font-size:16px;margin:0 0 10px;line-height:1.3}.prescription-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px;margin-top:12px}.prescription-grid small,.prescription-grid strong{display:block}.prescription-grid small{font-size:11px;color:var(--muted);margin-bottom:5px}.prescription-grid strong{font-size:15px}.parameter-edit{border-top:1px solid var(--line);margin-top:15px}.parameter-edit summary{padding-top:12px;min-height:44px;cursor:pointer;font-size:12px;font-weight:700;color:var(--forest)}.review-totals{display:flex;gap:36px;margin:20px 0}.review-totals strong,.review-totals small{display:block}.review-totals strong{font-size:25px}.review-totals small{font-size:12px;color:var(--muted);margin-top:4px}.review-checks{padding:12px;background:var(--tint);border-radius:10px;font-size:12px}.review-checks p{display:flex;justify-content:space-between;gap:8px;margin:4px 0}.final-session{border-bottom:1px solid var(--line);margin-top:8px}.final-session summary{min-height:48px;padding:15px 0;font-size:14px;font-weight:700;cursor:pointer}.final-session p{padding:8px 0;font-size:12px;line-height:1.6}.issue>summary{font-weight:700;min-height:30px;cursor:pointer}.progress-chart h2{font-size:17px}.progress-plot{display:block;width:100%;height:auto;margin-top:14px}.axis-text{fill:#556259;font-size:10px;font-family:Arial,Helvetica,sans-serif}.progress-plot [data-point]{cursor:pointer;outline:none}.progress-plot [data-point]:focus-visible{stroke:#6a8f32;stroke-width:3}.chart-readout{font-size:12px!important;color:var(--forest)!important;min-height:32px;padding:8px 0 0}.chart-source{font-size:10px!important;line-height:1.5;color:var(--muted);margin:6px 0 0!important}.progress-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}.progress-stats small,.progress-stats strong,.progress-stats span{display:block}.progress-stats small{font-size:11px;color:var(--muted)}.progress-stats strong{font-size:20px;letter-spacing:-.025em;margin:8px 0}.progress-stats span{font-size:11px;color:var(--muted);line-height:1.4}.chart-legend{display:flex;flex-wrap:wrap;gap:7px 12px;margin-top:8px;font-size:10px;color:var(--muted)}.chart-legend span{display:flex;align-items:center;gap:5px}.chart-legend i{width:8px;height:8px;border-radius:2px;display:inline-block}.separate-counts{font-size:12px;margin:18px 0}.separate-counts p{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line)}
'''
_r2_script='''
const dragTrack=document.querySelector('.private-track');if(dragTrack){let drag=null,suppressUntil=0;const step=()=>dragTrack.querySelector('.planblock').getBoundingClientRect().width+12;const snap=index=>dragTrack.scrollTo({left:Math.max(0,Math.min(1,index))*step(),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});dragTrack.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:dragTrack.scrollLeft,index:Math.round(dragTrack.scrollLeft/step()),active:false}});dragTrack.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.active=true;dragTrack.classList.add('is-dragging');dragTrack.setPointerCapture(e.pointerId)}if(drag.active){e.preventDefault();dragTrack.scrollLeft=drag.start-dx}});const end=e=>{if(!drag||drag.id!==e.pointerId)return;const current=drag;drag=null;dragTrack.classList.remove('is-dragging');if(current.active){suppressUntil=performance.now()+400;const dx=e.clientX-current.x;snap(current.index+(Math.abs(dx)>45?(dx<0?1:-1):0));if(dragTrack.hasPointerCapture(e.pointerId))dragTrack.releasePointerCapture(e.pointerId)}};dragTrack.addEventListener('pointerup',end);dragTrack.addEventListener('pointercancel',end);dragTrack.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);dragTrack.addEventListener('dragstart',e=>e.preventDefault())}
document.addEventListener('click',e=>{const point=e.target.closest('[data-point]');if(point){const block=point.closest('.chart');block.querySelector('.chart-readout').textContent=point.dataset.point;return}const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-rename')){const article=b.closest('.inventory-item');article.querySelector('.inventory-name strong').textContent=b.parentElement.querySelector('input').value;b.parentElement.hidden=true}else if(b.dataset.reorder){const item=b.closest('.inventory-item'),list=item.parentElement;if(b.dataset.reorder==='up'&&item.previousElementSibling)list.insertBefore(item,item.previousElementSibling);else if(b.dataset.reorder==='down'&&item.nextElementSibling)list.insertBefore(item.nextElementSibling,item);list.querySelectorAll('.inventory-number').forEach((n,i)=>n.textContent=i+1)}});document.addEventListener('keydown',e=>{const p=e.target.closest('[data-point]');if(p&&['Enter',' '].includes(e.key)){e.preventDefault();p.click()}});
let metric='bench',period='8';const redrawCharts=()=>{document.querySelectorAll('[data-chart-slot]').forEach(slot=>{const key=slot.dataset.chartSlot;slot.innerHTML=CHART_VARIANTS[key+':'+metric+':'+period]});document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('on',b.dataset.period===period));document.querySelectorAll('.progress-stats').forEach(block=>{const volume=block.querySelector('small')?.textContent.includes('objętość');if(block.querySelector('strong'))block.querySelector('strong').textContent=volume?(metric==='squat'?'712,5':'1012,5'):(metric==='squat'?'47,5':'67,5')+' kg × 5';if(!volume)block.querySelectorAll('strong')[1].textContent=(period==='4'?'+5 kg':'+7,5 kg')});document.querySelectorAll('.series tbody tr').forEach((row,i)=>{if(row.cells.length===3)row.cells[2].textContent=(metric==='squat'?['47,5','45','45']:['67,5','65','65'])[i]+' kg'})};document.querySelector('[data-metric]')?.addEventListener('change',e=>{metric=e.target.value;redrawCharts()});document.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>{period=b.dataset.period;redrawCharts()}));
'''
def render_frame(screen,v='a',si=0,ei=0,phase=0):
 html=_original_render_frame(screen,v,si,ei,phase)
 charts={f'{kind}:{metric}:{period}':line_chart(kind,metric,period) for kind in ['weight','volume'] for metric in ['bench','squat'] for period in ['4','8']} if screen=='progress' else {}
 return html.replace('</main>',_credits+'</main>').replace('</script>', 'const CHART_VARIANTS='+json.dumps(charts,ensure_ascii=False)+';'+_r2_script+'</script>')
