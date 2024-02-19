import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for functions
 *
 * @exports
 * @class FunctionController
 * @extends {GUIController}
 */
export default class FunctionController extends GUIController<Function> {
  readonly $button: HTMLButtonElement;

  constructor(parent: GUI, object: object, property: string) {
    super(parent, object, property, 'function');

    this.$button = document.createElement('button');
    this.$button.appendChild(this.$name);

    this.$widget.appendChild(this.$button);
    this.$disable = this.$button;

    this.$button.addEventListener('click', (event) => {
      event.preventDefault();
      this.getValue().call(this.object);
      this.callOnChange();
    });

    // Enable :active pseudo class on mobile
    this.$button.addEventListener('touchstart', () => {}, { passive: true });
  }
}
