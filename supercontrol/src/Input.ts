/** Unique class for errors working with the base Input class */
export class InputError extends Error {};

/**
 * Parent class of different types of Input.
 * 
 * This is designed in a way to be very type-friendly and help avoid simple typos. Each input can be in one of four states:
 * - pressed: the frame when the input is first pressed down. For example, a key on a keyboard or a gamepad button.
 * - held: every frame between when the input is first pressed to when it is released.
 * - released: the frame when the input is let go of
 * - idle: every frame the input is not pressed, held, or released.
 * 
 * Ideally, every input should only be in one of these states at a time. This is determined by the event listeners that should be assigned by
 * an overridden `register()` method, and updated every frame via the `update()` method.
 * 
 * Subclassing this requires a few important steps:
 * 
 * 1. The `InputIdentifier` type generic should be set to a union of strings to use as your identifiers.
 * These become the different keys of the `held`, `idle`, etc. properties and allow autocomplete to know what inputs you care about,
 * instead of using an index signature that wouldn't catch if an input is forgotten and misspelled.
 * Depending on the inputs you want to watch, you may use something like `"down" | "right" | "up" | "left"`.
 * 
 * 2. Override the `getInitialValue()` method. The second generic to this class, `InputData`, indicates the type that should be stored
 * by each state of each `InputIdentifier`. Typically this would be a simple boolean, though for mouse, touch, or other types of complex input,
 * an object could be used here to store an X and Y coordinate, or a union with `null`, for example.
 * 
 * 3. Override the `getActiveValue()` method. This sets the idle state for every input to a value considered active by the chosen `InputData` type,
 * which is the expected state when the class is first initialized.
 * 
 * 3. Override the `register()` method. This is called once for every `InputIdentifier` provided when initializing the class.
 * This is the method that is expected to add event listeners to the window or document that should update the `pressed`, `held`, `released`,
 * and `idle` properties for each input. For example, a keyboard input class may add keydown and keyup event listeners, while a mouse input class
 * may add mousemove, mousedown, and mouseup event listeners.
 * 
 * 4. If necessary, override the `update()` method. This method is responsible for updating the state of each input, such as moving inputs from the pressed
 * state into the held state. This behavior may not be necessary for all types of input. Also note that this lifecycle, by default, assumes that an input
 * is "active" if the `InputData` value is truthy.
 * 
 * When using an Input subclass, ensure that the `update()` method is called at the end of every frame to ensure the proper state lifecycle takes place.
 */

// Ways to potentially improve this class:
// - Restructure to use an event queue from the event listeners, so that no events can "slip through the cracks" at all
// - Add a deregister method to clean everything up
// - Find a way to "cache" the initial value so that resetting to initial values doesn't become too costly

export class Input<InputIdentifier extends string, InputData = boolean> {

    /** Record of all `InputIdentifier`s with their current pressed state. This state lasts for one frame. */
    pressed: Record<InputIdentifier, InputData>;

    /**
     * Record of all `InputIdentifier`s with their current held state. This state may persist for as long as the input is held.
     * 
     * Some situations, such as clicking out of a webpage, may leave this state active until the input is pressed again.
     */
    held: Record<InputIdentifier, InputData>;

    /** Record of all `InputIdentifier`s with their current released state. This state lasts for one frame. */
    released: Record<InputIdentifier, InputData>;

    /** 
     * Record of all `InputIdentifier`s with their current idle state. This state lasts until the input is activated again. 
     * 
     * Note that the idle state may remain uninitialized until an input has been activated at least once, unless a subclass explicitly initializes it.
    */
    idle: Record<InputIdentifier, InputData>;

    /** Array of all identifiers used by this instance */
    inputs: InputIdentifier[];

    constructor(inputs: InputIdentifier[]) {
        this.inputs = inputs;
        this.pressed = {} as Record<InputIdentifier, InputData>;
        this.held = {} as Record<InputIdentifier, InputData>;
        this.released = {} as Record<InputIdentifier, InputData>;
        this.idle = {} as Record<InputIdentifier, InputData>;

        this.#initializeState("pressed");
        this.#initializeState("held");
        this.#initializeState("released");
        this.#initializeState("idle", true);

        for (const input of this.inputs) {
            this.register(input);
        }
    }

    /** Initializes the provided state with the input's initial value */
    #initializeState(state: "pressed" | "held" | "released" | "idle", active = false) {
        this[state] = this.inputs.reduce((previous, current) => {
            previous[current] = active ? this.getActiveValue(current) : this.getInitialValue(current);
            return previous;
        }, {} as Record<InputIdentifier, InputData>);
    }

    /** Returns the initial `InputData` value that should be set to all states of all inputs (except idle) by default. Must be overridden in child classes. */
    getInitialValue(input: InputIdentifier): InputData {
        throw new InputError("Input subclasses must define getInitialValue(), getActiveValue(), and register().")
    }

    /** Returns the initial active `InputData` value that is set to the idle state of all inputs. Must be overridden in child classes. */
    getActiveValue(input: InputIdentifier): InputData {
        throw new InputError("Input subclasses must define getInitialValue(), getActiveValue(), and register().")
    }

    /** Registers all event listeners or callbacks that actually update the states of each input. Must be overridden in child classes. */
    register(input: InputIdentifier) {
        throw new InputError("Input subclasses must define getInitialValue(), getActiveValue(), and register().")
    }

    /** Resets all states of the provided input, except for the one provided. This should be used by subclasses to help keep the state valid. */
    resetExcept(keep: "pressed" | "held" | "released" | "idle", input: InputIdentifier) {
        for (const state of ["pressed", "held", "released", "idle"] as const) {
            if (state !== keep) {
                this[state][input] = this.getInitialValue(input);
            }
        }
    }

    /** 
     * Updates the states of all inputs as necessary by the subclass. This is expected to be called every frame of your program, *after* your frame logic completes.
     * 
     * By default, this moves all values from the pressed state into the held state, and all values from the released state into the idle state.
     * 
     * Ideally, this should be called as close to the actual input checks as possible. In theory, it could be possible for pressed or released inputs to get
     * lost if the event fires *after* the logic checks the inputs but *before* update is called.
     */
    update() {
        for (const input of this.inputs) {
            // Released inputs become idle
            if (this.released[input]) {
                this.idle[input] = this.released[input];
                this.resetExcept("idle", input);
            }

            // Pressed inputs become held
            if (this.pressed[input]) {
                this.held[input] = this.pressed[input];
                this.resetExcept("held", input);
            }
        }
    }
}
