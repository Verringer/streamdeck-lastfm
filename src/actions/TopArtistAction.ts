import { Plugin } from '@rweich/streamdeck-ts';
import { PollingAction, PollingSettings } from './PollingAction';
import { createLastFmUrl, cropImageToSquare, fetchJson } from './actionUtils';

interface TopArtistSettings extends PollingSettings {
  displayPeriod: string;
  lastfmApiKey: string;
  lastfmUsername: string;
  titleDisplay: string;
}

interface TopArtistsResponse {
  topartists: {
    artist: Array<{
      mbid: string;
      name: string;
      playcount: string;
    }>;
  };
}

interface MusicBrainzSearchResponse {
  artists: Array<{ id: string }>;
}

interface MusicBrainzArtistResponse {
  relations?: Array<{
    type: string;
    url: { resource: string };
  }>;
}

const defaultSettings: TopArtistSettings = {
  displayPeriod: 'overall',
  titleDisplay: 'total-scrobbles',
  lastfmApiKey: 'abc123',
  lastfmUsername: 'Verringer',
  pollingFrequency: '30',
};

const musicBrainzHeaders = { 'User-Agent': 'StreamDeck Lastfm' };

const getArtistImage = async (artistName: string, lastFmMbid: string): Promise<string | undefined> => {
  let mbid = lastFmMbid;
  if (mbid === '') {
    const searchUrl = new URL('https://musicbrainz.org/ws/2/artist');
    searchUrl.search = new URLSearchParams({ query: artistName, fmt: 'json' }).toString();
    const search = await fetchJson<MusicBrainzSearchResponse>(searchUrl.toString(), { headers: musicBrainzHeaders });
    mbid = search.artists[0]?.id ?? '';
  }

  if (mbid === '') {
    return undefined;
  }

  const artistUrl = new URL(`https://musicbrainz.org/ws/2/artist/${encodeURIComponent(mbid)}`);
  artistUrl.search = new URLSearchParams({ inc: 'url-rels', fmt: 'json' }).toString();
  const artist = await fetchJson<MusicBrainzArtistResponse>(artistUrl.toString(), { headers: musicBrainzHeaders });
  const image = artist.relations?.find(({ type }) => type === 'image')?.url.resource;

  return image?.includes('commons.wikimedia.org')
    ? image.replace('%3A', ':').replace('/wiki/File:', '/wiki/Special:FilePath/')
    : image;
};

export class TopArtistAction extends PollingAction<TopArtistSettings> {
  constructor(plugin: Plugin) {
    super(plugin, defaultSettings, 60_000);
  }

  protected async update(context: string, settings: TopArtistSettings): Promise<void> {
    const response = await fetchJson<TopArtistsResponse>(
      createLastFmUrl('user.gettopartists', {
        user: settings.lastfmUsername,
        period: settings.displayPeriod,
        api_key: settings.lastfmApiKey,
      }),
    );
    const artist = response.topartists.artist[0];
    if (artist === undefined) {
      throw new Error('Last.fm returned no top artists');
    }

    this.plugin.setTitle(settings.titleDisplay === 'total-scrobbles' ? artist.playcount : artist.name, context);

    const image = await getArtistImage(artist.name, artist.mbid);
    this.plugin.setImage(image ? await cropImageToSquare(image) : '', context);
  }
}
