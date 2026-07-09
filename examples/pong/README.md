# pong

This is an example game build using supersprite, supersound, and supercontroller.

The live example may be played on [itch.io](https://mcwequiesk.itch.io/super-pong-example). See [publish-itch.yml](../../.github/workflows/publish-itch.yml) for a re-usable GitHub Action that can upload this game to itch easily, and [publish-pong.yml](../../.github/workflows/publish-pong.yml) for a working usage of the Action.

To play the game:

```
npm install
npm run build
npm run serve
```

Then open [localhost:3000](localhost:3000) in the browser.

Click in the game canvas to start the game, and the paddle may be moved with the arrow keys, S/W, or a gamepad. While not a perfect game, it is a demonstration of how to use all three of these packages at once.