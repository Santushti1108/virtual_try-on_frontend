import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { saveOrDownloadImage } from '@/services/download';

type ResultCardProps = {
  imageUri: string;
  modelName: string;
  clothingName: string;
  onTryAnother: () => void;
};

export function ResultCard({
  imageUri,
  modelName,
  clothingName,
  onTryAnother,
}: ResultCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;

    if (Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Fallback
      }
    }

    try {
      setDownloading(true);
      const res = await saveOrDownloadImage(imageUri, 'my-virtual-look');
      if (res.success) {
        setDownloadSuccess(true);
        if (Platform.OS !== 'web') {
          try {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            // Fallback
          }
        }
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Could not save image.');
    } finally {
      setDownloading(false);
    }
  };

  const handleTryAnotherPress = () => {
    if (Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback
      }
    }
    onTryAnother();
  };

  return (
    <View style={styles.container}>
      {/* Header with Title & Badge */}
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <View style={styles.kickerRow}>
            <View style={styles.sparkleDot} />
            <Text style={styles.kickerText}>STUDIO FITTING COMPLETE</Text>
          </View>
          <Text style={styles.title}>Your Look</Text>
          <Text style={styles.subtitle}>AI-generated preview on your selected model</Text>
        </View>

        <View style={styles.savedPill}>
          <Ionicons color="#8A2846" name="bookmark" size={13} />
          <Text style={styles.savedPillText}>Saved</Text>
        </View>
      </View>

      {/* Model & Outfit Meta Info Pill */}
      {(modelName || clothingName) && (
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Ionicons color="#8A2846" name="person" size={11} />
            <Text style={styles.metaBadgeText}>{modelName || 'Custom Model'}</Text>
          </View>
          <Ionicons color="#B5A4A7" name="add" size={12} />
          <View style={styles.metaBadge}>
            <Ionicons color="#8A2846" name="shirt" size={11} />
            <Text style={styles.metaBadgeText}>{clothingName || 'Selected Piece'}</Text>
          </View>
        </View>
      )}

      {/* Image Container */}
      <View style={styles.imageCard}>
        <Image
          accessibilityLabel="Generated AI try-on look"
          resizeMode="contain"
          source={{ uri: imageUri }}
          style={styles.resultImage}
        />

        {/* AI Stamp Badge */}
        <View style={styles.aiTag}>
          <Ionicons color="#FFFFFF" name="sparkles" size={11} />
          <Text style={styles.aiTagText}>AI RENDER • CATVTON</Text>
        </View>
      </View>

      {/* Action Buttons: Download & Try Another */}
      <View style={styles.actionsGroup}>
        {/* Primary CTA: Download / Save */}
        <Pressable
          accessibilityLabel="Download generated look"
          accessibilityRole="button"
          disabled={downloading}
          onPress={handleDownload}
          style={({ pressed }) => [
            styles.downloadButton,
            downloadSuccess && styles.downloadButtonSuccess,
            pressed && styles.buttonPressed,
          ]}
        >
          {downloading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : downloadSuccess ? (
            <>
              <Ionicons color="#FFFFFF" name="checkmark-circle" size={18} />
              <Text style={styles.downloadButtonText}>Saved to Device</Text>
            </>
          ) : (
            <>
              <Ionicons color="#FFFFFF" name="download-outline" size={18} />
              <Text style={styles.downloadButtonText}>Download Look</Text>
            </>
          )}
        </Pressable>

        {/* Secondary Action: Try Another */}
        <Pressable
          accessibilityLabel="Try another look"
          accessibilityRole="button"
          onPress={handleTryAnotherPress}
          style={({ pressed }) => [styles.tryAnotherButton, pressed && styles.buttonPressed]}
        >
          <Ionicons color="#6E565B" name="refresh-outline" size={17} />
          <Text style={styles.tryAnotherButtonText}>Try Another</Text>
        </Pressable>
      </View>

      <Text style={styles.footerCaption}>
        This look was rendered in real time and automatically saved to your <Text style={{ fontWeight: '700' }}>My Looks</Text> collection.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#ECE3E0',
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#2C1C20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitleCol: {
    flex: 1,
    gap: 3,
  },
  kickerRow: {
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
  kickerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#8A2846',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#1C1316',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7D6D71',
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FAF2F4',
    borderWidth: 1,
    borderColor: '#EFE0E4',
  },
  savedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A2846',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F7F1EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#342125',
  },
  imageCard: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F4ECE8',
    borderWidth: 1,
    borderColor: '#E6DDD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImage: {
    width: '100%',
    height: 460,
  },
  aiTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 19, 22, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  downloadButton: {
    flex: 1.2,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#8A2846',
    shadowColor: '#8A2846',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadButtonSuccess: {
    backgroundColor: '#2E6F40',
    shadowColor: '#2E6F40',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tryAnotherButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: '#F8F4F2',
    borderWidth: 1,
    borderColor: '#DFD2CE',
  },
  tryAnotherButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6E565B',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  footerCaption: {
    textAlign: 'center',
    fontSize: 11,
    color: '#8C767B',
    lineHeight: 16,
  },
});
