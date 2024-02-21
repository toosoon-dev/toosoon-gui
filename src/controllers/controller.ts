import GUI from '../gui';
import { GuiControllerOnChangeCallback } from '../types';

/**
 * GUI Controller abstract class
 *
 * @exports
 * @class GUIController
 */
export default class GUIController<T = any> {
  /**
   * Static reference to Controller id
   */
  static id = 1;

  /**
   * Unique identifier of an instance of Controller
   */
  readonly id: number;

  /**
   * The GUI that contains this controller
   */
  readonly parent: GUI;

  /**
   * The object this controller will modify
   */
  readonly object: object;

  /**
   * The name of the property to control
   */
  readonly property: string;

  /**
   * The value of `object[property]` when this controller was created
   */
  readonly initialValue: T;

  /**
   * The outermost container DOM element for this controller
   */
  readonly domElement: HTMLElement;

  /**
   * The DOM element that contains this controller's name
   */
  readonly $name: HTMLElement;

  /**
   * The DOM element that contains this controller's widget (which differs by controller type)
   */
  readonly $widget: HTMLElement;

  /**
   * The DOM element that receives the disabled attribute when using disable()
   */
  public $disable: HTMLElement;

  /**
   * This controller's name
   * Use `controller.name(string)` to modify this value
   */
  public _name: string = '';

  /**
   * Used to determine if this controller is disabled
   * Use `controller.disable(boolean)` to modify this value
   */
  public _disabled: boolean = false;

  /**
   * Used to determine if this controller is hidden
   * Use `controller.show()` or `controller.hide()` to modify this value
   */
  public _hidden: boolean = false;

  /**
   * Used to determine if this controller value has changed
   */
  public _changed: boolean = false;

  /**
   * Used to access the function bound to `onChange` events
   * Use the `controller.onChange(callback)` to modify this value
   */
  protected _onChange?: GuiControllerOnChangeCallback<T>;

  /**
   * Used to access the function bound to `onFinishChange` events
   * Use the `controller.onFinishChange(callback)` to modify this value
   */
  protected _onFinishChange?: GuiControllerOnChangeCallback<T>;

  /**
   * Used to determine if this controller is currently listening
   * Use `controller.listen(boolean)` to modify this value
   */
  protected _listening: boolean = false;

  /**
   * Used to determine if this controller value has changed outside of this controller logic
   */
  protected _listenPreviousValue?: T;

  /**
   * Controller RAF callback ID
   */
  protected listenCallbackID?: number;

  /**
   * @param {GUI} parent                 The GUI that contains this controller
   * @param {object} object              The object this controller will modify
   * @param {string} property            The name of the property to control
   * @param {string} [className='']      A className to add to this controller DOM Element
   * @param {string} [elementType='div'] The tag name of this controller DOM Element
   */
  constructor(parent: GUI, object: object, property: string, className: string = '', elementType: string = 'div') {
    this.id = GUIController.id++;

    this.parent = parent;
    this.object = object;
    this.property = property;
    this.initialValue = this.getValue();

    this.domElement = document.createElement(elementType);
    this.domElement.classList.add('controller');
    this.domElement.classList.add(className);

    this.$name = document.createElement('div');
    this.$name.classList.add('name');
    this.$name.id = `gui-name-${this.id}`;

    this.$widget = document.createElement('div');
    this.$widget.classList.add('widget');

    this.$disable = this.$widget;

    this.domElement.appendChild(this.$name);
    this.domElement.appendChild(this.$widget);

    // Don't fire global key events while typing in a controller
    this.domElement.addEventListener('keydown', (event) => event.stopPropagation());
    this.domElement.addEventListener('keyup', (event) => event.stopPropagation());

    this.parent.children.push(this);
    this.parent.controllers.push(this);

    this.parent.$children.appendChild(this.domElement);

    this.listenCallback = this.listenCallback.bind(this);

    this.name(property);
  }

  /**
   * Set the name of this controller and its label in this GUI
   *
   * @param {string} name The name of this controller
   * @returns {this}
   */
  public name(name: string): this {
    this._name = name;
    this.$name.innerHTML = name;
    return this;
  }

  /**
   * Set the minimum value
   * --> Only works on number controllers
   *
   * @param {number} min
   * @returns {this}
   */
  public min(_min: number): this {
    return this;
  }

  /**
   * Set the maximum value
   * --> Only works on number controllers
   *
   * @param {number} max
   * @returns {this}
   */
  public max(_max: number): this {
    return this;
  }

  /**
   * Values set by this controller will be rounded to multiples of `step`
   * --> Only works on number controllers
   *
   * @param {number} step
   * @returns {this}
   */
  public step(_step: number): this {
    return this;
  }

  /**
   * Round the displayed value to a fixed number of decimals, without affecting the actual value like `step()`
   * --> Only works on number controllers
   *
   * @param {number} decimals
   * @returns {this}
   */
  public decimals(_decimals: number): this {
    return this;
  }

  /**
   * Change this controller into a dropdown of options
   * Note: Calling this method on an option controller will simply update the options
   *
   * @param {object} options Options object
   * @returns {GUIController}
   */
  public options(options: object): GUIController {
    const controller = this.parent.add(this.object, this.property, options);
    controller?.name(this._name);
    this.destroy();
    return controller;
  }

  /**
   * Enable this controller
   *
   * @param {boolean} [enabled=true]
   * @returns {this}
   */
  public enable(enabled: boolean = true): this {
    return this.disable(!enabled);
  }

  /**
   * Disable this controller
   *
   * @param {boolean} [disabled=true]
   * @returns {this}
   */
  public disable(disabled: boolean = true): this {
    if (disabled === this._disabled) return this;
    this._disabled = disabled;
    this.domElement.classList.toggle('disabled', disabled);
    this.$disable.toggleAttribute('disabled', disabled);
    return this;
  }

  /**
   * Show this controller after it's been hidden
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
   * Hide this controller
   *
   * @param {boolean} [hide=true]
   * @returns {this}
   */
  public hide(hide: boolean = true): this {
    return this.show(!hide);
  }

  /**
   * Pass a function to be called whenever the value is modified by this controller
   * The function receives the new value as its first parameter
   * The value of `this` will be this controller
   *
   * @param {Function} callback Function to call
   * @returns {this}
   */
  public onChange(callback: GuiControllerOnChangeCallback<T>): this {
    this._onChange = callback;
    return this;
  }

  /**
   * Call the `onChange()` methods of this controller and its parent GUI
   */
  protected callOnChange(): void {
    this.parent.callOnChange(this);

    if (typeof this._onChange !== 'undefined') {
      this._onChange.call(this, this.getValue());
    }

    this._changed = true;
  }

  /**
   * Pass a function to be called after this controller has been modified and loses focus
   *
   * @param {Function} callback Function to call
   * @returns {this}
   */
  public onFinishChange(callback: GuiControllerOnChangeCallback<T>): this {
    this._onFinishChange = callback;
    return this;
  }

  /**
   * Call the `onFinishChange()` methods of this controller and its parent GUI
   */
  protected callOnFinishChange() {
    if (this._changed) {
      this.parent.callOnFinishChange(this);
      if (typeof this._onFinishChange !== 'undefined') {
        this._onFinishChange.call(this, this.getValue());
      }
    }

    this._changed = false;
  }

  /**
   * Set this controller back to its initial value
   *
   * @returns {this}
   */
  public reset(): this {
    this.setValue(this.initialValue);
    this.callOnFinishChange();
    return this;
  }

  /**
   * Listen for value updates
   *
   * @param {boolean} [listen=true]
   * @returns {this}
   */
  public listen(listen: boolean = true): this {
    this._listening = listen;

    if (typeof this.listenCallbackID !== 'undefined') {
      cancelAnimationFrame(this.listenCallbackID);
      this.listenCallbackID = undefined;
    }
    if (this._listening) {
      this.listenCallback();
    }

    return this;
  }

  /**
   * Call `updateDisplay()` every animation frame
   */
  private listenCallback() {
    this.listenCallbackID = requestAnimationFrame(this.listenCallback);

    const currentValue = this.getValue();
    if (currentValue !== this._listenPreviousValue) {
      this._listenPreviousValue = currentValue;
      this.updateDisplay();
    }
  }

  /**
   * Return `object[property]` value
   *
   * @returns {any}
   */
  public getValue(): T {
    return this.object[this.property as keyof object] as T;
  }

  /**
   * Set the value of `object[property]`
   *
   * @param {any} value The controller value
   * @returns {this}
   */
  public setValue(value: T): this {
    // @ts-ignore
    this.object[this.property] = value;
    this.callOnChange();
    this.updateDisplay();
    return this;
  }

  /**
   * Update the display to keep it in sync with the current value
   *
   * @returns {this}
   */
  public updateDisplay(): this {
    return this;
  }

  /**
   * Set the value of `object[property]` and call `callOnFinishChange()`
   *
   * @param {any} value The controller value
   * @returns {this}
   */
  public load(value: T): this {
    this.setValue(value);
    this.callOnFinishChange();
    return this;
  }

  /**
   * Return controller value
   *
   * @returns {any}
   */
  public save(): T {
    return this.getValue();
  }

  /**
   * Destroy this controller and remove it from the parent GUI
   */
  public destroy(): void {
    this.listen(false);
    this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent.controllers.splice(this.parent.controllers.indexOf(this), 1);
    this.parent.$children.removeChild(this.domElement);
  }
}
