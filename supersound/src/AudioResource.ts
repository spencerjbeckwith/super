/** Basic parent class of other types of sounds */
export class AudioResource {

    /** The AudioContext this resource's AudioNode(s) are added to */
    context: AudioContext;

    /** The element that plays when this AudioResource plays */
    element: HTMLAudioElement;

    /** The original media source node for this AudioResource */
    sourceNode: MediaElementAudioSourceNode;

    constructor(context: AudioContext, src: string) {
        // Create a new HTMLAudioElement
        this.element = new Audio(src);
        this.context = context;
        this.sourceNode = this.context.createMediaElementSource(this.element);

        // Loading will complete at some point asynchronously after an instance is created.
    }

    /** Plays the AudioResource */
    play() {
        this.element.currentTime = 0;
        this.element.play();
    }

    /** Stops all channels of this AudioResource */
    stop() {
        this.element.currentTime = 0;
        this.element.pause();
    }

    /** 
     * The node from this resource that should connect to the appropriate node in the AudioEngine or another audio context.
     * 
     * Subclasses should override this getter if they want a different AudioNode to be exposed to the AudioEngine.
     */
    get node(): AudioNode {
        return this.sourceNode;
    }
}