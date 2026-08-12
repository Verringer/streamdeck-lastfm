import { Streamdeck } from '@rweich/streamdeck-ts';
import { BaseAction } from './BaseAction';
import { LaunchPageAction } from './actions/LaunchPage';
import { NowPlayingAction } from './actions/NowPlayingAction';
import { TopAlbumAction } from './actions/TopAlbumAction';
import { TopArtistAction } from './actions/TopArtistAction';
import { TopTrackAction } from './actions/TopTrackAction';

const plugin = new Streamdeck().plugin();

const actions: Record<string, BaseAction> = {
  'com.verringer.lastfm.now-playing': new NowPlayingAction(plugin),
  'com.verringer.lastfm.launch-page': new LaunchPageAction(plugin),
  'com.verringer.lastfm.top-track': new TopTrackAction(plugin),
  'com.verringer.lastfm.top-album': new TopAlbumAction(plugin),
  'com.verringer.lastfm.top-artist': new TopArtistAction(plugin),
};

const getAction = (action: string): BaseAction | undefined => actions[action.replace(/^dev\./, '')];

plugin.on('willAppear', async ({ context, action }) => {
  await getAction(action)?.willAppear(context, action);
  plugin.getSettings(context);
});

plugin.on('willDisappear', async ({ context, action }) => {
  await getAction(action)?.willDisappear(context, action);
});

plugin.on('keyUp', async ({ context, action }) => {
  await getAction(action)?.keyUp(context, action);
});

plugin.on('keyDown', async ({ context, action }) => {
  await getAction(action)?.keyDown(context, action);
});

plugin.on('didReceiveSettings', async ({ action, context, settings }) => {
  await getAction(action)?.didReceiveSettings({ context, settings });
});

export default plugin;
