![Plugin demo screenshot](https://github.com/Verringer/streamdeck-lastfm/blob/main/cover.png?raw=true)

Seamlessly integrates Last.fm features into your Elgato StreamDeck, providing you with quick access to your scrobbles, profile, reports, and more.

[Getting Started](https://verringer.github.io/streamdeck-lastfm/)

[Download From Elgato Marketplace](https://github.com/Verringer/streamdeck-lastfm/releases/latest/download/com.verringer.lastfm.streamDeckPlugin)

[Download from GitHub Releases](https://github.com/Verringer/streamdeck-lastfm/releases/latest/download/com.verringer.lastfm.streamDeckPlugin)

## Features

At a glance, stay updated on your current playing track, recently played tunes, and the latest activities of your friends on Last.fm – all conveniently displayed on your StreamDeck.

- See what's playing on your favorite music player at a glance. No need to switch windows or open a browser tab to check what's playing - it's all right there on your StreamDeck.

- Instantly access your Last.fm profile, reports, and other essential features with a single click. Save setting up shortcuts and get more from Last.fm with less effort.

- See what your friends are listening to and discover new music. Keep up to date with your friends' musical tastes.

- Tailor the update frequency for each widget to prevent ratelimiting. Customize your experience based on your preferences, ensuring a seamless and uninterrupted music tracking journey.

- Keep track of your musical preferences with separate widgets showcasing your top track, album, and artist. Dive into your music stats with ease.

## Compatibility

This plugin is compatible with all StreamDeck devices and is verified working on MacOS and Windows.

## Installation

Recommended way to install is to download from the official [Elgato Marketplace](https://marketplace.elgato.com/product/stream-deck-lastfm-1c78b0c3-481a-4e1c-a0ee-a2a07b005576).

Alternatively download the latest release from the sidebar and open the downloaded `com.verringer.lastfm.streamDeckPlugin` file to install automatically in StreamDeck.

## Usage / Setup

Go to the [Last.fm API](https://www.last.fm/api/account/create) and create an API key. Copy the API key somewhere safe while you set up your actions (you will need it for each action you add).

Download the plugin from the latest releases on the sidebar and double click the file to install it in StreamDeck.

Once installed - you can add an action from the Last.fm category on your StreamDeck application and fill in the required details including the API key you just created.

If you lose your API key, you can find it again on the [this page](https://www.last.fm/api/accounts).

If you'd like to have a blank title, you can simply add a space to the title field and the label won't apply.

## Development

Any contributions are welcome, for whatever reason. If you want to add a feature, fix a bug, or just want to play around with the code, feel free to do so - it's all open source for a reason.

During development you can use either of the following to install the plugin:

### Installation

Once you've loaded the project, you can install the development version of the plugin by running the following command which creates a symlink to the plugin in the StreamDeck plugin folder:
MacOS: ``ln -s $(pwd)/dist/dev.com.verringer.lastfm.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/``

Run ``yarn`` in root to install dependencies and ``yarn build`` after making changes to build it to your StreamDeck plugin folder. If changes are made to manifest, you will need to restart StreamDeck (the application) for them to take effect. Manifest is defined in /assets/manifest.json.

### Debugging

While developing, console can be accessed here:
http://localhost:23654/

### Adding New Actions
If adding a new icon, make sure to follow the pre-existing format and render the following sizes:
- action.icon.png: 20x20
- action.icon@2x.png: 40x40
- action.key.png: 72x72
- action.key@2x.png: 144x144

This is made easy with sips on MacOS, give this a go to generate the icons in bulk (replace action-name with the new action name):
```
    sips -Z 20 new.png --out action-name.icon.png
    sips -Z 40 new.png --out action-name.icon@2x.png
    sips -Z 72 new.png --out action-name.key.png
    sips -Z 144 new.png --out action-name.key@2x.png
```

## Links

These links helped a lot during development, and are worth checking out if you're interested in developing your own StreamDeck plugin:
- Created using @rweich's [StreamDeck Typescript](https://github.com/rweich/streamdeck-ts), [StreamDeck Formbuilder](https://github.com/rweich/streamdeck-formbuilder) and examples.
- [StreamDeck Plugin API](https://docs.elgato.com/sdk/)
- Remade this design in Xd from @sjoerd_dijkstra (on figma)'s [community template](https://www.figma.com/community/file/1144539638960396016)
- Thanks to this answer on [StackOverflow](https://stackoverflow.com/questions/55978243/last-fm-api-returns-same-white-star-image-for-all-artists) and [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API) for supplying the artist images (without even needing an API key, awesome!).

## Documentation Website

There is a website (`/docs`) deployed with Github Pages that contains an overview for this plugin, it can be found [here](https://verringer.github.io/streamdeck-lastfm/).

If you'd like to make improvements to this - that's welcome, but please have a chat with me first so we can make sure it's consistent with the rest of the project and vision.

You're welcome to use parts of the site for your own projects, but please don't copy the entire thing and pass it off as your own is all I'd like to ask.

There is additional documentation in `docs/README.md` for this.

## Future Plans

- [ ] There's a small bug where there's no initial content in the widgets settings + unless you set each setting - it doesn't seem to apply the default. Important TODO
- [ ] Adding positions to the widgets would allow users to create a grid of their last 5 tracks, top 5 artists, etc. This would be a nice feature to add, but would require the API to be called multiple times for each widget, which would be a lot of requests. This could be solved by adding a cache, but that would be a lot of work for a small feature.
- [ ] Originally intended on adding a "love track", which would love the track on Last.fm (something I personally don't utilise as it requires going out of your way). The Last.fm API doesn't allow you to check if a track is loved or not - and I really wanted to have it toggle. Would also benefit from a cache so we're not calling recentlyplayed * actionsvisible times per polling period.
- [ ] Easy access to scrobbling (perhaps with a 3rd party app), so you can manually enter those pesky vinyl scrobbles.
- [ ] More labels in the future including adding the username, etc.
- [ ] Configurable onpress actions, such as opening the track, profile, etc... instead of just forced refreshing. In an ideal world - I'd like it to force refresh on hold for x seconds, and configurable for the short press.
- [ ] Adding playstats for artists to see how many times they've been scrobbled, etc.
- [ ] Gallery widget to fade between top tracks, etc.

Love to hear your ideas, please submit in the issues tab to discuss.