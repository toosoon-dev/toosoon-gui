import GUIController from './controllers/controller';
import GUI from './gui';
import GUIWrapper, { GUIControllerWrapper } from './wrapper';

export type Gui = GUI | GUIWrapper;

export type GuiController = GUIController | GUIControllerWrapper;

export type GUIOnChangeCallback = (args: {
  object: object;
  property: string;
  value: any;
  controller: GUIController;
}) => void;

export type GUIControllerOnChangeCallback<T = any> = (value: T) => void;

export interface GUIData {
  folders: { [title: string]: any };
  controllers: { [name: string]: any };
}
