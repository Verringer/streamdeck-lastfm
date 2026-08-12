import { Plugin } from '@rweich/streamdeck-ts';
import { PollingAction, PollingSettings } from './PollingAction';
import { createLastFmUrl, fetchJson, getPositionedItem, imageUrlToDataUrl } from './actionUtils';

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
      url: string;
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
  position: '1',
  pressAction: 'refresh',
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
        limit: '5',
      }),
    );
    const track = getPositionedItem(response.toptracks.track, settings.position);
    if (track === undefined) {
      throw new Error(`Last.fm returned no top track at position ${settings.position}`);
    }

    this.setItemUrl(context, track.url);

    const titles: Record<string, string> = {
      song: track.name,
      artist: track.artist.name,
      'artist-song': `${track.artist.name}\n${track.name}`,
      'track-scrobbles': `${track.name}\n${track.playcount}`,
      'total-scrobbles': track.playcount,
      username: settings.lastfmUsername,
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
