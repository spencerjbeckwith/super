# supercontrol

supercontrol is a user-input engine for browser-based games or other applications. Plug and play!

## Capabilities

- Monitor keyboard presses and releases
- Monitor mouse position, buttons, and deltas
- Connect a gamepad and monitor axes, buttons, and triggers

## Usage

In order to use supercontrol you must also be using a tool such as [rollup](https://rollupjs.org/guide/en/) or [webpack](https://v4.webpack.js.org/) that can pull in code from node dependencies and run it in the browser. See the `examples` directory for example configurations.

> ```npm install supercontrol```

The simplest way to get started is to instantiate `UnifiedInput`.

```typescript
import { UnifiedInput } from "supercontrol";

const input = new UnifiedInput();
```

Options may be provided when initialization, such as keyboard keys to watch, gamepad axis/trigger thresholds, etc.

Every "input" is tracked across four states: idle, pressed, held, and released. Pressed is true on the frame an input is activated, such as a keyboard button or mouse button being pressed. Held is true for every frame after that until the input is released, in which case the released state will be set to true. The next frame, idle will be true. Only one state is true at a time for each input.

States are advanced via calls to the `update()` method, which should always be at the *end* of your animation frame, after any logic.

```typescript
function main() {
    
    // Do logic and rendering and such...

    input.update();
    requestAnimationFrame(main);
}
```

Checking individual inputs can be done on the `idle`, `pressed`, `held`, or `released` state properties of `UnifiedInput`. These objects contain all inputs available.

```typescript
function main() {
    if (input.held.keyLeft) {
        // Move left
    }

    if (input.held.keyRight) {
        // Move right
    }

    // etc...

    input.update();
    requestAnimationFrame(main);
}
```

More specific details, such as mouse position or gamepad axes, can be accessed from the `mouse` or `gamepad` properties on `UnifiedInput`. Axes are read via the `gamepad.getAxis()` method.

```typescript
if (input.mouse.x > 100) { /* ... */ }
if (input.gamepad.getAxis("left", "x") < -0.5) { /* ... */ }
```

### Multiple Inputs

In some cases, multiple inputs should be linked to one action. To help facilitate this, use the `anyOf()` method. This returns true if any of the provided inputs are true.

```typescript
if (input.anyOf("held", ["keyArrowLeft", "gamepadDPadLeft", "gamepadLeftAxisLeft", "keyA"])) { /* ... */ }
```

In this example, the code block will execute if any of the left arrow key, gamepad D-pad left, gamepad left axis, or A key are held to the left.

### Virtual Buttons

There are eight virtual gamepad buttons that supercontrol tracks - they are the four cardinal directions on the gamepad left and right joysticks.

These are useful for `anyOf()` as described above and for situations where checking the specific magnitude of the axis doesn't matter, such as navigating menus.

#### Mouse Reference Frame

To obtain accurate mouse data, a reference frame may be specified. Typically this would be your game's canvas element. If not specified, the document body is used instead.

This reference frame may also have a scale specified, which will scale up or down the mouse coordinates within the element. This is useful if the game is low-resolution and has been scaled up or down.

#### Keyboard Selected Keys

If no keys are specified in the input config (for `UnifiedInput` or `KeyboardInput`) the class will use a default list, which includes all keys, numbers, arrows, space bar, function keys and other commonly-used keys for games such as escape.

If other keys are required, they may be specified in the config. This replaces the default list.

To get useful intellisense/autocomplete for the new states, use `as const` on the array of keys.

```typescript
const input = new KeyboardInput({
    keys: [
        "keyArrowLeft",
        "keyArrowUp",
        "keyArrowRight",
        "keyArrowDown",
    ] as const,
});
```

All keys specified this way must be prefixed with the word "key". This convention ensures that `UnifiedInput` inputs are clear about their source, especially for the myriad of keys that could be used. The name of the key itself should be the value returned from the [KeyboardEvent: key property](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).

#### Gamepad Triggers

Triggers on a connected gamepad may be represented as buttons or as axes, depending on the specific make of the gamepad and the browser it is connected to. To try and cover more cases, supercontrol has "button" and "axis" trigger modes on `GamepadInput`. This is set automatically.

Trigger values in "button" mode are treated very similarly to every other gamepad button, except they use the `value` instead of `pressed` key of the `GamepadButton` provided by the browser.

Trigger values in "axis" mode are treated very similarly to the regular axes. The `gamepadLeftTrigger` and `gamepadRightTrigger` are set based on the trigger axes and their raw values may be accessed via `gamepad.leftTrigger` and `gamepad.rightTrigger`.

## Limitations

- Only one gamepad may be connected at a time
- No support for touch input
- No support for virtual reality gamepad mappings
- Specific gamepad layouts may not be compatible with supercontrol. This is inevitable given how many varieties and manufacturers there are and that there's no meaningful standard. There are a few options to remedy this:
    - Open a GitHub issue about the layout, ideally containing specifics about why the layout is broken and how it might be assessed by supercontrol. Even better, open a PR!
    - Find software to virtually map the gamepad inputs to a more friendly layout.
