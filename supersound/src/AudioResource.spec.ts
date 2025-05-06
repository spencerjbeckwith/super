import { AudioResource } from "./AudioResource";
import expect from "expect";
import sinon from "sinon";

describe("AudioResource", () => {

    const context = new AudioContext();

    it("creates an audio element and GainNode", () => {
        const ar = new AudioResource(context, "");
        expect(ar.element).toBeTruthy();
        expect(ar.node).toBeTruthy();
    });

    it("plays the element on play()", () => {
        const ar = new AudioResource(context, "");
        const spy = sinon.spy(ar.element, "play");
        ar.play();
        expect(spy.called).toBeTruthy();
        expect(ar.element.currentTime).not.toBe(0);
    });

    it("stops on stop()", () => {
        const ar = new AudioResource(context, "");
        const spy = sinon.spy(ar.element, "pause");
        ar.stop();
        expect(spy.called).toBeTruthy();
        expect(ar.element.currentTime).toBe(0);
    });
});