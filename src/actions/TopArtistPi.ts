import { PropertyInspector } from '@rweich/streamdeck-ts';
import { initTopItemPi } from './propertyInspectorUtils';

export const initTopArtistPi = (pi: PropertyInspector, pluginContext: string, settings: unknown): void =>
  initTopItemPi(pi, pluginContext, settings, [
    ['Show artist', 'artist'],
    ['Your scrobbles', 'total-scrobbles'],
  ]);
