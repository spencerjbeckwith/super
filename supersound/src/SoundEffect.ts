import { AudioResource } from "./AudioResource";

/** A basic sound effect. May play multiple times in quick succession. */
export class SoundEffect extends AudioResource {
    
    /** The number of channels of this sound effect, meaning the number of times this sound may play concurrently. */
    channels: number;

    /**
     * A number from 0 to `channels - 1` that indicates which channel of this sound effect has been played most recently.
     * 
     * This increments on each play and resets to 0 after all channels have been played.
     */
    currentChannel: number;

    /**
     * An array of the HTML audio elements that correspond to each channel.
     * 
     * As the channels cycle, the parent `element` property is updated to the audio element of the most recently played channel.
     */
    elements: HTMLAudioElement[];

    /**
     * An array of source nodes that correspond to each channel.
     * 
     * As the channels cycle, the parent `sourceNode` property is updated to the source node of the most recently played channel.
     */
    sourceNodes: MediaElementAudioSourceNode[]; 

    /**
     * The GainNode to use as an output.
     * 
     * The volume of this is not intended to be modified, but instead serve as a common connection point for all the sound effect's source nodes. 
     * This is a GainNode because instantiating a generic AudioNode isn't possible ("illegal constructor").
     * */
    protected outputNode: GainNode;

    /**
     * @param channels The number of channels for this sound effect. This should be set to the maximum number of times this sound is expected to play simultaneously.
     * If the sound is played more times than channels are available, the oldest playing sound will restart.
     */
    constructor(context: AudioContext, src: string, channels: number) {
        super(context, src);
        this.channels = channels;
        this.currentChannel = 0;
        this.outputNode = new GainNode(context);

        // Initialize our audio elements and sources by cloning from the parent
        let c = 0;
        this.sourceNodes = [];
        this.elements = [];
        while (c < this.channels) {
            if (c === 0) {
                // Don't clone the originals, otherwise we lose their reference once we overwrite the parent properties
                this.elements[c] = this.element;
                this.sourceNodes[c] = this.sourceNode;
            } else {
                this.elements[c] = this.element.cloneNode() as HTMLAudioElement;
                this.sourceNodes[c] = this.context.createMediaElementSource(this.elements[c]);
            }
            this.sourceNodes[c].connect(this.outputNode);
            c++;
        }
    }

    /** Plays the next channel of this sound effect */
    play() {
        this.element = this.elements[this.currentChannel];
        this.sourceNode = this.sourceNodes[this.currentChannel];
        super.play();
        this.currentChannel = (this.currentChannel + 1) % this.channels;
    }

    /** Stops all channels of this sound effect */
    stop() {
        let c = 0;
        while (c < this.channels) {
            this.element = this.elements[c];
            super.stop();
            c++;
        }
    }

    /** The GainNode all channels of this sound affect are connected to */
    get node(): GainNode {
        return this.outputNode;
    }
}