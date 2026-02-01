import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { PropertyInspector } from '@rweich/streamdeck-ts';

const defaultSettings = {
  targetPage: 'profile',
  lastfmUsername: 'Verringer'
};

export const initLaunchPagePi = (pi: PropertyInspector, pluginContext: string, settings: unknown) => {
  const initialSettings = settings ?? defaultSettings;
  const builder = new FormBuilder({ ...defaultSettings, ...initialSettings });

  builder.addElement('targetPage', builder.createDropdown()
    .addOption('Homepage', 'homepage')
    .addOption('Profile', 'profile')
    .addOption('Library', 'library')
    .addOption('Last.week', 'lastWeek')
    .addOption('Last.month', 'lastMonth')
    .addOption('Last.year', 'lastYear')
    .setLabel('Shortcut')
  );

  builder.addElement('lastfmUsername',
    builder.createInput()
      .setLabel('Username')
      .setPlaceholder('Verringer')
      .showOn(() => builder.getFormData().targetPage !== 'homepage')
  );

  builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);
  builder.on('change-settings', () => pi.setSettings(pluginContext, builder.getFormData()));
};