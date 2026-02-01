import { BaseTopAction } from './BaseTopAction';

export class TopAlbumAction extends BaseTopAction {

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
			const topAlbumsKey = this.generateCacheKey('user.gettopalbums', { 
				user: data.lastFmUsername!, 
				period 
			});

			const response = await this.getCachedData(
				topAlbumsKey,
				() => this.apiService.getTopAlbums(data.lastFmUsername!, period, data.lastFmApiKey!),
				this.getPollingTtlMs(data, 1800)
			);

			if (response.error) {
				this.handleApiError(context, response.error);
				return;
			}

			const album = response.data.topalbums?.album?.[0];
			if (!album) {
				return;
			}
			const title = this.formatTitle(album, data.titleDisplay || 'album');

			this.plugin.setTitle(title, context);
			data.lastAlbumName = album.name || '';
			data.lastArtistName = album.artist?.name || album.artist?.['#text'] || '';
			data.lastTrackName = '';

			const imageUrl = album.image[3]['#text'];
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
