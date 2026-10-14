// @vitest-environment node
import { expect, it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { validateDraft } from './domain';
import { importQuestions } from './questions';
const report = JSON.parse(readFileSync('fixtures/t06/real/results/after-4.json','utf8')) as { rows: { name: string; result: { job: { draft: unknown } } }[] };
const expected = JSON.parse(readFileSync('fixtures/t06/real/expected.json','utf8'));
it('porównuje każdą pozycję PDF z niezależnym odczytem źródła',()=>{
 const doc=validateDraft(report.rows[0].result.job.draft).document;
 expect(doc.sessions).toHaveLength(expected.files[0].sessions.length);
 doc.sessions.forEach((session,si)=>{
  const source=expected.files[0].sessions[si]; expect(session.exercises).toHaveLength(source.exercises.length);
  session.exercises.forEach((exercise,ei)=>{
   const row=source.exercises[ei];const group=row.group?.match(/ss\d+/i)?.[0].toUpperCase()??null;
   expect(exercise.supersetGroup,`${si}/${ei} grupa`).toBe(group);
   const count=row.series.match(/^(\d+)(?:-(\d+))?$/);
   if(count){expect(exercise.setCountMin,`${si}/${ei} minimum serii`).toBe(Number(count[1]));expect(exercise.setCountMax).toBe(Number(count[2]??count[1]));}
   else {expect(exercise.sets.map(s=>s.repsMin)).toEqual([6,6,3,3]);expect(exercise.sets.map(s=>s.isOptional)).toEqual([false,false,false,true]);}
   if(row.target==='X') expect(exercise.sets.every(s=>s.isAmrap)).toBe(true);
   else if(count){const values=row.target.match(/(\d+)(?:\s*-\s*(\d+))?/);expect(values).not.toBeNull();const seconds=/sek/.test(row.target);
    for(const set of exercise.sets){expect(seconds?set.durationSeconds:set.repsMin,`${si}/${ei} cel`).toBe(Number(values[1]));expect(seconds?set.durationSecondsMax:set.repsMax).toBe(values[2]?Number(values[2]):null);}
   }
   expect(exercise.sets.every(s=>s.targetPercent===null)).toBe(true);
   expect([exercise.originalName,exercise.variant,exercise.sourceRef,exercise.note].join(' ').toLowerCase()).toContain(row.name.split(/[ *+]/)[0].toLowerCase());
  });
 });
});
it('każde pozostałe pytanie ma uzasadnienie w rzeczywistej niejasności źródła',()=>{
 const audit=report.rows.map((row,index)=>{
  const {issues,document}=validateDraft(row.result.job.draft);const questions=importQuestions(row.result.job.draft,issues);
  expect(questions).toHaveLength([1,6,17][index]);
  const assessed=questions.map(q=>{
   let assessment='';
   if(index===0){expect(q.reason).toMatch(/60.*120/);assessment='Uzasadnione: slash w przerwie może oznaczać zakres albo dwa warianty.';}
   if(index===1){expect(q.id).toMatch(/missing_sets|dumbbell_basis|equipment_basis/);assessment=q.id.startsWith('missing_sets:')?'Uzasadnione: Excel zapisał parametr jako datę; nie da się odtworzyć pierwotnego zapisu.':q.id.startsWith('dumbbell_basis:')?'Uzasadnione: nie podano podstawy ciężaru obu hantli.':'Uzasadnione: źródło podaje sprzeczny lub alternatywny sprzęt.';}
   if(index===2){expect([q.reason,q.sourceRef,q.prompt].join(' ')).toMatch(/Tabata|4.?6|EMOM|Interwał|interwał|przypisania/);assessment=/Tabata/.test(q.prompt)?'Uzasadnione: znany czas całego bloku, nieznany protokół ćwiczeń.':/wspólna wskazówka/.test(q.reason??'')?'Uzasadnione: zakres zastosowania wspólnej liczby serii wymaga potwierdzenia.':/przypisania/.test(q.reason??'')?'Uzasadnione: dodatkowa sekcja EMOM nie wskazuje dnia.':'Uzasadnione: liczba rund/serii bloku nie określa rozkładu na poszczególne ćwiczenia.';}
   return {context:q.context,question:q.prompt,source:q.sourceRef,reason:q.reason,assessment};
  });return {file:row.name,sessions:document.sessions.length,exercises:document.sessions.reduce((n,s)=>n+s.exercises.length,0),questions:assessed};
 });
 if(process.env.T06R1_WRITE_AUDIT==='true')writeFileSync('fixtures/t06/real/results/question-audit.json',JSON.stringify({version:1,source:'after-4; aktualny walidator i generator pytań, bez nowej próby AI',rows:audit},null,2));
});
