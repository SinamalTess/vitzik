# Vitzik

Vitzik is a set of tools to help learning the piano. It uses the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) to detect electronic instruments connected to your laptop via USB. You can import any midi song you would like to learn. The visualizer renders a visualization that shows you which keys to hit. It also detects the input from your instrument and can be set to wait for you to play the right keys before moving forward in the song.

[Demo](https://sinamaltess.github.io/vitzik/)

![demo image](docs/img/demo.jpg)

## Project structure

The application is made of several packages working together in this monorepo.

- `vitzik-ui` : a library that provides _very_ simple UI components. This library is more of an experiment to build a mini bootstrap-like package.
- `vitizik-app` : the main package where the application lives. It contains the visualizer and all the fuss.

At this stage the application is still experimental therefore there is no versioning of the packages yet.

## Local development

The monorepo uses [Lerna](https://lerna.js.org/) to run commands across multiple packages at once.

Install dependencies:

```sh
yarn
```

Start application:

```sh
yarn start
```

Run tests:

```sh
yarn test
```

Build the packages:

```sh
yarn build
```

## Commit checks

- Tests and Prettier are run when committing. This is configured in `.husky` folder with the `lint-staged` command (found in package.json) If a test fails the commit will be aborted.
- Commit message is checked to match `commitlint` format. This is configured in `.husky` folder.
- The monorepo is checked for missing or unnecessary dependencies with `depcheck`. This is configured in `.husky` folder.

## Dependency updates

- `Dependabot` is configured to automatically open PRs for dependency updates. This is configured in `.github/dependabot.yml`.

## Useful Links

- [Project conventions](docs/project_conventions.md)
- [SoundFont Technical Specification](https://freepats.zenvoid.org/sf2/sfspec24.pdf)
