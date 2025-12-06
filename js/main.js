/**
 * Circuit Architect - Main Entry Point
 * Game initialization and main loop
 */

import { TYPES, GRID_SIZE, PARTICLE_SPEED_FACTOR } from './config.js';
import { COMPONENTS } from './components.js';
import { CircuitNode, Component, physicsStep } from './physics.js';
import { LEVELS } from './levels.js';
import { state, saveProgress, loadProgress } from './state.js';
import { initUI, openPropertiesEditor, resetHints } from './ui.js';

/**
 * Initialize the canvas and grid
 */
function initGrid() {
    state.nodes = [];
    state.components = [];
    const container = document.getElementById('canvas-container');
    const canvas = document.getElementById('sim-canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    state.width = canvas.width;
    state.height = canvas.height;
}

/**
 * Get or create a node at position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {CircuitNode} The node at position
 */
function getNode(x, y) {
    let n = state.nodes.find(n => n.x === x && n.y === y);
    if (!n) {
        n = new CircuitNode(x, y);
        state.nodes.push(n);
    }
    return n;
}

/**
 * Add a component to the circuit
 * @param {string} type - Component type
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 */
function addComponent(type, x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) return;

    const existingIndex = state.components.findIndex(c =>
        (c.n1.x === x1 && c.n1.y === y1 && c.n2.x === x2 && c.n2.y === y2) ||
        (c.n1.x === x2 && c.n1.y === y2 && c.n2.x === x1 && c.n2.y === y1)
    );

    if (existingIndex >= 0) {
        const existing = state.components[existingIndex];
        if (state.toolMode === 'build') {
            if (existing.type === TYPES.SWITCH) {
                existing.param = existing.param ? 0 : 1;
            } else if ([TYPES.RESISTOR, TYPES.CAPACITOR, TYPES.CHIP, TYPES.BATTERY].includes(existing.type)) {
                openPropertiesEditor(existing);
            }
        }
        return;
    }

    const n1 = getNode(x1, y1);
    const n2 = getNode(x2, y2);

    const comp = new Component(type, n1, n2);
    n1.connections.push(comp);
    n2.connections.push(comp);

    if (type === TYPES.TRANSISTOR) {
        const mx = Math.round(((x1 + x2) / 2) / GRID_SIZE) * GRID_SIZE;
        const my = Math.round(((y1 + y2) / 2) / GRID_SIZE) * GRID_SIZE;
        const n3 = getNode(mx, my);
        comp.n3 = n3;
        n3.connections.push(comp);
    }

    state.components.push(comp);
}

/**
 * Load a level
 * @param {number} idx - Level index (0-indexed)
 */
function loadLevel(idx) {
    state.level = idx;
    state.nodes = [];
    state.components = [];
    state.won = false;
    state.currentHintIndex = 0;

    const lvl = LEVELS[idx];
    document.getElementById('level-title').innerText = lvl.title;
    document.getElementById('level-desc').innerText = lvl.desc;
    document.getElementById('level-theory').innerText = "THEORY: " + lvl.theory;
    document.getElementById('level-status').innerText = "";
    document.getElementById('level-indicator').innerText = `Level ${idx + 1}/10`;
    document.getElementById('modal-overlay').classList.remove('visible');

    // Reset hints for new level
    resetHints();

    // Clean canvas - NO pre-placed components (removed the automatic battery placement)
}

/**
 * Run circuit validation for current level
 */
function runValidation() {
    const lvl = LEVELS[state.level];
    if (lvl.check()) {
        state.won = true;

        // Save progress
        saveProgress(state.level);

        document.getElementById('next-level-num').innerText = state.level + 2;
        document.getElementById('level-status').innerText = "SUCCESS - LOGIC VALID";
        document.getElementById('level-status').style.color = "var(--success-color)";
        document.getElementById('modal-overlay').classList.add('visible');
    } else {
        document.getElementById('level-status').innerText = "FAILED - Check requirements";
        document.getElementById('level-status').style.color = "var(--danger-color)";
    }
}

/**
 * Draw the circuit
 */
function draw() {
    const canvas = document.getElementById('sim-canvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ghost Effect in Measure Mode
    if (state.toolMode === 'measure') {
        ctx.globalAlpha = 0.3;
    } else {
        ctx.globalAlpha = 1.0;
    }

    state.components.forEach(c => {
        const { x: x1, y: y1 } = c.n1;
        const { x: x2, y: y2 } = c.n2;
        const def = COMPONENTS[c.type];

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        // Wire
        ctx.beginPath();
        ctx.strokeStyle = '#565f89';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Electrons
        if (Math.abs(c.current) > 0.001) {
            const speed = c.current * PARTICLE_SPEED_FACTOR * (state.toolMode === 'measure' ? 0 : 1);
            ctx.fillStyle = c.current > 0 ? '#ff9e64' : '#7aa2f7';
            c.particles.forEach((p, i) => {
                c.particles[i] += speed;
                if (c.particles[i] > 1) c.particles[i] -= 1;
                if (c.particles[i] < 0) c.particles[i] += 1;
                const px = x1 + (x2 - x1) * c.particles[i];
                const py = y1 + (y2 - y1) * c.particles[i];
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Component Icon
        if (c.type !== TYPES.WIRE) {
            ctx.save();
            ctx.translate(midX, midY);
            ctx.rotate(angle);
            ctx.clearRect(-15, -10, 30, 20);
            def.draw(ctx, c.param, c);
            ctx.restore();
        }

        if (c.type === TYPES.TRANSISTOR && c.n3) {
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
        }
    });

    ctx.globalAlpha = 1.0;

    // Nodes
    state.nodes.forEach(n => {
        ctx.fillStyle = '#1a1c23';
        ctx.strokeStyle = '#565f89';

        if (state.toolMode === 'measure') {
            ctx.fillStyle = (n === state.hoverNode) ? '#f7768e' : '#222';
            ctx.strokeStyle = '#f7768e';
        } else {
            if (n.connections.some(c => c.type === TYPES.TRANSISTOR && c.n3 === n)) {
                ctx.strokeStyle = '#fff';
            }
            if (n === state.hoverNode) ctx.fillStyle = '#7aa2f7';
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    // Drag Line
    if (state.isDragging && state.dragStart && state.toolMode === 'build') {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(state.dragStart.x, state.dragStart.y);
        ctx.lineTo(state.mouseGrid.x, state.mouseGrid.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

/**
 * Main game loop
 */
function gameLoop() {
    physicsStep();
    draw();
    requestAnimationFrame(gameLoop);
}

/**
 * Initialize the game on window load
 */
window.onload = () => {
    initGrid();
    initUI(addComponent, openPropertiesEditor, loadLevel, runValidation);

    // Load saved progress and start from appropriate level
    const startLevel = loadProgress();
    loadLevel(startLevel);

    // Start game loop
    gameLoop();

    // Handle window resize
    window.onresize = () => {
        const container = document.getElementById('canvas-container');
        const canvas = document.getElementById('sim-canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        state.width = canvas.width;
        state.height = canvas.height;
    };
};
