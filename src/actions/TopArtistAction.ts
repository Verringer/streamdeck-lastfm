import { BaseAction } from '../BaseAction';
import { createCanvas, loadImage } from 'canvas';


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

    // Load the image and create a canvas
    const image = await loadImage(imageBase64 as string);
    const canvas = createCanvas(144, 144); // Set the canvas size to 144x144
    const ctx = canvas.getContext('2d');

    // Calculate the scale factor and position to center and cover the canvas
    const scaleFactor = Math.max(canvas.width / image.width, canvas.height / image.height);
    const x = (canvas.width - image.width * scaleFactor) / 2;
    const y = (canvas.height - image.height * scaleFactor) / 2;

    // Draw the image on the canvas, scaling and positioning it to cover and center
    ctx.drawImage(image, x, y, image.width * scaleFactor, image.height * scaleFactor);

    // Convert the canvas to a Data URL
    const imageCropped = canvas.toDataURL('image/png');

    // Return the cropped image
    return imageCropped;
}

export class TopArtistAction extends BaseAction {
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

		const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${data.lastFmUsername}&period=${data.displayPeriod}&api_key=${data.lastFmApiKey}&format=json`);

		const responseData = await response.json();

		let title = '';

		if (responseData.error) {
			console.log('API Error', responseData.error);
			data.image = '';
			title = 'Error';
			this.plugin.showAlert(context);
			return;
		}

		// Get top artist
		const artist = responseData.topartists.artist[0];

		// Set title
		title = artist.name;
		switch (data.titleDisplay) {
			case 'artist':
				title = artist.name;
				break;
			case 'total-scrobbles':
				title = `${artist.playcount}`;
				break;
		}

		this.plugin.setTitle(title, context);

		// We need to use MusicBrainz for artist images, as Last.fm dropped this feature of their API but still keep it in the docs

		let image = '';
		let mbid = null;

		// Get mbid
		if (artist.mbid && artist.mbid !== '') {
			console.log('Got mbid from last.fm');
			mbid = artist.mbid;
		} else {
			// Sometimes Last.fm doesn't return mbid, so we can search MusicBrainz to get it
			const mbResponse = await fetch(`https://musicbrainz.org/ws/2/artist?query=${artist.name}&fmt=json`, {
				headers: {
					'User-Agent': 'StreamDeck Lastfm'
				}
			});

			const mbData = await mbResponse.json();
			const mbArtist = mbData.artists[0];

			mbid = mbArtist.id;

			console.log('Got mbid from MusicBrainz: ', mbid);
		}

		if (mbid) {
			// Get artist
			const mbResponse = await fetch(`https://musicbrainz.org/ws/2/artist/${mbid}?inc=url-rels&fmt=json`, {
				headers: {
					'User-Agent': 'StreamDeck Lastfm'
				}
			});

			// Get image
			const mbData = await mbResponse.json();
			if (mbData.relations) {
				const imageRelation = mbData.relations.find((relation: { type: string; url: { resource: string; }; }) => relation.type === 'image');
				if (imageRelation) {
					image = imageRelation.url.resource;

					// Adjustment for MusicBrainz giving Wikipedia links
					if (image.includes('commons.wikimedia.org')) {

						image = image.replace('%3A', ':');
						image = image.replace('/wiki/File:', '/wiki/Special:FilePath/');
					}

				}
			}
		}

		if (image) {
			const imageBase64 = await getImageAsBase64(image);

			this.plugin.setImage(imageBase64 as string, context);
		} else {
			this.plugin.setImage('', context);
		}

	}
}