import { useState } from 'react'
import { useStripe } from '@stripe/stripe-react-native'
import { supabase } from '@/services/supabase'
import { fetchPaymentSheetParams } from '@/services/stripe'

export type Wager = {
  id: string
  user_id: string
  title: string
  description: string
  amount: number
  stripe_charge_id: string
  status: string
  created_at: string
  deadline: string
}

type CreateWagerInput = {
  title: string
  description: string
  amount: number
  deadline: Date
}

export function useWager() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const [wagers, setWagers] = useState<Wager[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchWagers(): Promise<void> {
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()

    const { data, error: fetchError } = await supabase
      .from('wagers')
      .select('*')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false })

    setLoading(false)

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setWagers(data ?? [])
  }

  async function createWager(input: CreateWagerInput): Promise<boolean> {
    setLoading(true)
    setError(null)

    let clientSecret: string
    try {
      clientSecret = await fetchPaymentSheetParams(input.amount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialise payment')
      setLoading(false)
      return false
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Wager',
      returnURL: 'commitmentapp://stripe-redirect',
      defaultBillingDetails: {},
    })

    if (initError) {
      setError(initError.message)
      setLoading(false)
      return false
    }

    const { error: paymentError } = await presentPaymentSheet()

    if (paymentError) {
      // User cancelled or payment failed — do not create wager
      if (paymentError.code !== 'Canceled') {
        setError(paymentError.message)
      }
      setLoading(false)
      return false
    }

    // Payment succeeded — create wager in Supabase
    const { data: { session } } = await supabase.auth.getSession()

    const { error: insertError } = await supabase.from('wagers').insert({
      user_id: session?.user.id,
      title: input.title,
      description: input.description,
      amount: input.amount,
      deadline: input.deadline.toISOString(),
      stripe_charge_id: clientSecret.split('_secret_')[0],
      status: 'pending',
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return false
    }

    return true
  }

  return { wagers, fetchWagers, createWager, loading, error }
}
