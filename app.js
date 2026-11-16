const $ = (id) => document.getElementById(id);
const screens = ["home","levels","quiz","result","review"];
let currentLevel = null, questions = [], questionIndex = 0, selected = null, score = 0, answersLog = [];

function showScreen(name) {
  screens.forEach(s => $(s).classList.toggle("active", s === name));
  window.scrollTo({top:0, behavior:"smooth"});
}
function renderLevels() {
  $("levelGrid").innerHTML = "";
  COSMOS_DATA.levels.forEach((level, i) => {
    const card = document.createElement("button");
    card.className = "level-card";
    card.innerHTML = `<span class="level-number">УРОВЕНЬ 0${i+1}</span><h3>${level.name}</h3><p>${level.subtitle}</p><div class="level-meta"><span>8 вопросов</span><span>Начать →</span></div>`;
    card.addEventListener("click", () => startQuiz(level.id));
    $("levelGrid").appendChild(card);
  });
}
function startQuiz(levelId) {
  currentLevel = COSMOS_DATA.levels.find(l => l.id === levelId);
  questions = [...currentLevel.questions].sort(() => Math.random() - 0.5);
  questionIndex = 0; score = 0; answersLog = [];
  $("quizLevel").textContent = currentLevel.name;
  showScreen("quiz"); renderQuestion();
}
function renderQuestion() {
  selected = null;
  const q = questions[questionIndex];
  const total = questions.length;
  const progress = Math.round(questionIndex / total * 100);
  $("questionCounter").textContent = `ВОПРОС ${questionIndex+1} ИЗ ${total}`;
  $("progressPercent").textContent = `${progress}%`;
  $("progressBar").style.width = `${progress}%`;
  $("questionIndex").textContent = `ВОПРОС ${String(questionIndex+1).padStart(2,"0")}`;
  $("questionText").textContent = q[0];
  $("answers").innerHTML = "";
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("answerHint").textContent = "Выбери один вариант ответа";
  $("nextButton").disabled = true;
  $("nextButton").textContent = questionIndex === total-1 ? "Результат →" : "Далее →";
  q[1].forEach((option, i) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65+i)}</span><span></span>`;
    button.querySelector("span:last-child").textContent = option;
    button.addEventListener("click", () => chooseAnswer(i));
    $("answers").appendChild(button);
  });
}
function chooseAnswer(index) {
  if (selected !== null) return;
  selected = index;
  const q = questions[questionIndex], correct = index === q[2];
  if (correct) score++;
  answersLog.push({question:q[0], options:q[1], chosen:index, correct:q[2], explanation:q[3], isCorrect:correct});
  [...$("answers").children].forEach((button, i) => {
    button.disabled = true;
    if (i === q[2]) button.classList.add("correct");
    if (i === index && !correct) button.classList.add("incorrect");
  });
  $("feedback").textContent = (correct ? "Верно! " : "Не совсем. ") + q[3];
  $("feedback").classList.add(correct ? "good" : "bad");
  $("answerHint").textContent = correct ? "Ответ засчитан" : "Правильный вариант отмечен";
  $("nextButton").disabled = false;
}
function finishQuiz() {
  const total = questions.length, percent = Math.round(score/total*100), wrong = total-score;
  $("resultPercent").textContent = `${percent}%`;
  $("resultRing").style.background = `conic-gradient(var(--blue) ${percent*3.6}deg,#e9edf4 0deg)`;
  $("resultLevel").textContent = currentLevel.name.toUpperCase();
  $("correctCount").textContent = score;
  $("wrongCount").textContent = wrong;
  $("totalCount").textContent = total;
  let title, description, rank;
  if (percent === 100) { rank="МАСТЕР ВСЕЛЕННОЙ"; title="Безупречный результат!"; description="Ты ответил правильно на каждый вопрос. Впечатляющее знание космоса."; }
  else if (percent >= 80) { rank="ЭКСПЕРТ"; title="Превосходная работа!"; description="Ты отлично ориентируешься в теме. Осталось совсем немного до идеального результата."; }
  else if (percent >= 60) { rank="ИССЛЕДОВАТЕЛЬ"; title="Хороший результат!"; description="У тебя крепкая база знаний. Разбор поможет разобраться в оставшихся вопросах."; }
  else if (percent >= 40) { rank="УЧЕНИК КОСМОСА"; title="Есть хороший старт!"; description="Некоторые темы уже знакомы. Продолжай исследовать Вселенную и пробуй снова."; }
  else { rank="НАЧИНАЮЩИЙ"; title="Время для открытий!"; description="Этот уровень показал, какие темы стоит изучить. Каждая ошибка — возможность узнать новое."; }
  $("resultTitle").textContent = title;
  $("resultDescription").textContent = description;
  $("resultLevel").textContent = `${currentLevel.name.toUpperCase()} · ${rank}`;
  showScreen("result");
}
function renderReview() {
  $("reviewList").innerHTML = "";
  answersLog.forEach((a,i) => {
    const item = document.createElement("article");
    item.className = "review-item";
    const heading = document.createElement("h3"); heading.textContent = `${i+1}. ${a.question}`;
    const chosen = document.createElement("p"); chosen.className = `review-answer ${a.isCorrect?"good":"bad"}`;
    chosen.textContent = `${a.isCorrect?"✓ Твой ответ:":"✕ Твой ответ:"} ${a.options[a.chosen]}`;
    item.append(heading,chosen);
    if (!a.isCorrect) { const correct=document.createElement("p"); correct.className="review-answer good"; correct.textContent=`Правильный ответ: ${a.options[a.correct]}`; item.appendChild(correct); }
    const explanation=document.createElement("p"); explanation.className="explanation"; explanation.textContent=a.explanation; item.appendChild(explanation);
    $("reviewList").appendChild(item);
  });
}
$("startButton").addEventListener("click",()=>showScreen("levels"));
$("brandHome").addEventListener("click",e=>{e.preventDefault();showScreen("home")});
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.go)));
$("quitQuiz").addEventListener("click",()=>showScreen("levels"));
$("nextButton").addEventListener("click",()=>{if(selected===null)return;if(questionIndex<questions.length-1){questionIndex++;renderQuestion()}else finishQuiz()});
$("reviewButton").addEventListener("click",()=>{renderReview();showScreen("review")});
$("retryButton").addEventListener("click",()=>startQuiz(currentLevel.id));
$("allLevelsButton").addEventListener("click",()=>showScreen("levels"));
$("reviewDone").addEventListener("click",()=>showScreen("result"));
renderLevels();