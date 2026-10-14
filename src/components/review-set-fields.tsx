"use client";
import type { PlannedSetInput } from '@/lib/domain/model';
import { useState } from 'react';
const number=(value:string)=>value.trim()===''?null:Number(value);
export function ReviewSetFields({value,onChange,individual=false}:{value:PlannedSetInput;onChange:(set:PlannedSetInput)=>void;individual?:boolean}){
 const set=(key:keyof PlannedSetInput,v:unknown)=>onChange({...value,[key]:v});
 const numeric=(key:keyof PlannedSetInput,label:string,min=0,step='1')=><label className="editor-field" key={key}>{label}<input type="number" min={min} step={step} value={value[key] as number??''} onChange={e=>set(key,number(e.target.value))}/></label>;
 const [goal,setGoal]=useState(value.isAmrap?'amrap':value.repsMin!=null?'reps':value.durationSeconds!=null?'duration':value.distanceMeters!=null?'distance':'unknown');
 return <>
  <label className="editor-field">Cel serii<select value={goal} onChange={event=>{const kind=event.target.value;setGoal(kind);onChange({...value,isAmrap:kind==='amrap',repsMin:null,repsMax:null,durationSeconds:null,durationSecondsMax:null,distanceMeters:null});}}><option value="unknown">Wybierz cel</option><option value="reps">Powtórzenia</option><option value="amrap">Maksymalna liczba powtórzeń</option><option value="duration">Czas</option><option value="distance">Dystans</option></select></label>
  <div className="editor-grid">{goal==='reps'&&<>{numeric('repsMin','Powtórzenia od')}{numeric('repsMax','Powtórzenia do')}</>}{goal==='duration'&&<>{numeric('durationSeconds','Czas od (s)')}{numeric('durationSecondsMax','Czas do (s)')}</>}{goal==='distance'&&numeric('distanceMeters','Dystans (m)',0,'any')}</div>
  {goal==='amrap'&&<p className="review-hint">Seria na maksymalną liczbę powtórzeń, bez wpisywania konkretnej liczby.</p>}
  <label className="editor-field">Obciążenie<select value={value.loadType} onChange={event=>onChange({...value,loadType:event.target.value as PlannedSetInput['loadType'],targetKg:null,targetKgMax:null,targetPercent:null,bodyweightAdjustment:null,bodyweightDeltaKg:null})}><option value="unspecified">Nie podano</option><option value="absolute">Kilogramy</option><option value="percent_1rm">% rzeczywistego 1RM</option><option value="bodyweight">Masa ciała</option></select></label>
  <div className="editor-grid">{value.loadType==='absolute'&&<>{numeric('targetKg','Ciężar od (kg)',0,'0.01')}{numeric('targetKgMax','Ciężar do (kg)',0,'0.01')}</>}{value.loadType==='percent_1rm'&&numeric('targetPercent','Procent 1RM',0.01,'0.01')}
   {value.loadType==='bodyweight'&&<><label className="editor-field">Korekta masy ciała<select value={value.bodyweightAdjustment??'none'} onChange={event=>onChange({...value,bodyweightAdjustment:event.target.value as PlannedSetInput['bodyweightAdjustment'],bodyweightDeltaKg:null})}><option value="none">Bez korekty</option><option value="additional">Dodatkowe obciążenie</option><option value="assistance">Asysta</option></select></label>{value.bodyweightAdjustment&&value.bodyweightAdjustment!=='none'&&numeric('bodyweightDeltaKg','Korekta (kg)',0.01,'0.01')}</>}
   {value.loadType==='absolute'&&<label className="editor-field">Podstawa ciężaru hantli<select value={value.dumbbellBasis??''} onChange={event=>set('dumbbellBasis',event.target.value||null)}><option value="">Nie dotyczy / nieustalona</option><option value="per_hand">Na jedną rękę</option><option value="total">Łącznie</option></select></label>}
  </div>
  <div className="editor-grid">{numeric('restSeconds','Przerwa od (s)')}{numeric('restSecondsMax','Przerwa do (s)')}</div>
  <details className="review-more"><summary>Parametry dodatkowe</summary><div className="editor-grid"><label className="editor-field">Rodzaj serii<select value={value.kind} onChange={event=>set('kind',event.target.value)}><option value="work">Robocza</option><option value="warmup">Rozgrzewka</option><option value="ramp">Rampa</option><option value="backoff">Back-off</option><option value="drop">Drop</option></select></label><label className="editor-field">Tempo<input value={value.tempo??''} onChange={e=>set('tempo',e.target.value||null)}/></label>{numeric('targetRpe','RPE',0,'0.1')}{numeric('targetRir','RIR',0,'0.1')}</div>
   {individual&&<label className="editor-field">Uwagi do serii<textarea value={value.note??''} onChange={e=>set('note',e.target.value||null)}/></label>}
  </details>
 </>;
}
