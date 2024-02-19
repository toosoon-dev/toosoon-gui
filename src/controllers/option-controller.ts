import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for options
 *
 * @exports
 * @class OptionController
 * @extends {GUIController}
 */
export default class OptionController extends GUIController {
  readonly $select: HTMLSelectElement;
  readonly $display: HTMLDivElement;

  private _values: any[] = [];
  private _names: string[] = [];

  constructor(parent: GUI, object: object, property: string, options: object) {
    super(parent, object, property, 'option');

    this.$select = document.createElement('select');
    this.$select.setAttribute('aria-labelledby', this.$name.id);

    this.$display = document.createElement('div');
    this.$display.classList.add('display');

    this.$widget.appendChild(this.$select);
    this.$widget.appendChild(this.$display);
    this.$disable = this.$select;

    this.$select.addEventListener('change', () => {
      this.setValue(this._values[this.$select.selectedIndex]);
      this.callOnFinishChange();
    });

    this.$select.addEventListener('focus', () => {
      this.$display.classList.add('focus');
    });

    this.$select.addEventListener('blur', () => {
      this.$display.classList.remove('focus');
    });

    this.options(options);
  }

  /**
   * @param {object} options
   * @returns {this}
   */
  public options(options: object): this {
    this._values = Array.isArray(options) ? options : Object.values(options);
    this._names = Array.isArray(options) ? options : Object.keys(options);

    this.$select.replaceChildren();

    this._names.forEach((name) => {
      const $option = document.createElement('option');
      $option.innerHTML = name;
      this.$select.appendChild($option);
    });

    this.updateDisplay();

    return this;
  }

  public updateDisplay() {
    const value = this.getValue();
    const index = this._values.indexOf(value);
    this.$select.selectedIndex = index;
    this.$display.innerHTML = index === -1 ? value : this._names[index];
    return this;
  }
}
