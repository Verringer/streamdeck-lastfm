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

// Error handling wrapper to prevent crashes
const safeExecute = async (fn: () => Promise<void>, context?: string, action?: string) => {
  try {
    await fn();
  } catch (error) {
    console.error(`Error in ${action || 'unknown'} action${context ? ` for context ${context}` : ''}:`, error);
    
    // Show alert on the StreamDeck if we have a context
    if (context) {
      try {
        plugin.showAlert(context);
      } catch (alertError) {
        console.error('Failed to show alert:', alertError);
      }
    }
  }
};

// Strip dev. prefix helper
const stripDevPrefix = (action: string): string => action.replace(/^dev\./, '');

// Get action instance helper
const getActionInstance = (action: string): BaseAction | null => {
  const cleanAction = stripDevPrefix(action);
  return actions[cleanAction] || null;
};

plugin.on('willAppear', async ({ context, action }) => {
  const actionInstance = getActionInstance(action);
  if (actionInstance) {
    await safeExecute(
      () => actionInstance.willAppear(context, action),
      context,
      action
    );
  }
});

plugin.on('willAppear', ({ context }) => {
	safeExecute(async () => plugin.getSettings(context), context);
});

plugin.on('keyUp', async ({ context, action }) => {
  const actionInstance = getActionInstance(action);
  if (actionInstance) {
    await safeExecute(
      () => actionInstance.keyUp(context, action),
      context,
      action
    );
  }
});

plugin.on('keyDown', async ({ context, action }) => {
  const actionInstance = getActionInstance(action);
  if (actionInstance) {
    await safeExecute(
      () => actionInstance.keyDown(context, action),
      context,
      action
    );
  }
});

plugin.on('didReceiveSettings', ({ action, context, settings }) => {
  const actionInstance = getActionInstance(action);
  if (actionInstance) {
    safeExecute(
      () => actionInstance.didReceiveSettings({ context, settings }),
      context,
      action
    );
  }
});

// Global error handlers for uncaught exceptions (browser environment)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Uncaught Exception:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Rejection:', event.reason);
    event.preventDefault(); // Prevent the default browser behavior
  });
}

// Export the plugin for StreamDeck
export default plugin;