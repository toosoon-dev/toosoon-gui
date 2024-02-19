/* eslint-disable @typescript-eslint/no-explicit-any */
import { hexToRgb, normalizeHexString, rgbToHexString } from 'toosoon-utils/lib/colors';

import GUI from '../gui';
import GUIController from './controller';

// Color formats
interface ColorObject {
  r: number;
  g: number;
  b: number;
}

type Color = number | number[] | string | ColorObject;

interface ColorFormat {
  isPrimitive: boolean;
  match: (color: Color) => boolean;
  fromHexString: (hex: string) => Color;
  toHexString: (color: any) => string;
}

const STRING: ColorFormat = {
  isPrimitive: true,
  match: (color: Color) => typeof color === 'string',
  fromHexString: normalizeHexString,
  toHexString: normalizeHexString
};

const NUMBER: ColorFormat = {
  isPrimitive: true,
  match: (color: Color) => typeof color === 'number',
  fromHexString: hexToRgb, // to one number
  toHexString: rgbToHexString
};

const ARRAY: ColorFormat = {
  isPrimitive: false,
  match: (color: Color) => Array.isArray(color),
  fromHexString: hexToRgb,
  toHexString: rgbToHexString
};

const OBJECT: ColorFormat = {
  isPrimitive: false,
  match: (color: Color) => Object(color) === color,
  fromHexString(string: string) {
    const rgb = hexToRgb(string);
    return { r: rgb[0], g: rgb[1], b: rgb[2] };
  },
  toHexString({ r, g, b }: ColorObject) {
    return rgbToHexString([r, g, b]);
  }
};

const FORMATS = [STRING, NUMBER, ARRAY, OBJECT];

/**
 * GUI Controller for colors
 *
 * @exports
 * @class ColorController
 * @extends {GUIController}
 */
export default class ColorController extends GUIController<Color> {
  readonly $input: HTMLInputElement;
  readonly $text: HTMLInputElement;
  readonly $display: HTMLDivElement;

  private _format: ColorFormat;
  private _initialValueHexString: string;
  private _textFocused: boolean = false;

  constructor(parent: GUI, object: object, property: string) {
    super(parent, object, property, 'color');

    this.$input = document.createElement('input');
    this.$input.setAttribute('type', 'color');
    this.$input.setAttribute('tabindex', '-1');
    this.$input.setAttribute('aria-labelledby', this.$name.id);

    this.$text = document.createElement('input');
    this.$text.setAttribute('type', 'text');
    this.$text.setAttribute('spellcheck', 'false');
    this.$text.setAttribute('aria-labelledby', this.$name.id);

    this.$display = document.createElement('div');
    this.$display.classList.add('display');

    this.$display.appendChild(this.$input);
    this.$widget.appendChild(this.$display);
    this.$widget.appendChild(this.$text);
    this.$disable = this.$text;

    this._format = ColorController.getColorFormat(this.initialValue);
    this._initialValueHexString = this.save();

    this.$input.addEventListener('input', () => {
      this.setValueFromHexString(this.$input.value);
    });

    this.$input.addEventListener('blur', () => {
      this.callOnFinishChange();
    });

    this.$text.addEventListener('input', () => {
      const hex = normalizeHexString(this.$text.value);
      this.setValueFromHexString(hex);
    });

    this.$text.addEventListener('focus', () => {
      this._textFocused = true;
      this.$text.select();
    });

    this.$text.addEventListener('blur', () => {
      this._textFocused = false;
      this.updateDisplay();
      this.callOnFinishChange();
    });

    this.updateDisplay();
  }

  public reset() {
    this.setValueFromHexString(this._initialValueHexString);
    return this;
  }

  public save() {
    return this.toHexString(this.getValue());
  }

  public load(value: string) {
    this.setValueFromHexString(value);
    this.callOnFinishChange();
    return this;
  }

  public updateDisplay() {
    this.$input.value = String(this._format.toHexString(this.getValue()));
    if (!this._textFocused) {
      this.$text.value = this.$input.value.substring(1);
    }
    this.$display.style.backgroundColor = this.$input.value;
    return this;
  }

  /**
   * Alias for `_format.fromHexString()`
   *
   * @param {string} hex
   * @returns {Color}
   */
  private fromHexString(hex: string): Color {
    return this._format.fromHexString(hex);
  }

  /**
   * Alias for `_format.toHexString()`
   *
   * @param {Color} color
   * @returns {string}
   */
  private toHexString(color: Color): string {
    return this._format.toHexString(color);
  }

  /**
   * @param {string} hex
   */
  private setValueFromHexString(hex: string) {
    if (this._format.isPrimitive) {
      const newValue = this.fromHexString(hex);
      this.setValue(newValue);
    } else {
      let currentValue = this.getValue();
      if (ARRAY.match(currentValue)) {
        currentValue = currentValue as number[];
        const newValue = this.fromHexString(hex) as number[];
        currentValue[0] = newValue[0];
        currentValue[1] = newValue[1];
        currentValue[2] = newValue[2];
      } else if (OBJECT.match(currentValue)) {
        currentValue = currentValue as ColorObject;
        const newValue = this.fromHexString(hex) as ColorObject;
        currentValue.r = newValue.r;
        currentValue.g = newValue.g;
        currentValue.b = newValue.b;
      }
      this.callOnChange();
      this.updateDisplay();
    }
  }

  /**
   * Static method returning the color format used for color
   *
   * @param {Color} color
   * @returns {ColorFormat}
   */
  static getColorFormat(color: Color): ColorFormat {
    return FORMATS.find((format) => format.match(color)) as ColorFormat;
  }
}
