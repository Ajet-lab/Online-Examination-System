```javascript
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
        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        const examId =
            urlParams.get('examId');


        // =========================================
        // CHECK EXAM ID
        // =========================================

        if (!examId) {

            alert(
                'Exam ID is missing.'
            );

            window.location.href =
                'dashboard.html';

            return;
        }


        // =========================================
        // CHECK LOGIN
        // =========================================

        const token =
            localStorage.getItem('token');

        if (!token) {

            alert(
                'You are not logged in.'
            );

            window.location.href =
                'login.html';

            return;
        }


        // =========================================
        // GET EXAM DETAILS
        // =========================================

        const examResponse =
            await fetch(
                `/api/exams/${examId}`,
                {
                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        if (!examResponse.ok) {

            throw new Error(
                'Unable to load exam'
            );
        }


        const examData =
            await examResponse.json();


        // =========================================
        // DISPLAY EXAM TITLE
        // =========================================

        const examTitle =
            document.getElementById(
                'examTitle'
            );

        if (examTitle) {

            examTitle.textContent =
                examData.exam.title;
        }


        // =========================================
        // USE EXAM DURATION FROM DATABASE
        // =========================================

        timeRemaining =
            examData.exam.duration_minutes * 60;


        // =========================================
        // GET EXAM QUESTIONS
        // =========================================

        const response =
            await fetch(
                `/api/questions/exam/${examId}`,
                {
                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                'Unable to load questions'
            );
        }


        const data =
            await response.json();


        questions =
            data.questions;


        // =========================================
        // CHECK WHETHER QUESTIONS EXIST
        // =========================================

        if (
            !questions ||
            questions.length === 0
        ) {

            alert(
                'This exam has no questions.'
            );

            window.location.href =
                'dashboard.html';

            return;
        }


        // =========================================
        // START EXAM
        // =========================================

        startTimer();

        renderQuestion();

        createQuestionNavigator();

    } catch (error) {

        console.error(
            'Error loading exam:',
            error
        );

        alert(
            'Unable to load the examination.'
        );

        window.location.href =
            'dashboard.html';
    }
}


// =========================================
// DISPLAY QUESTION
// =========================================

function renderQuestion() {

    const q =
        questions[
            currentQuestionIndex
        ];


    const questionCounter =
        document.querySelector(
            '.question-counter p'
        );


    const questionText =
        document.querySelector(
            '.question-text'
        );


    const optionsForm =
        document.querySelector(
            '.options'
        );


    // =========================================
    // QUESTION COUNTER
    // =========================================

    questionCounter.textContent =
        `Question ${
            currentQuestionIndex + 1
        } of ${
            questions.length
        }`;


    // =========================================
    // QUESTION TEXT
    // =========================================

    questionText.textContent =
        `${
            currentQuestionIndex + 1
        }. ${
            q.question_text
        }`;


    // =========================================
    // CLEAR OLD OPTIONS
    // =========================================

    optionsForm.innerHTML = '';


    // =========================================
    // CREATE OPTIONS
    // =========================================

    const letters = [
        'A',
        'B',
        'C',
        'D'
    ];


    const optionTexts = [

        q.option_a,

        q.option_b,

        q.option_c,

        q.option_d

    ];


    optionTexts.forEach(
        function(
            optionText,
            index
        ) {

            const label =
                document.createElement(
                    'label'
                );


            label.className =
                'option';


            const input =
                document.createElement(
                    'input'
                );


            input.type =
                'radio';


            input.name =
                `question${q.id}`;


            input.value =
                letters[index];


            // =========================================
            // RESTORE PREVIOUS ANSWER
            // =========================================

            if (
                answers[q.id] ===
                letters[index]
            ) {

                input.checked =
                    true;
            }


            // =========================================
            // SAVE ANSWER
            // =========================================

            input.addEventListener(
                'change',
                function() {

                    answers[q.id] =
                        this.value;

                    updateQuestionNavigator();

                }
            );


            label.appendChild(
                input
            );


            label.appendChild(
                document.createTextNode(
                    ` ${
                        letters[index]
                    }. ${
                        optionText
                    }`
                )
            );


            optionsForm.appendChild(
                label
            );

        }
    );


    updateNavigationButtons();

    updateQuestionNavigator();
}


// =========================================
// QUESTION NAVIGATION
// =========================================

function goToQuestion(index) {

    if (
        index < 0 ||
        index >= questions.length
    ) {

        return;
    }


    currentQuestionIndex =
        index;


    renderQuestion();
}


// =========================================
// CREATE QUESTION NAVIGATOR
// =========================================

function createQuestionNavigator() {

    const navigator =
        document.querySelector(
            '.question-navigator'
        );


    navigator.innerHTML = '';


    questions.forEach(
        function(
            question,
            index
        ) {

            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.className =
                'nav-btn';


            button.textContent =
                index + 1;


            button.addEventListener(
                'click',
                function() {

                    goToQuestion(
                        index
                    );

                }
            );


            navigator.appendChild(
                button
            );

        }
    );


    updateQuestionNavigator();
}


// =========================================
// UPDATE QUESTION NAVIGATOR
// =========================================

function updateQuestionNavigator() {

    const buttons =
        document.querySelectorAll(
            '.nav-btn'
        );


    buttons.forEach(
        function(
            button,
            index
        ) {

            button.classList.remove(
                'active'
            );


            if (
                index ===
                currentQuestionIndex
            ) {

                button.classList.add(
                    'active'
                );
            }


            if (
                answers[
                    questions[index].id
                ]
            ) {

                button.classList.add(
                    'answered'
                );

            } else {

                button.classList.remove(
                    'answered'
                );
            }

        }
    );
}


// =========================================
// UPDATE PREVIOUS / NEXT BUTTONS
// =========================================

function updateNavigationButtons() {

    const previousButton =
        document.querySelector(
            '.btn-prev'
        );


    const nextButton =
        document.querySelector(
            '.btn-next'
        );


    previousButton.disabled =
        currentQuestionIndex === 0;


    nextButton.disabled =
        currentQuestionIndex ===
        questions.length - 1;
}


// =========================================
// PREVIOUS QUESTION
// =========================================

document
    .querySelector('.btn-prev')
    .addEventListener(
        'click',
        function() {

            goToQuestion(
                currentQuestionIndex - 1
            );

        }
    );


// =========================================
// NEXT QUESTION
// =========================================

document
    .querySelector('.btn-next')
    .addEventListener(
        'click',
        function() {

            goToQuestion(
                currentQuestionIndex + 1
            );

        }
    );


// =========================================
// TIMER
// =========================================

function startTimer() {

    updateTimerDisplay();


    timer =
        setInterval(
            function() {

                timeRemaining--;

                updateTimerDisplay();


                // =========================================
                // AUTOMATIC SUBMISSION
                // =========================================

                if (
                    timeRemaining <= 0
                ) {

                    clearInterval(
                        timer
                    );


                    alert(
                        'Time is up. Your exam will be submitted automatically.'
                    );


                    submitExam();
                }

            },
            1000
        );
}


// =========================================
// UPDATE TIMER DISPLAY
// =========================================

function updateTimerDisplay() {

    const timerValue =
        document.querySelector(
            '.timer-value'
        );


    const minutes =
        Math.floor(
            timeRemaining / 60
        );


    const seconds =
        timeRemaining % 60;


    timerValue.textContent =
        `${
            String(minutes)
                .padStart(2, '0')
        }:${
            String(seconds)
                .padStart(2, '0')
        }`;
}


// =========================================
// SUBMIT EXAM
// =========================================

async function submitExam() {

    clearInterval(
        timer
    );


    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const examId =
        urlParams.get(
            'examId'
        );


    const token =
        localStorage.getItem(
            'token'
        );


    // =========================================
    // CHECK LOGIN
    // =========================================

    if (!token) {

        alert(
            'You are not logged in.'
        );

        window.location.href =
            'login.html';

        return;
    }


    // =========================================
    // FORMAT ANSWERS
    // =========================================

    const formattedAnswers =
        questions.map(
            function(question) {

                return {

                    question_id:
                        question.id,

                    selected_answer:
                        answers[
                            question.id
                        ] || null

                };

            }
        );


    try {

        // =========================================
        // SEND ANSWERS TO BACKEND
        // =========================================

        const response =
            await fetch(
                `/api/results/exam/${examId}/submit`,
                {
                    method: 'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        'Authorization':
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            {
                                answers:
                                    formattedAnswers
                            }
                        )
                }
            );


        const data =
            await response.json();


        // =========================================
        // HANDLE SUBMISSION ERROR
        // =========================================

        if (!response.ok) {

            alert(
                data.message ||
                'Unable to submit exam.'
            );

            return;
        }


        // =========================================
        // STUDENTS DO NOT SEE RESULTS
        // =========================================

        alert(
            'Exam submitted successfully.'
        );


        // =========================================
        // RETURN TO DASHBOARD
        // =========================================

        window.location.href =
            'dashboard.html';


    } catch (error) {

        console.error(
            'Submit exam error:',
            error
        );


        alert(
            'An error occurred while submitting the exam.'
        );

    }
}


// =========================================
// SUBMIT BUTTON
// =========================================

document
    .querySelector('.btn-submit')
    .addEventListener(
        'click',
        function() {

            const confirmSubmit =
                confirm(
                    'Are you sure you want to submit your exam?'
                );


            if (
                confirmSubmit
            ) {

                submitExam();

            }

        }
    );


// =========================================
// START EXAM
// =========================================

loadQuestions();
```
