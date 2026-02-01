import { Plugin } from '@rweich/streamdeck-ts';
import LastFmApiService from './services/LastFmApiService';
import ImageService from './services/ImageService';
import PollingService from './services/PollingService';
import GridService from './services/GridService';
import CacheService from './services/CacheService';

export interface ActionSettings {
  lastfmApiKey?: string;
  lastfmUsername?: string;
  titleDisplay?: string;
  displayPeriod?: string;
  targetPage?: string;
  gridEnabled?: boolean | string;
  gridSize?: string; // Single N×N grid size
  gridPosition?: number;
  gridPositionX?: string;
  gridPositionY?: string;
  pollingFrequency?: string;
}

export interface ContextData {
  timesUpdated: number;
  timeStarted: number;
  lastFmApiKey?: string;
  lastFmUsername?: string;
  titleDisplay?: string;
  displayPeriod?: string;
  targetPage?: string;
  gridEnabled?: boolean;
  gridSize?: number; // Store as number
  gridPosition?: number;
  hasApiKey?: boolean;
  hasUsername?: boolean;
  pollingFrequency?: string;
}

export abstract class BaseAction {
  protected contextData: Map<string, ContextData> = new Map();
  private cacheSubscriptions: Map<string, Map<string, (key: string, data: unknown) => void>> = new Map();
  protected apiService: LastFmApiService;
  protected imageService: ImageService;
  protected pollingService: PollingService;
  protected cacheService: CacheService;
  protected gridService: GridService;

  constructor(protected plugin: Plugin) {
    this.apiService = LastFmApiService.getInstance();
    this.imageService = ImageService.getInstance();
    this.pollingService = PollingService.getInstance();
    this.cacheService = CacheService.getInstance();
    this.gridService = GridService.getInstance();
  }

  async willAppear(context: string, action: string): Promise<void> {
    const data = this.getOrCreateContextData(context);
    
  }

  willDisappear(context: string): void {
    this.cleanup(context);
  }

  async keyUp(context: string, action: string): Promise<void> {
    // Default implementation (does nothing)
  }

  async keyDown(context: string, action: string): Promise<void> {
    // Default implementation (does nothing)
  }

  async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }): Promise<void> {
    // Default implementation (does nothing)
  }

  protected getOrCreateContextData(context: string): ContextData {
    let data = this.contextData.get(context);
    if (!data) {
      data = {
        timesUpdated: 0,
        timeStarted: Date.now(),
        lastFmApiKey: '',
        lastFmUsername: '',
        titleDisplay: 'artist-song',
        displayPeriod: '7day',
        targetPage: '',
        gridEnabled: false,
        gridSize: 3,
        gridPosition: 0,
        hasApiKey: false,
        hasUsername: false
      };
      this.contextData.set(context, data);
    }
    return data;
  }

  protected updateContextSettings(context: string, settings: ActionSettings): void {
    const data = this.getOrCreateContextData(context);
    
    // Map settings from Property Inspector to internal format
    data.lastFmApiKey = settings.lastfmApiKey || '';
    data.lastFmUsername = settings.lastfmUsername || '';
    data.titleDisplay = settings.titleDisplay || 'artist-song';
    data.displayPeriod = settings.displayPeriod || data.displayPeriod;
    data.targetPage = settings.targetPage || data.targetPage;
    data.pollingFrequency = settings.pollingFrequency;
    
    // Grid settings with defaults
    data.gridEnabled = settings.gridEnabled === true || (settings.gridEnabled as any) === 'true';
    data.gridSize = parseInt(settings.gridSize || '3');
    
    // Convert separate X and Y inputs to grid position
    if (data.gridEnabled && settings.gridPositionX && settings.gridPositionY) {
      const xRaw = parseInt(settings.gridPositionX, 10);
      const yRaw = parseInt(settings.gridPositionY, 10);
      const size = Number.isFinite(data.gridSize) ? data.gridSize : 3;
      
      if (Number.isFinite(xRaw) && Number.isFinite(yRaw)) {
        const x = Math.max(1, Math.min(size, xRaw));
        const y = Math.max(1, Math.min(size, yRaw));
        data.gridPosition = (y - 1) * size + (x - 1);
      } else {
        data.gridPosition = 0;
      }
    } else {
      data.gridPosition = settings.gridPosition !== undefined ? settings.gridPosition : (data.gridEnabled ? 0 : undefined);
    }
    
    // Update readiness flags
    data.hasApiKey = !!data.lastFmApiKey;
    data.hasUsername = !!data.lastFmUsername;
    
  }

  protected isContextReady(context: string): boolean {
    const data = this.contextData.get(context);
    const result = {
      hasApiKey: !!data?.lastFmApiKey,
      hasUsername: !!data?.lastFmUsername,
      apiKey: data?.lastFmApiKey,
      username: data?.lastFmUsername
    };
    return !!(data?.lastFmApiKey && data?.lastFmUsername);
  }

  protected handleApiError(context: string, error: any): void {
    const message = error instanceof Error ? error.message : String(error);

    if (message.toLowerCase().includes('signal is aborted')) {
      console.warn('⏱️ API request timed out (will retry on next refresh):', message);
      return;
    }

    if (this.shouldUpdateGrid(context) && !this.isGridMaster(context)) {
      console.warn('🔕 Suppressing alert for grid slave context:', context, message);
      return;
    }

    console.error('API Error:', error);
    this.plugin.showAlert(context);
  }

  protected formatTitle(data: any, titleDisplay: string): string {
    switch (titleDisplay) {
      case 'song':
        return data.name || '';
      case 'artist':
        return data.artist?.['#text'] || data.artist?.name || data.name || '';
      case 'album':
        return data.album?.['#text'] || data.name || '';
      case 'artist-song':
        const artist = data.artist?.['#text'] || data.artist?.name || '';
        const song = data.name || '';
        return artist && song ? `${artist}\n${song}` : artist || song;
      case 'total-scrobbles':
        return data.playcount?.toString() || data.recenttracks?.['@attr']?.total || '';
      default:
        return data.name || '';
    }
  }

  // Grid utility methods
  protected getGridDimensions(data: ContextData): { rows: number; cols: number } {
    const size = data.gridSize || 3;
    return { rows: size, cols: size };
  }

  protected getGridPosition(position: number, data: ContextData): { row: number; col: number } {
    const { cols } = this.getGridDimensions(data);
    return {
      row: Math.floor(position / cols),
      col: position % cols
    };
  }

  // Reusable grid methods
  protected isGridMaster(context: string): boolean {
    const data = this.contextData.get(context);
    if (!data?.gridEnabled) return false;
    
    // The master is position 0 (top-left)
    return data.gridPosition === 0;
  }

  protected shouldUpdateGrid(context: string): boolean {
    const data = this.contextData.get(context);
    return data?.gridEnabled || false;
  }

  /**
   * Update grid display for any action with image data
   */
  protected async updateGridDisplay(
    context: string, 
    imageUrl: string, 
    title: string,
    data?: ContextData
  ): Promise<void> {
    const contextData = data || this.contextData.get(context);
    
    if (!contextData?.gridEnabled || !contextData.gridSize || contextData.gridPosition === undefined) {
      return;
    }

    if (!imageUrl) {
      return;
    }

    
    // Get the grid-processed image for this position
    const imageBase64 = await this.imageService.getImageAsBase64(
      imageUrl, 
      GridService.getGridSizeString(contextData.gridSize), 
      contextData.gridPosition
    );

    if (imageBase64) {
      this.plugin.setImage(imageBase64, context);
    } else {
      console.error('❌ Failed to get grid image for position', contextData.gridPosition);
    }

    // Set title only on master position
    if (this.isGridMaster(context)) {
      this.plugin.setTitle(title, context);
    } else {
      this.plugin.setTitle('', context); // Clear title for slave positions
    }
  }

  /**
   * Check if grid is enabled and properly configured
   */
  protected isGridConfigured(context: string): boolean {
    const data = this.contextData.get(context);
    return !!(data?.gridEnabled && data.gridSize && data.gridPosition !== undefined);
  }

  /**
   * Get grid configuration for context
   */
  protected getGridConfig(context: string): { enabled: boolean; size: number; position: number } | null {
    const data = this.contextData.get(context);
    if (!data?.gridEnabled || !data.gridSize || data.gridPosition === undefined) {
      return null;
    }
    
    return {
      enabled: data.gridEnabled,
      size: data.gridSize,
      position: data.gridPosition
    };
  }

  /**
   * Get cached API data with proactive background refresh
   */
  protected async getCachedData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return this.cacheService.get(cacheKey, fetchFn, ttl);
  }

  /**
   * Force refresh cached data
   */
  protected async refreshCachedData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return this.cacheService.forceRefresh(cacheKey, fetchFn, ttl);
  }

  /**
   * Register for cache updates and trigger UI updates
   */
  protected registerForCacheUpdates<T>(
    context: string,
    cacheKey: string,
    updateCallback: () => Promise<void>
  ): void {
    let contextSubscriptions = this.cacheSubscriptions.get(context);
    if (!contextSubscriptions) {
      contextSubscriptions = new Map();
      this.cacheSubscriptions.set(context, contextSubscriptions);
    }

    const existingCallback = contextSubscriptions.get(cacheKey);
    if (existingCallback) {
      this.cacheService.offUpdate(cacheKey, existingCallback);
    }

    const wrappedCallback = async () => {
      await updateCallback();
    };

    contextSubscriptions.set(cacheKey, wrappedCallback);
    this.cacheService.onUpdate(cacheKey, wrappedCallback);
  }

  protected unregisterCacheUpdates(context: string): void {
    const subscriptions = this.cacheSubscriptions.get(context);
    if (!subscriptions) {
      return;
    }

    for (const [cacheKey, callback] of subscriptions.entries()) {
      this.cacheService.offUpdate(cacheKey, callback);
    }

    this.cacheSubscriptions.delete(context);
  }

  /**
   * Log cache statistics for debugging
   */
  protected logCacheStats(): void {
    this.cacheService.getStats();
  }

  /**
   * Generate cache key for API calls
   */
  protected generateCacheKey(method: string, params: Record<string, string>): string {
    const orderedParams: Record<string, string> = {};
    Object.keys(params).sort().forEach((key) => {
      orderedParams[key] = params[key];
    });
    return `${method}:${JSON.stringify(orderedParams)}`;
  }

  protected getPollingTtlMs(
    data: { pollingFrequency?: string } | undefined,
    fallbackSeconds: number
  ): number {
    const raw = data?.pollingFrequency;
    const parsed = raw ? parseInt(raw, 10) : NaN;
    const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackSeconds;
    return seconds * 1000;
  }

  protected cleanup(context: string): void {
    this.unregisterCacheUpdates(context);
    this.contextData.delete(context);
  }
}
