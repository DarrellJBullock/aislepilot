# AislePilot — Design System

Mobile-first, calm, and grocery-friendly. Large touch targets, rounded cards,
readable pricing, clear status.

## Foundations
- **Color** (`tailwind.config.ts`): `brand` green scale (primary `brand-600`),
  `ink` text scale (`ink`, `ink-soft`, `ink-muted`). Semantic tones via `Badge`
  (`green`/`amber`/`red`/`blue`/`brand`/`neutral`).
- **Radius**: `xl` (1rem) and `2xl` (1.5rem) — cards are `2xl`.
- **Shadow**: `shadow-card` for elevated surfaces.
- **Motion**: restrained — `animate-slide-up` for drawers/focus cards only.
- **Type**: system font stack; bold headings, `tabular-nums` for prices/totals.

## Primitives (`src/components/ui`)
| Component | Purpose |
|-----------|---------|
| `Button` | 5 variants × 3 sizes; focus ring; `fullWidth` |
| `Card` / `CardBody` | Rounded elevated surface |
| `Input` / `Textarea` / `Label` / `FieldError` | Accessible form fields |
| `Badge` | Toned status chips |
| `Progress` | ARIA progressbar |
| `Modal` | Bottom-sheet on mobile, centered on desktop; Esc + backdrop close |
| `Skeleton` / `Spinner` / `EmptyState` / `ErrorState` | Loading/empty/error |
| `ProductImage` | Deterministic initials placeholder (no network images) |
| `PriceTag` | Effective price + struck regular price when on sale |
| `StatusPill` / `AvailabilityPill` / `LocationBadge` | Item + product status |
| `DemoBadge` | Marks mock vs. live data |

## Accessibility
- All interactive controls are real `<button>`/`<a>`/form elements with labels
  (`aria-label`, `aria-pressed`, `aria-expanded`, `aria-invalid`).
- Visible focus ring (`focus-visible:ring-brand-500`) on all buttons.
- `Progress` and `Modal` expose ARIA roles; `role="alert"` on error/validation.
- Touch targets ≥ 44px in Shopping Mode; `touch-action: manipulation`.
- Color is never the only signal — icons + text accompany every status.

## Responsive patterns
- Content is centered in a `max-w-5xl` shell (`max-w-2xl` in Shopping Mode).
- Mobile bottom-sheet modals; sticky headers and shopping controls.
- No horizontal body scroll; wide content scrolls within its own container.

## Data honesty
Estimated aisle data always renders through `LocationBadge`, which marks only
`retailer_verified` sources as "verified". Demo data carries a `DemoBadge`.
