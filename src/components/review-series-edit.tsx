"use client";
import {useState} from 'react';
import {parsePlanEditorDocument,type PlanEditorDocument,type PlanEditorExercise} from '@/lib/domain/plan-editor';
import {parsePlannedSet,type PlannedSetInput} from '@/lib/domain/model';
import {exerciseSummary,goalLabel,loadLabel,patchSeries,resizeSeriesBlock,seriesBlocks} from '@/lib/imports/review';
import {Button} from '@/components/ui';
import {ReviewSetFields} from './review-set-fields';
export function ReviewSeriesEdit({exercise,document,onApply,individual=false,blockIndex=0}:{exercise:PlanEditorExercise;document:PlanEditorDocument;onApply:(exercise:PlanEditorExercise)=>void;individual?:boolean;blockIndex?:number}){
 const blocks=seriesBlocks(exercise),block=blocks[blockIndex]??blocks[0];
 const [selected,setSelected]=useState(exercise.sets[0].reviewId!);
 const representative=individual?exercise.sets.find(s=>s.reviewId===selected)!:block.sets[0];
 const [edited,setEdited]=useState<PlannedSetInput>(()=>structuredClone(representative));
 const [minimum,setMinimum]=useState(String(block.minimum));const [maximum,setMaximum]=useState(String(block.maximum));
 const [optional,setOptional]=useState(!!exercise.isOptional);const [error,setError]=useState('');
 function proposed(){
  const next=structuredClone(exercise);
  if(individual){const index=next.sets.findIndex(s=>s.reviewId===selected);next.sets[index]={...edited,reviewId:next.sets[index].reviewId,position:next.sets[index].position};}
  else {
   if(!minimum.trim()||!maximum.trim())throw new Error('Podaj obie granice liczby serii.');
   parsePlannedSet(edited);
   const ids=block.sets.map(s=>s.reviewId!);patchSeries(next,ids,representative,edited);
   if(minimum!==String(block.minimum)||maximum!==String(block.maximum))resizeSeriesBlock(next,ids,Number(minimum),Number(maximum));
  }
  if(optional!==!!exercise.isOptional){next.isOptional=optional;next.sets.forEach((set,index)=>{set.isOptional=optional||index>=(next.setCountMin??next.sets.length);});}
  if(individual&&next.setCountMin!=null&&!next.isOptional)next.setCountMin=next.sets.filter(s=>!s.isOptional).length;
  return next;
 }
 function apply(){try{
  const next=proposed();const check=structuredClone(document);const session=check.sessions.find(s=>s.exercises.some(e=>e.reviewId===exercise.reviewId))!;session.exercises[session.exercises.findIndex(e=>e.reviewId===exercise.reviewId)]=next;
  parsePlanEditorDocument(check);onApply(next);
 }catch(cause){setError((cause as Error).message);}}
 let preview='Uzupełnij poprawne parametry.';try{preview=exerciseSummary(proposed());}catch{}
 return <form onSubmit={event=>{event.preventDefault();apply();}}>
  {individual?<label className="editor-field">Wybierz serię<select value={selected} onChange={event=>{setSelected(event.target.value);setEdited(structuredClone(exercise.sets.find(s=>s.reviewId===event.target.value)!));setError('');}}>{exercise.sets.map(set=><option key={set.reviewId} value={set.reviewId}>Seria {set.position} · {goalLabel(set)}{set.isOptional?' · opcjonalna':''}</option>)}</select></label>:<>
   <p className="review-edit-scope">Zmiana obejmuje serie {block.sets[0].position}–{block.sets.at(-1)!.position} ćwiczenia „{exercise.name}”. Indywidualne uwagi pozostają zachowane.</p>
   <div className="editor-grid"><label className="editor-field">Liczba serii od<input type="number" min={0} max={30} value={minimum} onChange={e=>setMinimum(e.target.value)}/></label><label className="editor-field">Liczba serii do<input type="number" min={1} max={30} value={maximum} onChange={e=>setMaximum(e.target.value)}/></label></div>
  </>}
  <ReviewSetFields key={individual?selected:block.sets[0].reviewId} value={edited} onChange={setEdited} individual={individual}/>
  {individual&&<label className="editor-check"><input type="checkbox" checked={!!edited.isOptional} disabled={optional} onChange={e=>setEdited({...edited,isOptional:e.target.checked})}/> Seria opcjonalna</label>}
  <label className="editor-check"><input type="checkbox" checked={optional} onChange={e=>setOptional(e.target.checked)}/> Całe ćwiczenie opcjonalne</label>
  <div className="review-change-preview"><strong>Po zmianie</strong><p>{preview}</p><small>{loadLabel(edited)}</small></div>
  {error&&<p className="auth-error" role="alert">{error}</p>}
  <div className="review-dialog-footer"><Button variant="primary" type="submit">Zastosuj zmiany</Button></div>
 </form>;
}
