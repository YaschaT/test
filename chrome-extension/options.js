// Kotobox Lens — settings page logic.

const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("model");
const saveBtn = document.getElementById("save");
const testBtn = document.getElementById("test");
const status = document.getElementById("status");

function setStatus(text, kind) {
  status.textContent = text;
  status.className = kind || "";
}

async function load() {
  const { apiKey, model } = await chrome.storage.local.get(["apiKey", "model"]);
  if (apiKey) apiKeyInput.value = apiKey;
  if (model) modelSelect.value = model;
}
load();

saveBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setStatus("Paste your API key first. You can create one at console.anthropic.com under API Keys.", "err");
    return;
  }
  await chrome.storage.local.set({ apiKey, model: modelSelect.value });
  setStatus("Saved. Click the toolbar icon on any page to start snipping.", "ok");
});

testBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setStatus("Paste your API key first.", "err");
    return;
  }
  setStatus("Testing the key…");
  testBtn.disabled = true;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: modelSelect.value,
        max_tokens: 16,
        messages: [{ role: "user", content: "Reply with the single word: OK" }],
      }),
    });
    if (response.ok) {
      setStatus("Key works. Save it and you're ready to snip.", "ok");
    } else if (response.status === 401) {
      setStatus("That key was rejected (401). Double-check it in the Anthropic console.", "err");
    } else {
      const body = await response.json().catch(() => null);
      setStatus(body?.error?.message || `The API returned HTTP ${response.status}.`, "err");
    }
  } catch (err) {
    setStatus("Could not reach the API. Check your internet connection.", "err");
  } finally {
    testBtn.disabled = false;
  }
});
