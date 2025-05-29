import { UnifiedInput } from "./UnifiedInput";
import { expect } from "expect";
import sinon from "sinon";

describe("UnifiedInput", () => {

    it("returns the correct merged object for all states", () => {
        // Yeah, UI should certainly not be our usual abbreviation for this class...
        const ui = new UnifiedInput();
        expect(ui.pressed.KeyShift).not.toBeUndefined();
        expect(ui.held.left).not.toBeUndefined();
        expect(ui.released.dpadDown).not.toBeUndefined();
        expect(ui.idle.KeyShift).not.toBeUndefined();
    });

    it("updates KeyboardInput, MouseInput, and GamepadInput on update()", () => {
        const ui = new UnifiedInput();
        const m1 = sinon.spy(ui.keyboard, "update");
        const m2 = sinon.spy(ui.mouse, "update");
        const m3 = sinon.spy(ui.gamepad, "update");
        ui.update();
        expect(m1.called).toBe(true);
        expect(m2.called).toBe(true);
        expect(m3.called).toBe(true);
    });
    
    it("returns if any input is in the state on anyOf()", () => {
        const ui = new UnifiedInput();
        ui.mouse.held["left"] = true;
        expect(ui.anyOf("held", ["right", "back", "forward"])).toBe(false);
        expect(ui.anyOf("held", ["right", "left", "back"])).toBe(true);
    });
    
    it("returns if all inputs are in the state on allOf()", () => {
        const ui = new UnifiedInput();
        ui.mouse.held["left"] = true;
        ui.mouse.held["right"] = true;
        expect(ui.allOf("held", ["left", "right", "back"])).toBe(false);
        expect(ui.allOf("held", ["left", "right"])).toBe(true);
    });

    // TODO: tests on mappings
});