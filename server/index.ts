import 'dotenv/config';
import express from 'express';
import { isConfigPresent, readTtsConfig, synthesizeSpeech } from './googleTts.ts';

const app = express();
app.use(express.json());

const PORT = Number(process.env.SERVER_PORT) || 5174;

app.get('/api/tts/status', (_req, res) => {
  const config = readTtsConfig();
  if (!config.enabled) {
    res.json({ available: false, reason: 'disabled' });
    return;
  }
  if (!isConfigPresent(config)) {
    res.json({ available: false, reason: 'missing_config' });
    return;
  }
  res.json({ available: true });
});

app.post('/api/tts', async (req, res) => {
  const config = readTtsConfig();
  if (!isConfigPresent(config)) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const rate = typeof req.body?.rate === 'number' ? req.body.rate : 1;
  if (!text.trim()) {
    res.status(400).json({ error: 'missing_text' });
    return;
  }

  try {
    const audio = await synthesizeSpeech({ text, rate }, config);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (err) {
    console.error('[tts] synthesis failed:', err instanceof Error ? err.message : err);
    res.status(502).json({ error: 'synthesis_failed', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.listen(PORT, () => {
  const config = readTtsConfig();
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] Google Cloud TTS: ${config.enabled ? (isConfigPresent(config) ? 'configured' : 'enabled but missing project/credentials env vars') : 'disabled'}`);
});
