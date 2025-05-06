import expect from "expect";
import { AudioEngine } from "./AudioEngine";
import sinon from "sinon";
import { SoundEffect } from "./SoundEffect";
import { IntroTrack } from "./IntroTrack";

// From our stub, used for assertions
declare global {
    interface AudioNode {
        connections: number;
    }
}

describe("AudioEngine", () => {
    it("creates main, sound, and music GainNodes", () => {
        const spy = sinon.spy(GainNode.prototype, "connect");
        new AudioEngine();
        expect(spy.getCalls().length).toBe(3);
        spy.restore();
    });

    it("connects sounds to the correct node", () => {
        const ae = new AudioEngine();
        const snd = new SoundEffect(ae.context, "", 1);
        ae.register(snd);
        expect(ae.gain.sound.connections).toBe(1);
        expect(ae.gain.music.connections).toBe(0);
    });

    it("treats IntroTracks as music when not specified as sound", () => {
        const ae = new AudioEngine();
        const it = new IntroTrack(ae.context, "");
        ae.register(it);
        expect(ae.gain.sound.connections).toBe(0);
        expect(ae.gain.music.connections).toBe(1);
    });
});