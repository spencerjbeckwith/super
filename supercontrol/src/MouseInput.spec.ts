import { MouseInput } from "./MouseInput";
import expect from "expect";

describe("MouseInput", () => {

    it("updates mouse X and Y position", () => {
        const m = new MouseInput();
        document.body.dispatchEvent(new MouseEvent("mousemove", {
            clientX: 20,
            clientY: 30,
        }));
        expect(m.x).toBe(20);
        expect(m.y).toBe(30);
    });

    it("sets mouse button states", () => {
        const m = new MouseInput();
        document.body.dispatchEvent(new MouseEvent("mousedown", {
            button: 2,
        }));
        expect(m.pressed.right).toBe(true);
        document.body.dispatchEvent(new MouseEvent("mouseup", {
            button: 0,
        }));
        expect(m.released.left).toBe(true);
    });
    
    it("updates mouse X and Y position according to referenceFrame", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);
        const m = new MouseInput(div);
        document.body.dispatchEvent(new MouseEvent("mousemove", {
            clientX: 10,
            clientY: 15,
        }));
        // Event wasn't fired on the div, so shouldn't update.
        expect(m.x).toBe(0);
        expect(m.y).toBe(0);
        div.dispatchEvent(new MouseEvent("mousemove", {
            clientX: 30,
            clientY: 35,
        }));
        expect(m.x).toBe(30);
        expect(m.y).toBe(35);
    });

    it("scales mouse X and Y according to referenceFrameScale", () => {
        const m = new MouseInput();
        m.referenceFrameScale.x = 2;
        m.referenceFrameScale.y = 4;
        document.body.dispatchEvent(new MouseEvent("mousemove", {
            clientX: 8,
            clientY: 8,
        }));
        expect(m.x).toBe(4);
        expect(m.y).toBe(2);
    });

    it("tracks deltas and unsets them on update()", () => {
        const m = new MouseInput();
        const ev = new MouseEvent("mousemove", {
            clientX: 10,
            clientY: 10,
        });
        // @ts-ignore - I guess the movement variables can't be set in the event constructor, because they were coming up undefined that way.
        ev.movementX = 4; ev.movementY = -4;
        document.body.dispatchEvent(ev);
        expect(m.deltaX).toBe(4);
        expect(m.deltaY).toBe(-4);
        document.body.dispatchEvent(new WheelEvent("wheel", {
            deltaX: 1,
            deltaY: 2,
            deltaZ: 3,
        }));
        expect(m.wheelDeltaX).toBe(1);
        expect(m.wheelDeltaY).toBe(2);
        expect(m.wheelDeltaZ).toBe(3);
        m.update();
        expect(m.deltaX).toBe(0);
        expect(m.deltaY).toBe(0);
        expect(m.wheelDeltaX).toBe(0);
        expect(m.wheelDeltaY).toBe(0);
        expect(m.wheelDeltaZ).toBe(0);
    });

    it("suppresses context menu events", () => {
        const div = document.createElement("div");
        new MouseInput(div);
        let called = false;
        div.addEventListener("contextmenu", () => {
            called = true;
        });
        div.dispatchEvent(new MouseEvent("contextmenu"));
        expect(called).toBe(false);
    });

    it("returns true on isIn() when mouse is in rectangle", () => {
        const m = new MouseInput();
        document.body.dispatchEvent(new MouseEvent("mousemove", {
            clientX: 5,
            clientY: 5,
        }));
        expect(m.isIn(2, 2, 20, 20)).toBe(true);
        expect(m.isIn(1, 5, 10, 8)).toBe(true);
        expect(m.isIn(5, 5, 5, 5)).toBe(true);
    });

    it("returns false on isIn() when mouse is outside of rectangle", () => {
        const m = new MouseInput();
        document.body.dispatchEvent(new MouseEvent("mousemove", {
            clientX: 5,
            clientY: 5,
        }));
        expect(m.isIn(1, 1, 10, 3)).toBe(false); // top
        expect(m.isIn(8, 1, 12, 12)).toBe(false); // right
        expect(m.isIn(1, 10, 10, 12)).toBe(false); // bottom
        expect(m.isIn(1, 2, 3, 10)).toBe(false); // left
    });
});