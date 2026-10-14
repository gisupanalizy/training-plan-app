import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {validateDraft} from './domain';
import {applyQuestionAnswer,importQuestions,questionTargets} from './questions';
import {changedReview,exerciseSummary,patchSeries,readReviewProgress,resizeSeriesBlock,reviewFingerprint,seriesBlocks,groupProblems} from './review';
const report=JSON.parse(readFileSync('fixtures/t06/real/results/after-4.json','utf8'));
const source=()=>validateDraft(report.rows[0].result.job.draft).document;
it('pokazuje 7–8 × 1 i złożone 2×6 + 1–2×3 bez rozwijania formularzy',()=>{
 const d=source();expect(exerciseSummary(d.sessions[0].exercises[0])).toBe('7–8 serii × 1 powtórzenie');
 expect(exerciseSummary(d.sessions[2].exercises[0])).toBe('2 × 6 + 1–2 × 3');expect(groupProblems(d)).toEqual([]);
});
it('nie łączy nieprzylegających ani pustych celów i zachowuje uwagi oraz opcjonalność',()=>{
 const e=source().sessions[0].exercises[0];e.sets[0].repsMin=null;
 expect(seriesBlocks(e).map(b=>b.sets.length)).toEqual([1,7]);expect(exerciseSummary(e)).toContain('Cel do wyjaśnienia');
 e.sets[3].repsMin=4;expect(seriesBlocks(e).map(b=>b.sets.length)).toEqual([1,2,1,4]);
 const ids=e.sets.map(s=>s.reviewId),notes=e.sets.map(s=>s.note),optional=e.sets.map(s=>s.isOptional);
 const before=structuredClone(e.sets[1]),after={...before,repsMin:2};patchSeries(e,e.sets.slice(1,3).map(s=>s.reviewId!),before,after);
 expect(e.sets.map(s=>s.reviewId)).toEqual(ids);expect(e.sets.map(s=>s.note)).toEqual(notes);expect(e.sets.map(s=>s.isOptional)).toEqual(optional);expect(e.sets.map(s=>s.repsMin)).toEqual([null,2,2,4,1,1,1,1]);
});
it('zmiana liczby serii bloku nie kopiuje celu z innego bloku',()=>{
 const e=source().sessions[2].exercises[0];const ids=e.sets.slice(2).map(s=>s.reviewId!);resizeSeriesBlock(e,ids,2,3);
 expect(e.sets.map(s=>s.repsMin)).toEqual([6,6,3,3,3]);expect(e.setCountMin).toBe(4);expect(e.sets.at(-1)?.isOptional).toBe(true);
});
it('potwierdzenie nazw przetrwa zmianę celu; kolejność unieważnia oba kroki',()=>{
 const d=source(),p={step:'summary' as const,exercisesConfirmed:reviewFingerprint(d,'exercises'),structureConfirmed:reviewFingerprint(d,'structure')};
 const next=structuredClone(d);next.sessions[0].exercises[0].sets[0].repsMin=2;
 expect(readReviewProgress(p,next)).toMatchObject({exercisesConfirmed:p.exercisesConfirmed,structureConfirmed:null});
 next.sessions[0].exercises.reverse();expect(readReviewProgress(p,next)).toMatchObject({exercisesConfirmed:null,structureConfirmed:null});expect(readReviewProgress(null,d).step).toBe('exercises');expect(()=>readReviewProgress({step:'bad'},d)).toThrow();
});
it('potwierdzenia nie zależą od kolejności kluczy JSONB ani zmiany tytułu planu',()=>{
 const d=source();const reorder=(v:unknown):unknown=>Array.isArray(v)?v.map(reorder):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,value])=>[k,reorder(value)])):v;
 expect(reviewFingerprint(reorder(d) as typeof d,'structure')).toBe(reviewFingerprint(d,'structure'));
 const next={...d,name:'Nowy tytuł'};expect(reviewFingerprint(next,'exercises')).toBe(reviewFingerprint(d,'exercises'));expect(reviewFingerprint(next,'structure')).toBe(reviewFingerprint(d,'structure'));
});
it('odpowiedź znajduje ćwiczenie po przeniesieniu do innego treningu, a korekta unieważnia tylko związane odpowiedzi',()=>{
 const raw=structuredClone(report.rows[1].result.job.draft);const {document:d,issues}=validateDraft(raw);const q=importQuestions(raw,issues).find(q=>q.id.startsWith('dumbbell_basis:'))!;
 const originalTarget=questionTargets(q,d)[0].exercise!;d.sessions[0].exercises=d.sessions[0].exercises.filter(e=>e.reviewId!==originalTarget.reviewId);d.sessions[1].exercises.push(originalTarget);
 applyQuestionAnswer(d,q,'per_hand');expect(questionTargets(q,d).every(t=>t.set?.dumbbellBasis==='per_hand')).toBe(true);
 const next=structuredClone(d);questionTargets(q,next)[0].set!.dumbbellBasis='total';
 const changed=changedReview(d,next,readReviewProgress(null,d),[q],{[q.id]:'per_hand',unrelated:'reviewed'});
 expect(changed.answers).toEqual({unrelated:'reviewed'});
});
it('potwierdzenie konwencji przerwy pozostaje po zmianie powtórzeń, ale znika po zmianie przerwy',()=>{
 const d=source();const q=importQuestions(report.rows[0].result.job.draft,validateDraft(report.rows[0].result.job.draft).issues)[0];const p=readReviewProgress(null,d),answers={[q.id]:'reviewed'};
 const next=structuredClone(d);next.sessions[0].exercises[0].sets[0].repsMin=2;expect(changedReview(d,next,p,[q],answers).answers).toEqual(answers);
 next.sessions[0].exercises[0].sets[0].restSeconds=90;expect(changedReview(d,next,p,[q],answers).answers).toEqual({});
});
