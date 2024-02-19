import { EPSILON } from 'toosoon-utils/constants';
import { clamp, map, roundTo } from 'toosoon-utils/maths';

import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for numbers
 *
 * @exports
 * @class NumberController
 * @extends {GUIController}
 */
export default class NumberController extends GUIController<number> {
  readonly $input: HTMLInputElement;
  private $slider!: HTMLDivElement;
  private $fill!: HTMLDivElement;

  private _min: number = -Infinity;
  private _max: number = Infinity;
  private _step: number = 0.1;
  private _stepExplicit: boolean = false;
  private _decimals?: number;

  private _hasSlider: boolean = false;
  private _inputFocused: boolean = false;

  constructor(parent: GUI, object: object, property: string, min?: number, max?: number, step?: number) {
    super(parent, object, property, 'number');

    // DOM
    this.$input = document.createElement('input');
    this.$input.setAttribute('type', 'text');
    this.$input.setAttribute('aria-labelledby', this.$name.id);

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) {
      this.$input.setAttribute('type', 'number');
      this.$input.setAttribute('step', 'any');
    }

    this.$widget.appendChild(this.$input);
    this.$disable = this.$input;

    // *********************
    // Events
    // *********************
    const onInput = () => {
      let value = parseFloat(this.$input.value);
      if (isNaN(value)) return;
      if (this._stepExplicit) value = this.snap(value);
      this.setValue(clamp(value, this._min, this._max));
    };

    // Keys
    const increment = (delta: number) => {
      const value = parseFloat(this.$input.value);
      if (isNaN(value)) return;
      this.snapClampSetValue(value + delta);
      this.$input.value = String(this.getValue());
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.$input.blur();
      }
      if (event.code === 'ArrowUp') {
        event.preventDefault();
        increment(this._step * this.getKeyMultiplier(event));
      }
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        increment(this._step * -this.getKeyMultiplier(event));
      }
    };

    // Mouse wheel
    const onWheel = (event: WheelEvent) => {
      if (this._inputFocused) {
        event.preventDefault();
        increment(this._step * this.normalizeMouseWheel(event));
      }
    };

    // Mouse drag
    const DRAG_THRESHOLD = 5;

    let testingForVerticalDrag = false;
    let initClientX: number;
    let initClientY: number;
    let prevClientY: number;
    let initValue: number;
    let dragDelta: number;

    const onMouseDown = (event: MouseEvent) => {
      initClientX = event.clientX;
      initClientY = prevClientY = event.clientY;
      testingForVerticalDrag = true;

      initValue = this.getValue();
      dragDelta = 0;

      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    };

    const onMouseUp = () => {
      this.setDraggingStyle(false, 'vertical');
      this.callOnFinishChange();
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (testingForVerticalDrag) {
        const dx = event.clientX - initClientX;
        const dy = event.clientY - initClientY;

        if (Math.abs(dy) > DRAG_THRESHOLD) {
          this.$input.blur();
          testingForVerticalDrag = false;
          this.setDraggingStyle(true, 'vertical');
        } else if (Math.abs(dx) > DRAG_THRESHOLD) {
          onMouseUp();
        }
      }

      if (!testingForVerticalDrag) {
        const dy = event.clientY - prevClientY;
        dragDelta -= dy * this._step * this.getKeyMultiplier(event);

        if (initValue + dragDelta > this._max) {
          dragDelta = this._max - initValue;
        } else if (initValue + dragDelta < this._min) {
          dragDelta = this._min - initValue;
        }

        this.snapClampSetValue(initValue + dragDelta);
      }

      prevClientY = event.clientY;
    };

    // Focus state
    const onFocus = () => {
      this._inputFocused = true;
    };

    const onBlur = () => {
      this._inputFocused = false;
      this.updateDisplay();
      this.callOnFinishChange();
    };

    // Bind
    this.$input.addEventListener('input', onInput);
    this.$input.addEventListener('keydown', onKeyDown);
    this.$input.addEventListener('wheel', onWheel, { passive: false });
    this.$input.addEventListener('mousedown', onMouseDown);
    this.$input.addEventListener('focus', onFocus);
    this.$input.addEventListener('blur', onBlur);

    if (Number(min) === min) this.min(min);
    if (Number(max) === max) this.max(max);

    const stepExplicit = typeof step !== 'undefined';
    this.step(stepExplicit ? step : this.getImplicitStep(), stepExplicit);

    this.updateDisplay();
  }

  public min(min: number) {
    this._min = min;
    this.onUpdateMinMax();
    return this;
  }

  public max(max: number) {
    this._max = max;
    this.onUpdateMinMax();
    return this;
  }

  private onUpdateMinMax() {
    if (!this._hasSlider && this.hasMin && this.hasMax) {
      if (!this._stepExplicit) {
        this.step(this.getImplicitStep(), false);
      }

      this.initSlider();
      this.updateDisplay();
    }
  }

  public step(step: number, explicit = true) {
    this._step = step;
    this._stepExplicit = explicit;
    return this;
  }

  public decimals(decimals: number) {
    this._decimals = decimals;
    this.updateDisplay();
    return this;
  }

  public updateDisplay() {
    const value = this.getValue();

    if (this._hasSlider) {
      const percent = map(value, this._min, this._max, 0, 100);
      this.$fill.style.width = `${percent}%`;
    }

    if (!this._inputFocused) {
      this.$input.value = typeof this._decimals === 'undefined' ? String(value) : value.toFixed(this._decimals);
    }

    return this;
  }

  /**
   * Init slider DOM & events
   */
  private initSlider() {
    this._hasSlider = true;

    // DOM
    this.$slider = document.createElement('div');
    this.$slider.classList.add('slider');

    this.$fill = document.createElement('div');
    this.$fill.classList.add('fill');

    this.$slider.appendChild(this.$fill);
    this.$widget.insertBefore(this.$slider, this.$input);

    this.domElement.classList.add('hasSlider');

    // *********************
    // Events
    // *********************
    const setValueFromX = (clientX: number) => {
      const rect = this.$slider.getBoundingClientRect();
      let value = map(clientX, rect.left, rect.right, this._min, this._max);
      this.snapClampSetValue(value);
    };

    // Mouse
    const onMouseDown = (event: MouseEvent) => {
      this.setDraggingStyle(true, 'horizontal');
      setValueFromX(event.clientX);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    };

    const onMouseUp = () => {
      this.callOnFinishChange();
      this.setDraggingStyle(false, 'horizontal');
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    const onMouseMove = (event: MouseEvent) => {
      setValueFromX(event.clientX);
    };

    // Touch drag
    let testingForScroll = false;
    let prevClientX: number;
    let prevClientY: number;

    const beginTouchDrag = (event: TouchEvent) => {
      event.preventDefault();
      this.setDraggingStyle(true, 'horizontal');
      setValueFromX(event.touches[0].clientX);
      testingForScroll = false;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) return;
      if (this.hasScrollBar) {
        prevClientX = event.touches[0].clientX;
        prevClientY = event.touches[0].clientY;
        testingForScroll = true;
      } else {
        beginTouchDrag(event);
      }
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
    };

    const onTouchEnd = () => {
      this.callOnFinishChange();
      this.setDraggingStyle(false, 'horizontal');
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchmove', onTouchMove);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (testingForScroll) {
        const dx = event.touches[0].clientX - prevClientX;
        const dy = event.touches[0].clientY - prevClientY;

        if (Math.abs(dx) > Math.abs(dy)) {
          beginTouchDrag(event);
        } else {
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEnd);
        }
      } else {
        event.preventDefault();
        setValueFromX(event.touches[0].clientX);
      }
    };

    // Mouse wheel
    const WHEEL_DEBOUNCE_TIME = 400;
    const callOnFinishChange = this.callOnFinishChange.bind(this);

    let wheelFinishChangeTimeout: number;

    const onWheel = (event: WheelEvent) => {
      const isVertical = Math.abs(event.deltaX) < Math.abs(event.deltaY);
      if (isVertical && this.hasScrollBar) return;
      event.preventDefault();

      const delta = this.normalizeMouseWheel(event) * this._step;
      this.snapClampSetValue(this.getValue() + delta);
      this.$input.value = String(this.getValue());

      // Debounce onFinishChange
      clearTimeout(wheelFinishChangeTimeout);
      wheelFinishChangeTimeout = setTimeout(callOnFinishChange, WHEEL_DEBOUNCE_TIME);
    };

    // Bind
    this.$slider.addEventListener('mousedown', onMouseDown);
    this.$slider.addEventListener('touchstart', onTouchStart, { passive: false });
    this.$slider.addEventListener('wheel', onWheel, { passive: false });
  }

  /**
   * @param {boolean} active
   * @param {'horizontal'|'vertical'} axis
   */
  private setDraggingStyle(active: boolean, axis: 'horizontal' | 'vertical') {
    if (this._hasSlider) this.$slider.classList.toggle('active', active);
    document.body.classList.toggle('gui-dragging', active);
    document.body.classList.toggle(`gui-${axis}`, active);
  }

  /**
   * @param {WheelEvent} event
   * @returns {number}
   */
  private normalizeMouseWheel(event: WheelEvent): number {
    // @ts-ignore
    const wheelDelta: number = event.wheelDelta;
    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    if (Math.floor(deltaY) !== deltaY && wheelDelta) {
      deltaX = 0;
      deltaY = -wheelDelta / 120;
      deltaY *= this._stepExplicit ? 1 : 10;
    }

    return deltaX - deltaY;
  }

  /**
   * @param {MouseEvent|KeyboardEvent} event
   * @returns {number}
   */
  private getKeyMultiplier(event: MouseEvent | KeyboardEvent): number {
    let multiplier = this._stepExplicit ? 1 : 10;
    if (event.shiftKey) {
      multiplier *= 10;
    } else if (event.altKey) {
      multiplier /= 10;
    }
    return multiplier;
  }

  /**
   * @param {number} value
   * @returns {number}
   */
  private snap(value: number): number {
    return roundTo(value, this._step);
  }

  /**
   * @param {number} value
   */
  private snapClampSetValue(value: number) {
    this.setValue(clamp(this.snap(value), this._min, this._max));
  }

  /**
   * @returns {number}
   */
  private getImplicitStep(): number {
    return this.hasMin && this.hasMax ? (this._max - this._min) / 1000 : 0.1;
  }

  /**
   * @returns {boolean}
   */
  public get hasScrollBar(): boolean {
    const root = this.parent.root.$children;
    return root.scrollHeight > root.clientHeight;
  }

  /**
   * @returns {boolean}
   */
  public get hasMin(): boolean {
    return this._min > -1 / EPSILON;
  }

  /**
   * @returns {boolean}
   */
  public get hasMax(): boolean {
    return this._max < 1 / EPSILON;
  }
}
