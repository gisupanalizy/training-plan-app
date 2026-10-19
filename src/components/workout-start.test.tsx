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
