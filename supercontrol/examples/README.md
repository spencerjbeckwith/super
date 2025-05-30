# supercontrol examples

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
```

Then open the appropriate `index.html` file in your browser. This can be served and functional over the `file://` protocol, unlike the supersprite or supersound examples.

## Scripts

- `npm run build` will build the example app.
- `npm run refresh` will rebuild supercontrol, reinstall it into a subdirectory, and rebuild the example app. This is very useful if developing locally and you want to test a live browser example.