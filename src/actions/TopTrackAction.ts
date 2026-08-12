import { Plugin } from '@rweich/streamdeck-ts';
import { PollingAction, PollingSettings } from './PollingAction';
import { createLastFmUrl, fetchJson, imageUrlToDataUrl } from './actionUtils';

interface TopTrackSettings extends PollingSettings {
  displayPeriod: string;
  lastfmApiKey: string;
  lastfmUsername: string;
  titleDisplay: string;
}

interface TopTracksResponse {
  toptracks: {
    track: Array<{
      artist: { name: string };
      name: string;
      playcount: string;
    }>;
  };
}

interface TrackInfoResponse {
  track: {
    album?: { image: Array<{ '#text': string }> };
  };
}

const defaultSettings: TopTrackSettings = {
  displayPeriod: 'overall',
  titleDisplay: 'total-scrobbles',
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
};

export class TopTrackAction extends PollingAction<TopTrackSettings> {
  constructor(plugin: Plugin) {
    super(plugin, defaultSettings, 60_000);
  }

  protected async update(context: string, settings: TopTrackSettings): Promise<void> {
    const response = await fetchJson<TopTracksResponse>(
      createLastFmUrl('user.gettoptracks', {
        user: settings.lastfmUsername,
        period: settings.displayPeriod,
        api_key: settings.lastfmApiKey,
      }),
    );
    const track = response.toptracks.track[0];
    if (track === undefined) {
      throw new Error('Last.fm returned no top tracks');
    }

    const titles: Record<string, string> = {
      song: track.name,
      artist: track.artist.name,
      'artist-song': `${track.artist.name}\n${track.name}`,
      'total-scrobbles': track.playcount,
    };
    this.plugin.setTitle(titles[settings.titleDisplay] ?? track.name, context);

    const trackInfo = await fetchJson<TrackInfoResponse>(
      createLastFmUrl('track.getinfo', {
        api_key: settings.lastfmApiKey,
        artist: track.artist.name,
        track: track.name,
      }),
    );
    const image = trackInfo.track.album?.image.at(-1)?.['#text'];
    this.plugin.setImage(image ? await imageUrlToDataUrl(image) : '', context);
  }
}
