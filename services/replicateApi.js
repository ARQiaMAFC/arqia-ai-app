/**
 * Replicate API Service
 * Handles AI image generation via Stable Diffusion XL
 */

import { CONFIG } from '../context/AppContext';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// IMPORTANT: In production, use a backend server to protect your API key!
// Never expose API keys in client-side code for production apps.

const API_CONFIG = {
  // For development/testing only - use backend proxy in production
  REPLICATE_API_URL: 'https://api.replicate.com/v1/predictions',
  
  // Get your key at: https://replicate.com/account/api-tokens
  // Store in .env file: REPLICATE_API_TOKEN=r8_xxxxx
  REPLICATE_API_KEY: process.env.REPLICATE_API_TOKEN || 'YOUR_API_KEY_HERE',
  
  // Model versions
  MODELS: {
    // SDXL img2img
    sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    // Realistic Vision
    realistic: 'lucataco/realistic-vision-v5.1:2c8e954decbf70b7607a4414e5785ef9e4de4b8c51d50fb8b8b349160e0ef6bb',
  },
};

// For production, use your own backend:
const BACKEND_URL = 'https://your-backend.com/api';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the complete prompt for a given style
 */
export function buildPrompt(styleKey) {
  const style = CONFIG.styles[styleKey];
  if (!style) throw new Error(`Unknown style: ${styleKey}`);
  
  return `${style.prompt} ${CONFIG.technical.positive}`;
}

/**
 * Convert image URI to base64
 */
export async function imageToBase64(imageUri) {
  // For React Native, we use fetch to get the blob
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove data URL prefix to get pure base64
      const base64 = reader.result.split(',')[1];
      resolve(`data:image/jpeg;base64,${base64}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Sleep helper for polling
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════════════════
// REPLICATE API (Direct - Development Only)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a prediction on Replicate
 */
async function createReplicatePrediction(imageBase64, styleKey) {
  const prompt = buildPrompt(styleKey);
  
  const response = await fetch(API_CONFIG.REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${API_CONFIG.REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: API_CONFIG.MODELS.sdxl.split(':')[1],
      input: {
        image: imageBase64,
        prompt: prompt,
        negative_prompt: CONFIG.technical.negative,
        num_inference_steps: CONFIG.params.num_inference_steps,
        guidance_scale: CONFIG.params.guidance_scale,
        strength: CONFIG.params.strength,
        num_outputs: 1,
        width: 1024,
        height: 1024,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create prediction');
  }

  return response.json();
}

/**
 * Get prediction status
 */
async function getReplicatePrediction(predictionId) {
  const response = await fetch(
    `${API_CONFIG.REPLICATE_API_URL}/${predictionId}`,
    {
      headers: {
        'Authorization': `Token ${API_CONFIG.REPLICATE_API_KEY}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get prediction status');
  }

  return response.json();
}

/**
 * Poll for prediction completion
 */
async function waitForPrediction(predictionId, onProgress) {
  const maxAttempts = 60;
  const pollInterval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const prediction = await getReplicatePrediction(predictionId);
    
    if (onProgress) {
      onProgress({
        status: prediction.status,
        progress: Math.min((i / 30) * 100, 95),
      });
    }

    if (prediction.status === 'succeeded') {
      return Array.isArray(prediction.output) 
        ? prediction.output[0] 
        : prediction.output;
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Generation failed');
    }

    if (prediction.status === 'canceled') {
      throw new Error('Generation was canceled');
    }

    await sleep(pollInterval);
  }

  throw new Error('Generation timed out');
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND API (Production - Recommended)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate via your own backend (recommended for production)
 */
async function generateViaBackend(imageBase64, styleKey, onProgress) {
  // Start generation
  const startResponse = await fetch(`${BACKEND_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add your auth token here
      // 'Authorization': `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      image: imageBase64,
      style: styleKey,
    })
  });

  if (!startResponse.ok) {
    const error = await startResponse.json();
    throw new Error(error.message || 'Failed to start generation');
  }

  const { jobId } = await startResponse.json();

  // Poll for result
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const statusResponse = await fetch(`${BACKEND_URL}/status/${jobId}`);
    const status = await statusResponse.json();

    if (onProgress) {
      onProgress({
        status: status.status,
        progress: status.progress || (i / 30) * 100,
      });
    }

    if (status.status === 'completed') {
      return status.imageUrl;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Generation failed');
    }

    await sleep(2000);
  }

  throw new Error('Generation timed out');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main function: Generate redesigned image
 * 
 * @param {Object} selectedImage - Image object with uri and optionally base64
 * @param {string} styleKey - Style key (minimalista, industrial, etc.)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} URL of generated image
 */
export async function generateRedesign(selectedImage, styleKey, onProgress) {
  try {
    // Get base64 of image
    if (onProgress) onProgress({ status: 'preparing', progress: 5 });
    
    const imageBase64 = selectedImage.base64 
      ? `data:image/jpeg;base64,${selectedImage.base64}`
      : await imageToBase64(selectedImage.uri);
    
    // Use backend in production, direct API for development
    const useBackend = false; // Set to true for production
    
    if (useBackend) {
      return await generateViaBackend(imageBase64, styleKey, onProgress);
    } else {
      // Direct Replicate API (development only)
      if (onProgress) onProgress({ status: 'uploading', progress: 15 });
      const prediction = await createReplicatePrediction(imageBase64, styleKey);
      
      if (onProgress) onProgress({ status: 'processing', progress: 25 });
      const result = await waitForPrediction(prediction.id, onProgress);
      
      return result;
    }
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK FOR TESTING (Remove in production)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mock generation for testing without API
 */
export async function generateRedesignMock(selectedImage, styleKey, onProgress) {
  // Simulate processing steps
  const steps = ['preparing', 'uploading', 'processing', 'rendering'];
  
  for (let i = 0; i < steps.length; i++) {
    if (onProgress) {
      onProgress({
        status: steps[i],
        progress: ((i + 1) / steps.length) * 100,
      });
    }
    await sleep(1500);
  }
  
  // Return original image as "result" for testing
  return selectedImage.uri;
}

export default {
  generateRedesign,
  generateRedesignMock,
  buildPrompt,
};
