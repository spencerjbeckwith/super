import { Input } from "./Input";
import { keys, Keys } from "./KeyboardKeys";

/** Options object provided when initialzing KeyboardInput */
export interface KeyboardInputOptions<K extends readonly string[] = Keys[]> {
    /**
     * A list of keyboard keys this input should track the state of.
     * 
     * If not provided, a default list of the most common keys, including all letters, arrows, numbers, and control keys like space, enter,
     * shift, and escape are used.
     * 
     * Note that all keys are expected to begin with "Key" followed by the browser's `key` value. E.g. "KeyA", "KeyArrowLeft", or "KeyEscape".
     * The only exception to this is the space bar, which should be referred to as "KeySpace". This is because the browser's representation of the
     * space bar (" ") would be hard to use as an object property and look misleading.
     * 
     * It is highly recommended to use `as const` when defining your key array, so that TypeScript can infer input state attributes correctly.
     * Failing to get the inference right results in a worse developer experience and risk of embarassing typos.
     * 
     * More information about values for `key`, including all pre-defined values for control and special characters, can be found
     * [on MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
     */
    keys?: K;
}

/** Input class that monitors keys on the keyboard */
export class KeyboardInput<K extends readonly string[] = Keys[]> extends Input<K[number]> {
    constructor(options?: KeyboardInputOptions<K>) {
        super( [ ...(options?.keys ?? keys) ]); // Cloning the array gets around the `readonly` causing us problems.
        window.addEventListener("keydown", (event) => {
            for (const input of this.inputs) {
                let expectedInput = input.slice(3); // Cut off our "key" prefixes
                if (expectedInput === "Space") {
                    expectedInput = " "; // Correct our special handling of the space bar
                }
                if (event.key.toLowerCase() === expectedInput.toLowerCase()) {
                    this.pressed[input] = true;
                    this.resetExcept("pressed", input);
                }
            }
        });

        window.addEventListener("keyup", (event) => {
            // Follow the same formula as above.
            // I wonder if there's a way to make this DRYer?
            for (const input of this.inputs) {
                let expectedInput = input.slice(3);
                if (expectedInput === "Space") {
                    expectedInput = " ";
                }
                if (event.key.toLowerCase() === expectedInput.toLowerCase()) {
                    this.released[input] = true;
                    this.resetExcept("released", input);
                }
            }
        });
    }

    getInitialValue(input: typeof keys[number]): boolean {
        return false;
    }

    getActiveValue(input: typeof keys[number]): boolean {
        return true;
    }
}