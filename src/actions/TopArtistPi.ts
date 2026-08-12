import { PropertyInspector } from '@rweich/streamdeck-ts';
import { initTopItemPi } from './propertyInspectorUtils';

export const initTopArtistPi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void =>
  initTopItemPi(pi, pluginContext, settings, [
    ['Show artist', 'artist'],
    ['Artist + scrobbles', 'artist-scrobbles'],
    ['Your scrobbles', 'total-scrobbles'],
    ['Username', 'username'],
  ]);
