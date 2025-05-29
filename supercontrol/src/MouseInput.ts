import { Input } from "./Input";

/** Union type of mouse buttons recognized by the browser */
export type MouseButtons = "left" | "wheel" | "right" | "back" | "forward";

/** Options object provided when initialzing MouseInput */
export interface MouseInputOptions {

    /** The HTML element intended to be the target of mouse events */
    referenceFrame: HTMLElement;
}

/** Input class that tracks mouse movement, button, and wheel events. */
export class MouseInput extends Input<MouseButtons> {

    /** The HTML element intended to be the target of mouse events */
    referenceFrame: HTMLElement;

    /** 
     * A scale factor applied to the contents of the `referenceFrame`. 
     * 
     * If your program is small but scaled up, this X and Y should be kept in sync
     * with the current active scale of the program.
     * 
     * For example, a 320x240 canvas rendered in 960x720 should have `referenceFrameScale` `x` and `y` set to 3.
     * 
     * This is intended to keep mouse coordinates in the universe of the program instead of the webpage. This effects
     * mouse delta movement, but not mouse wheel deltas. Defaults both `x` and `y` to 1.
    */
    referenceFrameScale: {
        x: number;
        y: number;
    };

    /** Current X position of the mouse within the `referenceFrame`, divided by `referenceFrameScale.x` */
    x: number;

    /** Current Y position of the mouse within the `referenceFrame`, divided by `referenceFrameScale.y` */
    y: number;

    /** Change in the mouse X position since the last mouse event, divided by `referenceFrameScale.x` */
    deltaX: number;

    /** Change in the mouse Y position since the last mouse event, divided by `referenceFrameScale.y` */
    deltaY: number;

    /** Horizontal change applied to the mouse wheel since the last frame, if supported by the mouse */
    wheelDeltaX: number;

    /** Vertical change applied to the mouse wheel since the last frame */
    wheelDeltaY: number;

    /** Change on the Z-axis applied to the mouse wheel since the last frame, if supported by the mouse */
    wheelDeltaZ: number;

    constructor(options?: MouseInputOptions) {
        super(["left", "wheel", "right", "back", "forward"]);
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

        // Add listeners for mouse buttons
        this.referenceFrame.addEventListener("mousedown", (event) => {
            const buttonKey = this.inputs[event.button];
            this.pressed[buttonKey] = true;
            this.resetExcept("pressed", buttonKey);
        });

        this.referenceFrame.addEventListener("mouseup", (event) => {
            const buttonKey = this.inputs[event.button];
            this.released[buttonKey] = true;
            this.resetExcept("released", buttonKey);
        });

        // Add listener to update our mouse position
        this.referenceFrame.addEventListener("mousemove", (event) => {
            this.x = event.clientX / this.referenceFrameScale.x;
            this.y = event.clientY / this.referenceFrameScale.y;
            this.deltaX = event.movementX / this.referenceFrameScale.x;
            this.deltaY = event.movementY / this.referenceFrameScale.y;
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

    getInitialValue(input: MouseButtons): boolean {
        return false;
    }

    getActiveValue(input: MouseButtons): boolean {
        return true;
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

    /** Returns true if the current mouse position is within the rectangle made by the two provided points, inclusive. */
    isIn(x1: number, y1: number, x2: number, y2: number): boolean {
        return (this.x >= x1 && this.x <= x2 && this.y >= y1 && this.y <= y2);
    }
}