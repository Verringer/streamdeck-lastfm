import { BaseAction } from '../BaseAction';

let targetPage = 'homepage';
let lastFmUsername = 'Verringer';
let ready = false;

export class LaunchPageAction extends BaseAction {
    async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }) {
        console.log('🟩 Settings received:', settings);

        // Set settings
        targetPage = (settings as { targetPage: string })['targetPage'];
        lastFmUsername = (settings as { lastfmUsername: string })['lastfmUsername'];

        // Set ready
        ready = true;
    };

    async willAppear(context: string, action: string) {

        // this.plugin.setTitle('Loading...', context);

    }

    async keyUp(context: string, action: string) {
        // Make sure we have a username
        if(targetPage !== 'homepage') {
            if (lastFmUsername === '') {
                this.plugin.showAlert(context);
                return;
            }
        }
        switch (targetPage) {
            case 'homepage':
                this.plugin.openUrl(`https://www.last.fm`);
                break;
            case 'profile':
                this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}`);
                break;
            case 'library':
                this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/library`);
                break;
            // lastWeek, lastMonth, lastYear
            case 'lastWeek':
                this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/listening-report/week`);
                break;
            case 'lastMonth':
                this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/listening-report/month`);
                break;
            case 'lastYear':
                this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/listening-report/year`);
                break;
            // case 'recentTracks':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/library`);
            //     break;
            // case 'topArtists':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/library/artists`);
            //     break;
            // case 'topAlbums':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/library/albums`);
            //     break;
            // case 'topTracks':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/library/tracks`);
            //     break;
            // case 'topTags':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/tags`);
            //     break;
            // case 'topArtistsByTag':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/tags`);
            //     break;
            // case 'topAlbumsByTag':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/tags`);
            //     break;
            // case 'topTracksByTag':
            //     this.plugin.openUrl(`https://www.last.fm/user/${lastFmUsername}/tags`);
            //     break;
            default:
                // Should never happen so show an alert
                this.plugin.showAlert(context);
                console.log('🟥 Invalid targetPage:', targetPage)
                break;
        }
    }

    async keyDown(context: string, action: string) {
    }
}