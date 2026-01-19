# 🏠 Arqia.MAFC - React Native

**AI-Powered Architectural Rendering App**

Rediseña espacios interiores con inteligencia artificial usando Stable Diffusion XL.

## 📱 Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │  ◯ Minimalista  │  │                 │  │                 │
│    🏠 ARQIA     │  │  ▣ Industrial   │  │   ⟳ Loading     │  │   [Resultado]   │
│                 │  │  ✦ Biofílico    │  │                 │  │                 │
│  [Subir Foto]   │  │  ◆ Contemporáneo│  │  Procesando...  │  │ Antes | Después │
│                 │  │                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
     Home               Styles             Processing            Result
```

## 🚀 Quick Start

### Requisitos Previos

- Node.js >= 18
- React Native CLI
- Xcode (iOS) / Android Studio (Android)
- CocoaPods (iOS)

### 1. Clonar e Instalar

```bash
# Clonar
git clone https://github.com/tu-usuario/arqia-mafc.git
cd arqia-mafc

# Instalar dependencias
npm install

# iOS: Instalar pods
cd ios && pod install && cd ..
```

### 2. Configurar API Key

Crea un archivo `.env` en la raíz:

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **IMPORTANTE**: Para producción, NO uses la API key directamente en la app. Configura un backend.

### 3. Ejecutar

```bash
# iOS
npm run ios

# Android
npm run android
```

## 📁 Estructura del Proyecto

```
arqia-native/
├── App.js                          # Entry point
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # Pantalla de inicio y upload
│   │   ├── StyleScreen.js          # Selección de estilo
│   │   ├── ProcessingScreen.js     # Animación de procesamiento
│   │   └── ResultScreen.js         # Resultado y compartir
│   ├── context/
│   │   └── AppContext.js           # Estado global + config
│   ├── services/
│   │   └── replicateApi.js         # Integración con IA
│   └── theme/
│       └── index.js                # Colores y estilos
├── package.json
└── README.md
```

## 🎨 Estilos Disponibles

| Estilo | Descripción | Preview |
|--------|-------------|---------|
| **Minimalista Lux** | Líneas limpias, paleta neutra, luz natural | ◯ |
| **Industrial Chic** | Ladrillo expuesto, acero, concreto | ▣ |
| **Biofílico** | Plantas, madera, jardines verticales | ✦ |
| **Contemporáneo** | Mármol, dorado, terciopelo, LED | ◆ |

## ⚙️ Configuración Avanzada

### Parámetros de IA

En `src/context/AppContext.js`:

```javascript
params: {
  num_inference_steps: 40,  // Más = mejor calidad, más lento
  guidance_scale: 7.5,      // Adherencia al prompt
  strength: 0.45,           // Balance estructura/estilo
}
```

### Personalizar Estilos

Agrega nuevos estilos en `CONFIG.styles`:

```javascript
mi_estilo: {
  id: 'mi_estilo',
  name: "Mi Estilo Custom",
  icon: "★",
  gradientColors: ['#ff6b6b', '#4ecdc4'],
  prompt: "Tu descripción detallada del estilo..."
}
```

## 🔌 Backend para Producción

Para proteger tu API key, crea un backend simple:

### Node.js/Express Example

```javascript
// server.js
const express = require('express');
const Replicate = require('replicate');

const app = express();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

app.post('/api/generate', async (req, res) => {
  const { image, style } = req.body;
  
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f...",
    { input: { image, prompt: buildPrompt(style), ... } }
  );
  
  res.json({ imageUrl: output[0] });
});

app.listen(3000);
```

### Actualizar la App

En `src/services/replicateApi.js`:

```javascript
const BACKEND_URL = 'https://tu-servidor.com/api';
const useBackend = true; // Cambiar a true
```

## 📲 Build para Producción

### iOS

```bash
# Crear build de release
cd ios
xcodebuild -workspace ArqiaMAFC.xcworkspace -scheme ArqiaMAFC -configuration Release
```

### Android

```bash
# Generar APK
cd android
./gradlew assembleRelease

# El APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

## 🐛 Troubleshooting

### Error: "Unable to load script"

```bash
# Limpiar cache
npm start -- --reset-cache
```

### Error: "Pod install failed" (iOS)

```bash
cd ios
pod deintegrate
pod install
```

### Error: "Could not connect to development server"

```bash
# Android
adb reverse tcp:8081 tcp:8081

# iOS
# Asegúrate de que el dispositivo esté en la misma red
```

### Error con permisos de cámara/galería

Asegúrate de agregar los permisos en:

**iOS** (`ios/ArqiaMAFC/Info.plist`):
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tu galería para seleccionar fotos</string>
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para tomar fotos</string>
```

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 💰 Costos de API

| Servicio | Costo por imagen | Tiempo aprox. |
|----------|-----------------|---------------|
| Replicate SDXL | ~$0.02 | 15-30s |
| Stability AI | ~$0.03 | 10-20s |

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

**Hecho con 🧠 por Claude** | Powered by Stable Diffusion XL
