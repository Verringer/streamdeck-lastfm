import { BaseAction } from '../BaseAction';

let ready = false;

// Get image url as base64 function
const getImageAsBase64 = async (url: string) => {
	// Make into a base64 image using fetch
	const imageResponse = await fetch(url);
	const imageData = await imageResponse.blob();
	// Convert to base64
	const imageBase64 = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(imageData);
		reader.onloadend = () => {
			resolve(reader.result);
		};
	});

	return imageBase64;
}


export class NowPlayingAction extends BaseAction {
	private contextData: Map<string, any> = new Map();

	async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }) {
		console.log('Settings received:', settings);

		// Store the settings in the contextData map
		let data = this.contextData.get(context);
		if (!data) {
			data = { timesUpdated: 0, timeStarted: Date.now() };
			this.contextData.set(context, data);
		}

		// Set settings
		data.lastFmApiKey = (settings as { lastfmApiKey: string })['lastfmApiKey'];
		data.lastFmUsername = (settings as { lastfmUsername: string })['lastfmUsername'];
		data.titleDisplay = (settings as { titleDisplay: string })['titleDisplay'];
		data.pollingFrequency = (settings as { pollingFrequency: number })['pollingFrequency'];

		// Set ready
		ready = true;

		// Update now
		this.updateTrackInfo(context);
	};

	async willAppear(context: string, action: string) {
		// Retrieve the data object for the current context
		let data = this.contextData.get(context);

		// If data is undefined, create a new data object
		if (!data) {
			data = { pollingFrequency: 30, timesUpdated: 0, timeStarted: Date.now() };
			this.contextData.set(context, data);
		} else if (!data.pollingFrequency) {
			data.pollingFrequency = 30;
		}

		// Update now
		await this.updateTrackInfo(context);

		// Then update every pollingFrequency seconds
		const update = async () => {
			await this.updateTrackInfo(context);

			// Schedule the next update
			setTimeout(update, data.pollingFrequency * 1000);
		};

		// Start the updates
		update();
	}

	async keyUp(context: string, action: string) {
	}

	async keyDown(context: string, action: string) {
		this.updateTrackInfo(context);
		this.plugin.showOk(context);
	}

	private async updateTrackInfo(context: string) {
		let data = this.contextData.get(context);
		if (!data) {
			console.log('No data for context:', context);
			return;
		}

		data.timesUpdated++;

		if (!ready) {
			console.log('Not ready yet');
			this.plugin.showAlert(context);
			return;
		}

		// GETTING DATA FOR USERNAME...
		console.log('🚀 Getting data for username:', data.lastFmUsername);

		const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${data.lastFmUsername}&api_key=${data.lastFmApiKey}&format=json`);
		const responseData = await response.json();


		let title = '';

		if (responseData.error) {
			console.log('API Error', responseData.error);
			data.image = '';
			title = 'Error';
			this.plugin.showAlert(context);
			return;
		}

		// Get the last played track
		const track = responseData.recenttracks.track[0];

		title = track.name;
		switch (data.titleDisplay) {
			case 'song':
				title = track.name;
				break;
			case 'artist':
				title = track.artist['#text'];
				break;
			case 'album':
				title = track.album['#text'];
				break;
			case 'artist-song':
				title = `${track.artist['#text']}
${track.name}`;
				break;
			case 'total-scrobbles':
				title = `${responseData.recenttracks['@attr'].total}`;
				break;
		}

		this.plugin.setTitle(title, context);

		const imageBase64 = await getImageAsBase64(track.image[3]['#text']);
		this.plugin.setImage(imageBase64 as string, context);

		console.log('Updated', data.timesUpdated, 'times in', (Date.now() - data.timeStarted) / 1000, 'seconds.');
	}
}