import { BaseAction, ActionSettings } from '../BaseAction';
import LastFmApiService from '../services/LastFmApiService';

export class NowPlayingAction extends BaseAction {
	protected apiService = LastFmApiService.getInstance();
	private static lastUpdateKey = '';
	private static lastUpdateTime = 0;
	private static isRefreshingAll = false;
	private static lastManualRefresh = 0;
	private static readonly MANUAL_REFRESH_COOLDOWN = 8000; // 8 seconds

	async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }) {
		this.updateContextSettings(context, settings as ActionSettings);
		
		// Re-register for cache updates with new settings
		const data = this.getOrCreateContextData(context);
		if (data.lastFmUsername && data.lastFmApiKey) {
			const cacheKey = this.generateCacheKey('user.getrecenttracks', { 
				user: data.lastFmUsername 
			});
			
			this.registerForCacheUpdates(cacheKey, () => this.updateTrackInfo(context));
		}
		
		this.updateTrackInfo(context);
	};

	async willAppear(context: string, action: string) {
		const data = this.getOrCreateContextData(context);
		
		// Register for cache updates if we have credentials
		if (data.lastFmUsername && data.lastFmApiKey) {
			const cacheKey = this.generateCacheKey('user.getrecenttracks', { 
				user: data.lastFmUsername 
			});
			
			this.registerForCacheUpdates(cacheKey, async () => {
				await this.updateTrackInfo(context);
			});
		}
	}

	async keyUp(context: string, action: string) {
	}

	async keyDown(context: string, action: string) {
		// Check manual refresh cooldown
		const now = Date.now();
		const timeSinceLastRefresh = now - NowPlayingAction.lastManualRefresh;
		
		if (timeSinceLastRefresh < NowPlayingAction.MANUAL_REFRESH_COOLDOWN) {
			this.plugin.showOk(context);
			return;
		}
		
		NowPlayingAction.lastManualRefresh = now;
		
		await this.refreshAllWidgets(context);
		this.plugin.showOk(context);
	}

	private async refreshAllWidgets(context: string): Promise<void> {
		// Prevent multiple simultaneous refreshes
		if (NowPlayingAction.isRefreshingAll) {
			return;
		}

		NowPlayingAction.isRefreshingAll = true;
		
		try {
			// Get all contexts with same user/API
			const allContexts = Array.from(this.contextData.keys());
			const currentData = this.contextData.get(context);
			
			if (!currentData?.lastFmUsername || !currentData?.lastFmApiKey) {
				return;
			}

			
			// Force refresh cache key
			const cacheKey = this.generateCacheKey('user.getrecenttracks', { 
				user: currentData.lastFmUsername 
			});
			
			// Force bypass cache for manual refresh
			await this.refreshCachedData(
				cacheKey,
				() => this.apiService.getRecentTracks(currentData.lastFmUsername!, currentData.lastFmApiKey!),
				(currentData.pollingFrequency ? parseInt(currentData.pollingFrequency) : 15) * 1000
			);
			
			// Update all contexts with same credentials
			const refreshPromises = allContexts.map(ctx => {
				const ctxData = this.contextData.get(ctx);
				if (ctxData?.lastFmUsername === currentData.lastFmUsername &&
					ctxData?.lastFmApiKey === currentData.lastFmApiKey) {
					return this.updateTrackInfo(ctx);
				}
				return Promise.resolve();
			});

			await Promise.all(refreshPromises);
		} finally {
			NowPlayingAction.isRefreshingAll = false;
		}
	}

	private async updateTrackInfo(context: string): Promise<void> {
		const data = this.contextData.get(context);

		if (!data) {
			return;
		}

		if (!this.isContextReady(context)) {
			return;
		}

		try {
			if (!data.lastFmUsername || !data.lastFmApiKey) {
				return;
			}

			// Create cache key for this request
			const cacheKey = this.generateCacheKey('user.getrecenttracks', { 
				user: data.lastFmUsername 
			});


			// Use cached data with proactive background refresh
			const apiResponse = await this.getCachedData(
				cacheKey,
				() => this.apiService.getRecentTracks(data.lastFmUsername!, data.lastFmApiKey!),
				(data.pollingFrequency ? parseInt(data.pollingFrequency) : 15) * 1000 // Use user setting or 15s default as TTL
			);
			
			if (apiResponse.error) {
				throw new Error(`API Error: ${apiResponse.error.message}`);
			}

			const recentTracks = apiResponse.data;
			const track = recentTracks?.recenttracks?.track?.[0];
			

			if (track) {
				if (this.shouldUpdateGrid(context)) {
					await this.updateGridDisplay(context, track, `${track.name} - ${track.artist['#text']}`);
				} else {
					const imageUrl = track.image[3]['#text'];
					if (imageUrl) {
						const imageBase64 = await this.imageService.getImageAsBase64(imageUrl);
						if (imageBase64) {
							this.plugin.setImage(imageBase64, context);
						}
					}
					this.plugin.setTitle(`${track.name} - ${track.artist['#text']}`, context);
				}
			}
		} catch (error) {
			this.handleApiError(context, error);
		}
	}

	private triggerSynchronizedUpdate(context: string): void {
		// Find all contexts with same grid settings AND same configuration
		const allContexts = Array.from(this.contextData.keys());
		const currentData = this.contextData.get(context);
		
		if (!currentData?.gridEnabled) return;

		// Trigger update for all grid contexts with same user/api AND same grid size
		for (const ctx of allContexts) {
			const ctxData = this.contextData.get(ctx);
			if (ctxData?.gridEnabled && 
				ctxData.lastFmUsername === currentData.lastFmUsername &&
				ctxData.lastFmApiKey === currentData.lastFmApiKey &&
				ctxData.gridSize === currentData.gridSize) {
				
				// Schedule immediate update for this context
				setTimeout(() => {
					this.updateTrackInfo(ctx);
				}, Math.random() * 100); // Small random delay to avoid race conditions
			}
		}
	}

	protected async updateGridDisplay(context: string, track: any, title: string): Promise<void> {
		const data = this.contextData.get(context);
		const imageUrl = track.image[3]['#text'];
		await super.updateGridDisplay(context, imageUrl, title, data);
	}
}