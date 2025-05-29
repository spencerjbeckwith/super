# supercontrol

supercontrol is a user-input engine for browser-based games.

## Capabilities

- Keyboard presses and releases
- Gamepad button presses and releases
- Gamepad axes
- Mouse position and button clicks

## Usage

TODO supercontrol readme

## To-do

- Triggers as axes mode for GamepadInput
- Add joystick clamping mode
- Finish writing README
- Move this section to github issues
- Type enforcement on keyboard key names
    - This would remove the need for a keyboard keys generic.
- Optimize input register() functions - most don't need to call it for every possible input.
    - This would allow KeyboardInput to listen to most or all keys by default, making usage simpler.
    - Any performance implications with this?
- Add mapping capability to UnifiedInput's getter functions
- Input deinitializers
- TouchInput class
- Change MouseInput buttons to be more descriptive and differentiate them in UnifiedInput, e.g. "left" -> "leftMouseButton"