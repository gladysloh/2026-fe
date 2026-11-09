# Meridian Banking — Gladys Loh

- Deployed: https://2026-fe.vercel.app
- Run locally: `npm install && npm run dev`

## Project structure

```
src/
  api/          apiFetch helper and API types (starter, unchanged)
  hooks/        One TanStack Query hook per resource
  schemas/      Zod schemas for transfer validation
  components/
    layout/     Header
    dashboard/  BalanceHero, AccountList, AccountCard, TransactionList,
                TransactionRow, SearchInput, DailyLimitCard, DashboardError
    transfer/   TransferDialog, Stepper, StepRecipient, StepAmount,
                StepReview, SuccessPanel, PayeeOption
    ui/         Button, Skeleton, SegmentSwitch, ThemeToggle
  lib/          format.ts (starter, unchanged)
  mocks/        MSW handlers (starter, unchanged)
  test/         setup.ts, test-utils.tsx
```

`App.tsx` fetches customer, accounts and payees in parallel, manages loading/error/loaded states, and owns the transfer dialog open state.

## Decisions and trade-offs

**Native `<dialog>` for the transfer modal.** Focus trapping, Esc to close, and focus return all come built in. The only extra work was a jsdom polyfill for tests.

**Single `useForm` across all three steps.** Form state lives in `TransferDialog` and is passed down, so Back naturally preserves what the user entered without any extra lifting.

**Server-side search.** The transactions API takes a `q` param, so search just re-queries with a 300 ms debounce rather than filtering a local copy.

**Query invalidation on transfer success.** After a successful transfer, invalidating the three query keys lets TanStack Query refetch everything. Slightly slower than an optimistic update but much simpler.

**Theme via DOM attributes.** `useTheme` writes `data-theme` and `data-segment` directly on `<html>` — no context, no re-renders. A blocking inline script in `index.html` applies both before the page paints to prevent flash on reload.

**What I'd change:** Proper currency input formatting on blur, and a discard confirmation when closing a half-filled dialog.

## Loading, empty and error states

**Loading:** Customer, accounts and transactions fetch in parallel. Skeletons fill the same dimensions as the loaded content so layout stays stable.

**Dashboard error:** A failed fetch shows "We couldn't load your dashboard." with a Retry button. To trigger it on the deployed site, add `?scenario=error` to the URL or run `localStorage.setItem('msw-scenario', 'error')` in the console and reload.

**Transfer error:** A failed transfer stays on the review step, keeps the data, and shows a `role="alert"` banner. The user can retry without re-entering anything.

**Empty search:** No results shows "No transactions match your search." with a Clear search button.

## Tests

Three integration tests in `src/App.test.tsx` using `userEvent` against a fully rendered app:

1. **Amount over balance shows the error and sends no request** — checks the balance validation blocks the API call and the user stays on step 2.
2. **Successful transfer shows the success screen and updates the dashboard** — full happy path from dialog open to updated balance.
3. **Dashboard error shows the message and Retry reloads data** — overrides endpoints to 500, confirms error state, resets handlers, retries, confirms dashboard loads.

Each test exercises the API layer, state and UI together rather than testing components in isolation.

## AI use

I used Claude Code throughout — planning, building and debugging.

Three places I had to fix what it produced:

**1. Test helper waited for text that renders before data loads.** `waitForDashboard` initially waited for `'Good evening, Ava'`, which renders even while `isLoading` is true. The "New transfer" button is disabled during loading, so clicking it silently did nothing. Changed it to wait for `'Everyday Checking'`, which only appears once accounts have loaded.

**2. `findByText` couldn't match `formatMoney` output.** Testing Library normalises element text before comparing but doesn't normalise the search string. `Intl.NumberFormat` outputs a non-breaking space (U+00A0) after `SGD`, which got collapsed on the element side but not in the matcher — no match. Fixed with `{ normalizer: (s) => s }`.

**3. DOM accumulated across tests.** Auto-cleanup wasn't running reliably in this Vitest config, so by test 3 there were three `AccountList` instances in the DOM. Added an explicit `cleanup()` in `afterEach` in `setup.ts`.

## Not done / known issues

- No "Discard this transfer?" confirmation — closing mid-flow resets the form immediately.
- Amount doesn't format on blur (`100` stays as `100` rather than `100.00`).
- No CI workflow.
