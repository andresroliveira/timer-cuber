// src/scrambler.ts

const FACES = ["U", "D", "R", "L", "F", "B"];
const MODIFIERS = ["", "2", "'"];

// Mapeia para evitar movimentos no mesmo eixo (ex: U depois D)
const AXIS_MAP: { [key: string]: number } = {
    U: 0,
    D: 0,
    R: 1,
    L: 1,
    F: 2,
    B: 2,
};

function getRandomMove(lastFace: string | null): string {
    let face = "";
    do {
        const faceIndex = Math.floor(Math.random() * FACES.length);
        face = FACES[faceIndex];
    } while (lastFace && AXIS_MAP[face] === AXIS_MAP[lastFace]);

    const modifierIndex = Math.floor(Math.random() * MODIFIERS.length);
    const modifier = MODIFIERS[modifierIndex];

    return face + modifier;
}

export function generateScramble(length: number = 21): string {
    const moves: string[] = [];
    let lastFace: string | null = null;
    for (let i = 0; i < length; i++) {
        const move = getRandomMove(lastFace);
        moves.push(move);
        lastFace = move.charAt(0);
    }
    return moves.join(" ");
}
