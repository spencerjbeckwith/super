import { AudioResource } from "./AudioResource";

export type FadeType = "linear" | "exponential";

/** A looping track that continues until stopped */
export class MusicTrack extends AudioResource {

    /** An individual GainNode used to control the fading in/out of this track */
    protected gainNode: GainNode;

    /** Timeout that is set in order to stop the track after it has faded out */
    fadeTimeout: NodeJS.Timeout | number | null;

    constructor(context: AudioContext, src: string) {
        super(context, src);
        this.element.loop = true;
        this.gainNode = new GainNode(this.context);
        this.sourceNode.connect(this.gainNode);
        this.fadeTimeout = null;
    }

    /** Plays the music track, setting its initial gain to the provided value. Defaults to 1, full volume. */
    play(startingGain = 1) {
        super.play();
        this.node.gain.setValueAtTime(startingGain, this.context.currentTime);

        // Cancel our fade timeout, if one has been set.
        if (this.fadeTimeout !== null) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
    }

    /** Plays and fades the music track to full volume over the provided number of seconds */
    fadeIn(seconds: number, type?: FadeType) {
        this.play(0);
        const fn = this.#getRampFunction(type);
        fn.bind(this.node.gain)(1, this.context.currentTime + seconds);
    }

    /**
     * Fades the music track out over the provided number of seconds.
     * 
     * The audio is stopped once the time elapses.
     */
    fadeOut(seconds: number, type?: FadeType) {
        const fn = this.#getRampFunction(type);
        fn.bind(this.node.gain)(0, this.context.currentTime + seconds);

        // Set timeout to stop the audio after the fade is complete
        this.fadeTimeout = setTimeout(() => {
            this.stop();
        }, seconds * 1000);
    }

    /** Returns the ramping function to use depending on the provided FadeType */
    #getRampFunction(type: FadeType = "linear") {
        return type === "linear" ? this.node.gain.linearRampToValueAtTime : this.node.gain.exponentialRampToValueAtTime;
    }

    /** The GainNode this track uses to fade in or out */
    get node(): GainNode {
        return this.gainNode;
    }
}