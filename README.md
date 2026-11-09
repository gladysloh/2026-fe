# Meridian Banking — Gladys Loh

- Deployed: https://2026-fe.vercel.app
- Run locally: `npm install && npm run dev`

## Project structure

```
src/
  api/          apiFetch client and TypeScript types (starter, unchanged)
  hooks/        One TanStack Query hook per resource: useCustomer, useAccounts,
                useTransactions, usePayees, useTransfer (mutation)
  schemas/      transfer.ts — all Zod validation in one place, consumed by
                React Hook Form in StepAmount and StepRecipient
  components/
    layout/     Header (logo, nav, segment switch, theme toggle, avatar)
    dashboard/  BalanceHero, AccountList/AccountCard, TransactionList/
                TransactionRow, SearchInput, DailyLimitCard, DashboardError
    transfer/   TransferDialog shell, Stepper, StepRecipient, StepAmount,
                StepReview, SuccessPanel, PayeeOption
    ui/         Button, Skeleton, SegmentSwitch, ThemeToggle
  lib/          format.ts (starter, unchanged)
  mocks/        MSW handlers (starter, unchanged)
  test/         setup.ts (extended), test-utils.tsx (renderApp helper)
```

`App.tsx` owns top-level data fetching (customer, accounts, payees in parallel), the loading/error/loaded states, and the `isTransferOpen` flag that controls the dialog.

## Decisions and trade-offs

**Native `<dialog>` for the transfer modal.** It gives focus trapping, Esc to close, and return focus to the trigger for free, with no extra dependencies. The only cost is a jsdom polyfill in test setup (`showModal`/`close` are not implemented there).

**Single `useForm` instance across all three transfer steps.** The form is defined once in `TransferDialog` and passed down via props. This means the Back button on the review step genuinely preserves everything the user entered — no lifting state, no re-mounting the form. The trade-off is that `StepAmount` needs to call `trigger()` on its own fields before advancing rather than relying on `handleSubmit`.

**Server-side search via the API's `q` parameter.** The brief says either client-side or server-side is fine. Using the API felt more realistic and keeps `TransactionList` simple — it re-queries when the debounced search term changes (300 ms), rather than holding a filtered copy of the list in state.

**Query invalidation over optimistic updates.** After a successful transfer, `useTransfer`'s `onSuccess` invalidates `['customer']`, `['accounts']`, and `['transactions']`. TanStack Query refetches them automatically. The balance update takes roughly 500 ms (the mock API's delay) rather than being instant, but the data is guaranteed to match the server and the code is significantly simpler.

**`useTheme` reads and writes `data-theme` / `data-segment` directly on `document.documentElement`.** No React context, no re-renders — the CSS variables do all the visual work. A blocking `<script>` in `index.html` reads `localStorage` and sets both attributes before the module script runs, preventing a flash of the wrong theme on reload.

**What I'd change with more time:** The amount field is a plain text `<input>` validated as a number string by Zod. A proper currency input that formats on blur (e.g. types `100` → shows `100.00`) would be a better experience. I'd also add the optional "Discard this transfer?" confirmation when closing a half-filled dialog.

## Loading, empty and error states

**Dashboard loading:** All three data fetches start in parallel. While any are in flight, `BalanceHero`, `AccountList`, and `TransactionList` render skeleton placeholders. The layout doesn't shift when data arrives because the skeletons match the dimensions of the loaded content.

**Dashboard error:** If the customer or accounts fetch fails, the full dashboard is replaced by an error message with a Retry button. Retry calls `refetch()` on both queries. To trigger it in the deployed app: open the browser console and run `localStorage.setItem('msw-scenario', 'error')` then reload — or use the `?scenario=error` query string on the API requests as described in the API contract.

**Transfer error:** If `POST /api/transfers` fails, the dialog stays on the review step, the data is preserved, and a `role="alert"` banner appears above the Confirm button. The user can retry without re-entering anything.

**Empty search:** Searching for a term that matches no transactions shows "No transactions match your search." with a Clear search button.

## Tests

Three tests in `src/App.test.tsx`, all using `userEvent` against a fully rendered `App`:

1. **Amount over balance shows error and sends no request.** Covers the most important validation rule — that the balance check runs before the API is called. Asserts the error message is visible and that the dialog is still on Step 2 (`How much?`), not advanced.

2. **Successful transfer shows success screen and dashboard updates.** The full happy path end-to-end: open dialog → pick payee → enter amount → confirm → `Transfer sent` with a reference number → close → dashboard balance has decreased. This test covers T5 and T6 together because the dashboard update only makes sense in the context of a completed transfer.

3. **Dashboard error shows message and retry loads data.** Overrides all three API endpoints to return 500, confirms the error state renders, resets the handlers, clicks Retry, and confirms the dashboard loads. Covers D7.

I picked these three because they test flows, not components. Each one exercises multiple layers (API, state, UI) in a way that a unit test of a single component wouldn't catch.

## AI use

I used Claude Code throughout the build — planning the component structure, writing the implementation, and debugging test failures.

Three places where the AI output was wrong and needed fixing:

**1. `waitForDashboard` in the tests waited for the wrong element.** The initial implementation waited for `'Good evening, Ava'` to appear before clicking "New transfer". That text renders unconditionally from the first render (even before API data loads), so the test proceeded while the button was still `disabled`. `userEvent.click` on a disabled button silently does nothing — no error, no dialog. The fix was to wait for `'Everyday Checking'` instead, which only appears inside `AccountCard` once `isLoading` is false, guaranteeing the button is enabled.

**2. `findByText` failed on `formatMoney()` output despite the text being visible.** The tests initially asserted error messages like `Amount can't be more than your available balance (SGD 4,280.55).` without any special options. They timed out even though the element was in the DOM. The root cause: Testing Library's `matches()` function normalises the *element's* text content (collapsing whitespace including U+00A0) but compares it against the *raw* search string. `Intl.NumberFormat` outputs a non-breaking space (U+00A0) between `SGD` and the number, so after normalisation the two sides no longer matched. The fix was to pass `{ normalizer: (s) => s }` so both sides are compared raw.

**3. Auto-cleanup between tests wasn't running.** `@testing-library/react` v16 is supposed to auto-cleanup via a global `afterEach`. In this Vitest `setupFiles` config it wasn't reliably firing, so rendered `App` components accumulated across tests — by Test 3 there were three copies of `AccountList` in the DOM, causing `findByText('Everyday Checking')` to throw "Found multiple elements". The fix was an explicit `cleanup()` call in `afterEach` inside `src/test/setup.ts`.

## Not done / known issues

- **No "Discard this transfer?" confirmation** when closing a half-filled dialog. Currently Esc or ✕ closes immediately and resets the form without warning.
- **Amount input doesn't format on blur.** Typing `100` leaves it as `100` rather than formatting to `100.00`. Functional but not polished.
- **No CI workflow.** `npm run check` runs locally but there's no GitHub Actions setup.
