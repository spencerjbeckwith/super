import { IntroTrack } from "./IntroTrack";
import expect from "expect";
import sinon from "sinon";

describe("IntroTrack", () => {

    const context = new AudioContext();

    let clock: sinon.SinonFakeTimers;
    beforeEach(() => clock = sinon.useFakeTimers());
    afterEach(() => clock.restore());

    it("executes callback after the audio plays", () => {
        const intro = new IntroTrack(context, "");
        // @ts-ignore
        intro.element.duration = 5;
        const stub = sinon.stub();
        intro.play(stub);
        expect(stub.called).toBeFalsy();
        clock.tick(5000);
        expect(stub.called).toBeTruthy();
    });

    it("can cancel a previous callback when played a second time", () => {
        const intro = new IntroTrack(context, "");
        // @ts-ignore
        intro.element.duration = 5;
        const stub1 = sinon.stub();
        const stub2 = sinon.stub();
        intro.play(stub1);
        clock.tick(2000);
        intro.play(stub2, true);
        clock.tick(10000);
        expect(stub1.called).toBeFalsy();
        expect(stub2.called).toBeTruthy();
    });

    it("can cancel the callback when stopped", () => {
        const intro = new IntroTrack(context, "");
        // @ts-ignore
        intro.element.duration = 5;
        const stub = sinon.stub();
        intro.play(stub);
        expect(stub.called).toBeFalsy();
        clock.tick(2000);
        intro.stop();
        clock.tick(10000);
        expect(stub.called).toBeFalsy();
    });

    it("can allow the callback to execute when stopped", () => {
        const intro = new IntroTrack(context, "");
        // @ts-ignore
        intro.element.duration = 5;
        const stub = sinon.stub();
        intro.play(stub);
        expect(stub.called).toBeFalsy();
        clock.tick(2000);
        intro.stop(false);
        clock.tick(10000);
        expect(stub.called).toBeTruthy();
    });
});