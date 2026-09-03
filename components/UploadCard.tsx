import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type UploadCardProps = {
  title: string;
  description: string;
  imageUri: string | null;
  onPress: () => void;
};

export function UploadCard({ title, description, imageUri, onPress }: UploadCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {imageUri ? (
        <View style={styles.imageWrapper}>
          <Image
            accessibilityLabel={`${title} preview`}
            style={styles.image}
            resizeMode="cover"
            source={{ uri: imageUri }}
          />
          <Pressable
            accessibilityRole="button"
            style={styles.changeButton}
            onPress={onPress}
          >
            <Ionicons color="white" name="camera" size={15} />
            <Text style={styles.changeButtonText}>Change photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          style={styles.uploadArea}
          onPress={onPress}
        >
          <View style={styles.iconCircle}>
            <Ionicons color="#8A2846" name="cloud-upload-outline" size={22} />
          </View>
          <Text style={styles.uploadLabel}>Choose photo</Text>
          <Text style={styles.uploadSubLabel}>Camera or gallery</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ECE2DF',
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#2C1C20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1316',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#76676B',
  },
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DFDC',
    backgroundColor: '#F3ECE9',
  },
  image: {
    height: 240,
    width: '100%',
  },
  changeButton: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 19, 22, 0.85)',
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadArea: {
    minHeight: 148,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D6C1C7',
    backgroundColor: '#FCF8F9',
    padding: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3DFE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#342226',
  },
  uploadSubLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#887479',
  },
});
