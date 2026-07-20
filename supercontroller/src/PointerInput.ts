import { Input } from "./Input";

/**
 * Union type of pointer buttons recognized by the browser.
 *
 * These names are retained from the original mouse-only implementation. Touch and pen
 * contacts report button 0, and so are tracked as `mouseLeft`.
 */
export type PointerButtons =
    | "mouseLeft"
    | "mouseWheel"
    | "mouseRight"
    | "mouseBack"
    | "mouseForward";

/** The kind of device that produced a pointer event. */
export type PointerType = "mouse" | "pen" | "touch";

/** Options object provided when initializing PointerInput */
export interface PointerInputOptions {
    /** The HTML element intended to be the target of pointer events */
    referenceFrame?: HTMLElement;
}

/**
 * Input class that tracks pointer movement, button, and wheel events.
 *
 * This unifies mouse, touch, and pen input via the browser's Pointer Events API. Only the
 * primary pointer is tracked - secondary contacts from multi-touch gestures are ignored.
 */
export class PointerInput extends Input<PointerButtons> {
    /** The HTML element intended to be the target of pointer events */
    referenceFrame: HTMLElement;

    /**
     * A scale factor applied to the contents of the `referenceFrame`.
     *
     * If your program is small but scaled up, this X and Y should be kept in sync
     * with the current active scale of the program.
     *
     * For example, a 320x240 canvas rendered in 960x720 should have `referenceFrameScale` `x` and `y` set to 3.
     *
     * This is intended to keep pointer coordinates in the universe of the program instead of the webpage. This effects
     * pointer delta movement, but not mouse wheel deltas. Defaults both `x` and `y` to 1.
     */
    referenceFrameScale: {
        x: number;
        y: number;
    };

    /** Current X position of the pointer within the `referenceFrame`, divided by `referenceFrameScale.x` */
    x: number;

    /** Current Y position of the pointer within the `referenceFrame`, divided by `referenceFrameScale.y` */
    y: number;

    /** Change in the pointer X position since the last pointer event, divided by `referenceFrameScale.x` */
    deltaX: number;

    /** Change in the pointer Y position since the last pointer event, divided by `referenceFrameScale.y` */
    deltaY: number;

    /** Horizontal change applied to the mouse wheel since the last frame, if supported by the mouse */
    wheelDeltaX: number;

    /** Vertical change applied to the mouse wheel since the last frame */
    wheelDeltaY: number;

    /** Change on the Z-axis applied to the mouse wheel since the last frame, if supported by the mouse */
    wheelDeltaZ: number;

    /**
     * The device type of the most recent pointer event: `"mouse"`, `"pen"`, or `"touch"`.
     *
     * This is `null` until the first pointer event is received. Use it to tailor behavior to the
     * input source, such as showing touch controls when the last interaction was a touch.
     */
    pointerType: PointerType | null;

    /**
     * Last projected position, used as the reference point for computing movement deltas.
     *
     * Deltas are derived from this instead of the event's `movementX`/`movementY`, which are
     * unreliable for touch and pen. These are `null` until a position has been established.
     */
    #lastX: number | null;
    #lastY: number | null;

    constructor(options?: PointerInputOptions) {
        super(["mouseLeft", "mouseWheel", "mouseRight", "mouseBack", "mouseForward"]);
        this.referenceFrame = options?.referenceFrame ?? document.body;
        this.referenceFrameScale = {
            x: 1,
            y: 1,
        };
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.wheelDeltaX = 0;
        this.wheelDeltaY = 0;
        this.wheelDeltaZ = 0;
        this.pointerType = null;
        this.#lastX = null;
        this.#lastY = null;

        // Prevent the browser from claiming touch gestures (scroll, pinch-zoom) for itself,
        // which would otherwise cancel our pointer stream on touch devices.
        this.referenceFrame.style.touchAction = "none";

        // Add listeners for pointer buttons
        this.referenceFrame.addEventListener("pointerdown", (event) => {
            if (!event.isPrimary) return;
            this.pointerType = event.pointerType as PointerType;

            // Keep receiving move and up events even if the pointer leaves the element.
            // Guarded because jsdom (and very old browsers) may not implement pointer capture.
            this.referenceFrame.setPointerCapture?.(event.pointerId);

            // Anchor the delta reference to the contact point, so the next move is measured
            // from here. This keeps a fresh touch from producing a jump off the previous one.
            this.#anchor(event);

            const buttonKey = this.inputs[event.button];
            if (buttonKey) {
                this.pressed[buttonKey] = true;
                this.resetExcept("pressed", buttonKey);
            }
        });

        this.referenceFrame.addEventListener("pointerup", (event) => {
            if (!event.isPrimary) return;
            this.pointerType = event.pointerType as PointerType;
            this.referenceFrame.releasePointerCapture?.(event.pointerId);

            const buttonKey = this.inputs[event.button];
            if (buttonKey) {
                this.released[buttonKey] = true;
                this.resetExcept("released", buttonKey);
            }
        });

        // When the browser takes over the pointer (e.g. a scroll gesture or palm rejection), it
        // fires pointercancel instead of pointerup. Release any active buttons so they don't stick.
        this.referenceFrame.addEventListener("pointercancel", (event) => {
            if (!event.isPrimary) return;
            this.pointerType = event.pointerType as PointerType;
            this.referenceFrame.releasePointerCapture?.(event.pointerId);

            for (const input of this.inputs) {
                if (this.pressed[input] || this.held[input]) {
                    this.released[input] = true;
                    this.resetExcept("released", input);
                }
            }
        });

        // Add listener to update our pointer position
        this.referenceFrame.addEventListener("pointermove", (event) => {
            if (!event.isPrimary) return;
            this.pointerType = event.pointerType as PointerType;

            const { x, y } = this.#project(event);
            // Only report a delta once we have a prior reference, to avoid a jump on the first move.
            if (this.#lastX !== null && this.#lastY !== null) {
                this.deltaX = x - this.#lastX;
                this.deltaY = y - this.#lastY;
            }
            this.x = x;
            this.y = y;
            this.#lastX = x;
            this.#lastY = y;
        });

        // Add listener for scrolling the wheel
        this.referenceFrame.addEventListener("wheel", (event) => {
            this.wheelDeltaX = event.deltaX;
            this.wheelDeltaY = event.deltaY;
            this.wheelDeltaZ = event.deltaZ;
        });

        // Remove context menu interaction
        this.referenceFrame.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }

    /** Projects a pointer event's client coordinates into the reference frame's scaled coordinate space. */
    #project(event: PointerEvent): { x: number; y: number } {
        const rect = this.referenceFrame.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / this.referenceFrameScale.x,
            y: (event.clientY - rect.top) / this.referenceFrameScale.y,
        };
    }

    /** Sets the current position and delta reference to a pointer event without producing a delta. */
    #anchor(event: PointerEvent) {
        const { x, y } = this.#project(event);
        this.x = x;
        this.y = y;
        this.#lastX = x;
        this.#lastY = y;
    }

    update() {
        super.update();

        // Reset deltas for the next frame
        this.deltaX = 0;
        this.deltaY = 0;
        this.wheelDeltaX = 0;
        this.wheelDeltaY = 0;
        this.wheelDeltaZ = 0;
    }

    /** Returns true if the current pointer position is within the rectangle made by the two provided points, inclusive. */
    isIn(x1: number, y1: number, x2: number, y2: number): boolean {
        return this.x >= x1 && this.x <= x2 && this.y >= y1 && this.y <= y2;
    }
}

// Backwards-compatible aliases from when this class was mouse-only. `PointerInput` is a
// superset of the old `MouseInput`, so existing code keeps working under the old names.

export { PointerInput as MouseInput };

/** @deprecated Use `PointerInputOptions` */
export type MouseInputOptions = PointerInputOptions;

/** @deprecated Use `PointerButtons` */
export type MouseButtons = PointerButtons;
