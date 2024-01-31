import { Streamdeck } from '@rweich/streamdeck-ts';
import { initNowPlayingPi } from './actions/NowPlayingPi';
import { initLaunchPagePi } from './actions/LaunchPagePi';
import { initTopTrackPi } from './actions/TopTrackPi';
import { initTopAlbumPi } from './actions/TopAlbumPi';
import { initTopArtistPi } from './actions/TopArtistPi';

const pi = new Streamdeck().propertyinspector();
pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid));
pi.on('didReceiveSettings', ({ action, settings }) => {
  if (pi.pluginUUID === undefined) {
    console.error('pi has no uuid! is it registered already?', pi.pluginUUID);
    return;
  }

  switch (action.split('.').pop()) {
    case 'now-playing':
      initNowPlayingPi(pi, pi.pluginUUID, settings);
      break;
    case 'launch-page':
      initLaunchPagePi(pi, pi.pluginUUID, settings);
      break;
    case 'top-track':
      initTopTrackPi(pi, pi.pluginUUID, settings);
      break;
    case 'top-album':
      initTopAlbumPi(pi, pi.pluginUUID, settings);
      break;
    case 'top-artist':
      initTopArtistPi(pi, pi.pluginUUID, settings);
      break;
    default:
      throw new Error('no init function for action: ' + action);
  }
});

export default pi;