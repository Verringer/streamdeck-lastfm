import { BaseAction, ActionSettings } from '../BaseAction';

export class LaunchPageAction extends BaseAction {
	
	async didReceiveSettings({ context, settings }: { context: string; settings: unknown; }) {
		this.updateContextSettings(context, settings as ActionSettings);
	};

	async willAppear(context: string, action: string) {
		// No initialization needed for launch page action
	}

	async keyUp(context: string, action: string) {
		const data = this.contextData.get(context);
		if (!data) {
			this.plugin.showAlert(context);
			return;
		}

		const { targetPage, lastFmUsername } = data;
		const username: string = lastFmUsername || '';
		const page: string = targetPage || 'homepage';

		// Validate requirements for certain pages
		if (targetPage !== 'homepage' && (!lastFmUsername || lastFmUsername.trim() === '')) {
			this.plugin.showAlert(context);
			return;
		}

		const url = this.buildUrl(page, username);
		if (url) {
			this.plugin.openUrl(url);
		} else {
			this.plugin.showAlert(context);
			console.log('🟥 Invalid targetPage:', targetPage);
		}
	}

	async keyDown(context: string, action: string) {
		// No action needed
	}

	private buildUrl(targetPage: string, username: string): string {
		const baseUrl = 'https://www.last.fm';
		
		switch (targetPage) {
			case 'homepage':
				return baseUrl;
			case 'profile':
				return username ? `${baseUrl}/user/${username}` : '';
			case 'library':
				return username ? `${baseUrl}/user/${username}/library` : '';
			case 'lastWeek':
				return username ? `${baseUrl}/user/${username}/listening-report/week` : '';
			case 'lastMonth':
				return username ? `${baseUrl}/user/${username}/listening-report/month` : '';
			case 'lastYear':
				return username ? `${baseUrl}/user/${username}/listening-report/year` : '';
			default:
				return '';
		}
	}
}
