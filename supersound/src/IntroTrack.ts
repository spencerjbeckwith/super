import { AudioResource } from "./AudioResource";

/** 
 * A one-channel sound effect that executes a callback function once playback is complete.
 * 
 * This can be used for the intro segment of a music track, as well as other types of sounds that should "do something" once they're done playing.
 */
export class IntroTrack extends AudioResource {
    
    /** Set to indicate the ID of a timeout, if this track is currently playing. */
    timeout: NodeJS.Timeout | number | null;

    constructor(context: AudioContext, src: string) {
        super(context, src);
        this.timeout = null;
    }

    /**
     * Plays the IntroTrack, and executes the callback after playback finishes.
     * The time until the callback executes is determined by the length of audio.
     * 
     * @param callback The function to call once playback completes. This is scheduled via `setTimeout()`.
     * Note that if your application is using an animation loop (like a game), the execution of this callback will most likely fall outside of the logic loop.
     * Therefore, be aware of unintended ways this callback may affect your application.
     * 
     * If the audio has not loaded (and therefore the element's `duration` property is NaN) the callback will execute instantaneously.
     * 
     * @param cancel If true, the previous timeout (if set from a prior invocation) will be cancelled in favor of this new play.
     * If false, any previous timeout will be allowed to continue until it executes. Defaults to false.
     */
    play(callback?: () => void, cancel = false) {
        super.play();
        if (cancel && this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (callback) {
            this.timeout = setTimeout(callback, this.element.duration * 1000); // Seconds to milliseconds
        }
    }

    /**
     * Stops the IntroTrack, potentially cancelling any provided callback.
     * 
     * @param cancel If any prior callback should be cancelled when stopping this track. Defaults to true.
     * 
     * The `cancel` param only affects the *most recent* call. If the track is stopped with `cancel` set to false, then played and stopped again with `cancel` set to true,
     * the original callback will still execute because the first call to `stop()` did not cancel the timeout, and the next call to `play()` overwrote it.
     */
    stop(cancel = true) {
        super.stop();
        if (cancel && this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}
