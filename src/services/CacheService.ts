interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  recentTracks: number; // 5-10 seconds
  topTracks: number;   // 5 minutes
  topArtists: number;  // 5 minutes
  topAlbums: number;   // 5 minutes
  trackInfo: number;   // 10 minutes
}

type CacheUpdateCallback<T> = (key: string, data: T) => void;

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private apiService: any;
  private updateCallbacks: Map<string, CacheUpdateCallback<any>[]> = new Map();
  private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  private readonly CACHE_CONFIG: CacheConfig = {
    recentTracks: 8000,    // 8 seconds default TTL (will be overridden by user setting)
    topTracks: 300000,     // 5 minutes
    topArtists: 300000,    // 5 minutes
    topAlbums: 300000,     // 5 minutes
    trackInfo: 600000      // 10 minutes
  };
  
  private readonly CACHE_CHECK_INTERVAL = 2000; // Check cache every 2 seconds

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  setApiService(apiService: any): void {
    this.apiService = apiService;
  }

  /**
   * Register a callback for cache updates
   */
  onUpdate<T>(key: string, callback: CacheUpdateCallback<T>): void {
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, []);
    }
    this.updateCallbacks.get(key)!.push(callback);
  }

  /**
   * Unregister a callback for cache updates
   */
  offUpdate<T>(key: string, callback: CacheUpdateCallback<T>): void {
    const callbacks = this.updateCallbacks.get(key);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.updateCallbacks.delete(key);
      }
    }
  }

  /**
   * Notify all callbacks for a cache key (with debouncing)
   */
  private notifyCallbacks<T>(key: string, data: T): void {
    const callbacks = this.updateCallbacks.get(key);
    
    
    if (callbacks) {
      // Debounce rapid successive updates
      if (this.updateTimeouts.has(key)) {
        return;
      }
      
      // Execute callbacks with a small delay to batch rapid updates
      const timeoutId = setTimeout(() => {
        callbacks.forEach((callback, index) => {
          try {
            callback(key, data);
          } catch (error) {
            console.error('❌ Cache update callback failed:', error);
          }
        });
        this.updateTimeouts.delete(key);
      }, 100); // 100ms delay to batch rapid updates
      
      this.updateTimeouts.set(key, timeoutId);
    }
  }

  /**
   * Get data from cache or fetch if needed
   */
  async get<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cacheTtl = ttl || this.getTtlForKey(key);
    const cached = this.getFromCache<T>(key);
    
    if (cached) {
      const cacheEntry = this.cache.get(key) as CacheEntry<T>;
      // Start background refresh even on cache hit to ensure it's running
      this.startBackgroundRefresh(key, fetchFn, cacheTtl);
      return cached;
    }

    const data = await fetchFn();
    this.setCache(key, data, cacheTtl);
    
    // Start background refresh if this is a frequently accessed key
    this.startBackgroundRefresh(key, fetchFn, cacheTtl);
    
    return data;
  }

  /**
   * Force refresh a cache entry
   */
  async forceRefresh<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    this.cache.delete(key);
    return this.get(key, fetchFn, ttl);
  }

  /**
   * Start proactive background refresh (only one per cache key)
   */
  startBackgroundRefresh<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number
  ): void {
    
    // Check if we already have a background refresh running for this key
    if (this.refreshIntervals.has(key)) {
      return;
    }

    // Clear existing interval for this key (shouldn't exist, but just in case)
    const existingInterval = this.refreshIntervals.get(key);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new refresh interval (check cache every 2s, refresh API based on TTL)
    const refreshInterval = key.includes('recenttracks') ? this.CACHE_CHECK_INTERVAL : ttl * 0.75;
    
    
    const interval = setInterval(async () => {
      try {
        // For recent tracks, check cache every 2s but only refresh API based on TTL
        if (key.includes('recenttracks')) {
          const cached = this.cache.get(key) as CacheEntry<T>;
          const now = Date.now();
          const age = cached ? now - cached.timestamp : 0;
          
          // Only refresh API if cache is expired (age >= ttl)
          if (cached && age < ttl) {
            return;
          }
          
        }
        // For other endpoints, check freshness before refreshing
        else {
          const cached = this.cache.get(key) as CacheEntry<T>;
          const now = Date.now();
          const age = cached ? now - cached.timestamp : 0;
          const freshnessThreshold = ttl * 0.5;
          
          if (cached && age <= freshnessThreshold) {
            return;
          }
        }

        const data = await fetchFn();
        this.setCache(key, data, ttl);
      } catch (error) {
        console.error('❌ Background refresh failed:', key, error);
        // Don't stop the interval on error, just log and continue
      }
    }, refreshInterval);

    this.refreshIntervals.set(key, interval);
  }

  /**
   * Stop background refresh for a key
   */
  stopBackgroundRefresh(key: string): void {
    const interval = this.refreshIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(key);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { 
    size: number; 
    keys: string[]; 
    refreshing: string[];
    callbacks: Record<string, number>;
  } {
    const callbacks: Record<string, number> = {};
    for (const [key, cbArray] of this.updateCallbacks.entries()) {
      callbacks[key] = cbArray.length;
    }
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      refreshing: Array.from(this.refreshIntervals.keys()),
      callbacks
    };
  }

  /**
   * Clear all cache and stop refreshes
   */
  clearAll(): void {
    this.cache.clear();
    this.refreshIntervals.forEach(interval => clearInterval(interval));
    this.refreshIntervals.clear();
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, cacheEntry);
    this.notifyCallbacks(key, data);
  }

  private getTtlForKey(key: string): number {
    if (key.includes('recenttracks')) return this.CACHE_CONFIG.recentTracks;
    if (key.includes('toptracks')) return this.CACHE_CONFIG.topTracks;
    if (key.includes('topartists')) return this.CACHE_CONFIG.topArtists;
    if (key.includes('topalbums')) return this.CACHE_CONFIG.topAlbums;
    if (key.includes('trackinfo')) return this.CACHE_CONFIG.trackInfo;
    return this.CACHE_CONFIG.recentTracks; // Default
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stopBackgroundRefresh(key);
      }
    }
  }
}

export default CacheService;
