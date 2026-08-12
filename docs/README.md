# StreamDeck Last.fm Docs Site

This site mostly serves marketing purposes, but also contains some useful information for users of the plugin and makes it easier for end users to find and use the plugin.

## Tech Stack

- React
- Vite
- Tailwind
- GitHub Pages

## Development

Node.js 24 LTS is recommended. Install the locked dependencies and start Vite:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173/streamdeck-lastfm/).

Before submitting a change, run:

```sh
npm run lint
npm run build
```

## Deployment

The site is deployed to GitHub Pages using GitHub Actions when files under `docs/` change.

## Contributing

If you'd like to make improvements to this - that's welcome, but please have a chat with me first so we can make sure it's consistent with the rest of the project and vision.

You're welcome to use parts of the site for your own projects, but please don't copy the entire thing and pass it off as your own is all I'd like to ask.
