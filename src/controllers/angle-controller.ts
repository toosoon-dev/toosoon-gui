import { PI, TWO_PI } from 'toosoon-utils/lib/constants';
import { createCanvas } from 'toosoon-utils/lib/dom';
import { angle } from 'toosoon-utils/lib/geometry';
import { roundTo } from 'toosoon-utils/lib/maths';

import GUI from '../gui';
import GUIController from './controller';

/**
 * GUI Controller for angles
 *
 * @exports
 * @class AngleController
 * @extends {GUIController}
 */
export default class AngleController extends GUIController<number> {
  readonly $canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly $display: HTMLDivElement;

  private width: number = 64;
  private height: number = 64;

  private _step?: number;
  private _decimals: number = 2;

  constructor(parent: GUI, object: object, property: string, step?: number) {
    super(parent, object, property, 'canvas');

    const { canvas, ctx } = createCanvas(this.width, this.height);
    this.$canvas = canvas;
    this.ctx = ctx;

    this.$display = document.createElement('div');
    this.$display.classList.add('display');

    this.$widget.appendChild(this.$canvas);
    this.$widget.insertBefore(this.$display, this.$canvas);
    this.$disable = this.$canvas;

    // *********************
    // Events
    // *********************
    const setValue = (clientX: number, clientY: number) => {
      const { left, top } = this.$canvas.getBoundingClientRect();
      let value = TWO_PI - angle(left + this.width / 2, top + this.height / 2, clientX, clientY);
      value = this.snap(value % TWO_PI);
      this.setValue(value);
    };

    // Mouse
    const onMouseDown = (event: MouseEvent) => {
      setValue(event.clientX, event.clientY);
      this.setDraggingStyle(true);
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
      setValue(event.clientX, event.clientY);
    };

    // Touch drag
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) return;
      event.preventDefault();
      setValue(event.touches[0].clientX, event.touches[0].clientY);
      this.setDraggingStyle(true);
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

    if (Number(step) === step) this.step(step);

    this.updateDisplay();
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
    const value = this.getValue();
    this.$display.innerHTML = `${(value / PI).toFixed(this._decimals)} π`;
    this.draw();
    return this;
  }

  private draw() {
    const value = this.getValue();

    const style = getComputedStyle(this.parent.root.domElement);
    const radius = Math.min(this.width, this.height) / 2 - 1;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = style.getPropertyValue('--widget-color');
    this.ctx.strokeStyle = style.getPropertyValue('--number-color');
    this.ctx.arc(centerX, centerY, radius, 0, TWO_PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.fillStyle = '';
    this.ctx.strokeStyle = style.getPropertyValue('--number-color');
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(centerX + Math.cos(-value) * radius, centerY + Math.sin(-value) * radius);
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
   * @param {boolean} active
   */
  private setDraggingStyle(active: boolean) {
    this.$canvas?.classList.toggle('active', active);
    document.body.classList.toggle('gui-dragging', active);
  }
}
