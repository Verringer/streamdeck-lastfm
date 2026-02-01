import { PropertyInspector } from '@rweich/streamdeck-ts';
import PropertyInspectorService from '../services/PropertyInspectorService';
import { createNowPlayingConfig } from './ActionConfigFactory';

const piService = PropertyInspectorService.getInstance();

export const initNowPlayingPi = (pi: PropertyInspector, pluginContext: string, settings: unknown) => {
  piService.createPropertyInspector(pi, pluginContext, settings, createNowPlayingConfig());
};