let createCanvas: any, loadImage: any;

try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
} catch (error) {
  console.warn('Canvas not available, image cropping will be disabled');
  createCanvas = null;
  loadImage = null;
}

import GridService from './GridService';

interface ImageCacheEntry {
  dataUrl: string;
  timestamp: number;
}

class ImageService {
  private static instance: ImageService;
  private cache: Map<string, ImageCacheEntry> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 200; // Increased cache size
  private static sharedImageData: Map<string, string> = new Map(); // Shared original image data

  private constructor() {}

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  private async getOriginalImageData(url: string): Promise<string> {
    // Check shared cache first
    if (ImageService.sharedImageData.has(url)) {
      return ImageService.sharedImageData.get(url)!;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await this.blobToDataUrl(blob);
    
    // Store in shared cache
    ImageService.sharedImageData.set(url, dataUrl);
    
    // Limit shared cache size
    if (ImageService.sharedImageData.size > 50) {
      const firstKey = ImageService.sharedImageData.keys().next().value;
      if (firstKey) ImageService.sharedImageData.delete(firstKey);
    }
    
    return dataUrl;
  }

  private async fetchImageAsBlob(url: string): Promise<Blob> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'StreamDeck-LastFM/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async getImageAsBase64(url: string, gridSize?: string, gridPosition?: number): Promise<string> {
    // Use highly specific cache key to avoid cross-contamination between different grid configurations
    const cacheKey = gridSize && gridPosition !== undefined 
      ? `grid-${gridSize}-pos-${gridPosition}-${url}` 
      : `${url}-single`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.dataUrl;
    }

    try {
      // Get original image data (from shared cache if available)
      const originalDataUrl = await this.getOriginalImageData(url);
      let processedDataUrl = originalDataUrl;

      // Process for grid if specified
      if (gridSize && gridPosition !== undefined) {
        processedDataUrl = await this.processForGrid(originalDataUrl, gridSize, gridPosition);
      } else {
        processedDataUrl = await this.cropToSquare(originalDataUrl);
      }

      // Cache the result with specific key
      this.cache.set(cacheKey, {
        dataUrl: processedDataUrl,
        timestamp: Date.now()
      });

      return processedDataUrl;
    } catch (error) {
      // Don't log 404 errors as loudly - they're common for missing album art
      if (error instanceof Error && error.message.includes('404')) {
      console.warn('🖼️ Image not found (404):', url);
      } else {
        console.error('Failed to fetch image:', url, error);
      }
      return '';
    }
  }

  private async processForGrid(dataUrl: string, gridSize: string, position: number): Promise<string> {
    if (!createCanvas || !loadImage) {
      console.warn('Canvas not available, returning original image');
      return dataUrl;
    }

    try {
      const image = await loadImage(dataUrl);
      
      // Parse grid size (e.g., "2x2" -> 2, "3x3" -> 3)
      const size = parseInt(gridSize.split('x')[0]) || parseInt(gridSize) || 3;
      
      // Use GridService for calculations
      const { x, y } = GridService.positionToXY(position, size);
      const row0 = y - 1; // Convert back to 0-based
      const col0 = x - 1; // Convert back to 0-based
      
      // Each StreamDeck button is 144x144, but we want to show a portion of the full image
      const cellSize = 144;
      
      // Create canvas for this grid cell
      const canvas = createCanvas(cellSize, cellSize);
      const ctx = canvas.getContext('2d');
      
      // Calculate the source rectangle from the original image
      // We want to show the portion of the image that corresponds to this grid position
      const sourceWidth = image.width / size;
      const sourceHeight = image.height / size;
      const sourceX = col0 * sourceWidth;
      const sourceY = row0 * sourceHeight;
      
      // Draw the corresponding portion of the image to fill the 144x144 cell
      ctx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
        0, 0, cellSize, cellSize                     // Destination (full button)
      );

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to process grid image:', error);
      return dataUrl;
    }
  }

  private getGridDimensions(gridSize: string): { rows: number; cols: number } {
    switch (gridSize) {
      case '2x2': return { rows: 2, cols: 2 };
      case '3x3': return { rows: 3, cols: 3 };
      case '4x4': return { rows: 4, cols: 4 };
      default: return { rows: 1, cols: 1 };
    }
  }

  private getGridPosition(position: number, gridSize: string): { row: number; col: number } {
    const { cols } = this.getGridDimensions(gridSize);
    return {
      row: Math.floor(position / cols),
      col: position % cols
    };
  }

  private async cropToSquare(dataUrl: string): Promise<string> {
    if (!createCanvas || !loadImage) {
      console.warn('Canvas not available, returning original image');
      return dataUrl;
    }

    try {
      const image = await loadImage(dataUrl);
      const canvas = createCanvas(144, 144);
      const ctx = canvas.getContext('2d');

      const scaleFactor = Math.max(canvas.width / image.width, canvas.height / image.height);
      const x = (canvas.width - image.width * scaleFactor) / 2;
      const y = (canvas.height - image.height * scaleFactor) / 2;

      ctx.drawImage(image, x, y, image.width * scaleFactor, image.height * scaleFactor);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to crop image:', error);
      return dataUrl;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size
    };
  }
}

export default ImageService;
