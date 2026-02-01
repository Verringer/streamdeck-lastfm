import { TITLE_DISPLAY_OPTIONS } from '../services/PropertyInspectorService';

const PRESS_ACTION_OPTIONS = {
  nowPlaying: [
    { label: 'Refresh', value: 'refresh' },
    { label: 'Open track', value: 'open-track' },
    { label: 'Open artist', value: 'open-artist' },
    { label: 'Open album', value: 'open-album' },
    { label: 'Open profile', value: 'open-profile' },
    { label: 'Open library', value: 'open-library' },
    { label: 'Open Last.fm', value: 'open-home' },
    { label: 'Do nothing', value: 'none' }
  ],
  topTrack: [
    { label: 'Refresh', value: 'refresh' },
    { label: 'Open track', value: 'open-track' },
    { label: 'Open artist', value: 'open-artist' },
    { label: 'Open album', value: 'open-album' },
    { label: 'Open profile', value: 'open-profile' },
    { label: 'Open library', value: 'open-library' },
    { label: 'Open Last.fm', value: 'open-home' },
    { label: 'Do nothing', value: 'none' }
  ],
  topArtist: [
    { label: 'Refresh', value: 'refresh' },
    { label: 'Open artist', value: 'open-artist' },
    { label: 'Open profile', value: 'open-profile' },
    { label: 'Open library', value: 'open-library' },
    { label: 'Open Last.fm', value: 'open-home' },
    { label: 'Do nothing', value: 'none' }
  ],
  topAlbum: [
    { label: 'Refresh', value: 'refresh' },
    { label: 'Open album', value: 'open-album' },
    { label: 'Open artist', value: 'open-artist' },
    { label: 'Open profile', value: 'open-profile' },
    { label: 'Open library', value: 'open-library' },
    { label: 'Open Last.fm', value: 'open-home' },
    { label: 'Do nothing', value: 'none' }
  ]
};

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
  includeRefreshModal: true,
  includePressActions: true,
  pressActionOptions: PRESS_ACTION_OPTIONS.nowPlaying,
  shortPressDefault: 'refresh',
  longPressDefault: 'open-track'
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
  ],
  includePressActions: true,
  pressActionOptions: titleDisplayOptions === TITLE_DISPLAY_OPTIONS.topArtist
    ? PRESS_ACTION_OPTIONS.topArtist
    : titleDisplayOptions === TITLE_DISPLAY_OPTIONS.topAlbum
      ? PRESS_ACTION_OPTIONS.topAlbum
      : PRESS_ACTION_OPTIONS.topTrack,
  shortPressDefault: 'refresh',
  longPressDefault: titleDisplayOptions === TITLE_DISPLAY_OPTIONS.topArtist
    ? 'open-artist'
    : titleDisplayOptions === TITLE_DISPLAY_OPTIONS.topAlbum
      ? 'open-album'
      : 'open-track'
});
