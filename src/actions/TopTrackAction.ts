import { BaseAction } from '../BaseAction';

let ready = false;

// Get image url as base64 function
const getImageAsBase64 = async (url: string) => {
	const imageResponse = await fetch(url);
	const imageData = await imageResponse.blob();
	const imageBase64 = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(imageData);
		reader.onloadend = () => {
			resolve(reader.result);
		};
	});

	return imageBase64;
}


export class TopTrackAction extends BaseAction {
	private contextData: Map<string, any> = new Map();

	async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }) {

		// Store the settings in the contextData map
		let data = this.contextData.get(context);
		if (!data) {
			data = { timesUpdated: 0, timeStarted: Date.now(), displayPeriod: 'overall' };
			this.contextData.set(context, data);
		}

		// Set settings
		data.lastFmApiKey = (settings as { lastfmApiKey: string })['lastfmApiKey'];
		data.lastFmUsername = (settings as { lastfmUsername: string })['lastfmUsername'];
		data.displayPeriod = (settings as { displayPeriod: string })['displayPeriod'];
		data.pollingFrequency = (settings as { pollingFrequency: number })['pollingFrequency'];
		data.titleDisplay = (settings as { titleDisplay: string })['titleDisplay'];

		// Set ready
		ready = true;

		// Update now
		this.updateInfo(context);
	};

	async willAppear(context: string, action: string) {
		// Retrieve the data object for the current context
		let data = this.contextData.get(context);

		// If data is undefined, create a new data object
		if (!data) {
			data = { pollingFrequency: 30, timesUpdated: 0, timeStarted: Date.now(), displayPeriod: 'overall' };
			this.contextData.set(context, data);
		} else if (!data.pollingFrequency) {
			data.pollingFrequency = 30;
		}

		// Update now
		await this.updateInfo(context);

		// Then update every pollingFrequency seconds
		const update = async () => {
			await this.updateInfo(context);

			// Schedule the next update
			setTimeout(update, data.pollingFrequency * 1000 * 60);
		};

		// Start the updates
		update();
	}

	async keyUp(context: string, action: string) {
	}

	async keyDown(context: string, action: string) {
		this.updateInfo(context);
		this.plugin.showOk(context);
	}

	private async updateInfo(context: string) {
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

		const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${data.lastFmUsername}&period=${data.displayPeriod}&api_key=${data.lastFmApiKey}&format=json`);
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
		const track = responseData.toptracks.track[0];

		title = track.name;
		switch (data.titleDisplay) {
			case 'song':
				title = track.name;
				break;
			case 'artist':
				title = track.artist.name;
				break;
			case 'artist-song':
				title = `${track.artist.name}
${track.name}`; // Looks weird, but needed for the line break
				break;
			case 'total-scrobbles':
				title = `${track.playcount}`;
				break;
		}

		this.plugin.setTitle(title, context);


		// We must hit track.getInfo to get the image because getTopTracks doesn't return it properly
		const trackResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${data.lastFmApiKey}&artist=${encodeURIComponent(track.artist.name)}&track=${encodeURIComponent(track.name)}&format=json`);
		const trackData = await trackResponse.json();

		if (trackData.error) {
			console.log('API Error', trackData.error);
			data.image = '';
			title = 'Error';
			this.plugin.showAlert(context);
			return;
		}

		// set image
		const image = trackData.track.album.image[3]['#text'];

		if(image) {
			const imageBase64 = await getImageAsBase64(image);
			this.plugin.setImage(imageBase64 as string, context);
		} else {
			this.plugin.setImage('', context);
		}

	}
}