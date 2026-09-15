const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const compiled = ts.transpileModule(fs.readFileSync('app/components/PlantationSequence.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;

function harness({ enabled = true, mobile = false, fail = -1 } = {}) {
  const chapters = [], requests = [], draws = [], raf = new Map(), listeners = new Map();
  let cleanup, resize, visibility, id = 0, position = 0, frameTime = 0;
  const context = { globalAlpha: 1, drawImage(image, ...bounds) { draws.push({ src: image.src, alpha: this.globalAlpha, bounds }); } };
  const canvas = { clientWidth: 1440, clientHeight: 900, width: 0, height: 0, style: {}, getContext: () => context };
  const track = { current: { offsetHeight: 2340, getBoundingClientRect: () => ({ top: -position }) } };
  const progress = { current: { style: {} } }, chapter = { current: { textContent: '' } };
  class MockImage {
    naturalWidth = mobile ? 1280 : 3840;
    naturalHeight = mobile ? 720 : 2160;
    decode() { return Promise.resolve(); }
    set src(value) {
      this.value = value;
      if (!value) return;
      requests.push(value);
      queueMicrotask(() => {
        if (Number(value.match(/\/(\d+)/)[1]) === fail) this.onerror?.();
        else this.onload?.();
      });
    }
    get src() { return this.value; }
  }
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name.endsWith('manifest.json')) return JSON.parse(fs.readFileSync('public/hero-sequence-v6/manifest.json', 'utf8'));
      if (name === 'react') return { useRef: () => ({ current: canvas }), useEffect: effect => { cleanup = effect(); } };
      if (name === 'react/jsx-runtime') return { jsx: () => null };
      throw new Error(`Unexpected import: ${name}`);
    },
    Image: MockImage,
    IntersectionObserver: class { constructor(callback) { visibility = callback; } observe() {} disconnect() {} },
    ResizeObserver: class { constructor(callback) { resize = callback; } observe() {} disconnect() {} },
    requestAnimationFrame(callback) { raf.set(++id, callback); return id; },
    cancelAnimationFrame(key) { raf.delete(key); },
    window: { devicePixelRatio: 3, matchMedia: () => ({ matches: mobile }), addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
  });
  exports.default({ enabled, track, progress, chapter, className: 'canvas', onChapterChange: index => chapters.push(index) });
  async function flush() {
    for (let cycle = 0; cycle < 80; cycle++) {
      const callbacks = [...raf.values()]; raf.clear(); frameTime += 16.67; callbacks.forEach(callback => callback(frameTime));
      await new Promise(resolve => setImmediate(resolve));
      if (!raf.size) break;
    }
  }
  return { chapters, requests, draws, raf, listeners, canvas, progress, chapter, flush,
    scroll(amount) { position = amount * 1440; listeners.get('scroll')?.(); },
    resize() { resize(); }, offscreen() { visibility([{ isIntersecting: false }]); }, cleanup() { cleanup?.(); },
  };
}

async function main() {
  const normal = harness();
  await normal.flush();
  assert.equal(normal.requests.length, 3, 'Load only nearby 4K frames initially.');
  assert.equal(normal.draws.at(-1).src, '/hero-sequence-v6/01.webp?v=6');
  assert.ok(normal.canvas.width > 1600 && normal.canvas.width <= 3840);
  assert.ok(normal.canvas.width * normal.canvas.height <= 8294400);
  normal.scroll(8 / 15);
  const firstTick = [...normal.raf.values()]; normal.raf.clear();
  firstTick.forEach(callback => callback(0));
  assert.notEqual(normal.progress.current.style.transform, 'scaleX(0.5333333333333333)', 'Wheel jumps should ease toward the requested frame.');
  normal.scroll(8 / 15); await normal.flush();
  assert.equal(normal.draws.at(-1).src, '/hero-sequence-v6/09.webp?v=6');
  assert.equal(normal.draws.at(-1).alpha, 1);
  assert.equal(normal.progress.current.style.transform, 'scaleX(0.5333333333333333)');
  assert.match(normal.chapter.current.textContent, /NURTURING/);
  assert.equal(normal.chapters.at(-1), 1);
  normal.scroll(14.5 / 15); await normal.flush();
  assert.equal(normal.draws.at(-1).src, '/hero-sequence-v6/16.webp?v=6');
  assert.ok(normal.draws.every(draw => draw.alpha === 1), 'Frames must remain opaque to avoid crossfade ghosting.');
  assert.equal(normal.chapters.at(-1), 2);
  normal.scroll(2 / 15); await normal.flush();
  assert.equal(normal.draws.at(-1).src, '/hero-sequence-v6/03.webp?v=6');
  assert.equal(normal.chapters.at(-1), 0, 'Headlines must reverse with the frames.');
  assert.ok(normal.requests.filter(url => url.includes('/03.webp')).length >= 2, 'Evicted frames must reload on reverse scroll.');
  assert.ok(normal.chapters.every((value, index) => index === 0 || value !== normal.chapters[index - 1]), 'Notify only when the chapter changes.');
  for (let n = 0; n < 20; n++) normal.scroll(.9);
  assert.equal(normal.raf.size, 1, 'Scroll events must coalesce into one animation frame.');
  await normal.flush();
  assert.equal(normal.raf.size, 0, 'Animation should stop after settling.');
  normal.canvas.clientWidth = 390; normal.canvas.clientHeight = 844;
  normal.resize(); await normal.flush();
  assert.ok(normal.draws.at(-1).bounds.every(Number.isFinite));
  const count = normal.draws.length;
  normal.offscreen(); normal.scroll(.6); await normal.flush();
  assert.equal(normal.draws.length, count, 'Offscreen canvas should not draw.');
  normal.cleanup();
  assert.equal(normal.listeners.size, 0);
  assert.equal(normal.raf.size, 0);
  assert.equal(normal.canvas.style.opacity, '0');

  const compact = harness({ mobile: true, fail: 4 }); await compact.flush();
  assert.ok(compact.requests.every(url => url.endsWith('-mobile.webp?v=6')));
  compact.scroll(3 / 15); await compact.flush();
  assert.equal(compact.canvas.style.opacity, '1', 'A failed image must retain a usable nearby frame.');
  compact.cleanup();

  const staticMode = harness({ enabled: false }); await staticMode.flush();
  assert.equal(staticMode.requests.length, 0);
  assert.equal(staticMode.listeners.size, 0);
  console.log('PASS: forward/reverse scrubbing, opaque frame rendering, scroll batching, resize, mobile assets, failed-frame fallback, offscreen pause, cleanup and static mode.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
