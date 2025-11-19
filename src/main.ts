// src/main.ts

import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

import { generateScramble } from "./scrambler";
import { initTimer, prepare, go, reset, getStatus, times, formatTime } from "./timer";

// --- Seleção de Elementos ---
const scrambleElement = document.getElementById("scramble") as HTMLElement;
const timerElement = document.getElementById("timer") as HTMLElement;
const timesListElement = document.getElementById("times-list") as HTMLElement;
const startButton = document.getElementById("startButton") as HTMLButtonElement;
const resetButton = document.getElementById("resetButton") as HTMLButtonElement;
const generateButton = document.getElementById("generateButton") as HTMLButtonElement;
const clearAllButton = document.getElementById("clearAllButton") as HTMLButtonElement;
const bestTimeElement = document.getElementById("best-time") as HTMLElement;
const avgLast5Element = document.getElementById("avg-last5") as HTMLElement;
const avgGlobalElement = document.getElementById("avg-global") as HTMLElement;
const ao5Element = document.getElementById("ao5") as HTMLElement;
const ao12Element = document.getElementById("ao12") as HTMLElement;
const countTimesElement = document.getElementById("count-times") as HTMLElement;

// --- Funções de UI ---

/**
 * Gera um novo embaralhamento, exibe na tela e reseta o timer.
 */
function newScramble() {
    const scramble = generateScramble(21);
    scrambleElement.textContent = scramble;
    reset(); // Reseta o timer para um novo começo
}

/**
 * Atualiza a lista de tempos na tela.
 */
function updateTimesList() {
    timesListElement.innerHTML = ""; // Limpa a lista
    if (times.length === 0) {
        timesListElement.innerHTML =
            '<li class="list-group-item text-muted">Nenhum tempo registrado ainda.</li>';
        // Atualiza estatísticas
        if (bestTimeElement) bestTimeElement.textContent = "-";
        if (avgLast5Element) avgLast5Element.textContent = "-";
        if (avgGlobalElement) avgGlobalElement.textContent = "-";
        if (countTimesElement) countTimesElement.textContent = "0";
        // Persist
        localStorage.setItem("times", JSON.stringify(times));
        return;
    }

    times.forEach((time, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        // Formata o tempo para exibição usando formatTime
        const formattedTime = formatTime(time);
        li.innerHTML = `<div class=\"d-flex align-items-center gap-3\"><span>#${
            times.length - index
        }</span> <strong>${formattedTime}</strong></div>`;

        // Botão de excluir item
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.title = "Excluir este tempo";
        delBtn.innerText = "✕";
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            // Remove a primeira ocorrência deste tempo (times são ms)
            const idx = times.indexOf(time);
            if (idx !== -1) {
                times.splice(idx, 1);
                localStorage.setItem("times", JSON.stringify(times));
                updateTimesList();
            }
        });

        timesListElement.appendChild(li);
        li.appendChild(delBtn);
    });

    // Estatísticas
    const count = times.length;
    const best = Math.min(...times);
    const last5 = times.slice(0, 5);
    const avgLast5 = Math.round(last5.reduce((a, b) => a + b, 0) / last5.length);
    const avgGlobal = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

    // Ao5 (WCA): last 5 solves, drop best and worst, average the middle 3
    let ao5: number | null = null;
    if (times.length >= 5) {
        const five = times.slice(0, 5).slice();
        five.sort((a, b) => a - b);
        // drop first and last
        const middle3 = five.slice(1, 4);
        ao5 = Math.round(middle3.reduce((a, b) => a + b, 0) / middle3.length);
    }

    // Ao12: last 12 solves, drop best and worst, average the middle 10
    let ao12: number | null = null;
    if (times.length >= 12) {
        const twelve = times.slice(0, 12).slice();
        twelve.sort((a, b) => a - b);
        const middle10 = twelve.slice(1, 11);
        ao12 = Math.round(middle10.reduce((a, b) => a + b, 0) / middle10.length);
    }

    if (bestTimeElement) bestTimeElement.textContent = formatTime(best);
    if (avgLast5Element) avgLast5Element.textContent = formatTime(avgLast5);
    if (avgGlobalElement) avgGlobalElement.textContent = formatTime(avgGlobal);
    if (ao5Element) ao5Element.textContent = ao5 != null ? formatTime(ao5) : "-";
    if (ao12Element) ao12Element.textContent = ao12 != null ? formatTime(ao12) : "-";
    if (countTimesElement) countTimesElement.textContent = String(count);

    // Persist
    localStorage.setItem("times", JSON.stringify(times));
}

// --- Lógica de Eventos ---

let spacebarHeld = false;

/**
 * Lida com o pressionar de teclas.
 * A principal funcionalidade é com a barra de espaço.
 */
window.addEventListener("keydown", (e) => {
    // Impede o comportamento padrão da barra de espaço (rolar a página)
    if (e.code === "Space") {
        e.preventDefault();
        if (!spacebarHeld) {
            const action = prepare();
            if (action === "stopped") {
                newScramble();
                updateTimesList();
            }
            spacebarHeld = true;
        }
    }
});

/**
 * Lida com o soltar de teclas, principalmente a barra de espaço
 * para iniciar o timer.
 */
window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        go();
        // Após soltar e iniciar/parar, atualiza lista
        updateTimesList();
        spacebarHeld = false;
    }
});

/**
 * Permite gerar um novo embaralhamento clicando no texto do embaralhamento.
 */
scrambleElement.addEventListener("click", () => {
    if (getStatus() !== "running") {
        newScramble();
    }
});

// Botões visuais
startButton?.addEventListener("click", () => {
    const status = getStatus();
    if (status === "running") {
        // parada
        const action = prepare();
        if (action === "stopped") {
            newScramble();
            updateTimesList();
        }
    } else if (status === "ready") {
        go();
    } else {
        // start immediately (click)
        prepare();
        go();
    }
});

resetButton?.addEventListener("click", () => {
    reset();
    updateTimesList();
});

generateButton?.addEventListener("click", () => {
    if (getStatus() !== "running") {
        newScramble();
    }
});

// Limpar todos os tempos
clearAllButton?.addEventListener("click", () => {
    if (!confirm("Limpar todos os tempos? Esta ação não pode ser desfeita.")) return;
    times.length = 0;
    localStorage.removeItem("times");
    updateTimesList();
});

// --- Inicialização ---

// Conecta o timer ao seu elemento HTML
initTimer(timerElement);

// Carrega tempos salvos (se houver)
const saved = localStorage.getItem("times");
if (saved) {
    try {
        const arr = JSON.parse(saved) as number[];
        times.length = 0;
        arr.slice(0, 100).forEach((t) => times.push(t));
    } catch (e) {
        // ignore
    }
}

// Gera o primeiro embaralhamento
newScramble();

// Exibe a lista de tempos (inicialmente com dados carregados)
updateTimesList();
