import GUIController from './controllers/controller';
import GUI from './gui';
import { GuiControllerOnChangeCallback, GuiData, GuiOnChangeCallback } from './types';

export class GUIControllerWrapper {
  readonly id = 0;
  readonly parent!: GUIWrapper;
  readonly object!: object;
  readonly property!: string;
  readonly initialValue!: any;
  readonly domElement!: HTMLElement;
  readonly $name!: HTMLElement;
  readonly $widget!: HTMLElement;
  public $disable!: HTMLElement;
  public _name: string = '';
  public _disabled: boolean = false;
  public _hidden: boolean = false;
  public _changed: boolean = false;
  public name(_name: string) {
    return this;
  }
  public min(_min: number) {
    return this;
  }
  public max(_max: number) {
    return this;
  }
  public step(_step: number) {
    return this;
  }
  public decimals(_decimals: number) {
    return this;
  }
  public options(_options: object) {
    return this;
  }
  public enable(_enabled?: boolean) {
    return this;
  }
  public disable(_disabled?: boolean) {
    return this;
  }
  public show(_show?: boolean) {
    return this;
  }
  public hide(_hide?: boolean) {
    return this;
  }
  public onChange(_callback: GuiControllerOnChangeCallback) {
    return this;
  }
  public onFinishChange(_callback: GuiControllerOnChangeCallback) {
    return this;
  }
  public reset() {
    return this;
  }
  public listen(_listen?: boolean) {
    return this;
  }
  public getValue() {
    return;
  }
  public setValue(_value: any) {
    return this;
  }
  public updateDisplay() {
    return this;
  }
  public load(_value: any) {
    return this;
  }
  public save() {
    return;
  }
  public destroy() {}
}

export class GUIWrapper {
  static GUIControllerWrapper = new GUIControllerWrapper();
  readonly root!: GUI;
  readonly children: Array<GUI | GUIController> = [];
  readonly folders: GUI[] = [];
  readonly controllers: GUIController[] = [];
  public _closed = false;
  public _hidden = false;
  public _title = '';
  readonly domElement!: HTMLDivElement;
  readonly $title!: HTMLDivElement;
  readonly $children!: HTMLDivElement;
  public title(_title: string) {
    return this;
  }
  public add(_object: object, _property: string, _$1?: any, _$2?: number, _$3?: number) {
    return GUIWrapper.GUIControllerWrapper;
  }
  public addColor(_object: object, _property: string) {
    return GUIWrapper.GUIControllerWrapper;
  }
  public addCoords(_object: object, _property: string, _min?: number, _max?: number, _step?: number) {
    return GUIWrapper.GUIControllerWrapper;
  }
  public addAngle(_object: object, _property: string, _step?: number) {
    return GUIWrapper.GUIControllerWrapper;
  }
  public addFile(_object: object, _property: string, _accept?: string) {
    return GUIWrapper.GUIControllerWrapper;
  }
  public addFolder(_title: string) {
    return this;
  }
  public addVector(_object: object, _property: string, _min?: number, _max?: number, _step?: number) {
    return this;
  }
  public show(_show?: boolean) {
    return this;
  }
  public hide(_hide?: boolean) {
    return this;
  }
  public open(_open?: boolean) {
    return this;
  }
  public close(_close?: boolean) {
    return this;
  }
  public openAnimated(_open?: boolean) {
    return this;
  }
  public reset(_recursive?: boolean) {
    return this;
  }
  public onChange(_callback: GuiOnChangeCallback) {
    return this;
  }
  public callOnChange(_controller: GUIControllerWrapper) {}
  public onFinishChange(_callback: GuiOnChangeCallback) {
    return this;
  }
  public callOnFinishChange(_controller: GUIControllerWrapper) {}
  public onOpenClose(_callback: (gui: this) => void) {
    return this;
  }
  public callOnOpenClose(_gui: this) {}
  public load(_data: GuiData, _recursive?: boolean) {
    return this;
  }
  public save(_recursive?: boolean): GuiData {
    return { folders: {}, controllers: {} };
  }
  public controllersRecursive(): GUIControllerWrapper[] {
    return [];
  }
  public foldersRecursive(): GUIControllerWrapper[] {
    return [];
  }
  public destroy() {}
  // Recursive controllers methods
  public name(_name: string) {
    return this;
  }
  public min(_min: number) {
    return this;
  }
  public max(_max: number) {
    return this;
  }
  public step(_step: number) {
    return this;
  }
  public decimals(_decimals: number) {
    return this;
  }
  public enable(_enabled?: boolean) {
    return this;
  }
  public disable(_disabled?: boolean) {
    return this;
  }
  public listen() {
    return this;
  }
}
