// Своё меню по правой кнопке на выделенном тексте: копировать, поиск, обсуждение с ИИ.
(function () {
  const MAX_SEARCH = 300;
  const MAX_PROMPT = 1000; // кириллица в URL раздувается в 6 раз, длинные ссылки ломаются

  const clip = (text, max) => (text.length > max ? text.slice(0, max).trimEnd() + "…" : text);
  const q = encodeURIComponent;
  const aiPrompt = (t) =>
    `Объясни и обсуди этот фрагмент из урока курса по ИИ для церковных служителей:\n\n«${clip(t, MAX_PROMPT)}»`;

  const items = [
    { label: "Копировать", run: (t) => copy(t) },
    { sep: true },
    { label: "Найти в русской Википедии", url: (t) => `https://ru.wikipedia.org/w/index.php?search=${q(clip(t, MAX_SEARCH))}` },
    { label: "Найти в английской Википедии", url: (t) => `https://en.wikipedia.org/w/index.php?search=${q(clip(t, MAX_SEARCH))}` },
    { label: "Найти в Google", url: (t) => `https://www.google.com/search?q=${q(clip(t, MAX_SEARCH))}` },
    { sep: true },
    { title: "Обсудить с ИИ" },
    { label: "Kimi", url: (t) => `https://www.kimi.com/_prefill_chat?prefill_prompt=${q(aiPrompt(t))}` },
    { label: "Z.ai (GLM)", url: (t) => `https://chat.z.ai/?q=${q(aiPrompt(t))}` },
    {
      label: "Qwen (текст в буфер обмена)",
      run: (t) => { copy(aiPrompt(t)); window.open("https://chat.qwen.ai/", "_blank", "noopener"); },
    },
    {
      label: "DeepSeek (текст в буфер обмена)",
      run: (t) => { copy(aiPrompt(t)); window.open("https://chat.deepseek.com/", "_blank", "noopener"); },
    },
  ];

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }

  let menu = null;
  const close = () => {
    if (menu) menu.remove();
    menu = null;
  };

  function open(x, y, text) {
    close();
    menu = document.createElement("div");
    menu.className = "ctx-menu";
    menu.setAttribute("role", "menu");

    items.forEach((it) => {
      if (it.sep) {
        const hr = document.createElement("div");
        hr.className = "ctx-sep";
        menu.append(hr);
      } else if (it.title) {
        const h = document.createElement("div");
        h.className = "ctx-title";
        h.textContent = it.title;
        menu.append(h);
      } else {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "menuitem");
        b.textContent = it.label;
        b.onclick = () => {
          close();
          if (it.url) window.open(it.url(text), "_blank", "noopener");
          else it.run(text);
        };
        menu.append(b);
      }
    });

    document.body.append(menu);
    const r = menu.getBoundingClientRect();
    menu.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 4)) + "px";
    menu.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 4)) + "px";
    menu.querySelector("button").focus();
  }

  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".ctx-menu, input, textarea")) return;
    const text = String(window.getSelection()).trim();
    if (!text) return; // без выделения остаётся обычное меню браузера
    e.preventDefault();
    open(e.clientX, e.clientY, text);
  });
  document.addEventListener("mousedown", (e) => {
    if (menu && !menu.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!menu) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const btns = [...menu.querySelectorAll("button")];
      const i = btns.indexOf(document.activeElement);
      const step = e.key === "ArrowDown" ? 1 : -1;
      btns[(i + step + btns.length) % btns.length].focus();
    }
  });
  window.addEventListener("scroll", close, { passive: true });
  window.addEventListener("resize", close);
})();
