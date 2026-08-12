import { Plugin } from '@rweich/streamdeck-ts';
import { BaseAction, SettingsEvent } from '../BaseAction';

export interface PollingSettings {
  pollingFrequency: string;
}

interface ContextState<TSettings> {
  active: boolean;
  inFlight?: Promise<void>;
  settings?: TSettings;
  timer?: ReturnType<typeof setTimeout>;
}

export abstract class PollingAction<TSettings extends PollingSettings> extends BaseAction {
  private readonly contexts = new Map<string, ContextState<TSettings>>();

  constructor(
    plugin: Plugin,
    private readonly defaultSettings: TSettings,
    private readonly intervalUnitMs: number,
  ) {
    super(plugin);
  }

  async didReceiveSettings({ context, settings }: SettingsEvent): Promise<void> {
    const state = this.getState(context);
    state.settings = { ...this.defaultSettings, ...this.asSettings(settings) };

    if (state.active) {
      await this.refresh(context);
    }
  }

  async willAppear(context: string): Promise<void> {
    const state = this.getState(context);
    state.active = true;

    if (state.settings !== undefined) {
      await this.refresh(context);
    }
  }

  willDisappear(context: string): void {
    const state = this.contexts.get(context);
    if (state === undefined) {
      return;
    }

    state.active = false;
    this.clearTimer(state);
    this.contexts.delete(context);
  }

  async keyDown(context: string): Promise<void> {
    await this.refresh(context);
    this.plugin.showOk(context);
  }

  protected abstract update(context: string, settings: TSettings): Promise<void>;

  private asSettings(settings: unknown): Partial<TSettings> {
    return typeof settings === 'object' && settings !== null ? (settings as Partial<TSettings>) : {};
  }

  private clearTimer(state: ContextState<TSettings>): void {
    if (state.timer !== undefined) {
      clearTimeout(state.timer);
      state.timer = undefined;
    }
  }

  private getState(context: string): ContextState<TSettings> {
    let state = this.contexts.get(context);
    if (state === undefined) {
      state = { active: false };
      this.contexts.set(context, state);
    }
    return state;
  }

  private getInterval(settings: TSettings): number {
    const frequency = Number(settings.pollingFrequency);
    return (
      (Number.isFinite(frequency) && frequency > 0 ? frequency : Number(this.defaultSettings.pollingFrequency)) *
      this.intervalUnitMs
    );
  }

  private async refresh(context: string): Promise<void> {
    const state = this.getState(context);
    this.clearTimer(state);

    if (state.settings === undefined) {
      return;
    }

    if (state.inFlight !== undefined) {
      await state.inFlight;
      return;
    }

    const settings = state.settings;
    state.inFlight = this.update(context, settings).catch((error: unknown) => {
      console.error('Unable to update action', error);
      this.plugin.showAlert(context);
    });
    await state.inFlight;
    state.inFlight = undefined;

    if (state.active && state.settings !== undefined) {
      state.timer = setTimeout(() => void this.refresh(context), this.getInterval(state.settings));
    }
  }
}
