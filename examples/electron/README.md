# electron example

This is an example of how to use the super packages with electron to build games for desktop platforms instead of web browsers. Developing a game played with electron has several worthwhile benefits over developing for the browser:

- Easier to distribute
- More robust capabilities through using IPC to access Node APIs

There are three separate transilations/compilations that take place in this project:

- Using rollup to create the distribution JavaScript. This is the same as using these packages in the browser. Rollup requires tsconfig's `module` option to be set to "esnext".
- Using `tsc` to build the main process for electron. Electron requires tsconfig's `module` option to be set to "commonjs", so this process uses the `config/tsconfig.main.json` file.
- Using `ts-node` to run the mocha test files in the project. Like Electron, this requires `module` to be set to "commonjs", so this can double-dip and use `config/tsconfig.main.json`.

The game logic should run in the renderer process, and this is where the super packages would be used, since this is equivalent to the code running in the browser traditionally.

## Scripts

- `npm run build`: Runs all the build processes simultaneously.
- `npm run start`: Opens the Electron app

## IPC

This example includes some sample inter-process communication: pressing F10 to scale the window up, F11 to go fullscreen and Escape to force-quit. This is to demonstrate some of the ways that IPC may be leveraged to give a more typical desktop-like experience.