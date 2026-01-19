import React, { useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// ARQIA.MAFC - AI Architectural Rendering App (PROD VERSION)
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  appName: "Arqia.MAFC",
  tagline: "Rediseña espacios con inteligencia artificial",
  // URL DE TU BACKEND EN RENDER
  backendUrl: "https://arqia-ai-app.onrender.com/api/generate-sync",
  
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
  }
};

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

  // ═══════════════════════════════════════════════════════════════════════════════
  // FUNCIÓN DE GENERACIÓN REAL (CONEXIÓN CON EL SERVIDOR)
  // ═══════════════════════════════════════════════════════════════════════════════
  const generateImage = useCallback(async () => {
    if (!selectedImage || !selectedStyle) return;
    
    setIsProcessing(true);
    setCurrentScreen('processing');
    setProcessingStep(1); // Paso: Analizando

    try {
      const response = await fetch(CONFIG.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          style: selectedStyle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error en el servidor");
      }

      setProcessingStep(2); // Paso: Aplicando estilo
      const data = await response.json();

      if (data.imageUrl) {
        setProcessingStep(3); // Paso: Renderizando
        setGeneratedImage(data.imageUrl);
        setTimeout(() => setCurrentScreen('result'), 800);
      } else {
        throw new Error("No se recibió la imagen generada");
      }
    } catch (error) {
      console.error("Error en la IA:", error);
      alert("Error: " + error.message + ". Asegúrate de que el servidor en Render esté encendido.");
      setCurrentScreen('style');
    } finally {
      setIsProcessing(false);
    }
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
            <HomeScreen onImageSelect={handleImageSelect} onDemoImage={handleDemoImage} />
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
            <ProcessingScreen style={selectedStyle} step={processingStep} />
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

// --- SUB-COMPONENTES (VISTAS) ---

function HomeScreen({ onImageSelect, onDemoImage }) {
  return (
    <div style={styles.screen}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="20" width="50" height="35" />
            <path d="M5 20 L30 5 L55 20" />
            <rect x="22" y="35" width="16" height="20" />
          </svg>
        </div>
        <h1 style={styles.logoText}>{CONFIG.appName}</h1>
        <p style={styles.tagline}>{CONFIG.tagline}</p>
      </div>

      <label style={styles.uploadArea}>
        <input type="file" accept="image/*" onChange={onImageSelect} style={{ display: 'none' }} />
        <div style={styles.uploadIcon}>
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17,8 12,3 7,8M12,3v12" />
          </svg>
        </div>
        <span style={styles.uploadText}>Sube una foto de tu espacio</span>
        <span style={styles.uploadHint}>JPG, PNG • Proceso IA Real</span>
      </label>

      <div style={styles.demoSection}>
        <p style={styles.demoLabel}>O prueba con un ejemplo:</p>
        <div style={styles.demoGrid}>
          {DEMO_ROOMS.map((url, i) => (
            <button key={i} onClick={() => onDemoImage(url)} style={styles.demoThumb}>
              <img src={url} alt="demo" style={styles.demoImg} />
            </button>
          ))}
        </div>
      </div>
      <div style={styles.featurePills}>
        <span style={styles.pill}>8K HD</span>
        <span style={styles.pill}>Replicate AI</span>
      </div>
    </div>
  );
}

function StyleScreen({ image, selectedStyle, onStyleSelect, onConfirm, onBack }) {
  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>←</button>
        <h2 style={styles.headerTitle}>Estilo de Rediseño</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.imagePreviewContainer}>
        <img src={image} alt="Preview" style={styles.imagePreview} />
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
              transform: selectedStyle === key ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={styles.styleIcon}>{style.icon}</span>
            <span style={styles.styleName}>{style.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onConfirm}
        disabled={!selectedStyle}
        style={{
          ...styles.generateButton,
          opacity: selectedStyle ? 1 : 0.4
        }}
      >
        Generar con IA →
      </button>
    </div>
  );
}

function ProcessingScreen({ style, step }) {
  const styleConfig = CONFIG.styles[style];
  const labels = ['Analizando estructura', 'Aplicando estilo', 'Renderizando 8K'];
  
  return (
    <div style={styles.screen}>
      <div style={styles.processingContainer}>
        <div style={styles.loader}>
          <div style={styles.loaderRing} />
          <span style={styles.loaderIcon}>{styleConfig?.icon}</span>
        </div>
        <h2 style={styles.processingTitle}>Transformando...</h2>
        <p style={styles.processingSubtitle}>Estilo: {styleConfig?.name}</p>

        <div style={styles.progressSteps}>
          {labels.map((label, i) => (
            <div key={i} style={{...styles.progressStep, opacity: step > i ? 1 : 0.3}}>
               <div style={{...styles.progressDot, background: step > i ? '#d4af37' : 'transparent'}} />
               <span>{label}</span>
            </div>
          ))}
        </div>
        <p style={styles.processingHint}>La IA tarda 30-40 segundos aproximadamente</p>
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
        <button onClick={onReset} style={styles.backButton}>←</button>
        <h2 style={styles.headerTitle}>Resultado Final</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.resultImageContainer}>
        <img src={showOriginal ? originalImage : generatedImage} alt="Result" style={styles.resultImage} />
        
        <div style={styles.compareToggle}>
          <button onClick={() => setShowOriginal(false)} style={{...styles.compareButton, background: !showOriginal ? '#fff' : 'transparent', color: !showOriginal ? '#000' : '#fff'}}>Después</button>
          <button onClick={() => setShowOriginal(true)} style={{...styles.compareButton, background: showOriginal ? '#fff' : 'transparent', color: showOriginal ? '#000' : '#fff'}}>Antes</button>
        </div>
      </div>

      <div style={styles.actionButtons}>
        <button onClick={() => window.open(generatedImage)} style={styles.actionButton}>Guardar Imagen</button>
        <button onClick={onReset} style={{...styles.actionButton, background: '#d4af37', color: '#000'}}>Nuevo Diseño</button>
      </div>
    </div>
  );
}

// --- ESTILOS CSS-IN-JS ---

const styles = {
  phoneFrame: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#111' },
  container: { position: 'relative', width: '100%', maxWidth: 390, height: 750, background: '#0a0a0a', borderRadius: 40, overflow: 'hidden', color: '#fff' },
  backgroundMesh: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, #1a1510 0%, #0a0a0a 100%)' },
  noiseOverlay: { position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,...")` },
  content: { position: 'relative', zIndex: 1, height: '100%' },
  screen: { height: '100%', display: 'flex', flexDirection: 'column', padding: 25 },
  logoContainer: { textAlign: 'center', marginTop: 50 },
  logoIcon: { width: 60, height: 60, margin: '0 auto', color: '#d4af37' },
  logoText: { fontSize: 32, margin: '10px 0 0' },
  tagline: { color: '#666', fontSize: 14 },
  uploadArea: { marginTop: 40, padding: 40, border: '2px dashed #333', borderRadius: 20, textAlign: 'center', cursor: 'pointer' },
  uploadIcon: { color: '#555', marginBottom: 15 },
  uploadText: { display: 'block', fontSize: 16 },
  uploadHint: { fontSize: 12, color: '#444' },
  demoSection: { marginTop: 40 },
  demoLabel: { fontSize: 12, color: '#555', marginBottom: 10 },
  demoGrid: { display: 'flex', gap: 10, justifyContent: 'center' },
  demoThumb: { width: 80, height: 60, borderRadius: 10, overflow: 'hidden', border: '1px solid #222' },
  demoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  featurePills: { marginTop: 'auto', display: 'flex', gap: 10, justifyContent: 'center' },
  pill: { fontSize: 10, background: '#222', padding: '5px 12px', borderRadius: 20, color: '#888' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' },
  headerTitle: { fontSize: 18 },
  imagePreviewContainer: { height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  imagePreview: { width: '100%', height: '100%', objectFit: 'cover' },
  styleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  styleCard: { padding: 20, borderRadius: 15, border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center' },
  styleIcon: { fontSize: 24, display: 'block', marginBottom: 5 },
  styleName: { fontSize: 12, fontWeight: 'bold' },
  generateButton: { marginTop: 'auto', padding: 18, borderRadius: 15, border: 'none', background: '#d4af37', fontWeight: 'bold', fontSize: 16 },
  processingContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  loader: { width: 80, height: 80, border: '4px solid #222', borderTopColor: '#d4af37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  processingTitle: { fontSize: 22 },
  progressSteps: { width: '100%', marginTop: 30 },
  progressStep: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  progressDot: { width: 8, height: 8, borderRadius: 4, border: '1px solid #d4af37' },
  resultImageContainer: { flex: 1, position: 'relative', borderRadius: 20, overflow: 'hidden' },
  resultImage: { width: '100%', height: '100%', objectFit: 'cover' },
  compareToggle: { position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', background: 'rgba(0,0,0,0.7)', padding: 5, borderRadius: 10 },
  compareButton: { border: 'none', padding: '8px 15px', borderRadius: 8, cursor: 'pointer' },
  actionButtons: { display: 'flex', gap: 10, marginTop: 20 },
  actionButton: { flex: 1, padding: 15, borderRadius: 12, border: '1px solid #333', background: 'none', color: '#fff', fontWeight: 'bold' }
};

// Inyectar animación de giro para el loader
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleSheet);
}