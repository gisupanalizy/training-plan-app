import { emptySet, withReviewIds, type PlanEditorDocument, type PlanEditorExercise, type PlanEditorSession } from '../domain/plan-editor';
import type { PlannedSetInput } from '../domain/model';
import { formatRange } from '../domain/format';
import { questionState, questionTargets, type ImportQuestion } from './questions';

export type ReviewStep = 'exercises' | 'structure' | 'summary';
export type ReviewProgress = { step: ReviewStep; exercisesConfirmed: string | null; structureConfirmed: string | null };
export const trainingKeys = ['kind','repsMin','repsMax','isAmrap','loadType','targetKg','targetKgMax','targetPercent','bodyweightAdjustment','bodyweightDeltaKg','dumbbellBasis','durationSeconds','durationSecondsMax','distanceMeters','restSeconds','restSecondsMax','tempo','targetRpe','targetRir'] as const;
export type SeriesBlock = { sets: PlannedSetInput[]; minimum: number; maximum: number };
export const hasSetGoal = (set: PlannedSetInput) => set.isAmrap || set.repsMin !== null || set.durationSeconds !== null || set.distanceMeters !== null;
const signature = (set: PlannedSetInput) => JSON.stringify(trainingKeys.map(key => set[key] ?? null));
export function seriesBlocks(exercise: PlanEditorExercise): SeriesBlock[] {
 const groups: PlannedSetInput[][]=[];
 for(const set of exercise.sets){const last=groups.at(-1);if(last && signature(last[0])===signature(set))last.push(set);else groups.push([set]);}
 return groups.map(sets=>({sets,minimum:exercise.isOptional && groups.length===1 ? exercise.setCountMin??sets.length : sets.filter(s=>!s.isOptional).length, maximum:sets.length}));
}
const polishNumber=(value:number,forms:[string,string,string])=>value===1?forms[0]:Number.isInteger(value)&&value%10>=2&&value%10<=4&&!(value%100>=12&&value%100<=14)?forms[1]:forms[2];
export function goalLabel(set: PlannedSetInput, compact=false): string {
 if(set.isAmrap)return compact?'maks. powt.':'maksymalna liczba powtórzeń';
 const goals:string[]=[];
 if(set.repsMin!==null)goals.push(`${formatRange(set.repsMin,set.repsMax)}${compact?'':` ${polishNumber(set.repsMax??set.repsMin,['powtórzenie','powtórzenia','powtórzeń'])}`}`);
 if(set.durationSeconds!==null)goals.push(`${formatRange(set.durationSeconds,set.durationSecondsMax)} s`);
 if(set.distanceMeters!==null)goals.push(`${set.distanceMeters} m`);
 return goals.join(' + ') || 'Cel do wyjaśnienia';
}
export function loadLabel(set: PlannedSetInput): string {
 if(set.loadType==='absolute')return `${formatRange(set.targetKg,set.targetKgMax)} kg${set.dumbbellBasis==='per_hand'?' / rękę':set.dumbbellBasis==='total'?' łącznie':''}`;
 if(set.loadType==='percent_1rm')return `${set.targetPercent??'—'}% 1RM`;
 if(set.loadType==='bodyweight')return set.bodyweightAdjustment==='additional'?`masa ciała + ${set.bodyweightDeltaKg??'—'} kg`:set.bodyweightAdjustment==='assistance'?`asysta ${set.bodyweightDeltaKg??'—'} kg`:'masa ciała';
 return 'Obciążenie niepodane';
}
export const restLabel=(set:PlannedSetInput)=>set.restSeconds===null?'Przerwa niepodana':set.restSeconds===0&&!set.restSecondsMax?'Bez przerwy':`Przerwa ${formatRange(set.restSeconds,set.restSecondsMax)} s`;
export function exerciseSummary(exercise:PlanEditorExercise, unknownCount=false):string{
 const blocks=seriesBlocks(exercise);
 if(unknownCount)return `Liczba serii do wyjaśnienia · ${goalLabel(exercise.sets[0])}`;
 if(blocks.length===1){const block=blocks[0],count=formatRange(block.minimum||block.maximum,block.maximum);return `${count} ${polishNumber(block.maximum,['seria','serie','serii'])} × ${goalLabel(block.sets[0])}`;}
 return blocks.map(b=>`${formatRange(b.minimum||b.maximum,b.maximum)} × ${goalLabel(b.sets[0],true)}`).join(' + ');
}
export function optionalLabel(exercise:PlanEditorExercise):string|null{
 if(exercise.isOptional)return 'Ćwiczenie opcjonalne';
 const optional=exercise.sets.filter(s=>s.isOptional).map(s=>s.position);
 if(!optional.length)return null;
 if(optional.length===1&&optional[0]===8)return 'Ósma seria opcjonalna';
 return `${optional.length===1?'Seria':'Serie'} ${optional.join(', ')} ${optional.length===1?'opcjonalna':'opcjonalne'}`;
}
export function reviewFingerprint(document:PlanEditorDocument,kind:'exercises'|'structure'):string{
 const value=kind==='exercises'?{sessions:document.sessions.map(s=>({id:s.reviewId,week:s.weekNumber,day:s.dayLabel,exercises:s.exercises.map(e=>({id:e.reviewId,exerciseId:e.exerciseId,name:e.name,original:e.originalName,variant:e.variant,equipment:e.equipment}))}))}:document.sessions;
 const stable=(item:unknown):unknown=>Array.isArray(item)?item.map(stable):item&&typeof item==='object'?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b)).map(([key,entry])=>[key,stable(entry)])):item;
 const text=JSON.stringify(stable(value));let a=2166136261,b=5381;
 for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=Math.imul(b,33)^text.charCodeAt(i);}
 // Sygnał zmiany UI; nie jest podpisem bezpieczeństwa ani uprawnieniem do zapisu.
 return `${(a>>>0).toString(16).padStart(8,'0')}${(b>>>0).toString(16).padStart(8,'0')}`;
}
export function readReviewProgress(value:unknown,document:PlanEditorDocument):ReviewProgress{
 if(value==null)return {step:'exercises',exercisesConfirmed:null,structureConfirmed:null};
 if(typeof value!=='object'||Array.isArray(value))throw new Error('Niepoprawny etap przeglądu.');
 const input=value as Record<string,unknown>;
 if(!['exercises','structure','summary'].includes(String(input.step)) || [input.exercisesConfirmed,input.structureConfirmed].some(v=>v!==null&&(typeof v!=='string'||!/^[0-9a-f]{16}$/.test(v))))throw new Error('Niepoprawne potwierdzenia przeglądu.');
 const exercisesConfirmed=input.exercisesConfirmed===reviewFingerprint(document,'exercises')?input.exercisesConfirmed:null;
 return {step:input.step as ReviewStep,exercisesConfirmed,structureConfirmed:exercisesConfirmed&&input.structureConfirmed===reviewFingerprint(document,'structure')?input.structureConfirmed as string:null};
}
export function changedReview(document:PlanEditorDocument,next:PlanEditorDocument,progress:ReviewProgress,questions:ImportQuestion[],answers:Record<string,unknown>){
 const stale=new Set(questions.filter(q=>JSON.stringify(questionState(q,document))!==JSON.stringify(questionState(q,next))).map(q=>q.id));
 return {progress:readReviewProgress(progress,next),answers:Object.fromEntries(Object.entries(answers).filter(([id])=>!stale.has(id)))};
}
export const questionStep=(q:ImportQuestion):ReviewStep=>/^(missing_day_label|equipment_basis|missing_name):/.test(q.id)?'exercises':'structure';
export function sortReviewQuestions(questions:ImportQuestion[],document:PlanEditorDocument){
 const positions=new Map(document.sessions.flatMap((s,si)=>s.exercises.map((e,ei)=>[e.reviewId!,si*100+ei] as const)));
 const position=(q:ImportQuestion)=>q.scope==='source'?Number.MAX_SAFE_INTEGER:Math.min(...questionTargets(q,document).map(t=>t.exercise?positions.get(t.exercise.reviewId!)??Number.MAX_SAFE_INTEGER:document.sessions.indexOf(t.session)*100-1));
 return [...questions].sort((a,b)=>position(a)-position(b));
}
export function questionsForExercise(questions:ImportQuestion[],document:PlanEditorDocument,id:string){return questions.filter(q=>questionTargets(q,document).some(t=>t.exercise?.reviewId===id));}
export function resizeSeriesBlock(exercise:PlanEditorExercise,ids:string[],minimum:number,maximum:number){
 if(!Number.isInteger(minimum)||!Number.isInteger(maximum)||minimum<0||maximum<1||maximum<minimum||maximum>30)throw new Error('Podaj poprawny zakres liczby serii.');
 const selected=exercise.sets.filter(s=>ids.includes(s.reviewId!));
 if(!selected.length)throw new Error('Nie znaleziono bloku serii.');
 if(exercise.sets.length-selected.length+maximum>30)throw new Error('Ćwiczenie może mieć najwyżej 30 serii.');
 const oldMinimum=exercise.isOptional&&selected.length===exercise.sets.length?exercise.setCountMin??selected.length:selected.filter(s=>!s.isOptional).length;
 const first=exercise.sets.indexOf(selected[0]);
 const replacements=Array.from({length:maximum},(_,index)=>({...structuredClone(selected[index]??selected[0]),reviewId:selected[index]?.reviewId??crypto.randomUUID(),isOptional:exercise.isOptional||index>=minimum}));
 exercise.sets.splice(first,selected.length,...replacements);
 exercise.sets.forEach((s,index)=>{s.position=index+1;});
 exercise.setCountMax=exercise.sets.length;
 exercise.setCountMin=exercise.isOptional?Math.max(1,Math.min(exercise.sets.length,(exercise.setCountMin??exercise.sets.length)-oldMinimum+minimum)):exercise.sets.filter(s=>!s.isOptional).length;
 if(exercise.setCountMin<1)throw new Error('Zachowaj co najmniej jedną wymaganą serię lub oznacz całe ćwiczenie jako opcjonalne.');
}
export function patchSeries(exercise:PlanEditorExercise,ids:string[],original:PlannedSetInput,edited:PlannedSetInput){
 const changed=trainingKeys.filter(key=>(original[key]??null)!==(edited[key]??null));
 for(const set of exercise.sets)if(ids.includes(set.reviewId!))for(const key of changed)(set as unknown as Record<string,unknown>)[key]=edited[key]??null;
}
export function sessionGroups(session:PlanEditorSession){
 const seen=new Set<string>();return session.exercises.flatMap<{id:string;label:string|null;exercises:PlanEditorExercise[]}>(e=>{if(!e.supersetGroup)return [{id:e.reviewId!,label:null,exercises:[e]}];if(seen.has(e.supersetGroup))return [];seen.add(e.supersetGroup);return [{id:e.supersetGroup,label:e.supersetGroup,exercises:session.exercises.filter(x=>x.supersetGroup===e.supersetGroup)}];});
}
export function groupProblems(document:PlanEditorDocument):string[]{
 return document.sessions.flatMap(s=>sessionGroups(s).flatMap(group=>{if(!group.label)return [];const indices=group.exercises.map(e=>s.exercises.indexOf(e));return group.exercises.length<2?[`${s.dayLabel}: ${group.label} wymaga co najmniej dwóch ćwiczeń.`]:indices.at(-1)!-indices[0]+1!==indices.length?[`${s.dayLabel}: uporządkuj ćwiczenia ${group.label} w jednym bloku.`]:[];}));
}
export function newReviewExercise(name='Nowe ćwiczenie'):PlanEditorExercise{return {reviewId:crypto.randomUUID(),exerciseId:null,name,originalName:null,variant:null,equipment:null,supersetGroup:null,note:null,sets:[{...emptySet(1),reviewId:crypto.randomUUID()}]};}
export { withReviewIds };
