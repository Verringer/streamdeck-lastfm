import { Plugin } from '@rweich/streamdeck-ts';

export abstract class BaseAction {
  constructor(protected plugin: Plugin) { }

  async willAppear(context: string, action: string): Promise<void> {
    // Default implementation (does nothing)
  }

  async keyUp(context: string, action: string): Promise<void> {
    // Default implementation (does nothing)
  }

  async keyDown(context: string, action: string): Promise<void> {
    // Default implementation (does nothing)
  }

  async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }): Promise<void> {
    // Default implementation (does nothing)
  }

}