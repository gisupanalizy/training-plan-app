# Checkpoint T15-A — fundament

- Data: 2026-10-18; wykonawca `/root/foundation`, integrator `/root`.
- Gałąź `codex/t15-ui`, baza `51ea3b4`; bez własnych commitów.
- Status: review; bramka lokalna przyjęta przez I, wszystkie pliki zwolnione.
- Własność: layout, globals.css, AppShell, nowe src/components/ui i src/lib/ui, public/fonts i public/exercise-assets; wyłącznie A do oddania bramki.

## Fakty

Wdrożono dokładne tokeny Nocy z t14-themes.py, Inter Variable przez next/font/local (lokalne bajty OFL), metadane dark/viewport-fit, spójne autorskie ikony SVG, nawigację pięciu istniejących tras, skip-link i safe-area. Zachowano AppShell children/section oraz wykrywanie konfiguracji. Dotychczasowe globalne jasne kolory zastąpiono semantycznymi tokenami, bez przebudowy struktur ekranów B–F. Brak zależności npm i zmian Auth/API/DB.

17 oryginalnych SVG Workout Guide skopiowano z makiet wraz z manifestem, atrybucją i licencją CC BY-SA 4.0. SHA-256 wszystkich SVG/fontu/licencji zgadzają się z manifestami. Bajty grafik bez zmian. Stopka AppShell udostępnia autorów/licencję/manifest. Brak odpowiednika daje neutralne ĆW/WŁASNE.

## Kontrakt B–F

- `@/components/ui`: Button, Field, Icon, InfoPopover, ExerciseIllustration (osobne importy też działają).
- Button: natywne props/ref, wariant primary/secondary/ghost/danger; domyślnie type=button. Submit wymaga type=submit.
- Field: natywne input props/ref oraz label, hint?, error?; poprawne id/label/aria-describedby/aria-invalid. Nie konwertuje stringów na liczby, nie zastępuje null zerem.
- Icon: name z eksportowanego IconName, size? domyślnie22, standardowe SVG props. Ikona jest dekoracyjna; nazwa dostępna należy do przycisku/linku.
- InfoPopover: label oraz children. Klik/Enter/Spacja otwierają; Escape, poza/utrata fokusu zamykają. Escape przywraca fokus. To pomoc przy kontrolce, nie implementacja dymków punktów wykresu E.
- ExerciseIllustration: name pełnego dokładnego wariantu, decorative? domyślnie true (obok widocznej nazwy), className?. Nie przekazywać ogólnej nazwy z pominięciem osobnej asysty/sprzętu/wariantu; w takim wypadku scalić kontekst lub pozwolić na neutralny znacznik. Nie używać suggestExerciseName do mapowania. Resolver `resolveExerciseAsset(name)` zwraca lokalny URL albo null; brak substringów/prefiksów.
- CSS Modules każdego etapu korzystają z --paper/--surface/--ink/--muted/--line/--tint/--primary/--on-primary/--accent/--on-accent/--hero/--hero-ink/--hero-muted/--focus/--control/--hover/--soft-hover/--warning/--warning-ink/--success/--skipped/--pending/--illustration/--danger/--danger-surface. --dark jest aliasem akcji primary; tekst na nim wymaga --on-primary. --white to powierzchnia, --green to akcent. Nie używać białego hardcode lub zieleni z dawnych ekranów.
- Mobile nav 76px + env(safe-area-inset-bottom), breakpoint740px; .content rezerwuje miejsce. Bez kontowego przełącznika motywów. Nie blokujemy zoomu.

## Weryfikacja

`npx vitest run src/components/ui/ui.test.tsx src/lib/ui/exercise-assets.test.ts`: PASS,6 testów/2 pliki. Semantyka pola, pomoc/outside/Escape/fokus, domyślny button, brak błędnego wariantu, manifesty i integralność.

Build/typecheck/przeglądarka/API/DB nie uruchomione przez A; wysłano do I prośbę o kolejkę. Następny krok: wspólna bramka typów/builda i Chrome przy360/390/430, klawiatura/fokus, czytelność reprezentatywnych ekranów i safe-area. Fizyczny telefon/Safari niewykonane.

## Finalna bramka

Końcowy build/typecheck PASS,Chrome21 stanów+desktop PASS,204 unit/9 skipped PASS. Pełne RPC+HTTP T13-A wykonane przez I PASS. Kontrakt ilustracji addytywnie przyjmuje variant/equipment; niepusty nierozpoznany kontekst daje neutralny znacznik. Szczegóły, wcześniejsze nieudane próby i prompt: [handoff A](../../handoffs/2026-10-18-T15-A-fundament.md).
