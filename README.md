# web-exchange-frontend

This is UI project for a crypto exchange.

# Stack

Application uses `react-scripts` (part of "Create React App" tooling) under the hood for development with zero configuration. More info about "Create React App" tooling could be found in [official Github repository](https://github.com/facebook/create-react-app).

## Start app

To run app locally, run `yarn start` in app root directory. `react-scripts` will start web server at `http://localhost:3000` (or first next free port).

## Build app

To build app, run `yarn build` in app root directory. It is highly possible you won't need to run this command, unless deploying to production environment.

# Code style & formatting

## Prettier

Project makes use of [Prettier](https://prettier.io/), an opinionated code formatter.
Project comes with Prettier configuration for [Visual Studio Code](https://code.visualstudio.com/).
In order to format code manually, run `yarn format` in app root directory.

## ESLint

Project comes with ESLint configured. It helps you prevent common errors.

There are multiple ways how to run ESLint.

- CLI: `yarn lint`
- in browser console while developing (after running `yarn start`)
- in IDE if supported (Visual Studio Code supports reports)

# Component development

## Developing in isolation

We suggest developing component in isolation. For this reason, project comes with **Storybook** pre-configured.

To run separated development environment, run `yarn storybook` which will start dedicated web server at `http://localhost:9001`.

More information about supported features can be found in [official Github repository](https://github.com/storybooks/storybook)

## Development process

We utilise following process for component development:

1.  Design component API: this could be done in form of prop types definition, or simple component usage example, or documentation (markdown file). This step does not include any code implementation.
2.  Review of component API - might consist from multiple iterations, until we are confident with proposed API.
3.  Implementation based on approved API.
4.  Review of code implementation - might consists from multiple iterations, until we are confident with code base.

Other notes related to development process:

- "Visual" components should follow designs strictly.
- commit regularly and commit right from point 1, - "Design component API"
- each feature should be developed in designated branch. Prefer following naming "feature/{name}", e.g. "feature/button"
- when ready to be merged to upstream branch, create pull request to the branch
- create stories (Storybook) which demonstrate new or changed functionality

Internationalization:

There are two ways how to define a translation string:

1. Using component - this is preferred option whenever possible, virtually always in jsx files except when we need to translate HTML attributes such as alt, placeholder, title, etc. Usage of component brings together benefits of having unique keys while keeping texts in markups. The content of component is used as a default message, when no explicit translation resource is defined.
2. Using 't' function - this is the option outside of jsx files and for HTML attributes.

Using 'yarn extract-translations' will update alphabetically sorted JSON files with key-translations pairs. It will use default messages for keys without explicit translations.

# Project structure

```
-| public/: Public assets
-| src/
 |--| app/: Main application (framework) files.
 |--| common/: Base components, services, utils, rules, enums etc. used in the whole app.
 |--| features/: Features bundled into separate modules including containers, components, ducks, apis etc.
 |--| resources/: locales, files etc.
 |--| index.js: application entry file
-| stories/: Storybook stories used to component development and demos.
```

# App Packages in use

- `antd`: A UI library.
- `axios`: Promise based HTTP client for the browser and node.js.
- `i18next`: An internationalization-framework.
- `less`: Dynamic stylesheet language.
- `react-router`: Declarative routing for React.
- `redux`: A state container.
- `redux-auth-wrapper`: A Higher Order Component for handling Authentication and Authorization.
- `redux-modal`: Redux based modal solution.
- `redux-persist`: Persist and rehydrate a redux store.
- `redux-saga`: A side effect model for Redux apps.
- `reselect`: Selector library for Redux.

# Dev Packages in use

- `create-react-app`: Create React apps with no build configuration.
- `prettier`: Opinionated code formatter.
- `redux-logger`: Logger for Redux.
- `source-map-explorer`: Analyze and debug space usage through source maps.
- `@storybook/react`: Interactive UI component dev & test.

# Gradle

Tasks:

- `start` - wrapper for `yarn start`, also runs `yarn install`
- `yarnBuild` - wrapper for `yarn build`, also runs `yarn install`
- `syncS3` - copies `build/` to S3 using `aws` executable

When you run _build_ task, _yarnBuild_ is executed as well. _syncS3_ task should not be run manually.
Only a build job (with env variable BUILD_TYPE=DEPLOY) is allowed to deploy to S3.
