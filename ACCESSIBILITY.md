# Accessibility Compliance Report (WCAG 2.2 Level AA)

Breathewise is built to be accessible to all users, including individuals with visual impairments, motor constraints, cognitive variations, or low-bandwidth screen readers.

## Summary of Accessibility Principles

1. **No Color-Only Information**: Pollution severity and health risk are never indicated by color alone; every status combines numerical values, text labels, and semantic icons.
2. **Accessible Keyboard Navigation**: Complete keyboard functionality with skip links, ARIA tabs with arrow key cycling (Home/End support), and visible focus rings.
3. **Screen Reader Text Twins**: All inline SVG charts and sparklines feature adjacent `.sr-only` twins detailing data points and trends.
4. **Live Regions with Polite Announcing**: Conversational tokens and dynamic updates use `aria-live="polite"`. Emergency hazard warnings use `role="alert"`.

---

## Verifiable Evidence Table

| Requirement | Claim | Evidence File / Test | How to Verify |
|---|---|---|---|
| **Skip Navigation** | Users can bypass navigation directly to main content | `src/App.tsx#L20` | `npx vitest run src/test/a11y.test.tsx -t "skip-to-content"` |
| **ARIA Tablist Pattern** | Tab navigation follows WAI-ARIA tablist/tab pattern with roving tabindex and Arrow/Home/End keyboard handling | `src/components/Navigation/Tabs.tsx#L40` | `npx vitest run src/test/dom.test.tsx -t "arrow key keyboard navigation"` |
| **Color-Independent Risk** | AQI indicators include numerical AQI, text category, and icon | `src/components/shared/AqiBadge.tsx#L33` | `npx vitest run src/test/a11y.test.tsx -t "conveys risk by color alone"` |
| **Chart Text Twins** | SVG sparklines & hourly forecast bars have `.sr-only` equivalents with min/peak/trend figures | `src/components/shared/Sparkline.tsx#L45`, `src/components/Today/HourlyBestWindows.tsx#L75` | `npx vitest run src/test/rendering.test.tsx -t "Sparkline renders inline SVG and sr-only twin"` |
| **Streaming Politeness** | Live streaming chat updates use `aria-live="polite"` to avoid disorienting screen reader speech queues | `src/components/Chat/index.tsx#L85` | `npx vitest run src/test/a11y.test.tsx` |
| **Contrast Ratios** | Text elements meet 4.5:1 (normal text) and 3:1 (large text) contrast ratios in both light and dark themes | `src/index.css`, Tailwind dark variant classes | Visual inspection in light and dark modes |
| **Motion Reduction** | Respects `prefers-reduced-motion` media query by collapsing animation and transition durations | `src/index.css#L26-L34` | Inspect `src/index.css` |
| **Semantic Landmarks** | Uses `<header>`, `<nav>`, `<main id="main-content">`, `<aside>`, and `<footer>` semantic tags | `src/App.tsx` | `npx vitest run src/test/a11y.test.tsx -t "Main content container"` |

---

## Verification Command

```bash
npm test -- src/test/a11y.test.tsx
```
