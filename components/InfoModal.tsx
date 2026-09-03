import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type InfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function InfoModal({ visible, onClose }: InfoModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.brandBadge}>
              <Ionicons color="#8A2846" name="sparkles" size={16} />
              <Text style={styles.brandBadgeText}>AI STUDIO</Text>
            </View>

            <Pressable
              accessibilityLabel="Close modal"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color="#6C595D" name="close" size={20} />
            </Pressable>
          </View>

          <Text style={styles.title}>Virtual Fitting Room</Text>
          <Text style={styles.description}>
            Experience hyper-realistic virtual try-on powered by CatVTON neural rendering.
          </Text>

          {/* Tips list */}
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipIconBox}>
                <Ionicons color="#8A2846" name="person-outline" size={16} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipHeading}>Step 01: Choose Model</Text>
                <Text style={styles.tipSubtext}>
                  Pick a studio model or upload a clear, front-facing photo of yourself.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIconBox}>
                <Ionicons color="#8A2846" name="shirt-outline" size={16} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipHeading}>Step 02: Pick Your Look</Text>
                <Text style={styles.tipSubtext}>
                  Select an outfit from our curated catalog or upload any garment image.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIconBox}>
                <Ionicons color="#8A2846" name="sparkles-outline" size={16} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipHeading}>Step 03: Try On with AI</Text>
                <Text style={styles.tipSubtext}>
                  Our cloud GPU processes your look in seconds. Download and view in My Looks.
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Got It</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 19, 22, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF1F4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2D7DE',
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8A2846',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6EFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1316',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: '#76676B',
  },
  tipsList: {
    gap: 12,
    marginVertical: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FAF2F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C1D21',
  },
  tipSubtext: {
    fontSize: 12,
    lineHeight: 16,
    color: '#837276',
  },
  doneButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#8A2846',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
