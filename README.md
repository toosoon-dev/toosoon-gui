# TOOSOON GUI

Graphical user interface (GUI) library providing functionalities for manipulating variables and fire functions on the fly.

**Credits**: [dat.gui](https://github.com/dataarts/dat.gui)

## Installation

Yarn:

```properties
$ yarn add toosoon-gui
```

NPM:

```properties
$ npm install toosoon-gui
```

## Documentation

### Usage

#### Basic

```ts
import GUI from 'toosoon-gui';

const gui = new GUI({ title: 'Settings' });
```

#### GUI Wrapper

The `GUIWrapper` class allows you to create a fake instance of `GUI`. This is helpful when you need to remove the GUI features on some environments.

```ts
import GUI, { Gui, GUIWrapper } from 'toosoon-gui';

const gui: Gui = DEBUG ? new GUI() : new GUIWrapper();
```

## API

See full documentation [here](./docs/API.md).

## License

MIT License, see [LICENSE](https://github.com/toosoon-dev/toosoon-gui/tree/master/LICENSE) for details
