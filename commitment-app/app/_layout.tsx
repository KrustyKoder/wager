import { useEffect, useState } from 'react'
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router'
import { Session } from '@supabase/supabase-js'
import { StripeProvider } from '@stripe/stripe-react-native'
import { supabase } from '@/services/supabase'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const segments = useSegments()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === undefined) return
    if (!navigationState?.key) return

    const onAuthScreen = segments[0] === 'login' || segments[0] === 'signup'

    if (!session && !onAuthScreen) {
      router.replace('/login')
    } else if (session && onAuthScreen) {
      router.replace('/')
    }
  }, [session, segments, navigationState?.key])

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="create-wager" />
      </Stack>
    </StripeProvider>
  )
}
