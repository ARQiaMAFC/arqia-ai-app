import React, { useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// ARQIA.MAFC - AI Architectural Rendering App
// Premium interior redesign powered by Stable Diffusion XL
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  appName: "Arqia.MAFC",
  tagline: "Rediseña espacios con inteligencia artificial",
  
  styles: {
    minimalista: {
      name: "Minimalista Lux",
      icon: "◯",
      color: "#e8e4db",
      gradient: "linear-gradient(135deg, #f5f5f0 0%, #e8e4db 100%)",
      prompt: "Minimalist modern interior, high-end materials, neutral palette, oak wood, large windows, soft natural light, cinematic shadows, clean lines, organized space."
    },
    industrial: {
      name: "Industrial Chic",
      icon: "▣",
      color: "#2c2c2c",
      gradient: "linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%)",
      prompt: "Industrial loft style, exposed brick, black steel beams, polished concrete, leather accents, Edison lighting, high ceilings, raw textures."
    },
    biofilico: {
      name: "Biofílico",
      icon: "✦",
      color: "#2d5016",
      gradient: "linear-gradient(135deg, #3d6b1e 0%, #1a3009 100%)",
      prompt: "Biophilic design, integrated indoor plants, vertical gardens, sustainable wood, stone textures, airy atmosphere, maximum sunlight, zen feeling."
    },
    contemporaneo: {
      name: "Contemporáneo",
      icon: "◆",
      color: "#1a1a2e",
      gradient: "linear-gradient(135deg, #2a2a4e 0%, #16213e 100%)",
      prompt: "Contemporary luxury, marble floors, gold detailing, velvet furniture, ambient LED strip lighting, high-tech appliances, sophisticated art."
    }
  },
  
  technicalPrompt: {
    positive: "highly detailed, 8k resolution, photorealistic, masterpiece, ray tracing, sharp focus, professional interior photography",
    negative: "lowres, blurry, deformed, distorted, grainy, low quality"
  }
};

// Sample room images for demo
const DEMO_ROOMS = [
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
];

export default function ArqiaApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [processingStep, setProcessingStep] = useState(0);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setCurrentScreen('style');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDemoImage = useCallback((url) => {
    setSelectedImage(url);
    setCurrentScreen('style');
  }, []);

  const generateImage = useCallback(async () => {
    if (!selectedImage || !selectedStyle) return;
    
    setIsProcessing(true);
    setCurrentScreen('processing');
    setProcessingStep(0);

    // Simulate AI processing
    const steps = ['Analizando estructura...', 'Aplicando estilo...', 'Renderizando...'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessingStep(i + 1);
    }

    setGeneratedImage(selectedImage);
    setCurrentScreen('result');
    setIsProcessing(false);
  }, [selectedImage, selectedStyle]);

  const resetApp = useCallback(() => {
    setSelectedImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setCurrentScreen('home');
    setProcessingStep(0);
  }, []);

  return (
    <div style={styles.phoneFrame}>
      <div style={styles.container}>
        <div style={styles.backgroundMesh} />
        <div style={styles.noiseOverlay} />

        <div style={styles.content}>
          {currentScreen === 'home' && (
            <HomeScreen 
              onImageSelect={handleImageSelect} 
              onDemoImage={handleDemoImage}
            />
          )}
          
          {currentScreen === 'style' && (
            <StyleScreen
              image={selectedImage}
              selectedStyle={selectedStyle}
              onStyleSelect={setSelectedStyle}
              onConfirm={generateImage}
              onBack={resetApp}
            />
          )}
          
          {currentScreen === 'processing' && (
            <ProcessingScreen 
              style={selectedStyle} 
              step={processingStep}
            />
          )}
          
          {currentScreen === 'result' && (
            <ResultScreen
              originalImage={selectedImage}
              generatedImage={generatedImage}
              style={selectedStyle}
              onReset={resetApp}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ onImageSelect, onDemoImage }) {
  return (
    <div style={styles.screen}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="20" width="50" height="35" />
            <path d="M5 20 L30 5 L55 20" />
            <rect x="22" y="35" width="16" height="20" />
            <rect x="10" y="28" width="8" height="8" strokeWidth="1" />
            <rect x="42" y="28" width="8" height="8" strokeWidth="1" />
          </svg>
        </div>
        <h1 style={styles.logoText}>{CONFIG.appName}</h1>
        <p style={styles.tagline}>{CONFIG.tagline}</p>
      </div>

      <label style={styles.uploadArea}>
        <input
          type="file"
          accept="image/*"
          onChange={onImageSelect}
          style={{ display: 'none' }}
        />
        <div style={styles.uploadIcon}>
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <span style={styles.uploadText}>Sube una foto de tu espacio</span>
        <span style={styles.uploadHint}>JPG, PNG • Máx 10MB</span>
      </label>

      <div style={styles.demoSection}>
        <p style={styles.demoLabel}>O prueba con estas imágenes:</p>
        <div style={styles.demoGrid}>
          {DEMO_ROOMS.map((url, i) => (
            <button
              key={i}
              onClick={() => onDemoImage(url)}
              style={styles.demoThumb}
            >
              <img src={url} alt={`Demo ${i + 1}`} style={styles.demoImg} />
            </button>
          ))}
        </div>
      </div>

      <div style={styles.featurePills}>
        <span style={styles.pill}>8K Fotorrealista</span>
        <span style={styles.pill}>IA Premium</span>
        <span style={styles.pill}>4 Estilos</span>
      </div>

      <p style={styles.footerText}>Powered by Stable Diffusion XL</p>
    </div>
  );
}

function StyleScreen({ image, selectedStyle, onStyleSelect, onConfirm, onBack }) {
  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 style={styles.headerTitle}>Elige un estilo</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.imagePreviewContainer}>
        <img src={image} alt="Preview" style={styles.imagePreview} />
        <div style={styles.imageOverlay} />
      </div>

      <div style={styles.styleGrid}>
        {Object.entries(CONFIG.styles).map(([key, style]) => (
          <button
            key={key}
            onClick={() => onStyleSelect(key)}
            style={{
              ...styles.styleCard,
              background: style.gradient,
              border: selectedStyle === key ? '2px solid #d4af37' : '2px solid transparent',
              boxShadow: selectedStyle === key ? '0 0 24px rgba(212,175,55,0.4)' : 'none',
              transform: selectedStyle === key ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={styles.styleIcon}>{style.icon}</span>
            <span style={styles.styleName}>{style.name}</span>
            {selectedStyle === key && (
              <div style={styles.checkmark}>✓</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onConfirm}
        disabled={!selectedStyle}
        style={{
          ...styles.generateButton,
          opacity: selectedStyle ? 1 : 0.4,
          cursor: selectedStyle ? 'pointer' : 'not-allowed'
        }}
      >
        <span>Generar Rediseño</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function ProcessingScreen({ style, step }) {
  const styleConfig = CONFIG.styles[style];
  const steps = ['Analizando estructura', 'Aplicando estilo', 'Renderizando 8K'];
  
  return (
    <div style={styles.screen}>
      <div style={styles.processingContainer}>
        <div style={styles.loader}>
          <div style={styles.loaderRing} />
          <div style={styles.loaderRingInner} />
          <span style={styles.loaderIcon}>{styleConfig?.icon || '◈'}</span>
        </div>

        <h2 style={styles.processingTitle}>Transformando tu espacio</h2>
        <p style={styles.processingSubtitle}>
          Aplicando estilo <strong>{styleConfig?.name}</strong>
        </p>

        <div style={styles.progressSteps}>
          {steps.map((label, i) => (
            <div key={i} style={{
              ...styles.progressStep,
              opacity: step > i ? 1 : 0.35
            }}>
              <div style={{
                ...styles.progressDot,
                background: step > i ? '#d4af37' : 'transparent',
                borderColor: step > i ? '#d4af37' : 'rgba(255,255,255,0.3)'
              }} />
              <span>{label}</span>
              {step > i && <span style={{ marginLeft: 'auto', color: '#4ade80' }}>✓</span>}
            </div>
          ))}
        </div>

        <p style={styles.processingHint}>Esto puede tomar 30-60 segundos</p>
      </div>
    </div>
  );
}

function ResultScreen({ originalImage, generatedImage, style, onReset }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const styleConfig = CONFIG.styles[style];

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={onReset} style={styles.backButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 style={styles.headerTitle}>{styleConfig?.name}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.resultImageContainer}>
        <img
          src={showOriginal ? originalImage : generatedImage}
          alt="Result"
          style={styles.resultImage}
        />
        
        <div style={styles.compareToggle}>
          <button
            onClick={() => setShowOriginal(false)}
            style={{
              ...styles.compareButton,
              background: !showOriginal ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
              color: !showOriginal ? '#0a0a0a' : '#fff'
            }}
          >
            Después
          </button>
          <button
            onClick={() => setShowOriginal(true)}
            style={{
              ...styles.compareButton,
              background: showOriginal ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
              color: showOriginal ? '#0a0a0a' : '#fff'
            }}
          >
            Antes
          </button>
        </div>

        <div style={styles.styleBadge}>
          <span style={{ marginRight: 6 }}>{styleConfig?.icon}</span>
          {styleConfig?.name}
        </div>
      </div>

      <div style={styles.actionButtons}>
        <button style={styles.actionButton}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span>Guardar</span>
        </button>
        
        <button style={styles.actionButton}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>Compartir</span>
        </button>
        
        <button onClick={onReset} style={styles.actionButton}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1,4 1,10 7,10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          <span>Nuevo</span>
        </button>
      </div>

      <details style={styles.promptDetails}>
        <summary style={styles.promptSummary}>📋 Ver prompt técnico</summary>
        <p style={styles.promptText}>{styleConfig?.prompt}</p>
      </details>
    </div>
  );
}

const styles = {
  phoneFrame: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    padding: 20,
  },

  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 390,
    minHeight: 700,
    background: '#0a0a0a',
    borderRadius: 40,
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  backgroundMesh: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(120, 90, 60, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(60, 80, 100, 0.08) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },

  noiseOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: 700,
  },

  screen: {
    minHeight: 700,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 18px',
  },

  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },

  logoIcon: {
    width: 70,
    height: 70,
    color: '#d4af37',
    marginBottom: 14,
  },

  logoText: {
    fontSize: 28,
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '-0.02em',
    margin: 0,
  },

  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    margin: '6px 0 0',
    letterSpacing: '0.01em',
  },

  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 20px',
    borderRadius: 20,
    border: '1.5px dashed rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    marginBottom: 20,
  },

  uploadIcon: {
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 14,
  },

  uploadText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#fff',
    marginBottom: 6,
  },

  uploadHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },

  demoSection: {
    marginBottom: 24,
  },

  demoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 12,
  },

  demoGrid: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
  },

  demoThumb: {
    width: 80,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    padding: 0,
    background: 'none',
    transition: 'transform 0.2s, border-color 0.2s',
  },

  demoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  featurePills: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 'auto',
    paddingTop: 16,
  },

  pill: {
    padding: '7px 13px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.01em',
  },

  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    marginTop: 20,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },

  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    height: 180,
  },

  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)',
    pointerEvents: 'none',
  },

  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
    marginBottom: 20,
  },

  styleCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '22px 14px',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  styleIcon: {
    fontSize: 26,
    marginBottom: 6,
    color: '#fff',
    textShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },

  styleName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
  },

  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    background: '#d4af37',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: 700,
  },

  generateButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 28px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    color: '#0a0a0a',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: 'auto',
  },

  processingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },

  loader: {
    position: 'relative',
    width: 100,
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  loaderRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.08)',
    borderTopColor: '#d4af37',
    animation: 'spin 1s linear infinite',
  },

  loaderRingInner: {
    position: 'absolute',
    inset: 14,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.04)',
    borderBottomColor: 'rgba(212,175,55,0.4)',
    animation: 'spin 1.8s linear infinite reverse',
  },

  loaderIcon: {
    fontSize: 28,
    color: '#d4af37',
  },

  processingTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 6px',
  },

  processingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    margin: '0 0 28px',
  },

  progressSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 28,
    width: '80%',
  },

  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    transition: 'opacity 0.3s',
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    border: '1.5px solid',
    transition: 'all 0.3s',
  },

  processingHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },

  resultImageContainer: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    flex: 1,
    minHeight: 260,
  },

  resultImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  compareToggle: {
    position: 'absolute',
    bottom: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 3,
    padding: 3,
    borderRadius: 10,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(10px)',
  },

  compareButton: {
    padding: '7px 14px',
    borderRadius: 7,
    border: 'none',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  styleBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    display: 'flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: 16,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(10px)',
    fontSize: 11,
    fontWeight: 600,
    color: '#fff',
  },

  actionButtons: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
  },

  actionButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    padding: '14px 10px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  promptDetails: {
    padding: '14px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },

  promptSummary: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    outline: 'none',
  },

  promptText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.6,
    marginTop: 10,
    fontFamily: 'monospace',
  },
};

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}
