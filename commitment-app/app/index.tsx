import { useCallback } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWager, Wager } from '@/hooks/useWager'

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No wagers yet</Text>
    </View>
  )
}

function WagerCard({ wager }: { wager: Wager }) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const deadline = new Date(wager.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Animated.View style={[styles.cardShadow, animatedStyle]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }) }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }) }}
        onPress={() => router.push(`/wager/${wager.id}`)}
      >
        <View style={styles.cardRow}>
          <Text style={styles.wagerTitle}>{wager.title}</Text>
          <Text style={styles.wagerAmount}>£{wager.amount}</Text>
        </View>
        <Text style={styles.wagerMeta}>Due {deadline} · {wager.status}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function WagerPage() {
  const insets = useSafeAreaInsets()
  const { wagers, fetchWagers } = useWager()

  useFocusEffect(
    useCallback(() => {
      fetchWagers()
    }, [])
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Wagers</Text>
      </View>

      <FlatList
        data={wagers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WagerCard wager={item} />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/create-wager')}>
          <Text style={styles.buttonText}>Create Wager</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

//put this into its own folder later
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
  cardShadow: {
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderBottomWidth: 3,
    borderBottomColor: '#e0e0e0',
    gap: 6,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wagerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  wagerAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  wagerMeta: {
    fontSize: 13,
    color: '#999999',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
