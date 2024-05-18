import bgCover from './assets/bg-cover.png'
import StreamDeck from './assets/streamdeck-angled.png'
import OptionsDemo from './assets/options-demo.png'
import yt from './assets/yt.png'

import launchPageIcon from './assets/icons/launch-page.png';
import nowPlayingIcon from './assets/icons/now-playing.png';
import topAlbumIcon from './assets/icons/top-album.png';
import topArtistIcon from './assets/icons/top-artist.png';
import topTrackIcon from './assets/icons/top-track.png';

import { Fade } from "react-awesome-reveal";


function App() {

  return (
    <>
      <div className="absolute h-full -z-10 right-0 top-0">
        <Fade direction="down" triggerOnce>
          <img src={bgCover} alt="Album grid" className="h-full w-full object-cover" />
        </Fade>
      </div>

      {/* Header */}
      <div className="flex justify-between container mx-auto gap-x-8 gap-y-20 flex-col md:flex-row items-center min-h-[80vh] py-24 px-8">
        <div className="order-2 md:order-1">
          <h1 class="text-3xl sm:text-5xl leading-normal sm:leading-normal font-bold max-w-xl">
            Last.fm Listening History At Your Fingertips
          </h1>
          <div className="my-2"></div>
          <div className="max-w-md leading-loose">
            <p>
              Seamlessly integrates Last.fm features into your Elgato StreamDeck with a number of supported widgets to interact with Last.fm.
            </p>
          </div>
          <div className="my-8"></div>
          <button className="bg-black text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full shadow-lg transition duration-300" onClick={() => {
            const element = document.getElementById('scrollIntoGetStarted');
            element.scrollIntoView({ behavior: 'smooth' });
          }}>
            Get started
          </button>
        </div>
        <div className="order-1 md:order-2 w-full max-w-sm">
          <Fade direction="right" triggerOnce>
            <img src={StreamDeck} alt="Stream Deck running this plugin" />
          </Fade>
        </div>
      </div>
      <div className="my-8"></div>

      {/* Features */}
      <div className="px-4">
        <ul className="container bg-white mx-auto rounded-2xl text-black overflow-x-hidden">
          {Array.from([
            {
              title: "Track Your Friends",
              description: "Not in a creepy way, but you can monitor your friends Last.fm as well as your own side-by-side",
              emoji: "👀"
            },
            {
              title: "Completely Free",
              description: "No ads, no premium, no nothing. Just download and use with no limits",
              emoji: "🆓"
            },
            {
              title: "Universal Now Playing",
              description: "Scrobble to Last.fm using any music player and the plugin will pick it up",
              emoji: "💽"
            },
            {
              title: "Open Source",
              description: "This plugin was made to solve my problem and open sourced to help solve yours. Built in TypeScript made possible by <a href='https://github.com/rweich/streamdeck-ts' target='_blank'><code>@rweich/streamdeck-ts</code></a>",
              emoji: "❤️"
            },
            {
              title: "Configure Everything",
              description: "Everything you could do - is there as an option. We’re only going to add more as time goes on so keep an eye out for updates",
              emoji: "🔧"
            },
          ]
          ).map((item, index) => (
            <li className={`w-full py-20 flex justify-between gap-x-8 gap-y-4 px-6 sm:px-20 rounded-2xl flex-col sm:flex-row items-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
              <Fade direction="left">
                <div className="order-2 sm:order-1 text-center sm:text-left">
                  <h2 class="text-2xl font-bold mb-2">{item.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                </div>
              </Fade>
              <Fade direction="right">
                <div className="order-1 md:order-2">
                  <div className="text-6xl font-bold">{item.emoji}</div>
                </div>
              </Fade>
            </li>
          ))}
        </ul>
      </div>

      <div className="my-32"></div>

      {/* Configure Widgets */}
      <div className="container mx-auto">
        <div className="flex justify-between max-w-5xl gap-y-24 px-8 mx-auto flex-col md:flex-row gap-x-24">
          <div className="order-2 md:order-1">
            <h1 class="text-3xl sm:text-5xl leading-normal sm:leading-normal font-bold max-w-xl text-center md:text-left">
              Super Configurable Widgets
            </h1>
            <div className="my-2"></div>
            <div className="max-w-sm leading-loose text-center md:text-left mx-auto md:mx-0">
              <p className="">
                Each widget has a number of options to configure the output to your liking. You can choose to display the album cover, artist, album, track, or any combination of the three.
              </p>
            </div>
          </div>
          <div className="order-1 sm:order-2 mx-auto md:mx-0">
            <img src={OptionsDemo} alt="Stream Deck" className="w-80 object-cover" />
          </div>
        </div>
      </div>
      <div className="my-32"></div>

      {/* Widgets List */}
      <div className="container mx-auto flex flex-col gap-y-24 px-4">
        {Array.from([
          {
            title: "Recently Played",
            description: "Retrieve the most recently played song (or current if playing) from any users Last.fm profile",
            icon: nowPlayingIcon
          },
          {
            title: "Top Tracks",
            description: "Access the top track over different periods of time from a users Last.fm profile",
            icon: topTrackIcon
          },
          {
            title: "Top Albums",
            description: "At a glance, see the most played album from a users Last.fm profile",
            icon: topAlbumIcon
          },
          {
            title: "Top Artists",
            description: "See the most played artist from a users Last.fm profile",
            icon: topArtistIcon
          },
          {
            title: "Launch Page",
            description: "Get quick access to Last.fm features on the web with a handy button making it more accessible than ever",
            icon: launchPageIcon
          },
        ]
        ).map((item, index) => (
          <Fade direction="up">
            <div className="w-full rounded-2xl bg-gradient-to-br from-[#232323] to-[#121212] text-white p-8 shadow-lg">

              <div className="sm:flex gap-8">

                <img src={item.icon} alt={item.title + " icon"}
                  className="w-20 object-contain rounded-2xl h-20 shadow-md" />
                <div className="mt-4 sm:mt-0">
                  <h2 className="text-2xl font-bold">{item.title}</h2>
                  <div className="my-2"></div>
                  <div className="text-sm leading-loose max-w-[600px]" dangerouslySetInnerHTML={{ __html: item.description }}></div>
                </div>
              </div>
            </div>
          </Fade>
        ))}
        <div className="my-8"></div>
      </div>

      <div id="scrollIntoGetStarted"></div>

      {/* <div className="my-32"></div> */}

      {/* Get Started - with YouTube */}
      {/* <div id="getStarted" className="flex gap-x-8 justify-between container px-4 mx-auto flex-col gap-y-20 lg:flex-row">
        <div className="order-2 sm:order-1">
          <h1 class="text-3xl sm:text-5xl leading-normal sm:leading-normal font-bold lg:max-w-xl text-center lg:text-left">
            Get Started
          </h1>
          <div className="my-2"></div>
          <div className="max-w-lg leading-loose text-center lg:text-left mx-auto lg:mx-0">
            <p>
              New to Last.fm? Find out more about the service and scrobbling here and sign up before proceeding.
            </p>
            <div className="my-8"></div>
            <p>
              You’ll require a API key from the Last.fm developer applications for this to work.
            </p>

            <a href="https://www.last.fm/api/account/create" target="_blank" className="mt-6 mx-auto group lg:mx-0 w-fit flex items-center font-bold hover:opacity-60 transition duration-300">
              Create API key
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-3 ml-2 text-white group-hover:translate-x-1 transition duration-300"
                viewBox="0 0 24 25.243">
                <g id="Icon_feather-arrow-right" data-name="Icon feather-arrow-right" transform="translate(-6 -5.379)">
                  <path id="Path_274" data-name="Path 274" d="M7.5,18h21" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
                  <path id="Path_275" data-name="Path 275" d="M18,7.5,28.5,18,18,28.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
                </g>
              </svg>
            </a>
          </div>
        </div>
        <div className="order-2">
          <img src={yt} alt="Stream Deck" className="w-full lg:w-[550px] object-cover" />
        </div>
      </div> */}

      {/* <div className="my-16"></div> */}

      {/* Download - for multiple */}
      {/* <div className="container mx-auto px-4">
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
          <a href="https://github.com/Verringer/streamdeck-lastfm/releases/latest" target="_blank"
            className="bg-black text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full text-center shadow-lg transition duration-300 w-full">
            Download from Github
          </a>
        </div>
      </div> */}

      <div className="my-24"></div>

      {/* Contribute */}
      <div className="flex justify-center mb-48 px-8">
        <div className="flex flex-col items-center text-center">
          <h1 class="text-3xl sm:text-5xl leading-normal sm:leading-normal font-bold max-w-xl">
            Download
          </h1>
          <div className="my-2"></div>
          <p>
            New to Last.fm? Find out more about the service and scrobbling here and sign up before proceeding.
          </p>
          <div className="my-4"></div>
          <p>
            You’ll require a API key from the Last.fm developer applications for this to work.
          </p>
          <div className="my-1"></div>
          <a href="https://www.last.fm/api/account/create" target="_blank" className="mt-6 mx-auto group lg:mx-0 w-fit flex items-center font-bold hover:opacity-60 transition duration-300">
            Create API key
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-3 ml-2 text-white group-hover:translate-x-1 transition duration-300"
              viewBox="0 0 24 25.243">
              <g id="Icon_feather-arrow-right" data-name="Icon feather-arrow-right" transform="translate(-6 -5.379)">
                <path id="Path_274" data-name="Path 274" d="M7.5,18h21" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
                <path id="Path_275" data-name="Path 275" d="M18,7.5,28.5,18,18,28.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
              </g>
            </svg>
          </a>
          <div className="my-4"></div>
          <div className="flex gap-8 flex-col md:flex-row">
            <a href="https://marketplace.elgato.com/product/stream-deck-lastfm-1c78b0c3-481a-4e1c-a0ee-a2a07b005576" target="_blank" className="bg-black text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full shadow-lg transition duration-300">
              Download from Elgato Marketplace
            </a>
            <a href="https://github.com/Verringer/streamdeck-lastfm/releases/latest" target="_blank" className="bg-black text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full shadow-lg transition duration-300">
              Download from GitHub Releases
            </a>
          </div>
        </div>
      </div>

      {/* Contribute */}
      <div className="flex justify-center py-24">
        <div className="text-center">
          <h1 class="text-3xl sm:text-5xl leading-normal sm:leading-normal font-bold max-w-xl">
            Contribute
          </h1>
          <div className="my-2"></div>
          <p className="max-w-sm leading-loose">Any contributions are welcome, for whatever reason. If you want to add a feature, fix a bug, or just want to play around with the code - have fun!</p>
          <div className="my-8"></div>
          <a href="https://github.com/verringer/streamdeck-lastfm" target="_blank" className="bg-black text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full shadow-lg transition duration-300">
            Go to GitHub Repository
          </a>
        </div>
      </div>

      <div className="my-24"></div>

      <div className="bg-black flex justify-center w-full py-8 px-2">
        Not affiliated with Last.fm or Elgato
      </div>
    </>
  )
}

export default App
