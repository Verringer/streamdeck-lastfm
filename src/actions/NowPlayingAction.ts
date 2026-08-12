import { Plugin } from '@rweich/streamdeck-ts';
import { PollingAction, PollingSettings } from './PollingAction';
import { createLastFmUrl, fetchJson, getPositionedItem, imageUrlToDataUrl } from './actionUtils';

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
      url: string;
    }>;
  };
}

const defaultSettings: NowPlayingSettings = {
  titleDisplay: 'total-scrobbles',
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
  position: '1',
  pressAction: 'refresh',
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
        limit: '5',
      }),
    );
    const track = getPositionedItem(response.recenttracks.track, settings.position);
    if (track === undefined) {
      throw new Error(`Last.fm returned no recent track at position ${settings.position}`);
    }

    this.setItemUrl(context, track.url);

    const titles: Record<string, string> = {
      song: track.name,
      artist: track.artist['#text'],
      album: track.album['#text'],
      'artist-album': `${track.artist['#text']}\n${track.album['#text']}`,
      'artist-song': `${track.artist['#text']}\n${track.name}`,
      'total-scrobbles': response.recenttracks['@attr'].total,
      username: settings.lastfmUsername,
      'username-scrobbles': `${settings.lastfmUsername}\n${response.recenttracks['@attr'].total}`,
    };
    this.plugin.setTitle(titles[settings.titleDisplay] ?? track.name, context);

    const image = track.image.at(-1)?.['#text'];
    this.plugin.setImage(image ? await imageUrlToDataUrl(image) : '', context);
  }
}
