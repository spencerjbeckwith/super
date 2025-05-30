import { GamepadInput } from "./GamepadInput";
import { expect } from "expect";

describe("GamepadInput", () => {

    // Needed to simulate gamepad events in a browser
    class GamepadEvent extends window.Event {
        // Why extends window.Event is needed: https://github.com/jsdom/jsdom/issues/3331
        // Because Event !== window.Event
        gamepad: Gamepad | null;
        constructor(eventType: "gamepadconnected" | "gamepaddisconnected", gamepad: Gamepad | null = null) {
            super(eventType);
            this.gamepad = gamepad;
        }
    }

    // Initializes a gamepad input and connects a virtual gamepad to it
    function initGamepad(gamepad: Partial<Gamepad>) {
        const g = new GamepadInput();
        window.dispatchEvent(new GamepadEvent("gamepadconnected", gamepad as Gamepad));
        return g;
    }

    // Populates an array of 17 inactive gamepad buttons
    function makeButtonArray() {
        let arr: GamepadButton[] = [];
        for (let i = 0; i <= 16; i ++) {
            arr[i] = {
                pressed: false,
                touched: false,
                value: 0,
            };
        }
        return arr;
    }

    it("is set and unset on events", () => {
        const g = new GamepadInput();
        expect(g.gamepad).toBeNull();
        window.dispatchEvent(new GamepadEvent("gamepadconnected", {} as Gamepad ));
        expect(g.gamepad).not.toBeNull();
        window.dispatchEvent(new GamepadEvent("gamepaddisconnected"));
        expect(g.gamepad).toBeNull();
    });

    it("returns correct axis values", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0.25, 0.5, -0.25, -0.5],
        }
        const g = initGamepad(gamepad);
        expect(g.getAxis("left", "x")).toBe(0.25);
        expect(g.getAxis("left", "y")).toBe(0.5);
        expect(g.getAxis("right", "x")).toBe(-0.25);
        expect(g.getAxis("right", "y")).toBe(-0.5);
    });

    it("returns zero for axis value within the axis deadzone", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0.05, 0.09, -0.05, -0.09],
        }
        const g = initGamepad(gamepad);
        expect(g.getAxis("left", "x")).toBe(0);
        expect(g.getAxis("left", "y")).toBe(0);
        expect(g.getAxis("right", "x")).toBe(0);
        expect(g.getAxis("right", "y")).toBe(0);
    });

    it("returns zero for axes that don't exist", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0.6, 0.7],
        }
        const g = initGamepad(gamepad);
        expect(g.getAxis("left", "x")).toBe(0.6);
        expect(g.getAxis("left", "y")).toBe(0.7);
        expect(g.getAxis("right", "x")).toBe(0);
        expect(g.getAxis("right", "y")).toBe(0);
    });

    it("returns zero for axes with no gamepad connected", () => {
        const g = new GamepadInput();
        expect(g.getAxis("left", "x")).toBe(0);
    });

    it("transitions button states correctly", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0, 0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        g.update();
        expect(g.pressed.gpButton0).toBe(false);
        // @ts-ignore
        gamepad.buttons![0].pressed = true;
        g.update();
        expect(g.pressed.gpButton0).toBe(true);
        g.update();
        expect(g.pressed.gpButton0).toBe(false);
        expect(g.held.gpButton0).toBe(true);
        // @ts-ignore
        gamepad.buttons![0].pressed = false;
        g.update();
        expect(g.held.gpButton0).toBe(false);
        expect(g.released.gpButton0).toBe(true);
        g.update();
        expect(g.released.gpButton0).toBe(false);
        expect(g.idle.gpButton0).toBe(true);
    });

    it("transitions axis press states correctly", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0, 0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        // @ts-ignore
        gamepad.axes![0] = -1;
        g.update();
        expect(g.pressed.gpLeftAxisLeft).toBe(true);
        g.update();
        expect(g.pressed.gpLeftAxisLeft).toBe(false);
        expect(g.held.gpLeftAxisLeft).toBe(true);
        // @ts-ignore
        gamepad.axes![0] = 0;
        g.update();
        expect(g.held.gpLeftAxisLeft).toBe(false);
        expect(g.released.gpLeftAxisLeft).toBe(true);
        g.update();
        expect(g.released.gpLeftAxisLeft).toBe(false);
        expect(g.idle.gpLeftAxisLeft).toBe(true);
    });

    it("doesn't transition axis press states on axes that don't exist", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        g.update();
        expect(g.pressed.gpRightAxisLeft).toBe(false);
    });

    it("unsets held states on axes that bounce across zero when released", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        // @ts-ignore
        gamepad.axes![0] = -1;
        g.update();
        g.update();
        expect(g.held.gpLeftAxisLeft).toBe(true);
        // @ts-ignore
        gamepad.axes![0] = 0.5;
        g.update();
        expect(g.held.gpLeftAxisLeft).toBe(false);
        expect(g.released.gpLeftAxisLeft).toBe(true);
    });

    it("clamps axes to 1 length", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0, 0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        // @ts-ignore
        gamepad.axes![0] = 1;
        // @ts-ignore
        gamepad.axes![1] = 1;
        expect(g.getAxis("left", "x")).toBeCloseTo(Math.sqrt(0.5));
        expect(g.getAxis("left", "y")).toBeCloseTo(Math.sqrt(0.5));
    });

    it("updates trigger values on button trigger mode", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0, 0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        // @ts-ignore
        gamepad.buttons[6].value = 0.66;
        // @ts-ignore
        gamepad.buttons[7].value = 0.77;
        g.update();
        expect(g.leftTrigger).toBe(0.66);
        expect(g.rightTrigger).toBe(0.77);
    });

    it("updates trigger values on axis trigger mode", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0, 0, 0, 0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        // @ts-ignore
        gamepad.axes[4] = 0.66;
        // @ts-ignore
        gamepad.axes[5] = 0.77;
        g.update();
        expect(g.leftTrigger).toBe(0.66);
        expect(g.rightTrigger).toBe(0.77);
    });

    it("transitions trigger button states correctly on axis trigger mode", () => {
        const gamepad: Partial<Gamepad> = {
            axes: [0, 0, 0, 0, 0, 0],
            buttons: makeButtonArray(),
        }
        const g = initGamepad(gamepad);
        g.update();
        expect(g.pressed.gpLeftTrigger).toBe(false);
        // @ts-ignore
        gamepad.axes![4] = 1;
        g.update();
        expect(g.pressed.gpLeftTrigger).toBe(true);
        g.update();
        expect(g.pressed.gpLeftTrigger).toBe(false);
        expect(g.held.gpLeftTrigger).toBe(true);
        // @ts-ignore
        gamepad.axes![4] = -1;
        g.update();
        expect(g.held.gpLeftTrigger).toBe(false);
        expect(g.released.gpLeftTrigger).toBe(true);
        g.update();
        expect(g.released.gpLeftTrigger).toBe(false);
        expect(g.idle.gpLeftTrigger).toBe(true);
    });
});