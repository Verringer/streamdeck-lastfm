import { Streamdeck, Plugin as StreamDeckPlugin } from '@rweich/streamdeck-ts';
import { BaseAction } from './BaseAction';
import { NowPlayingAction } from './actions/NowPlayingAction';
import { LaunchPageAction } from './actions/LaunchPage';
import { TopTrackAction } from './actions/TopTrackAction';
import { TopAlbumAction } from './actions/TopAlbumAction';
import { TopArtistAction } from './actions/TopArtistAction';

const plugin = new Streamdeck().plugin();

const actions: { [key: string]: BaseAction } = {
  'com.verringer.lastfm.now-playing': new NowPlayingAction(plugin),
  'com.verringer.lastfm.launch-page': new LaunchPageAction(plugin),
  'com.verringer.lastfm.top-track': new TopTrackAction(plugin),
  'com.verringer.lastfm.top-album': new TopAlbumAction(plugin),
  'com.verringer.lastfm.top-artist': new TopArtistAction(plugin)
};

plugin.on('willAppear', async ({ context, action }) => {

  // Strip dev. off the action name for development
  action = action.replace(/^dev\./, '');

  const actionInstance = actions[action];
  if (actionInstance) {
    await actionInstance.willAppear(context, action);
  }

});

plugin.on('willAppear', ({ context }) => plugin.getSettings(context));

plugin.on('keyUp', async ({ context, action }) => {

  // Strip dev. off the action name for development
  action = action.replace(/^dev\./, '');

  const actionInstance = actions[action];
  if (actionInstance) {
    await actionInstance.keyUp(context, action);
  }
});

plugin.on('keyDown', async ({ context, action }) => {
  // Strip dev. off the action name for development
  action = action.replace(/^dev\./, '');

  const actionInstance = actions[action];
  if (actionInstance) {
    await actionInstance.keyDown(context, action);
  }
});

plugin.on('didReceiveSettings', ({ action, context, settings }) => {
  // Strip dev. off the action name for development
  action = action.replace(/^dev\./, '');

  const actionInstance = actions[action];
  if (actionInstance) {
    actionInstance.didReceiveSettings({ context, settings });
  }
}
);

export default plugin;