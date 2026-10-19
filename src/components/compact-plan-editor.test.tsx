import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PlanEditor } from './plan-editor';
import { emptySet, type PlanEditorDocument } from '@/lib/domain/plan-editor';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); push.mockClear(); });
function fixture(): PlanEditorDocument {
  return { name: 'Plan A/B', sessions: ['A', 'B'].map((dayLabel, day) => ({ reviewId: `day-${day}`, weekNumber: day + 1, dayLabel, note: null,
    exercises: [{ reviewId: `exercise-${day}`, exerciseId: null, name: day ? 'Martwy ciąg' : 'Przysiad', originalName: 'Squat', variant: null, equipment: 'sztanga', supersetGroup: null, note: 'Wskazówka ćwiczenia',
      sets: [1, 2, 3].map(position => ({ ...emptySet(position), reviewId: `set-${day}-${position}`, repsMin: 8, repsMax: 10, loadType: 'absolute' as const, targetKg: 60, restSeconds: 90,
        note: `Uwagi ${position}`, sourceRef: `A${position}`, tempo: '3010', targetRpe: 0 })) }] })) };
}
function mount(initial = fixture(), catalog: { id: string; name: string; variant: string | null; equipment: string | null }[] = []) {
  return render(<PlanEditor initial={initial} planId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" expectedVersionId="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" catalog={catalog} />);
}
function server() { const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ planId: 'plan' }) }); vi.stubGlobal('fetch', mock); return mock; }
const click = (name: string) => {
  if (name === 'Edytuj serie' || name === 'Edytuj ćwiczenie' || name === '+ Dodaj blok serii') {
    fireEvent.click(screen.getAllByRole('button', { name: /^Edytuj ćwiczenie:/ })[0]);
    if (name === '+ Dodaj blok serii') { fireEvent.click(screen.getByRole('button', { name: '+ Dodaj serię' })); fireEvent.click(screen.getByRole('button', { name: 'Cały blok' })); }
  } else { if(name==='Edytuj trening') fireEvent.click(screen.getByText('Kolejność i ustawienia treningu')); fireEvent.click(screen.getByRole('button', { name })); }
};
async function publish(mock: ReturnType<typeof vi.fn>) { click('Opublikuj nową wersję'); await waitFor(() => expect(mock).toHaveBeenCalled()); return JSON.parse(mock.mock.calls.at(-1)![1].body).document as PlanEditorDocument; }

test('pokazuje jeden trening, kompaktowy blok i użyte parametry bez formularzy serii', () => {
  mount();
  expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
  expect(screen.getByRole('heading', { name: 'Przysiad' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Martwy ciąg' })).toBeNull();
  expect(screen.getByText('3 × 8–10')).toBeTruthy();
  click('Edytuj ćwiczenie'); expect(screen.getByLabelText('Tempo')).toHaveProperty('value','3010'); expect(screen.getByLabelText('RPE')).toHaveProperty('value','0'); click('Anuluj');
  fireEvent.change(screen.getByLabelText('Wybierz trening'), { target: { value: 'day-1' } });
  expect(screen.getByRole('heading', { name: 'Martwy ciąg' })).toBeTruthy();
  click('Podgląd całego planu');
  expect(screen.getByRole('dialog', { name: 'Podgląd całego planu' })).toBeTruthy();
  click('Edytuj: Przysiad');
  expect(screen.getByLabelText('Nazwa ćwiczenia')).toHaveProperty('value', 'Przysiad');
});

test('zmienia cały blok, zachowuje ID, indywidualne uwagi, źródła i inne treningi', async () => {
  const initial = fixture(), mock = server(); mount(initial);
  click('Edytuj serie');
  expect(screen.getByLabelText('Powtórzenia do')).toHaveProperty('value', '10');
  expect(screen.queryByLabelText('Ciężar do (kg)')).toBeNull();
  expect(screen.queryByLabelText('Podstawa ciężaru hantli')).toBeNull();
  fireEvent.change(screen.getByLabelText('Przerwa (s)'), { target: { value: '0' } });
  click('Zastosuj zmiany');
  expect(screen.getByText('60 kg')).toBeTruthy(); expect(screen.getByText('Bez przerwy')).toBeTruthy();
  const result = await publish(mock);
  expect(result.sessions[0].exercises[0].sets).toEqual(initial.sessions[0].exercises[0].sets.map(set => ({ ...set, restSeconds: 0 })));
  expect(result.sessions[1]).toEqual(initial.sessions[1]);
});

test('edycja pojedynczej serii rozdziela blok i zachowuje pozostałe cele', async () => {
  const initial = fixture(), mock = server(); mount(initial); click('Edytuj serie'); click('Pojedyncza seria');
  fireEvent.change(screen.getByLabelText('Wybierz serię'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Powtórzenia'), { target: { value: '9' } });
  click('Zastosuj zmiany');
  const result = await publish(mock), sets = result.sessions[0].exercises[0].sets;
  expect(sets[1]).toEqual({ ...initial.sessions[0].exercises[0].sets[1], repsMin: 9 });
  expect(sets[0]).toEqual(initial.sessions[0].exercises[0].sets[0]);
  expect(sets[2]).toEqual(initial.sessions[0].exercises[0].sets[2]);
});

test('anulowanie dodawania ćwiczenia, treningu i serii nie zmienia szkicu', async () => {
  const initial = fixture(), mock = server(); mount(initial);
  click('+ Dodaj ćwiczenie'); fireEvent.change(screen.getByLabelText('Nazwa ćwiczenia'), { target: { value: 'Odrzucone' } }); click('Anuluj');
  click('+ Dodaj trening'); fireEvent.change(screen.getByLabelText('Nazwa treningu'), { target: { value: 'Odrzucony dzień' } }); click('Zamknij okno');
  click('+ Dodaj blok serii'); fireEvent.change(screen.getByLabelText('Liczba serii'), { target: { value: '7' } }); click('Anuluj');
  expect(await publish(mock)).toEqual(initial);
});

test('waliduje fragment mimo nieukończonego ćwiczenia w innym treningu', () => {
  const initial = fixture(); initial.sessions[1].exercises[0].name = ''; mount(initial);
  click('Edytuj serie'); fireEvent.change(screen.getByLabelText('Przerwa (s)'), { target: { value: '60' } }); click('Zastosuj zmiany');
  expect(screen.queryByRole('dialog')).toBeNull(); expect(screen.getByText('60 kg')).toBeTruthy(); expect(screen.getByText('Przerwa 60 s')).toBeTruthy();
  click('Opublikuj nową wersję'); expect(screen.getByRole('alert').textContent).toMatch(/nazwy/);
});

test('wybiera prywatne ćwiczenie i przenosi je bez utraty ID lub parametrów', async () => {
  const initial = fixture(), mock = server(); const catalogId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  mount(initial, [{ id: catalogId, name: 'Wiosłowanie', variant: 'neutralny', equipment: 'hantle' }]);
  click('Edytuj ćwiczenie'); fireEvent.change(screen.getByLabelText('Zapisane ćwiczenie'), { target: { value: catalogId } });
  expect(screen.getByLabelText('Wariant')).toHaveProperty('disabled', true);
  fireEvent.change(screen.getByLabelText('Przypisanie do treningu'), { target: { value: 'day-1' } }); click('Zastosuj zmiany');
  expect(screen.getByRole('heading', { name: 'Wiosłowanie' })).toBeTruthy();
  // Przeniesienie ostatniego ćwiczenia zostawia jawnie pusty trening do uzupełnienia.
  fireEvent.change(screen.getByLabelText('Wybierz trening'), { target: { value: 'day-0' } });
  click('+ Dodaj ćwiczenie'); fireEvent.change(screen.getByLabelText('Nazwa ćwiczenia'), { target: { value: 'Nowe' } }); click('Zastosuj zmiany');
  const result = await publish(mock), moved = result.sessions[1].exercises[1];
  expect(moved).toEqual({ ...initial.sessions[0].exercises[0], name: 'Wiosłowanie', variant: 'neutralny', equipment: 'hantle', exerciseId: catalogId });
});

test('ukryte pola i złożony cel pozostają przy zmianie przerwy; zakres usuwa się świadomie', async () => {
  const initial = fixture(), mock = server(); initial.sessions[0].exercises[0].sets.forEach(set => { set.durationSeconds = 30; set.durationSecondsMax = 40; set.distanceMeters = 100; set.targetKgMax = 65; set.targetRir = 2; });
  mount(initial); click('Edytuj serie');
  expect(screen.getByLabelText('Cel serii')).toHaveProperty('value', 'mixed');
  fireEvent.change(screen.getByLabelText('Przerwa (s)'), { target: { value: '120' } });
  click('Usuń zakres: Ciężar (kg)'); click('Zastosuj zmiany');
  const result = await publish(mock);
  expect(result.sessions[0].exercises[0].sets).toEqual(initial.sessions[0].exercises[0].sets.map(set => ({ ...set, restSeconds: 120, targetKgMax: null })));
});

test('zmiana liczby serii złożonego bloku zachowuje jego cel i opcjonalność innych bloków', async () => {
  const initial = fixture(), exercise = initial.sessions[0].exercises[0], mock = server();
  exercise.sets = [1, 2, 3, 4].map(position => ({ ...exercise.sets[0], reviewId: `dip-${position}`, position, repsMin: position <= 2 ? 6 : 3, repsMax: null, isOptional: position === 4 }));
  exercise.setCountMin = 3; exercise.setCountMax = 4;
  mount(initial); click('Edytuj serie'); fireEvent.change(screen.getByLabelText('Blok serii'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Liczba serii do'), { target: { value: '3' } }); click('Zastosuj zmiany');
  const result = await publish(mock), sets = result.sessions[0].exercises[0].sets;
  expect(sets.map(set => set.repsMin)).toEqual([6, 6, 3, 3, 3]);
  expect(sets.map(set => !!set.isOptional)).toEqual([false, false, false, true, true]);
  expect(sets.slice(0, 4).map(set => set.reviewId)).toEqual(exercise.sets.map(set => set.reviewId));
});

test('timeout ponawia dokładny payload i blokuje edycję podczas zapisu', async () => {
  let reject!: (error: Error) => void;
  const mock = vi.fn().mockImplementationOnce(() => new Promise((_, no) => { reject = no; }))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ planId: 'plan' }) });
  vi.stubGlobal('fetch', mock); mount();
  fireEvent.change(screen.getByLabelText('Nazwa planu'), { target: { value: 'Poprawiony' } }); click('Opublikuj nową wersję');
  expect(screen.getByLabelText('Nazwa planu').closest('fieldset')?.disabled).toBe(true);
  reject(new Error('timeout')); await screen.findByRole('alert');
  click('Opublikuj nową wersję'); await waitFor(() => expect(mock).toHaveBeenCalledTimes(2));
  expect(mock.mock.calls[0][1].body).toBe(mock.mock.calls[1][1].body);
  await waitFor(() => expect(push).toHaveBeenCalledWith('/plany/plan'));
});

test('konflikt wersji zachowuje szkic, a zmiana dokumentu tworzy nową operację', async () => {
  const mock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Plan zmienił się w innej karcie. Odśwież edytor.' }) });
  vi.stubGlobal('fetch', mock); mount(); click('Opublikuj nową wersję'); await screen.findByRole('alert');
  fireEvent.change(screen.getByLabelText('Nazwa planu'), { target: { value: 'Nadal tutaj' } }); click('Opublikuj nową wersję'); await screen.findByRole('alert');
  expect(JSON.parse(mock.mock.calls[0][1].body).operationId).not.toBe(JSON.parse(mock.mock.calls[1][1].body).operationId);
  expect(screen.getByLabelText('Nazwa planu')).toHaveProperty('value', 'Nadal tutaj');
});

test('usuniecie istniejącego treningu wymaga potwierdzenia i można je anulować', async () => {
  const initial = fixture(), mock = server(); mount(initial);
  click('Edytuj trening'); click('Usuń trening'); click('Anuluj');
  expect(await publish(mock)).toEqual(initial);
});

test('opuszczenie edytora ostrzega o niezapisanych zmianach', () => {
  mount(); fireEvent.change(screen.getByLabelText('Nazwa planu'), { target: { value: 'Zmieniony' } });
  const unload = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(unload); expect(unload.defaultPrevented).toBe(true);
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const anchor = window.document.createElement('a'); anchor.href = '/plany'; window.document.body.append(anchor);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true }); anchor.dispatchEvent(event);
  expect(confirm).toHaveBeenCalled(); expect(event.defaultPrevented).toBe(true); anchor.remove();
  expect(within(screen.getByRole('status')).getByText('Niezapisane zmiany')).toBeTruthy();
});

test.each(['amrap', 'duration', 'distance', 'bodyweight', 'dumbbells'])('zachowuje cel i obciążenie %s podczas edycji innego pola', async type => {
  const initial = fixture(), mock = server();
  initial.sessions[0].exercises[0].sets.forEach(set => {
    if (type === 'amrap') { set.isAmrap = true; set.repsMin = null; set.repsMax = null; }
    if (type === 'duration') { set.repsMin = null; set.repsMax = null; set.durationSeconds = 0; set.durationSecondsMax = 30; }
    if (type === 'distance') { set.repsMin = null; set.repsMax = null; set.distanceMeters = 200; }
    if (type === 'bodyweight') { set.loadType = 'bodyweight'; set.targetKg = null; set.bodyweightAdjustment = 'assistance'; set.bodyweightDeltaKg = 10; }
    if (type === 'dumbbells') { set.dumbbellBasis = 'per_hand'; }
  });
  if (type === 'dumbbells') initial.sessions[0].exercises[0].equipment = 'hantle';
  mount(initial); click('Edytuj serie');
  fireEvent.change(screen.getByLabelText('Przerwa (s)'), { target: { value: '30' } }); click('Zastosuj zmiany');
  const result = await publish(mock);
  expect(result.sessions[0].exercises[0].sets).toEqual(initial.sessions[0].exercises[0].sets.map(set => ({ ...set, restSeconds: 30 })));
});

test('opcjonalność całego ćwiczenia obejmuje też edytowaną pojedynczą serię', async () => {
  const mock = server(); mount(); click('Edytuj serie'); click('Pojedyncza seria');
  fireEvent.click(screen.getByLabelText('Całe ćwiczenie opcjonalne')); click('Zastosuj zmiany');
  const result = await publish(mock), exercise = result.sessions[0].exercises[0];
  expect(exercise.isOptional).toBe(true); expect(exercise.sets.every(set => set.isOptional)).toBe(true);
});

test('zmiana nazwy i kolejności treningu jest stosowana razem, anulowanie zachowuje kolejność', async () => {
  const initial = fixture(), mock = server(); mount(initial); click('Edytuj trening');
  fireEvent.change(screen.getByLabelText('Nazwa treningu'), { target: { value: 'Siła' } });
  fireEvent.change(screen.getByLabelText('Pozycja treningu'), { target: { value: '1' } }); click('Anuluj');
  click('Edytuj trening'); expect(screen.getByLabelText('Nazwa treningu')).toHaveProperty('value', 'A');
  fireEvent.change(screen.getByLabelText('Nazwa treningu'), { target: { value: 'Siła' } });
  fireEvent.change(screen.getByLabelText('Pozycja treningu'), { target: { value: '1' } }); click('Zastosuj zmiany');
  const result = await publish(mock);
  expect(result.sessions).toEqual([initial.sessions[1], { ...initial.sessions[0], dayLabel: 'Siła' }]);
});

test('procent 1RM i dodatkowe obciążenie masy ciała pozostają po edycji ćwiczenia', async () => {
  const initial = fixture(), mock = server();
  initial.sessions[0].exercises[0].sets[0] = { ...initial.sessions[0].exercises[0].sets[0], loadType: 'percent_1rm', targetKg: null, targetPercent: 75 };
  initial.sessions[0].exercises[0].sets[1] = { ...initial.sessions[0].exercises[0].sets[1], loadType: 'bodyweight', targetKg: null, bodyweightAdjustment: 'additional', bodyweightDeltaKg: 5 };
  mount(initial); click('Edytuj ćwiczenie'); fireEvent.change(screen.getByLabelText('Uwagi do ćwiczenia'), { target: { value: 'Nowa wskazówka' } }); click('Zastosuj zmiany');
  const result = await publish(mock); expect(result.sessions[0].exercises[0].sets).toEqual(initial.sessions[0].exercises[0].sets);
});

test('odczyt okna nie ostrzega o zmianach, ale wpisanie i anulowanie poprawnie aktualizują ostrzeżenie', () => {
  mount(); click('Edytuj ćwiczenie');
  const before = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(before); expect(before.defaultPrevented).toBe(false);
  fireEvent.change(screen.getByLabelText('Nazwa ćwiczenia'), { target: { value: 'Niezastosowane' } });
  const during = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(during); expect(during.defaultPrevented).toBe(true);
  click('Anuluj'); const after = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(after); expect(after.defaultPrevented).toBe(false);
});

test('wybór ćwiczeń w superserii zachowuje stan checkboxów przy ostrzeganiu o zmianach', async () => {
  const initial = fixture(), mock = server();
  const other = structuredClone(initial.sessions[1].exercises[0]); initial.sessions[0].exercises.push(other);
  initial.sessions.splice(1, 1); mount(initial); click('+ Utwórz superserię');
  fireEvent.click(screen.getByLabelText('Przysiad')); fireEvent.click(screen.getByLabelText('Martwy ciąg'));
  expect(screen.getByLabelText('Przysiad')).toHaveProperty('checked', true);
  expect(screen.getByLabelText('Martwy ciąg')).toHaveProperty('checked', true);
  click('Zastosuj grupę'); const result = await publish(mock);
  expect(result.sessions[0].exercises.every(exercise => exercise.supersetGroup === 'SS1')).toBe(true);
});

test('pełny formularz atomowo stosuje nazwę i jedną serię, a cancel odrzuca obie zmiany', async () => {
 const initial = fixture(), mock = server(); mount(initial); click('Edytuj ćwiczenie');
 fireEvent.change(screen.getByLabelText('Nazwa ćwiczenia'), {target:{value:'Odrzucona nazwa'}}); click('Pojedyncza seria');
 fireEvent.change(screen.getByLabelText('Powtórzenia'), {target:{value:'2'}}); click('Anuluj');
 expect(await publish(mock)).toEqual(initial);
 click('Edytuj ćwiczenie'); fireEvent.change(screen.getByLabelText('Nazwa ćwiczenia'), {target:{value:'Nowa nazwa'}}); click('Pojedyncza seria');
 fireEvent.change(screen.getByLabelText('Wybierz serię'), {target:{value:'1'}}); fireEvent.change(screen.getByLabelText('Powtórzenia'), {target:{value:'7'}}); click('Zastosuj zmiany');
 const result = await publish(mock); expect(result.sessions[0].exercises[0].name).toBe('Nowa nazwa');
 expect(result.sessions[0].exercises[0].sets).toEqual(initial.sessions[0].exercises[0].sets.map((set,i)=> i===1 ? {...set,repsMin:7}:set));
});
test.each([false,true])('dodanie serii opcjonalnej=%s aktualizuje zakres i zachowuje indywidualną opcjonalność po przełączeniu całego ćwiczenia', async optional => {
 const initial=fixture(), ex=initial.sessions[0].exercises[0]; ex.sets[2].isOptional=true; ex.setCountMin=2; ex.setCountMax=3;
 const mock=server(); mount(initial); click('Edytuj ćwiczenie'); fireEvent.click(screen.getByLabelText('Całe ćwiczenie opcjonalne')); fireEvent.click(screen.getByLabelText('Całe ćwiczenie opcjonalne'));
 click('+ Dodaj serię'); if(optional)fireEvent.click(screen.getByLabelText('Seria opcjonalna')); click('Zastosuj zmiany'); const result=await publish(mock), changed=result.sessions[0].exercises[0];
 expect(changed.setCountMin).toBe(optional?2:3); expect(changed.setCountMax).toBe(4); expect(changed.sets.map(set=>!!set.isOptional)).toEqual([false,false,true,optional]);
 expect(changed.sets.slice(0,3)).toEqual(ex.sets.map(set=>({...set,isOptional:!!set.isOptional}))); expect(new Set(changed.sets.map(set=>set.reviewId)).size).toBe(4);
});
test('pusta lub niepoprawna liczba serii blokuje cały apply, cancel nie zmienia źródła', async () => {
 const initial=fixture(), mock=server(); mount(initial); click('Edytuj ćwiczenie');
 fireEvent.change(screen.getByLabelText('Liczba serii'), {target:{value:''}}); click('Zastosuj zmiany');
 expect(screen.getByRole('alert').textContent).toContain('Podaj poprawną liczbę serii'); expect(screen.getByRole('dialog')).toBeTruthy(); click('Anuluj'); expect(await publish(mock)).toEqual(initial);
});

test('rozszerzenie zakresu całego opcjonalnego ćwiczenia zachowuje minimum po wyłączeniu whole optional', async () => {
 const initial=fixture(), ex=initial.sessions[0].exercises[0]; ex.isOptional=true; ex.setCountMin=2; ex.setCountMax=3; ex.sets.forEach(set=>{set.isOptional=true;});
 const mock=server(); mount(initial); click('Edytuj ćwiczenie'); fireEvent.change(screen.getByLabelText('Liczba serii do'),{target:{value:'4'}});
 fireEvent.click(screen.getByLabelText('Całe ćwiczenie opcjonalne')); click('Zastosuj zmiany'); const result=await publish(mock), changed=result.sessions[0].exercises[0];
 expect(changed.isOptional).toBe(false); expect(changed.setCountMin).toBe(2); expect(changed.setCountMax).toBe(4); expect(changed.sets.map(set=>!!set.isOptional)).toEqual([false,false,true,true]);
 expect(changed.sets.slice(0,3).map(set=>[set.reviewId,set.note,set.sourceRef])).toEqual(ex.sets.map(set=>[set.reviewId,set.note,set.sourceRef]));
});
