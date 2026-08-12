import { PropertyInspector } from '@rweich/streamdeck-ts';
import { initTopItemPi } from './propertyInspectorUtils';

export const initTopTrackPi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void =>
  initTopItemPi(pi, pluginContext, settings, [
    ['Show only artist', 'artist'],
    ['Show only song', 'song'],
    ['Show only album title', 'album'],
    ['Full artist - song', 'artist-song'],
    ['Track + scrobbles', 'track-scrobbles'],
    ['Your scrobbles', 'total-scrobbles'],
    ['Username', 'username'],
  ]);
