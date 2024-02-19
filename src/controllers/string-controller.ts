import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for strings
 *
 * @exports
 * @class StringController
 * @extends {GUIController}
 */
export default class StringController extends GUIController<string> {
  readonly $input: HTMLInputElement;

  constructor(parent: GUI, object: object, property: string) {
    super(parent, object, property, 'string');

    this.$input = document.createElement('input');
    this.$input.setAttribute('type', 'text');
    this.$input.setAttribute('aria-labelledby', this.$name.id);

    this.$widget.appendChild(this.$input);
    this.$disable = this.$input;

    this.$input.addEventListener('input', () => {
      this.setValue(this.$input.value);
    });

    this.$input.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Enter') {
        this.$input.blur();
      }
    });

    this.$input.addEventListener('blur', () => {
      this.callOnFinishChange();
    });

    this.updateDisplay();
  }

  public updateDisplay() {
    this.$input.value = this.getValue();
    return this;
  }
}
