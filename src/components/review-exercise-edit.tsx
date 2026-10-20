"use client";
import {useState} from 'react';
import type {PlanEditorDocument,PlanEditorExercise} from '@/lib/domain/plan-editor';
import {Button} from '@/components/ui';
import {ExerciseNamePicker} from './exercise-name-picker';
import {suggestExerciseName} from '@/lib/exercises/names';
export function ReviewExerciseEdit({exercise,document,sessionId,onApply,onDelete}:{exercise:PlanEditorExercise;document:PlanEditorDocument;sessionId:string;onApply:(exercise:PlanEditorExercise,targetId:string,newDay?:string)=>void;onDelete?:()=>void}){
 const [draft,setDraft]=useState(()=>structuredClone(exercise));const [target,setTarget]=useState(sessionId);const [newDay,setNewDay]=useState('');const [error,setError]=useState('');
 const set=(key:keyof PlanEditorExercise,value:unknown)=>setDraft(current=>({...current,[key]:value}));
 const suggestion=suggestExerciseName(draft.originalName??draft.name);
 return <form onSubmit={event=>{event.preventDefault();if(!draft.name.trim()||target==='new'&&!newDay.trim()){setError('Podaj nazwę ćwiczenia i treningu.');return;}onApply(draft,target,newDay);}}>
  <label className="editor-field">Nazwa ćwiczenia<input autoComplete="off" maxLength={120} value={draft.name} onChange={e=>set('name',e.target.value)}/></label>
  {exercise.originalName&&<p className="review-hint">W źródle: {exercise.originalName}</p>}
  {suggestion&&suggestion.pl!==draft.name&&<button type="button" className="review-link" onClick={()=>set('name',suggestion.pl)}>Zastosuj nazwę: {suggestion.pl}</button>}
  <ExerciseNamePicker original={exercise.originalName??exercise.name} onSelect={name=>set('name',name)}/>
  <div className="editor-grid"><label className="editor-field">Wariant<input maxLength={120} value={draft.variant??''} disabled={draft.exerciseId!==null} onChange={e=>set('variant',e.target.value||null)}/></label><label className="editor-field">Sprzęt<input maxLength={120} value={draft.equipment??''} disabled={draft.exerciseId!==null} onChange={e=>set('equipment',e.target.value||null)}/></label></div>
  <label className="editor-field">Przypisanie do treningu<select value={target} onChange={e=>setTarget(e.target.value)}>{document.sessions.map(s=><option key={s.reviewId} value={s.reviewId}>Tydzień {s.weekNumber} · {s.dayLabel}</option>)}<option value="new">Nowy trening</option></select></label>
  {target==='new'&&<label className="editor-field">Nazwa nowego treningu<input maxLength={80} value={newDay} onChange={e=>setNewDay(e.target.value)}/></label>}
  {target!==sessionId&&<p className="review-hint">Ćwiczenie zostanie przeniesione. Grupę superserii ustalisz w kroku drugim.</p>}
  <label className="editor-field">Uwagi do ćwiczenia<textarea maxLength={2000} value={draft.note??''} onChange={e=>set('note',e.target.value||null)}/></label>
  {error&&<p role="alert" className="auth-error">{error}</p>}
  <div className="review-dialog-footer">{onDelete&&<Button variant="danger" onClick={onDelete}>Usuń ćwiczenie</Button>}<Button variant="primary" type="submit">Zastosuj zmiany</Button></div>
 </form>;
}
