// Оживляет тест: разметку вопросов (.quiz-q с data-answer) делает build.py через quiz.lua.
(function () {
  const questions = [...document.querySelectorAll(".quiz-q[data-answer]")];
  if (!questions.length) return;

  let answered = 0;
  let correctCount = 0;
  const score = document.createElement("div");
  score.className = "quiz-score";
  const label = document.createElement("span");
  const reset = document.createElement("button");
  reset.className = "quiz-reset";
  reset.textContent = "Пройти заново";
  reset.onclick = () => location.reload();
  score.append(label, reset);
  questions[0].before(score);
  const updateScore = () => {
    label.textContent = `Результат: ${correctCount} из ${questions.length} (отвечено ${answered})`;
  };

  questions.forEach((q) => {
    const right = q.dataset.answer;
    const feedback = q.querySelector(".quiz-feedback");
    const buttons = [...q.querySelectorAll(".quiz-opt")];
    buttons.forEach((btn) => {
      btn.onclick = () => {
        buttons.forEach((b) => {
          b.disabled = true;
          if (b.dataset.letter === right) b.classList.add("correct");
        });
        answered++;
        if (btn.dataset.letter === right) {
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
  updateScore();
})();
