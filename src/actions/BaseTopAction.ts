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

  protected async handleRefresh(context: string): Promise<void> {
    await this.updateInfo(context);
  }

  protected abstract updateInfo(context: string): Promise<void>;
}
