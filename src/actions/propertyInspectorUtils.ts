import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { PropertyInspector } from '@rweich/streamdeck-ts';

export type FormSettings = Record<string, string>;

export interface CommonSettings extends FormSettings {
  lastfmApiKey: string;
  lastfmUsername: string;
  pollingFrequency: string;
}

export const commonDefaults: CommonSettings = {
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
};

export const getInitialSettings = <T extends FormSettings>(settings: unknown, defaults: T): T => {
  const received = typeof settings === 'object' && settings !== null ? (settings as Partial<T>) : {};
  return { ...defaults, ...received };
};

const addExplanation = (builder: FormBuilder<CommonSettings>, text: string, link?: string): void => {
  const element = document.createElement('div');
  element.style.marginBottom = '10px';
  element.style.marginLeft = '110px';
  element.textContent = text;

  if (link !== undefined) {
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.textContent = 'here';
    anchor.target = '_blank';
    element.appendChild(anchor);
  }

  builder.addHtmlElement(element);
};

export const addCommonFields = <T extends CommonSettings>(
  builder: FormBuilder<T>,
  pollingUnit: 'seconds' | 'minutes',
): void => {
  const commonBuilder = builder as unknown as FormBuilder<CommonSettings>;
  commonBuilder.addElement('lastfmApiKey', builder.createInput().setLabel('API Key').setPlaceholder('abc'));
  addExplanation(commonBuilder, 'You can get your API key from ', 'https://www.last.fm/api/account/create');

  commonBuilder.addElement('lastfmUsername', builder.createInput().setLabel('Username').setPlaceholder('Verringer'));
  commonBuilder.addElement('pollingFrequency', builder.createInput().setLabel('Poll Frequency').setPlaceholder('30'));
  addExplanation(commonBuilder, `How often to check for new updates (in ${pollingUnit}).`);
};

export const appendAndBind = <T extends FormSettings>(
  builder: FormBuilder<T>,
  pi: PropertyInspector,
  pluginContext: string,
  settings: unknown,
): void => {
  builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);
  builder.on('change-settings', () => pi.setSettings(pluginContext, builder.getFormData()));

  if (typeof settings !== 'object' || settings === null || Object.keys(settings).length === 0) {
    pi.setSettings(pluginContext, builder.getFormData());
  }
};

interface TopItemSettings extends CommonSettings {
  displayPeriod: string;
  titleDisplay: string;
}

const topItemDefaults: TopItemSettings = {
  ...commonDefaults,
  displayPeriod: 'overall',
  titleDisplay: 'total-scrobbles',
};

export const initTopItemPi = (
  pi: PropertyInspector,
  pluginContext: string,
  settings: unknown,
  titleOptions: ReadonlyArray<readonly [label: string, value: string]>,
): void => {
  const builder = new FormBuilder(getInitialSettings(settings, topItemDefaults));

  builder.addElement(
    'displayPeriod',
    builder
      .createDropdown()
      .addOption('Overall', 'overall')
      .addOption('7 day', '7day')
      .addOption('1 month', '1month')
      .addOption('3 month', '3month')
      .addOption('6 month', '6month')
      .addOption('12 month', '12month')
      .setLabel('Period'),
  );

  const titleDropdown = builder.createDropdown();
  for (const [label, value] of titleOptions) {
    titleDropdown.addOption(label, value);
  }
  builder.addElement('titleDisplay', titleDropdown.setLabel('Label'));

  addCommonFields(builder, 'minutes');
  appendAndBind(builder, pi, pluginContext, settings);
};
