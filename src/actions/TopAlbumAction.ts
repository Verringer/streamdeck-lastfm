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
			const response = await this.apiService.getTopAlbums(
				data.lastFmUsername!,
				data.displayPeriod || 'overall',
				data.lastFmApiKey!
			);

			if (response.error) {
				this.handleApiError(context, response.error);
				return;
			}

			const album = response.data.topalbums.album[0];
			const title = this.formatTitle(album, data.titleDisplay || 'album');

			this.plugin.setTitle(title, context);

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