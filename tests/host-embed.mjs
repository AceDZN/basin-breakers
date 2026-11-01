// The workbook bridge in a real embed: a localhost parent page with the game in an iframe at ?level=3.
// Checks `ready`, `level-start` for the deep-linked map and `level-complete` after a win played with the
// pointer (one excavation stroke, then the flood test in real time), and that a standalone page posts nothing.
// Needs the production preview on :4302 (npm run build && npm run preview).  Usage: node tests/host-embed.mjs
import { chromium } from 'playwright';
import { createServer } from 'node:http';

const GAME = process.env.BASE ?? 'http://localhost:4302/';
const LEVEL = 3;
// Map 3's QA witness (tests/freeform-campaign-witnesses.ts): one trench around the eastern flank, no levees.
const TRENCH = [[20, 7], [24, 10], [24, 13], [24, 18], [24, 20]];

const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
const parent = createServer((_, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(`<body style="margin:0"><script>window.msgs=[];addEventListener('message',e=>msgs.push({origin:e.origin,...e.data}))</script><iframe id="g" src="${GAME}?level=${LEVEL}" style="width:100vw;height:100vh;border:0;display:block"></iframe></body>`);
}).listen(4999);
await page.goto('http://localhost:4999/');
const frame = await (await page.waitForSelector('#g')).contentFrame();
await frame.waitForFunction(() => window.render_game_to_text && window.basinFreeform);
await page.waitForFunction(() => window.msgs.some((m) => m.type === 'ready'), null, { timeout: 15000 });
const state = () => frame.evaluate(() => JSON.parse(window.render_game_to_text()));
const opened = await state();

// The iframe fills the parent page at (0,0), so its client coordinates are page coordinates.
await frame.click('#dig');
for (let k = 0; k < TRENCH.length; k++) {
  const q = await frame.evaluate((p) => window.basinFreeform.screen(p), TRENCH[k]);
  await page.mouse.move(q.x, q.y, { steps: k ? 8 : 1 });
  if (!k) await page.mouse.down();
}
await page.mouse.up();
const built = await state();
await frame.click('#test');
await frame.waitForFunction(() => ['won', 'failed'].includes(JSON.parse(window.render_game_to_text()).mode), null, { timeout: 30000 });
const result = await state();
const msgs = await page.evaluate(() => window.msgs);
console.log('opened on map', opened.level, '| excavated cells', built.excavatedCells, '| result', result.mode);
console.log(msgs.map((m) => `${m.type}${m.level ? ' L' + m.level : ''}${m.stars ? ' ★' + m.stars : ''}${m.durationMs ? ' ' + m.durationMs + 'ms' : ''}`).join(', '));
const types = msgs.map((m) => m.type);
const ok =
  opened.level === LEVEL && result.mode === 'won' &&
  msgs.every((m) => m.source === 'workbook-game' && m.slug === 'basin-breakers' && m.version === 1 && m.origin === new URL(GAME).origin) &&
  types[0] === 'ready' && types[1] === 'level-start' && msgs[1].level === LEVEL &&
  types.filter((t) => t === 'level-complete').length === 1 &&
  msgs.some((m) => m.type === 'level-complete' && m.level === LEVEL && m.stars >= 1 && m.durationMs > 0) &&
  !types.includes('error');

// standalone: no parent, nothing posted (no errors either)
const solo = await (await browser.newContext()).newPage();
await solo.addInitScript(() => {
  window.__posted = 0;
  const post = window.postMessage.bind(window);
  window.postMessage = (...a) => { window.__posted++; return post(...a); };
});
solo.on('pageerror', (e) => errs.push(String(e)));
await solo.goto(GAME + '?level=2');
await solo.waitForFunction(() => window.render_game_to_text);
await solo.waitForTimeout(5000);
const soloLevel = JSON.parse(await solo.evaluate(() => window.render_game_to_text())).level;
const soloPosted = await solo.evaluate(() => window.__posted);
console.log('standalone map', soloLevel, '| posted', soloPosted);
const pass = ok && soloLevel === 2 && soloPosted === 0 && !errs.length;
console.log(pass ? 'bridge OK' : 'bridge FAILED', errs);
await browser.close();
parent.close();
process.exit(pass ? 0 : 1);
