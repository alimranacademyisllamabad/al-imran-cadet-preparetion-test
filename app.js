const EXAM_STAGES = [
  { id: "iq", name: "Intelligence Test (IQ)", totalQuestions: 100, totalMarks: 100, timeLimitMinutes: 35, passPercentage: 80 },
  { id: "mathematics", name: "Mathematics", totalQuestions: 30, totalMarks: 30, timeLimitMinutes: 25, passPercentage: 80 },
  { id: "science", name: "Science", totalQuestions: 30, totalMarks: 30, timeLimitMinutes: 25, passPercentage: 80 },
  { id: "english", name: "English", totalQuestions: 25, totalMarks: 25, timeLimitMinutes: 25, passPercentage: 80 },
  { id: "urdu", name: "Urdu", totalQuestions: 15, totalMarks: 15, timeLimitMinutes: 15, passPercentage: 80 }
];

let currentStageIndex = 0;
let currentQuestionIndex = 0;
let userAnswers = {}; 
let stageTimer = null;
let timeRemainingSeconds = 0;

document.addEventListener('DOMContentLoaded', function () {
  const regForm = document.getElementById('registrationForm');
  
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('candidateName').value;
      const roll = document.getElementById('rollNumber').value;
      const classVal = document.getElementById('applyClass').value;

      document.getElementById('hdrName').textContent = name;
      document.getElementById('hdrRoll').textContent = roll;
      document.getElementById('hdrClass').textContent = classVal;

      document.getElementById('heroHeaderDesc').style.display = 'none';
      document.getElementById('heroHeaderBadges').style.display = 'none';
      document.getElementById('examCandidateBanner').style.display = 'flex';

      document.getElementById('landingPage').style.display = 'none';
      document.getElementById('examContainer').style.display = 'block';

      currentStageIndex = 0;
      startStage(currentStageIndex);
    });
  }
});

function startStage(stageIdx) {
  const stage = EXAM_STAGES[stageIdx];
  currentQuestionIndex = 0;
  userAnswers[stage.id] = {};

  clearInterval(stageTimer);
  timeRemainingSeconds = stage.timeLimitMinutes * 60;
  startTimer();

  renderQuestion();
}

function startTimer() {
  stageTimer = setInterval(() => {
    timeRemainingSeconds--;

    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;

    const timerElem = document.getElementById('timerDisplay');
    if (timerElem) {
      timerElem.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (timeRemainingSeconds <= 0) {
      clearInterval(stageTimer);
      alert("Time is up for this section! Submitting automatically...");
      evaluateStage();
    }
  }, 1000);
}

function renderQuestion() {
  const stage = EXAM_STAGES[currentStageIndex];
  const questionsList = window.examQuestions[stage.id];
  const q = questionsList[currentQuestionIndex];

  const examContainer = document.getElementById('examContainer');
  if (stage.id === 'urdu') {
    examContainer.style.direction = 'rtl';
    examContainer.style.textAlign = 'right';
  } else {
    examContainer.style.direction = 'ltr';
    examContainer.style.textAlign = 'left';
  }

  document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;
  document.getElementById('subjectTag').textContent = stage.name.toUpperCase();
  document.getElementById('questionText').textContent = q.question;

  const progressPct = ((currentQuestionIndex + 1) / questionsList.length) * 100;
  document.getElementById('progressFill').style.width = `${progressPct}%`;

  const optionsBox = document.getElementById('optionsContainer');
  optionsBox.innerHTML = '';

  const labels = ['A', 'B', 'C', 'D'];

  q.options.forEach((optText, optIdx) => {
    const card = document.createElement('div');
    card.className = 'option-card';

    if (userAnswers[stage.id][currentQuestionIndex] === optIdx) {
      card.classList.add('selected');
    }

    const radio = document.createElement('span');
    radio.className = 'radio-circle';

    const text = document.createElement('span');
    text.textContent = stage.id === 'urdu' ? optText : `${labels[optIdx]}) ${optText}`;

    card.appendChild(radio);
    card.appendChild(text);

    card.onclick = () => {
      userAnswers[stage.id][currentQuestionIndex] = optIdx;
      renderQuestion();
    };

    optionsBox.appendChild(card);
  });

  renderNavigatorGrid(questionsList.length, stage.id);

  document.getElementById('prevBtn').style.display = (currentQuestionIndex === 0) ? 'none' : 'inline-block';
  document.getElementById('nextBtn').style.display = (currentQuestionIndex === questionsList.length - 1) ? 'none' : 'inline-block';
  document.getElementById('submitStageBtn').style.display = (currentQuestionIndex === questionsList.length - 1) ? 'inline-block' : 'none';
}

function renderNavigatorGrid(total, stageId) {
  const gridContainer = document.getElementById('questionGrid');
  gridContainer.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const pill = document.createElement('div');
    pill.className = 'q-pill';
    pill.textContent = i + 1;

    if (userAnswers[stageId] && userAnswers[stageId][i] !== undefined) {
      pill.classList.add('answered');
    }
    if (i === currentQuestionIndex) {
      pill.classList.add('current');
    }

    pill.onclick = () => {
      currentQuestionIndex = i;
      renderQuestion();
    };

    gridContainer.appendChild(pill);
  }
}

function nextQuestion() {
  const stage = EXAM_STAGES[currentStageIndex];
  const questionsList = window.examQuestions[stage.id];
  if (currentQuestionIndex < questionsList.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

function evaluateStage() {
  clearInterval(stageTimer);

  const stage = EXAM_STAGES[currentStageIndex];
  const questionsList = window.examQuestions[stage.id];
  let obtainedMarks = 0;

  questionsList.forEach((q, idx) => {
    if (userAnswers[stage.id][idx] === q.answer) {
      obtainedMarks += 1;
    }
  });

  const percentage = (obtainedMarks / stage.totalMarks) * 100;

  if (percentage >= stage.passPercentage) {
    if (currentStageIndex < EXAM_STAGES.length - 1) {
      alert(`PASSED!\nScore: ${obtainedMarks}/${stage.totalMarks} (${percentage.toFixed(1)}%)\n\nClick OK to start the next stage.`);
      currentStageIndex++;
      startStage(currentStageIndex);
    } else {
      alert(`CONGRATULATIONS!\nYou passed all examination stages!`);
      showFinalResult(true);
    }
  } else {
    alert(`FAILED!\nScore: ${obtainedMarks}/${stage.totalMarks} (${percentage.toFixed(1)}%).\n80% required to qualify for next stage.`);
    showFinalResult(false);
  }
}

function showFinalResult(passedAll) {
  document.getElementById('examContainer').style.display = 'none';
  const resContainer = document.getElementById('resultContainer');
  resContainer.style.display = 'block';

  document.getElementById('resultStatus').textContent = passedAll ? "EXAMINATION STATUS: PASSED ALL STAGES" : "EXAMINATION STATUS: FAILED";
}