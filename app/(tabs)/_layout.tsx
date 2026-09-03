import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import '../../global.css';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8A2846',
        tabBarInactiveTintColor: '#9C888D',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#ECE3E0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 54 + insets.bottom : 64,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 8,
          shadowColor: '#2C1C20',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={21}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'My Looks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'albums' : 'albums-outline'}
              size={21}
            />
          ),
        }}
      />
    </Tabs>
  );
}
