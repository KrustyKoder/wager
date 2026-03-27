import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Wager = {
  id: string;
  title: string;
};

const wagers: Wager[] = [];

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No wagers yet</Text>
    </View>
  );
}

export default function WagerPage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Wagers</Text>
      </View>

      <FlatList
        data={wagers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.wagerItem}>
            <Text style={styles.wagerTitle}>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Wager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  wagerItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  wagerTitle: {
    fontSize: 16,
    color: '#000000',
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
});
