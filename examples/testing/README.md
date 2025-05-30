# testing-example

This is an example of a project set up to use supersprite/supersound/supercontroller with rollup alongside a testing framework. In this example, the framework is mocha though others may run into similar challenges. This example may be directly used as the starting point for a project.

At its core, this example needs to compile twice: first to run tests, and second into a browser-friendly bundle. The challenge is that rollup expects tsconfig's `module` to be set to "esnext", though in this case mocha gives an unknown file extension error. The workaround, as demonstrated in this repository, is to use a separate `tsconfig.test.json` and load that into mocha instead.

If your repository is set up without testing (bad idea) two config files are not necessary. Typically a TypeScript compiler would be configured to ignore test files, but because using rollup to bundle for the browser only includes files depended on by the entry point (index.ts), there is no need to be picky about if tests are picked up or not.

## Scripts

- `build`: run rollup using the config file under `./config/`
- `test`: run mocha
- `serve`: serve example to open in the browser
- `coverage`: run code coverage report