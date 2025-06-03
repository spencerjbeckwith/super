import { Color, Core } from "supersprite";
import { AudioEngine, SoundEffect } from "supersound";
import { UnifiedInput } from "supercontroller";
import { add } from "./add";

const core = new Core({
    atlas: null,
    presenter: {
        baseWidth: 400,
        baseHeight: 320,
    },
});

const ae = new AudioEngine();
const pong = new SoundEffect(ae.context, "assets/pong.wav", 2);
ae.register(pong);

const input = new UnifiedInput();

const bgColor = new Color("#101010");

function main() {
    core.beginRender(bgColor);

    core.draw.text(`2 + 2 is equal to ${add(2, 2)}!`, 200, 160, {
        hAlign: "center",
        vAlign: "middle",
    });

    // Sample IPC calls
    if (input.anyOf("pressed", ["keyF10", "gpSelect"])) {
        pong.play();
        toggle.scale();
    }
    if (input.anyOf("pressed", ["keyF11", "gpStart"])) {
        pong.play();
        toggle.fullscreen();
    }
    if (input.pressed.keyEscape) {
        toggle.forceQuit();
    }

    core.endRender();
    input.update();
    requestAnimationFrame(main);
}

main();