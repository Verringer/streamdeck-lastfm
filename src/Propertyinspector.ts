import { PropertyInspector, Streamdeck } from '@rweich/streamdeck-ts';
import { initLaunchPagePi } from './actions/LaunchPagePi';
import { initNowPlayingPi } from './actions/NowPlayingPi';
import { initTopAlbumPi } from './actions/TopAlbumPi';
import { initTopArtistPi } from './actions/TopArtistPi';
import { initTopTrackPi } from './actions/TopTrackPi';

type Initializer = (pi: PropertyInspector, pluginContext: string, settings: unknown) => void;

const initializers: Record<string, Initializer> = {
  'now-playing': initNowPlayingPi,
  'launch-page': initLaunchPagePi,
  'top-track': initTopTrackPi,
  'top-album': initTopAlbumPi,
  'top-artist': initTopArtistPi,
};

const pi = new Streamdeck().propertyinspector();
pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid));
pi.on('didReceiveSettings', ({ action, settings }) => {
  if (pi.pluginUUID === undefined) {
    console.error('Property inspector has no UUID; it may not be registered yet.');
    return;
  }

  const actionName = action.split('.').at(-1) ?? '';
  const initialize = initializers[actionName];
  if (initialize === undefined) {
    console.error('No property inspector initializer for action:', action);
    return;
  }

  initialize(pi, pi.pluginUUID, settings);
});

export default pi;
