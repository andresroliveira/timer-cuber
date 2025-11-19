// src/timer.ts

// 1. Estado do Timer
type TimerStatus = "stopped" | "running" | "ready";
let status: TimerStatus = "stopped";
let startTime: number = 0;
let intervalId: number | null = null;
let currentTime: number = 0;

// Lista de tempos
export const times: number[] = [];

// Elemento HTML
let timerElement: HTMLElement;

// --- Funções de Formatação e Display ---

export function formatTime(ms: number): string {
    const totalCentiseconds = Math.floor(ms / 10);
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    const csStr = centiseconds.toString().padStart(2, "0");
    const secStr = seconds.toString().padStart(2, "0");

    if (minutes > 0) {
        return `${minutes}:${secStr}.${csStr}`;
    }
    return `${seconds}.${csStr}`;
}

function updateDisplay() {
    currentTime = Date.now() - startTime;
    if (timerElement) {
        timerElement.textContent = formatTime(currentTime);
    }
}

// --- Controle do Timer ---

function start() {
    if (status !== "ready") return;

    status = "running";
    startTime = Date.now();
    intervalId = window.setInterval(updateDisplay, 10);

    // Feedback visual
    timerElement.classList.remove("timer-ready");
    timerElement.classList.add("timer-running");
}

function stop(): number | null {
    if (status !== "running") return null;

    status = "stopped";
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // Salva o tempo
    const finalTime = currentTime;
    times.unshift(finalTime); // Adiciona no início do array (mais recente primeiro)
    if (times.length > 100) {
        times.pop(); // Mantém um histórico razoável (até 100)
    }

    // Feedback visual
    timerElement.classList.remove("timer-running");

    return finalTime;
}

export function reset() {
    if (status === "running") return; // Não reseta enquanto o timer está rodando

    status = "stopped";
    currentTime = 0;
    if (timerElement) {
        timerElement.textContent = formatTime(0);
        timerElement.classList.remove("timer-ready", "timer-running");
    }
}

// --- Novas Funções para Interação ---

/**
 * Prepara o timer quando o usuário pressiona a tecla.
 * O timer iniciará quando a tecla for solta.
 */
export function prepare() {
    if (status === "running") {
        stop(); // Se estiver rodando, a primeira ação é parar.
        return "stopped";
    }

    if (status === "stopped") {
        status = "ready";
        timerElement.classList.add("timer-ready"); // Verde para indicar "pronto"
        return "ready";
    }
    return null;
}

/**
 * Inicia o timer (chamado ao soltar a tecla).
 */
export function go() {
    if (status === "ready") {
        start();
        return "started";
    }
    return null;
}

/**
 * Retorna o status atual do timer.
 */
export function getStatus(): TimerStatus {
    return status;
}

/**
 * Função de inicialização para conectar o elemento HTML.
 */
export function initTimer(element: HTMLElement) {
    timerElement = element;
    reset();
}
