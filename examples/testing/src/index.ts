import { Core } from "supersprite";
import { add } from "./add";
import { AudioEngine } from "supersound";
import { UnifiedInput } from "supercontroller";

const core = new Core({
    atlas: null,
    presenter: {
        baseWidth: 300,
        baseHeight: 200,
    },
});

const ae = new AudioEngine();
const input = new UnifiedInput();

function main() {
    core.draw.text(`2 + 2 is equal to ${add(2, 2)}!`, 150, 100, {
        hAlign: "center",
        vAlign: "middle",
    });
    requestAnimationFrame(main);
}

main();