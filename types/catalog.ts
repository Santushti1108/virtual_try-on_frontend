import type { ImageSourcePropType } from 'react-native';

export type CatalogItem = {
  id: string;
  name: string;
  meta: string;
  category?: string;
  image: ImageSourcePropType | null;
};

export const models: CatalogItem[] = [
  {
    id: 'model-1',
    name: 'Studio Muse',
    meta: 'Full length • Studio',
    category: 'Studio',
    image: require('../assets/models/model1.jpg'),
  },
  {
    id: 'model-2',
    name: 'City Edit',
    meta: 'Full length • Urban',
    category: 'Urban',
    image: require('../assets/models/model2.jpeg'),
  },
  {
    id: 'model-3',
    name: 'Editorial Muse',
    meta: 'Full length • Classic',
    category: 'Editorial',
    image: require('../assets/models/model3.avif'),
  },
  {
    id: 'model-4',
    name: 'Your Photo',
    meta: 'Upload your own',
    category: 'Custom',
    image: null,
  },
];

export const clothes: CatalogItem[] = [
  {
    id: 'look-1',
    name: 'nugged casual aesthetic',
    meta: 'Evening Collection',
    category: 'Dresses',
    image: require('../assets/clothes/dress1.webp'),
  },
  {
    id: 'look-2',
    name: 'Cocktail Midi Dress',
    meta: 'Studio Formal',
    category: 'Dresses',
    image: require('../assets/clothes/dress2.webp'),
  },
  {
    id: 'look-3',
    name: 'Red mini dress',
    meta: 'Party Edit',
    category: 'Dresses',
    image: require('../assets/clothes/dress3.jpg'),
  },
  {
    id: 'look-4',
    name: 'Your Outfit',
    meta: 'Upload custom garment',
    category: 'Custom',
    image: null,
  },
];