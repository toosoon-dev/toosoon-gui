import { createCanvas } from 'toosoon-utils/lib/dom';
import { clamp, map, roundTo } from 'toosoon-utils/lib/maths';

import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for 2D coordinates
 *
 * @exports
 * @class CoordsController
 * @extends {GUIController}
 */
export default class CoordsController extends GUIController<{ x: number; y: number }> {
  readonly $canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly $display: HTMLDivElement;
  readonly $displayX: HTMLDivElement;
  readonly $displayY: HTMLDivElement;

  private width: number = 128;
  private height: number = 128;

  private _min: number = -1;
  private _max: number = 1;
  private _step?: number;
  private _decimals?: number;

  constructor(parent: GUI, object: object, property: string, min?: number, max?: number, step?: number) {
    super(parent, object, property, 'canvas');

    const { canvas, ctx } = createCanvas(this.width, this.height);
    this.$canvas = canvas;
    this.ctx = ctx;

    this.$display = document.createElement('div');
    this.$display.classList.add('display');

    this.$displayX = document.createElement('div');
    this.$displayY = document.createElement('div');
    this.$display.appendChild(this.$displayX);
    this.$display.appendChild(this.$displayY);

    this.$widget.appendChild(this.$canvas);
    this.$widget.insertBefore(this.$display, this.$canvas);
    this.$disable = this.$canvas;

    // *********************
    // Events
    // *********************
    let prevClientX: number;
    let prevClientY: number;

    const setValue = (clientX: number, clientY: number, shiftKey = false) => {
      const { left, right, top, bottom } = this.$canvas.getBoundingClientRect();
      let x = map(clientX, left, right, this._min, this._max);
      let y = map(clientY, top, bottom, this._min, this._max);
      x = this.snapClamp(x);
      y = this.snapClamp(y);
      if (shiftKey) {
        const dx = Math.abs(prevClientX - clientX);
        const dy = Math.abs(prevClientY - clientY);
        x = dx >= dy ? x : prevClientX;
        y = dy >= dx ? y : prevClientY;
      }
      this.setValue({ x, y });
    };

    // Mouse
    const onMouseDown = (event: MouseEvent) => {
      setValue(event.clientX, event.clientY);
      this.setDraggingStyle(true);
      prevClientX = event.clientX;
      prevClientY = event.clientY;
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    };

    const onMouseUp = () => {
      this.callOnFinishChange();
      this.setDraggingStyle(false);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    const onMouseMove = (event: MouseEvent) => {
      setValue(event.clientX, event.clientY, event.shiftKey);
    };

    // Touch drag
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) return;
      event.preventDefault();
      setValue(event.touches[0].clientX, event.touches[0].clientY);
      this.setDraggingStyle(true);
      prevClientX = event.touches[0].clientX;
      prevClientY = event.touches[0].clientY;
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
    };

    const onTouchEnd = () => {
      this.callOnFinishChange();
      this.setDraggingStyle(false);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchmove', onTouchMove);
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      setValue(event.touches[0].clientX, event.touches[0].clientY);
    };

    // Bind
    this.$canvas.addEventListener('mousedown', onMouseDown);
    this.$canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    if (Number(min) === min) this.min(min);
    if (Number(max) === max) this.max(max);
    if (Number(step) === step) this.step(step);

    this.updateDisplay();
  }

  public min(min: number) {
    this._min = min;
    this.updateDisplay();
    return this;
  }

  public max(max: number) {
    this._max = max;
    this.updateDisplay();
    return this;
  }

  public step(step: number) {
    this._step = step;
    return this;
  }

  public decimals(decimals: number) {
    this._decimals = decimals;
    this.updateDisplay();
    return this;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.$canvas.width = width;
    this.$canvas.height = height;
    this.updateDisplay();
    return this;
  }

  public updateDisplay() {
    const { x, y } = this.getValue();
    this.$displayX.innerHTML = typeof this._decimals === 'undefined' ? `x: ${x}` : `x: ${x.toFixed(this._decimals)}`;
    this.$displayY.innerHTML = typeof this._decimals === 'undefined' ? `y: ${y}` : `y: ${y.toFixed(this._decimals)}`;
    this.draw();
    return this;
  }

  private draw() {
    const value = this.getValue();
    let x = map(value.x, this._min, this._max, 0, this.width);
    let y = map(value.y, this._min, this._max, 0, this.height);

    const style = getComputedStyle(this.parent.root.domElement);

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = style.getPropertyValue('--widget-color');
    this.ctx.strokeStyle = '';
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.fillStyle = '';
    this.ctx.strokeStyle = style.getPropertyValue('--number-color');
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.height);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.width, y);
    this.ctx.stroke();
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
   * @returns {number}
   */
  private snapClamp(value: number): number {
    return clamp(this.snap(value), this._min, this._max);
  }

  /**
   * @param {boolean} active
   */
  private setDraggingStyle(active: boolean) {
    this.$canvas?.classList.toggle('active', active);
    document.body.classList.toggle('gui-dragging', active);
  }
}
