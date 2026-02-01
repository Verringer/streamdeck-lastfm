interface LastFmApiError {
  error: number;
  message: string;
}

interface LastFmResponse<T> {
  data?: T;
  error?: LastFmApiError;
}

class LastFmApiService {
  private static instance: LastFmApiService;
  private rateLimiter: Map<string, number[]> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  private constructor() {}

  static getInstance(): LastFmApiService {
    if (!LastFmApiService.instance) {
      LastFmApiService.instance = new LastFmApiService();
    }
    return LastFmApiService.instance;
  }

  private async checkRateLimit(apiKey: string): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    let requests = this.rateLimiter.get(apiKey) || [];
    requests = requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (requests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = Math.min(...requests);
      const waitTime = oldestRequest + 60000 - now;
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    requests.push(now);
    this.rateLimiter.set(apiKey, requests);
  }

  private async makeRequest<T>(
    method: string,
    params: Record<string, string>,
    apiKey: string
  ): Promise<LastFmResponse<T>> {
    try {
      await this.checkRateLimit(apiKey);

      const url = new URL('https://ws.audioscrobbler.com/2.0/');
      url.searchParams.set('method', method);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('format', 'json');
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        this.logRequest('Last.fm', method);

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            'User-Agent': 'StreamDeck-LastFM/1.0'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if ('error' in data) {
          return { error: data as LastFmApiError };
        }

        return { data };

      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error) {
          return { error: { error: -1, message: fetchError.message } };
        }
        return { error: { error: -1, message: 'Unknown fetch error' } };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: { error: -1, message: error.message } };
      }
      return { error: { error: -1, message: 'Unknown error occurred' } };
    }
  }

  async getRecentTracks(username: string, apiKey: string): Promise<LastFmResponse<any>> {
    return this.makeRequest('user.getrecenttracks', { user: username }, apiKey);
  }

  async getTopTracks(username: string, period: string, apiKey: string): Promise<LastFmResponse<any>> {
    return this.makeRequest('user.gettoptracks', { user: username, period }, apiKey);
  }

  async getTopArtists(username: string, period: string, apiKey: string): Promise<LastFmResponse<any>> {
    return this.makeRequest('user.gettopartists', { user: username, period }, apiKey);
  }

  async getTopAlbums(username: string, period: string, apiKey: string): Promise<LastFmResponse<any>> {
    return this.makeRequest('user.gettopalbums', { user: username, period }, apiKey);
  }

  async getTrackInfo(artist: string, track: string, apiKey: string): Promise<LastFmResponse<any>> {
    return this.makeRequest('track.getinfo', { 
      artist: encodeURIComponent(artist), 
      track: encodeURIComponent(track) 
    }, apiKey);
  }

  async searchMusicBrainzArtist(artistName: string): Promise<any> {
    try {
      this.logRequest('MusicBrainz', 'searchArtist');

      const response = await fetch(
        `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(artistName)}&fmt=json`,
        {
          headers: {
            'User-Agent': 'StreamDeck-LastFM/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MusicBrainz HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.artists?.[0];
    } catch (error) {
      return null;
    }
  }

  async getMusicBrainzArtistImage(mbid: string): Promise<string> {
    try {
      this.logRequest('MusicBrainz', 'artistImage');

      const response = await fetch(
        `https://musicbrainz.org/ws/2/artist/${mbid}?inc=url-rels&fmt=json`,
        {
          headers: {
            'User-Agent': 'StreamDeck-LastFM/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MusicBrainz HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.relations) {
        const imageRelation = data.relations.find(
          (relation: { type: string; url: { resource: string; } }) => 
          relation.type === 'image'
        );
        
        if (imageRelation) {
          let image = imageRelation.url.resource;
          
          // Handle Wikipedia Commons links
          if (image.includes('commons.wikimedia.org')) {
            image = image.replace('%3A', ':');
            image = image.replace('/wiki/File:', '/wiki/Special:FilePath/');
          }
          
          return image;
        }
      }
      
      return '';
    } catch (error) {
      return '';
    }
  }

  clearCache(): void {}

  getCacheStats(): { size: number; keys: string[] } {
    return { size: 0, keys: [] };
  }

  private logRequest(service: 'Last.fm' | 'MusicBrainz', endpoint: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🛰️ Request -> ${service}.${endpoint} @ ${timestamp}`);
  }
}

export default LastFmApiService;
