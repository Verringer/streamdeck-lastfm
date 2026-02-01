import { PropertyInspector } from '@rweich/streamdeck-ts';
import PropertyInspectorService from '../services/PropertyInspectorService';
import { TITLE_DISPLAY_OPTIONS } from '../services/PropertyInspectorService';
import { createTopActionConfig } from './ActionConfigFactory';

const piService = PropertyInspectorService.getInstance();

export const initTopArtistPi = (pi: PropertyInspector, pluginContext: string, settings: unknown) => {
  piService.createPropertyInspector(pi, pluginContext, settings, createTopActionConfig(TITLE_DISPLAY_OPTIONS.topArtist));
};