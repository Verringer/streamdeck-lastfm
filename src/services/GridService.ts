interface GridPosition {
  row: number;
  col: number;
}

interface GridConfig {
  enabled: boolean;
  size: number;
  position: number;
}

class GridService {
  private static instance: GridService;

  private constructor() {}

  static getInstance(): GridService {
    if (!GridService.instance) {
      GridService.instance = new GridService();
    }
    return GridService.instance;
  }

  /**
   * Convert X,Y coordinates to grid position
   */
  static xyToPosition(x: number, y: number, gridSize: number): number {
    return (y - 1) * gridSize + (x - 1);
  }

  /**
   * Convert grid position to X,Y coordinates
   */
  static positionToXY(position: number, gridSize: number): { x: number; y: number } {
    return {
      x: (position % gridSize) + 1,
      y: Math.floor(position / gridSize) + 1
    };
  }

  /**
   * Get grid dimensions from config
   */
  static getDimensions(config: GridConfig): { rows: number; cols: number } {
    return { rows: config.size, cols: config.size };
  }

  /**
   * Check if position is the master (top-left)
   */
  static isMaster(position: number): boolean {
    return position === 0;
  }

  /**
   * Validate grid position
   */
  static isValidPosition(position: number, gridSize: number): boolean {
    return position >= 0 && position < (gridSize * gridSize);
  }

  /**
   * Get all positions in a grid
   */
  static getAllPositions(gridSize: number): number[] {
    return Array.from({ length: gridSize * gridSize }, (_, i) => i);
  }

  /**
   * Generate cache key for grid images
   */
  static getCacheKey(url: string, gridSize: number, position: number): string {
    return `grid-${gridSize}x${gridSize}-pos-${position}-${url}`;
  }

  /**
   * Get grid size string for display
   */
  static getGridSizeString(size: number): string {
    return `${size}×${size}`;
  }

  /**
   * Get helper text for grid configuration
   */
  static getHelperText(size: number): string {
    return `Enter Column X Row Y coordinates (e.g., 1 1 = top-left, 2 3 = column 2, row 3). Grid size ${size} creates a ${size}×${size} grid (${size} columns and ${size} rows).`;
  }

  /**
   * Get explanation text for grid feature
   */
  static getExplanationText(): string {
    return 'Grid display combines multiple buttons to show larger album art. The grid size determines both the number of columns and rows (e.g., size 3 = 3 columns × 3 rows).';
  }
}

export default GridService;
