import { Plugin } from '@rweich/streamdeck-ts';
import { PollingAction, PollingSettings } from './PollingAction';
import { createLastFmUrl, fetchJson, imageUrlToDataUrl } from './actionUtils';

interface NowPlayingSettings extends PollingSettings {
  lastfmApiKey: string;
  lastfmUsername: string;
  titleDisplay: string;
}

interface RecentTracksResponse {
  recenttracks: {
    '@attr': { total: string };
    track: Array<{
      album: { '#text': string };
      artist: { '#text': string };
      image: Array<{ '#text': string }>;
      name: string;
    }>;
  };
}

const defaultSettings: NowPlayingSettings = {
  titleDisplay: 'total-scrobbles',
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
};

export class NowPlayingAction extends PollingAction<NowPlayingSettings> {
  constructor(plugin: Plugin) {
    super(plugin, defaultSettings, 1_000);
  }

  protected async update(context: string, settings: NowPlayingSettings): Promise<void> {
    const response = await fetchJson<RecentTracksResponse>(
      createLastFmUrl('user.getrecenttracks', {
        user: settings.lastfmUsername,
        api_key: settings.lastfmApiKey,
      }),
    );
    const track = response.recenttracks.track[0];
    if (track === undefined) {
      throw new Error('Last.fm returned no recent tracks');
    }

    const titles: Record<string, string> = {
      song: track.name,
      artist: track.artist['#text'],
      album: track.album['#text'],
      'artist-song': `${track.artist['#text']}\n${track.name}`,
      'total-scrobbles': response.recenttracks['@attr'].total,
    };
    this.plugin.setTitle(titles[settings.titleDisplay] ?? track.name, context);

    const image = track.image.at(-1)?.['#text'];
    this.plugin.setImage(image ? await imageUrlToDataUrl(image) : '', context);
  }
}
