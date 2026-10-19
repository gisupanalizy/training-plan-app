"""T14-R3: wybrane ekrany, pełny edytor ćwiczenia i nowe propozycje Postępu."""
_r3_base_new=new_screen
_r3_review=review_screen
def review_screen(v,si,phase):
 return _r3_review(v,si,phase).replace('Nazwy i kolejność','Nazwy ćwiczeń i kolejność')

def editor_screen(si):
 s=data['sessions'][si]
 cards=''
 for i,e in enumerate(s['exercises']):
  card=summary(e,i).replace('data-go="detail"',f'data-edit-ex="{i}"').replace('Otwórz szczegóły:','Edytuj ćwiczenie:')
  if re.fullmatch(r'[\d\s–—+×x-]+',e['reps']):card=card.replace('Serie × cel','Serie × powt.')
  cards+='<div class="editor-exercise" data-editor-card="'+str(i)+'">'+card+'</div>'
 return '<h1>Edytuj plan</h1><p class="sub">Szkic nowej wersji</p><label class="field">Nazwa planu<input value="'+E(data['name'])+'"></label>'+sessiontabs(si)+'<p class="source-note">Otwórz ćwiczenie, aby zmienić nazwę, serie, powtórzenia i pozostałe parametry.</p>'+cards+'<div class="note distinct"><strong>Wersje planu</strong>Zmiany dotyczą przyszłych treningów. Wcześniejsze wykonania zachowują swoje cele.</div>'+button('Opublikuj nową wersję',None,extra='data-info="Makieta: bez publikacji w aplikacji."')+'<p id="editor-status" class="source-note" role="status"></p><dialog class="exercise-editor" aria-labelledby="exercise-editor-title"><form id="exercise-edit-form"><header class="edit-heading"><h2 id="exercise-editor-title">Edytuj ćwiczenie</h2><button type="button" class="textbtn" data-edit-cancel>Anuluj</button></header><div id="edit-fields"></div><footer class="edit-footer"><button class="btn" type="submit">Zastosuj zmiany w makiecie</button><p class="helper">Bez zapisu w aplikacji. Zmiana ekranu przywraca dane podglądu.</p></footer></form></dialog>'

def progress_screen(v):
 intro={'a':('Ciężar i powtórzenia razem','Dwa wykresy z tą samą osią czasu. Powtórzenia odnoszą się do serii z największym ciężarem.'),'b':('Powtórzenia przy stałym ciężarze','Porównaj liczbę powtórzeń przy identycznym obciążeniu. Rekordy dla liczby powtórzeń są poniżej.'),'c':('Wszystkie wykonane serie','Każdy punkt to jedna seria. Dotknij go, aby zobaczyć ciężar i powtórzenia.')}
 title,desc=intro[v]
 controls='<label class="field compact-field">Ćwiczenie i wariant<select data-progress-exercise><option value="bench">Wyciskanie leżąc · przykład</option><option value="pullup">Podciąganie · masa ciała</option></select></label><div class="period-picks" role="group" aria-label="Zakres czasu">'+''.join('<button data-range="'+k+'" aria-pressed="'+str(k=='all').lower()+'">'+t+'</button>' for k,t in [('1m','1 mies.'),('3m','3 mies.'),('6m','6 mies.'),('1y','1 rok'),('all','Całość'),('custom','Własny')])+'</div><div class="custom-range" hidden><label>Od<input type="date" name="progress-from" value="2026-01-01"></label><label>Do<input type="date" name="progress-to" value="2026-10-14"></label><button class="btn secondary" data-apply-range>Ustaw zakres</button><p class="helper" id="range-error" role="status"></p></div>'
 if v=='b':controls+='<label class="field compact-field" id="fixed-weight-label">Porównaj przy ciężarze<select data-fixed-weight><option value="60">60 kg</option><option value="65" selected>65 kg</option><option value="70">70 kg</option></select></label>'
 graph=lambda kind,label:'<section class="r3-chart"><h2>'+label+'</h2><svg class="gesture-plot" data-plot="'+kind+'" viewBox="0 0 340 210" role="img" aria-label="'+label+', dane demonstracyjne"></svg></section>'
 charts=graph('weight','Największy ciężar w serii')+graph('paired-reps','Powtórzenia w tej samej serii') if v=='a' else graph('fixed-reps','Powtórzenia przy wybranym ciężarze') if v=='b' else graph('all-sets','Ciężar każdej serii')
 return '<h1>Postęp</h1>'+demo()+controls+'<div class="zoom-controls"><button class="iconbtn" data-zoom="in" aria-label="Przybliż wykres">'+ico('plus')+'</button><button class="iconbtn" data-zoom="out" aria-label="Oddal wykres"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14"/></svg></button><button class="textbtn" data-zoom="reset">Cały wybrany zakres</button></div><p class="visible-range" role="status"></p><p class="gesture-hint">Rozsuń lub zsuń dwa palce na wykresie. Przyciski + / − działają również z klawiaturą.</p><div class="r3-plots" data-progress-variant="'+v+'">'+charts+'</div>'+('<p class="plot-legend">Punkt = jedna seria · większy punkt = więcej powtórzeń</p>' if v=='c' else '')+'<p class="point-detail" role="status">Wybierz punkt, aby zobaczyć konkretną serię.</p><div class="progress-results"></div><details class="source"><summary>Jak czytać ten wariant?</summary><p>'+E(desc)+' Brak wyniku pozostaje brakiem. Nie wyliczamy 1RM i nie łączymy asysty z obciążeniem zewnętrznym.</p></details><details class="source"><summary>Inspiracje projektu</summary><p><a href="https://www.hevyapp.com/features/exercise-performance/" target="_blank" rel="noreferrer">Hevy: zakresy i rekordy według powtórzeń</a><br><a href="https://fitbod.me/blog/exercise-history-and-records/" target="_blank" rel="noreferrer">Fitbod: metryki oraz dokładne wyniki serii</a><br><a href="https://help.strongapp.io/article/237-about-exercise-detail" target="_blank" rel="noreferrer">Strong: historia i rekordy ćwiczenia</a></p><p>Własne propozycje Formy, bez kopiowania ekranów. Estymowane 1RM z tych aplikacji nie są częścią tego projektu.</p></details>'

def new_screen(screen,v,si,phase=0):
 if screen=='editor' and v=='a':return editor_screen(si)
 result=_r3_base_new(screen,v,si,phase)
 if screen=='import' and v=='c':result=result.replace('Utwórz ręcznie</button>',ico('edit')+' Utwórz ręcznie</button>')
 if screen=='profile':result=result.replace('Dodaj rzeczywiste 1RM','Dodaj zmierzony 1RM').replace('Prywatne ustawienia treningowe','1RM do obliczeń i ustawienia konta').replace('Zapisz maksimum','Zapisz zmierzony 1RM')+'<div class="note distinct"><strong>1RM a wyniki treningów</strong>Wpisz ręcznie rzeczywisty wynik jednego maksymalnego powtórzenia. Wyniki serii z treningów zobaczysz w Postępie. Wpis 1RM nie dopisuje serii do historii i nie zmienia wcześniejszych treningów.</div>'
 return result

extra+=(base.parent/'t14-r3.css').read_text()
_r3_render=render_frame
_r3_js=(base.parent/'t14-r3-interactions.js').read_text()
def render_frame(screen,v='a',si=0,ei=0,phase=0):
 html=_r3_render(screen,v,si,ei,phase)
 if screen!='editor':return html
 exercises=[]
 if screen=='editor':
  for ex in data['sessions'][si]['exercises']:
   exercises.append({**ex,'name':name(ex),'sourceTable':series(ex)})
 config={'screen':screen,'variant':v,'exercises':exercises}
 return html.replace('</script>','const R3_CONFIG='+json.dumps(config,ensure_ascii=False).replace('</script>','<\\/script>')+';'+_r3_js+'</script>')
