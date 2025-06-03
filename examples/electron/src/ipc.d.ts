// Declarations are necesary to access any IPC interfaces.
// You'll also want to add these to config/stubs and preload them in .mocharc.json so they aren't undefined in tests.

declare const toggle: {
    scale: () => void;
    fullscreen: () => void;
    forceQuit: () => void;
}