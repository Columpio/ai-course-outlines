// Превращает тест из статического HTML (вопросы + <details> с ответами) в интерактивный.
(function () {
  const heading = [...document.querySelectorAll("h3")].find((h) =>
    h.textContent.includes("Группа 1")
  );
  if (!heading) return;

  const block = [];
  for (let el = heading.nextElementSibling; el && !/^(H[1-3]|HR)$/.test(el.tagName); el = el.nextElementSibling) {
    block.push(el);
  }
  const details = block.find((el) => el.tagName === "DETAILS");
  if (!details) return;

  const answers = [...details.querySelectorAll("li")].map((li) =>
    li.textContent.trim().charAt(0)
  );

  const questions = [];
  block.forEach((el, i) => {
    const list = block[i + 1];
    if (el.tagName === "P" && list && list.tagName === "UL" && el.querySelector("strong")) {
      questions.push({ title: el, list });
    }
  });

  let answered = 0;
  let correctCount = 0;
  const score = document.createElement("div");
  score.className = "quiz-score";
  const updateScore = () => {
    score.textContent = `Результат: ${correctCount} из ${questions.length} (отвечено ${answered})`;
  };
  const reset = document.createElement("button");
  reset.className = "quiz-reset";
  reset.textContent = "Пройти заново";
  reset.onclick = () => location.reload();
  score.append(reset);
  heading.after(score);

  questions.forEach((q, idx) => {
    const right = answers[idx];
    const wrap = document.createElement("div");
    wrap.className = "quiz-q";
    q.title.before(wrap);
    wrap.append(q.title, q.list);
    q.list.className = "quiz-options";

    const feedback = document.createElement("p");
    feedback.className = "quiz-feedback";
    wrap.append(feedback);

    const items = [...q.list.children];
    const buttons = items.map((li) => {
      const letter = li.textContent.trim().charAt(0);
      const btn = document.createElement("button");
      btn.className = "quiz-opt";
      btn.dataset.letter = letter;
      btn.innerHTML = li.innerHTML;
      li.replaceChildren(btn);
      return btn;
    });

    buttons.forEach((btn) => {
      btn.onclick = () => {
        const chosen = btn.dataset.letter;
        buttons.forEach((b) => {
          b.disabled = true;
          if (b.dataset.letter === right) b.classList.add("correct");
        });
        answered++;
        if (chosen === right) {
          correctCount++;
          feedback.textContent = "✓ Правильно!";
          feedback.className = "quiz-feedback ok";
        } else {
          btn.classList.add("wrong");
          feedback.textContent = `✗ Неправильно. Правильный ответ: ${right}`;
          feedback.className = "quiz-feedback bad";
        }
        updateScore();
      };
    });
  });

  details.hidden = true;
  updateScore();
})();
