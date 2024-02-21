import GUIController from './controllers/controller';
import GUI from './gui';
import { GUIControllerWrapper, GUIWrapper } from './wrapper';

export type Gui = GUI | GUIWrapper;

export type GuiController = GUIController | GUIControllerWrapper;

export type GuiOnChangeCallback = (args: {
  object: object;
  property: string;
  value: any;
  controller: GuiController;
}) => void;

export type GuiControllerOnChangeCallback<T = any> = (value: T) => void;

export type GuiOnOpenCloseCallback = (gui: Gui) => void;

export interface GuiData {
  folders: { [title: string]: any };
  controllers: { [name: string]: any };
}
