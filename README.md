# Vitzik

Vitzik is a set of tools to help learning the piano. Connect an electronic instrument to your laptop via USB and import any midi song you would like to learn.

The application is made of several packages working together in this monorepo.

- vitzik-ui : contains the UI components.
- vitizik-app

[Demo](https://sinamaltess.github.io/vitzik/)

## Local development

Install dependencies

```sh
npm install
```

Start application

```sh
npm start
```

Run tests

```sh
npm run test
```

Run tests in watch mode

```sh
npm run test:watch
```

Run storybook

```sh
npm run storybook
```

Build the application

```sh
npm run build
```

Note : tests and prettier are automatically run when committing. If a test fails the commit will be aborted.
