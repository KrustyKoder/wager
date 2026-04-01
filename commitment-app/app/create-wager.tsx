import { useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWager } from '@/hooks/useWager'

export function CreateWagerScreen() {
  const insets = useSafeAreaInsets()
  const { createWager, loading, error } = useWager()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleDateChange(_event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (selected) setDeadline(selected)
  }

  async function handleSubmit() {
    setValidationError(null)

    if (!title.trim() || !description.trim() || !amount.trim()) {
      setValidationError('All fields are required')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Enter a valid amount')
      return
    }

    const success = await createWager({
      title: title.trim(),
      description: description.trim(),
      amount: parsedAmount,
      deadline,
    })

    if (success) {
      router.back()
    }
  }

  const displayError = validationError ?? error

  return (
    <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>New Wager</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Run a marathon"
                placeholderTextColor="#999999"
                textContentType="none"
                autoComplete="off"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Describe your wager..."
                placeholderTextColor="#999999"
                textContentType="none"
                autoComplete="off"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Amount (£)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#999999"
                textContentType="none"
                autoComplete="off"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Deadline</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(!showDatePicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.deadlineValue}>
                  {deadline.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  style={styles.datePicker}
                />
              )}
            </View>

            {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Create Wager</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
    </View>
  )
}

export default CreateWagerScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
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
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  deadlineValue: {
    fontSize: 16,
    color: '#000000',
  },
  datePicker: {
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    color: '#cc0000',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 8,
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
})
