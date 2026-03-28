import { useState } from 'react'
import { supabase } from '@/services/supabase'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return false
    }

    return true
  }

  async function signUp(email: string, password: string): Promise<boolean> {
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return false
    }

    return true
  }

  return { login, signUp, loading, error }
}
