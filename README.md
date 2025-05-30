# super

Monorepo containing game development TS/JS libraries.

## Packages

- [supersprite](supersprite) for graphics
- [supersound](supersound) for audio
- [supercontroller](supercontroller) for input

All are available for installation via NPM:

```bash
npm install supersprite supersound supercontroller
```

## Examples

- [examples/pong](pong) demonstrates using all three packages at once
- [examples/testing](testing) demonstrates using the packages with a testing environment
- [supersprite/examples/rollup](supersprite example) demonstrates supersprite's graphics capabilities

Note that since these packages are intended to be used in a browser, they require a tool such as [rollup](https://rollupjs.org/guide/en/) or [webpack](https://v4.webpack.js.org/). There are individual examples under each package that demonstrate using that package with either rollup or webpack.

To see the examples live, clone the repository and navigate to the example you'd like to see. The example will need to be built via `npm install` and `npm run build`. Some examples require a live server (due to how browsers handle loading resources such as sprites or sounds over the `file://` protocol), so for those examples, serve them with `npm run serve` and open [localhost:3000](localhost:3000) in your browser. For examples that don't need serving, simply open `index.html` in your browser.

## Contributing

If you notice something about these packages or examples that is incorrect or could be improved, please open a GitHub issue or a PR!
