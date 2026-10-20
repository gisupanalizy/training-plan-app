import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { WorkoutEditor, planLoadReadout } from './workout-editor';
import { workoutFixture } from './workout-fixture';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeEach(() => { HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); }; HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); }; window.history.replaceState(null, '', '/trening/test'); vi.stubGlobal('requestAnimationFrame', (fn: () => void) => { fn(); return 1; }); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const response = (value: unknown, status = 200) => ({ ok: status === 200, status, json: async () => value });
function open() { fireEvent.click(screen.getByRole('button', { name: /1. Przysiad/ })); }
function input(value = '6') { fireEvent.change(screen.getByRole('spinbutton', { name: 'Powtórzenia' }), { target: { value } }); }
function save() { fireEvent.click(screen.getByRole('button', { name: 'Zapisz i przejdź dalej' })); }
test('retry zachowuje pełną komendę; odczyt po ACK, inny szkic komentarza i brak reload', async () => {
  const loaded = workoutFixture(); const next = structuredClone(loaded); next.workout.revision = 5; next.exercises[0].sets[0].status = 'completed'; next.exercises[0].sets[0].actual_reps = 0;
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Przerwane połączenie')).mockResolvedValueOnce(response({ workoutId: loaded.workout.id, revision: 5 })).mockResolvedValueOnce(response(next));
  vi.stubGlobal('fetch', fetchMock); render(<WorkoutEditor loaded={loaded} />);
  fireEvent.click(screen.getByRole('button', { name: 'Komentarz' })); fireEvent.change(screen.getByRole('textbox', { name: 'Komentarz' }), { target: { value: 'inny szkic' } });
  open(); input('0'); save(); await screen.findByText('Przerwane połączenie');
  expect(screen.getByRole('heading', { name: 'Przysiad · seria 1' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Ponów tę samą operację' }));
  await screen.findByRole('heading', { name: 'Wiosłowanie · seria 1' });
  expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ expectedRevision: 4, payload: { actualReps: 0, actualKg: null } });
  fireEvent.click(screen.getByRole('button', { name: '← Wróć do ćwiczeń' })); expect(screen.getByRole('textbox', { name: 'Komentarz' })).toHaveProperty('value', 'inny szkic');
});
test('błąd odczytu po zapisie ponawia wyłącznie GET, bez przejścia na ślepo', async () => {
  const loaded = workoutFixture(); const next = structuredClone(loaded); next.workout.revision = 5; next.exercises[0].sets[0].status = 'completed';
  const fetchMock = vi.fn().mockResolvedValueOnce(response({ workoutId: loaded.workout.id, revision: 5 })).mockRejectedValueOnce(new Error('Odczyt przerwany')).mockResolvedValueOnce(response(next));
  vi.stubGlobal('fetch', fetchMock); render(<WorkoutEditor loaded={loaded} />); open(); input(); save();
  await screen.findByText('Odczyt przerwany'); expect(screen.getByRole('heading', { name: 'Przysiad · seria 1' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Ponów odczyt po zapisie' })); await screen.findByRole('heading', { name: 'Wiosłowanie · seria 1' });
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')).toHaveLength(1);
});
test('409 zachowuje szkic; odczyt i świadomy zapis tworzą nową komendę z aktualną rewizją', async () => {
  const loaded = workoutFixture(); const next = structuredClone(loaded); next.workout.revision = 7;
  const fetchMock = vi.fn().mockResolvedValueOnce(response({ error: 'Konflikt rewizji', code: 'REVISION_CONFLICT' }, 409)).mockResolvedValueOnce(response(next)).mockRejectedValue(new Error('sieć'));
  vi.stubGlobal('fetch', fetchMock); render(<WorkoutEditor loaded={loaded} />); open(); input('8'); save(); await screen.findByText('Konflikt rewizji');
  fireEvent.click(screen.getByRole('button', { name: 'Odczytaj stan i rozstrzygnij' }));
  await screen.findByText(/Stan odczytany/); expect(screen.getByRole('spinbutton', { name: 'Powtórzenia' })).toHaveProperty('value', '8'); save();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  const first = JSON.parse(fetchMock.mock.calls[0][1].body), second = JSON.parse(fetchMock.mock.calls[2][1].body);
  expect(second.expectedRevision).toBe(7); expect(second.operationId).not.toBe(first.operationId);
});
test('powrót: zostań, odrzuć i zapisz; formularz tylko jednej serii', async () => {
  const loaded = workoutFixture(); const next = structuredClone(loaded); next.workout.revision++;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ workoutId: loaded.workout.id, revision: 5 })).mockResolvedValueOnce(response(next)));
  render(<WorkoutEditor loaded={loaded} />); open(); input();
  fireEvent.click(screen.getByRole('button', { name: '← Wróć do ćwiczeń' })); fireEvent.click(screen.getByRole('button', { name: 'Zostań' }));
  expect(screen.getByRole('spinbutton', { name: 'Powtórzenia' })).toHaveProperty('value', '6');
  fireEvent.click(screen.getByRole('button', { name: '← Wróć do ćwiczeń' })); fireEvent.click(screen.getByRole('button', { name: 'Odrzuć zmiany' })); open();
  expect(screen.getByRole('spinbutton', { name: 'Powtórzenia' })).toHaveProperty('value', ''); input('7');
  fireEvent.click(screen.getByRole('button', { name: '← Wróć do ćwiczeń' })); fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
  await screen.findByRole('heading', { name: 'Trening A' });
});
test('główny zapis serii jest poza przewijaną treścią formularza', () => {
  render(<WorkoutEditor loaded={workoutFixture()} />); open();
  const save = screen.getByRole('button', { name: 'Zapisz i przejdź dalej' });
  const scroll = document.querySelector('[data-series-scroll]');
  expect(scroll).toBeTruthy();
  expect(scroll?.contains(save)).toBe(false);
  expect(save.closest('[data-series-save]')).toBeTruthy();
  expect(save.closest('form')?.contains(scroll ?? null)).toBe(true);
});
test('otwarcie serii nie zapisuje, a zakończona sesja nie ma kontynuacji ani usuwania', () => {
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
  render(<WorkoutEditor loaded={workoutFixture()} />); open();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByRole('heading', { name: 'Przysiad · seria 1' })).toBeTruthy();
  cleanup();
  window.history.replaceState(null, '', '/trening/test');
  const finished = workoutFixture(); finished.workout.status = 'completed';
  render(<WorkoutEditor loaded={finished} />);
  expect(screen.queryByRole('button', { name: 'Kontynuuj' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Usuń trening' })).toBeNull();
  expect(screen.getByText('Historyczne cele i wykonanie tylko do odczytu.')).toBeTruthy();
});
test('brak wartości, nie dotyczy i zero kilogramów są trzema stanami, a czas nie jest powtórzeniem', () => {
  const missing = workoutFixture();
  const plank = missing.exercises[2].sets[0];
  plank.target_reps_min_snapshot = null; plank.target_reps_max_snapshot = null; plank.target_percent_snapshot = null; plank.target_load_type_snapshot = 'unspecified';
  plank.target_duration_seconds_snapshot = 60; plank.target_distance_meters_snapshot = 100;
  render(<WorkoutEditor loaded={missing} />);
  fireEvent.click(screen.getByRole('button', { name: /3. Plank/ }));
  expect(screen.queryByRole('spinbutton', { name: 'Powtórzenia' })).toBeNull();
  expect(screen.getByRole('spinbutton', { name: 'Czas (s)' })).toBeTruthy();
  expect(screen.getByRole('spinbutton', { name: 'Dystans (m)' })).toBeTruthy();
  expect(document.querySelector('[data-load-state="missing"]')?.textContent).toContain('Brak wartości w planie');
  cleanup();
  window.history.replaceState(null, '', '/trening/test');
  const zero = workoutFixture();
  zero.exercises[0].sets[0].target_load_type_snapshot = 'absolute'; zero.exercises[0].sets[0].target_percent_snapshot = null; zero.exercises[0].sets[0].target_kg_snapshot = 0;
  render(<WorkoutEditor loaded={zero} />); open();
  expect(document.querySelector('[data-load-state="zero"]')?.textContent).toContain('0 kg');
  expect(screen.queryByText('Nie dotyczy')).toBeNull();
  expect((screen.getByRole('spinbutton', { name: 'Ciężar (kg)' }) as HTMLInputElement).value).toBe('');
  cleanup();
  window.history.replaceState(null, '', '/trening/test');
  const bodyweight = workoutFixture();
  bodyweight.exercises[0].sets[0].target_load_type_snapshot = 'bodyweight'; bodyweight.exercises[0].sets[0].target_percent_snapshot = null; bodyweight.exercises[0].sets[0].target_bodyweight_adjustment_snapshot = 'none';
  render(<WorkoutEditor loaded={bodyweight} />); open();
  expect(document.querySelector('[data-load-state="na"]')?.textContent).toContain('Nie dotyczy');
  expect(within(document.querySelector('form .editor-grid') as HTMLElement).queryByRole('spinbutton', { name: 'Ciężar (kg)' })).toBeNull();
  expect(planLoadReadout({ ...bodyweight.exercises[0].sets[0], target_bodyweight_adjustment_snapshot: 'additional', target_bodyweight_delta_kg_snapshot: 10 })).toBeNull();
});
