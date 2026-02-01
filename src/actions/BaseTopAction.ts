import { BaseAction, ActionSettings } from '../BaseAction';

export abstract class BaseTopAction extends BaseAction {

  async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }) {
    this.updateContextSettings(context, settings as ActionSettings);
    this.updateInfo(context);
  };

  async willAppear(context: string, action: string) {
    this.getOrCreateContextData(context);
    console.log(`Top Action widget appeared: ${context}`);
  }

  async keyDown(context: string, action: string) {
    await this.updateInfo(context);
    this.plugin.showOk(context);
  }

  protected abstract updateInfo(context: string): Promise<void>;
}
