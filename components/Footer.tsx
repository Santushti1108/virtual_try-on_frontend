import { Platform, StyleSheet, Text, View } from 'react-native';

export function Footer() {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.footerContainer}>
      <View style={styles.content}>
        <View style={styles.brandCol}>
          <Text style={styles.brandTitle}>VIRTUAL TRY-ON</Text>
          <Text style={styles.brandSubtitle}>AI-powered fashion fitting & visualization</Text>
        </View>

        <Text style={styles.disclaimer}>
          Powered by CatVTON AI • Designed for real-time virtual apparel fitting.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 48,
    borderTopWidth: 1,
    borderTopColor: '#ECE3E0',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#F9F5F3',
  },
  content: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  brandCol: {
    gap: 4,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#8A2846',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#76676B',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9E8B90',
  },
});
