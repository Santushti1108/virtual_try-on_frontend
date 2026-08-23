import type { SelectedImage } from '@/types/image';

const API_URL = 'http://192.168.31.30:8000';


//function for person image 
export async function uploadPersonImage(image: SelectedImage) {
  const formData = new FormData();

  formData.append('file', {
    uri: image.uri,
    name: image.fileName ?? 'person.jpg',
    type: image.mimeType ?? 'image/jpeg',
  } as any);

  const response = await fetch(`${API_URL}/upload/person`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}

//function for clothing image 

export async function uploadClothingImage(image: SelectedImage) {
  const formData = new FormData();

  formData.append('file', {
    uri: image.uri,
    name: image.fileName ?? 'clothing.jpg',
    type: image.mimeType ?? 'image/jpeg',
  } as any);

  const response = await fetch(`${API_URL}/upload/clothing`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}


export async function tryOn(
  personImage: SelectedImage,
  clothingImage: SelectedImage
) {
  const formData = new FormData();

  formData.append('person', {
    uri: personImage.uri,
    name: personImage.fileName ?? 'person.jpg',
    type: personImage.mimeType ?? 'image/jpeg',
  } as any);

  formData.append('clothing', {
    uri: clothingImage.uri,
    name: clothingImage.fileName ?? 'clothing.jpg',
    type: clothingImage.mimeType ?? 'image/jpeg',
  } as any);

  const response = await fetch(`${API_URL}/tryon`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Try-on failed: ${response.status}`);
  }

  return response.json();
}