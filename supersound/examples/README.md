# supersound examples

These examples are functionally identical - the choice of rollup or webpack is up to the needs of your project or personal preference.

To run either example:

```
cd examples/rollup
```
or
```
cd examples/webpack
```

then

```
npm install
npm run build
npm run serve
```

Then open [localhost:3000](http://localhost:3000) in your browser.

If audio is not playing, ensure you are opening the page via HTTP (through `npx serve`) instead of over the `file://` protocol.

## Scripts

- `npm run build` will build the example app.
- `npm run refresh` will rebuild supersound, reinstall it into a subdirectory, and rebuild the example app. This is very useful if developing locally and you want to test a live browser example.
- `npm run serve` will start a local server to load the example from. This is necessary because the audio files cannot be served over the `file://` protocol securely.

## Credits

- Sound effects generated with [bfxr](https://www.bfxr.net/). Generated a long time ago, since Adobe Flash has been dead for almost five years now and I'm still looking for the successor to bfxr.
- Music track by Matthew Pablo [on opengameart](https://opengameart.org/content/space-boss-battle-theme)
- Intro track by LittleRobotSoundFactory [on freesound.org](https://freesound.org/people/LittleRobotSoundFactory/sounds/320969/?)