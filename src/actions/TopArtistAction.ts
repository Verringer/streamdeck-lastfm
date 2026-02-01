import { BaseTopAction } from './BaseTopAction';

export class TopArtistAction extends BaseTopAction {

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
			const response = await this.apiService.getTopArtists(
				data.lastFmUsername!,
				data.displayPeriod || 'overall',
				data.lastFmApiKey!
			);

			if (response.error) {
				this.handleApiError(context, response.error);
				return;
			}

			const artist = response.data.topartists.artist[0];
			const title = this.formatTitle(artist, data.titleDisplay || 'artist');

			this.plugin.setTitle(title, context);

			// Get artist image using MusicBrainz
			let imageUrl = '';
			let mbid = artist.mbid;

			if (!mbid) {
				const mbArtist = await this.apiService.searchMusicBrainzArtist(artist.name);
				if (mbArtist) {
					mbid = mbArtist.id;
				}
			}

			if (mbid) {
				imageUrl = await this.apiService.getMusicBrainzArtistImage(mbid);
			}

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