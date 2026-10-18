import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlanPreview, type PlanPreviewProps } from './plan-preview';
import { emptySet } from '@/lib/domain/plan-editor';
vi.mock('./workout-start', () => ({ WorkoutStart: ({ planSessionId }: { planSessionId: string }) => <button>Start {planSessionId}</button> }));
beforeEach(() => { const values = new Map<string, string>(); vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), clear: () => values.clear() }); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const props = (): PlanPreviewProps => ({ planId: 'plan', versionId: 'v1', current: true, active: [null, 'active'], sessionIds: ['a', 'b'], context: { date: '2026-10-18', records: [], increment: 2.5 },
  document: { name: 'Plan', sessions: [1, 2].map(weekNumber => ({ weekNumber, dayLabel: 'A', note: `Kontekst ${weekNumber}`, exercises: [{ name: `Ćwiczenie ${weekNumber}`, originalName: 'Squat', sourceRef: 'Arkusz A', exerciseId: null, variant: null, equipment: null, supersetGroup: 'S1', note: 'Wskazówka', sets: Array.from({ length: 8 }, (_, index) => ({ ...emptySet(index + 1), repsMin: 1, note: 'Własna uwaga' })) }] })) } });
test('pierwszy trening, osiem zwiniętych serii, pełne szczegóły oraz odrębne identyczne nazwy', () => {
  render(<PlanPreview {...props()} />);
  expect(screen.getByLabelText('Wybierz trening')).toHaveProperty('value', 'a');
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['1. A · 1 ćw.', '2. A · 1 ćw.']);
  const details = screen.getByText('Wszystkie serie').closest('details')!;
  expect(details.open).toBe(false);
  fireEvent.click(screen.getByText('Wszystkie serie'));
  expect(screen.getAllByText('Własna uwaga', { exact: false })).toHaveLength(8);
  expect(screen.getByText('Oryginalna nazwa: Squat')).toBeTruthy();
  expect(screen.getByText('Źródło: Arkusz A')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Wybierz trening'), { target: { value: 'b' } });
  expect(screen.getByRole('heading', { name: 'Ćwiczenie 2' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Wznów trening' }).getAttribute('href')).toBe('/trening/active');
  expect(localStorage.getItem('forma:plan-session:plan:v1')).toBe('b');
});
test('przywraca ostatni wybór, rozdziela wersje i nie pozwala startować archiwum', async () => {
  localStorage.setItem('forma:plan-session:plan:v1', 'b');
  const view = render(<PlanPreview {...props()} />);
  await waitFor(() => expect(screen.getByLabelText('Wybierz trening')).toHaveProperty('value', 'b'));
  view.rerender(<PlanPreview {...props()} versionId="v2" current={false} />);
  expect(screen.getByLabelText('Wybierz trening')).toHaveProperty('value', 'a');
  expect(screen.queryByRole('button', { name: /Start/ })).toBeNull();
  expect(screen.queryByRole('link', { name: 'Wznów trening' })).toBeNull();
});
test('fallback błędnego ID, brak pamięci i podgląd całości pozostawiają wybór sprawny', () => {
  localStorage.setItem('forma:plan-session:plan:v1', 'deleted');
  render(<PlanPreview {...props()} />);
  expect(screen.getByLabelText('Wybierz trening')).toHaveProperty('value', 'a');
  fireEvent.click(screen.getByText('Podgląd całego planu'));
  fireEvent.click(screen.getByRole('button', { name: 'Wybierz trening 2: A' }));
  expect(screen.getByLabelText('Wybierz trening')).toHaveProperty('value', 'b');
  expect(screen.getByText('Kontekst 2')).toBeTruthy();
});

test('odmowa pamięci przeglądarki nie blokuje ręcznego wyboru', () => {
  vi.stubGlobal('localStorage', { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } });
  render(<PlanPreview {...props()} />);
  fireEvent.change(screen.getByLabelText('Wybierz trening'), { target: { value: 'b' } });
  expect(screen.getByRole('heading', { name: 'Ćwiczenie 2' })).toBeTruthy();
});
