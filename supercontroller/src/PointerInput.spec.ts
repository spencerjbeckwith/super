import { PointerInput, MouseInput } from "./PointerInput";
import expect from "expect";
import sinon from "sinon";

describe("PointerInput", () => {

    it("is exported under the MouseInput alias for backwards compatibility", () => {
        expect(MouseInput).toBe(PointerInput);
    });

    it("sets button states from pointerdown and pointerup", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 2,
            isPrimary: true,
        }));
        expect(m.pressed.mouseRight).toBe(true);
        document.body.dispatchEvent(new PointerEvent("pointerup", {
            button: 0,
            isPrimary: true,
        }));
        expect(m.released.mouseLeft).toBe(true);
    });

    it("treats a touch tap as the primary (left) button", () => {
        const m = new PointerInput();
        // Touch pointers report button 0 on contact, mapping to mouseLeft.
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            pointerType: "touch",
        }));
        expect(m.pressed.mouseLeft).toBe(true);
    });

    it("ignores non-primary pointers", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: false,
            clientX: 50,
            clientY: 50,
        }));
        expect(m.x).toBe(0);
        expect(m.y).toBe(0);
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: false,
        }));
        expect(m.pressed.mouseLeft).toBe(false);
    });

    it("ignores non-primary pointerup and pointercancel", () => {
        const m = new PointerInput();
        // Establish a held button via a primary pointer.
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
        }));
        m.update();
        expect(m.held.mouseLeft).toBe(true);
        // A non-primary pointerup must not release it.
        document.body.dispatchEvent(new PointerEvent("pointerup", {
            button: 0,
            isPrimary: false,
        }));
        expect(m.held.mouseLeft).toBe(true);
        expect(m.released.mouseLeft).toBe(false);
        // Nor should a non-primary pointercancel.
        document.body.dispatchEvent(new PointerEvent("pointercancel", {
            isPrimary: false,
        }));
        expect(m.held.mouseLeft).toBe(true);
        expect(m.released.mouseLeft).toBe(false);
    });

    it("exposes the pointerType of the most recent pointer event", () => {
        const m = new PointerInput();
        // No pointer has been seen yet.
        expect(m.pointerType).toBe(null);
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            pointerType: "touch",
            clientX: 5,
            clientY: 5,
        }));
        expect(m.pointerType).toBe("touch");
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            pointerType: "pen",
        }));
        expect(m.pointerType).toBe("pen");
    });

    it("updates X and Y position on pointermove", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 20,
            clientY: 30,
        }));
        expect(m.x).toBe(20);
        expect(m.y).toBe(30);
    });

    it("updates position according to referenceFrame", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);
        const m = new PointerInput({ referenceFrame: div });
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 10,
            clientY: 15,
        }));
        // Event wasn't fired on the div, so shouldn't update.
        expect(m.x).toBe(0);
        expect(m.y).toBe(0);
        div.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 30,
            clientY: 35,
        }));
        expect(m.x).toBe(30);
        expect(m.y).toBe(35);
    });

    it("updates position with an offset referenceFrame", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);
        sinon.stub(div, "getBoundingClientRect").returns({
            left: 40,
            top: 25,
        } as DOMRect);
        const m = new PointerInput({ referenceFrame: div });
        div.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 60,
            clientY: 55,
        }));
        expect(m.x).toBe(20);
        expect(m.y).toBe(30);
    });

    it("scales X and Y according to referenceFrameScale", () => {
        const m = new PointerInput();
        m.referenceFrameScale.x = 2;
        m.referenceFrameScale.y = 4;
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 8,
            clientY: 8,
        }));
        expect(m.x).toBe(4);
        expect(m.y).toBe(2);
    });

    it("computes movement deltas manually without relying on movementX/Y", () => {
        const m = new PointerInput();
        // pointerdown anchors the delta reference; the first move measures from there.
        // Note movementX/Y are never set - touch and pen do not reliably provide them.
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            pointerType: "touch",
            clientX: 10,
            clientY: 10,
        }));
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            pointerType: "touch",
            clientX: 14,
            clientY: 6,
        }));
        expect(m.deltaX).toBe(4);
        expect(m.deltaY).toBe(-4);
    });

    it("does not produce a delta jump on the first movement", () => {
        const m = new PointerInput();
        // The very first move with no prior reference should report a zero delta,
        // not a jump from the origin.
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 100,
            clientY: 100,
        }));
        expect(m.deltaX).toBe(0);
        expect(m.deltaY).toBe(0);
        expect(m.x).toBe(100);
        expect(m.y).toBe(100);
    });

    it("re-anchors the delta reference on pointerdown so touch does not jump", () => {
        const m = new PointerInput();
        // A finger touches, drags, lifts...
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            pointerType: "touch",
            clientX: 10,
            clientY: 10,
        }));
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            pointerType: "touch",
            clientX: 20,
            clientY: 20,
        }));
        m.update();
        // ...then a new finger touches somewhere far away. The delta should be
        // measured from the new contact point, not the old one.
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            pointerType: "touch",
            clientX: 200,
            clientY: 200,
        }));
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            pointerType: "touch",
            clientX: 205,
            clientY: 195,
        }));
        expect(m.deltaX).toBe(5);
        expect(m.deltaY).toBe(-5);
    });

    it("tracks wheel deltas and unsets all deltas on update()", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            clientX: 10,
            clientY: 10,
        }));
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 14,
            clientY: 6,
        }));
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

    it("releases stuck buttons on pointercancel", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
        }));
        expect(m.pressed.mouseLeft).toBe(true);
        m.update();
        expect(m.held.mouseLeft).toBe(true);
        // The browser takes over the pointer (e.g. a scroll gesture) - without a
        // pointerup, the button would otherwise stay held forever.
        document.body.dispatchEvent(new PointerEvent("pointercancel", {
            isPrimary: true,
        }));
        expect(m.released.mouseLeft).toBe(true);
        expect(m.held.mouseLeft).toBe(false);
    });

    it("sets touch-action to none on the referenceFrame", () => {
        const div = document.createElement("div");
        const m = new PointerInput({ referenceFrame: div });
        expect(m.referenceFrame.style.touchAction).toBe("none");
    });

    it("captures the pointer on pointerdown when supported", () => {
        const div = document.createElement("div");
        const capture = sinon.spy();
        // jsdom elements lack setPointerCapture; supply one to observe the call.
        (div as unknown as { setPointerCapture: unknown }).setPointerCapture = capture;
        new PointerInput({ referenceFrame: div });
        div.dispatchEvent(new PointerEvent("pointerdown", {
            button: 0,
            isPrimary: true,
            pointerId: 7,
        }));
        expect(capture.calledWith(7)).toBe(true);
    });

    it("does not throw when pointer capture is unsupported", () => {
        const div = document.createElement("div");
        // No setPointerCapture is defined on the element (as in jsdom).
        new PointerInput({ referenceFrame: div });
        expect(() => {
            div.dispatchEvent(new PointerEvent("pointerdown", {
                button: 0,
                isPrimary: true,
            }));
        }).not.toThrow();
    });

    it("suppresses context menu events", () => {
        const div = document.createElement("div");
        new PointerInput({ referenceFrame: div });
        const ev = new MouseEvent("contextmenu");
        const spy = sinon.spy(ev, "preventDefault");
        div.dispatchEvent(ev);
        expect(spy.called).toBe(true);
    });

    it("returns true on isIn() when the pointer is in the rectangle", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 5,
            clientY: 5,
        }));
        expect(m.isIn(2, 2, 20, 20)).toBe(true);
        expect(m.isIn(1, 5, 10, 8)).toBe(true);
        expect(m.isIn(5, 5, 5, 5)).toBe(true);
    });

    it("returns false on isIn() when the pointer is outside the rectangle", () => {
        const m = new PointerInput();
        document.body.dispatchEvent(new PointerEvent("pointermove", {
            isPrimary: true,
            clientX: 5,
            clientY: 5,
        }));
        expect(m.isIn(1, 1, 10, 3)).toBe(false); // top
        expect(m.isIn(8, 1, 12, 12)).toBe(false); // right
        expect(m.isIn(1, 10, 10, 12)).toBe(false); // bottom
        expect(m.isIn(1, 2, 3, 10)).toBe(false); // left
    });
});
