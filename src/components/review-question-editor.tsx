"use client";
import {useEffect,useRef,useState} from 'react';
import {parsePlanEditorDocument,type PlanEditorDocument,type PlanEditorExercise} from '@/lib/domain/plan-editor';
import {applyQuestionAnswer,questionTargets,type ImportQuestion} from '@/lib/imports/questions';
import {Button} from '@/components/ui';
import {exerciseSummary,hasSetGoal} from '@/lib/imports/review';
import {ImportSource,pageFromReference,type SourceFocus} from './import-source';
import {ReviewSeriesEdit} from './review-series-edit';
import {ReviewExerciseEdit} from './review-exercise-edit';
import {ReviewGroupEdit} from './review-group-edit';

export function ReviewQuestionEditor({question:q,document,rawDraft,id,kind,text,onApply,onLater}:{question:ImportQuestion;document:PlanEditorDocument;rawDraft:Record<string,unknown>;id:string;kind:string;text:string;onApply:(document:PlanEditorDocument,answer:unknown)=>void;onLater:()=>void}){
 const [unit,setUnit]=useState(q.options.length===1?q.options[0].value:'');const [minimum,setMinimum]=useState('');const [maximum,setMaximum]=useState('');const [choice,setChoice]=useState('');
 const [corrected,setCorrected]=useState(()=>structuredClone(document));const [madeCorrection,setMadeCorrection]=useState(false);const [editing,setEditing]=useState<'series'|'identity'|'group'|null>(null);const [source,setSource]=useState(false);const [focus,setFocus]=useState<SourceFocus>(q.sourceRef?{reference:q.sourceRef,request:1}:null);const [error,setError]=useState('');
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus();},[q.id,editing,source]);
 const generic=q.answerType==='choice'&&q.options.length===1&&q.options[0].value==='reviewed';
 const mapping=generic&&/przypisania/i.test(q.reason??'');
 const [mappingTarget,setMappingTarget]=useState('');const [mappingDay,setMappingDay]=useState('');
 const targets=questionTargets(q,corrected);const exercises=targets.flatMap(t=>t.exercise?[t.exercise]:[]).filter((e,index,all)=>all.findIndex(x=>x.reviewId===e.reviewId)===index);
 const available=exercises.length?exercises:corrected.sessions.flatMap(s=>s.exercises);
 const sourcePage=pageFromReference(q.sourceRef??q.reason??'');
 const [selected,setSelected]=useState((sourcePage?available.find(e=>pageFromReference(e.sourceRef??'')===sourcePage):null)?.reviewId??available[0]?.reviewId??'');
 const exercise=available.find(e=>e.reviewId===selected)??available[0];
 const first=targets[0];
 const context=q.scope==='source'?q.context:first?`${first.session.dayLabel}${first.exercise?` → ${exercises.length>1?'wspólny blok ćwiczeń':first.exercise.name}`:''}`:q.context;
 const answer=q.answerType==='number'?minimum===''?undefined:Number(minimum):q.answerType==='quantity'?{unit,value:unit==='amrap'?null:minimum===''?null:Number(minimum),max:unit==='amrap'||maximum===''?null:Number(maximum)}:generic?'reviewed':choice;
 const valid=q.answerType==='choice'?generic?(mapping?!!mappingTarget&&(mappingTarget!=='new'||!!mappingDay.trim()):/przerw/i.test(q.reason??'')?madeCorrection&&!!exercise?.sets.every(s=>s.restSeconds!==null):madeCorrection||/wspólna wskazówka|zakres zastosowania/i.test(q.reason??''))&&available.every(e=>e.sets.every(hasSetGoal)):q.options.some(o=>o.value===choice):
  q.answerType==='quantity'&&unit==='amrap'||(q.answerType==='number'||q.options.some(o=>o.value===unit))&&minimum!==''&&Number.isFinite(Number(minimum))&&Number(minimum)>=q.min!&&Number(minimum)<=q.max!&&(['kg','distance_meters'].includes(unit)||Number.isInteger(Number(minimum)))&&(maximum===''||Number.isFinite(Number(maximum))&&Number(maximum)>=Number(minimum)&&Number(maximum)<=q.max!&&(['kg','distance_meters'].includes(unit)||Number.isInteger(Number(maximum))));
 function proposal(){const next=structuredClone(corrected);if(mapping&&mappingTarget){const ids=new Set(available.map(e=>e.reviewId));const members=next.sessions.flatMap(s=>s.exercises.filter(e=>ids.has(e.reviewId)));const owner=next.sessions.find(s=>s.exercises.some(e=>ids.has(e.reviewId)))!;if(mappingTarget!==owner.reviewId){next.sessions.forEach(s=>{s.exercises=s.exercises.filter(e=>!ids.has(e.reviewId));});members.forEach(e=>{e.supersetGroup=null;});if(mappingTarget==='new')next.sessions.push({reviewId:crypto.randomUUID(),weekNumber:owner.weekNumber,dayLabel:mappingDay.trim(),note:null,exercises:members});else next.sessions.find(s=>s.reviewId===mappingTarget)!.exercises.push(...members);}}if(!generic)applyQuestionAnswer(next,q,answer);
  if(q.id.startsWith('ambiguous_percent:')&&answer==='percent_1rm'){
   const p=q.path.split('.');const raw=(rawDraft.sessions as {exercises:{sets:{target_percent:number|null}[]}[]}[]|undefined)?.[Number(p[1])]?.exercises?.[Number(p[3])]?.sets?.[Number(p[5])];
   for(const target of questionTargets(q,next))if(target.set&&typeof raw?.target_percent==='number'){target.set.loadType='percent_1rm';target.set.targetPercent=raw.target_percent;target.set.targetKg=null;target.set.targetKgMax=null;}
  }return next;}
 function replaceExercise(value:PlanEditorExercise,targetId?:string,newDay?:string){
  const next=structuredClone(corrected);const current=next.sessions.find(s=>s.exercises.some(e=>e.reviewId===value.reviewId))!;
  if(targetId&&targetId!==current.reviewId){current.exercises=current.exercises.filter(e=>e.reviewId!==value.reviewId);value={...value,supersetGroup:null};
   if(targetId==='new')next.sessions.push({reviewId:crypto.randomUUID(),weekNumber:current.weekNumber,dayLabel:newDay!,note:null,exercises:[value]});else next.sessions.find(s=>s.reviewId===targetId)!.exercises.push(value);
  }else current.exercises[current.exercises.findIndex(e=>e.reviewId===value.reviewId)]=value;
  setCorrected(next);setMadeCorrection(true);setEditing(null);
 }
 let preview:PlanEditorDocument|null=null;try{if(valid)preview=proposal();}catch{}
 if(source)return <div><button type="button" className="review-link" onClick={()=>setSource(false)}>← Wróć do pytania</button><ImportSource id={id} kind={kind} text={text} focus={focus} allowFullscreen={false}/></div>;
 if(editing&&exercise){const owner=corrected.sessions.find(s=>s.exercises.some(e=>e.reviewId===exercise.reviewId))!;return <div><button type="button" className="review-link" onClick={()=>setEditing(null)}>← Wróć do pytania</button><h3>{exercise.name}</h3>{editing==='series'?<ReviewSeriesEdit exercise={exercise} document={corrected} onApply={value=>replaceExercise(value)}/>:editing==='group'?<ReviewGroupEdit session={owner} group={exercise.supersetGroup} onApply={value=>{const next=structuredClone(corrected);next.sessions[next.sessions.findIndex(s=>s.reviewId===value.reviewId)]=value;setCorrected(next);setMadeCorrection(true);setEditing(null);}}/>:<ReviewExerciseEdit exercise={exercise} document={corrected} sessionId={owner.reviewId!} onApply={replaceExercise}/>}</div>;}
 return <div className="review-survey">
  <p className="review-context">{context??'Uwagi do źródła'}</p><h3 ref={heading} tabIndex={-1}>{generic?'Wyjaśnij wskazany fragment':q.prompt}</h3>
  {q.reason&&<p className="review-survey-reason">{q.reason}</p>}
  {q.sourceRef&&<div className="review-source-quote"><span>{q.sourceRef}</span><button type="button" onClick={()=>{setFocus({reference:q.sourceRef!,request:Date.now()});setSource(true);}}>Pokaż źródło</button></div>}
  {generic?<>
   {mapping&&<><label className="editor-field">Docelowy trening bloku<select value={mappingTarget} onChange={e=>setMappingTarget(e.target.value)}><option value="">Wybierz trening</option>{corrected.sessions.map(s=><option key={s.reviewId} value={s.reviewId}>{s.dayLabel}</option>)}<option value="new">Nowy trening</option></select></label>{mappingTarget==='new'&&<label className="editor-field">Nazwa nowego treningu<input maxLength={80} value={mappingDay} onChange={e=>setMappingDay(e.target.value)}/></label>}</>}
   <p>Sprawdź proponowane zalecenie i popraw parametry lub przypisanie ćwiczenia, jeśli źródło wskazuje inaczej.</p>
   {available.length>1&&<label className="editor-field">Wybierz ćwiczenie do korekty<select value={selected} onChange={e=>setSelected(e.target.value)}>{available.map(e=><option key={e.reviewId} value={e.reviewId}>{corrected.sessions.find(s=>s.exercises.includes(e))?.dayLabel} · {e.name}</option>)}</select></label>}
   {exercise&&<div className="review-change-preview"><strong>{exercise.name}</strong><p>{exerciseSummary(exercise)}</p><div className="review-inline-actions"><button type="button" onClick={()=>setEditing('series')}>Popraw parametry</button><button type="button" onClick={()=>setEditing('identity')}>Popraw ćwiczenie / przypisanie</button>{/super|ss\d|grup/i.test(q.reason??'')&&<button type="button" onClick={()=>setEditing('group')}>Popraw superserię</button>}</div></div>}
  </>:q.answerType==='choice'?<div className="review-answer-options" role="radiogroup" aria-label={q.prompt}>{q.options.map(option=><label key={option.value} className={choice===option.value?'selected':''}><input type="radio" name={`answer-${q.id}`} value={option.value} checked={choice===option.value} onChange={()=>setChoice(option.value)}/><span>{option.label}</span></label>)}</div>:<>
   {q.answerType==='quantity'&&q.options.length>1&&<div className="review-answer-options" role="radiogroup" aria-label="Jednostka celu">{q.options.map(option=><label key={option.value} className={unit===option.value?'selected':''}><input type="radio" name={`unit-${q.id}`} checked={unit===option.value} onChange={()=>setUnit(option.value)}/><span>{option.label}</span></label>)}</div>}
   {unit!=='amrap'&&<div className="editor-grid"><label className="editor-field">Wartość / od<input type="number" min={q.min??undefined} max={q.max??undefined} step={['kg','distance_meters'].includes(unit)?'any':'1'} value={minimum} onChange={e=>setMinimum(e.target.value)}/></label>{q.answerType==='quantity'&&!['distance_meters','percent_1rm'].includes(unit)&&<label className="editor-field">Do (opcjonalnie)<input type="number" min={q.min??undefined} max={q.max??undefined} step={unit==='kg'?'any':'1'} value={maximum} onChange={e=>setMaximum(e.target.value)}/></label>}</div>}
  </>}
  {preview&&<div className="review-change-preview"><strong>Po zastosowaniu</strong>{questionTargets(q,preview).filter((t,index,all)=>t.exercise&&all.findIndex(x=>x.exercise?.reviewId===t.exercise?.reviewId)===index).map(t=><p key={t.exercise!.reviewId}>{t.session.dayLabel} → {t.exercise!.name}: {exerciseSummary(t.exercise!)}</p>)}{q.scope==='source'&&<p>Zmiana obejmuje skorygowany fragment źródła w szkicu.</p>}</div>}
  {error&&<p role="alert" className="auth-error">{error}</p>}
  <div className="review-dialog-footer"><Button variant="ghost" onClick={onLater}>Później</Button><Button variant="primary" disabled={!valid} onClick={()=>{try{const next=proposal();parsePlanEditorDocument(next);onApply(next,answer);}catch(cause){setError((cause as Error).message);}}}>{generic?'Potwierdź interpretację':'Zastosuj odpowiedź'}</Button></div>
 </div>;
}
