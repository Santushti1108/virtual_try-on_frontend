import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface HistoryItem {
  id: string;
  imageUri: string;
  modelName: string;
  clothingName: string;
  timestamp: number;
}

const STORAGE_KEY = 'vton_history_items_v1';
const FILE_NAME = 'vton_history.json';
const MAX_HISTORY_ITEMS = 20;

function getFilePath(): string {
  const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  return `${dir}${FILE_NAME}`;
}

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
      return [];
    }

    // Native platforms (Android / iOS)
    const filePath = getFilePath();
    const info = await FileSystem.getInfoAsync(filePath);
    if (!info.exists) {
      return [];
    }

    const content = await FileSystem.readAsStringAsync(filePath);
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load history:', error);
    return [];
  }
}

export async function saveHistoryItem(
  item: Omit<HistoryItem, 'id' | 'timestamp'>
): Promise<HistoryItem[]> {
  try {
    const existing = await loadHistory();
    const newItem: HistoryItem = {
      ...item,
      id: `look_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    // Prepend and limit
    const updated = [newItem, ...existing.filter((i) => i.imageUri !== item.imageUri)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    await persistHistory(updated);
    return updated;
  } catch (error) {
    console.warn('Failed to save history item:', error);
    return [];
  }
}

export async function deleteHistoryItem(id: string): Promise<HistoryItem[]> {
  try {
    const existing = await loadHistory();
    const updated = existing.filter((item) => item.id !== id);
    await persistHistory(updated);
    return updated;
  } catch (error) {
    console.warn('Failed to delete history item:', error);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await persistHistory([]);
  } catch (error) {
    console.warn('Failed to clear history:', error);
  }
}

async function persistHistory(items: HistoryItem[]): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    return;
  }

  const filePath = getFilePath();
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(items));
}
