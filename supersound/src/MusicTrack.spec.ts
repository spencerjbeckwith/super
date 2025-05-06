import { MusicTrack } from "./MusicTrack";
import expect from "expect";
import sinon from "sinon";

describe("MusicTrack", () => {

    const context = new AudioContext();

    let clock: sinon.SinonFakeTimers;
    beforeEach(() => clock = sinon.useFakeTimers());
    afterEach(() => clock.restore());

    it("fades in linearly starting at 0 gain", () => {
        const mu = new MusicTrack(context, "");
        const spy1 = sinon.spy(mu.node.gain, "setValueAtTime");
        const spy2 = sinon.spy(mu.node.gain, "linearRampToValueAtTime");
        const spy3 = sinon.spy(mu.node.gain, "exponentialRampToValueAtTime");
        mu.fadeIn(1);
        expect(spy1.called).toBe(true);
        expect(spy2.called).toBe(true);
        expect(spy3.called).toBe(false);
    });

    it("can use exponential fading type", () => {
        const mu = new MusicTrack(context, "");
        const spy1 = sinon.spy(mu.node.gain, "linearRampToValueAtTime");
        const spy2 = sinon.spy(mu.node.gain, "exponentialRampToValueAtTime");
        mu.fadeIn(1, "exponential");
        expect(spy1.called).toBe(false);
        expect(spy2.called).toBe(true);
    });

    it("stops the track after fading out", () => {
        const mu = new MusicTrack(context, "");
        const spyRamp = sinon.spy(mu.node.gain, "linearRampToValueAtTime");
        const spyStop = sinon.spy(mu, "stop");
        mu.play();
        mu.fadeOut(0.5);
        expect(spyRamp.called).toBe(true);
        expect(spyStop.called).toBe(false);
        clock.tick(505);
        expect(spyStop.called).toBe(true);
    });
    
    it("doesnt stop the track if played again before fading out", () => {
        const mu = new MusicTrack(context, "");
        const spyStop = sinon.spy(mu, "stop");
        mu.play();
        mu.fadeOut(1);
        clock.tick(500);
        mu.play();
        clock.tick(505);
        expect(spyStop.called).toBe(false);
    });
});