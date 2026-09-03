import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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

import { CategoryFilter } from '@/components/CategoryFilter';
import { Footer } from '@/components/Footer';
import { InfoModal } from '@/components/InfoModal';
import { ResultCard } from '@/components/ResultCard';
import { SelectionCard } from '@/components/SelectionCard';
import { tryOn } from '@/services/api';
import { saveHistoryItem } from '@/services/history';
import { showImageSourceOptions } from '@/services/imagePicker';
import { clothes, models } from '@/types/catalog';
import type { SelectedImage } from '@/types/image';

type ImageSlot = 'person' | 'clothing';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [personImage, setPersonImage] = useState<SelectedImage | null>(null);
  const [clothingImage, setClothingImage] = useState<SelectedImage | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<string | null>(null);

  const [selectedClothingCategory, setSelectedClothingCategory] = useState<string>('All');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resultOpacity = useRef(new Animated.Value(0)).current;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (resultImage) {
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();

      // Smooth scroll down to result on result arrival
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    } else {
      resultOpacity.setValue(0);
    }
  }, [resultImage, resultOpacity]);

  useEffect(() => {
    return () => {
      // Abort any ongoing request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const saveSelectedImage = (slot: ImageSlot, image: SelectedImage) => {
    if (slot === 'person') {
      setPersonImage(image);
      setSelectedModel(null);
    } else {
      setClothingImage(image);
      setSelectedClothing(null);
    }

    setResultImage(null);
  };

  const selectImageSource = (slot: ImageSlot) => {
    showImageSourceOptions((image) => {
      saveSelectedImage(slot, image);
    });
  };

  const selectModel = (modelId: string) => {
    const model = models.find((item) => item.id === modelId);
    if (!model?.image) return;

    setSelectedModel(modelId);
    setPersonImage({
      uri: Image.resolveAssetSource(model.image).uri,
      fileName: null,
      mimeType: null,
    });
    setResultImage(null);

    if (Platform.OS !== 'web') {
      try {
        void Haptics.selectionAsync();
      } catch {
        // Fallback
      }
    }
  };

  const selectClothing = (clothingId: string) => {
    const clothing = clothes.find((item) => item.id === clothingId);
    if (!clothing?.image) return;

    setSelectedClothing(clothingId);
    setClothingImage({
      uri: Image.resolveAssetSource(clothing.image).uri,
      fileName: null,
      mimeType: null,
    });
    setResultImage(null);

    if (Platform.OS !== 'web') {
      try {
        void Haptics.selectionAsync();
      } catch {
        // Fallback
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);

    if (Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback
      }
    }
  };

  const handleTryOn = async () => {
    if (loading) return;

    if (!personImage || !clothingImage) {
      Alert.alert(
        'Missing selection',
        'Please select both a model and a clothing item first.'
      );
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Fallback
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setResultImage(null);

      console.log('Starting CatVTON try-on...');

      const data = await tryOn(
        personImage,
        clothingImage,
        controller.signal
      );

      // If this request was cancelled, ignore result
      if (controller.signal.aborted) {
        return;
      }

      console.log('CatVTON result:', data);

      if (!data?.resultBlob || data.resultBlob.size === 0) {
        throw new Error(
          'The AI finished processing but did not return the result image.'
        );
      }

      // Convert the returned PNG into a displayable image URI
      const reader = new FileReader();

      const resultUri = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Could not read the generated image.'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Could not load the generated image.'));
        };

        reader.readAsDataURL(data.resultBlob);
      });

      if (controller.signal.aborted) {
        return;
      }

      setResultImage(resultUri);

      // Automatically persist result to local history
      void saveHistoryItem({
        imageUri: resultUri,
        modelName: selectedModelName,
        clothingName: selectedClothingName,
      });

      if (Platform.OS !== 'web') {
        try {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch {
          // Fallback
        }
      }

      console.log('✅ Result image loaded and saved to history.');
    } catch (error: any) {
      const isAborted =
        error?.name === 'AbortError' ||
        controller.signal.aborted ||
        error?.message?.toLowerCase().includes('abort') ||
        error?.message?.toLowerCase().includes('cancel');

      if (isAborted) {
        console.log('Try-on request cancelled by user.');
        return;
      }

      console.error('Try-on failed:', error);

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Could not generate the try-on image. Please try again.';

      Alert.alert('Try-on notice', errorMessage);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleTryAnother = () => {
    setResultImage(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const canTryOn = Boolean(personImage && clothingImage && !loading);

  // Selected item display helpers for pair summary
  const selectedModelData = selectedModel
    ? models.find((m) => m.id === selectedModel)
    : null;
  const selectedModelName = selectedModelData
    ? selectedModelData.name
    : personImage
      ? 'Custom Photo'
      : 'No model';

  const selectedClothingData = selectedClothing
    ? clothes.find((c) => c.id === selectedClothing)
    : null;
  const selectedClothingName = selectedClothingData
    ? selectedClothingData.name
    : clothingImage
      ? 'Custom Outfit'
      : 'No outfit';

  // Filter clothes by category
  const clothingCategories = useMemo(() => ['All', 'Dresses', 'Custom'], []);

  const filteredClothes = useMemo(() => {
    if (selectedClothingCategory === 'All') return clothes;
    if (selectedClothingCategory === 'Dresses') {
      return clothes.filter((c) => c.category === 'Dresses');
    }
    if (selectedClothingCategory === 'Custom') {
      return clothes.filter((c) => c.category === 'Custom');
    }
    return clothes;
  }, [selectedClothingCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 14) },
        ]}
      >
        <View style={styles.responsiveContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Ionicons color="#FFFFFF" name="sparkles" size={17} />
              </View>
              <View>
                <Text style={styles.brandTitle}>VIRTUAL TRY-ON</Text>
                <Text style={styles.brandSubtitle}>STUDIO EDITION</Text>
              </View>
            </View>

            <View style={styles.headerRightRow}>
              <View style={styles.studioPill}>
                <View style={styles.greenLiveDot} />
                <Text style={styles.studioPillText}>AI STUDIO</Text>
              </View>

              <Pressable
                accessibilityLabel="App Information & Tips"
                accessibilityRole="button"
                onPress={() => setShowInfoModal(true)}
                style={styles.infoButton}
              >
                <Ionicons color="#6E595D" name="information-circle-outline" size={20} />
              </Pressable>
            </View>
          </View>

          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <View style={styles.heroBadge}>
              <Ionicons color="#8A2846" name="sparkles" size={12} />
              <Text style={styles.heroEyebrow}>STUDIO FITTING ROOM</Text>
            </View>

            <Text style={styles.heroTitle}>
              See your style{'\n'}before you wear it.
            </Text>

            <Text style={styles.heroDescription}>
              Select a muse, choose an outfit from our collection, and experience instant AI fitting in real time.
            </Text>
          </View>

          {/* SECTION 1: MODEL SELECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderCol}>
                <Text style={styles.stepTag}>STEP 01</Text>
                <Text style={styles.sectionTitle}>Choose your model</Text>
              </View>

              <Text style={styles.sectionHelper}>Swipe to explore</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {models.map((model, index) => {
                const isUploadCard = index === models.length - 1;

                return (
                  <SelectionCard
                    key={model.id}
                    disabled={loading}
                    image={
                      isUploadCard ? personImage?.uri ?? null : model.image
                    }
                    meta={
                      isUploadCard && personImage
                        ? 'Selected photo'
                        : model.meta
                    }
                    name={
                      isUploadCard && personImage
                        ? 'Custom photo'
                        : model.name
                    }
                    onPress={() => {
                      if (isUploadCard) {
                        selectImageSource('person');
                      } else {
                        selectModel(model.id);
                      }
                    }}
                    selected={
                      isUploadCard
                        ? !selectedModel && Boolean(personImage)
                        : selectedModel === model.id
                    }
                    upload={isUploadCard}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* SECTION 2: CLOTHING SELECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderCol}>
                <Text style={styles.stepTag}>STEP 02</Text>
                <Text style={styles.sectionTitle}>Choose your look</Text>
              </View>

              <Text style={styles.sectionHelper}>Wardrobe catalog</Text>
            </View>

            {/* Category Filter Chips */}
            <CategoryFilter
              categories={clothingCategories}
              onSelectCategory={setSelectedClothingCategory}
              selectedCategory={selectedClothingCategory}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {filteredClothes.map((look) => {
                const isUploadCard = look.id === 'look-4';

                return (
                  <SelectionCard
                    key={look.id}
                    disabled={loading}
                    image={
                      isUploadCard
                        ? clothingImage?.uri ?? null
                        : look.image
                    }
                    meta={
                      isUploadCard && clothingImage
                        ? 'Selected piece'
                        : look.meta
                    }
                    name={
                      isUploadCard && clothingImage
                        ? 'Custom outfit'
                        : look.name
                    }
                    onPress={() => {
                      if (isUploadCard) {
                        selectImageSource('clothing');
                      } else {
                        selectClothing(look.id);
                      }
                    }}
                    selected={
                      isUploadCard
                        ? !selectedClothing && Boolean(clothingImage)
                        : selectedClothing === look.id
                    }
                    upload={isUploadCard}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* PAIR SUMMARY & PRIMARY CTA */}
          <View style={styles.actionContainer}>
            {/* Active selection summary bridge */}
            <View style={styles.pairSummaryCard}>
              {/* Model chosen preview */}
              <View style={styles.pairItem}>
                <View style={styles.pairThumbnail}>
                  {personImage?.uri ? (
                    <Image
                      accessibilityLabel="Selected model thumbnail"
                      resizeMode="cover"
                      source={{ uri: personImage.uri }}
                      style={styles.pairThumbnailImage}
                    />
                  ) : (
                    <Ionicons color="#8A767B" name="person-outline" size={20} />
                  )}
                </View>
                <View style={styles.pairInfo}>
                  <Text style={styles.pairLabel}>Model</Text>
                  <Text numberOfLines={1} style={styles.pairValue}>
                    {selectedModelName}
                  </Text>
                </View>
              </View>

              {/* Connector */}
              <View style={styles.pairConnector}>
                <Ionicons color="#8A2846" name="add" size={16} />
              </View>

              {/* Clothing chosen preview */}
              <View style={styles.pairItem}>
                <View style={styles.pairThumbnail}>
                  {clothingImage?.uri ? (
                    <Image
                      accessibilityLabel="Selected outfit thumbnail"
                      resizeMode="cover"
                      source={{ uri: clothingImage.uri }}
                      style={styles.pairThumbnailImage}
                    />
                  ) : (
                    <Ionicons color="#8A767B" name="shirt-outline" size={20} />
                  )}
                </View>
                <View style={styles.pairInfo}>
                  <Text style={styles.pairLabel}>Outfit</Text>
                  <Text numberOfLines={1} style={styles.pairValue}>
                    {selectedClothingName}
                  </Text>
                </View>
              </View>
            </View>

            {/* TRY ON CTA / CANCEL CONTROLS */}
            {loading ? (
              <View style={styles.loadingActionContainer}>
                <View style={styles.loadingStatusCard}>
                  <ActivityIndicator color="#8A2846" size="small" />
                  <View style={styles.loadingTextCol}>
                    <Text style={styles.loadingTitle}>Creating your look...</Text>
                    <Text style={styles.loadingSubtitle}>
                      AI fitting in progress on GPU
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityLabel="Cancel try-on"
                  accessibilityRole="button"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                >
                  <Ionicons color="#8A2846" name="close-circle-outline" size={18} />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityLabel="Try On with AI"
                accessibilityRole="button"
                disabled={!canTryOn}
                onPress={handleTryOn}
                style={[
                  styles.tryOnButton,
                  canTryOn ? styles.tryOnButtonActive : styles.tryOnButtonDisabled,
                ]}
              >
                {canTryOn ? (
                  <Ionicons color="#FFFFFF" name="sparkles" size={20} />
                ) : (
                  <Ionicons color="#9C898E" name="sparkles-outline" size={19} />
                )}

                <Text
                  style={[
                    styles.tryOnText,
                    canTryOn ? styles.tryOnTextActive : styles.tryOnTextDisabled,
                  ]}
                >
                  {canTryOn ? 'Try On with AI' : 'Select Model & Outfit'}
                </Text>
              </Pressable>
            )}

            {/* Helper caption below CTA when selections are incomplete */}
            {!canTryOn && !loading && (
              <Text style={styles.helperCaption}>
                {!personImage && !clothingImage
                  ? 'Choose a model and an outfit above to begin fitting'
                  : !personImage
                    ? 'Choose a model above to complete the pair'
                    : 'Choose an outfit above to complete the pair'}
              </Text>
            )}

            {/* RESULT SECTION */}
            {resultImage && (
              <Animated.View style={{ opacity: resultOpacity }}>
                <ResultCard
                  clothingName={selectedClothingName}
                  imageUri={resultImage}
                  modelName={selectedModelName}
                  onTryAnother={handleTryAnother}
                />
              </Animated.View>
            )}
          </View>

          {/* WEB FOOTER */}
          <Footer />
        </View>
      </ScrollView>

      {/* INFO MODAL */}
      <InfoModal
        onClose={() => setShowInfoModal(false)}
        visible={showInfoModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  scrollContent: {
    paddingBottom: 72,
  },
  responsiveContainer: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#8A2846',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8A2846',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#1C1316',
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#8C777C',
    marginTop: 1,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DBD7',
    backgroundColor: '#F3EAE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E8B57',
  },
  studioPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#6E595D',
  },
  infoButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3EAE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 22,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FCEEF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#8A2846',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.6,
    color: '#1C1316',
  },
  heroDescription: {
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 21,
    color: '#736367',
  },
  sectionContainer: {
    marginBottom: 26,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  sectionHeaderCol: {
    gap: 3,
  },
  stepTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#8A2846',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#1C1316',
  },
  sectionHelper: {
    paddingBottom: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#8E7E82',
  },
  carouselContent: {
    paddingHorizontal: 24,
    paddingVertical: 4,
    gap: 14,
  },
  actionContainer: {
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 6,
  },
  pairSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDE3DF',
    backgroundColor: '#FFFFFF',
    padding: 14,
    shadowColor: '#2C1C20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pairItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pairThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3ECE8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECE3DE',
  },
  pairThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  pairInfo: {
    flex: 1,
  },
  pairLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#8C767B',
  },
  pairValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1316',
    marginTop: 1,
  },
  pairConnector: {
    marginHorizontal: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3DEE4',
  },
  loadingActionContainer: {
    gap: 12,
  },
  loadingStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDE3DF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#2C1C20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingTextCol: {
    flex: 1,
    gap: 2,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1316',
  },
  loadingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8C767B',
  },
  cancelButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#8A2846',
    backgroundColor: '#FAF3F5',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A2846',
  },
  tryOnButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
  },
  tryOnButtonActive: {
    backgroundColor: '#8A2846',
    shadowColor: '#8A2846',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  tryOnButtonDisabled: {
    backgroundColor: '#ECE3E5',
  },
  tryOnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tryOnTextActive: {
    color: '#FFFFFF',
  },
  tryOnTextDisabled: {
    color: '#9E8B90',
  },
  helperCaption: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#9E8B90',
  },
});