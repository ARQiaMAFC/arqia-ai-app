/**
 * ARQIA.MAFC - Backend Server
 * Proxy for Replicate API to protect API keys
 * 
 * Run: node server.js
 * Or with nodemon: npx nodemon server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Replicate = require('replicate');

const app = express();
const PORT = process.env.PORT || 3001;

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  styles: {
    minimalista: {
      prompt: "Minimalist modern interior, high-end materials, neutral palette, oak wood, large windows, soft natural light, cinematic shadows, clean lines, organized space."
    },
    industrial: {
      prompt: "Industrial loft style, exposed brick, black steel beams, polished concrete, leather accents, Edison lighting, high ceilings, raw textures."
    },
    biofilico: {
      prompt: "Biophilic design, integrated indoor plants, vertical gardens, sustainable wood, stone textures, airy atmosphere, maximum sunlight, zen feeling."
    },
    contemporaneo: {
      prompt: "Contemporary luxury, marble floors, gold detailing, velvet furniture, ambient LED strip lighting, high-tech appliances, sophisticated art."
    }
  },
  
  technical: {
    positive: "highly detailed, 8k resolution, photorealistic, masterpiece, ray tracing, sharp focus, professional interior photography, unreal engine 5.4 render, architectural digest quality",
    negative: "lowres, bad anatomy, bad proportions, blurry, cropped, deformed furniture, distorted architecture, floating objects, grainy, low quality, messy, out of focus, plastic texture, ugly, warped walls, watermarks, cartoon, anime, illustration"
  },
  
  params: {
    num_inference_steps: 40,
    guidance_scale: 7.5,
    strength: 0.45,
  }
};

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

// CORS - adjust origins for production
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
}));

// Parse JSON bodies (increase limit for base64 images)
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function buildPrompt(styleKey) {
  const style = CONFIG.styles[styleKey];
  if (!style) throw new Error(`Unknown style: ${styleKey}`);
  return `${style.prompt} ${CONFIG.technical.positive}`;
}

// In-memory job storage (use Redis in production)
const jobs = new Map();

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available styles
app.get('/api/styles', (req, res) => {
  const styles = Object.entries(CONFIG.styles).map(([key, value]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    prompt: value.prompt,
  }));
  res.json({ styles });
});

// Start generation
app.post('/api/generate', async (req, res) => {
  try {
    const { image, style } = req.body;
    
    // Validation
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    if (!style || !CONFIG.styles[style]) {
      return res.status(400).json({ error: 'Invalid style' });
    }
    
    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    console.log(`Starting generation for style: ${style}`);
    
    const prompt = buildPrompt(style);
    
    // Create prediction
    const prediction = await replicate.predictions.create({
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        image: image,
        prompt: prompt,
        negative_prompt: CONFIG.technical.negative,
        num_inference_steps: CONFIG.params.num_inference_steps,
        guidance_scale: CONFIG.params.guidance_scale,
        strength: CONFIG.params.strength,
        num_outputs: 1,
        width: 1024,
        height: 1024,
      }
    });

    // Store job
    jobs.set(prediction.id, {
      id: prediction.id,
      status: 'processing',
      style: style,
      createdAt: new Date(),
    });

    console.log(`Job created: ${prediction.id}`);
    
    res.json({ 
      jobId: prediction.id,
      status: 'processing',
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// Check job status
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get prediction status from Replicate
    const prediction = await replicate.predictions.get(jobId);
    
    const response = {
      jobId: jobId,
      status: prediction.status,
      progress: null,
      imageUrl: null,
      error: null,
    };

    if (prediction.status === 'succeeded') {
      response.status = 'completed';
      response.imageUrl = Array.isArray(prediction.output) 
        ? prediction.output[0] 
        : prediction.output;
      response.progress = 100;
      
      // Clean up stored job
      jobs.delete(jobId);
    } else if (prediction.status === 'failed') {
      response.status = 'failed';
      response.error = prediction.error || 'Generation failed';
      jobs.delete(jobId);
    } else if (prediction.status === 'canceled') {
      response.status = 'canceled';
      jobs.delete(jobId);
    } else {
      // Still processing
      response.progress = 50; // Estimated
    }

    res.json(response);

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Cancel job
app.post('/api/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    await replicate.predictions.cancel(jobId);
    jobs.delete(jobId);
    res.json({ status: 'canceled' });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel' });
  }
});

// Synchronous generation (waits for result)
app.post('/api/generate-sync', async (req, res) => {
  try {
    const { image, style } = req.body;
    
    if (!image || !style || !CONFIG.styles[style]) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    console.log(`Starting sync generation for style: ${style}`);
    
    const prompt = buildPrompt(style);
    
    // Run and wait for completion
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: image,
          prompt: prompt,
          negative_prompt: CONFIG.technical.negative,
          num_inference_steps: CONFIG.params.num_inference_steps,
          guidance_scale: CONFIG.params.guidance_scale,
          strength: CONFIG.params.strength,
          num_outputs: 1,
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    console.log('Generation completed');
    res.json({ imageUrl });

  } catch (error) {
    console.error('Sync generation error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏠 ARQIA.MAFC Backend Server                            ║
║                                                           ║
║   Running on: http://localhost:${PORT}                      ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /health          - Health check                  ║
║   • GET  /api/styles      - List available styles         ║
║   • POST /api/generate    - Start async generation        ║
║   • GET  /api/status/:id  - Check job status              ║
║   • POST /api/cancel/:id  - Cancel job                    ║
║   • POST /api/generate-sync - Sync generation (blocking)  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn('⚠️  WARNING: REPLICATE_API_TOKEN not set in environment!');
  }
});

module.exports = app;
