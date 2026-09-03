// import { Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';

// import type { SelectedImage } from '@/types/image';

// type OnImageSelected = (image: SelectedImage) => void;

// function createSelectedImage(asset: ImagePicker.ImagePickerAsset): SelectedImage | null {
//   if (asset.type !== 'image' || (asset.mimeType && !asset.mimeType.startsWith('image/'))) {
//     Alert.alert('Unsupported file', 'Please select or take an image file.');
//     return null;
//   }

//   return {
//     uri: asset.uri,
//     fileName: asset.fileName ?? null,
//     mimeType: asset.mimeType ?? null,
//   };
// }

// async function chooseFromGallery(onImageSelected: OnImageSelected) {
//   try {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert('Photo access needed', 'Allow access to your photos to choose an image.');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ['images'],
//       allowsEditing: true,
//       quality: 0.9,
//     });

//     if (result.canceled || !result.assets?.[0]) {
//       return;
//     }

//     const image = createSelectedImage(result.assets[0]);
//     if (image) {
//       onImageSelected(image);
//     }
//   } catch (error) {
//     console.error('Unable to select image:', error);
//     Alert.alert('Could not select image', 'Please try choosing a photo again.');
//   }
// }

// async function takePhoto(onImageSelected: OnImageSelected) {
//   try {
//     const permission = await ImagePicker.requestCameraPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert('Camera access needed', 'Allow camera access to take a photo.');
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ['images'],
//       allowsEditing: true,
//       quality: 0.9,
//     });

//     if (result.canceled || !result.assets?.[0]) {
//       return;
//     }

//     const image = createSelectedImage(result.assets[0]);
//     if (image) {
//       onImageSelected(image);
//     }
//   } catch (error) {
//     console.error('Unable to take photo:', error);
//     Alert.alert('Could not take photo', 'Please try using the camera again.');
//   }
// }

// export function showImageSourceOptions(onImageSelected: OnImageSelected) {
//   Alert.alert('Add photo', 'Choose how you would like to add your image.', [
//     { text: 'Take photo', onPress: () => void takePhoto(onImageSelected) },
//     { text: 'Choose from gallery', onPress: () => void chooseFromGallery(onImageSelected) },
//     { text: 'Cancel', style: 'cancel' },
//   ]);
// }


import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import type { SelectedImage } from '@/types/image';

type OnImageSelected = (image: SelectedImage) => void;

function createSelectedImage(
  asset: ImagePicker.ImagePickerAsset
): SelectedImage | null {
  if (
    asset.type !== 'image' ||
    (asset.mimeType && !asset.mimeType.startsWith('image/'))
  ) {
    Alert.alert(
      'Unsupported file',
      'Please select or take an image file.'
    );
    return null;
  }

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    mimeType: asset.mimeType ?? null,
  };
}

async function chooseFromGallery(
  onImageSelected: OnImageSelected
) {
  try {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

    if (
      result.canceled ||
      !result.assets?.[0]
    ) {
      return;
    }

    const image = createSelectedImage(
      result.assets[0]
    );

    if (image) {
      onImageSelected(image);
    }
  } catch (error) {
    console.error(
      'Unable to select image:',
      error
    );

    Alert.alert(
      'Could not select image',
      'Please try choosing a photo again.'
    );
  }
}

async function takePhoto(
  onImageSelected: OnImageSelected
) {
  try {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Camera access needed',
        'Allow camera access to take a photo.'
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

    if (
      result.canceled ||
      !result.assets?.[0]
    ) {
      return;
    }

    const image = createSelectedImage(
      result.assets[0]
    );

    if (image) {
      onImageSelected(image);
    }
  } catch (error) {
    console.error(
      'Unable to take photo:',
      error
    );

    Alert.alert(
      'Could not take photo',
      'Please try using the camera again.'
    );
  }
}

export function showImageSourceOptions(
  onImageSelected: OnImageSelected
) {
  // Web has no need for the mobile-style
  // permission/choice dialog.
  if (Platform.OS === 'web') {
    void chooseFromGallery(onImageSelected);
    return;
  }

  // Android / iOS
  Alert.alert(
    'Add photo',
    'Choose how you would like to add your image.',
    [
      {
        text: 'Take photo',
        onPress: () =>
          void takePhoto(onImageSelected),
      },
      {
        text: 'Choose from gallery',
        onPress: () =>
          void chooseFromGallery(onImageSelected),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
}