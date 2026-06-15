// local-server.cjs — CommonJS Express dev server
// Runs the Vercel serverless functions locally during development.
// Usage: node local-server.cjs   (starts on port 3001)

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '20mb' }));

// ─────────────────────────────────────────────────────────────
// Dynamic route loader — wraps each serverless handler
// ─────────────────────────────────────────────────────────────
async function loadHandler(name) {
  try {
    // Try the compiled JS version first (after tsc build)
    const mod = require(path.join(__dirname, 'api', name + '.js'));
    return mod.default || mod;
  } catch {
    console.warn(`[dev-server] Could not load api/${name}.js — route will return 501`);
    return null;
  }
}

function wrapHandler(handlerFn) {
  return async (req, res) => {
    try {
      await handlerFn(req, res);
    } catch (err) {
      console.error('[dev-server] Unhandled error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  };
}

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
app.post('/send-otp', async (req, res) => {
  const h = await loadHandler('send-otp');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'send-otp handler not compiled yet' });
});

app.post('/parse', async (req, res) => {
  const h = await loadHandler('parse');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'parse handler not compiled yet' });
});

app.post('/chat', async (req, res) => {
  const h = await loadHandler('chat');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'chat handler not compiled yet' });
});

app.post('/correct-data', async (req, res) => {
  const h = await loadHandler('correct-data');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'correct-data handler not compiled yet' });
});

app.post('/reset-password', async (req, res) => {
  const h = await loadHandler('reset-password');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'reset-password handler not compiled yet' });
});

app.post('/notify-suggestion', async (req, res) => {
  const h = await loadHandler('notify-suggestion');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'notify-suggestion handler not compiled yet' });
});

app.post('/signup', async (req, res) => {
  const h = await loadHandler('signup');
  if (h) return wrapHandler(h)(req, res);
  res.status(501).json({ error: 'signup handler not compiled yet' });
});

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ ExamSync Dev API Server running at http://localhost:${PORT}`);
  console.log('   Routes: /send-otp  /parse  /chat  /correct-data  /reset-password  /notify-suggestion  /signup\n');
  console.log('   NOTE: Run "npx tsc --project tsconfig.api.json" first to compile api/ functions\n');
});
