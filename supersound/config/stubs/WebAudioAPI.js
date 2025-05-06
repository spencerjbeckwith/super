// Makes Web Audio API stub methods available in our tests

class AudioContext {
    createMediaElementSource() {
        return new AudioNode();
    }
}

class AudioNode {
    constructor() {
        this.connections = 0; // Used for test assertions
    }
    connect(target) {
        if (target) {
            target.connections++;
        }
    }
    disconnect() {}
}

class AudioParam {
    get value() {
        return 1
    }
    setValueAtTime() {}
    linearRampToValueAtTime() {}
    exponentialRampToValueAtTime() {}
}

class GainNode extends AudioNode {
    constructor() {
        super();
        this.gain = new AudioParam();
    }
};

class AudioStub extends EventTarget {
    constructor() {
        super();
        this.currentTime = 0;
    }
    cloneNode() {
        return new AudioStub();
    }
    play() {
        this.currentTime = 1;
    }
    pause() {
        this.currentTime = 0;
    }
}

global.AudioContext = AudioContext;
global.AudioNode = AudioNode;
global.AudioParam = AudioParam;
global.GainNode = GainNode;
global.Audio = AudioStub;