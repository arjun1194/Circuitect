import { AbstractComponent, CircuitNode } from './Physics';
import { TYPES, ComponentType } from '../config/gameConfig';
import { Wire, Resistor, Switch, Capacitor } from './components/BasicComponents';
import { Battery, LED, Transistor, LogicChip } from './components/AdvancedComponents';

export class ComponentFactory {
    static create(type: ComponentType, n1: CircuitNode, n2: CircuitNode): AbstractComponent {
        switch (type) {
            case TYPES.WIRE: return new Wire(n1, n2);
            case TYPES.RESISTOR: return new Resistor(n1, n2);
            case TYPES.SWITCH: return new Switch(n1, n2);
            case TYPES.CAPACITOR: return new Capacitor(n1, n2);
            case TYPES.BATTERY: return new Battery(n1, n2);
            case TYPES.LED: return new LED(n1, n2);
            case TYPES.TRANSISTOR: return new Transistor(n1, n2);
            case TYPES.CHIP: return new LogicChip(n1, n2);
            default:
                console.warn(`Unknown component type: ${type}, defaulting to Wire`);
                return new Wire(n1, n2);
        }
    }
}
