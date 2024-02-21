# GUI API

## GUI

GUI folder that holds other folders and controllers.

- [new GUI(parameters)](#parameters)
  - [.root](#gui-root): `GUI`
  - [.parent](#gui-parent): `GUI`
  - [.children](#gui-children): `Array<GUI | Controller>`
  - [.folders](#gui-folders): `GUI[]`
  - [.controllers](#gui-controllers): `Controller[]`
  - [.domElement](#gui-dom-element): `HTMLElement`
  - [.$title](#gui-title-1): `HTMLElement`
  - [.$children](#gui-children-1): `HTMLElement`
  - [.title(title)](#gui-title-method): `this`
  - [.add(object, property)](#gui-add-method): `Controller`
  - [.addColor(object, property)](#gui-add-color-method): `ColorController`
  - [.addCoords(object, property)](#gui-add-coords-method): `CoordsController`
  - [.addAngle(object, property)](#gui-add-angle-method): `AngleController`
  - [.addFile(object, property)](#gui-add-file-method): `FileController`
  - [.addFolder(title)](#gui-add-folder-method): `GUI`
  - [.addVector(object, property)](#gui-add-vector-method): `GUI`
  - [.show()](#gui-show-method): `this`
  - [.hide()](#gui-hide-method): `this`
  - [.open()](#gui-open-method): `this`
  - [.close()](#gui-close-method): `this`
  - [.openAnimated()](#gui-open-animated-method): `this`
  - [.reset()](#gui-reset-method): `this`
  - [.onChange(callback)](#gui-on-change-method): `this`
  - [.onFinishChange(callback)](#gui-on-finish-change-method): `this`
  - [.onOpenClose(callback)](#gui-on-open-close-method): `this`
  - [.load(data)](#gui-load-method): `this`
  - [.save()](#gui-save-method): `object`
  - [.foldersRecursive()](#gui-folders-recursive-method): `GUI[]`
  - [.controllersRecursive()](#gui-controllers-recursive-method): `Controller[]`
  - [.destroy()](#gui-destroy-method)

### Parameters

| Parameter                 | Type          | Default      | Description                                                             |
| ------------------------- | ------------- | ------------ | ----------------------------------------------------------------------- |
| parameters                | `GUIParams`   | `{}`         |                                                                         |
| [parameters.parent]       | `GUI`         |              | Add the GUI as a child in another GUI.                                  |
| [parameters.autoPlace]    | `boolean`     |              | Add the GUI to `document.body` and fix it to the top right of the page. |
| [parameters.container]    | `HTMLElement` |              | Add the GUI to this DOM element (overrides `autoPlace`).                |
| [parameters.width]        | `number`      |              | Width of the GUI in pixels.                                             |
| [parameters.title]        | `string`      | `'Controls'` | Name to display in the title bar.                                       |
| [parameters.closeFolders] | `boolean`     | `false`      | Close all folders in the GUI by default.                                |
| [parameters.touchStyles]  | `boolean`     | `true`       | Make controllers larger on touch devices.                               |

### Properties

##### root <a id="gui-root"></a>

The top level GUI containing the GUI, or `this` if it is the root GUI.

```ts
gui.root: readonly GUI;
```

##### parent <a id="gui-parent"></a>

The GUI containing this GUI, or `undefined` if it is the root GUI.

```ts
gui.parent?: readonly GUI;
```

##### children <a id="gui-children"></a>

The list of folders and controllers contained by the GUI.

```ts
gui.children: readonly Array<GUI | Controller>;
```

##### folders <a id="gui-folders"></a>

The list of folders contained by the GUI.

```ts
gui.folders: readonly GUI[];
```

##### controllers <a id="gui-controllers"></a>

The list of controllers contained by the GUI.

```ts
gui.controllers: readonly Controller[];
```

##### domElement <a id="gui-dom"></a>

The outermost container element.

```ts
gui.domElement: readonly HTMLElement;
```

##### $title <a id="gui-title-1"></a>

The DOM element that contains the title.

```ts
gui.$title: readonly HTMLElement;
```

##### $children <a id="gui-children-1"></a>

The DOM element that contains children.

```ts
system.$children: readonly HTMLElement;
```

### Methods

##### title(title) <a id="gui-title-method"></a>

Change the title of the GUI.

- `title`: The title of the GUI.

```ts
gui.title(title: string) => this;
```

##### add(object, property) <a id="gui-add-method"></a>

Add a controller to the GUI.

- `object`: The object the controller will modify.
- `property`: Name of the property to control.
- `[$1] [$2] [$3]`: Parameters depending on the controller's type. See [controllers types](#controllers-types) for more details.

```ts
gui.add(object: object, property: string, $1?: any, $2?: number, $3?: number) => void;
```

##### addColor(object, property) <a id="gui-add-color-method"></a>

Add a controller to the GUI.

- `object`: The object the controller will modify.
- `property`: Name of the property to control.

```ts
gui.addColor(object: object, property: string) => ColorController;
```

##### addCoords(object, property) <a id="gui-add-coords-method"></a>

Add a 2D coords controller to the GUI.

- `object`: The object the controller will modify.
- `property`: Name of the property to control.
- `[min]`: Minimum value.
- `[max]`: Maximum value.
- `[step]`: Step value.

```ts
gui.addCoords(object: object, property: string, min?: number, max?: number, step?: number) => CoordsController
```

##### addAngle(object, property) <a id="gui-add-angle-method"></a>

Add an angle controller to the GUI.

- `object`: The object the controller will modify.
- `property`: Name of the property to control.
- `[step]`: Step value.

```ts
gui.addAngle(object: object, property: string, step?: number) => AngleController;
```

##### addFile(object, property) <a id="gui-add-file-method"></a>

Add a file controller to the GUI.

- `object`: The object the controller will modify.
- `property`: Name of the property to control.
- `[accept]`: MIME type the file input should accept.

```ts
gui.addFile(object: object, property: string, accept?: string) => FileController;
```

##### addFolder(title) <a id="gui-add-folder-method"></a>

Add a folder to the GUI.

- `title`: Title to display in the folder's title bar.

```ts
gui.addFolder(title: string) => GUI;
```

##### addVector(object, property) <a id="gui-add-vector-method"></a>

Add a vector folder to the GUI.

- `object`: The object the controller will modify.
- `property`: Name of the property to control.
- `[min]`: Minimum value.
- `[max]`: Maximum value.
- `[step]`: Step value.

```ts
gui.addVector(object: object, property: string, min?: number, max?: number, step?: number) => GUI
```

##### show() <a id="gui-show-method"></a>

Show the GUI after it's been hidden.

- `[show=true]`

```ts
gui.show(show?: boolean) => this;
```

##### hide() <a id="gui-hide-method"></a>

Hide the GUI.

- `[hide=true]`

```ts
gui.hide(hide?: boolean) => this;
```

##### open() <a id="gui-open-method"></a>

Open the GUI.

- `[open=true]`

```ts
gui.open(open?: boolean) => this;
```

##### close() <a id="gui-close-method"></a>

Close the GUI.

- `[close=true]`

```ts
gui.close(close?: boolean) => this;
```

##### openAnimated() <a id="gui-open-animated-method"></a>

Animate the GUI opening/closing.

- `[open=true]`

```ts
gui.openAnimated(open?: boolean) => this;
```

##### reset() <a id="gui-reset-method"></a>

Reset all controllers to their initial values.

- `[recursive=true]`: Pass `false` to exclude folders descending from the GUI.

```ts
gui.reset(recursive?: boolean) => this;
```

##### onChange(callback) <a id="gui-on-change-method"></a>

Pass a function to be called whenever a controller in the GUI changes.

- `callback`: Function to call.

```ts
gui.onChange(callback: Function) => this;
```

##### onFinishChange(callback) <a id="gui-on-finish-change-method"></a>

Pass a function to be called whenever a controller in the GUI has finished changing.

- `callback`: Function to call.

```ts
gui.onFinishChange(callback: Function) => this;
```

##### onOpenClose(callback) <a id="gui-on-open-close-method"></a>

Pass a function to be called when the GUI or its descendants are opened or closed.

- `callback`: Function to call.

```ts
gui.onOpenClose(callback: Function) => this;
```

##### load(data) <a id="gui-load-method"></a>

Re-call values that were saved with `save()`.

- `data`: Object to load values from.
- `[recursive=true]`: Pass `false` to exclude folders descending from the GUI.

```ts
gui.load(data: object, recursive?: boolean) => this;
```

##### save() <a id="gui-save-method"></a>

Return an object mapping controller names to values. The object can be passed to `load()` to recall these values.

- `[recursive=true]`: Pass `false` to exclude folders descending from the GUI.

```ts
gui.save(recursive?: boolean) => object;
```

##### foldersRecursive() <a id="gui-folders-recursive-method"></a>

Return an Array of folders contained by the GUI and its descendents.

```ts
gui.foldersRecursive() => GUI[];
```

##### controllersRecursive() <a id="gui-controllers-recursive-method"></a>

Return an Array of controllers contained by the GUI and its descendents.

```ts
gui.controllersRecursive() => Controller[];
```

##### destroy() <a id="gui-destroy-method"></a>

Destroy all DOM elements and event listeners associated with the GUI.

```ts
gui.destroy() => void;
```

## Controller

Abstract class that represents a given property of an object.

- Controller

  - [.id](#controller-id): `number`
  - [.parent](#controller-parent): `GUI`
  - [.object](#controller-object): `object`
  - [.property](#controller-property): `string`
  - [.initialValue](#controller-initial-value): `any`
  - [.domElement](#controller-dom-element): `HTMLElement`
  - [.$name](#controller-name): `HTMLElement`
  - [.$widget](#controller-widget): `HTMLElement`
  - [.$disable](#controller-disable): `HTMLElement`
  - [.name(name)](#controller-name-method): `this`
    <!-- - [.min(min)](#controller-min-method): `this` -->
    <!-- - [.max(max)](#controller-max-method): `this` -->
    <!-- - [.step(step)](#controller-step-method): `this` -->
    <!-- - [.decimals(decimals)](#controller-decimals-method): `this` -->
  - [.options(options)](#controller-options-method): `GUIController`
  - [.enable()](#controller-enable-method): `this`
  - [.disable()](#controller-disable-method): `this`
  - [.show()](#controller-show-method): `this`
  - [.hide()](#controller-hide-method): `this`
  - [.onChange(callback)](#controller-on-change-method): `this`
  - [.onFinishChange(callback)](#controller-on-finish-change-method): `this`
  - [.reset()](#controller-reset-method): `this`
  - [.listen()](#controller-listen-method): `this`
  - [.getValue()](#controller-get-value-method): `any`
  - [.setValue(value)](#controller-get-value-method): `this`
  - [.updateDisplay()](#controller-update-display-method): `this`
  - [.load(value)](#controller-load-method): `this`
  - [.save()](#controller-save-method): `any`
  - [.destroy()](#controller-destroy-method): `this`

### Properties

##### id <a id="controller-id"></a>

Unique identifier of an instance of `Controller`.

```ts
controller.id: readonly number;
```

##### parent <a id="controller-parent"></a>

The GUI that contains the controller.

```ts
controller.parent: readonly GUI;
```

##### object <a id="controller-object"></a>

The object this controller will modify.

```ts
controller.object: readonly object;
```

##### property <a id="controller-property"></a>

The name of the property to control.

```ts
controller.property: readonly string;
```

##### initialValue <a id="controller-initial-value"></a>

The value of `object[property]` when the controller was created.

```ts
controller.initialValue: readonly any;
```

##### domElement <a id="controller-domElement"></a>

The outermost container DOM element for the controller.

```ts
controller.domElement: readonly HTMLElement;
```

##### $name <a id="controller-name"></a>

The DOM element that contains the controller's name.

```ts
controller.$name: readonly HTMLElement;
```

##### $widget <a id="controller-widget"></a>

The DOM element that contains the controller's widget (which differs by controller type).

```ts
controller.$widget: readonly HTMLElement;
```

##### $disable <a id="controller-disable"></a>

The DOM element that receives the disabled attribute when using `disable()`.

```ts
controller.$disable: readonly HTMLElement;
```

### Methods

##### name(name) <a id="controller-name-method"></a>

Set the name of this controller and its label in the GUI.

- `name`: The name of the controller.

```ts
gui.name(name: string) => this;
```

##### options() <a id="controller-options-method"></a>

Change the controller into a dropdown of options. Calling this method on an option controller will simply update the options.

- `options`: Options object.

```ts
gui.options(options: object) => GUIController;
```

##### enable() <a id="controller-enable-method"></a>

Enable the controller.

- `[enabled=true]`

```ts
gui.enable(enabled?: boolean) => this;
```

##### disable() <a id="controller-disable-method"></a>

Disable the controller.

- `[disabled=true]`

```ts
gui.disable(disabled?: boolean) => this;
```

##### show() <a id="controller-show-method"></a>

Show the controller after it's been hidden.

- `[show=true]`

```ts
gui.show(show?: boolean) => this;
```

##### hide() <a id="controller-hide-method"></a>

Hide the controller.

- `[hide=true]`

```ts
gui.hide(hide?: boolean) => this;
```

##### onChange() <a id="controller-on-change-method"></a>

Pass a function to be called whenever the value is modified by the controller.
The function receives the new value as its first parameter and the value of `this` will be the controller.

- `callback`: Function to call.

```ts
gui.onChange(callback: Function) => this;
```

##### onFinishChange() <a id="controller-on-finish-change-method"></a>

Pass a function to be called after the controller has been modified and loses focus.

- `callback`: Function to call.

```ts
gui.onFinishChange(callback: Function) => this;
```

##### reset() <a id="controller-reset-method"></a>

Set the controller back to its initial value.

```ts
gui.reset() => this;
```

##### listen() <a id="controller-listen-method"></a>

Listen for value updates.

- `[listen=true]`

```ts
gui.listen(listen?: boolean) => this;
```

##### getValue() <a id="controller-get-value-method"></a>

Return `object[property]` value.

```ts
gui.getValue() => any;
```

##### setValue() <a id="controller-set-value-method"></a>

Set the value of `object[property]`.

- `value`: The controller value.

```ts
gui.setValue(value: any) => this;
```

##### updateDisplay() <a id="controller-update-display-method"></a>

Update the display to keep it in sync with the current value.

```ts
gui.updateDisplay() => this;
```

##### load() <a id="controller-load-method"></a>

Set the value of `object[property]` and call `callOnFinishChange()`.

- `value`: The controller value.

```ts
gui.load(value: any) => this;
```

##### save() <a id="controller-save-method"></a>

Return controller value.

```ts
gui.save() => any;
```

##### destroy() <a id="controller-destroy-method"></a>

Destroy the controller and remove it from the parent GUI.

```ts
gui.destroy() => void;
```

### Controllers types

#### Boolean Controller

GUI Controller for booleans.

```ts
const config = { boolean: true };

gui.add(config, 'boolean');
```

#### Number Controller

GUI Controller for numbers.

```ts
const config = { number: 1 };

gui.add(config, 'number');

// Pass min, max & step values as arguments
gui.add(config, 'number', 0, 1, 0.1);

// Set min, max & step values
gui.add(config, 'number').min(0).max(1).step(0.1);
```

#### String Controller

GUI Controller for strings.

```ts
const config = { string: 'value' };

gui.add(config, 'string');
```

#### Option Controller

GUI Controller for options.

```ts
const options = { foo: 'foo', bar: 'bar' };
const config = { option: 'foo' };

// Pass options value as an argument
gui.add(config, 'option', options);

// Set options value
gui.add(config, 'option').options(options);
```

#### Function Controller

GUI Controller for functions.

```ts
gui.add({ doSomething: () => console.log('done') }, 'doSomething');
```

#### Angle Controller

GUI Controller for angles.

```ts
const config = { angle: Math.PI };

gui.addAngle(config, 'angle');

// Pass step value as an argument
gui.addAngle(config, 'angle', Math.PI / 8);

// Set step value
gui.addAngle(config, 'angle').step(Math.PI / 8);
```

#### Coords Controller

GUI Controller for 2D coordinates.

```ts
const config = { coords: { x: 0, y: 0 } };

gui.addCoords(config, 'coords');

// Pass min, max & step values as arguments
gui.addCoords(config, 'coords', 0, 1, 0.1);

// Set min, max & step values
gui.addCoords(config, 'coords').min(0).max(1).step(0.1);
```

#### Color Controller

GUI Controller for colors.

```ts
const config = { color: '#ff0000' };

gui.addColor(config, 'color');
```

#### File Controller

GUI Controller for files.

```ts
function onLoad(dataURL: string) {
  console.log(dataURL);
}

gui.addFile({ onLoad }, 'onLoad', 'image/*');
```

## Usage

### Basic

```ts
import GUI from 'toosoon-gui';

const gui = new GUI({ title: 'Settings' });
```

### GUI Wrapper

The `GUIWrapper` class allows you to create a fake instance of `GUI`. This is helpful when you need to remove the GUI features on some environments.

```ts
import GUI, { Gui, GUIWrapper } from 'toosoon-gui';

const gui: Gui = DEBUG ? new GUI() : new GUIWrapper();
```
