import ImageService from '../../src/services/ImageService';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onloadend: null | (() => void) = null;
  onerror: null | (() => void) = null;

  readAsDataURL(blob: Blob) {
    blob.arrayBuffer()
      .then((buffer) => {
        const base64 = Buffer.from(buffer).toString('base64');
        this.result = `data:image/png;base64,${base64}`;
        if (this.onloadend) {
          this.onloadend();
        }
      })
      .catch(() => {
        if (this.onerror) {
          this.onerror();
        }
      });
  }
}

const run = async () => {
  const originalFetch = global.fetch;
  const originalFileReader = (global as any).FileReader;

  let fetchCount = 0;
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const pngBuffer = Buffer.from(pngBase64, 'base64');

  (global as any).FileReader = MockFileReader;
  global.fetch = (async () => {
    fetchCount += 1;
    return new Response(pngBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/png' }
    });
  }) as any;

  const imageService = ImageService.getInstance();
  imageService.clearCache();

  const url = 'https://example.com/test.png';
  const first = await imageService.getImageAsBase64(url);
  const second = await imageService.getImageAsBase64(url);

  assert(fetchCount === 1, `expected 1 fetch, got ${fetchCount}`);
  assert(first === second, 'expected cached image to match initial result');

  imageService.clearCache();
  global.fetch = originalFetch;
  (global as any).FileReader = originalFileReader;

  console.log('✅ image cache smoke test passed');
};

run().catch((error) => {
  console.error('❌ image cache smoke test failed:', error);
  process.exitCode = 1;
});
