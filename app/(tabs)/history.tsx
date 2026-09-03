import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  clearHistory,
  deleteHistoryItem,
  HistoryItem,
  loadHistory,
} from '@/services/history';
import { saveOrDownloadImage } from '@/services/download';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadHistory();
      setItems(data);
    } catch (err) {
      console.warn('Could not load history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchItems();
    }, [fetchItems])
  );

  const handleDelete = (item: HistoryItem) => {
    Alert.alert('Remove Look', 'Are you sure you want to remove this look from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteHistoryItem(item.id);
          setItems(updated);
          if (selectedItem?.id === item.id) {
            setSelectedItem(null);
          }
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear History', 'Are you sure you want to clear all saved looks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setItems([]);
          setSelectedItem(null);
        },
      },
    ]);
  };

  const handleDownload = async (item: HistoryItem) => {
    setDownloadingId(item.id);
    if (Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Fallback
      }
    }

    try {
      const res = await saveOrDownloadImage(item.imageUri, `look-${item.id}`);
      if (res.success && Platform.OS === 'web') {
        Alert.alert('Downloaded', 'Look saved to your device.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.outerContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitleCol}>
            <View style={styles.tagRow}>
              <View style={styles.sparkleDot} />
              <Text style={styles.tagText}>COLLECTION</Text>
            </View>
            <Text style={styles.title}>My Looks</Text>
            <Text style={styles.subtitle}>
              {items.length === 0
                ? 'Your previous AI try-ons'
                : `${items.length} saved AI try-on ${items.length === 1 ? 'look' : 'looks'}`}
            </Text>
          </View>

          {items.length > 0 && (
            <Pressable
              accessibilityLabel="Clear all looks"
              accessibilityRole="button"
              onPress={handleClearAll}
              style={styles.clearButton}
            >
              <Ionicons color="#8A2846" name="trash-outline" size={16} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {/* CONTENT */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#8A2846" size="large" />
            <Text style={styles.loadingText}>Loading your looks...</Text>
          </View>
        ) : items.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons color="#8A2846" name="shirt-outline" size={36} />
            </View>
            <Text style={styles.emptyTitle}>No looks yet</Text>
            <Text style={styles.emptySubtitle}>
              Your AI try-ons will appear here once you fit an outfit in the Studio.
            </Text>

            <Pressable
              accessibilityLabel="Start in Studio"
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)')}
              style={styles.studioCta}
            >
              <Ionicons color="#FFFFFF" name="sparkles" size={18} />
              <Text style={styles.studioCtaText}>Start in Studio</Text>
            </Pressable>
          </View>
        ) : (
          /* LOOKS GRID */
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityLabel={`Look from ${formatDate(item.timestamp)}`}
                  accessibilityRole="button"
                  onPress={() => setSelectedItem(item)}
                  style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
                >
                  <View style={styles.gridImageContainer}>
                    <Image
                      accessibilityLabel="Look preview"
                      resizeMode="cover"
                      source={{ uri: item.imageUri }}
                      style={styles.gridImage}
                    />

                    <View style={styles.cardActionsRow}>
                      <Pressable
                        accessibilityLabel="Download image"
                        accessibilityRole="button"
                        onPress={(e) => {
                          e.stopPropagation();
                          void handleDownload(item);
                        }}
                        style={styles.miniActionButton}
                      >
                        {downloadingId === item.id ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Ionicons color="#FFFFFF" name="download-outline" size={14} />
                        )}
                      </Pressable>

                      <Pressable
                        accessibilityLabel="Delete look"
                        accessibilityRole="button"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        style={[styles.miniActionButton, styles.miniDeleteButton]}
                      >
                        <Ionicons color="#FFFFFF" name="trash-outline" size={14} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.gridCardMeta}>
                    <Text style={styles.cardOutfitText} numberOfLines={1}>
                      {item.clothingName || 'Selected Outfit'}
                    </Text>
                    <Text style={styles.cardModelText} numberOfLines={1}>
                      {item.modelName || 'Model'} • {formatDate(item.timestamp)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {/* FULLSCREEN INSPECT MODAL */}
        {selectedItem && (
          <Modal
            animationType="fade"
            transparent
            visible={Boolean(selectedItem)}
            onRequestClose={() => setSelectedItem(null)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)}>
              <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {selectedItem.clothingName || 'Look Preview'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedItem.modelName} • {formatDate(selectedItem.timestamp)}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityLabel="Close preview"
                    accessibilityRole="button"
                    onPress={() => setSelectedItem(null)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons color="#59464A" name="close" size={20} />
                  </Pressable>
                </View>

                <View style={styles.modalImageContainer}>
                  <Image
                    accessibilityLabel="Look full preview"
                    resizeMode="contain"
                    source={{ uri: selectedItem.imageUri }}
                    style={styles.modalImage}
                  />
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    accessibilityLabel="Download look"
                    accessibilityRole="button"
                    onPress={() => void handleDownload(selectedItem)}
                    style={styles.modalDownloadButton}
                  >
                    <Ionicons color="#FFFFFF" name="download-outline" size={18} />
                    <Text style={styles.modalDownloadButtonText}>Download</Text>
                  </Pressable>

                  <Pressable
                    accessibilityLabel="Delete look"
                    accessibilityRole="button"
                    onPress={() => handleDelete(selectedItem)}
                    style={styles.modalDeleteButton}
                  >
                    <Ionicons color="#8A2846" name="trash-outline" size={18} />
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  outerContainer: {
    flex: 1,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitleCol: {
    gap: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A2846',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#8A2846',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#1C1316',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7D6D71',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F7EDF0',
    borderWidth: 1,
    borderColor: '#EBD5DA',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A2846',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8C777C',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5E9EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1316',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#837075',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  studioCta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8A2846',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#8A2846',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  studioCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: windowWidth > 500 ? 'flex-start' : 'space-between',
  },
  gridCard: {
    width: windowWidth > 500 ? 190 : (windowWidth - 54) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE3DF',
    shadowColor: '#2C1C20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  gridImageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#F3ECE8',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  cardActionsRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  miniActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(28, 19, 22, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDeleteButton: {
    backgroundColor: 'rgba(138, 40, 70, 0.85)',
  },
  gridCardMeta: {
    padding: 12,
    gap: 2,
  },
  cardOutfitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1316',
  },
  cardModelText: {
    fontSize: 11,
    color: '#8A767B',
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 19, 22, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1316',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8A767B',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5ECEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    width: '100%',
    height: 420,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F3ECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalDownloadButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#8A2846',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalDownloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalDeleteButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FAF0F3',
    borderWidth: 1,
    borderColor: '#EBD5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
