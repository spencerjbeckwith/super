import { KeyboardInput } from "./KeyboardInput";
import expect from "expect";

describe("KeyboardInput", () => {

    // To make tests more concise
    const pressKey = (key: string) => window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    const releaseKey = (key: string) => window.dispatchEvent(new KeyboardEvent("keyup", { key }));

    it("sets the pressed state for watched keys", () => {
        const k = new KeyboardInput<"a">(["a"]);
        expect(k.pressed.a).toBe(false);
        pressKey("a");
        expect(k.pressed.a).toBe(true);
    });
    
    it("sets the released state for watched keys", () => {
        const k = new KeyboardInput<"a">(["a"]);
        expect(k.released.a).toBe(false);
        pressKey("a");
        expect(k.released.a).toBe(false);
        releaseKey("a");
        expect(k.released.a).toBe(true);
    });

    it("doesn't update keys that are not watched", () => {
        const k = new KeyboardInput<"a" | "b">(["a", "b"]);
        pressKey("c");
        expect(k.pressed.a).toBe(false);
        expect(k.pressed.b).toBe(false);
    });

    it("updates pressed to held state on update()", () => {
        const k = new KeyboardInput<"a">(["a"]);
        pressKey("a");
        expect(k.held.a).toBe(false);
        k.update();
        expect(k.pressed.a).toBe(false);
        expect(k.held.a).toBe(true);
        k.update();
        expect(k.held.a).toBe(true);
        releaseKey("a");
        expect(k.held.a).toBe(false);
    });

    it("updates released to idle state on update()", () => {
        const k = new KeyboardInput<"a">(["a"]);
        pressKey("a");
        releaseKey("a");
        expect(k.released.a).toBe(true);
        expect(k.idle.a).toBe(false);
        k.update();
        expect(k.released.a).toBe(false);
        expect(k.idle.a).toBe(true);
        k.update();
        expect(k.idle.a).toBe(true);
    });
});