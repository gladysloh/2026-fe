import { z } from 'zod'
import { formatMoney } from '../lib/format'

export const recipientSchema = z.object({
  name: z
    .string()
    .min(2, 'Enter a recipient name (2–50 characters).')
    .max(50, 'Enter a recipient name (2–50 characters).'),
  accountNumber: z
    .string()
    .regex(/^\d{8}$/, 'Enter a valid 8-digit account number.'),
  bank: z.string().min(1, 'Please select a bank.'),
})

export function makeAmountSchema(balance: number, dailyRemaining: number) {
  return z
    .string()
    .min(1, 'Enter an amount.')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount.')
    .refine(
      (v) => Number(v) >= 1,
      'Enter an amount of at least SGD 1.00.',
    )
    .refine((v) => {
      const parts = v.split('.')
      return parts.length < 2 || parts[1].length <= 2
    }, 'Use at most 2 decimal places.')
    .refine(
      (v) => Number(v) <= balance,
      `Amount can't be more than your available balance (${formatMoney(balance)}).`,
    )
    .refine(
      (v) => Number(v) <= dailyRemaining,
      `This transfer exceeds your remaining daily limit (${formatMoney(dailyRemaining)}).`,
    )
}

export const noteSchema = z
  .string()
  .max(50, 'Keep the note to 50 characters or fewer.')
  .optional()

export const BANKS = [
  'DBS',
  'POSB',
  'OCBC',
  'UOB',
  'Standard Chartered',
  'HSBC',
  'Citibank',
  'Maybank',
] as const
