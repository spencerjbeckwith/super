import { SoundEffect } from "./SoundEffect";
import { AudioResource } from "./AudioResource";
import expect from "expect";
import sinon from "sinon";

describe("SoundEffect", () => {

    const context = new AudioContext();

    it("creates a source node and element for each channel", () => {
        const snd = new SoundEffect(context, "", 3);
        expect(snd.elements.length).toBe(3); 
        expect(snd.sourceNodes.length).toBe(3);
        for (let c = 0; c < 3; c++) {
            expect(snd.elements[c]).toBeTruthy();
            expect(snd.sourceNodes[c]).toBeTruthy();
        }
        expect(snd.element).toBe(snd.elements[0]);
        expect(snd.sourceNode).toBe(snd.sourceNodes[0]);
    });

    it("connects every channel to the sound's output node", () => {
        const spy = sinon.spy(AudioNode.prototype, "connect");
        new SoundEffect(context, "", 4);
        expect(spy.getCalls().length).toBe(4);
        spy.restore();
    });

    it("cycles back to zero after playing all channels", () => {
        const snd = new SoundEffect(context, "", 3);
        snd.play();
        expect(snd.currentChannel).toBe(1);
        snd.play();
        expect(snd.currentChannel).toBe(2);
        snd.play();
        expect(snd.currentChannel).toBe(0)
        snd.play();
        expect(snd.currentChannel).toBe(1);
    });

    it("stops all channels on stop()", () => {
        const snd = new SoundEffect(context, "", 4);
        const spy = sinon.spy(AudioResource.prototype, "stop");
        snd.stop();
        expect(spy.getCalls().length).toBe(4);
        spy.restore();
    });

    it("returns node as a GainNode", () => {
        const snd = new SoundEffect(context, "", 1);
        expect(snd.node).toBeInstanceOf(GainNode);
    });
});