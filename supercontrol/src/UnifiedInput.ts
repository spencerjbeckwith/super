import { KeyboardInput } from "./KeyboardInput";
import { MouseInput } from "./MouseInput";
import { GamepadInput } from "./GamepadInput";

/** Utility type that describes the keys of each input state on UnifiedInput. */
type InputStates<KeyboardKeys extends string> = {
    // KeyboardKeys is a generic passed in by the UnifiedInput class, specified when that class is initialized.
    pressed: keyof UnifiedInput<KeyboardKeys>["pressed"];
    held: keyof UnifiedInput<KeyboardKeys>["held"];
    released: keyof UnifiedInput<KeyboardKeys>["released"];
    idle: keyof UnifiedInput<KeyboardKeys>["idle"];
};

/**
 * Unifies KeyboardInput, MouseInput, and GamepadInput into one convenient interface.
 * 
 * Like its comprising Inputs, the `update()` method of this class must be called every frame.
 */
export class UnifiedInput<KeyboardKeys extends string> {

    /** Access point for more advanced keyboard input */
    keyboard: KeyboardInput<KeyboardKeys>;

    /** Access point for more advanced mouse input, such as checking mouse location or deltas */
    mouse: MouseInput;

    /** Access point for more advanced gamepad input, such as checking triggers or gamepad connection status */
    gamepad: GamepadInput;

    constructor(keyboardKeys: KeyboardKeys[], mouseReferenceFrame?: HTMLElement, gamepadAxisPressThreshold?: number, gamepadAxisDeadZone?: number) {
        this.keyboard = new KeyboardInput(keyboardKeys);
        this.mouse = new MouseInput(mouseReferenceFrame);
        this.gamepad = new GamepadInput(gamepadAxisPressThreshold, gamepadAxisDeadZone);
    }

    /** Checks the pressed state for keyboard, mouse, and gamepad input */
    get pressed() {
        // TODO: handle mapping here
        return {
            ...this.keyboard.pressed,
            ...this.mouse.pressed,
            ...this.gamepad.pressed,
        };
    }

    /** Checks the held state for keyboard, mouse, and gamepad input */
    get held() {
        // TODO: handle mapping here
        return {
            ...this.keyboard.held,
            ...this.mouse.held,
            ...this.gamepad.held,
        };
    }

    /** Checks the released state for keyboard, mouse, and gamepad input */
    get released() {
        // TODO: handle mapping here
        return {
            ...this.keyboard.released,
            ...this.mouse.released,
            ...this.gamepad.released,
        };
    }

    /** Checks the idle state for keyboard, mouse, and gamepad input */
    get idle() {
        // TODO: handle mapping here
        return {
            ...this.keyboard.idle,
            ...this.mouse.idle,
            ...this.gamepad.idle,
        };
    }

    /** Must be called *at the end* of every frame to update the underlying inputs */
    update() {
        this.keyboard.update();
        this.mouse.update();
        this.gamepad.update();
    }

    /**
     * Returns true if any listed input of the provided state is currently true.
     * 
     * This is very useful to check multiple inputs, especially from different sources, at once without needing boolean logic.
     */
    anyOf(state: "pressed" | "held" | "released" | "idle", inputs: InputStates<KeyboardKeys>[typeof state][]) {
        for (const input of inputs) {
            if (this[state][input]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if all of the listed inputs in the provided state are currently true.
     * 
     * There are two caveats to this function:
     * 
     * 1. Be very careful using the `pressed` or `released` states, since more than one input checked here would require a frame-perfect input,
     * which can be very difficult for a human to pull off at 60 frames per second.
     * 
     * 2. Be careful when using multiple input sources, such as keyboard and gamepad, with this function. If a gamepad is not connected this function
     * cannot return true. Furthermore, it would be unusual for a human to be using both the gamepad and the keyboard at the same time.
     */
    allOf(state: "pressed" | "held" | "released" | "idle", inputs: InputStates<KeyboardKeys>[typeof state][]) {
        for (const input of inputs) {
            if (!this[state][input]) {
                return false;
            }
        }
        return true;
    }

    // TODO: map() function
}