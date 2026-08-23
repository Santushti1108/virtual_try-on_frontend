import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { UploadCard } from '@/components/UploadCard';
import {tryOn, uploadClothingImage, uploadPersonImage } from '@/services/api';
import { showImageSourceOptions } from '@/services/imagePicker';
import type { SelectedImage } from '@/types/image';



type ImageSlot = 'person' | 'clothing';

export default function HomeScreen() {
  const [personImage, setPersonImage] = useState<SelectedImage | null>(null);
  const [clothingImage, setClothingImage] = useState<SelectedImage | null>(null);

  const saveSelectedImage = async(slot: ImageSlot, image: SelectedImage) => {
    if (slot === 'person') {
      setPersonImage(image);

      try{
        const result = await uploadPersonImage(image);
        console.log('person image uploaded:',result);
      }catch (error){
        console.error('person image upload failed:', error);
        Alert.alert('upload failed','could not upload your photo.');
      }
    } else {
      setClothingImage(image);
    

    try {
      const result = await uploadClothingImage(image);
      console.log('Clothing image uploaded:', result);
    } catch (error){
      console.error('clothing image upload failed:',error);
      Alert.alert('Upload failed', ' Could not upload the clothing image.');
    }
  }
};

  const selectImageSource = (slot: ImageSlot) => {
    showImageSourceOptions((image) => saveSelectedImage(slot, image));
  };
// const handleTryOn = () => {
//   Alert.alert('TEST', 'New Try On function is working!');
// };
  const handleTryOn = async () => {
  if (!personImage || !clothingImage) {
    Alert.alert('Missing images', 'Please select both your photo and clothing.');
    return;
  }

  try {
    console.log('Starting try-on...');

    const result = await tryOn(personImage, clothingImage);

    console.log('Try-on response:', result);

    Alert.alert('Success', 'Both images were sent to the backend!');
  } catch (error) {
    console.error('Try-on failed:', error);
    Alert.alert('Try-on failed', 'Could not send the images to the backend.');
  }
};

  const canTryOn = Boolean(personImage && clothingImage);

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F7]">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4 px-5 pb-8 pt-6">
          <View className="mb-2 gap-2">
            <Text className="text-xs font-bold tracking-[1.1px] text-[#A44A65]">
              PERSONAL STYLE, VISUALIZED
            </Text>
            <Text className="text-[34px] font-bold tracking-[-0.8px] text-[#241A1D]">
              Virtual Try-On
            </Text>
            <Text className="text-base leading-[23px] text-[#6F6266]">
              Add a photo of yourself and the saree or clothing you would like to try on.
            </Text>
          </View>

          <UploadCard
            title="Your Photo"
            description="Choose a clear, full-length photo for the best result."
            imageUri={personImage?.uri ?? null}
            onPress={() => selectImageSource('person')}
          />

          <UploadCard
            title="Saree / Clothing"
            description="Choose the clothing photo you would like to preview."
            imageUri={clothingImage?.uri ?? null}
            onPress={() => selectImageSource('clothing')}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canTryOn }}
            className={`mt-2 min-h-14 items-center justify-center rounded-2xl shadow-md shadow-[#6E1935]/20 ${
              canTryOn ? 'bg-[#9D3657] active:opacity-[0.86]' : 'bg-[#E7D9DC] shadow-none'
            }`}
            disabled={!canTryOn}
            onPress={handleTryOn}>
            <Text className={`text-[17px] font-bold ${canTryOn ? 'text-white' : 'text-[#9D8A8F]'}`}>
              Try On
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
