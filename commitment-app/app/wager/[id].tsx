import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWager, Wager } from '@/hooks/useWager'
import { supabase } from '@/services/supabase'

type EvidenceFile = {
  name: string
  uri: string
  mimeType: string
}

type ValidationResult = {
  approved: boolean
  reasoning: string
}

export function WagerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { fetchWagerById, loading } = useWager()
  const insets = useSafeAreaInsets()

  const [wager, setWager] = useState<Wager | null>(null)
  const [evidenceFile, setEvidenceFile] = useState<EvidenceFile | null>(null)
  const [picking, setPicking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetchWagerById(id).then(setWager)
  }, [id])

  async function handleChooseFile() {
    setPicking(true)
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*', 'application/pdf'],
      copyToCacheDirectory: true,
    })
    setPicking(false)

    if (picked.canceled) return

    const file = picked.assets[0]
    setEvidenceFile({ name: file.name, uri: file.uri, mimeType: file.mimeType ?? 'application/octet-stream' })
    setResult(null)
    setSubmitError(null)
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setSubmitError('Camera permission is required to take a photo.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })

    if (result.canceled) return

    const asset = result.assets[0]
    const name = asset.fileName ?? `photo_${Date.now()}.jpg`
    setEvidenceFile({ name, uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' })
    setResult(null)
    setSubmitError(null)
  }

  async function handleSubmit() {
    if (!evidenceFile || !wager) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(evidenceFile.uri)
      const blob = await response.blob()
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          resolve(dataUrl.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const { data, error } = await supabase.functions.invoke('validate-evidence', {
        body: { wager_id: wager.id, fileBase64, mimeType: evidenceFile.mimeType },
      })

      if (error) throw new Error(error.message)

      setResult({ approved: data.approved, reasoning: data.reasoning })

      // Refresh wager to show updated status
      fetchWagerById(id).then(setWager)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !wager) {
    return (
      <View style={[styles.container, styles.centered]}>
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <>
            <Text style={styles.errorText}>Wager not found</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backLink}>← Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    )
  }

  const deadline = new Date(wager.deadline).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{wager.title}</Text>

        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>£{wager.amount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{wager.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Deadline</Text>
          <Text style={styles.value}>{deadline}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Stripe ID</Text>
          <Text style={styles.value}>{wager.stripe_charge_id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{wager.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.evidenceHeading}>Submit Evidence</Text>
        <Text style={styles.evidenceSubtext}>
          Upload a photo, video, or document to prove you completed your wager.
        </Text>

        {evidenceFile ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <View style={styles.successTextBlock}>
              <Text style={styles.successTitle}>File loaded successfully</Text>
              <Text style={styles.successFile}>{evidenceFile.name}</Text>
            </View>
          </View>
        ) : null}

        {result ? (
          <View style={[styles.resultBox, result.approved ? styles.resultApproved : styles.resultRejected]}>
            <Text style={[styles.resultHeading, result.approved ? styles.resultApprovedText : styles.resultRejectedText]}>
              {result.approved ? '✓ Wager Won' : '✗ Wager Lost'}
            </Text>
            <Text style={styles.resultReasoning}>{result.reasoning}</Text>
          </View>
        ) : null}

        {submitError ? (
          <Text style={styles.errorText}>{submitError}</Text>
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonFlex, (picking || submitting) && styles.buttonDisabled]}
            onPress={handleChooseFile}
            disabled={picking || submitting}
          >
            {picking ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {evidenceFile ? 'Replace File' : 'Choose File'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonFlex, submitting && styles.buttonDisabled]}
            onPress={handleTakePhoto}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {evidenceFile && !result ? (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Evidence</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  )
}

export default WagerDetailScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  amountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    marginBottom: 20,
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 28,
  },
  evidenceHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  evidenceSubtext: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 20,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0faf0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b6e8b6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  successTextBlock: {
    flex: 1,
  },
  successIcon: {
    fontSize: 20,
    color: '#2e7d32',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  successFile: {
    fontSize: 13,
    color: '#555555',
    marginTop: 2,
  },
  resultBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  resultApproved: {
    backgroundColor: '#f0faf0',
    borderColor: '#b6e8b6',
  },
  resultRejected: {
    backgroundColor: '#fff0f0',
    borderColor: '#f5c0c0',
  },
  resultHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultApprovedText: {
    color: '#2e7d32',
  },
  resultRejectedText: {
    color: '#c62828',
  },
  resultReasoning: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  buttonFlex: {
    flex: 1,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    marginBottom: 12,
  },
  backLink: {
    fontSize: 16,
    color: '#000000',
  },
})
