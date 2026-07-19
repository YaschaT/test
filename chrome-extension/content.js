// Kotobox Lens — snip overlay + result card.
// Injected on demand by background.js; everything renders inside a shadow root
// so page styles can't leak in either direction.

(() => {
  if (window.__kotoboxLensActive) return;
  window.__kotoboxLensActive = true;

  const Z = 2147483647;
  const host = document.createElement("kotobox-lens");
  host.style.cssText = `all:initial; position:fixed; inset:0; z-index:${Z};`;
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  // Palette = the Kotobox design system (DESIGN.md), dark-mode tokens:
  // surface-dark #0f172a, canvas-dark #020617, ink-dark #f1f5f9,
  // muted-ink-dark #94a3b8, twilight-indigo #3a54d6 / #4c6ef0,
  // ember-coral #e8735c, state-mastered #10b981. Dark borders are
  // translucent white per DESIGN.md, never flat gray.
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .overlay {
      position: fixed; inset: 0; cursor: crosshair;
      background: rgba(2, 6, 23, 0.32);
      user-select: none; -webkit-user-select: none;
    }
    .hint {
      position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
      background: #0f172a; color: #f1f5f9; border: 1px solid rgba(255,255,255,0.1);
      font: 500 13px/1.4 -apple-system, "Segoe UI", sans-serif;
      padding: 8px 14px; border-radius: 9999px; pointer-events: none;
      box-shadow: 0 4px 16px rgba(2,6,23,.45);
    }
    .hint kbd {
      font: inherit; color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.14); border-bottom-width: 2px;
      border-radius: 0.6rem; padding: 0 5px; margin: 0 2px;
    }
    .selection {
      position: fixed; display: none;
      border: 1.5px solid #4c6ef0;
      background: rgba(76, 110, 240, 0.08);
      box-shadow: 0 0 0 200000px rgba(2, 6, 23, 0.32);
    }

    .pill, .card {
      position: fixed;
      font-family: -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif;
      color: #f1f5f9;
    }
    .pill {
      background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px;
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      display: flex; align-items: center; gap: 9px;
      box-shadow: 0 6px 24px rgba(2,6,23,.5);
    }
    .spinner {
      width: 13px; height: 13px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.14); border-top-color: #4c6ef0;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card {
      width: 380px; max-width: calc(100vw - 32px);
      max-height: min(560px, calc(100vh - 32px));
      overflow-y: auto; overscroll-behavior: contain;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent;
      background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
      box-shadow: 0 12px 40px rgba(2,6,23,.6);
    }
    .card-head {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 16px 16px 12px;
    }
    .word { font-size: 30px; font-weight: 700; line-height: 1.15; }
    .readings { margin-top: 3px; font-size: 14px; color: #94a3b8; }
    .readings .romaji { color: #64748b; margin-left: 8px; }
    .badges { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex: none; }
    .badge {
      font-size: 11px; font-weight: 600; letter-spacing: .04em;
      padding: 2px 8px; border-radius: 9999px;
      background: rgba(255,255,255,0.08); color: #94a3b8; white-space: nowrap;
    }
    .badge.jlpt { background: rgba(16,185,129,0.16); color: #10b981; }
    .body { padding: 12px 16px 16px; display: grid; gap: 14px; }
    .label {
      font-size: 10.5px; font-weight: 700; letter-spacing: .09em;
      text-transform: uppercase; color: #64748b; margin-bottom: 5px;
    }
    .meanings { font-size: 15px; line-height: 1.5; }
    .meanings li { list-style: none; }
    .meanings li + li { color: #94a3b8; font-size: 13.5px; margin-top: 2px; }

    .kanji-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .kanji-chip {
      display: flex; align-items: center; gap: 9px;
      background: #020617; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem;
      padding: 7px 11px;
    }
    .kanji-chip .char { font-size: 24px; font-weight: 600; color: #4c6ef0; }
    .kanji-chip .kmeta { font-size: 11.5px; line-height: 1.45; color: #94a3b8; }
    .kanji-chip .kmeta b { color: #f1f5f9; font-weight: 600; }

    .example {
      background: #020617; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem;
      padding: 11px 13px;
    }
    .example .jp { font-size: 16px; line-height: 1.65; }
    .example .kana { font-size: 12px; color: #64748b; margin-top: 3px; }
    .example .en { font-size: 13.5px; color: #94a3b8; margin-top: 7px; }

    .note { font-size: 13px; line-height: 1.55; color: #94a3b8; }
    .detected { font-size: 12.5px; line-height: 1.55; color: #64748b; }
    .detected .jp { color: #94a3b8; }

    .card-foot {
      display: flex; gap: 8px; padding: 0 16px 14px;
    }
    .btn {
      font: 600 12.5px/1 -apple-system, "Segoe UI", sans-serif;
      color: #f1f5f9; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.6rem; padding: 8px 13px; cursor: pointer;
    }
    .btn:hover { background: rgba(255,255,255,0.14); }
    .btn:focus-visible { outline: 2px solid #4c6ef0; outline-offset: 1px; }
    .close {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: #64748b; font-size: 17px; line-height: 1; padding: 4px 6px; flex: none;
    }
    .close:hover { color: #f1f5f9; }
    .error-text { font-size: 13.5px; line-height: 1.55; color: #e8735c; padding: 4px 0; }
  `;
  shadow.appendChild(style);

  // ---------------------------------------------------------------- teardown

  function teardown() {
    window.removeEventListener("keydown", onKey, true);
    host.remove();
    window.__kotoboxLensActive = false;
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      teardown();
    }
  }
  window.addEventListener("keydown", onKey, true);

  // ---------------------------------------------------------------- snip UI

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  const hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = "Drag over the Japanese text &nbsp;·&nbsp; <kbd>Esc</kbd> to cancel";
  const selection = document.createElement("div");
  selection.className = "selection";
  shadow.append(overlay, hint, selection);

  let startX = 0, startY = 0, dragging = false;

  overlay.addEventListener("pointerdown", (e) => {
    e.preventDefault(); // keep the page from text-selecting under the overlay
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    overlay.setPointerCapture(e.pointerId);
    hint.style.display = "none";
    overlay.style.background = "transparent";
    selection.style.display = "block";
    updateSelection(e);
  });

  overlay.addEventListener("pointermove", (e) => {
    if (dragging) updateSelection(e);
  });

  overlay.addEventListener("pointerup", async (e) => {
    if (!dragging) return;
    dragging = false;
    const rect = rectFrom(e);
    if (rect.w < 8 || rect.h < 8) {
      teardown();
      return;
    }
    overlay.remove();
    hint.remove();
    selection.remove();
    await nextFrames(2); // let the page repaint without our chrome before capture
    capture(rect);
  });

  function rectFrom(e) {
    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    return {
      x, y,
      w: Math.abs(e.clientX - startX),
      h: Math.abs(e.clientY - startY),
    };
  }

  function updateSelection(e) {
    const r = rectFrom(e);
    selection.style.left = r.x + "px";
    selection.style.top = r.y + "px";
    selection.style.width = r.w + "px";
    selection.style.height = r.h + "px";
  }

  function nextFrames(n) {
    return new Promise((resolve) => {
      const step = (left) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
      step(n);
    });
  }

  // ---------------------------------------------------------------- capture

  function capture(rect) {
    const pill = document.createElement("div");
    pill.className = "pill";
    pill.innerHTML = `<span class="spinner"></span> Reading the Japanese…`;
    positionNear(pill, rect, 44);
    shadow.appendChild(pill);

    chrome.runtime.sendMessage(
      { type: "kotobox-lens-capture", rect, dpr: window.devicePixelRatio || 1 },
      (response) => {
        pill.remove();
        if (chrome.runtime.lastError) {
          showError(rect, chrome.runtime.lastError.message);
          return;
        }
        if (!response?.ok) {
          showError(rect, response?.error || "Something went wrong — try again.");
          return;
        }
        showCard(rect, response.result);
      }
    );
  }

  // ---------------------------------------------------------------- rendering

  function positionNear(el, rect, estimatedHeight) {
    const margin = 12;
    let top = rect.y + rect.h + margin;
    if (top + estimatedHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.y - estimatedHeight - margin);
    }
    const left = Math.max(margin, Math.min(rect.x, window.innerWidth - 396));
    el.style.top = top + "px";
    el.style.left = left + "px";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function dismissOnOutsideClick(card) {
    const onDown = (e) => {
      if (!e.composedPath().includes(card)) {
        document.removeEventListener("pointerdown", onDown, true);
        teardown();
      }
    };
    document.addEventListener("pointerdown", onDown, true);
  }

  function showError(rect, message) {
    const card = el("div", "card");
    const body = el("div", "body");
    const head = el("div", "card-head");
    head.append(el("div", "word", "Hmm."), makeClose(card));
    body.append(el("div", "error-text", message));
    card.append(head, body);
    positionNear(card, rect, 140);
    shadow.appendChild(card);
    dismissOnOutsideClick(card);
  }

  function makeClose() {
    const close = el("button", "close", "✕");
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", teardown);
    return close;
  }

  function showCard(rect, r) {
    const card = el("div", "card");

    // Header: word + readings + badges
    const head = el("div", "card-head");
    const titleWrap = el("div");
    titleWrap.append(el("div", "word", r.word || ""));
    const readings = el("div", "readings", r.reading || "");
    if (r.romaji) readings.append(Object.assign(el("span", "romaji", r.romaji)));
    titleWrap.append(readings);

    const badges = el("div", "badges");
    if (r.jlpt) badges.append(el("span", "badge jlpt", r.jlpt));
    if (r.part_of_speech) badges.append(el("span", "badge", r.part_of_speech));
    head.append(titleWrap, badges, makeClose());

    // Body
    const body = el("div", "body");

    if (Array.isArray(r.meanings) && r.meanings.length) {
      const section = el("div");
      section.append(el("div", "label", "Meaning"));
      const list = el("ul", "meanings");
      r.meanings.slice(0, 4).forEach((m) => list.append(el("li", null, m)));
      section.append(list);
      body.append(section);
    }

    if (Array.isArray(r.kanji) && r.kanji.length) {
      const section = el("div");
      section.append(el("div", "label", "Kanji"));
      const row = el("div", "kanji-row");
      r.kanji.slice(0, 6).forEach((k) => {
        const chip = el("div", "kanji-chip");
        chip.append(el("span", "char", k.char || ""));
        const meta = el("div", "kmeta");
        const meaning = el("div");
        meaning.append(Object.assign(document.createElement("b"), { textContent: k.meaning || "" }));
        meta.append(meaning, el("div", null, `音 ${k.onyomi || "—"} · 訓 ${k.kunyomi || "—"}`));
        chip.append(meta);
        row.append(chip);
      });
      section.append(row);
      body.append(section);
    }

    if (r.example?.japanese) {
      const section = el("div");
      section.append(el("div", "label", "Example"));
      const box = el("div", "example");
      box.append(el("div", "jp", r.example.japanese));
      if (r.example.reading) box.append(el("div", "kana", r.example.reading));
      if (r.example.english) box.append(el("div", "en", r.example.english));
      section.append(box);
      body.append(section);
    }

    if (r.note) {
      const section = el("div");
      section.append(el("div", "label", "Tip"), el("div", "note", r.note));
      body.append(section);
    }

    if (r.detected_text && r.detected_text !== r.word) {
      const section = el("div");
      section.append(el("div", "label", "Full text"));
      const detected = el("div", "detected");
      detected.append(el("span", "jp", r.detected_text));
      if (r.detected_text_meaning) detected.append(el("span", null, ` — ${r.detected_text_meaning}`));
      section.append(detected);
      body.append(section);
    }

    // Footer: copy
    const foot = el("div", "card-foot");
    const copyBtn = el("button", "btn", "Copy");
    copyBtn.addEventListener("click", async () => {
      const lines = [
        `${r.word}（${r.reading || ""}）${r.romaji ? `[${r.romaji}]` : ""}`.trim(),
        (r.meanings || []).join("; "),
        r.example?.japanese ? `例: ${r.example.japanese}` : "",
        r.example?.english ? `    ${r.example.english}` : "",
      ].filter(Boolean);
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1600);
      } catch (_) {
        copyBtn.textContent = "Copy failed";
      }
    });
    foot.append(copyBtn);

    card.append(head, body, foot);
    positionNear(card, rect, 420);
    shadow.appendChild(card);
    dismissOnOutsideClick(card);
  }
})();
