const questions = [

    {
        text: "Если помидор — это фрукт, считается ли кетчуп вареньем?",

        options: [
            "Да.",
            "Нет.",
            "Технически возможно.",
            "Теперь я не могу перестать об этом думать."
        ],

        reactions: [
            "",
            "",
            "Варенье из помидоров действительно существует, но кетчуп — это соус.",
            "Не благодари ❤️"
        ]
    },

    {
        text: "Какую абсолютно бесполезную суперспособность ты хотел бы иметь?"
    },

    {
        text: "За тобой уже три дня наблюдает голубь. Как думаешь, зачем?"
    },

    {
        text: "Какого цвета вторник?"
    },

    {
        text: "Если бы твою жизнь снимали как сериал, как бы он назывался?"
    },

    {
        text: "Ты просыпаешься миллионером. Какая самая глупая вещь, которую ты купишь?"
    },

    {
        text: "Какое негласное правило общества ты бы отменил?"
    },

    {
        text: "Если бы инопланетяне попросили тебя доказать, что человечество разумно, что бы ты им показал?"
    },

    {
        text: "Если призрак наденет носки, сможет ли он пройти в них сквозь стену?",

        options: [
            "Да, носки тоже станут призрачными.",
            "Нет, носки останутся в стене.",
            "Только если снимет их перед стеной.",
            "Мне нужен призрак для проведения эксперимента."
        ]
    },

    {
        text: "Какое имя ты дал бы своей последней нервной клетке?"
    },

    {
        text: "Зачем ты вообще проходишь этот тест?",

        options: [
            "Меня заставили.",
            "Я сам/а не понимаю.",
            "А зачем ты вообще его создал?"
        ],

        reactions: [
            "❤️",
            "Да, я тоже.",
            "Меня в техе заставили, извините 🥺"
        ]
    }

];


let currentQuestion = 0;
let selectedAnswer = "";
let userAnswers = [];
let userName = "";
let isTransitioning = false;


const container = document.querySelector(".container");
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const nextButton = document.getElementById("nextButton");
const errorMessage = document.getElementById("errorMessage");


// Плавный переход

function transition(action) {

    if (isTransitioning) {
        return;
    }

    isTransitioning = true;

    container.classList.add("fade-out");

    setTimeout(function () {

        container.style.transition = "none";

        container.classList.remove("fade-out");
        container.classList.add("fade-in");

        action();

        window.scrollTo(0, 0);

        void container.offsetWidth;

        container.style.transition = "";
        container.classList.remove("fade-in");

        setTimeout(function () {

            isTransitioning = false;

        }, 220);

    }, 220);
}


// Переключение экранов

function showScreen(id) {

    const sections = document.querySelectorAll("main section");

    sections.forEach(function (section) {

        section.hidden = true;

    });

    document.getElementById(id).hidden = false;
}


// Начало теста

function startTest() {

    if (isTransitioning) {
        return;
    }

    userName = document.getElementById("name").value.trim();

    if (userName === "") {
        userName = "Аноним";
    }

    currentQuestion = 0;
    userAnswers = [];

    transition(function () {

        showScreen("test");
        showQuestion();

    });
}


// Отображение вопроса

function showQuestion() {

    const question = questions[currentQuestion];

    selectedAnswer = "";

    questionElement.textContent = question.text;

    answersElement.innerHTML = "";

    errorMessage.textContent = "";

    document.getElementById("progressText").textContent =
        "Вопрос " + (currentQuestion + 1) +
        " из " + questions.length;

    document.getElementById("progressBar").style.width =
        ((currentQuestion + 1) / questions.length * 100) + "%";


    // Вопросы с вариантами ответов

    if (Array.isArray(question.options)) {

        nextButton.hidden = true;

        question.options.forEach(function (option, index) {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "option";
            button.textContent = option;

            button.onclick = function () {

                if (isTransitioning) {
                    return;
                }

                button.classList.add("selected");

                const reaction = question.reactions
                    ? question.reactions[index]
                    : "";

                saveAnswer(option, reaction);

            };

            answersElement.appendChild(button);

        });

    } else {

        // Вопросы с письменным ответом

        nextButton.hidden = false;

        const textarea = document.createElement("textarea");

        textarea.placeholder = "Твой ответ...";

        textarea.oninput = function () {

            selectedAnswer = textarea.value;
            errorMessage.textContent = "";

        };

        answersElement.appendChild(textarea);

    }
}


// Кнопка «Далее»

function nextQuestion() {

    if (isTransitioning) {
        return;
    }

    if (selectedAnswer.trim() === "") {

        errorMessage.textContent =
            "Сначала ответь на вопрос :)";

        return;
    }

    saveAnswer(selectedAnswer.trim(), "");
}


// Сохранение ответа

function saveAnswer(answer, reaction) {

    if (isTransitioning) {
        return;
    }

    userAnswers.push({

        question: questions[currentQuestion].text,
        answer: answer

    });


    // Отдельный экран с реакцией

    if (reaction) {

        transition(function () {

            document.getElementById("reactionMessage")
                .textContent = reaction;

            showScreen("reactionScreen");

        });

    } else {

        continueTest();

    }
}


// Следующий вопрос

function continueTest() {

    if (isTransitioning) {
        return;
    }

    transition(function () {

        currentQuestion++;

        if (currentQuestion < questions.length) {

            showScreen("test");
            showQuestion();

        } else {

            finishTest();

        }

    });
}


// Завершение теста

function finishTest() {

    showScreen("result");

    const status = document.getElementById("sendStatus");

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = "Завершить тест";

    status.after(button);


    button.onclick = async function () {

        if (button.disabled) {
            return;
        }

        button.disabled = true;

        const data = new FormData();

        data.append("_subject", "Новый результат теста");
        data.append("Имя", userName);

        userAnswers.forEach(function (item, index) {

            data.append(
                (index + 1) + ". " + item.question,
                item.answer
            );

        });


        try {

            const response = await fetch(

                "https://formspree.io/f/mljbadzd",

                {
                    method: "POST",
                    body: data,

                    headers: {
                        "Accept": "application/json"
                    }
                }

            );

            if (!response.ok) {

                throw new Error("Ошибка отправки");

            }


            // Убираем кнопку после успешного завершения

            button.style.transition = "opacity 0.3s ease";
            button.style.opacity = "0";
            status.textContent = "";

            setTimeout(function () {

                button.remove();

            }, 300);


        } catch (error) {

            button.disabled = false;

            button.textContent = "Попробовать ещё раз";

            status.textContent =
                "Не удалось завершить тест. Попробуй ещё раз.";

            console.error(error);

        }

    };
}