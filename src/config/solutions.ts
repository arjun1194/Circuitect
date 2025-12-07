/**
 * Level Solutions
 * Pre-built circuit solutions for each level in JSON format
 */

import { SerializedCircuit } from '../utils/CircuitSerializer';

// Level 1: The Closed Loop - Battery + LED in a loop
export const level1Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 200, y: 200 },
        { id: 1, x: 400, y: 200 },
        { id: 2, x: 400, y: 350 },
        { id: 3, x: 200, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'LED', n1Id: 1, n2Id: 2, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 2, n2Id: 3 },
        { type: 'WIRE', n1Id: 3, n2Id: 0 }
    ]
};

// Level 2: Control with a Switch - Battery + Switch + LED
export const level2Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 150, y: 200 },
        { id: 1, x: 300, y: 200 },
        { id: 2, x: 450, y: 200 },
        { id: 3, x: 450, y: 350 },
        { id: 4, x: 150, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'SWITCH', n1Id: 1, n2Id: 2, properties: { param: 1 } },
        { type: 'LED', n1Id: 2, n2Id: 3, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 3, n2Id: 4 },
        { type: 'WIRE', n1Id: 4, n2Id: 0 }
    ]
};

// Level 3: Current Limiting Resistor - Battery + Resistor + LED
export const level3Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 150, y: 200 },
        { id: 1, x: 300, y: 200 },
        { id: 2, x: 450, y: 200 },
        { id: 3, x: 450, y: 350 },
        { id: 4, x: 150, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'RESISTOR', n1Id: 1, n2Id: 2, properties: { resistance: 330 } },
        { type: 'LED', n1Id: 2, n2Id: 3, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 3, n2Id: 4 },
        { type: 'WIRE', n1Id: 4, n2Id: 0 }
    ]
};

// Level 4: Parallel LEDs - Two LEDs sharing the same nodes
export const level4Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 200, y: 200 },
        { id: 1, x: 400, y: 200 },
        { id: 2, x: 400, y: 350 },
        { id: 3, x: 200, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'LED', n1Id: 1, n2Id: 2, properties: { ledColor: 'red' } },
        { type: 'LED', n1Id: 1, n2Id: 2, properties: { ledColor: 'green' } },
        { type: 'WIRE', n1Id: 2, n2Id: 3 },
        { type: 'WIRE', n1Id: 3, n2Id: 0 }
    ]
};

// Level 5: Understanding Capacitors - Battery + Capacitor
export const level5Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 200, y: 200 },
        { id: 1, x: 400, y: 200 },
        { id: 2, x: 400, y: 350 },
        { id: 3, x: 200, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'CAPACITOR', n1Id: 1, n2Id: 2, properties: { capacitance: 10 } },
        { type: 'WIRE', n1Id: 2, n2Id: 3 },
        { type: 'WIRE', n1Id: 3, n2Id: 0 }
    ]
};

// Level 6: Transistor as a Switch - Transistor controlling an LED
export const level6Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 150, y: 200 },  // Battery +
        { id: 1, x: 300, y: 200 },  // Junction
        { id: 2, x: 300, y: 150 },  // Transistor base input
        { id: 3, x: 450, y: 200 },  // LED output
        { id: 4, x: 450, y: 350 },
        { id: 5, x: 150, y: 350 }   // Battery -
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'TRANSISTOR', n1Id: 1, n2Id: 3, n3Id: 2 },
        { type: 'WIRE', n1Id: 0, n2Id: 2 },  // Base voltage from battery
        { type: 'LED', n1Id: 3, n2Id: 4, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 4, n2Id: 5 },
        { type: 'WIRE', n1Id: 5, n2Id: 0 }
    ]
};

// Level 7: Building a NOT Gate - Inverter circuit
export const level7Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 150, y: 200 },
        { id: 1, x: 300, y: 200 },
        { id: 2, x: 300, y: 150 },
        { id: 3, x: 450, y: 200 },
        { id: 4, x: 450, y: 350 },
        { id: 5, x: 150, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'TRANSISTOR', n1Id: 1, n2Id: 3, n3Id: 2 },
        { type: 'RESISTOR', n1Id: 0, n2Id: 2, properties: { resistance: 1000 } },
        { type: 'LED', n1Id: 3, n2Id: 4, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 4, n2Id: 5 },
        { type: 'WIRE', n1Id: 5, n2Id: 0 }
    ]
};

// Level 8: AND Gate with Switches - Two switches in series
export const level8Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 100, y: 200 },
        { id: 1, x: 225, y: 200 },
        { id: 2, x: 350, y: 200 },
        { id: 3, x: 475, y: 200 },
        { id: 4, x: 475, y: 350 },
        { id: 5, x: 100, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'SWITCH', n1Id: 1, n2Id: 2, properties: { param: 1 } },
        { type: 'SWITCH', n1Id: 2, n2Id: 3, properties: { param: 1 } },
        { type: 'LED', n1Id: 3, n2Id: 4, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 4, n2Id: 5 },
        { type: 'WIRE', n1Id: 5, n2Id: 0 }
    ]
};

// Level 9: Using Logic Chips - XOR Gate
export const level9Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 150, y: 200 },
        { id: 1, x: 300, y: 200 },
        { id: 2, x: 450, y: 200 },
        { id: 3, x: 450, y: 350 },
        { id: 4, x: 150, y: 350 }
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'CHIP', n1Id: 1, n2Id: 2, properties: { logic: 'XOR' } },
        { type: 'LED', n1Id: 2, n2Id: 3, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 3, n2Id: 4 },
        { type: 'WIRE', n1Id: 4, n2Id: 0 }
    ]
};

// Level 10: The Half Adder - XOR for Sum, AND for Carry
export const level10Solution: SerializedCircuit = {
    version: 1,
    nodes: [
        { id: 0, x: 100, y: 200 },   // Battery +
        { id: 1, x: 225, y: 200 },   // Junction to chips
        { id: 2, x: 350, y: 150 },   // XOR output (Sum)
        { id: 3, x: 350, y: 250 },   // AND output (Carry)
        { id: 4, x: 475, y: 150 },   // Sum LED end
        { id: 5, x: 475, y: 250 },   // Carry LED end
        { id: 6, x: 475, y: 350 },   // Ground junction
        { id: 7, x: 100, y: 350 }    // Battery -
    ],
    components: [
        { type: 'BATTERY', n1Id: 0, n2Id: 1, properties: { voltage: 9 } },
        { type: 'CHIP', n1Id: 1, n2Id: 2, properties: { logic: 'XOR' } },
        { type: 'CHIP', n1Id: 1, n2Id: 3, properties: { logic: 'AND' } },
        { type: 'LED', n1Id: 2, n2Id: 4, properties: { ledColor: 'green' } },
        { type: 'LED', n1Id: 3, n2Id: 5, properties: { ledColor: 'red' } },
        { type: 'WIRE', n1Id: 4, n2Id: 6 },
        { type: 'WIRE', n1Id: 5, n2Id: 6 },
        { type: 'WIRE', n1Id: 6, n2Id: 7 },
        { type: 'WIRE', n1Id: 7, n2Id: 0 }
    ]
};

// Export all solutions as an array matching LEVELS order
export const LEVEL_SOLUTIONS: SerializedCircuit[] = [
    level1Solution,
    level2Solution,
    level3Solution,
    level4Solution,
    level5Solution,
    level6Solution,
    level7Solution,
    level8Solution,
    level9Solution,
    level10Solution
];
