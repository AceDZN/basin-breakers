import {chromium,type Page} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import type {Point} from '../src/levels';

const out='docs/rebuild/freeform-captures';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const checks:string[]=[];
async function state(p=page){return p.evaluate(()=>JSON.parse((window as any).render_game_to_text()));}
async function screen(p:Page,at:Point){return p.evaluate(at=>(window as any).basinFreeform.screen(at),at);}
async function draw(points:Point[],p=page){for(let k=0;k<points.length;k++){const q=await screen(p,points[k]);await p.mouse.move(q.x,q.y,{steps:k?4:1});if(!k)await p.mouse.down();}await p.mouse.up();}
async function clickAt(p:Page,at:Point){const q=await screen(p,at);await p.mouse.click(q.x,q.y);}
async function shot(name:string,p=page){await p.screenshot({path:`${out}/${name}.png`});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await state(p),null,2));}
await page.goto('http://localhost:5302/freeform.html');await page.waitForFunction(()=>typeof(window as any).render_game_to_text==='function');await page.waitForTimeout(800);await shot('01-opening');
assert.equal((await state()).excavatedCells,0);assert.equal(await page.locator('[data-sand],.sand-cue').count(),0);checks.push('Untouched open map has no marked answer sites.');
await draw([[5,12],[7,12],[7,13]]);const first=await state();assert.ok(first.excavatedCells>5);assert.ok(first.earthLeft<first.earthBudget);await shot('02-arbitrary-dig');
await draw([[5,12],[7,12],[7,13]]);assert.equal((await state()).earthLeft,first.earthLeft);checks.push('Arbitrary broad soil edit follows real stroke; repeated overlap spends nothing.');
await page.click('#undo');assert.equal((await state()).excavatedCells,0);checks.push('Undo restores excavation and budget.');
await clickAt(page,[14,3]);assert.equal((await state()).excavatedCells,0);checks.push('Protected source click costs nothing.');
await page.click('#wall');await clickAt(page,[6,10]);let s=await state();assert.equal(s.walls.length,1);assert.equal(s.wallStock,2);const firstWall=s.walls[0];
await page.click('#dig');await clickAt(page,[firstWall.x,firstWall.z]);assert.equal((await state()).movingWall,firstWall.id);await page.click('#rotate');await clickAt(page,[8,11]);s=await state();assert.equal(s.walls.length,1);assert.equal(s.walls[0].id,firstWall.id);assert.ok(Math.abs(s.walls[0].angle-firstWall.angle)>.1);assert.equal(s.wallStock,2);checks.push('Existing levee moves and rotates without duplicating stock.');
await page.click('#dig');await clickAt(page,[s.walls[0].x,s.walls[0].z]);await page.click('#remove');assert.equal((await state()).walls.length,0);assert.equal((await state()).wallStock,3);await page.click('#undo');assert.equal((await state()).walls.length,1);checks.push('Remove returns actual levee to tray; Undo restores it.');
await page.click('#undo');await page.click('#undo');assert.equal((await state()).walls.length,0);
await page.click('#test');await page.waitForTimeout(450);await page.keyboard.press('Space');s=await state();assert.equal(s.mode,'paused');const t=s.time;await page.evaluate(()=>(window as any).advanceTime(2000));assert.equal((await state()).time,t);checks.push('Pause blocks deterministic and real-time flow.');
await page.click('#help');await page.click('#clear');assert.equal((await state()).mode,'plan');assert.equal((await state()).excavatedCells,0);checks.push('Help/clear exits paused flow into valid planning.');
await page.click('#test');await page.evaluate(()=>(window as any).advanceTime(8000));s=await state();assert.equal(s.mode,'failed');assert.ok(s.homes.some((h:any)=>!h.safe));await shot('03-unplanned-flood');await page.click('#revise');assert.equal((await state()).mode,'plan');assert.equal((await state()).source.remaining,80);checks.push('Actual no-edit flood freezes visibly; retry restores finite pulse.');
await draw([[6,12],[7,13]]);const retained=await state();await page.click('#test');await page.evaluate(()=>(window as any).advanceTime(8000));await page.click('#revise');s=await state();assert.equal(s.excavatedCells,retained.excavatedCells);assert.equal(s.earthLeft,retained.earthLeft);checks.push('Retry retains actual partial plan and spent earth.');
await page.reload();await page.waitForFunction(()=>typeof(window as any).render_game_to_text==='function');s=await state();assert.equal(s.excavatedCells,retained.excavatedCells);assert.equal(s.earthLeft,retained.earthLeft);assert.equal(s.source.remaining,80);assert.equal(s.mode,'plan');checks.push('Reload restores validated construction with a fresh finite pulse.');
await page.keyboard.press('KeyF');await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>!!document.fullscreenElement));await page.keyboard.press('Escape');await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>!!document.fullscreenElement),false);checks.push('Fullscreen and Escape work.');
const phoneContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const phone=await phoneContext.newPage();phone.on('pageerror',e=>errors.push(String(e)));await phone.goto('http://localhost:5302/freeform.html');await phone.waitForFunction(()=>typeof(window as any).render_game_to_text==='function');await phone.waitForTimeout(600);await shot('04-phone-opening',phone);
const cdp=await phoneContext.newCDPSession(phone),a=await screen(phone,[5,11]),b=await screen(phone,[6,13]);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y}]});for(let k=1;k<=12;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*k/12,y:a.y+(b.y-a.y)*k/12}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok((await state(phone)).excavatedCells>0);assert.equal(await phone.evaluate(()=>scrollY),0);await shot('05-phone-touch',phone);await phone.click('#undo');assert.equal((await state(phone)).excavatedCells,0);checks.push('Real touch drag edits arbitrary soil without scrolling; touch Undo refunds.');
await phone.click('#wall');await phone.click('#rotate');const wp=await screen(phone,[7,11]);await phone.touchscreen.tap(wp.x,wp.y);assert.equal((await state(phone)).walls.length,1);checks.push('Touch levee rotate/place works.');
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/controls-summary.json`,JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));await browser.close();
