import { BaseAction, SettingsEvent } from '../BaseAction';

interface LaunchPageSettings {
  lastfmUsername: string;
  targetPage: string;
}

const defaultSettings: LaunchPageSettings = {
  targetPage: 'profile',
  lastfmUsername: 'Verringer',
};

const paths: Record<string, string> = {
  profile: '',
  library: '/library',
  lastWeek: '/listening-report/week',
  lastMonth: '/listening-report/month',
  lastYear: '/listening-report/year',
};

export class LaunchPageAction extends BaseAction {
  private readonly settings = new Map<string, LaunchPageSettings>();

  didReceiveSettings({ context, settings }: SettingsEvent): void {
    const received = typeof settings === 'object' && settings !== null ? (settings as Partial<LaunchPageSettings>) : {};
    this.settings.set(context, { ...defaultSettings, ...received });
  }

  willDisappear(context: string): void {
    this.settings.delete(context);
  }

  keyUp(context: string): void {
    const settings = this.settings.get(context) ?? defaultSettings;
    if (settings.targetPage === 'homepage') {
      this.plugin.openUrl('https://www.last.fm');
      return;
    }

    if (settings.lastfmUsername === '') {
      this.plugin.showAlert(context);
      return;
    }

    const path = paths[settings.targetPage];
    if (path === undefined) {
      console.error('Invalid targetPage:', settings.targetPage);
      this.plugin.showAlert(context);
      return;
    }

    this.plugin.openUrl(`https://www.last.fm/user/${encodeURIComponent(settings.lastfmUsername)}${path}`);
  }
}
