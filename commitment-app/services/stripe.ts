import { supabase } from '@/services/supabase'

export async function fetchPaymentSheetParams(amount: number): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { amount },
  })

  if (error) throw new Error(error.message)

  const { clientSecret } = data
  if (!clientSecret) throw new Error('No client secret returned from payment service')

  return clientSecret
}
