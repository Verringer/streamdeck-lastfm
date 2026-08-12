import { PropertyInspector } from '@rweich/streamdeck-ts';
import { initTopItemPi } from './propertyInspectorUtils';

export const initTopAlbumPi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void =>
  initTopItemPi(pi, pluginContext, settings, [
    ['Show artist', 'artist'],
    ['Show album title', 'album'],
    ['Your scrobbles', 'total-scrobbles'],
  ]);
