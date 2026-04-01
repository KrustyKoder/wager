import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'

export function SignUpScreen() {
  const insets = useSafeAreaInsets()
  const { signUp, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignUp() {
    setValidationError(null)

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    const ok = await signUp(email, password)
    if (ok) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.successText}>Check your email to confirm your account</Text>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.loginLink}>Back to <Text style={styles.loginLinkBold}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#999999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {(validationError || error) ? (
            <Text style={styles.error}>{validationError ?? error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign up</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.loginLinkBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  successContainer: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 48,
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 10,
  },
  error: {
    fontSize: 14,
    color: '#cc0000',
    marginTop: -8,
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
  },
  loginLinkBold: {
    color: '#000000',
    fontWeight: '600',
  },
})

export default SignUpScreen
