import { PropertyInspector } from '@rweich/streamdeck-ts';
import { initTopItemPi } from './propertyInspectorUtils';

export const initTopAlbumPi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void =>
  initTopItemPi(pi, pluginContext, settings, [
    ['Show artist', 'artist'],
    ['Show album title', 'album'],
    ['Artist + album', 'artist-album'],
    ['Album + scrobbles', 'album-scrobbles'],
    ['Your scrobbles', 'total-scrobbles'],
    ['Username', 'username'],
  ]);
