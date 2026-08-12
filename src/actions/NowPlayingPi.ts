import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { PropertyInspector } from '@rweich/streamdeck-ts';
import { addCommonFields, appendAndBind, CommonSettings, getInitialSettings } from './propertyInspectorUtils';

interface NowPlayingSettings extends CommonSettings {
  titleDisplay: string;
}

const defaultSettings: NowPlayingSettings = {
  titleDisplay: 'total-scrobbles',
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
  position: '1',
  pressAction: 'refresh',
};

export const initNowPlayingPi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void => {
  const builder = new FormBuilder(getInitialSettings(settings, defaultSettings));

  builder.addElement(
    'titleDisplay',
    builder
      .createDropdown()
      .addOption('Show only artist', 'artist')
      .addOption('Show only song', 'song')
      .addOption('Show only album title', 'album')
      .addOption('Artist + album', 'artist-album')
      .addOption('Full artist - song', 'artist-song')
      .addOption('Your total scrobbles', 'total-scrobbles')
      .addOption('Username', 'username')
      .addOption('Username + total scrobbles', 'username-scrobbles')
      .setLabel('Label'),
  );

  addCommonFields(builder, 'seconds');
  appendAndBind(builder, pi, pluginContext, settings);
};
