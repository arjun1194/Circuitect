/**
 * Circuit Architect - UI Module
 * User interface interactions and event handling
 */

import { TYPES, GRID_SIZE, DEFAULT_BATTERY_VOLTAGE } from './config.js';
import { COMPONENTS } from './components.js';
import { state, resetProgress } from './state.js';
import { LEVELS } from './levels.js';

// Module-level references (set during init)
let addComponentFn = null;
let openPropertiesEditorFn = null;

/**
 * Initialize all UI event handlers
 * @param {Function} addComponent - Function to add components
 * @param {Function} openPropertiesEditor - Function to open property editor
 * @param {Function} loadLevel - Function to load a level
 * @param {Function} runValidation - Function to validate circuit
 */
export function initUI(addComponent, openPropertiesEditor, loadLevel, runValidation) {
    addComponentFn = addComponent;
    openPropertiesEditorFn = openPropertiesEditor;

    // Mode Switcher
    document.getElementById('btn-mode-build').onclick = () => setMode('build');
    document.getElementById('btn-mode-measure').onclick = () => setMode('measure');

    // Toolbox Generation
    const toolbox = document.getElementById('toolbox');
    const categories = {
        'Basic': [],
        'Passive': [],
        'Active': [],
        'Power': [],
        'Control': [],
        'Output': [],
        'Abstraction': []
    };

    Object.keys(COMPONENTS).forEach(k => {
        const c = COMPONENTS[k];
        if (c.category) categories[c.category].push(k);
    });

    Object.keys(categories).forEach(cat => {
        if (categories[cat].length === 0) return;
        const header = document.createElement('div');
        header.className = 'tool-category';
        header.innerText = cat;
        toolbox.appendChild(header);

        categories[cat].forEach(type => {
            const def = COMPONENTS[type];
            const btn = document.createElement('div');
            btn.className = 'tool-btn';
            if (type === TYPES.WIRE) btn.classList.add('active');
            btn.innerHTML = `<div class="tool-icon" style="background:${def.color}">${def.name[0]}</div> ${def.name}`;
            btn.onclick = () => {
                if (state.toolMode !== 'build') setMode('build');
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.selectedTool = type;
            };
            toolbox.appendChild(btn);
        });
    });

    // Property Editor Logic
    document.getElementById('btn-save-prop').onclick = () => {
        if (!state.editingComponent) return;
        const c = state.editingComponent;

        if (c.type === TYPES.RESISTOR) {
            c.resistance = parseInt(document.getElementById('inp-resistance').value) || 220;
        }
        if (c.type === TYPES.CAPACITOR) {
            c.capacitance = parseInt(document.getElementById('inp-capacitance').value) || 10;
        }
        if (c.type === TYPES.CHIP) {
            c.logic = document.getElementById('inp-logic').value;
        }
        if (c.type === TYPES.BATTERY) {
            c.voltage = parseFloat(document.getElementById('inp-voltage').value) || DEFAULT_BATTERY_VOLTAGE;
        }
        if (c.type === TYPES.LED) {
            c.ledColor = document.getElementById('inp-led-color').value;
        }

        document.getElementById('prop-editor').style.display = 'none';
        state.editingComponent = null;
    };

    // Clear Button
    document.getElementById('btn-clear').onclick = () => {
        state.nodes = [];
        state.components = [];
        state.won = false;
        state.currentHintIndex = 0;
        document.getElementById('level-status').innerText = "";
        document.getElementById('level-hint').style.display = 'none';
        document.getElementById('modal-overlay').classList.remove('visible');
    };

    // Next Level Button
    document.getElementById('btn-next-level').onclick = () => {
        if (state.level < LEVELS.length - 1) {
            loadLevel(state.level + 1);
        } else {
            loadLevel(0);
        }
    };

    // Test Circuit Button
    document.getElementById('btn-submit').onclick = runValidation;

    // Hint Button
    document.getElementById('hint-btn').onclick = () => {
        showNextHint();
    };

    // Reset Progress Button
    const resetBtn = document.getElementById('btn-reset-progress');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('Reset all progress? You will start from Level 1.')) {
                resetProgress();
                loadLevel(0);
            }
        };
    }

    // Canvas Events
    setupCanvasEvents();
}

/**
 * Setup canvas mouse/touch events
 */
function setupCanvasEvents() {
    const canvas = document.getElementById('sim-canvas');

    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - r.left) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((e.clientY - r.top) / GRID_SIZE) * GRID_SIZE
        };
    };

    canvas.onmousedown = (e) => {
        const mx = e.clientX - canvas.getBoundingClientRect().left;
        const my = e.clientY - canvas.getBoundingClientRect().top;

        if (state.toolMode === 'build') {
            state.dragStart = getPos(e);
            state.isDragging = true;

            const clicked = state.components.find(c => {
                const midX = (c.n1.x + c.n2.x) / 2;
                const midY = (c.n1.y + c.n2.y) / 2;
                return Math.hypot(midX - mx, midY - my) < 20;
            });

            if (clicked) {
                if (clicked.type === TYPES.SWITCH) {
                    clicked.param = clicked.param ? 0 : 1;
                } else if ([TYPES.RESISTOR, TYPES.CAPACITOR, TYPES.CHIP, TYPES.BATTERY, TYPES.LED].includes(clicked.type)) {
                    openPropertiesEditorFn(clicked);
                }
                state.isDragging = false;
            }
        }
    };

    canvas.onmousemove = (e) => {
        state.mouseGrid = getPos(e);
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        state.hoverNode = state.nodes.find(n => Math.hypot(n.x - mx, n.y - my) < 15);

        // MEASURE MODE LOGIC
        if (state.toolMode === 'measure') {
            const tooltip = document.getElementById('measure-tooltip');
            if (state.hoverNode) {
                tooltip.style.display = 'block';
                tooltip.style.left = (mx + 15) + 'px';
                tooltip.style.top = (my + 15) + 'px';
                tooltip.innerText = `V: ${state.hoverNode.voltage.toFixed(2)}V`;
                canvas.style.cursor = 'crosshair';
            } else {
                tooltip.style.display = 'none';
                canvas.style.cursor = 'default';
            }
        } else {
            document.getElementById('measure-tooltip').style.display = 'none';
            canvas.style.cursor = 'default';
        }
    };

    canvas.onmouseup = (e) => {
        if (state.toolMode === 'build' && state.isDragging && state.dragStart) {
            const end = getPos(e);
            addComponentFn(state.selectedTool, state.dragStart.x, state.dragStart.y, end.x, end.y);
        }
        state.isDragging = false;
        state.dragStart = null;
    };
}

/**
 * Set tool mode (build or measure)
 * @param {string} mode - 'build' or 'measure'
 */
export function setMode(mode) {
    state.toolMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-mode-' + mode).classList.add('active');
    document.getElementById('measure-tooltip').style.display = 'none';
}

/**
 * Open the property editor for a component
 * @param {Component} comp - The component to edit
 */
export function openPropertiesEditor(comp) {
    state.editingComponent = comp;
    const editor = document.getElementById('prop-editor');

    // Hide all fields first
    ['resistor', 'capacitor', 'chip', 'battery', 'led'].forEach(id => {
        const field = document.getElementById('field-' + id);
        if (field) field.style.display = 'none';
    });

    if (comp.type === TYPES.RESISTOR) {
        document.getElementById('prop-title').innerText = "Edit Resistor";
        document.getElementById('field-resistor').style.display = 'block';
        document.getElementById('inp-resistance').value = comp.resistance;
    } else if (comp.type === TYPES.CAPACITOR) {
        document.getElementById('prop-title').innerText = "Edit Capacitor";
        document.getElementById('field-capacitor').style.display = 'block';
        document.getElementById('inp-capacitance').value = comp.capacitance;
    } else if (comp.type === TYPES.CHIP) {
        document.getElementById('prop-title').innerText = "Program Chip";
        document.getElementById('field-chip').style.display = 'block';
        document.getElementById('inp-logic').value = comp.logic;
    } else if (comp.type === TYPES.BATTERY) {
        document.getElementById('prop-title').innerText = "Edit Battery";
        document.getElementById('field-battery').style.display = 'block';
        document.getElementById('inp-voltage').value = comp.voltage;
    } else if (comp.type === TYPES.LED) {
        document.getElementById('prop-title').innerText = "Edit LED";
        document.getElementById('field-led').style.display = 'block';
        document.getElementById('inp-led-color').value = comp.ledColor || 'red';
    }

    editor.style.display = 'block';
}

/**
 * Show the next hint for the current level
 */
export function showNextHint() {
    const lvl = LEVELS[state.level];
    if (!lvl.hints || lvl.hints.length === 0) return;

    const hintDiv = document.getElementById('level-hint');

    if (state.currentHintIndex < lvl.hints.length) {
        const hintsToShow = lvl.hints.slice(0, state.currentHintIndex + 1);
        hintDiv.innerHTML = '<strong>💡 Hints:</strong><br>' +
            hintsToShow.map((h, i) => `${i + 1}. ${h}`).join('<br>');
        hintDiv.style.display = 'block';
        state.currentHintIndex++;

        // Update button text
        const btn = document.getElementById('hint-btn');
        if (state.currentHintIndex >= lvl.hints.length) {
            btn.innerText = 'All hints shown';
            btn.disabled = true;
        } else {
            btn.innerText = `Show Hint (${state.currentHintIndex}/${lvl.hints.length})`;
        }
    }
}

/**
 * Reset hint state for new level
 */
export function resetHints() {
    state.currentHintIndex = 0;
    const hintDiv = document.getElementById('level-hint');
    if (hintDiv) hintDiv.style.display = 'none';

    const btn = document.getElementById('hint-btn');
    if (btn) {
        const lvl = LEVELS[state.level];
        if (lvl && lvl.hints) {
            btn.innerText = `Show Hint (0/${lvl.hints.length})`;
            btn.disabled = false;
        }
    }
}
