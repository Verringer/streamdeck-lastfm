import { BaseTopAction } from './BaseTopAction';

export class TopTrackAction extends BaseTopAction {

	protected async updateInfo(context: string): Promise<void> {
		const data = this.contextData.get(context);
		if (!data) {
			return;
		}

		data.timesUpdated++;

		if (!this.isContextReady(context)) {
			this.plugin.showAlert(context);
			return;
		}

		try {
			const period = data.displayPeriod || 'overall';
			const topTracksKey = this.generateCacheKey('user.gettoptracks', { 
				user: data.lastFmUsername!, 
				period 
			});

			const response = await this.getCachedData(
				topTracksKey,
				() => this.apiService.getTopTracks(data.lastFmUsername!, period, data.lastFmApiKey!),
				this.getPollingTtlMs(data, 1800)
			);

			if (response.error) {
				this.handleApiError(context, response.error);
				return;
			}

			const track = response.data.toptracks?.track?.[0];
			if (!track) {
				return;
			}
			const title = this.formatTitle(track, data.titleDisplay || 'song');

			this.plugin.setTitle(title, context);
			data.lastTrackName = track.name || '';
			data.lastArtistName = track.artist?.name || track.artist?.['#text'] || '';
			data.lastAlbumName = '';

			// Get track info for album image
			const trackInfoKey = this.generateCacheKey('track.getinfo', { 
				artist: track.artist.name, 
				track: track.name 
			});

			const trackResponse = await this.getCachedData(
				trackInfoKey,
				() => this.apiService.getTrackInfo(track.artist.name, track.name, data.lastFmApiKey!),
				600000
			);

			if (trackResponse.error) {
				this.handleApiError(context, trackResponse.error);
				return;
			}

			const imageUrl = trackResponse.data.track.album.image[3]['#text'];
			if (imageUrl) {
				const imageBase64 = await this.imageService.getImageAsBase64(imageUrl);
				if (imageBase64) {
					this.plugin.setImage(imageBase64, context);
				}
			} else {
				this.plugin.setImage('', context);
			}
		} catch (error) {
			this.handleApiError(context, error);
		}
	}
}
