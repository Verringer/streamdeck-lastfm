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
			const response = await this.apiService.getTopTracks(
				data.lastFmUsername!,
				data.displayPeriod || 'overall',
				data.lastFmApiKey!
			);

			if (response.error) {
				this.handleApiError(context, response.error);
				return;
			}

			const track = response.data.toptracks.track[0];
			const title = this.formatTitle(track, data.titleDisplay || 'song');

			this.plugin.setTitle(title, context);

			// Get track info for album image
			const trackResponse = await this.apiService.getTrackInfo(
				track.artist.name,
				track.name,
				data.lastFmApiKey!
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