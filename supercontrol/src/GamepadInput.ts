import { Input } from "./Input";

export type GamepadButtons =
    "button0" |
    "button1" |
    "button2" |
    "button3" |
    "leftBumper" |
    "rightBumper" |
    "leftTrigger" |
    "rightTrigger" |
    "select" |
    "start" |
    "leftJoystick" |
    "rightJoystick" |
    "dpadUp" |
    "dpadLeft" |
    "dpadRight" |
    "dpadDown" |
    "center" |
    "leftAxisLeft" |
    "leftAxisRight" |
    "leftAxisUp" | 
    "leftAxisDown" |
    "rightAxisLeft" | 
    "rightAxisRight" |
    "rightAxisUp" | 
    "rightAxisDown";
// Reference for button indices: https://www.w3.org/TR/gamepad/#remapping

/**
 * Input class that tracks a gamepad, if one is connected to the browser. Gamepads are assumed to have two joysticks, two triggers, two bumpers, a D-pad,
 * four face buttons, start, select, and a central button - the "standard" layout.
 * 
 * In addition, this class adds eight "virtual" buttons - `leftAxisUp`, `leftAxisRight`, `rightAxisDown`, etc. which indicate if an axis was moved
 * in a direction this frame. This enables the use of the joysticks as main directional input in situations where the precision of the decimal value
 * is not necessary. This is intended to simplify logic while integrating a gamepad as a control option, alongside keyboard/mouse.
 * 
 * Similarly, the trigger values are tracked by `leftTrigger` and `rightTrigger` as the analog values are more accurate than the pressed state of the buttons.
 * 
 * Disconnected gamepads will set the state for each input to `null`, but the `leftTrigger` and `rightTrigger` properties and the `getAxis()` method
 * will return 0 instead. In situations where determining the connected state of the gamepad is important, check the `gamepad` property.
 * 
 * #### Limitations
 * 
 * - This only accounts for one gamepad and assumes only one is connected at a time. If a user has more than one gamepad connected,
 * they may need to disconnect the gamepads they don't want to use. This also means local multiplayer using gamepads isn't currently supported by this class.
 * - This is only compatible with the "standard" layout mapping, as described [in the w3 spec](https://www.w3.org/TR/gamepad/#remapping).
 */
export class GamepadInput extends Input<GamepadButtons, boolean | null> {

    /** The raw gamepad object from the browser. Set to null if no gamepad is connected. */
    gamepad: Gamepad | null;

    /** The threshold that must be passed for directional axis "presses". */
    axisPressThreshold: number;

    /** The deadzone within which an axis value should be counted as zero. */
    axisDeadZone: number;

    /** The current value of the left trigger of the gamepad, or 0 if none is connected. */
    leftTrigger: number;

    /** The current value of the right trigger of the gamepad, or 0 if none is connected. */
    rightTrigger: number;

    constructor(axisPressThreshold = 0.35, axisDeadZone = 0.1) {
        super([
            "button0",
            "button1",
            "button2",
            "button3",
            "leftBumper",
            "rightBumper",
            "leftTrigger",
            "rightTrigger",
            "select",
            "start",
            "leftJoystick",
            "rightJoystick",
            "dpadUp",
            "dpadLeft",
            "dpadRight",
            "dpadDown",
            "center",
            "leftAxisLeft",
            "leftAxisRight",
            "leftAxisUp",
            "leftAxisDown",
            "rightAxisLeft",
            "rightAxisRight",
            "rightAxisUp",
            "rightAxisDown",
        ]);

        this.gamepad = null;
        this.axisPressThreshold = axisPressThreshold;
        this.axisDeadZone = axisDeadZone;
        this.leftTrigger = 0;
        this.rightTrigger = 0;
        this.reset();
        window.addEventListener("gamepadconnected", (event) => {
            this.set(event.gamepad);
        });
        window.addEventListener("gamepaddisconnected", () => {
            this.reset();
        });
    }

    /** Initializes the gamepad and sets all states to idle. */
    set(gamepad: Gamepad) {
        this.gamepad = gamepad;
        this.leftTrigger = 0;
        this.rightTrigger = 0;
        for (const input of this.inputs) {
            this.pressed[input] = false;
            this.held[input] = false;
            this.released[input] = false;
            this.idle[input] = true;
        }
    }

    /** Uninitializes the gamepad and sets all states to null. */
    reset() {
        this.gamepad = null;
        this.leftTrigger = 0;
        this.rightTrigger = 0;
        for (const input of this.inputs) {
            this.pressed[input] = null;
            this.held[input] = null;
            this.released[input] = null;
            this.idle[input] = null;
        }
    }

    getActiveValue(input: GamepadButtons) {
        return true;
    }

    getInitialValue(input: GamepadButtons) {
        return false;
    }

    /** 
     * A convenience method to obtain the current value of a gamepad axis, accounting for the dead zone.
     * 
     * Returns 0 if no gamepad is connected.
     */
    getAxis(stick: "left" | "right", axis: "x" | "y"): number {
        if (!this.gamepad) return 0;
        const axisIndex = Number(stick === "right") * 2 + Number(axis === "y");

        // Don't allow checking on axes that might not exist
        if (axisIndex >= this.gamepad.axes.length) return 0;

        const axisValue = this.gamepad.axes[axisIndex];
        if (Math.abs(axisValue) < this.axisDeadZone) {
            return 0;
        }
        return axisValue;
    }

    /** 
     * Must be called every frame to update the input statuses from the gamepad, regardless of if one is connected.
     * 
     * Unlike other input classes, gamepad updates are not fired as events, so they must be monitored on each frame.
    */
    update() {
        super.update(); // Default behavior will transition all our inputs from pressed -> held and from released -> idle
        if (this.gamepad) {
            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.inputs[i];
                if (i < 17) {
                    // For first 17 inputs, query gamepad button to see if we should set it as pressed
                    if (this.idle[input] && this.gamepad.buttons[i].pressed) {
                        this.idle[input] = false;
                        this.pressed[input] = true;
                    }
                    if (this.held[input] && !this.gamepad.buttons[i].pressed) {
                        this.held[input] = false;
                        this.released[input] = true;
                    }
                } else {
                    // Check each axis direction to see if it is past our threshold or not
                    // Inputs are ordered such that we can check them sequentially like this
                    const a = i - 17;
                    const axisIndex = Math.floor(a / 2);
                    const sign = (a % 2) * 2 - 1

                    // Skip if our gamepad has fewer axes than expected
                    if (axisIndex >= this.gamepad.axes.length) continue;

                    const axisValue = this.gamepad.axes[axisIndex];
                    if (this.idle[input] && Math.abs(axisValue) >= this.axisPressThreshold && sign === Math.sign(axisValue)) {
                        this.idle[input] = false;
                        this.pressed[input] = true;
                    }
                    if (this.held[input] && ((Math.abs(axisValue) < this.axisPressThreshold && (sign === Math.sign(axisValue) || axisValue === 0)) || (sign === -1 * Math.sign(axisValue)))) {
                        // unset if the axis value is on the opposite side of zero than where it is expected
                        // how do we express this in terms of the sign of axisValue?
                        this.held[input] = false;
                        this.released[input] = true;
                    }
                }
            }

            // Update triggers (using value instead of pressed)
            this.leftTrigger = this.gamepad.buttons[6].value;
            this.rightTrigger = this.gamepad.buttons[7].value;
        }
    }
}