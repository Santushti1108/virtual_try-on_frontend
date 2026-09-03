import { Alert, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface DownloadResult {
  success: boolean;
  message: string;
}

export async function saveOrDownloadImage(
  imageUri: string,
  filenamePrefix = 'virtual-tryon'
): Promise<DownloadResult> {
  if (!imageUri) {
    return { success: false, message: 'No image provided to download.' };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${filenamePrefix}-${timestamp}.png`;

  try {
    // ----------------------------------------------------
    // WEB DOWNLOAD
    // ----------------------------------------------------
    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        const link = document.createElement('a');
        link.href = imageUri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true, message: 'Look downloaded to your device!' };
      }
      return { success: false, message: 'Web document environment not available.' };
    }

    // ----------------------------------------------------
    // NATIVE (iOS / ANDROID)
    // ----------------------------------------------------
    let localFileUri = imageUri;

    // If data URL, write to local cache file first
    if (imageUri.startsWith('data:')) {
      const parts = imageUri.split(',');
      const base64Data = parts[1];
      if (!base64Data) {
        throw new Error('Invalid image data format.');
      }

      const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
      localFileUri = `${cacheDir}${filename}`;

      await FileSystem.writeAsStringAsync(localFileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // Use React Native built-in Share sheet to let user Save to Photos, Files, etc.
    const result = await Share.share({
      title: 'Save Virtual Try-On Look',
      message: Platform.OS === 'android' ? 'Here is my AI Virtual Try-On look!' : undefined,
      url: localFileUri,
    });

    if (result.action === Share.sharedAction) {
      return { success: true, message: 'Image shared or saved successfully.' };
    } else if (result.action === Share.dismissedAction) {
      return { success: true, message: 'Share sheet closed.' };
    }

    return { success: true, message: 'Image prepared.' };
  } catch (error: any) {
    console.error('Download error:', error);
    const msg = error?.message || 'Could not download or share the image.';
    Alert.alert('Download Issue', msg);
    return { success: false, message: msg };
  }
}
