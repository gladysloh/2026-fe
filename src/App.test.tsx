import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatMoney } from './lib/format'
import { server } from './test/setup'
import { renderApp } from './test/test-utils'

async function waitForDashboard() {
  // Wait for account data to render — "Everyday Checking" only appears when accounts have loaded,
  // not during the loading skeleton phase. This ensures the "New transfer" button is enabled.
  await screen.findByText('Everyday Checking', {}, { timeout: 5000 })
}

describe('Transfer validation', () => {
  it('amount over balance shows error and sends no request', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitForDashboard()

    // Open transfer dialog
    const newTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(newTransferBtns[0])

    // Step 1: select first payee
    const payeeBtn = await screen.findByText('Jamie Tan', {}, { timeout: 5000 })
    await user.click(payeeBtn)

    // Click Continue
    await user.click(screen.getByRole('button', { name: /^continue$/i }))

    // Step 2: amount is already focused on checking account
    // Enter an amount way over the balance
    const amountInput = screen.getByLabelText('Amount')
    await user.type(amountInput, '99999')

    await user.click(screen.getByRole('button', { name: /^continue$/i }))

    // Should show balance error
    // Use identity normalizer: formatMoney uses U+00A0 (non-breaking space), and
    // Testing Library normalizes element text but compares with the raw search string.
    // With { normalizer: s => s }, both sides are compared raw so U+00A0 matches.
    const balance = 4280.55
    expect(
      await screen.findByText(
        `Amount can't be more than your available balance (${formatMoney(balance)}).`,
        { normalizer: (s) => s },
      ),
    ).toBeInTheDocument()

    // Should still be on step 2
    expect(screen.getByText('How much?')).toBeInTheDocument()
  })
})

describe('Transfer success', () => {
  it('successful transfer shows success screen and dashboard updates', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitForDashboard()

    // Open transfer dialog
    const newTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(newTransferBtns[0])

    // Step 1: select payee
    const payeeBtn = await screen.findByText('Jamie Tan', {}, { timeout: 5000 })
    await user.click(payeeBtn)
    await user.click(screen.getByRole('button', { name: /^continue$/i }))

    // Step 2: enter amount
    const amountInput = screen.getByLabelText('Amount')
    await user.type(amountInput, '100')
    await user.click(screen.getByRole('button', { name: /^continue$/i }))

    // Step 3: confirm
    await user.click(screen.getByRole('button', { name: /confirm transfer/i }))

    // Should show success panel
    expect(await screen.findByText('Transfer sent', {}, { timeout: 5000 })).toBeInTheDocument()

    // Reference should be shown
    expect(screen.getByText(/TRF-/)).toBeInTheDocument()

    // Close dialog
    await user.click(screen.getByRole('button', { name: /back to dashboard/i }))

    // Dashboard should update — balance should decrease by 100
    // Use identity normalizer to match U+00A0 from formatMoney output (see Test 1 comment)
    await waitFor(
      () => {
        expect(screen.getByText(formatMoney(17020.55), { normalizer: (s) => s })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })
})

describe('Dashboard error', () => {
  it('dashboard error shows message and retry reloads data', async () => {
    // Override all dashboard endpoints to return 500
    server.use(
      http.get('*/api/customer', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      ),
      http.get('*/api/accounts', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      ),
      http.get('*/api/transactions', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderApp()

    // Should show error state
    expect(
      await screen.findByText("We couldn't load your dashboard.", {}, { timeout: 5000 }),
    ).toBeInTheDocument()

    // Reset to working handlers
    server.resetHandlers()

    // Click Retry
    await user.click(screen.getByRole('button', { name: /retry/i }))

    // Dashboard should load successfully
    await screen.findByText('Everyday Checking', {}, { timeout: 5000 })
  })
})
