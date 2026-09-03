import type { SelectedImage } from '@/types/image';

const API_URL =
  'https://singhsantushti111--catvton-api-catvtonservice-web.modal.run';

const REQUEST_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export type TryOnResponse = {
  resultBlob: Blob;
};

export async function tryOn(
  personImage: SelectedImage,
  clothingImage: SelectedImage,
  signal?: AbortSignal
): Promise<TryOnResponse> {
  // -----------------------------------------
  // 1. Validate input
  // -----------------------------------------

  if (!personImage?.uri) {
    throw new Error('Please select a person image first.');
  }

  if (!clothingImage?.uri) {
    throw new Error('Please select a clothing image first.');
  }

  // -----------------------------------------
  // 2. Prepare request
  // -----------------------------------------

  const formData = new FormData();

  formData.append(
    'person',
    {
      uri: personImage.uri,
      name: personImage.fileName ?? 'person.jpg',
      type: personImage.mimeType ?? 'image/jpeg',
    } as any
  );

  formData.append(
    'cloth',
    {
      uri: clothingImage.uri,
      name: clothingImage.fileName ?? 'clothing.jpg',
      type: clothingImage.mimeType ?? 'image/jpeg',
    } as any
  );

  console.log('🚀 Sending request to CatVTON...');
  console.log('Person:', personImage.uri);
  console.log('Clothing:', clothingImage.uri);

  // -----------------------------------------
  // 3. Timeout protection
  // -----------------------------------------

  const timeoutController = new AbortController();

  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, REQUEST_TIMEOUT);

  // Combine user's Cancel signal with timeout signal
  const requestController = new AbortController();

  const abortFromUser = () => {
    requestController.abort();
  };

  const abortFromTimeout = () => {
    requestController.abort();
  };

  signal?.addEventListener('abort', abortFromUser);
  timeoutController.signal.addEventListener(
    'abort',
    abortFromTimeout
  );

  try {
    // -----------------------------------------
    // 4. Send request
    // -----------------------------------------

    let response: Response;

    try {
      response = await fetch(`${API_URL}/try-on`, {
        method: 'POST',
        body: formData,
        signal: requestController.signal,
      });
    } catch (error: any) {
      if (signal?.aborted) {
        throw new Error('Try-on cancelled.');
      }

      if (timeoutController.signal.aborted) {
        throw new Error(
          'The AI generation took too long. Please try again.'
        );
      }

      console.error('❌ Network error:', error);

      throw new Error(
        'Could not connect to the AI server. Please try again.'
      );
    }

    console.log('CatVTON HTTP status:', response.status);

    // -----------------------------------------
    // 5. Handle HTTP errors
    // -----------------------------------------

    if (!response.ok) {
      let serverMessage = '';

      try {
        const errorData = await response.json();

        serverMessage =
          typeof errorData?.detail === 'string'
            ? errorData.detail
            : errorData?.message || '';
      } catch {
        try {
          serverMessage = await response.text();
        } catch {
          serverMessage = '';
        }
      }

      console.error(
        '❌ CatVTON server error:',
        response.status,
        serverMessage
      );

      if (response.status === 400) {
        throw new Error(
          serverMessage ||
          'The selected images could not be processed. Please try different images.'
        );
      }

      if (response.status === 404) {
        throw new Error(
          'The AI service endpoint was not found.'
        );
      }

      if (response.status === 500) {
        throw new Error(
          'The AI service encountered an error while generating your look. Please try again.'
        );
      }

      if (response.status === 502 || response.status === 503) {
        throw new Error(
          'The AI server is currently unavailable. Please try again in a moment.'
        );
      }

      throw new Error(
        serverMessage ||
        `Try-on request failed (${response.status}). Please try again.`
      );
    }

    // -----------------------------------------
    // 6. Read PNG response
    // -----------------------------------------

    const resultBlob = await response.blob();

    if (!resultBlob || resultBlob.size === 0) {
      throw new Error(
        'The AI finished processing but returned an empty image.'
      );
    }

    console.log(
      '✅ CatVTON result received:',
      resultBlob.size,
      'bytes'
    );

    return {
      resultBlob,
    };
  } finally {
    clearTimeout(timeoutId);

    signal?.removeEventListener(
      'abort',
      abortFromUser
    );

    timeoutController.signal.removeEventListener(
      'abort',
      abortFromTimeout
    );
  }
}