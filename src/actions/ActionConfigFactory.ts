import { TITLE_DISPLAY_OPTIONS } from '../services/PropertyInspectorService';

export const createNowPlayingConfig = () => ({
  titleDisplay: 'song',
  includeGridOptions: true,
  pollingFrequencyUnit: 'seconds' as const,
  pollingFrequencyDefault: 15,
  pollingFrequencyOptions: [
    { label: '5 seconds', value: '5' },
    { label: '10 seconds', value: '10' },
    { label: '15 seconds', value: '15' },
    { label: '30 seconds', value: '30' },
    { label: '1 minute', value: '60' }
  ],
  includeRefreshModal: true
});

export const createTopActionConfig = (titleDisplayOptions: any, titleDisplay: string = 'total-scrobbles') => ({
  titleDisplay,
  includeDisplayPeriod: true,
  titleDisplayOptions,
  pollingFrequencyUnit: 'minutes' as const,
  pollingFrequencyDefault: 1800,
  pollingFrequencyOptions: [
    { label: '5 minutes', value: '300' },
    { label: '10 minutes', value: '600' },
    { label: '15 minutes', value: '900' },
    { label: '30 minutes', value: '1800' },
    { label: '60 minutes', value: '3600' }
  ]
});
