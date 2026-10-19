import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WorkoutEditor } from './workout-editor';
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
