import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Account, Payee, Transfer } from '../../api/types'
import { ApiError } from '../../api/client'
import { useTransfer } from '../../hooks/useTransfer'
import { makeAmountSchema, noteSchema, recipientSchema } from '../../schemas/transfer'
import { Button } from '../ui/Button'
import { Stepper } from './Stepper'
import { StepAmount } from './StepAmount'
import { StepRecipient } from './StepRecipient'
import { StepReview } from './StepReview'
import { SuccessPanel } from './SuccessPanel'
import styles from './TransferDialog.module.css'

export interface TransferFormValues {
  payeeId: string
  recipientName: string
  recipientAccountNumber: string
  recipientBank: string
  fromAccountId: string
  amount: string
  note: string
}

const baseSchema = z.object({
  payeeId: z.string(),
  recipientName: z.string(),
  recipientAccountNumber: z.string(),
  recipientBank: z.string(),
  fromAccountId: z.string(),
  amount: z.string(),
  note: z.string(),
})

interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
  accounts: Account[]
  payees: Payee[]
  dailyRemaining: number
  selectedAccount?: Account
}

export function TransferDialog({
  isOpen,
  onClose,
  accounts,
  payees,
  dailyRemaining,
}: TransferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successTransfer, setSuccessTransfer] = useState<Transfer | null>(null)

  const depositAccounts = accounts.filter((a) => a.type !== 'credit')
  const defaultAccountId = depositAccounts[0]?.id ?? ''

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      payeeId: '',
      recipientName: '',
      recipientAccountNumber: '',
      recipientBank: '',
      fromAccountId: defaultAccountId,
      amount: '',
      note: '',
    },
  })

  const transferMutation = useTransfer()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  function handleClose() {
    form.reset()
    setStep(1)
    setSubmitError(null)
    setSuccessTransfer(null)
    onClose()
  }

  async function handleStep1Continue() {
    const values = form.getValues()
    const isNewRecipient = !values.payeeId

    if (isNewRecipient) {
      const result = recipientSchema.safeParse({
        name: values.recipientName,
        accountNumber: values.recipientAccountNumber,
        bank: values.recipientBank,
      })
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors
        if (fieldErrors.name?.[0]) form.setError('recipientName', { message: fieldErrors.name[0] })
        if (fieldErrors.accountNumber?.[0]) form.setError('recipientAccountNumber', { message: fieldErrors.accountNumber[0] })
        if (fieldErrors.bank?.[0]) form.setError('recipientBank', { message: fieldErrors.bank[0] })
        // Focus first invalid field
        if (fieldErrors.name?.[0]) form.setFocus('recipientName')
        else if (fieldErrors.accountNumber?.[0]) form.setFocus('recipientAccountNumber')
        else if (fieldErrors.bank?.[0]) form.setFocus('recipientBank')
        return
      }
    } else if (!values.payeeId) {
      return
    }

    setStep(2)
  }

  async function handleStep2Continue() {
    const values = form.getValues()
    const selectedAccount = accounts.find((a) => a.id === values.fromAccountId)
    const balance = selectedAccount?.balance ?? 0

    const amountSchema = makeAmountSchema(balance, dailyRemaining)
    const amountResult = amountSchema.safeParse(values.amount)
    if (!amountResult.success) {
      const msg = amountResult.error.issues[0]?.message ?? 'Invalid amount.'
      form.setError('amount', { message: msg })
      form.setFocus('amount')
      return
    }

    const noteResult = noteSchema.safeParse(values.note)
    if (!noteResult.success) {
      const msg = noteResult.error.issues[0]?.message ?? 'Invalid note.'
      form.setError('note', { message: msg })
      form.setFocus('note')
      return
    }

    form.clearErrors(['amount', 'note'])
    setStep(3)
  }

  async function handleConfirm() {
    setSubmitError(null)
    const values = form.getValues()

    const requestBody = values.payeeId
      ? {
          fromAccountId: values.fromAccountId,
          amount: Number(values.amount),
          note: values.note || undefined,
          payeeId: values.payeeId,
        }
      : {
          fromAccountId: values.fromAccountId,
          amount: Number(values.amount),
          note: values.note || undefined,
          recipient: {
            name: values.recipientName,
            accountNumber: values.recipientAccountNumber,
            bank: values.recipientBank,
          },
        }

    try {
      const result = await transferMutation.mutateAsync(requestBody)
      setSuccessTransfer(result.transfer)
      setStep('success')
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(
          err.message ?? 'Something went wrong. Your money hasn\'t left your account. Try again.',
        )
      } else {
        setSubmitError('Something went wrong. Your money hasn\'t left your account. Try again.')
      }
    }
  }

  const numericStep = step === 'success' ? 3 : step

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="dialog-title"
      aria-modal="true"
    >
      <div className={styles.inner}>
        <div className={styles.dialogHeader}>
          <h1 id="dialog-title" className={styles.dialogTitle}>
            New transfer
          </h1>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {step !== 'success' && <Stepper currentStep={numericStep as 1 | 2 | 3} />}

        <div className={styles.body}>
          {step === 1 && <StepRecipient form={form} />}
          {step === 2 && (
            <StepAmount form={form} accounts={accounts} dailyRemaining={dailyRemaining} />
          )}
          {step === 3 && (
            <StepReview
              form={form}
              accounts={accounts}
              payees={payees}
              isPending={transferMutation.isPending}
              error={submitError}
              onBack={() => setStep(2)}
              onConfirm={handleConfirm}
            />
          )}
          {step === 'success' && successTransfer && (
            <SuccessPanel transfer={successTransfer} onClose={handleClose} />
          )}
        </div>

        {step !== 3 && step !== 'success' && (
          <div className={styles.footer}>
            {step === 1 && (
              <>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleStep1Continue}>Continue</Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleStep2Continue}>Continue</Button>
              </>
            )}
          </div>
        )}
      </div>
    </dialog>
  )
}
