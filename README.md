# Circuitect

Circuitect is an interactive digital logic and circuit design game built with React and Vite. It allows users to build, test, and simulate electronic circuits using a variety of components.

## Features

-   **Interactive Circuit Building:** Drag and drop components like Batteries, Resistors, LEDs, Switches, Transistors (NPN), and Logic Chips (AND, OR, NOT).
-   **Simulation:** Real-time simulation of circuit physics including voltage, current, and logic states.
-   **Level System:** Progressive levels with specific challenges and goals.
-   **Tools:**
    -   **Wire Tool:** Connect components.
    -   **Select/Edit Tool:** Modify component properties.
    -   **Eraser:** Remove components.
-   **Save/Load:** Export and import your circuit designs as JSON.
-   **Undo/Redo:** Easily correct mistakes.

## Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Styling:** Tailwind CSS
-   **State Management:** React Hooks
-   **Icons:** Lucide React

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd circuitect
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## License

[MIT](LICENSE)