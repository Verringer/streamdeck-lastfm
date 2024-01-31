import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import { PropertyInspector } from '@rweich/streamdeck-ts';

const defaultSettings = {
	titleDisplay: 'total-scrobbles',
	lastfmApiKey: 'abc123',
	lastfmUsername: 'Verringer',
	pollingFrequency: '30'
};

let settingsMap = new Map<string, any>();

export const initNowPlayingPi = (pi: PropertyInspector, pluginContext: string, settings: unknown) => {

	// Set initial settings to settings received from the propertyinspector
	// If no settings were received, use the default settings
	let contextSettings = settingsMap.get(pluginContext);
	if (!contextSettings) {
		contextSettings = settings ?? defaultSettings;
		settingsMap.set(pluginContext, contextSettings);
	}

	const builder = new FormBuilder({ ...defaultSettings, ...contextSettings });

	builder.addElement('titleDisplay', builder.createDropdown()
		// .addOption('Hide title', 'hide')
		// .addOption('Don\'t change title', 'none')
		.addOption('Show only artist', 'artist')
		.addOption('Show only song', 'song')
		.addOption('Show only album title', 'album')
		.addOption('Full artist - song', 'artist-song')
		.addOption('Your total scrobbles', 'total-scrobbles')
		// Time played (playing now or 30 mins ago)
		.setLabel('Label')
	);

	builder.addElement('lastfmApiKey', builder.createInput().setLabel('API Key').setPlaceholder('abc'));
	// Explanation text
	const explanationElApi = document.createElement('div');
	explanationElApi.style.marginBottom = '10px';
	explanationElApi.style.marginLeft = '110px';
	explanationElApi.textContent = 'You can get your API key from ';
	const explanationElApiLink = document.createElement('a');
	explanationElApiLink.href = 'https://www.last.fm/api/account/create';
	explanationElApiLink.textContent = 'here';
	explanationElApiLink.target = '_blank';
	explanationElApi.appendChild(explanationElApiLink);
	builder.addHtmlElement(explanationElApi);

	builder.addElement('lastfmUsername', builder.createInput().setLabel('Username').setPlaceholder('Verringer'));

	// Add number input for pollingFrequency
	builder.addElement('pollingFrequency', builder.createInput().setLabel('Poll Frequency').setPlaceholder('30'));
	// Explanation text
	const explanationElPoll = document.createElement('div');
	explanationElPoll.style.marginBottom = '10px';
	explanationElPoll.style.marginLeft = '110px';
	explanationElPoll.textContent = 'How often to check for new updates (in seconds).';
	builder.addHtmlElement(explanationElPoll);

	// append the formbuilder (html) to the propertyinspector
	builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);

	// send the new settings to the propertyinspector whenever they change
	builder.on('change-settings', () => {
		const newSettings = builder.getFormData();
		settingsMap.set(pluginContext, newSettings);
		pi.setSettings(pluginContext, newSettings);
	});
};