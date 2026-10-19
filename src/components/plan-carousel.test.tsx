import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PlanCarousel } from './plan-carousel';
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
beforeEach(() => { replace.mockReset(); HTMLElement.prototype.scrollTo = vi.fn(); vi.stubGlobal('matchMedia', () => ({ matches: true })); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const plans = [{ id: 'a', name: 'Pierwszy', status: 'active' }, { id: 'b', name: 'Drugi', status: 'active' }];
test('klawiatura wybiera plan, nie pokazuje jednostek poprzedniego podczas odczytu', () => {
  const view = render(<PlanCarousel plans={plans} selectedPlanId="a" sessions={[{ id: 'a1', name: 'Jednostka pierwsza', count: 4, href: '/plany/a?session=a1' }]} />);
  fireEvent.keyDown(screen.getByRole('region', { name: 'Twoje plany' }), { key: 'ArrowRight' });
  expect(replace).toHaveBeenCalledWith('/plany?plan=b', { scroll: false });
  expect(screen.queryByRole('link', { name: /Jednostka pierwsza/ })).toBeNull();
  expect(screen.getByText('Wczytywanie treningów…')).toBeTruthy();
  view.rerender(<PlanCarousel plans={plans} selectedPlanId="b" sessions={[{ id: 'b1', name: 'Jednostka druga', count: 2, href: '/plany/b?session=b1' }]} />);
  expect(screen.getByRole('link', { name: /Jednostka druga/ }).getAttribute('href')).toBe('/plany/b?session=b1');
  fireEvent.keyDown(screen.getByRole('region', { name: 'Twoje plany' }), { key: 'Home' });
  expect(replace).toHaveBeenLastCalledWith('/plany?plan=a', { scroll: false });
});

test('wejście bezpośrednio do drugiego planu ustawia rzeczywiste przewinięcie po mount', () => {
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) { return this.getAttribute('aria-label')?.startsWith('2 z') ? 320 : 0; });
  render(<PlanCarousel plans={plans} selectedPlanId="b" sessions={[]} />);
  expect(screen.getByRole('region', { name: 'Twoje plany' }).scrollLeft).toBe(320);
  expect(screen.getByRole('button', { name: 'Pokaż plan 2: Drugi' }).getAttribute('aria-current')).toBe('true');
  expect(replace).not.toHaveBeenCalled();
});
