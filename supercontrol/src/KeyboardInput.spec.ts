import { KeyboardInput } from "./KeyboardInput";
import expect from "expect";

describe("KeyboardInput", () => {

    // To make tests more concise
    const pressKey = (key: string) => window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    const releaseKey = (key: string) => window.dispatchEvent(new KeyboardEvent("keyup", { key }));

    it("sets the pressed state for keys", () => {
        const k = new KeyboardInput();
        expect(k.pressed.KeyA).toBe(false);
        pressKey("a");
        expect(k.pressed.KeyA).toBe(true);
    });
    
    it("sets the released state for keys", () => {
        const k = new KeyboardInput();
        expect(k.released.KeyA).toBe(false);
        pressKey("a");
        expect(k.released.KeyA).toBe(false);
        releaseKey("a");
        expect(k.released.KeyA).toBe(true);
    });

    it("updates pressed to held state on update()", () => {
        const k = new KeyboardInput();
        pressKey("a");
        expect(k.held.KeyA).toBe(false);
        k.update();
        expect(k.pressed.KeyA).toBe(false);
        expect(k.held.KeyA).toBe(true);
        k.update();
        expect(k.held.KeyA).toBe(true);
        releaseKey("a");
        expect(k.held.KeyA).toBe(false);
    });

    it("updates released to idle state on update()", () => {
        const k = new KeyboardInput();
        pressKey("a");
        releaseKey("a");
        expect(k.released.KeyA).toBe(true);
        expect(k.idle.KeyA).toBe(false);
        k.update();
        expect(k.released.KeyA).toBe(false);
        expect(k.idle.KeyA).toBe(true);
        k.update();
        expect(k.idle.KeyA).toBe(true);
    });
});