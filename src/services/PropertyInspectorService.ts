import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import GridService from './GridService';
import { PropertyInspector } from '@rweich/streamdeck-ts';

export interface PiConfig {
  titleDisplay?: string;
  includeDisplayPeriod?: boolean;
  titleDisplayOptions?: Array<{ label: string; value: string }>;
  pollingFrequencyUnit?: 'seconds' | 'minutes';
  pollingFrequencyDefault?: number;
  pollingFrequencyOptions?: Array<{ label: string; value: string }>;
  includeGridOptions?: boolean;
  includeRefreshModal?: boolean;
}

const DEFAULT_CONFIG: PiConfig = {
  titleDisplay: 'total-scrobbles',
  includeDisplayPeriod: false,
  pollingFrequencyUnit: 'minutes',
  pollingFrequencyDefault: 30,
  includeRefreshModal: false
};

const TITLE_DISPLAY_OPTIONS = {
  nowPlaying: [
    { label: 'Show only artist', value: 'artist' },
    { label: 'Show only song', value: 'song' },
    { label: 'Show only album title', value: 'album' },
    { label: 'Full artist - song', value: 'artist-song' },
    { label: 'All your profile total scrobbles', value: 'total-scrobbles' }
  ],
  topTrack: [
    { label: 'Show only artist', value: 'artist' },
    { label: 'Show only song', value: 'song' },
    { label: 'Show only album title', value: 'album' },
    { label: 'Full artist - song', value: 'artist-song' },
    { label: 'Your scrobbles', value: 'total-scrobbles' }
  ],
  topArtist: [
    { label: 'Show artist', value: 'artist' },
    { label: 'Your scrobbles', value: 'total-scrobbles' }
  ],
  topAlbum: [
    { label: 'Show only album', value: 'album' },
    { label: 'Show only artist', value: 'artist' },
    { label: 'Your scrobbles', value: 'total-scrobbles' }
  ]
};

const DISPLAY_PERIOD_OPTIONS = [
  { label: 'Overall', value: 'overall' },
  { label: '7 day', value: '7day' },
  { label: '1 month', value: '1month' },
  { label: '3 month', value: '3month' },
  { label: '6 month', value: '6month' },
  { label: '12 month', value: '12month' }
];

const POLLING_FREQUENCY_OPTIONS = {
  seconds: [
    { label: '5 seconds', value: '5' },
    { label: '10 seconds', value: '10' },
    { label: '15 seconds', value: '15' },
    { label: '30 seconds', value: '30' },
    { label: '1 minute', value: '60' }
  ],
  minutes: [
    { label: '5 minutes', value: '300' },
    { label: '10 minutes', value: '600' },
    { label: '15 minutes', value: '900' },
    { label: '30 minutes', value: '1800' },
    { label: '60 minutes', value: '3600' }
  ]
};

class PropertyInspectorService {
  private static instance: PropertyInspectorService;
  private settingsMap: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): PropertyInspectorService {
    if (!PropertyInspectorService.instance) {
      PropertyInspectorService.instance = new PropertyInspectorService();
    }
    return PropertyInspectorService.instance;
  }

  private createApiKeyExplanation(): HTMLDivElement {
    const explanationEl = document.createElement('div');
    explanationEl.style.marginBottom = '10px';
    explanationEl.style.marginLeft = '110px';
    explanationEl.textContent = 'You can get your API key from ';
    
    const link = document.createElement('a');
    link.href = 'https://www.last.fm/api/account/create';
    link.textContent = 'here';
    link.target = '_blank';
    
    explanationEl.appendChild(link);
    return explanationEl;
  }

  private createPollingExplanation(unit: 'seconds' | 'minutes'): HTMLDivElement {
    const explanationEl = document.createElement('div');
    explanationEl.style.marginBottom = '10px';
    explanationEl.style.marginLeft = '110px';
    explanationEl.textContent = `How often to check for new updates (in ${unit}).`;
    return explanationEl;
  }

  createPropertyInspector(
    pi: PropertyInspector,
    pluginContext: string,
    settings: unknown,
    config: PiConfig = {}
  ): FormBuilder<any> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Get or create context settings
    let contextSettings = this.settingsMap.get(pluginContext);
    if (!contextSettings) {
      contextSettings = settings ?? {
        titleDisplay: finalConfig.titleDisplay,
        lastfmApiKey: 'abc123',
        lastfmUsername: 'Verringer',
        pollingFrequency: finalConfig.pollingFrequencyDefault?.toString()
      };
      this.settingsMap.set(pluginContext, contextSettings);
    }

    const builder = new FormBuilder(contextSettings);

    // Add display period dropdown if needed
    if (finalConfig.includeDisplayPeriod) {
      const periodDropdown = builder.createDropdown();
      DISPLAY_PERIOD_OPTIONS.forEach(option => {
        periodDropdown.addOption(option.label, option.value);
      });
      periodDropdown.setLabel('Period');
      builder.addElement('displayPeriod', periodDropdown);
    }

    // Add title display dropdown
    const titleOptions = finalConfig.titleDisplayOptions || 
      TITLE_DISPLAY_OPTIONS.nowPlaying;
    
    const titleDropdown = builder.createDropdown();
    titleOptions.forEach(option => {
      titleDropdown.addOption(option.label, option.value);
    });
    titleDropdown.setLabel('Label');
    builder.addElement('titleDisplay', titleDropdown);

    // Add grid options if enabled
    if (finalConfig.includeGridOptions) {
      // Grid enable toggle - using a dropdown with yes/no for now since checkbox might not be supported
      builder.addElement('gridEnabled', 
        builder.createDropdown()
          .addOption('Disabled', 'false')
          .addOption('Enabled', 'true')
          .setLabel('Grid Mode')
      );

      // Grid size input (square grid for square album art)
      builder.addElement('gridSize', 
        builder.createInput()
          .setLabel('Grid Size')
          .showOn(() => {
            const formData = builder.getFormData();
            return formData.gridEnabled === 'true' || formData.gridEnabled === true;
          })
      );

      // Grid position inputs (separate X and Y)
      const gridSize = builder.getFormData().gridSize || '3';
      const size = parseInt(gridSize);
      
      // Grid Position X (Column)
      builder.addElement('gridPositionX', 
        builder.createInput()
          .setLabel('Grid Position X (Column)')
          .showOn(() => {
            const formData = builder.getFormData();
            return formData.gridEnabled === 'true' || formData.gridEnabled === true;
          })
      );

      // Grid Position Y (Row)
      builder.addElement('gridPositionY', 
        builder.createInput()
          .setLabel('Grid Position Y (Row)')
          .showOn(() => {
            const formData = builder.getFormData();
            return formData.gridEnabled === 'true' || formData.gridEnabled === true;
          })
      );

      // Add helper text
      const helperTextEl = document.createElement('div');
      helperTextEl.style.marginBottom = '10px';
      helperTextEl.style.marginLeft = '110px';
      helperTextEl.style.fontSize = '12px';
      helperTextEl.style.color = '#666';
      helperTextEl.textContent = GridService.getHelperText(size);
      helperTextEl.style.display = 'none';
      builder.addHtmlElement(helperTextEl);
      
      // Show helper text when grid is enabled
      builder.on('change-settings', () => {
        const formData = builder.getFormData();
        helperTextEl.style.display = (formData.gridEnabled === 'true' || formData.gridEnabled === true) ? 'block' : 'none';
      });

      // Add explanation for grid
      const gridExplanationEl = document.createElement('div');
      gridExplanationEl.style.marginBottom = '10px';
      gridExplanationEl.style.marginLeft = '110px';
      gridExplanationEl.textContent = GridService.getExplanationText();
      builder.addHtmlElement(gridExplanationEl);
    }

    // Add API key input
    builder.addElement('lastfmApiKey', 
      builder.createInput().setLabel('API Key').setPlaceholder('abc')
    );
    builder.addHtmlElement(this.createApiKeyExplanation());

    // Add username input
    builder.addElement('lastfmUsername', 
      builder.createInput().setLabel('Username').setPlaceholder('Verringer')
    );

    // Add polling frequency dropdown
    const pollingOptions = finalConfig.pollingFrequencyOptions || 
      POLLING_FREQUENCY_OPTIONS[finalConfig.pollingFrequencyUnit || 'minutes'];
    
    const pollingDropdown = builder.createDropdown();
    pollingOptions.forEach(option => {
      pollingDropdown.addOption(option.label, option.value);
    });
    pollingDropdown.setLabel('Refresh Interval');
    builder.addElement('pollingFrequency', pollingDropdown);
    builder.addHtmlElement(this.createPollingExplanation(finalConfig.pollingFrequencyUnit!));

    // Append to DOM
    builder.appendTo(document.querySelector('.sdpi-wrapper') ?? document.body);

    // Handle settings changes
    builder.on('change-settings', () => {
      const newSettings = builder.getFormData();
      this.settingsMap.set(pluginContext, newSettings);
      pi.setSettings(pluginContext, newSettings);
    });

    return builder;
  }

  clearSettings(context?: string): void {
    if (context) {
      this.settingsMap.delete(context);
    } else {
      this.settingsMap.clear();
    }
  }

  getSettings(context: string): any {
    return this.settingsMap.get(context);
  }

  private getGridPositionOptions(gridSize?: string): Array<{ label: string; value: string }> {
    // Return empty array since we're using separate X/Y inputs
    return [];
  }

  private getGridVisual(gridSize?: string): string {
    // Return empty string since we're using separate X/Y inputs
    return '';
  }

  private getGridDimensions(gridSize: string): { rows: number; cols: number } {
    switch (gridSize) {
      case '2x2': return { rows: 2, cols: 2 };
      case '3x3': return { rows: 3, cols: 3 };
      case '4x4': return { rows: 4, cols: 4 };
      default: return { rows: 1, cols: 1 };
    }
  }
}

export default PropertyInspectorService;
export { TITLE_DISPLAY_OPTIONS, DISPLAY_PERIOD_OPTIONS };
