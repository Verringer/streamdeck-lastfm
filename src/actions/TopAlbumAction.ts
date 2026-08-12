import { Plugin } from '@rweich/streamdeck-ts';
import { PollingAction, PollingSettings } from './PollingAction';
import { createLastFmUrl, fetchJson, imageUrlToDataUrl } from './actionUtils';

interface TopAlbumSettings extends PollingSettings {
  displayPeriod: string;
  lastfmApiKey: string;
  lastfmUsername: string;
  titleDisplay: string;
}

interface TopAlbumsResponse {
  topalbums: {
    album: Array<{
      artist: { name: string };
      image: Array<{ '#text': string }>;
      name: string;
      playcount: string;
    }>;
  };
}

const defaultSettings: TopAlbumSettings = {
  displayPeriod: 'overall',
  titleDisplay: 'total-scrobbles',
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
};

export class TopAlbumAction extends PollingAction<TopAlbumSettings> {
  constructor(plugin: Plugin) {
    super(plugin, defaultSettings, 60_000);
  }

  protected async update(context: string, settings: TopAlbumSettings): Promise<void> {
    const response = await fetchJson<TopAlbumsResponse>(
      createLastFmUrl('user.gettopalbums', {
        user: settings.lastfmUsername,
        period: settings.displayPeriod,
        api_key: settings.lastfmApiKey,
      }),
    );
    const album = response.topalbums.album[0];
    if (album === undefined) {
      throw new Error('Last.fm returned no top albums');
    }

    const titles: Record<string, string> = {
      album: album.name,
      artist: album.artist.name,
      'total-scrobbles': album.playcount,
    };
    this.plugin.setTitle(titles[settings.titleDisplay] ?? album.name, context);

    const image = album.image.at(-1)?.['#text'];
    this.plugin.setImage(image ? await imageUrlToDataUrl(image) : '', context);
  }
}
