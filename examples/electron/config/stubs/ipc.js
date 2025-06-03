// Makes IPC stub methods available in our tests
// Do this with other IPC methods if they are needed by tests

global.toggle = {
    scale: () => {},
    fullscreen: () => {},
    forceQuit: () => {},
}