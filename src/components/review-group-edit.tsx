"use client";
import {useState} from 'react';
import type {PlanEditorSession} from '@/lib/domain/plan-editor';
export function ReviewGroupEdit({session,group,onApply}:{session:PlanEditorSession;group:string|null;onApply:(session:PlanEditorSession)=>void}){
 const original=session.exercises.filter(e=>group&&e.supersetGroup===group);
 const [ids,setIds]=useState(original.map(e=>e.reviewId!));
 const [label,setLabel]=useState(group??`SS${Array.from({length:51},(_,i)=>i+1).find(i=>!session.exercises.some(e=>e.supersetGroup===`SS${i}`))}`);
 const last=original.at(-1)?.sets[0];
 const [pause,setPause]=useState(last?.restSeconds?.toString()??'');const [pauseMax,setPauseMax]=useState(last?.restSecondsMax?.toString()??'');const [error,setError]=useState('');
 const move=(index:number,delta:number)=>setIds(current=>{const next=[...current];[next[index],next[index+delta]]=[next[index+delta],next[index]];return next;});
 function apply(dissolve=false){
  if(!dissolve&&(ids.length<2||!label.trim())){setError('Wybierz co najmniej dwa ćwiczenia i nazwę grupy.');return;}
  if(!dissolve&&label!==group&&session.exercises.some(e=>e.supersetGroup===label)){setError('Ta grupa już istnieje. Edytuj ją lub wybierz inną nazwę.');return;}
  const seconds=pause===''?null:Number(pause),max=pauseMax===''?null:Number(pauseMax);
  if(!dissolve&&((seconds!==null&&(!Number.isInteger(seconds)||seconds<0||seconds>3600))||(max!==null&&(seconds===null||!Number.isInteger(max)||max<seconds||max>3600)))){setError('Podaj poprawny zakres przerwy.');return;}
  const next=structuredClone(session);for(const e of next.exercises)if(group&&e.supersetGroup===group)e.supersetGroup=null;
  if(!dissolve){
   const members=ids.map(id=>next.exercises.find(e=>e.reviewId===id)!);members.forEach(e=>{e.supersetGroup=label.trim();});
   const positions=members.map(e=>next.exercises.indexOf(e));const first=Math.min(...positions);
   next.exercises=next.exercises.filter(e=>!ids.includes(e.reviewId!));next.exercises.splice(first,0,...members);
   if(pause!==(last?.restSeconds?.toString()??'')||pauseMax!==(last?.restSecondsMax?.toString()??''))members.at(-1)!.sets.forEach(s=>{s.restSeconds=seconds;s.restSecondsMax=max;});
  }
  onApply(next);
 }
 return <form onSubmit={e=>{e.preventDefault();apply();}}>
  <label className="editor-field">Nazwa superserii<input maxLength={80} value={label} onChange={e=>setLabel(e.target.value)}/></label>
  <fieldset className="review-group-members"><legend>Ćwiczenia w grupie</legend>{session.exercises.map(e=><label key={e.reviewId}><input type="checkbox" checked={ids.includes(e.reviewId!)} onChange={event=>setIds(current=>event.target.checked?[...current,e.reviewId!]:current.filter(id=>id!==e.reviewId))}/><span>{e.name}{e.supersetGroup&&e.supersetGroup!==group?` · obecnie ${e.supersetGroup}`:''}</span></label>)}</fieldset>
  <div className="review-group-order"><strong>Kolejność w superserii</strong>{ids.map((id,index)=><div key={id}><span>{index+1}. {session.exercises.find(e=>e.reviewId===id)!.name}</span><button type="button" aria-label={`W górę: ${session.exercises.find(e=>e.reviewId===id)!.name}`} disabled={!index} onClick={()=>move(index,-1)}>↑</button><button type="button" aria-label={`W dół: ${session.exercises.find(e=>e.reviewId===id)!.name}`} disabled={index===ids.length-1} onClick={()=>move(index,1)}>↓</button></div>)}</div>
  <div className="editor-grid"><label className="editor-field">Przerwa po grupie od (s)<input type="number" min={0} value={pause} onChange={e=>setPause(e.target.value)}/></label><label className="editor-field">Przerwa po grupie do (s)<input type="number" min={0} value={pauseMax} onChange={e=>setPauseMax(e.target.value)}/></label></div>
  <p className="review-hint">Wybrane ćwiczenia utworzą jeden blok w podanej kolejności. Zmiana przerwy dotyczy kończącego ćwiczenia.</p>
  {error&&<p className="auth-error" role="alert">{error}</p>}
  <div className="review-dialog-footer">{group&&<button type="button" className="review-danger" onClick={()=>apply(true)}>Rozłącz superserię</button>}<button className="button button-dark" type="submit">Zastosuj grupę</button></div>
 </form>;
}
