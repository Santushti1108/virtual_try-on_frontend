import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

type SelectionCardProps = {
  name: string;
  meta: string;
  image: ImageSourcePropType | string | null;
  selected?: boolean;
  upload?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function SelectionCard({
  name,
  meta,
  image,
  selected = false,
  upload = false,
  disabled = false,
  onPress,
}: SelectionCardProps) {
  const imageSource = typeof image === 'string' ? { uri: image } : image;

  // Upload card when no image is selected yet
  if (upload && !imageSource) {
    return (
      <Pressable
        accessibilityLabel={`Upload custom ${name}`}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          styles.uploadCard,
          selected && styles.cardSelected,
          disabled && styles.disabled,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.uploadImageContainer}>
          <View style={styles.uploadIconBadge}>
            <Ionicons color="#8A2846" name="camera" size={22} />
          </View>
          <Text style={styles.uploadTitle}>Custom Upload</Text>
          <Text style={styles.uploadSubtitle}>Camera or Gallery</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {meta || 'Upload custom photo'}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityLabel={`${name}, ${meta}`}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
        disabled && styles.disabled,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageContainer}>
        {imageSource ? (
          <>
            <Image
              accessibilityLabel={name}
              resizeMode="cover"
              source={imageSource}
              style={styles.image}
            />

            {upload && (
              <View style={styles.customBadge}>
                <Ionicons color="#FFFFFF" name="sparkles" size={10} style={{ marginRight: 3 }} />
                <Text style={styles.customBadgeText}>CUSTOM</Text>
              </View>
            )}

            {upload && (
              <View style={styles.repeatBadge}>
                <Ionicons color="#FFFFFF" name="swap-horizontal" size={13} />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons color="#8A767B" name="image-outline" size={28} />
            <Text style={styles.placeholderText}>No preview</Text>
          </View>
        )}

        {selected && (
          <View style={styles.checkmarkBadge}>
            <Ionicons color="#FFFFFF" name="checkmark" size={14} />
          </View>
        )}
      </View>

      <View style={[styles.textContainer, selected && styles.textContainerSelected]}>
        <Text style={[styles.nameText, selected && styles.nameTextSelected]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {meta || (upload ? 'Custom upload' : 'Studio piece')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 154,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2C1C20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardDefault: {
    borderWidth: 1.5,
    borderColor: '#ECE4E0',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#8A2846',
    backgroundColor: '#FDF9FA',
    shadowColor: '#8A2846',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  uploadCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4B8BF',
    backgroundColor: '#FAF5F7',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
  imageContainer: {
    width: '100%',
    height: 196,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F3ECE8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadImageContainer: {
    width: '100%',
    height: 196,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#FAF5F7',
  },
  uploadIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2DFE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C1C20',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  uploadSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '500',
    color: '#8A767B',
    textAlign: 'center',
  },
  customBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(28, 19, 22, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  customBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  repeatBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 19, 22, 0.65)',
    padding: 5,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#8A767B',
    textAlign: 'center',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8A2846',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ECE4E0',
    backgroundColor: '#FFFFFF',
  },
  textContainerSelected: {
    backgroundColor: '#FDF9FA',
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1316',
    letterSpacing: -0.1,
  },
  nameTextSelected: {
    color: '#8A2846',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7C6C70',
    marginTop: 2,
  },
});