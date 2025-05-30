import { UnifiedInput } from "supercontroller";

const i = new UnifiedInput();
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
            ret += `<p ${val ? "class=\"active\"" : (pastActive ? "class=\"pastactive\"" : "")}>${input} ${state}: ${val}</p>`;
        }
    }
    ret += "</div>";
    return ret;
}

function main() {
    

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
        <p>Trigger Mode: ${i.gamepad.triggerMode}</p>
    </div>`;

    // Mouse
    ex.innerHTML += getInputStateHTML("MouseInput", ["mouseLeft", "mouseRight"]);

    // Keyboard
    ex.innerHTML += getInputStateHTML("KeyboardInput", ["keyArrowLeft", "keyArrowRight", "keyArrowDown", "keyArrowUp"]);

    // Gamepad
    ex.innerHTML += getInputStateHTML("Gamepad Buttons", [
        "gpButton0",
        "gpButton1",
        "gpButton2",
        "gpButton3",
    ]);

    ex.innerHTML += getInputStateHTML("Gamepad Buttons", [
        "gpLeftBumper",
        "gpRightBumper",
        "gpLeftTrigger",
        "gpRightTrigger",
    ]);

    ex.innerHTML += getInputStateHTML("Gamepad Left Axis", [
        "gpLeftAxisLeft",
        "gpLeftAxisRight",
        "gpLeftAxisDown",
        "gpLeftAxisUp",
    ]);

    ex.innerHTML += getInputStateHTML("Gamepad Right Axis", [
        "gpRightAxisLeft",
        "gpRightAxisRight",
        "gpRightAxisDown",
        "gpRightAxisUp",
    ]);

    i.update(); // Important to call this every frame!
    requestAnimationFrame(main);
}

main();