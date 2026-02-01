import CacheService from '../../src/services/CacheService';

const cache = CacheService.getInstance();

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const run = async () => {
  cache.clearAll();

  let fetchCount = 0;
  const fetchFn = async () => {
    fetchCount += 1;
    return { ok: true, ts: Date.now() };
  };

  const key = 'user.gettoptracks:{"period":"overall","user":"smoke"}';

  // Cache hit should avoid extra fetches and should not start background refresh without subscribers.
  await cache.get(key, fetchFn, 5000);
  await cache.get(key, fetchFn, 5000);
  assert(fetchCount === 1, `expected 1 fetch, got ${fetchCount}`);
  assert(cache.getStats().refreshing.length === 0, 'expected no background refresh without subscribers');

  // Register a subscriber; background refresh should start.
  const callback = () => {};
  cache.onUpdate(key, callback);
  await cache.get(key, fetchFn, 2000);
  assert(cache.getStats().refreshing.length === 1, 'expected background refresh after subscribing');

  // Unsubscribe; refresh loop should stop.
  cache.offUpdate(key, callback);
  await delay(10);
  assert(cache.getStats().refreshing.length === 0, 'expected background refresh to stop after unsubscribe');

  cache.clearAll();
  console.log('✅ cache smoke test passed');
};

run().catch((error) => {
  cache.clearAll();
  console.error('❌ cache smoke test failed:', error);
  process.exitCode = 1;
});
