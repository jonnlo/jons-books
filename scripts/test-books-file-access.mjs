import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const app = readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8');
const code = app.slice(app.indexOf('    async function checkBooksJsonNewer('), app.indexOf('    // Reads books.json content wherever we are'));

function setup({ permission = 'granted', requested = 'granted', error, saved = true, protocol = 'file:', viewOnly = false, cancel = false } = {}) {
  const calls = { picks: 0, requests: 0, reads: 0, saves: 0, fetches: 0, comparisons: [] };
  const replacement = { async getFile() { return { lastModified: 200 }; } };
  const handle = {
    async queryPermission(options) { assert.equal(options.mode, 'read'); return permission; },
    async requestPermission(options) { assert.equal(options.mode, 'read'); calls.requests++; return requested; },
    async getFile() {
      calls.reads++;
      if (error) throw Object.assign(new Error(error), { name: error });
      return { lastModified: 100 };
    }
  };
  const context = vm.createContext({
    viewOnly,
    lastBooksCheckCompared: true,
    window: {
      location: { protocol },
      async showOpenFilePicker() {
        calls.picks++;
        if (cancel) throw Object.assign(new Error('cancelled'), { name: 'AbortError' });
        return [replacement];
      }
    },
    async loadBooksFileHandle() { return saved ? handle : null; },
    async saveBooksFileHandle(value) {
      // Ensure first-use and replacement checks await persistence.
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.equal(value, replacement);
      calls.saves++;
      replacement.queryPermission = async () => 'granted';
    },
    evaluateNewerThanAnchor(time, source) {
      if (calls.picks) assert.equal(calls.saves, 1);
      calls.comparisons.push([time, source]);
      context.lastBooksCheckCompared = true;
      return true;
    },
    async fetch(url, options) {
      calls.fetches++;
      assert.equal(url, 'books.json');
      assert.equal(options.method, 'HEAD');
      return { headers: { get: () => 'Mon, 23 Nov 2026 08:00:00 GMT' } };
    },
    console: { warn() {} }
  });
  vm.runInContext(code, context);
  return { context, calls, check: options => context.checkBooksJsonNewer(options) };
}

test('repeated checks reuse the saved file without opening a picker', async () => {
  const { check, calls } = setup();
  assert.equal(await check({ interactive: true }), true);
  assert.equal(await check({ interactive: true }), true);
  assert.equal(calls.picks, 0);
  assert.equal(calls.requests, 0);
  assert.equal(calls.reads, 2);
});

test('interactive checks renew read permission on the saved file', async () => {
  const { check, calls } = setup({ permission: 'prompt' });
  assert.equal(await check({ interactive: true }), true);
  assert.equal(calls.requests, 1);
  assert.equal(calls.picks, 0);
  assert.deepEqual(calls.comparisons, [[100, 'handle']]);
});

test('background checks never request permission or open a picker', async () => {
  for (const options of [{ permission: 'prompt' }, { permission: 'denied' }, { saved: false }]) {
    const { check, calls, context } = setup(options);
    assert.equal(await check(), false);
    assert.equal(calls.requests, 0);
    assert.equal(calls.picks, 0);
    assert.equal(calls.reads, 0);
    assert.equal(context.lastBooksCheckCompared, false);
  }
});

test('denied access and permission errors never trigger a replacement picker', async () => {
  for (const options of [{ permission: 'prompt', requested: 'denied' }, { error: 'NotAllowedError' }, { error: 'SecurityError' }]) {
    const { check, calls } = setup(options);
    assert.equal(await check({ interactive: true }), false);
    assert.equal(calls.picks, 0);
    assert.deepEqual(calls.comparisons, []);
  }
});

test('a missing saved file can be replaced and persisted', async () => {
  const { check, calls } = setup({ error: 'NotFoundError' });
  assert.equal(await check({ interactive: true }), true);
  assert.equal(calls.picks, 1);
  assert.equal(calls.saves, 1);
  assert.deepEqual(calls.comparisons, [[200, 'handle']]);
});

test('first-use selection is persisted before checking the file', async () => {
  const { check, calls } = setup({ saved: false });
  assert.equal(await check({ interactive: true }), true);
  assert.equal(calls.picks, 1);
  assert.equal(calls.saves, 1);
  assert.deepEqual(calls.comparisons, [[200, 'handle']]);
});

test('cancelling first-use or replacement selection leaves the check incomplete', async () => {
  for (const options of [{ saved: false, cancel: true }, { error: 'NotFoundError', cancel: true }]) {
    const { check, calls, context } = setup(options);
    assert.equal(await check({ interactive: true }), false);
    assert.equal(calls.saves, 0);
    assert.equal(context.lastBooksCheckCompared, false);
  }
});

test('HTTP checks use the served catalog without a local picker', async () => {
  const { check, calls } = setup({ protocol: 'http:' });
  assert.equal(await check({ interactive: true }), true);
  assert.equal(calls.fetches, 1);
  assert.equal(calls.picks, 0);
  assert.equal(calls.reads, 0);
  assert.deepEqual(calls.comparisons, [[Date.parse('2026-11-23T08:00:00Z'), 'http']]);
});

test('view mode never accesses the file', async () => {
  const { check, calls } = setup({ viewOnly: true });
  assert.equal(await check({ interactive: true }), false);
  assert.equal(calls.reads + calls.requests + calls.picks + calls.fetches, 0);
});
