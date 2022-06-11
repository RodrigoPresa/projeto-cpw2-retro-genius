const maxRounds = 20;       // configura o número de rounds
let speedGame = 700;        // velocidade padrão do jogo
let gameOn = false;         // indica se o jogo está ativo
let arrSequence = [];       // guarda a sequencia da rodada
let currentLevel = 1;       // guarda o nível atual em que o jogador se encontra
let currentSequence = [];   // guarda a sequencia atual do jogador, extraida do arrSequence
let playerSequence = [];    // guarda a sequencia que o jogador clicou para comparação com a currentSequence
let score = 0;              // guarda a pontuação feita pelo jogador
let record = (localStorage.getItem("divRecord") ? localStorage.getItem("divRecord") : 0); // grava a pontuação máxima que um jogador fez
let canPlayerPlay = false;  // variável de controle que determina se o jogador pode clicar ou não

//Gera um array com a sequência a ser apresentada ao jogador
function generateSequence() {
    for (i = 0; i < maxRounds; i++) {
        let randomSequence = Math.floor(Math.random() * 4);
        arrSequence.push(randomSequence);
    }
}

document.addEventListener("DOMContentLoaded", function (e) {

    // pega divs do jogo
    let buttons = [
        { btnColor: document.getElementById("0") },
        { btnColor: document.getElementById("1") },
        { btnColor: document.getElementById("2") },
        { btnColor: document.getElementById("3") }
    ];
    let divScore = document.getElementById("score");
    let divLevel = document.getElementById("level");
    let divRecord = document.getElementById("record");
    let btnStart = document.getElementById("start");
    let btnReset = document.getElementById("reset");
    let statusMsg = document.getElementById("status-msg");
    let cards = document.querySelectorAll(".basic-style-divs");

    divLevel.innerHTML = "Level: " + currentLevel;
    divScore.innerHTML = "Score: " + score;
    divRecord.innerHTML = "Record: " + record;

    // reseta valores do HUD
    function resetHUDValues() {
        speedGame = 700;
        currentLevel = 1;
        score = 0;
        currentSequence = [];
        arrSequence = [];
        divLevel.innerHTML = "Level: " + currentLevel;
        divScore.innerHTML = "Score: " + score;
    }

    startGame();
    resetGame();

    // função onde irão ser chamadas as funções do jogo ao começar uma partida
    function startGame() {
        btnStart.addEventListener('click', () => {
            generateSequence();
            gameOn = true;
            btnStart.style.display = "none";
            btnReset.style.display = "flex"
            if (canPlayerPlay) setCardsClickListener();
            callRounds();
        });
    }

    function resetGame() {
        btnReset.addEventListener('click', () => {
            resetHUDValues();
            generateSequence();
            gameOn = true;
            if (canPlayerPlay) setCardsClickListener();
            callRounds();
        });
    }

    // função que chama cada rodada se o jogo estiver ativo
    function callRounds() {
        statusMsg.innerText = "";
        if (gameOn) {
            try {
                displayCurrentSequence();
            } catch (e) {
                console.error("erro: " + e);
            }
        }
    }

    // controla quando uma div deve "acender"
    function blinkWhenClicked(clickedButton) {
        if (canPlayerPlay) {
            clickedButton.classList.add("active");
            audioEffect(parseInt(clickedButton.id));
            delay(500).then(() => clickedButton.classList.remove("active"));
        }
    }

    // Mostra a sequencia de acordo com o nível em que o jogador se encontra
    function displayCurrentSequence() {
        let counter = 0;
        let btnOn = false;
        canPlayerPlay = false;
        currentSequence = arrSequence.slice(0, currentLevel);
        playerSequence = [];

        if (currentLevel > 15) speedGame = 400;
        else if (currentLevel > 10) speedGame = 600;

        const interval = setInterval(() => {
            let currentIndexSequence = currentSequence[counter];
            let currentBtn = buttons[currentIndexSequence].btnColor;

            if (!btnOn) {
                if (counter === currentSequence.length - 1) {
                    clearInterval(interval);
                    audioEffect(parseInt(currentBtn.id));
                    currentBtn.classList.add("active");
                    delay(500)
                        .then(() => currentBtn.classList.remove("active"))

                    delay(1000).then(() => statusMsg.innerText = "Go!");
                    delay(2000).then(() => statusMsg.innerText = "");
                    
                    canPlayerPlay = true;
                    setCardsClickListener();
                    return;
                }
                audioEffect(parseInt(currentBtn.id));
                currentBtn.classList.add("active");
                delay(1000).then(() => currentBtn.classList.remove("active"));
                counter++;
            }

            btnOn = !btnOn;
        }, speedGame);
    }

    function getPlayerSequence(e) {
        let clickedButton = document.getElementById(e.target.id);

        blinkWhenClicked(clickedButton);
        playerSequence.push(parseInt(clickedButton.id));

        if (playerSequence.length === currentLevel) {
            canPlayerPlay = false;
            setCardsClickListener();
            isPlayerSequenceMatches();
        }
    }

    // Compara a sequencia que o jogador clicou com a sequencia do nível em que se encontra
    function isPlayerSequenceMatches() {

        if (playerSequence.length === currentSequence.length &&
            playerSequence.every((value, index) => value === currentSequence[index])) {

            statusMsg.innerText = "CORRECT!";

            setScore();
            setLevel();
            setRecord();

            if (currentLevel === maxRounds + 1) {
                endGame();
            } else {
                delay(1000).then(() => callRounds());
            }
        } else {
            endGame();
        }
    }

    // finaliza o jogo caso o jogador perca ou ganhe
    function endGame() {
        canPlayerPlay = false;
        // se o jogador conseguir a pontuação máxima
        if (score === maxRounds) {
            alert("Fim de jogo! Parabéns!");
            gameOn = false;
            resetHUDValues();
            return;
        }

        // se o jogador errar a sequencia
        gameOn = false;
        statusMsg.innerText = "Game over!";
    }

    // seta a pontuação do jogador
    function setScore() {
        score += 1;
        divScore.innerHTML = "Score: " + score;
    }
    // seta o nível atual
    function setLevel() {
        divLevel.innerHTML = "Level: " + (++currentLevel);
    }

    function setRecord() {
        if (record < score) {
            record = score;
            localStorage.setItem("divRecord", record.toString())
        }
        divRecord.innerHTML = "Record: " + localStorage.getItem("divRecord");
    }

    // implementa o click na div
    function setCardsClickListener() {
        if (canPlayerPlay) {
            cards.forEach(function (elem) {
                elem.addEventListener("click", getPlayerSequence, false);
            });
        } else {
            cards.forEach(function (elem) {
                elem.removeEventListener("click", getPlayerSequence, false);
            });
        }
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function audioEffect(frequency) {
        // pega um contexto de áudio
        var ctx = new AudioContext();

        // seta o volume
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.1;

        // variável que vai representar o oscilador
        var osc;

        // configura a frequência (nota) que será disparada de acordo com o id da div
        if (frequency === 0) frequency = 264;
        if (frequency === 1) frequency = 297;
        if (frequency === 2) frequency = 330;
        if (frequency === 3) frequency = 352;


        if (osc) {
            osc.stop(0);
        }
        // cria o oscilador
        osc = ctx.createOscillator();
        // define o tipo do oscilador
        osc.type = 'triangle';
        // determina a frequência (nota) que será disparada para cada div
        osc.frequency.value = frequency;
        // conecta o oscilador com o valor do volume à saida
        osc.connect(gainNode).connect(ctx.destination);
        // inicia a nota
        osc.start(0);
        delay(100).then(() => osc.disconnect(0));
    }
});

