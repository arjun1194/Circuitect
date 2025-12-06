/**
 * Circuit Architect - Level Definitions
 * Comprehensive level content with descriptions, theory, and hints.
 * 
 * Note: 'check' functions now accept (components) as argument instead of importing global state.
 */

import { TYPES } from './gameConfig';

export const LEVELS = [
    {
        title: "1. The Closed Loop",
        desc: "Build your first circuit! Connect a Battery to an LED using Wires to create a complete loop. The current must flow from the battery's positive terminal (+) through the LED and back to the negative terminal (-).",
        theory: "Electricity requires a closed loop (circuit) to flow. Electrons move from high potential (+ terminal) to low potential (- terminal). This continuous flow is called electric current. The LED converts electrical energy into light when current passes through it. Without a complete loop, no current can flow - just like water needs a complete pipe system to circulate.",
        hints: [
            "Start by placing a Battery on the canvas - drag from one grid point to another",
            "Place an LED somewhere on the canvas, making sure it can connect to the battery",
            "Use Wires to connect the battery's positive terminal (gold end) to one side of the LED",
            "Complete the circuit by connecting the other side of the LED back to the battery's negative terminal (silver end)"
        ],
        check: (components) => components.some(c => c.type === TYPES.LED && c.param === 1)
    },
    {
        title: "2. Control with a Switch",
        desc: "Add control to your circuit! Build a circuit with a Battery, Switch, and LED. The switch should be able to turn the LED on and off. Click on a placed switch to toggle it.",
        theory: "A switch is a simple control device that can break (open) or complete (close) a circuit. When open, it creates an air gap that electrons cannot cross, stopping current flow. When closed, it acts like a wire, allowing current to pass. This is the fundamental principle behind all digital electronics - representing 0 (off) and 1 (on).",
        hints: [
            "Place a Battery on the canvas first",
            "Add a Switch component in series with your circuit",
            "Connect an LED after the switch",
            "Complete the loop back to the battery's negative terminal",
            "Click on the switch to toggle it on/off and control the LED"
        ],
        check: (components) => components.some(c => c.type === TYPES.LED && c.param === 1) &&
            components.some(c => c.type === TYPES.SWITCH)
    },
    {
        title: "3. Current Limiting Resistor",
        desc: "Protect your LED! In real circuits, LEDs can burn out from too much current. Add a Resistor in series with the LED to limit current flow. You can click on the resistor to adjust its value.",
        theory: "Ohm's Law states: V = I × R (Voltage = Current × Resistance). By adding resistance, you reduce the current flowing through the circuit. LEDs have a maximum current rating - exceeding it causes damage. A typical LED needs about 10-20mA of current. With a 9V battery and 2V LED voltage drop, you need approximately (9-2)/0.02 = 350Ω resistance to keep the LED safe.",
        hints: [
            "Start with a Battery connected to the circuit",
            "Add a Resistor (from the Passive category) in series - between the battery and LED",
            "Connect an LED after the resistor",
            "Complete the circuit back to the battery",
            "Click on the resistor to change its resistance value if needed"
        ],
        check: (components) => components.some(c => c.type === TYPES.RESISTOR) &&
            components.some(c => c.type === TYPES.LED && c.param === 1)
    },
    {
        title: "4. Parallel LEDs",
        desc: "Light up multiple LEDs! Connect two LEDs in parallel - this means they share the same connection points. Both LEDs should light up simultaneously.",
        theory: "In a parallel circuit, components share the same voltage across them but the current is divided. Each LED receives the full battery voltage (minus its voltage drop). This is how household electrical systems work - all outlets are in parallel, so each device gets the same voltage. The total current drawn equals the sum of currents through each branch.",
        hints: [
            "Place a Battery as your power source",
            "Add the first LED connected to the battery",
            "Add a second LED connected to the SAME nodes as the first LED",
            "Both LEDs should share connection points on both ends",
            "Complete the circuit - both LEDs will light up together"
        ],
        check: (components) => components.filter(c => c.type === TYPES.LED && c.param === 1).length >= 2
    },
    {
        title: "5. Understanding Capacitors",
        desc: "Explore energy storage! Place a Capacitor in your circuit. In DC circuits (like with batteries), capacitors block current flow once charged. They're like tiny rechargeable batteries.",
        theory: "Capacitors store electrical energy in an electric field between two conductive plates. In DC circuits, they charge up quickly and then block further current flow (acting as an open circuit). The capacitance value (measured in Farads, typically µF) determines how much charge they can store. Capacitors are essential for filtering, timing, and energy storage in electronics.",
        hints: [
            "Place a Battery on the canvas",
            "Add a Capacitor from the Passive category",
            "Connect the capacitor in your circuit",
            "Notice how the capacitor behaves in the simulation",
            "Try clicking on it to see and modify its capacitance value"
        ],
        check: (components) => components.some(c => c.type === TYPES.CAPACITOR)
    },
    {
        title: "6. Transistor as a Switch",
        desc: "Enter the world of semiconductors! Use an NPN Transistor to control an LED. The transistor has three terminals: Base (control), Collector (input), and Emitter (output). A small current at the base controls a larger current flow.",
        theory: "Transistors are semiconductor devices that can amplify or switch electronic signals. In an NPN transistor, when a small positive voltage is applied to the Base (relative to Emitter), it allows a much larger current to flow from Collector to Emitter. This is the foundation of all modern computing - billions of transistors switching on/off create the logic in your devices.",
        hints: [
            "Place a Battery as your power source",
            "Add an NPN Transistor from the Active category",
            "The transistor needs a control signal at its Base terminal",
            "Connect an LED to the Collector/Emitter path",
            "Apply voltage to the Base to turn on the transistor and light the LED"
        ],
        check: (components) => components.some(c => c.type === TYPES.TRANSISTOR) &&
            components.some(c => c.type === TYPES.LED && c.param === 1)
    },
    {
        title: "7. Building a NOT Gate (Inverter)",
        desc: "Create logic from transistors! Build an inverter circuit where the output is the opposite of the input. When input is HIGH, output should be LOW, and vice versa.",
        theory: "A NOT gate (inverter) is the simplest logic gate. It uses a transistor in a specific configuration: when the Base receives a HIGH signal, the transistor turns on, shorting the output to ground (LOW). When the Base is LOW, the transistor is off, and a pull-up resistor keeps the output HIGH. This inversion is fundamental to digital logic design.",
        hints: [
            "Place a Battery for power supply",
            "Add an NPN Transistor to the circuit",
            "The Collector should connect to the LED or output indicator",
            "The Emitter connects to ground (battery negative)",
            "Apply a signal to the Base and observe the inverted output"
        ],
        check: (components) => components.some(c => c.type === TYPES.TRANSISTOR)
    },
    {
        title: "8. AND Gate with Switches",
        desc: "Build combinational logic! Create an AND gate using two switches in series. The LED should only light when BOTH switches are closed (ON). Either switch OFF should turn off the LED.",
        theory: "An AND gate outputs HIGH only when ALL inputs are HIGH. With two switches in series, current can only flow when both switches complete the circuit. Truth table: 0,0→0 | 0,1→0 | 1,0→0 | 1,1→1. This is fundamental to computing - AND operations are used in everything from basic arithmetic to complex decision-making in processors.",
        hints: [
            "Place a Battery as power source",
            "Add the first Switch in the circuit",
            "Add a second Switch in SERIES (one after another)",
            "Connect an LED after both switches",
            "Complete the circuit - LED lights only when BOTH switches are ON"
        ],
        check: (components) => components.filter(c => c.type === TYPES.SWITCH).length >= 2
    },
    {
        title: "9. Using Logic Chips - XOR",
        desc: "Experience abstraction! Instead of building gates from transistors, use a Logic Chip. Program it to perform XOR (exclusive OR) operation. Click on the chip to change its logic type.",
        theory: "Abstraction is a powerful concept - instead of wiring individual transistors, we use pre-made chips that contain complex circuits inside. An XOR gate outputs HIGH when inputs are different (0,1 or 1,0) and LOW when they're the same (0,0 or 1,1). XOR is crucial for arithmetic (binary addition), encryption, and error detection.",
        hints: [
            "Place a Logic Chip from the Abstraction category",
            "Click on the chip to open its properties",
            "Change the Logic Type to 'XOR Gate (A ^ B)'",
            "Connect the chip to your circuit with inputs and output",
            "Test with different input combinations"
        ],
        check: (components) => components.some(c => c.type === TYPES.CHIP && c.logic === 'XOR')
    },
    {
        title: "10. The Half Adder",
        desc: "Build computation! Create a Half Adder using two logic chips: XOR for the Sum output and AND for the Carry output. This is the foundation of how computers perform addition!",
        theory: "A Half Adder adds two single bits and produces a Sum and a Carry. XOR gives the Sum (1+1=0 with carry, 1+0=1, 0+0=0), while AND gives the Carry (only 1 when both inputs are 1). Chaining half adders creates full adders, which build ripple-carry adders, which perform multi-bit arithmetic in CPUs. You're building the same logic inside every computer!",
        hints: [
            "You need TWO Logic Chips for this circuit",
            "First chip: Set to XOR - this calculates the Sum bit",
            "Second chip: Set to AND - this calculates the Carry bit",
            "Both chips should receive the same two input signals",
            "Connect outputs to LEDs to visualize Sum and Carry results"
        ],
        check: (components) => components.some(c => c.logic === 'XOR') &&
            components.some(c => c.logic === 'AND')
    }
];
