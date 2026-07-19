// Kotobox Lens — service worker.
// Owns: injecting the snip UI, capturing + cropping the screenshot,
// and calling the Claude API for recognition/translation.

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are Kotobox Lens, a Japanese lookup assistant inside a browser extension. The user is a Japanese learner around JLPT N5-N4 level.

You receive a cropped screenshot that contains Japanese text (from a website, video subtitle, image, game, etc.). Read the Japanese in it, then analyze the single most useful word or phrase: if the crop contains exactly one word, use that; if it contains a longer sentence, pick the most important content word and still translate the full text.

Respond with ONLY a JSON object — no markdown fences, no commentary — in exactly this shape:

{
  "detected_text": "all Japanese text readable in the image",
  "detected_text_meaning": "natural English translation of the full detected text",
  "word": "the focus word in Japanese",
  "reading": "reading of the focus word in kana",
  "romaji": "Hepburn romaji of the focus word",
  "part_of_speech": "e.g. noun, godan verb, na-adjective, expression",
  "jlpt": "N5, N4, N3, N2, N1, or uncommon",
  "meanings": ["primary meaning", "other common meanings if any"],
  "kanji": [
    {"char": "single kanji from the focus word", "meaning": "core meaning", "onyomi": "on reading in katakana or a dash", "kunyomi": "kun reading in hiragana or a dash"}
  ],
  "example": {
    "japanese": "one natural example sentence using the focus word, with N5-N4 friendly grammar",
    "reading": "the full example sentence written in kana",
    "english": "English translation of the example sentence"
  },
  "note": "one short usage or nuance tip a learner would appreciate, or an empty string"
}

The "kanji" array covers only kanji that appear in the focus word; use an empty array for kana-only words. Keep every field present.

If the image contains no readable Japanese at all, respond with only: {"error": "short explanation of what you saw instead"}`;

// ---------------------------------------------------------------- action

chrome.action.onClicked.addListener(async (tab) => {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (err) {
    // chrome:// pages, the Web Store, and PDFs refuse injection.
    flashBadge(tab.id, "✕");
    console.warn("Kotobox Lens: cannot run on this page.", err);
  }
});

function flashBadge(tabId, text) {
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#e8735c" }); // ember-coral
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 2500);
}

// ---------------------------------------------------------------- messages

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "kotobox-lens-capture") return;
  handleCapture(message, sender)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
  return true; // keep the message channel open for the async response
});

async function handleCapture(message, sender) {
  const { rect, dpr } = message;
  const { apiKey, model } = await chrome.storage.local.get(["apiKey", "model"]);
  if (!apiKey) throw new Error("No API key set. Open the extension options and add your Anthropic API key.");

  const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" });
  const base64Png = await cropToBase64(dataUrl, rect, dpr);
  return await lookupJapanese(base64Png, apiKey, model || DEFAULT_MODEL);
}

// ---------------------------------------------------------------- image crop

async function cropToBase64(dataUrl, rect, dpr) {
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);

  const sx = Math.max(0, Math.round(rect.x * dpr));
  const sy = Math.max(0, Math.round(rect.y * dpr));
  const sw = Math.min(bitmap.width - sx, Math.round(rect.w * dpr));
  const sh = Math.min(bitmap.height - sy, Math.round(rect.h * dpr));
  if (sw < 4 || sh < 4) throw new Error("Selection was too small — try dragging a bigger box.");

  const canvas = new OffscreenCanvas(sw, sh);
  canvas.getContext("2d").drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  const cropped = await canvas.convertToBlob({ type: "image/png" });

  const bytes = new Uint8Array(await cropped.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// ---------------------------------------------------------------- Claude API

async function lookupJapanese(base64Png, apiKey, model) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/png", data: base64Png } },
            { type: "text", text: "Analyze the Japanese in this screenshot." },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body?.error?.message || detail;
    } catch (_) { /* keep the status text */ }
    if (response.status === 401) detail = "Invalid API key — check it in the extension options.";
    if (response.status === 429) detail = "Rate limited by the API — wait a moment and try again.";
    throw new Error(detail);
  }

  const body = await response.json();
  const text = (body.content || []).find((b) => b.type === "text")?.text;
  if (!text) throw new Error("The model returned an empty response — try again.");

  const parsed = extractJson(text);
  if (parsed?.error) throw new Error(parsed.error);
  if (!parsed?.word) throw new Error("Could not read Japanese in that selection — try a tighter crop around the text.");
  return parsed;
}

function extractJson(text) {
  const trimmed = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch (_) { /* fall through */ }
    }
  }
  throw new Error("Could not parse the model's response — try again.");
}
