import { KeyboardInput } from "./KeyboardInput";
import expect from "expect";

describe("KeyboardInput", () => {

    // To make tests more concise
    const pressKey = (key: string) => window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    const releaseKey = (key: string) => window.dispatchEvent(new KeyboardEvent("keyup", { key }));

    it("sets the pressed state for keys", () => {
        const k = new KeyboardInput();
        expect(k.pressed.keyA).toBe(false);
        pressKey("a");
        expect(k.pressed.keyA).toBe(true);
    });
    
    it("sets the released state for keys", () => {
        const k = new KeyboardInput();
        expect(k.released.keyA).toBe(false);
        pressKey("a");
        expect(k.released.keyA).toBe(false);
        releaseKey("a");
        expect(k.released.keyA).toBe(true);
    });

    it("updates pressed to held state on update()", () => {
        const k = new KeyboardInput();
        pressKey("a");
        expect(k.held.keyA).toBe(false);
        k.update();
        expect(k.pressed.keyA).toBe(false);
        expect(k.held.keyA).toBe(true);
        k.update();
        expect(k.held.keyA).toBe(true);
        releaseKey("a");
        expect(k.held.keyA).toBe(false);
    });

    it("updates released to idle state on update()", () => {
        const k = new KeyboardInput();
        pressKey("a");
        releaseKey("a");
        expect(k.released.keyA).toBe(true);
        expect(k.idle.keyA).toBe(false);
        k.update();
        expect(k.released.keyA).toBe(false);
        expect(k.idle.keyA).toBe(true);
        k.update();
        expect(k.idle.keyA).toBe(true);
    });
});