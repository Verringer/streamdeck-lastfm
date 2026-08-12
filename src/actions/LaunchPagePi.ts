import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { PropertyInspector } from '@rweich/streamdeck-ts';
import { appendAndBind, FormSettings, getInitialSettings } from './propertyInspectorUtils';

interface LaunchPageSettings extends FormSettings {
  targetPage: string;
  lastfmUsername: string;
}

const defaultSettings: LaunchPageSettings = {
  targetPage: 'profile',
  lastfmUsername: 'Verringer',
};

export const initLaunchPagePi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void => {
  const builder = new FormBuilder(getInitialSettings(settings, defaultSettings));

  builder.addElement(
    'targetPage',
    builder
      .createDropdown()
      .addOption('Homepage', 'homepage')
      .addOption('Profile', 'profile')
      .addOption('Library', 'library')
      .addOption('Last.week', 'lastWeek')
      .addOption('Last.month', 'lastMonth')
      .addOption('Last.year', 'lastYear')
      .setLabel('Shortcut'),
  );
  builder.addElement(
    'lastfmUsername',
    builder
      .createInput()
      .setLabel('Username')
      .setPlaceholder('Verringer')
      .showOn(() => builder.getFormData().targetPage !== 'homepage'),
  );

  appendAndBind(builder, pi, pluginContext, settings);
};
