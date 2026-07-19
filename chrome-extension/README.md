# Kotobox Lens — Japanese Screenshot Translator

A Chrome extension companion to Kotobox. Snip any Japanese text on screen (websites, video
subtitles, images, games, manga) and get:

- the detected text and a translation of it
- the key word with its kana reading and romaji
- part of speech and estimated JLPT level
- a kanji-by-kanji breakdown (meaning, on'yomi, kun'yomi)
- a natural example sentence with kana reading and English translation
- a short usage tip

It uses Claude's vision through your own Anthropic API key, so it reads stylized text
(subtitles, manga fonts, vertical text) far more reliably than offline OCR.

## Install (developer mode)

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select this `chrome-extension` folder.
4. Pin "Kotobox Lens" from the puzzle-piece menu so it stays visible in the toolbar.

## Set up your API key

1. Create a key at [console.anthropic.com](https://console.anthropic.com/) under **API Keys**
   (you may need to add a small amount of billing credit first).
2. Right-click the Kotobox Lens icon → **Options** (or it opens automatically the first time
   you click the icon).
3. Paste the key, pick a model, click **Test key**, then **Save**.

The key is stored in `chrome.storage.local` on your device only and is sent to nothing but
`api.anthropic.com`.

## Use it

1. On any page, click the toolbar icon or press **Alt+Shift+K** (change the shortcut at
   `chrome://extensions/shortcuts`).
2. Drag a box around the Japanese text. **Esc** cancels.
3. The result card appears next to your selection. **Copy** puts the word, meaning, and
   example sentence on your clipboard; click anywhere outside the card to dismiss it.

## Notes

- Chrome blocks extensions on `chrome://` pages, the Chrome Web Store, and some PDFs; the
  icon shows a small ✕ badge there.
- Cost: a lookup is a single small vision request. On the default model (Opus 4.8) that is
  roughly a cent or less per snip; Haiku 4.5 is several times cheaper if you look things up
  constantly.
- The models available in Options: Claude Opus 4.8 (default, best accuracy on hard fonts),
  Claude Sonnet 5 (faster), Claude Haiku 4.5 (fastest and cheapest).
