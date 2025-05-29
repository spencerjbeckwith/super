import { UnifiedInput } from "supercontrol";

const i = new UnifiedInput(["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"]);
const ex = document.getElementById("example");

const activated: string[] = [];

function getInputStateHTML(heading: string, inputs: string[]) {
    // This looks icky, but its just the logic to write each input and apply colors via CSS classes:
    //  teal for inputs that have been previous activated
    //  lime for inputs that are active
    let ret = `<div><h2>${heading}</h2>`;
    for (const input of inputs) {
        for (const state of ["pressed", "held", "released", "idle"]) {
            const val = i[state][input];
            const pastActive = activated.includes(state + "-" + input);
            if (val && !pastActive) {
                activated.push(state + "-" + input);
            }
            ret += `<p ${pastActive ? "class=\"pastactive\"" : (val ? "class=\"active\"" : "")}>${input} ${state}: ${val}</p>`;
        }
    }
    ret += "</div>";
    return ret;
}

function main() {
    i.update(); // Important to call this every frame!

    ex.innerHTML = `<div>
        <p>Mouse X: ${i.mouse.x}</p>
        <p>Mouse Y: ${i.mouse.y}</p>
        <p>Gamepad connected: ${i.gamepad.gamepad !== null}</p>
        <p>Axis Left X: ${Math.trunc(i.gamepad.getAxis("left", "x") * 100) / 100}</p>
        <p>Axis Left Y: ${Math.trunc(i.gamepad.getAxis("left", "y") * 100) / 100}</p>
        <p>Axis Right X: ${Math.trunc(i.gamepad.getAxis("right", "x") * 100) / 100}</p>
        <p>Axis Right Y: ${Math.trunc(i.gamepad.getAxis("right", "y") * 100) / 100}</p>
        <p>Left Trigger: ${Math.trunc(i.gamepad.leftTrigger * 100) / 100}</p>
        <p>Right Trigger: ${Math.trunc(i.gamepad.rightTrigger * 100) / 100}</p>
    </div>`;

    // Mouse
    ex.innerHTML += getInputStateHTML("MouseInput", ["left", "right"]);

    // Keyboard
    ex.innerHTML += getInputStateHTML("KeyboardInput", ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"]);

    // Gamepad
    ex.innerHTML += getInputStateHTML("Gamepad Buttons", [
        "button0",
        "button1",
        "button2",
        "button3",
    ]);

    ex.innerHTML += getInputStateHTML("Gamepad Buttons", [
        "leftBumper",
        "rightBumper",
        "leftTrigger",
        "rightTrigger",
    ]);

    ex.innerHTML += getInputStateHTML("Gamepad Left Axis", [
        "leftAxisLeft",
        "leftAxisRight",
        "leftAxisDown",
        "leftAxisUp",
    ]);

    ex.innerHTML += getInputStateHTML("Gamepad Right Axis", [
        "rightAxisLeft",
        "rightAxisRight",
        "rightAxisDown",
        "rightAxisUp",
    ]);

    requestAnimationFrame(main);
}

main();