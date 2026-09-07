// =========================================
// EXAM VARIABLES
// =========================================

let questions = [];
let currentQuestionIndex = 0;
let answers = {};
let timeRemaining = 30 * 60;
let timer;


// =========================================
// LOAD QUESTIONS
// =========================================

async function loadQuestions() {
    try {
        // Get the exam ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const examId = urlParams.get('examId');

        if (!examId) {
            alert('Exam ID is missing.');
            return;
        }

        // Get the exam details
        const examResponse = await fetch(`/api/exams/${examId}`);

        if (!examResponse.ok) {
            throw new Error('Unable to load exam');
        }

        const examData = await examResponse.json();

        // Use the exam duration from the database
        timeRemaining = examData.exam.duration_minutes * 60;

        // Get the questions
        const response = await fetch(
            `/api/questions/exam/${examId}`
        );

        if (!response.ok) {
            throw new Error('Unable to load questions');
        }

        const data = await response.json();

        questions = data.questions;

        if (questions.length === 0) {
            alert('This exam has no questions.');
            return;
        }

        startTimer();
        renderQuestion();
        createQuestionNavigator();

    } catch (error) {
        console.error('Error loading exam:', error);

        alert('Unable to load the examination.');
    }
}


// =========================================
// DISPLAY QUESTION
// =========================================

function renderQuestion() {
    const q = questions[currentQuestionIndex];

    const questionCounter =
        document.querySelector('.question-counter p');

    const questionText =
        document.querySelector('.question-text');

    const optionsForm =
        document.querySelector('.options');

    questionCounter.textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    questionText.textContent =
        `${currentQuestionIndex + 1}. ${q.question_text}`;

    optionsForm.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];

    const optionTexts = [
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d
    ];

    optionTexts.forEach(function(optionText, index) {

        const label = document.createElement('label');

        label.className = 'option';

        const input = document.createElement('input');

        input.type = 'radio';

        input.name = `question${q.id}`;

        input.value = letters[index];

        // Restore previously selected answer
        if (answers[q.id] === letters[index]) {
            input.checked = true;
        }

        input.addEventListener('change', function() {
            answers[q.id] = this.value;
        });

        label.appendChild(input);

        label.appendChild(
            document.createTextNode(
                ` ${letters[index]}. ${optionText}`
            )
        );

        optionsForm.appendChild(label);
    });

    updateNavigationButtons();
    updateQuestionNavigator();
}


// =========================================
// QUESTION NAVIGATION
// =========================================

function goToQuestion(index) {

    if (index < 0 || index >= questions.length) {
        return;
    }

    currentQuestionIndex = index;

    renderQuestion();
}


// =========================================
// CREATE QUESTION NAVIGATOR
// =========================================

function createQuestionNavigator() {

    const navigator =
        document.querySelector('.question-navigator');

    navigator.innerHTML = '';

    questions.forEach(function(question, index) {

        const button =
            document.createElement('button');

        button.type = 'button';

        button.className = 'nav-btn';

        button.textContent = index + 1;

        button.addEventListener('click', function() {
            goToQuestion(index);
        });

        navigator.appendChild(button);
    });

    updateQuestionNavigator();
}


// =========================================
// UPDATE QUESTION NAVIGATOR
// =========================================

function updateQuestionNavigator() {

    const buttons =
        document.querySelectorAll('.nav-btn');

    buttons.forEach(function(button, index) {

        button.classList.remove('active');

        if (index === currentQuestionIndex) {
            button.classList.add('active');
        }

        if (answers[questions[index].id]) {
            button.classList.add('answered');
        }
    });
}


// =========================================
// UPDATE PREVIOUS / NEXT BUTTONS
// =========================================

function updateNavigationButtons() {

    const previousButton =
        document.querySelector('.btn-prev');

    const nextButton =
        document.querySelector('.btn-next');

    previousButton.disabled =
        currentQuestionIndex === 0;

    nextButton.disabled =
        currentQuestionIndex === questions.length - 1;
}


// =========================================
// PREVIOUS QUESTION
// =========================================

document.querySelector('.btn-prev')
    .addEventListener('click', function() {

        goToQuestion(currentQuestionIndex - 1);

    });


// =========================================
// NEXT QUESTION
// =========================================

document.querySelector('.btn-next')
    .addEventListener('click', function() {

        goToQuestion(currentQuestionIndex + 1);

    });


// =========================================
// TIMER
// =========================================

function startTimer() {

    updateTimerDisplay();

    timer = setInterval(function() {

        timeRemaining--;

        updateTimerDisplay();

        if (timeRemaining <= 0) {

            clearInterval(timer);

            alert('Time is up. Your exam will be submitted automatically.');

            submitExam();

        }

    }, 1000);
}


// =========================================
// UPDATE TIMER DISPLAY
// =========================================

function updateTimerDisplay() {

    const timerValue =
        document.querySelector('.timer-value');

    const minutes =
        Math.floor(timeRemaining / 60);

    const seconds =
        timeRemaining % 60;

    timerValue.textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


// =========================================
// SUBMIT EXAM
// =========================================

async function submitExam() {

    clearInterval(timer);

    const urlParams =
        new URLSearchParams(window.location.search);

    const examId =
        urlParams.get('examId');

    const token =
        localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in.');

        return;
    }

    const formattedAnswers =
        questions.map(function(question) {

            return {
                question_id: question.id,
                selected_answer:
                    answers[question.id] || null
            };

        });

    try {

        const response = await fetch(
            `/api/results/exam/${examId}/submit`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',

                    'Authorization':
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    answers: formattedAnswers
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to submit exam.');

            return;
        }

        // Save result temporarily for result page
        localStorage.setItem(
            'latestResult',
            JSON.stringify(data.result)
        );

        window.location.href =
            `result.html?attemptId=${data.result.attempt_id}`;

    } catch (error) {

        console.error('Submit exam error:', error);

        alert('An error occurred while submitting the exam.');
    }
}


// =========================================
// SUBMIT BUTTON
// =========================================

document.querySelector('.btn-submit')
    .addEventListener('click', function() {

        const confirmSubmit =
            confirm(
                'Are you sure you want to submit your exam?'
            );

        if (confirmSubmit) {
            submitExam();
        }

    });


// =========================================
// START EXAM
// =========================================

loadQuestions();
