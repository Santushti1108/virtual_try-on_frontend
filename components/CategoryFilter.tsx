import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const handlePress = (cat: string) => {
    if (cat === selectedCategory) return;

    if (Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback
      }
    }
    onSelectCategory(cat);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = cat === selectedCategory;
          return (
            <Pressable
              key={cat}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Category ${cat}`}
              onPress={() => handlePress(cat)}
              style={[styles.pill, isSelected ? styles.pillSelected : styles.pillDefault]}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextDefault,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  pillDefault: {
    backgroundColor: '#F3ECE8',
    borderWidth: 1,
    borderColor: '#ECE2DD',
  },
  pillSelected: {
    backgroundColor: '#8A2846',
    borderWidth: 1,
    borderColor: '#8A2846',
    shadowColor: '#8A2846',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pillTextDefault: {
    color: '#715E63',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
