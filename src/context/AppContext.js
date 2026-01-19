/**
 * App Context - Global State Management
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const CONFIG = {
  appName: "Arqia.MAFC",
  tagline: "Rediseña espacios con inteligencia artificial",
  
  styles: {
    minimalista: {
      id: 'minimalista',
      name: "Minimalista Lux",
      icon: "◯",
      color: "#e8e4db",
      gradientColors: ['#f5f5f0', '#e8e4db'],
      prompt: "Minimalist modern interior, high-end materials, neutral palette, oak wood, large windows, soft natural light, cinematic shadows, clean lines, organized space."
    },
    industrial: {
      id: 'industrial',
      name: "Industrial Chic",
      icon: "▣",
      color: "#2c2c2c",
      gradientColors: ['#3a3a3a', '#1a1a1a'],
      prompt: "Industrial loft style, exposed brick, black steel beams, polished concrete, leather accents, Edison lighting, high ceilings, raw textures."
    },
    biofilico: {
      id: 'biofilico',
      name: "Biofílico",
      icon: "✦",
      color: "#2d5016",
      gradientColors: ['#3d6b1e', '#1a3009'],
      prompt: "Biophilic design, integrated indoor plants, vertical gardens, sustainable wood, stone textures, airy atmosphere, maximum sunlight, zen feeling."
    },
    contemporaneo: {
      id: 'contemporaneo',
      name: "Contemporáneo",
      icon: "◆",
      color: "#1a1a2e",
      gradientColors: ['#2a2a4e', '#16213e'],
      prompt: "Contemporary luxury, marble floors, gold detailing, velvet furniture, ambient LED strip lighting, high-tech appliances, sophisticated art."
    }
  },
  
  technical: {
    positive: "highly detailed, 8k resolution, photorealistic, masterpiece, ray tracing, sharp focus, professional interior photography, unreal engine 5.4 render, architectural digest quality",
    negative: "lowres, bad anatomy, bad proportions, blurry, cropped, deformed furniture, distorted architecture, floating objects, grainy, low quality, messy, out of focus, plastic texture, ugly, warped walls, watermarks"
  },
  
  params: {
    num_inference_steps: 40,
    guidance_scale: 7.5,
    strength: 0.45,
  }
};

export function AppProvider({ children }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setSelectedImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setIsProcessing(false);
    setError(null);
  }, []);

  const value = {
    // State
    selectedImage,
    selectedStyle,
    generatedImage,
    isProcessing,
    error,
    
    // Setters
    setSelectedImage,
    setSelectedStyle,
    setGeneratedImage,
    setIsProcessing,
    setError,
    
    // Actions
    reset,
    
    // Config
    config: CONFIG,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
