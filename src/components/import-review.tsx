"use client";
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {parsePlanEditorDocument,type PlanEditorDocument,type PlanEditorExercise,type PlanEditorSession} from '@/lib/domain/plan-editor';
import {setKindLabel} from '@/lib/domain/format';
import {pendingQuestions,type ImportQuestion} from '@/lib/imports/questions';
import {changedReview,exerciseSummary,goalLabel,groupProblems,hasSetGoal,loadLabel,newReviewExercise,optionalLabel,questionStep,questionsForExercise,readReviewProgress,restLabel,reviewFingerprint,seriesBlocks,sessionGroups,sortReviewQuestions,withReviewIds,type ReviewProgress,type ReviewStep} from '@/lib/imports/review';
import {ImportSource,type SourceFocus} from './import-source';
import {ReviewDialog} from './review-dialog';
import {ReviewExerciseEdit} from './review-exercise-edit';
import {ReviewSeriesEdit} from './review-series-edit';
import {ReviewGroupEdit} from './review-group-edit';
import {ReviewQuestionEditor} from './review-question-editor';

type Modal={type:'add';sessionId:string;exercise:PlanEditorExercise}|{type:'exercise'|'series'|'individual';exerciseId:string;blockIndex?:number}|{type:'group';sessionId:string;group:string|null}|{type:'day';sessionId:string}|{type:'survey';ids:string[]};
const titles:Record<ReviewStep,string>={exercises:'Ćwiczenia',structure:'Serie i superserie',summary:'Podsumowanie'};
export function ImportReview({id,kind,text,initial,questions:initialQuestions,answers:initialAnswers={},progress:initialProgress,rawDraft,warnings=[]}:{id:string;kind:string;text:string;initial:PlanEditorDocument;questions:ImportQuestion[];answers?:Record<string,unknown>;progress?:unknown;rawDraft:Record<string,unknown>;warnings?:string[]}){
 const [document,setDocument]=useState(()=>withReviewIds(initial));
 const [progress,setProgress]=useState<ReviewProgress>(()=>{try{return readReviewProgress(initialProgress,withReviewIds(initial));}catch{return readReviewProgress(null,initial);}});
 const [answers,setAnswers]=useState(initialAnswers);const [dayId,setDayId]=useState(document.sessions[0].reviewId!);
 const [saved,setSaved]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const [modal,setModal]=useState<Modal|null>(null);const [sourceOpen,setSourceOpen]=useState(false);const [focus,setFocus]=useState<SourceFocus>(null);
 const [operationId,setOperationId]=useState(()=>crypto.randomUUID());const router=useRouter();
 const publicationSubmitted=useRef(false);
 const [mobile,setMobile]=useState(false);
 const root=useRef<HTMLElement>(null);const previousStep=useRef(progress.step);
 useEffect(()=>{if(previousStep.current!==progress.step){root.current?.scrollIntoView?.({block:'start'});root.current?.querySelector<HTMLElement>('[data-review-step-heading]')?.focus();previousStep.current=progress.step;}},[progress.step]);
 useEffect(()=>{const update=()=>setMobile(window.innerWidth<=900);update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);},[]);
 const questions=sortReviewQuestions(pendingQuestions(initialQuestions,document,answers),document);
 const stageQuestions=questions.filter(q=>questionStep(q)===progress.step);
 const session=document.sessions.find(s=>s.reviewId===dayId)??document.sessions[0];
 const problems=groupProblems(document);
 useEffect(()=>{if(saved)return;const listener=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',listener);return()=>window.removeEventListener('beforeunload',listener);},[saved]);
 function change(next:PlanEditorDocument,answer?:{question:ImportQuestion;value:unknown}){
  if(busy)return;
  const changed=changedReview(document,next,progress,[...initialQuestions,...questions],answers);
  if(answer)changed.answers[answer.question.id]=answer.value;
  publicationSubmitted.current=false;setDocument(next);setProgress(changed.progress);setAnswers(changed.answers);setSaved(false);setError('');setOperationId(crypto.randomUUID());
 }
 function edit(action:(document:PlanEditorDocument)=>void){const next=structuredClone(document);action(next);change(next);}
 function replaceExercise(exercise:PlanEditorExercise,targetId?:string,newDay?:string){
  edit(next=>{const owner=next.sessions.find(s=>s.exercises.some(e=>e.reviewId===exercise.reviewId))!;
   if(targetId&&targetId!==owner.reviewId){owner.exercises=owner.exercises.filter(e=>e.reviewId!==exercise.reviewId);const moved={...exercise,supersetGroup:null};
    if(targetId==='new'){const created={reviewId:crypto.randomUUID(),weekNumber:owner.weekNumber,dayLabel:newDay!,note:null,exercises:[moved]};next.sessions.push(created);setDayId(created.reviewId);}
    else {next.sessions.find(s=>s.reviewId===targetId)!.exercises.push(moved);setDayId(targetId);}
   }else owner.exercises[owner.exercises.findIndex(e=>e.reviewId===exercise.reviewId)]=exercise;
  });setModal(null);
 }
 async function persist(nextProgress=progress){
  setError('');try{parsePlanEditorDocument(document);}catch(cause){setError((cause as Error).message);return false;}
  try{const response=await fetch(`/api/imports/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({document,answers,progress:nextProgress})});const result=await response.json();
   if(!response.ok){setError(result.error??'Nie udało się zapisać korekty.');return false;}
   setProgress(nextProgress);setSaved(true);return true;
  }catch{setError('Brak potwierdzenia zapisu. Spróbuj ponownie; korekta pozostaje na ekranie.');return false;}
 }
 async function navigate(step:ReviewStep){if(busy)return;setBusy(true);await persist({...progress,step});setBusy(false);}
 async function confirm(){
  if(stageQuestions.length){setError('Wyjaśnij niejasności tego kroku przed jego potwierdzeniem.');return;}
  if(progress.step==='structure'&&problems.length){setError(problems[0]);return;}
  const next:ReviewProgress=progress.step==='exercises'?{...progress,step:'structure',exercisesConfirmed:reviewFingerprint(document,'exercises')}:{...progress,step:'summary',structureConfirmed:reviewFingerprint(document,'structure')};
  setBusy(true);await persist(next);setBusy(false);
 }
 async function publish(){
  if(!progress.exercisesConfirmed||!progress.structureConfirmed||questions.length||problems.length){setError('Potwierdź oba kroki i wyjaśnij pozostałe niejasności.');return;}
  setError('');setBusy(true);if(!publicationSubmitted.current&&!await persist()){setBusy(false);return;}
  publicationSubmitted.current=true;
  try{const response=await fetch(`/api/imports/${id}/approve`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operationId,document,answers})});const result=await response.json();
   if(!response.ok)setError(result.error??'Nie udało się utworzyć planu.');else{router.push(`/plany/${result.planId}`);router.refresh();}
  }catch{setError('Brak potwierdzenia utworzenia planu. Ponowienie użyje tego samego identyfikatora operacji.');}finally{setBusy(false);}
 }
 function showSource(reference?:string|null){if(reference)setFocus({reference,request:Date.now()});setSourceOpen(true);}
 const modalExercise=modal?.type==='add'?modal.exercise:modal&&'exerciseId'in modal?document.sessions.flatMap(s=>s.exercises).find(e=>e.reviewId===modal.exerciseId):null;
 const modalDay=modal&&'sessionId'in modal?document.sessions.find(s=>s.reviewId===modal.sessionId):null;
 const question=modal?.type==='survey'?questions.find(q=>modal.ids.includes(q.id)):null;
 function explain(list:ImportQuestion[]){if(list.length)setModal({type:'survey',ids:list.map(q=>q.id)});}
 function exerciseCard(exercise:PlanEditorExercise,index:number){
  const own=questionsForExercise(questions,document,exercise.reviewId!).filter(q=>progress.step==='summary'||questionStep(q)===progress.step);
  const missingCount=own.some(q=>q.id.startsWith('missing_sets:'));
  const blocks=seriesBlocks(exercise);
  return <article key={exercise.reviewId} className="review-exercise-card" data-exercise-id={exercise.reviewId}>
   <div className="review-card-heading"><span className="review-position">{index+1}</span><div><h3>{exercise.name}</h3>{exercise.originalName&&exercise.originalName!==exercise.name&&<p className="review-original">{exercise.originalName}</p>}{exercise.variant&&<p className="review-variant">{exercise.variant}</p>}</div>
    {progress.step!=='summary'&&<button type="button" className="review-link" onClick={()=>setModal({type:'exercise',exerciseId:exercise.reviewId!})}>Edytuj ćwiczenie</button>}
   </div>
   {progress.step==='exercises'?<div className="review-exercise-bottom"><span>{exercise.equipment??'Sprzęt nieokreślony'}</span><div className="review-inline-actions"><button type="button" aria-label={`Przesuń w górę: ${exercise.name}`} disabled={index===0} onClick={()=>edit(next=>{const list=next.sessions.find(s=>s.reviewId===session.reviewId)!.exercises;[list[index-1],list[index]]=[list[index],list[index-1]];})}>↑</button><button type="button" aria-label={`Przesuń w dół: ${exercise.name}`} disabled={index===session.exercises.length-1} onClick={()=>edit(next=>{const list=next.sessions.find(s=>s.reviewId===session.reviewId)!.exercises;[list[index+1],list[index]]=[list[index],list[index+1]];})}>↓</button></div></div>:<>
    <p className="review-prescription">{exerciseSummary(exercise,missingCount)}</p>
    {optionalLabel(exercise)&&<span className="review-optional">{optionalLabel(exercise)}</span>}
    <div className="review-parameter-chips">{[...new Set(blocks.map(b=>loadLabel(b.sets[0])))].map(value=><span key={value}>{value}</span>)}{[...new Set(blocks.map(b=>restLabel(b.sets[0])))].map(value=><span key={value}>{value}</span>)}</div>
    {exercise.note && <p className="review-note-preview">{exercise.note.length>150?`${exercise.note.slice(0,150)}…`:exercise.note}</p>}
    {blocks.length>1&&<div className="review-small-table-scroll"><table className="review-small-table"><thead><tr><th>Serie</th><th>Cel</th><th>Obciążenie</th><th>Parametry</th></tr></thead><tbody>{blocks.map(block=><tr key={block.sets[0].reviewId} className={!hasSetGoal(block.sets[0])?'review-missing':''}><td>{block.sets[0].position}{block.sets.length>1?`–${block.sets.at(-1)!.position}`:''}</td><td>{goalLabel(block.sets[0])}</td><td>{loadLabel(block.sets[0])}</td><td>{[setKindLabel[block.sets[0].kind],restLabel(block.sets[0]),block.sets[0].tempo?`Tempo ${block.sets[0].tempo}`:null,block.sets[0].targetRpe!=null?`RPE ${block.sets[0].targetRpe}`:null,block.sets[0].targetRir!=null?`RIR ${block.sets[0].targetRir}`:null].filter(Boolean).join(' · ')}</td></tr>)}</tbody></table></div>}
    {exercise.sets.some(s=>!hasSetGoal(s))&&<p className="review-missing">Cel wymaga wyjaśnienia: serie {exercise.sets.filter(s=>!hasSetGoal(s)).map(s=>s.position).join(', ')}.</p>}
    {progress.step==='structure'&&<div className="review-inline-actions">{blocks.map((block,i)=><button type="button" key={block.sets[0].reviewId} onClick={()=>setModal({type:'series',exerciseId:exercise.reviewId!,blockIndex:i})}>Edytuj blok{blocks.length>1?` ${i+1}`:''}</button>)}<button type="button" onClick={()=>setModal({type:'individual',exerciseId:exercise.reviewId!})}>Edytuj pojedyncze serie</button></div>}
   </>}
   {own.length>0&&<button type="button" className="review-clarify" onClick={()=>explain(own)}>Wyjaśnij ({own.length})</button>}
   {(exercise.note||exercise.sets.some(s=>s.note)||exercise.sourceRef)&&<details className="review-more"><summary>Uwagi i źródło</summary>{exercise.note&&<p>{exercise.note}</p>}{exercise.sets.some(s=>s.note)&&<details><summary>Indywidualne uwagi serii</summary>{exercise.sets.filter(s=>s.note).map(s=><p key={s.reviewId}><strong>Seria {s.position}:</strong> {s.note}</p>)}</details>}{exercise.sourceRef&&<button type="button" className="review-link" onClick={()=>showSource(exercise.sourceRef)}>Pokaż fragment źródła</button>}</details>}
  </article>;
 }
 function trainingCards(current:PlanEditorSession){return progress.step==='exercises'?<div className="review-cards">{current.exercises.map(exerciseCard)}</div>:<div className="review-cards">{sessionGroups(current).map(group=>group.label?<section className="review-superset" key={group.id}><div className="review-superset-heading"><div><strong>Superseria {group.label.replace(/^SS/i,'')}</strong><span>{group.exercises.length} ćwiczeń · {restLabel(group.exercises.at(-1)!.sets.at(-1)!)}</span></div>{progress.step==='structure'&&<button type="button" onClick={()=>setModal({type:'group',sessionId:current.reviewId!,group:group.label})}>Edytuj grupę</button>}</div>{group.exercises.map(e=>exerciseCard(e,current.exercises.indexOf(e)))}</section>:exerciseCard(group.exercises[0],current.exercises.indexOf(group.exercises[0])))}</div>;}
 const modalTitle=modal?.type==='survey'?question?'Wyjaśnij niejasność':'Ankieta zakończona':modal?.type==='day'?'Edytuj trening':modal?.type==='group'?'Edytuj superserię':modal?.type==='exercise'?'Edytuj ćwiczenie':modal?.type==='add'?'Dodaj ćwiczenie':modal?.type==='individual'?'Edytuj pojedyncze serie':'Edytuj blok serii';
 return <section ref={root} className={`import-review ${busy?'review-busy':''}`} aria-label="Przegląd zaimportowanego planu" aria-busy={busy}>
  <header className="review-header"><div className="review-header-title"><div><p className="eyebrow">PRZEGLĄD PLANU</p><h2 tabIndex={-1} data-review-heading>{document.name}</h2><p>{document.sessions.length} treningów · {document.sessions.reduce((n,s)=>n+s.exercises.length,0)} ćwiczeń</p></div><button type="button" className="button button-outline" onClick={()=>setSourceOpen(open=>!open)}>{sourceOpen?'Zamknij źródło':'Pokaż źródło'}</button></div>
   <nav className="review-steps" aria-label="Kroki przeglądu">{(['exercises','structure','summary'] as const).map((step,index)=><button type="button" key={step} aria-current={progress.step===step?'step':undefined} onClick={()=>void navigate(step)}><span>{index+1}</span>{titles[step]}{step==='exercises'&&progress.exercisesConfirmed||step==='structure'&&progress.structureConfirmed?<small aria-label="Potwierdzony">✓</small>:null}</button>)}</nav>
   <div className="review-toolbar"><label>Trening<select aria-label="Wybierz trening" value={session.reviewId} onChange={event=>setDayId(event.target.value)}>{document.sessions.map(s=><option key={s.reviewId} value={s.reviewId}>Tydzień {s.weekNumber} · {s.dayLabel} ({s.exercises.length})</option>)}</select></label><button type="button" className={questions.length?'review-clarify':'review-clear'} disabled={!(progress.step==='summary'?questions:stageQuestions).length} onClick={()=>explain(progress.step==='summary'?questions:stageQuestions)}>{(progress.step==='summary'?questions:stageQuestions).length?`Wyjaśnij niejasności (${(progress.step==='summary'?questions:stageQuestions).length})`:questions.length?`${questions.length} niejasności w pozostałych krokach`:'Brak niejasności'}</button><span className="review-save-status" role="status">{busy?'Zapisywanie…':saved?'Korekta zapisana':'Niezapisane zmiany'}</span></div>
  </header>
  {error&&<p className="auth-error review-message" role="alert">{error}</p>}
  <div className={`review-content ${sourceOpen?'with-source':''}`}>
   <div className={`review-main ${sourceOpen?'review-mobile-hidden':''}`}>
    <div className="review-section-heading"><div><h2 data-review-step-heading tabIndex={-1}>{titles[progress.step]}</h2><p>{progress.step==='exercises'?'Sprawdź listę i kolejność ćwiczeń. Parametry przejrzysz w kolejnym kroku.':progress.step==='structure'?'Sprawdź zalecenia i grupy. Edytuj tylko to, co wymaga korekty.':'Sprawdź cały plan przed utworzeniem jego aktywnej wersji.'}</p></div>{progress.step==='exercises'&&<button type="button" className="review-link" onClick={()=>setModal({type:'day',sessionId:session.reviewId!})}>Edytuj trening</button>}</div>
    {progress.step==='summary'&&<div className="review-confirmation-status"><p>{progress.exercisesConfirmed?'✓ Ćwiczenia potwierdzone':'Ćwiczenia wymagają potwierdzenia'}</p><p>{progress.structureConfirmed?'✓ Serie i superserie potwierdzone':'Serie i superserie wymagają potwierdzenia'}</p>{questions.length>0&&<p>{questions.length} niejasności pozostaje do wyjaśnienia.</p>}<label className="editor-field">Nazwa planu<input disabled={busy} maxLength={120} value={document.name} onChange={e=>edit(next=>{next.name=e.target.value;})}/></label></div>}
    {session.note&&<details className="review-day-note"><summary>Uwagi do treningu {session.dayLabel}</summary><p>{session.note}</p></details>}
    {progress.step==='summary'?document.sessions.map(current=><details className="review-summary-day" key={current.reviewId} open={current.reviewId===session.reviewId}><summary>Tydzień {current.weekNumber} · {current.dayLabel} · {current.exercises.length} ćwiczeń</summary>{trainingCards(current)}</details>):trainingCards(session)}
    {!session.exercises.length&&<p role="alert" className="review-missing">Trening jest pusty. Dodaj ćwiczenie lub usuń trening przed zapisaniem.</p>}
    {progress.step==='exercises'&&<button type="button" className="button button-outline" onClick={()=>setModal({type:'add',sessionId:session.reviewId!,exercise:newReviewExercise('')})}>+ Dodaj ćwiczenie</button>}
    {progress.step==='structure'&&!progress.exercisesConfirmed&&<p className="review-missing">Potwierdź aktualną listę ćwiczeń w kroku pierwszym, aby zatwierdzić serie i superserie.</p>}
    {progress.step==='structure'&&<button type="button" className="button button-outline" disabled={session.exercises.length<2} onClick={()=>setModal({type:'group',sessionId:session.reviewId!,group:null})}>+ Utwórz superserię</button>}
    {problems.length>0&&progress.step!=='exercises'&&<div className="review-missing" role="alert">{problems.map(problem=><p key={problem}>{problem}</p>)}</div>}
    {warnings.length>0&&<details className="review-more"><summary>Uwagi z odczytu ({warnings.length})</summary>{warnings.map((warning,i)=><p key={i}>{warning}</p>)}</details>}
   </div>
   {sourceOpen&&!mobile&&<aside className="review-source-panel" aria-label="Oryginalne źródło"><div className="review-source-heading"><h2>Oryginalne źródło</h2><button type="button" onClick={()=>setSourceOpen(false)}>Wróć do planu</button></div><ImportSource id={id} kind={kind} text={text} focus={focus}/></aside>}
  </div>
  <footer className={`review-footer ${sourceOpen?'review-mobile-hidden':''}`}><button type="button" className="button button-outline" disabled={busy} onClick={async()=>{setBusy(true);await persist();setBusy(false);}}>Zapisz korektę</button>{progress.step!=='exercises'&&<button type="button" className="review-link" disabled={busy} onClick={()=>void navigate(progress.step==='summary'?'structure':'exercises')}>← Wstecz</button>}{progress.step==='summary'?<button type="button" className="button button-dark" disabled={busy||!progress.exercisesConfirmed||!progress.structureConfirmed||!!questions.length||!!problems.length} onClick={()=>void publish()}>Zatwierdź i utwórz plan</button>:<button type="button" className="button button-dark" disabled={busy||!!stageQuestions.length||progress.step==='structure'&&(!progress.exercisesConfirmed||!!problems.length)} onClick={()=>void confirm()}>{progress.step==='exercises'?'Potwierdź ćwiczenia':'Potwierdź serie i superserie'}</button>}</footer>
  <p className="review-private-note">Przeglądasz propozycję. Aktywny plan powstanie dopiero po zatwierdzeniu podsumowania.</p>
  {sourceOpen&&mobile&&!modal&&<ReviewDialog title="Oryginalne źródło" onClose={()=>setSourceOpen(false)}><ImportSource id={id} kind={kind} text={text} focus={focus} allowFullscreen={false}/></ReviewDialog>}
  {modal&&<ReviewDialog title={modalTitle} onClose={()=>setModal(null)}>
   {modal.type==='add'&&modalExercise&&<ReviewExerciseEdit exercise={modalExercise} document={document} sessionId={modal.sessionId} onApply={(value,target,newDay)=>{edit(next=>{if(target==='new'){const created={reviewId:crypto.randomUUID(),weekNumber:session.weekNumber,dayLabel:newDay!,note:null,exercises:[value]};next.sessions.push(created);setDayId(created.reviewId);}else next.sessions.find(s=>s.reviewId===target)!.exercises.push(value);});setModal(null);}}/>}
   {modal.type==='exercise'&&modalExercise&&<ReviewExerciseEdit exercise={modalExercise} document={document} sessionId={document.sessions.find(s=>s.exercises.includes(modalExercise))!.reviewId!} onApply={replaceExercise} onDelete={()=>{edit(next=>{const owner=next.sessions.find(s=>s.exercises.some(e=>e.reviewId===modal.exerciseId))!;owner.exercises=owner.exercises.filter(e=>e.reviewId!==modal.exerciseId);});setModal(null);}}/>}
   {(modal.type==='series'||modal.type==='individual')&&modalExercise&&<ReviewSeriesEdit exercise={modalExercise} document={document} onApply={replaceExercise} individual={modal.type==='individual'} blockIndex={modal.type==='series'?modal.blockIndex:undefined}/>}
   {modal.type==='group'&&modalDay&&<ReviewGroupEdit session={modalDay} group={modal.group} onApply={next=>{edit(draft=>{draft.sessions[draft.sessions.findIndex(s=>s.reviewId===next.reviewId)]=next;});setModal(null);}}/>}
   {modal.type==='day'&&modalDay&&<ReviewDayEdit session={modalDay} canDelete={document.sessions.length>1} onApply={next=>{edit(draft=>{draft.sessions[draft.sessions.findIndex(s=>s.reviewId===next.reviewId)]=next;});setModal(null);}} onDelete={()=>{edit(next=>{next.sessions=next.sessions.filter(s=>s.reviewId!==modalDay.reviewId);});setDayId(document.sessions.find(s=>s.reviewId!==modalDay.reviewId)!.reviewId!);setModal(null);}} onMove={delta=>{edit(next=>{const index=next.sessions.findIndex(s=>s.reviewId===modalDay.reviewId);if(index+delta>=0&&index+delta<next.sessions.length)[next.sessions[index],next.sessions[index+delta]]=[next.sessions[index+delta],next.sessions[index]];});setModal(null);}}/>}
   {modal.type==='survey'&&question&&<ReviewQuestionEditor key={question.id} question={question} document={document} rawDraft={rawDraft} id={id} kind={kind} text={text} onLater={()=>setModal({...modal,ids:modal.ids.filter(qid=>qid!==question.id)})} onApply={(next,value)=>{change(next,{question,value});const nextAnswers={...answers,[question.id]:value};const dynamic=pendingQuestions(initialQuestions,next,nextAnswers).filter(q=>questionStep(q)===questionStep(question)&&q.id.startsWith('goal:')).map(q=>q.id);setModal({...modal,ids:[...new Set([...modal.ids,...dynamic])]});}}/>}
   {modal.type==='survey'&&!question&&<div className="review-survey-finished"><strong>Ta kolejka pytań jest zakończona.</strong><p>{questions.length?'Odłożone i pozostałe pytania znajdziesz przy ćwiczeniach.':'Wszystkie niejasności zostały wyjaśnione.'}</p><button type="button" className="button button-dark" onClick={()=>setModal(null)}>Wróć do planu</button></div>}
  </ReviewDialog>}
 </section>;
}
function ReviewDayEdit({session,onApply,onDelete,onMove,canDelete}:{session:PlanEditorSession;onApply:(session:PlanEditorSession)=>void;onDelete:()=>void;onMove:(delta:number)=>void;canDelete:boolean}){
 const [value,setValue]=useState(()=>structuredClone(session));return <form onSubmit={event=>{event.preventDefault();if(value.dayLabel.trim()&&value.weekNumber>=1&&value.weekNumber<=52)onApply(value);}}><label className="editor-field">Nazwa treningu<input required maxLength={80} value={value.dayLabel} onChange={e=>setValue({...value,dayLabel:e.target.value})}/></label><label className="editor-field">Tydzień<input required type="number" min={1} max={52} value={value.weekNumber} onChange={e=>setValue({...value,weekNumber:Number(e.target.value)})}/></label><label className="editor-field">Uwagi do treningu<textarea maxLength={2000} value={value.note??''} onChange={e=>setValue({...value,note:e.target.value||null})}/></label><div className="review-inline-actions"><button type="button" onClick={()=>onMove(-1)}>Przesuń trening wcześniej</button><button type="button" onClick={()=>onMove(1)}>Przesuń trening później</button><button type="button" className="review-danger" disabled={!canDelete} onClick={onDelete}>Usuń trening</button></div><div className="review-dialog-footer"><button type="submit" className="button button-dark">Zastosuj zmiany</button></div></form>;
}
