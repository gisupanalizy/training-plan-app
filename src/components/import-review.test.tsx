// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import real from '../../fixtures/t06/real/results/after-4.json';
import {validateDraft} from '@/lib/imports/domain';
import {importQuestions,type ImportQuestion} from '@/lib/imports/questions';
import {readReviewProgress,reviewFingerprint} from '@/lib/imports/review';
import {ImportReview} from './import-review';
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),refresh:vi.fn()})}));
vi.mock('./import-source',()=>({ImportSource:()=> <p>Oryginalny dokument</p>,pageFromReference:(r:string)=>Number(/strona\s+(\d+)/i.exec(r)?.[1])||null}));
const requests:{url:string;body:Record<string,unknown>}[]=[];
beforeEach(()=>{requests.length=0;vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{requests.push({url,body:JSON.parse(String(init.body))});return {ok:true,json:async()=>({saved:true})};}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
function props(index=0){const raw=real.rows[index].result.job.draft;const {document,issues}=validateDraft(raw);return {id:'00000000-0000-4000-8000-000000000007',kind:index?'xlsx':'pdf',text:'',initial:document,rawDraft:raw as unknown as Record<string,unknown>,questions:importQuestions(raw,issues)};}
it('zaczyna od krótkiej listy ćwiczeń bez otwartego źródła i formularzy serii',async()=>{
 render(<ImportReview {...props()}/>);
 expect(screen.getAllByRole('heading',{level:3})).toHaveLength(10);expect(screen.queryByRole('spinbutton')).toBeNull();expect(screen.queryByText('Oryginalny dokument')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Potwierdź ćwiczenia'}));await screen.findByRole('heading',{name:'Serie i superserie'});
 expect(screen.getByText('7–8 serii × 1 powtórzenie')).toBeTruthy();expect(screen.getByText('Ósma seria opcjonalna')).toBeTruthy();expect(screen.queryByRole('spinbutton')).toBeNull();
 expect(requests[0].body.progress).toMatchObject({step:'structure',exercisesConfirmed:expect.any(String)});
});
it('edytuje cały blok, zachowuje ID/uwagi/optional i odrzuca niezastosowany formularz',async()=>{
 const p=props();render(<ImportReview {...p} progress={{...readReviewProgress(null,p.initial),step:'structure'}}/>);
 const card=screen.getByRole('heading',{name:'Nauka stania na rękach'}).closest('article')!;
 const button=within(card).getByRole('button',{name:'Edytuj blok'});button.focus();fireEvent.click(button);
 let dialog=screen.getByRole('dialog');fireEvent.change(within(dialog).getByLabelText('Powtórzenia od'),{target:{value:'2'}});
 expect(within(dialog).getByText('7–8 serii × 2 powtórzenia')).toBeTruthy();fireEvent(dialog,new Event('cancel',{cancelable:true}));
 expect(screen.queryByRole('dialog')).toBeNull();expect(screen.getByText('7–8 serii × 1 powtórzenie')).toBeTruthy();expect(document.activeElement).toBe(button);
 fireEvent.click(button);dialog=screen.getByRole('dialog');fireEvent.change(within(dialog).getByLabelText('Powtórzenia od'),{target:{value:'2'}});fireEvent.click(within(dialog).getByRole('button',{name:'Zastosuj zmiany'}));
 expect(screen.getByText('7–8 serii × 2 powtórzenia')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Zapisz korektę'}));await waitFor(()=>expect(requests).toHaveLength(1));
 const saved=requests[0].body.document as typeof p.initial;const old=p.initial.sessions[0].exercises[0],next=saved.sessions[0].exercises[0];
 expect(next.sets.map(s=>s.reviewId)).toEqual(old.sets.map(s=>s.reviewId));expect(next.sets.map(s=>s.note)).toEqual(old.sets.map(s=>s.note));expect(next.sets.map(s=>s.isOptional)).toEqual(old.sets.map(s=>s.isOptional));expect(next.sets.every(s=>s.repsMin===2)).toBe(true);
});
it('pozostaje w kroku pierwszym po błędzie zapisu i pozwala ponowić',async()=>{
 const fetch=vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue({ok:true,json:async()=>({saved:true})});vi.stubGlobal('fetch',fetch);
 render(<ImportReview {...props()}/>);fireEvent.click(screen.getByRole('button',{name:'Potwierdź ćwiczenia'}));await screen.findByRole('alert');expect(screen.getByRole('heading',{name:'Ćwiczenia'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Potwierdź ćwiczenia'}));await screen.findByRole('heading',{name:'Serie i superserie'});expect(fetch).toHaveBeenCalledTimes(2);
});
it('wybór ankiety jest etapowy, ma podgląd i nie zmienia danych przed zastosowaniem',async()=>{
 render(<ImportReview {...props(1)}/>);fireEvent.click(screen.getByRole('button',{name:/Wyjaśnij niejasności/}));
 const dialog=screen.getByRole('dialog');expect(within(dialog).getAllByRole('radiogroup')).toHaveLength(1);
 fireEvent.click(within(dialog).getByRole('radio',{name:/Maszyna/}));expect(within(dialog).getByText('Po zastosowaniu')).toBeTruthy();
 fireEvent.click(within(dialog).getByRole('button',{name:'Zastosuj odpowiedź'}));await waitFor(()=>expect(within(dialog).getByRole('radio',{name:/Sztanga/})).toBeTruthy());
 fireEvent.click(within(dialog).getByRole('button',{name:'Później'}));fireEvent.click(within(dialog).getByRole('button',{name:'Wróć do planu'}));
 fireEvent.click(screen.getByRole('button',{name:'Zapisz korektę'}));await waitFor(()=>expect(requests).toHaveLength(1));
 expect(Object.keys(requests[0].body.answers as object)).toHaveLength(1);
});
it('przywraca krok podsumowania i blokuje publikację przy niejasnościach',()=>{
 const p=props(),progress={step:'summary' as const,exercisesConfirmed:reviewFingerprint(p.initial,'exercises'),structureConfirmed:reviewFingerprint(p.initial,'structure')};
 render(<ImportReview {...p} progress={progress}/>);expect(screen.getByRole('heading',{name:'Podsumowanie'})).toBeTruthy();expect(screen.getByRole('button',{name:'Zatwierdź i utwórz plan'}).hasAttribute('disabled')).toBe(true);
});
it('ankieta 55 pytań pokazuje jedno pytanie naraz i Później nie rozwiązuje pominiętego pytania',()=>{
 const p=props();const questions:ImportQuestion[]=Array.from({length:55},(_,index)=>({id:`unresolved:${index}`,path:'sessions',scope:'source',context:'Całe źródło',prompt:`Pytanie ${index}`,reason:`Niejasność ${index}`,answerType:'choice',required:true,unit:null,min:null,max:null,options:[{value:'reviewed',label:'Sprawdziłem'}]}));
 render(<ImportReview {...p} questions={questions} progress={{...readReviewProgress(null,p.initial),step:'structure'}}/>);
 fireEvent.click(screen.getByRole('button',{name:'Wyjaśnij niejasności (55)'}));let dialog=screen.getByRole('dialog');expect(within(dialog).getByText('Niejasność 0')).toBeTruthy();expect(within(dialog).queryByText('Niejasność 1')).toBeNull();
 fireEvent.click(within(dialog).getByRole('button',{name:'Później'}));dialog=screen.getByRole('dialog');expect(within(dialog).getByText('Niejasność 1')).toBeTruthy();fireEvent.click(within(dialog).getByRole('button',{name:'Zamknij okno'}));expect(screen.getByRole('button',{name:'Wyjaśnij niejasności (55)'})).toBeTruthy();
});
it('anulowanie dodawania nie pozostawia pustego ćwiczenia',()=>{
 render(<ImportReview {...props()}/>);fireEvent.click(screen.getByRole('button',{name:'+ Dodaj ćwiczenie'}));fireEvent.change(screen.getByLabelText('Nazwa ćwiczenia'),{target:{value:'Nie dodawaj'}});fireEvent.click(screen.getByRole('button',{name:'Zamknij okno'}));expect(screen.getAllByRole('heading',{level:3})).toHaveLength(10);expect(screen.queryByText('Nie dodawaj')).toBeNull();
});
it('edycja indywidualna zachowuje różne cele oraz opcjonalność ósmej serii',async()=>{
 const p=props();render(<ImportReview {...p} progress={{...readReviewProgress(null,p.initial),step:'structure'}}/>);
 const card=screen.getByRole('heading',{name:'Nauka stania na rękach'}).closest('article')!;fireEvent.click(within(card).getByRole('button',{name:'Edytuj pojedyncze serie'}));
 const dialog=screen.getByRole('dialog');const select=within(dialog).getByLabelText('Wybierz serię');fireEvent.change(select,{target:{value:p.initial.sessions[0].exercises[0].sets[7].reviewId}});fireEvent.change(within(dialog).getByLabelText('Powtórzenia od'),{target:{value:'3'}});fireEvent.click(within(dialog).getByRole('button',{name:'Zastosuj zmiany'}));
 expect(within(card).getByText('7 × 1 + 1 × 3')).toBeTruthy();expect(within(card).getByText('Ósma seria opcjonalna')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Zapisz korektę'}));await waitFor(()=>expect(requests).toHaveLength(1));
 const saved=requests[0].body.document as typeof p.initial;expect(saved.sessions[0].exercises[0].sets.map(s=>s.repsMin)).toEqual([1,1,1,1,1,1,1,3]);
});
it('rozłącza superserię bez zmiany celów i oryginałów',async()=>{
 const p=props();render(<ImportReview {...p} progress={{step:'structure',exercisesConfirmed:reviewFingerprint(p.initial,'exercises'),structureConfirmed:null}}/>);
 const group=screen.getByText('Superseria 5').closest('section')!;fireEvent.click(within(group).getByRole('button',{name:'Edytuj grupę'}));fireEvent.click(screen.getByRole('button',{name:'Rozłącz superserię'}));expect(screen.queryByText('Superseria 5')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Zapisz korektę'}));await waitFor(()=>expect(requests).toHaveLength(1));const saved=requests[0].body.document as typeof p.initial;
 expect(saved.sessions[0].exercises.slice(4,7).every(e=>e.supersetGroup===null)).toBe(true);expect(saved.sessions[0].exercises.map(e=>e.originalName)).toEqual(p.initial.sessions[0].exercises.map(e=>e.originalName));expect(saved.sessions[0].exercises.map(e=>e.sets)).toEqual(p.initial.sessions[0].exercises.map(e=>e.sets));
});
it('tworzy grupę i zmienia kolejność bez utraty celów, ale wymaga ponownego przeglądu listy',async()=>{
 const p=props();render(<ImportReview {...p} progress={{step:'structure',exercisesConfirmed:reviewFingerprint(p.initial,'exercises'),structureConfirmed:null}}/>);
 fireEvent.click(screen.getByRole('button',{name:'+ Utwórz superserię'}));const dialog=screen.getByRole('dialog');
 fireEvent.click(within(dialog).getByRole('checkbox',{name:'Nauka stania na rękach'}));fireEvent.click(within(dialog).getByRole('checkbox',{name:'Muscle-up z gumą'}));
 fireEvent.click(within(dialog).getByRole('button',{name:'W górę: Muscle-up z gumą'}));fireEvent.click(within(dialog).getByRole('button',{name:'Zastosuj grupę'}));
 expect(screen.getByText('Superseria 1')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Zapisz korektę'}));await waitFor(()=>expect(requests).toHaveLength(1));
 const saved=requests[0].body.document as typeof p.initial;expect(saved.sessions[0].exercises.slice(0,2).map(e=>e.name)).toEqual(['Muscle-up z gumą','Nauka stania na rękach']);expect(saved.sessions[0].exercises[1].sets).toEqual(p.initial.sessions[0].exercises[0].sets);expect(requests[0].body.progress).toMatchObject({exercisesConfirmed:null,structureConfirmed:null});
});
it('ponawia zatwierdzenie tym samym ID bez PATCH, jeśli odpowiedź z publikacji zaginęła',async()=>{
 const p=props();let approved=0;const approveBodies:Record<string,unknown>[]=[];let patches=0;
 vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{
  if(url.endsWith('/approve')){approveBodies.push(JSON.parse(String(init.body)));if(++approved===1)throw new Error('lost response after commit');return {ok:true,json:async()=>({planId:'00000000-0000-4000-8000-000000000099'})};}
  patches++;return approved?{ok:false,json:async()=>({error:'Szkic zatwierdzony'})}:{ok:true,json:async()=>({saved:true})};
 }));
 render(<ImportReview {...p} questions={[]} progress={{step:'summary',exercisesConfirmed:reviewFingerprint(p.initial,'exercises'),structureConfirmed:reviewFingerprint(p.initial,'structure')}}/>);
 fireEvent.click(screen.getByRole('button',{name:'Zatwierdź i utwórz plan'}));await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'Zatwierdź i utwórz plan'}));await waitFor(()=>expect(approveBodies).toHaveLength(2));
 expect(patches).toBe(1);expect(approveBodies[0]).toEqual(approveBodies[1]);
});
