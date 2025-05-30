import { UnifiedInput } from "./UnifiedInput";
import { expect } from "expect";
import sinon from "sinon";

describe("UnifiedInput", () => {

    it("returns the correct merged object for all states", () => {
        // Yeah, UI should certainly not be our usual abbreviation for this class...
        const ui = new UnifiedInput();
        expect(ui.pressed.keyShift).not.toBeUndefined();
        expect(ui.held.mouseLeft).not.toBeUndefined();
        expect(ui.released.gpDPadDown).not.toBeUndefined();
        expect(ui.idle.keyShift).not.toBeUndefined();
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
        ui.mouse.held["mouseLeft"] = true;
        expect(ui.anyOf("held", ["mouseRight", "mouseBack", "mouseForward"])).toBe(false);
        expect(ui.anyOf("held", ["mouseRight", "mouseLeft", "mouseBack"])).toBe(true);
    });
    
    it("returns if all inputs are in the state on allOf()", () => {
        const ui = new UnifiedInput();
        ui.mouse.held["mouseLeft"] = true;
        ui.mouse.held["mouseRight"] = true;
        expect(ui.allOf("held", ["mouseLeft", "mouseRight", "mouseBack"])).toBe(false);
        expect(ui.allOf("held", ["mouseLeft", "mouseRight"])).toBe(true);
    });

    // TODO: tests on mappings
});