import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WorkoutStart } from './workout-start';
import { workoutFixture } from './workout-fixture';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); push.mockReset(); });
test('nowy start bez daty; ACK bez odczytu nie zmienia strony, retry zachowuje kopertę', async () => {
  const loaded = workoutFixture(); const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Brak odpowiedzi')).mockResolvedValueOnce({ ok: true, json: async () => ({ workoutId: loaded.workout.id, revision: 4 }) }).mockRejectedValueOnce(new Error('Odczyt niedostępny')).mockResolvedValueOnce({ ok: true, json: async () => loaded });
  vi.stubGlobal('fetch', fetchMock); render(<WorkoutStart planSessionId="day" today="2020-01-01" />);
  fireEvent.click(screen.getByRole('button', { name: 'Rozpocznij trening' })); await screen.findByText('Brak odpowiedzi');
  fireEvent.click(screen.getByRole('button', { name: 'Ponów tę samą operację' })); await screen.findByText('Odczyt niedostępny');
  expect(push).not.toHaveBeenCalled(); expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ workoutId: null, expectedRevision: 0, action: 'start', payload: { planSessionId: 'day' } });
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).payload.performedOn).toBeUndefined();
  fireEvent.click(screen.getByRole('button', { name: 'Ponów odczyt po zapisie' })); await waitFor(() => expect(push).toHaveBeenCalledWith(`/trening/${loaded.workout.id}`));
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')).toHaveLength(2);
});

test('jedna aktywna sesja ma powrót jako główne, zakończenie jako drugie i usunięcie jako niebezpieczne', async () => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  const active = { id: 'session-1', revision: 2, name: 'Cross', performedOn: '2026-10-19', performedAt: null, savedSetCount: 0 };
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'POST') return { ok: false, status: 409, json: async () => ({ error: 'Masz aktywny trening', code: 'PT409', activeWorkouts: [active] }) };
    return { ok: true, json: async () => workoutFixture() };
  }));
  render(<WorkoutStart planSessionId="day" />);
  fireEvent.click(screen.getByRole('button', { name: 'Rozpocznij trening' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Pokaż aktywne treningi' }));
  const region = await screen.findByRole('region', { name: 'Aktywne treningi' });
  expect(region.textContent).toMatch(/godzina nieznana/);
  expect(region.textContent).toMatch(/zapisane serie: 0/);
  const back = screen.getByRole('link', { name: 'Wróć do treningu' });
  const finish = screen.getByRole('button', { name: 'Zakończ i rozpocznij nowy' });
  const remove = screen.getByRole('button', { name: 'Usuń i rozpocznij nowy' });
  expect(back.getAttribute('href')).toBe('/trening/session-1');
  expect(back.compareDocumentPosition(finish) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(finish.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(back.className).toMatch(/primary/);
  expect(finish.className).toMatch(/secondary/);
  expect(remove.className).toMatch(/danger/);
  fireEvent.click(remove);
  expect(await screen.findByRole('button', { name: 'Potwierdzam trwałe usunięcie i nowy start' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Zostań' })).toBeTruthy();
});

test('kilka sesji zachowuje osobne komendy bez scalania etykiet', async () => {
  const rows = [1, 2].map(index => ({ id: `session-${index}`, revision: index, name: `Sesja ${index}`, performedOn: '2026-10-19', performedAt: index === 2 ? null : '2026-10-19T10:00:00Z', savedSetCount: index }));
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 409, json: async () => ({ error: 'Masz aktywne treningi', code: 'PT409', activeWorkouts: rows }) })));
  render(<WorkoutStart planSessionId="day" />);
  fireEvent.click(screen.getByRole('button', { name: 'Rozpocznij trening' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Pokaż aktywne treningi' }));
  expect(await screen.findByRole('heading', { name: 'Rozstrzygnij każdy trening osobno' })).toBeTruthy();
  expect(screen.getAllByRole('link', { name: 'Wróć do treningu' })).toHaveLength(2);
  expect(screen.getAllByRole('button', { name: 'Zakończ ten trening' })).toHaveLength(2);
  expect(screen.getAllByRole('button', { name: 'Usuń ten trening' })).toHaveLength(2);
  expect(screen.queryByRole('button', { name: 'Zakończ i rozpocznij nowy' })).toBeNull();
});
