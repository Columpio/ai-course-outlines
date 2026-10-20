(function () {
  const LESSONS = window.LESSONS;
  const page = location.pathname.split("/").pop() || "index.html";
  const idx = LESSONS.findIndex((l) => l.file === page);
  const current = idx >= 0 ? LESSONS[idx] : null;
  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx >= 0 && idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;
  const root = document.documentElement;

  // ---------- Шапка с выпадающим меню ----------
  const header = document.getElementById("site-header");
  const menuItems = LESSONS.map(
    (l) => `<li><a href="${l.file}"${l === current ? ' aria-current="page"' : ""}>
      <span class="num">${l.n}</span><span class="ttl">${l.title}</span></a></li>`
  ).join("");
  const step = (lesson, dir, label) =>
    lesson
      ? `<a class="step" href="${lesson.file}" title="${label}: Урок ${lesson.n}. ${lesson.title}" aria-label="${label}: Урок ${lesson.n}">${dir}</a>`
      : `<span class="step disabled" aria-hidden="true">${dir}</span>`;
  header.innerHTML = `<div class="header-inner">
    <a class="brand" href="index.html"><img src="assets/art/rose.svg" alt="">Курс по ИИ</a>
    <div class="dropdown">
      <button class="dropdown-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="lesson-menu">
        ${current ? `Урок ${current.n}` : "Все уроки"} <span aria-hidden="true">▾</span>
      </button>
      <ul class="dropdown-menu" id="lesson-menu">${menuItems}</ul>
    </div>
    ${current ? `<div class="dropdown download">
      <button class="dropdown-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="download-menu">⤓ Скачать <span aria-hidden="true">▾</span></button>
      <ul class="dropdown-menu" id="download-menu">
        <li><a href="${current.md}" download="${current.file.replace(".html", ".md")}"><span class="ttl">Markdown (.md)</span></a></li>
        <li><a href="#" data-pdf><span class="ttl">PDF (через печать браузера)</span></a></li>
      </ul>
    </div>` : ""}
    ${current ? `<div class="steps">${step(prev, "←", "Предыдущий урок")}${step(next, "→", "Следующий урок")}</div>` : ""}
  </div>
  <div class="progress"><div id="progress-bar"></div></div>`;

  const dropdowns = [...header.querySelectorAll(".dropdown")];
  const setMenu = (dd, open) => {
    dd.classList.toggle("open", open);
    dd.querySelector(".dropdown-btn").setAttribute("aria-expanded", String(open));
  };
  const closeMenus = () => dropdowns.forEach((dd) => setMenu(dd, false));
  dropdowns.forEach((dd) =>
    dd.querySelector(".dropdown-btn").addEventListener("click", () => {
      const wasOpen = dd.classList.contains("open");
      closeMenus();
      setMenu(dd, !wasOpen);
    })
  );
  document.addEventListener("click", (e) => {
    dropdowns.forEach((dd) => !dd.contains(e.target) && setMenu(dd, false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenus();
      closeDrawer();
    }
  });
  const pdf = header.querySelector("[data-pdf]");
  if (pdf) {
    pdf.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenus();
      window.print();
    });
  }

  // ---------- Список уроков на главной ----------
  const list = document.getElementById("lesson-list");
  if (list) {
    list.innerHTML = LESSONS.map(
      (l) => `<li class="tone-${l.tone}"><a href="${l.file}">
        <img src="assets/art/lesson-${l.n}.svg" alt="">
        <span class="card-text"><span class="kicker">Урок ${l.n}</span><span class="ttl">${l.title}</span><span class="desc">${l.desc}</span></span></a></li>`
    ).join("");
  }

  // ---------- Отступы под липкие элементы ----------
  const videoWrap = document.getElementById("video-wrap");
  const updateOffsets = () => {
    const pinned = videoWrap && videoWrap.classList.contains("pinned");
    const navH = header.offsetHeight;
    root.style.setProperty("--nav-h", navH + "px");
    root.style.setProperty(
      "--scroll-offset",
      navH + (pinned ? videoWrap.offsetHeight : 0) + 16 + "px"
    );
  };
  updateOffsets();
  window.addEventListener("resize", updateOffsets);
  if (videoWrap) {
    new MutationObserver(updateOffsets).observe(videoWrap, { attributes: true, attributeFilter: ["class"] });
    new ResizeObserver(updateOffsets).observe(videoWrap);
  }

  // ---------- Только для страниц уроков ----------
  const main = document.querySelector("main");
  if (!current || !main) return;

  // Кнопки «предыдущий / следующий» внизу
  const pager = document.createElement("nav");
  pager.className = "pager";
  pager.setAttribute("aria-label", "Навигация по урокам");
  const card = (lesson, cls, label) =>
    lesson
      ? `<a class="${cls}" href="${lesson.file}"><span class="kicker">${label}</span><span class="ttl">Урок ${lesson.n}. ${lesson.title}</span></a>`
      : `<span></span>`;
  pager.innerHTML = card(prev, "prev", "← Предыдущий урок") + card(next, "next", "Следующий урок →");
  main.append(pager);

  // Боковая панель быстрого перехода
  const headings = [...main.querySelectorAll("h1, h2, h3")];
  const slug = (el, i) => el.id || (el.id = "sec-" + i);
  headings.forEach(slug);
  const byText = (tag, text) =>
    headings.find((h) => h.tagName === tag && h.textContent.includes(text));

  const ICONS = {
    video: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    outline: '<path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    quiz: '<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    open: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
  };
  const quick = [];
  if (videoWrap) quick.push(["Видео", "video-wrap", "video", "ruby"]);
  const firstH2 = headings.find((h) => h.tagName === "H2");
  if (firstH2) quick.push(["Начало аутлайна", firstH2.id, "outline", "sun"]);
  const quiz = byText("H3", "Группа 1");
  const open = byText("H3", "Группа 2");
  if (quiz) quick.push(["Тест", quiz.id, "quiz", "teal"]);
  if (open) quick.push(["Открытые вопросы", open.id, "open", "plum"]);

  const sections = headings.filter((h) => h.tagName === "H2");
  const li = ([label, id]) => `<li><a href="#${id}">${label}</a></li>`;
  const quickLi = ([label, id, icon, tone]) =>
    `<li><a href="#${id}"><span class="ico tone-${tone}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon]}</svg></span>${label}</a></li>`;

  const aside = document.createElement("aside");
  aside.id = "side-nav";
  aside.setAttribute("aria-label", "Быстрый переход по странице");
  aside.innerHTML = `<div class="side-card">
    <p class="side-title">Быстрый переход</p>
    <ul class="quick">${quick.map(quickLi).join("")}</ul>
    <p class="side-title">Разделы урока</p>
    <ol class="toc">${sections.map((s) => li([s.textContent, s.id])).join("")}</ol>
    <div class="side-actions">
      <button type="button" data-act="top">↑ Наверх</button>
      <button type="button" data-act="bottom">↓ Вниз</button>
    </div>
  </div>`;
  main.after(aside);
  aside.addEventListener("click", (e) => {
    const act = e.target.dataset && e.target.dataset.act;
    if (act === "top") window.scrollTo({ top: 0 });
    if (act === "bottom") window.scrollTo({ top: document.documentElement.scrollHeight });
    if (act || e.target.closest("a")) closeDrawer();
  });

  // Выезжающая панель на узких экранах
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "fab";
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "side-nav");
  fab.textContent = "☰ Навигация";
  document.body.append(fab);
  function closeDrawer() {
    aside.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
  }
  fab.addEventListener("click", () => {
    const open = aside.classList.toggle("open");
    fab.setAttribute("aria-expanded", String(open));
  });

  // Прогресс чтения и подсветка текущего раздела
  const bar = document.getElementById("progress-bar");
  const tocLinks = [...aside.querySelectorAll(".toc a")];
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + "%";
    const line = header.offsetHeight + (videoWrap && videoWrap.classList.contains("pinned") ? videoWrap.offsetHeight : 0) + 40;
    let active = -1;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= line) active = i;
    });
    tocLinks.forEach((a, i) => {
      a.classList.toggle("active", i === active);
      if (i === active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();
})();
