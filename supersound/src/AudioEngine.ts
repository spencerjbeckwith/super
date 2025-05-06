import { AudioResource } from "./AudioResource";
import { MusicTrack } from "./MusicTrack";
import { IntroTrack } from "./IntroTrack";

/** Central engine to control gain and other effects for a series of AudioResources over time */
export class AudioEngine {

    /** Base AudioContext this engine is connected to */
    context: AudioContext;

    /** Gain nodes that can be configured to adjust volume settings */
    gain: {
        /** Controls gain of all audio: both sound effects and music tracks */
        main: GainNode;

        /** Controls gain of sound effects only */
        sound: GainNode;

        /** Controls gain of music tracks only */
        music: GainNode;
    };

    constructor() {
        this.context = new AudioContext();
        this.gain = {
            main: new GainNode(this.context),
            sound: new GainNode(this.context),
            music: new GainNode(this.context),
        };

        this.gain.main.connect(this.context.destination);
        this.gain.sound.connect(this.gain.main);
        this.gain.music.connect(this.gain.main);
    }

    register(resource: AudioResource, type?: "sound" | "music") {
        // Connect the resource's node to the correct GainNode
        if (!type) {
            type = "sound";
            if (resource instanceof MusicTrack || resource instanceof IntroTrack) {
                type = "music";
            }
        }
        resource.node.connect(this.gain[type]);
    }
}