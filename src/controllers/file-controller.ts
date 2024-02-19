import { InputChangeEvent } from '@/data/types';

import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for files
 *
 * @exports
 * @class FileController
 * @extends {GUIController}
 */
export default class FileController extends GUIController<(dataURL: string) => void> {
  readonly $input: HTMLInputElement;

  constructor(parent: GUI, object: object, property: string, accept: string = '') {
    super(parent, object, property, 'file');

    this.$input = document.createElement('input');
    this.$input.setAttribute('type', 'input');
    this.$input.setAttribute('accept', accept);
    this.$input.setAttribute('aria-labelledby', this.$name.id);

    this.$widget.appendChild(this.$input);
    this.$disable = this.$input;

    const onChange = (event: InputChangeEvent) => {
      event.preventDefault();
      const file = event.target?.files?.[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.addEventListener('load', () => onFileLoad(file));
        fileReader.readAsDataURL(file);
      }
    };

    const onFileLoad = (file: File) => {
      const dataURL = URL.createObjectURL(file);
      this.getValue().call(object, dataURL);
      this.callOnChange();
    };

    this.$input.addEventListener('change', onChange);
  }
}
