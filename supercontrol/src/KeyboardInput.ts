import { Input } from "./Input";

/**
 * Input class that monitors keys on the keyboard.
 * 
 * The `InputIdentifier` generic should be set to the `key` of key events that should be listened to:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
 */
export class KeyboardInput<InputIdentifier extends string> extends Input<InputIdentifier> {

    // TODO: How can we improve this class so mapping is possible? The InputIdentifier generic is too specific to allow us to
    // simply call register() again, but re-initializing a new KeyboardInput doesn't remove the old listeners without a cleanup function.

    getInitialValue(input: InputIdentifier): boolean {
        return false;
    }

    getActiveValue(input: InputIdentifier): boolean {
        return true;
    }

    register(input: InputIdentifier) {
        window.addEventListener("keydown", (event) => {
            if (event.key.toLowerCase() === input.toLowerCase()) {
                this.pressed[input] = true;
                this.resetExcept("pressed", input);
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key.toLowerCase() === input.toLowerCase()) {
                this.released[input] = true;
                this.resetExcept("released", input);
            }
        });
    }
}
