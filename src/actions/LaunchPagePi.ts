import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { PropertyInspector } from '@rweich/streamdeck-ts';

let initialSettings = {}; // assumes that's whatever you get from the propertyinspector on the didReceiveSettings event
const defaultSettings = {
  targetPage: 'profile',
  lastfmUsername: 'Verringer'
};

export const initLaunchPagePi = (pi: PropertyInspector, pluginContext: string, settings: unknown) => {

  // Set initial settings to settings received from the propertyinspector
  // If no settings were received, use the default settings
  initialSettings = settings ?? defaultSettings;

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

  // append the formbuilder (html) to the propertyinspector
  builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);

  // send the new settings to the propertyinspector whenever they change
  builder.on('change-settings', () => pi.setSettings(pluginContext, builder.getFormData()));
};