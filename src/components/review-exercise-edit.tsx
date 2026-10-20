"use client";
import {useState} from 'react';
import type {PlanEditorDocument,PlanEditorExercise} from '@/lib/domain/plan-editor';
import {Button} from '@/components/ui';
import {ExerciseIdentityFields, meaningChange} from './exercise-identity-fields';
export function ReviewExerciseEdit({exercise,document,sessionId,onApply,onDelete}:{exercise:PlanEditorExercise;document:PlanEditorDocument;sessionId:string;onApply:(exercise:PlanEditorExercise,targetId:string,newDay?:string)=>void;onDelete?:()=>void}){
 const [draft,setDraft]=useState(()=>structuredClone(exercise));const [target,setTarget]=useState(sessionId);const [newDay,setNewDay]=useState('');const [error,setError]=useState('');
 const set=(key:keyof PlanEditorExercise,value:unknown)=>setDraft(current=>({...current,[key]:value}));
 return <form onSubmit={event=>{event.preventDefault();if(!draft.name.trim()||target==='new'&&!newDay.trim()){setError('Podaj nazwę ćwiczenia i treningu.');return;}if(draft.assignment==='unresolved'&&draft.suggestion){setError('Potwierdź propozycję albo zostaw własną nazwę.');return;}onApply(draft,target,newDay);}}>
  <label className="editor-field">Nazwa ćwiczenia<input autoComplete="off" maxLength={120} value={draft.name} onChange={e=>setDraft(meaningChange(draft,{name:e.target.value}))}/></label>
  <ExerciseIdentityFields draft={draft} onChange={setDraft}/>
  <div className="editor-grid"><label className="editor-field">Wariant<input maxLength={120} value={draft.variant??''} disabled={draft.exerciseId!==null} onChange={e=>setDraft(meaningChange(draft,{variant:e.target.value||null}))}/></label><label className="editor-field">Sprzęt<input maxLength={120} value={draft.equipment??''} disabled={draft.exerciseId!==null} onChange={e=>setDraft(meaningChange(draft,{equipment:e.target.value||null}))}/></label></div>
  <label className="editor-field">Przypisanie do treningu<select value={target} onChange={e=>setTarget(e.target.value)}>{document.sessions.map(s=><option key={s.reviewId} value={s.reviewId}>Tydzień {s.weekNumber} · {s.dayLabel}</option>)}<option value="new">Nowy trening</option></select></label>
  {target==='new'&&<label className="editor-field">Nazwa nowego treningu<input maxLength={80} value={newDay} onChange={e=>setNewDay(e.target.value)}/></label>}
  {target!==sessionId&&<p className="review-hint">Ćwiczenie zostanie przeniesione. Grupę superserii ustalisz w kroku drugim.</p>}
  <label className="editor-field">Uwagi do ćwiczenia<textarea maxLength={2000} value={draft.note??''} onChange={e=>set('note',e.target.value||null)}/></label>
  {error&&<p role="alert" className="auth-error">{error}</p>}
  <div className="review-dialog-footer">{onDelete&&<Button variant="danger" onClick={onDelete}>Usuń ćwiczenie</Button>}<Button variant="primary" type="submit">Zastosuj zmiany</Button></div>
 </form>;
}
