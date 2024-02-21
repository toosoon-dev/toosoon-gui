import { injectStyles } from 'toosoon-utils/dom';

import AngleController from './controllers/angle-controller';
import BooleanController from './controllers/boolean-controller';
import ColorController from './controllers/color-controller';
import Controller from './controllers/controller';
import CoordsController from './controllers/coords-controller';
import FileController from './controllers/file-controller';
import FunctionController from './controllers/function-controller';
import NumberController from './controllers/number-controller';
import OptionController from './controllers/option-controller';
import StringController from './controllers/string-controller';
import stylesheet from './stylesheet';
import { GuiData, GuiOnChangeCallback, GuiOnOpenCloseCallback } from './types';

export interface GUIParams {
  // Add this GUI as a child in another GUI
  parent?: GUI;
  // Add this GUI to `document.body` and fix it to the top right of the page
  autoPlace?: boolean;
  // Add this GUI to this DOM element (overrides `autoPlace`)
  container?: HTMLElement;
  // Width of this GUI in pixels
  // Note: You can make name labels wider in CSS with `.gui { ‑‑name‑width: 55% }`
  width?: number;
  // Name to display in the title bar
  title?: string;
  // Pass `true` to close all folders in this GUI by default
  closeFolders?: boolean;
  // Make controllers larger on touch devices
  // Pass `false` to disable touch styles
  touchStyles?: boolean;
}

/**
 * GUI folder that holds other folders and controllers
 *
 * @exports
 * @class GUI
 */
export default class GUI {
  /**
   * Static reference to GUI styles state
   */
  static stylesInjected = false;

  /**
   * The top level GUI containing this GUI, or `this` if this is the root GUI
   */
  readonly root: GUI;

  /**
   * The GUI containing this GUI, or `undefined` if this is the root GUI
   */
  readonly parent?: GUI;

  /**
   * The list of folders and controllers contained by this GUI
   */
  readonly children: Array<GUI | Controller> = [];

  /**
   * The list of folders contained by this GUI
   */
  readonly folders: GUI[] = [];

  /**
   * The list of controllers contained by this GUI
   */
  readonly controllers: Controller[] = [];

  /**
   * The outermost container element
   */
  readonly domElement: HTMLElement;

  /**
   * The DOM element that contains the title
   */
  readonly $title: HTMLElement;

  /**
   * The DOM element that contains children
   */
  readonly $children: HTMLElement;

  /**
   * this GUI's title
   * Use `gui.title(string)` to modify this value
   */
  public _title: string = '';

  /**
   * Used on the root GUI to determine if its descendants are closed by default, or `undefined` if this is not the root GUI
   */
  private _closeFolders?: boolean;

  /**
   * Used to determine if this GUI is closed
   * Use `gui.open()` or `gui.close()` to modify this value
   */
  public _closed: boolean = false;

  /**
   * Used to determine if this GUI is hidden
   * Use `gui.show()` or `gui.hide()` to modify this value
   */
  public _hidden: boolean = false;

  /**
   * Used to access the function bound to `onChange` events
   * Use the `gui.onChange(callback)` to modify this value
   */
  private _onChange?: GuiOnChangeCallback;

  /**
   * Used to access the function bound to `onFinishChange` events
   * Use the `gui.onFinishChange(callback)` to modify this value
   */
  private _onFinishChange?: GuiOnChangeCallback;

  /**
   * Used to access the function bound to `open` and `close` events
   * Use the `gui.onOpenClose(callback)` to modify this value
   */
  private _onOpenClose?: GuiOnOpenCloseCallback;

  constructor({
    parent,
    autoPlace = typeof parent === 'undefined',
    container,
    width,
    title = 'Controls',
    closeFolders = false,
    touchStyles = true
  }: GUIParams = {}) {
    this.root = parent ? parent.root : this;
    this.parent = parent;

    this.children = [];
    this.controllers = [];
    this.folders = [];

    this.domElement = document.createElement('div');
    this.domElement.classList.add('gui');

    this.$title = document.createElement('div');
    this.$title.classList.add('title');
    this.$title.setAttribute('role', 'button');
    this.$title.setAttribute('aria-expanded', 'true');
    this.$title.setAttribute('tabindex', '0');

    this.$title.addEventListener('click', () => this.openAnimated(this._closed));
    this.$title.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        this.$title.click();
      }
    });

    // Enable :active pseudo class on mobile
    this.$title.addEventListener('touchstart', () => {}, { passive: true });

    this.$children = document.createElement('div');
    this.$children.classList.add('children');

    this.domElement.appendChild(this.$title);
    this.domElement.appendChild(this.$children);

    this.title(title);

    if (this.parent) {
      this.parent.children.push(this);
      this.parent.folders.push(this);
      this.parent.$children.appendChild(this.domElement);
      return;
    }

    // *********************
    // Root GUI's
    // *********************
    this.domElement.classList.add('root');
    if (touchStyles) {
      this.domElement.classList.add('allow-touch-styles');
    }

    // Inject stylesheet if it's not been done that yet
    if (!GUI.stylesInjected) {
      injectStyles(stylesheet);
      GUI.stylesInjected = true;
    }

    // Init DOM element
    if (container) {
      container.appendChild(this.domElement);
    } else if (autoPlace) {
      this.domElement.classList.add('autoPlace');
      document.body.appendChild(this.domElement);
    }

    if (width) {
      this.domElement.style.setProperty('--width', width + 'px');
    }

    this._closeFolders = closeFolders;
  }

  /**
   * Change the title of this GUI
   *
   * @param {string} title The title of this GUI
   * @returns {this}
   */
  public title(title: string): this {
    this._title = title;
    this.$title.innerHTML = title;
    return this;
  }

  /**
   * Add a controller to this GUI
   *
   * @param {object} object   The object the controller will modify
   * @param {string} property Name of the property to control
   * @param {any} [$1]
   * @param {any} [$2]
   * @param {any} [$3]
   * @returns {Controller}
   */
  public add(object: object, property: string, $1?: any, $2?: any, $3?: any): Controller {
    const value: any = object[property as keyof object];

    if (Object($1) === $1 || Array.isArray($1)) {
      return new OptionController(this, object, property, $1 as object);
    }

    switch (typeof value) {
      case 'boolean':
        return new BooleanController(this, object, property);
      case 'function':
        return new FunctionController(this, object, property);
      case 'number':
        return new NumberController(this, object, property, $1, $2, $3);
      case 'string':
        return new StringController(this, object, property);
    }

    console.error(`
      gui.add failed
    property:
        ${property}
    object:
        ${object}
    value:
        ${value}
  `);

    return new Controller(this, object, property);
  }

  /**
   * Add a color controller to this GUI
   *
   * @param {object} object   The object the controller will modify
   * @param {string} property Name of the property to control
   * @returns {ColorController}
   */
  public addColor(object: object, property: string): ColorController {
    return new ColorController(this, object, property);
  }

  /**
   * Add a 2D coords controller to this GUI
   *
   * @param {object} object   The object the controller will modify
   * @param {string} property Name of the property to control
   * @param {number} [min]    Minimum value
   * @param {number} [max]    Maximum value
   * @param {number} [step]   Step value
   */
  public addCoords(object: object, property: string, min?: number, max?: number, step?: number): CoordsController {
    return new CoordsController(this, object, property, min, max, step);
  }

  /**
   * Add an angle controller to this GUI
   *
   * @param {object} object   The object the controller will modify
   * @param {string} property Name of the property to control
   * @param {number} [step]   Step value
   */
  public addAngle(object: object, property: string, step?: number): AngleController {
    return new AngleController(this, object, property, step);
  }

  /**
   * Add a file controller to this GUI
   *
   * @param {object} object   The object the controller will modify
   * @param {string} property Name of the property to control
   * @param {string} [accept] MIME type the file input should accept
   * @returns {FileController}
   */
  public addFile(object: object, property: string, accept?: string): FileController {
    return new FileController(this, object, property, accept);
  }

  /**
   * Add a folder to this GUI
   *
   * @param {string} title Title to display in the folder's title bar
   * @returns {GUI}
   */
  public addFolder(title: string): GUI {
    const folder = new GUI({ parent: this, title });
    if (this.root._closeFolders) folder.close();
    return folder;
  }

  /**
   * Add a vector folder to this GUI
   *
   * @param {object} object   The object the controller will modify
   * @param {string} property Name of the property to control
   * @param {number} [min]    Minimum value
   * @param {number} [max]    Maximum value
   * @param {number} [step]   Step value
   */
  public addVector(object: object, property: string, min?: number, max?: number, step?: number): GUI {
    const vector = object[property as keyof object] as object;
    const folder = this.addFolder(property);
    if (vector.hasOwnProperty('x')) this.add(vector, 'x', min, max, step);
    if (vector.hasOwnProperty('y')) this.add(vector, 'y', min, max, step);
    if (vector.hasOwnProperty('z')) this.add(vector, 'z', min, max, step);
    if (vector.hasOwnProperty('w')) this.add(vector, 'w', min, max, step);
    return folder;
  }

  /**
   * Show this GUI after it's been hidden
   *
   * @param {boolean} [show=true]
   * @returns {this}
   */
  public show(show: boolean = true): this {
    this._hidden = !show;
    this.domElement.style.display = this._hidden ? 'none' : '';
    return this;
  }

  /**
   * Hide this GUI
   *
   * @param {boolean} [hide=true]
   * @returns {this}
   */
  public hide(hide: boolean = true): this {
    return this.show(!hide);
  }

  /**
   * Open this GUI
   *
   * @param {boolean} [open=true]
   * @returns {this}
   */
  public open(open: boolean = true): this {
    this.setClosed(!open);
    this.$title.setAttribute('aria-expanded', String(!this._closed));
    this.domElement.classList.toggle('closed', this._closed);
    return this;
  }

  /**
   * Close this GUI
   *
   * @param {boolean} [close=true]
   * @returns {this}
   */
  public close(close: boolean = true): this {
    return this.open(!close);
  }

  /**
   * Animate this GUI opening/closing
   *
   * @param {boolean} [open=true]
   * @returns {this}
   */
  public openAnimated(open: boolean = true): this {
    this.setClosed(!open);

    this.$title.setAttribute('aria-expanded', String(!this._closed));

    requestAnimationFrame(() => {
      const initialHeight = this.$children.clientHeight;
      this.$children.style.height = initialHeight + 'px';

      this.domElement.classList.add('transition');

      const onTransitionEnd = (event: Event) => {
        if (event.target !== this.$children) return;
        this.domElement.classList.remove('transition');
        this.$children.removeEventListener('transitionend', onTransitionEnd);
        this.$children.style.height = '';
      };

      this.$children.addEventListener('transitionend', onTransitionEnd);

      const targetHeight = !open ? 0 : this.$children.scrollHeight;
      this.domElement.classList.toggle('closed', !open);

      requestAnimationFrame(() => {
        this.$children.style.height = targetHeight + 'px';
      });
    });

    return this;
  }

  private setClosed(closed: boolean): void {
    if (this._closed === closed) return;
    this._closed = closed;
    this.callOnOpenClose(this);
  }

  /**
   * Reset all controllers to their initial values
   *
   * @param {boolean} [recursive=true] Pass `false` to exclude folders descending from this GUI
   * @returns {this}
   */
  public reset(recursive: boolean = true): this {
    const controllers = recursive ? this.controllersRecursive() : this.controllers;
    controllers.forEach((controller) => controller.reset());
    return this;
  }

  /**
   * Pass a function to be called whenever a controller in this GUI changes
   *
   * @param {Function} callback Function to call
   * @returns {this}
   */
  public onChange(callback: GuiOnChangeCallback): this {
    this._onChange = callback;
    return this;
  }

  /**
   * Call the `gui.onChange()` methods of this GUI and its parent GUI
   *
   * @param {Controller} controller
   */
  public callOnChange(controller: Controller): void {
    if (this.parent) {
      this.parent.callOnChange(controller);
    }
    if (typeof this._onChange !== 'undefined') {
      this._onChange.call(this, {
        object: controller.object,
        property: controller.property,
        value: controller.getValue(),
        controller
      });
    }
  }

  /**
   * Pass a function to be called whenever a controller in this GUI has finished changing
   *
   * @param {Function} callback Function to call
   * @returns {this}
   */
  public onFinishChange(callback: GuiOnChangeCallback): this {
    this._onFinishChange = callback;
    return this;
  }

  /**
   * Call the `gui.onFinishChange()` methods of this GUI and its parent GUI
   *
   * @param {Controller} controller
   */
  public callOnFinishChange(controller: Controller): void {
    if (this.parent) {
      this.parent.callOnFinishChange(controller);
    }
    if (typeof this._onFinishChange !== 'undefined') {
      this._onFinishChange.call(this, {
        object: controller.object,
        property: controller.property,
        value: controller.getValue(),
        controller
      });
    }
  }

  /**
   * Pass a function to be called when this GUI or its descendants are opened or closed
   *
   * @param {Function} callback Function to call
   * @returns {this}
   */
  public onOpenClose(callback: GuiOnOpenCloseCallback): this {
    this._onOpenClose = callback;
    return this;
  }

  /**
   * Call the `gui.onOpenClose()` methods of this GUI and its parent GUI
   *
   * @param {GUI} gui
   */
  public callOnOpenClose(gui: GUI): void {
    if (this.parent) {
      this.parent.callOnOpenClose(gui);
    }
    if (typeof this._onOpenClose !== 'undefined') {
      this._onOpenClose.call(this, gui);
    }
  }

  /**
   * Re-call values that were saved with `gui.save()`
   *
   * @param {object} data              Object to load values from
   * @param {boolean} [recursive=true] Pass `false` to exclude folders descending from this GUI
   * @returns {this}
   */
  public load(data: GuiData, recursive: boolean = true): this {
    if (data.controllers) {
      this.controllers.forEach((controller) => {
        if (controller instanceof FileController || controller instanceof FunctionController) {
          return;
        }
        if (controller._name in data.controllers) {
          controller.load(data.controllers[controller._name]);
        }
      });
    }
    if (recursive && data.folders) {
      this.folders.forEach((folder) => {
        if (folder._title in data.folders) {
          folder.load(data.folders[folder._title]);
        }
      });
    }
    return this;
  }

  /**
   * Return an object mapping controller names to values
   * The object can be passed to `gui.load()` to recall these values
   *
   * @param {boolean} [recursive=true] Pass `false` to exclude folders descending from this GUI
   * @returns {object}
   */
  public save(recursive: boolean = true): GuiData {
    const data: GuiData = { folders: {}, controllers: {} };

    this.controllers.forEach((controller) => {
      if (controller instanceof FileController || controller instanceof FunctionController) {
        return;
      }
      if (controller._name in data.controllers) {
        throw new Error(`Cannot save GUI with duplicate property "${controller._name}"`);
      }
      data.controllers[controller._name] = controller.save();
    });
    if (recursive) {
      this.folders.forEach((folder) => {
        if (folder._title in data.folders) {
          throw new Error(`Cannot save GUI with duplicate folder "${folder._title}"`);
        }
        data.folders[folder._title] = folder.save();
      });
    }

    return data;
  }

  /**
   * Return an Array of folders contained by this GUI and its descendents
   *
   * @returns {GUI[]}
   */
  public foldersRecursive(): GUI[] {
    const folders = [...this.folders];
    this.folders.forEach((folder) => folders.push(...folder.foldersRecursive()));
    return folders;
  }

  /**
   * Return an Array of controllers contained by this GUI and its descendents
   *
   * @returns {Controller[]}
   */
  public controllersRecursive(): Controller[] {
    const controllers = [...this.controllers];
    this.folders.forEach((folder) => controllers.push(...folder.controllersRecursive()));
    return controllers;
  }

  /**
   * Destroy all DOM elements and event listeners associated with this GUI
   */
  public destroy(): void {
    if (this.parent) {
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent.folders.splice(this.parent.folders.indexOf(this), 1);
    }
    if (this.domElement.parentElement) {
      this.domElement.parentElement.removeChild(this.domElement);
    }
    this.children.forEach((child) => child.destroy());
  }

  // ******************************************
  // Recursive controllers methods
  // ******************************************
  public name(name: string) {
    return this.title(name);
  }
  public min(min: number) {
    this.controllersRecursive().forEach((controller) => controller.min(min));
    return this;
  }
  public max(max: number) {
    this.controllersRecursive().forEach((controller) => controller.max(max));
    return this;
  }
  public step(step: number) {
    this.controllersRecursive().forEach((controller) => controller.step(step));
    return this;
  }
  public decimals(decimals: number) {
    this.controllersRecursive().forEach((controller) => controller.decimals(decimals));
    return this;
  }
  public enable(enabled?: boolean) {
    this.controllersRecursive().forEach((controller) => controller.enable(enabled));
    return this;
  }
  public disable(disabled?: boolean) {
    this.controllersRecursive().forEach((controller) => controller.enable(disabled));
    return this;
  }
  public listen() {
    this.controllersRecursive().forEach((controller) => controller.listen());
    return this;
  }
}
