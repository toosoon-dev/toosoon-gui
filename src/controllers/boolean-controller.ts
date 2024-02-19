import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for booleans
 *
 * @exports
 * @class BooleanController
 * @extends {GUIController}
 */
export default class BooleanController extends GUIController<boolean> {
  readonly $input: HTMLInputElement;

  constructor(parent: GUI, object: object, property: string) {
    super(parent, object, property, 'boolean', 'label');

    this.$input = document.createElement('input');
    this.$input.setAttribute('type', 'checkbox');
    this.$input.setAttribute('aria-labelledby', this.$name.id);

    this.$widget.appendChild(this.$input);
    this.$disable = this.$input;

    this.$input.addEventListener('change', () => {
      this.setValue(this.$input.checked);
      this.callOnFinishChange();
    });

    this.updateDisplay();
  }

  public updateDisplay() {
    this.$input.checked = this.getValue();
    return this;
  }
}
