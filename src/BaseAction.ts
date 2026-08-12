import { Plugin } from '@rweich/streamdeck-ts';

export interface SettingsEvent {
  context: string;
  settings: unknown;
}

export abstract class BaseAction {
  constructor(protected readonly plugin: Plugin) {}

  willAppear(context: string, action: string): Promise<void> | void {
    void context;
    void action;
  }

  willDisappear(context: string, action: string): Promise<void> | void {
    void context;
    void action;
  }

  keyUp(context: string, action: string): Promise<void> | void {
    void context;
    void action;
  }

  keyDown(context: string, action: string): Promise<void> | void {
    void context;
    void action;
  }

  didReceiveSettings(event: SettingsEvent): Promise<void> | void {
    void event;
  }
}
