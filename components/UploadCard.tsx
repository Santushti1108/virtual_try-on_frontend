import { Image, Pressable, Text, View } from 'react-native';

type UploadCardProps = {
  title: string;
  description: string;
  imageUri: string | null;
  onPress: () => void;
};

export function UploadCard({ title, description, imageUri, onPress }: UploadCardProps) {
  return (
    <View className="gap-4 rounded-[20px] border border-[#F0E5E6] bg-white p-4 shadow-md shadow-[#5B2A36]/10">
      <View className="gap-1">
        <Text className="text-[19px] font-bold text-[#2C2024]">{title}</Text>
        <Text className="text-sm leading-5 text-[#766A6E]">{description}</Text>
      </View>

      {imageUri ? (
        <View className="overflow-hidden rounded-[14px]">
          <Image
            accessibilityLabel={`${title} preview`}
            className="h-60 w-full bg-[#F1E9EA]"
            source={{ uri: imageUri }}
          />
          <Pressable
            accessibilityRole="button"
            className="absolute bottom-3.5 self-center rounded-[20px] bg-[rgba(44,32,36,0.86)] px-5 py-2.5"
            onPress={onPress}>
            <Text className="text-sm font-bold text-white">Replace</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          className="min-h-[148px] items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-[#DDBBC4] bg-[#FFF8F8] p-5"
          onPress={onPress}>
          <View className="mb-[9px] h-9 w-9 items-center justify-center rounded-[18px] bg-[#F8E8EC]">
            <Text className="text-2xl font-normal leading-7 text-[#A44A65]">+</Text>
          </View>
          <Text className="text-base font-bold text-[#483539]">Choose photo</Text>
          <Text className="mt-[3px] text-[13px] text-[#8A7C80]">Camera or gallery</Text>
        </Pressable>
      )}
    </View>
  );
}
