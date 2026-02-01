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
			const period = data.displayPeriod || 'overall';
			const topArtistsKey = this.generateCacheKey('user.gettopartists', { 
				user: data.lastFmUsername!, 
				period 
			});

			const response = await this.getCachedData(
				topArtistsKey,
				() => this.apiService.getTopArtists(data.lastFmUsername!, period, data.lastFmApiKey!),
				this.getPollingTtlMs(data, 1800)
			);

			if (response.error) {
				this.handleApiError(context, response.error);
				return;
			}

			const artist = response.data.topartists?.artist?.[0];
			if (!artist) {
				return;
			}
			const title = this.formatTitle(artist, data.titleDisplay || 'artist');

			this.plugin.setTitle(title, context);

			// Get artist image using MusicBrainz
			let imageUrl = '';
			let mbid = artist.mbid;

			if (!mbid && artist.name) {
				const mbSearchKey = this.generateCacheKey('musicbrainz.searchArtist', { artist: artist.name });
				const mbArtist = await this.getCachedData(
					mbSearchKey,
					() => this.apiService.searchMusicBrainzArtist(artist.name),
					86400000
				);
				if (mbArtist) {
					mbid = mbArtist.id;
				}
			}

			if (mbid) {
				const mbImageKey = this.generateCacheKey('musicbrainz.artistImage', { mbid });
				imageUrl = await this.getCachedData(
					mbImageKey,
					() => this.apiService.getMusicBrainzArtistImage(mbid),
					86400000
				);
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
