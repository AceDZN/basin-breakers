// Supplemental campaign QA. The required develop-web-game action client is also run by lead.
// This harness reads projection/state but changes the game only through visible UI inputs.
import {chromium,type Page} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {LEVELS,W,type Action} from '../src/levels.ts';
import {createState,applyPlan} from '../src/sim.ts';

const url=process.env.BASIN_QA_URL||'http://localhost:5302';
const selected=(process.env.BASIN_QA_LEVELS||'1,2,5,6,10,15,17,19,24').split(',').map(Number);
const directory='docs/playtest-captures';await mkdir(directory,{recursive:true});
console.log('launching browser');
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']});
console.log('browser ready');
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.log('CONSOLE ERROR',m.text());}});
console.log('opening',url);await page.goto(url);console.log('page loaded');await page.waitForFunction(()=>!!(window as any).basin).catch(async error=>{await page.screenshot({path:`${directory}/initialization-failure.png`});await browser.close();throw error;});await page.waitForTimeout(500);await page.locator('#mute').click();
const results:unknown[]=[];
async function state(){return page.evaluate(()=>JSON.parse((window as any).render_game_to_text()));}
async function load(id:number){console.log('level',id);await page.keyboard.press('KeyR');await page.locator('#campaign').click();await page.locator(`[data-level="${id}"]`).click();await page.waitForTimeout(80);assert.equal((await state()).level,id);}
async function range(selector:string,value:number){const slider=page.locator(selector);await slider.focus();const n=Math.round(value*100);await slider.press(n<=50?'Home':'End');for(let j=0;j<(n<=50?n:100-n);j++)await slider.press(n<=50?'ArrowRight':'ArrowLeft');}
async function controls(actions:Action[]){
 for(const action of actions){if(action.type==='edit')continue;await page.locator('[data-tool="gate"]').click();if(action.type==='gate')await range('#gate',action.value);else{const el=page.locator(`[data-device="${action.key}"]`);const type=await el.getAttribute('type');if(type==='range')await range(`[data-device="${action.key}"]`,Number(action.value));else await el.setChecked(Boolean(action.value));}}
 if(await page.locator('#close-inspector').isVisible())await page.locator('#close-inspector').click();
}
async function terrain(id:number,actions:Action[]){
 const expected=createState(LEVELS[id-1]);applyPlan(expected,actions);
 const touched=[...new Set(actions.filter(a=>a.type==='edit').map(a=>`${a.x},${a.z}`))];
 for(const key of touched){const [x,z]=key.split(',').map(Number),target=expected.h[z*W+x];let current=await page.evaluate(({x,z,W})=>(window as any).basin.state.h[z*W+x],{x,z,W});
  for(let j=0;j<5&&Math.abs(current-target)>.01;j++){const tool=current>target?'dig':'raise';await page.locator(`[data-tool="${tool}"]`).click();const p=await page.evaluate(({x,z})=>(window as any).basin.cellToScreen(x,z),{x,z});await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.up();await page.waitForTimeout(45);const next=await page.evaluate(({x,z,W})=>(window as any).basin.state.h[z*W+x],{x,z,W});assert.notEqual(next,current,`projected pointer missed level ${id} cell ${key} at ${JSON.stringify(p)}`);current=next;}
  assert.ok(Math.abs(current-target)<.01,`terrain target mismatch level${id} ${key}: ${current} != ${target}`);
 }
}
async function execute(id:number,actions:Action[],label:string){
 await terrain(id,actions);await controls(actions);await page.locator('#hint').click(); // Authored-plan QA is explicitly not counted as unaided.
 await page.locator('#run').click();await page.evaluate(()=>(window as any).advanceTime(5000));await page.screenshot({path:`${directory}/level-${String(id).padStart(2,'0')}-${label}-flow.png`});
 if(id===24&&label==='solution'){await page.evaluate(()=>(window as any).advanceTime(25000));await page.screenshot({path:`${directory}/level-24-second-pulse-flow.png`});}
 await page.evaluate((ms)=>(window as any).advanceTime(ms),LEVELS[id-1].duration*1000);const final=await state();await page.screenshot({path:`${directory}/level-${String(id).padStart(2,'0')}-${label}-result.png`});await writeFile(`${directory}/level-${String(id).padStart(2,'0')}-${label}.json`,JSON.stringify(final,null,2));results.push({id,label,...final});return final;
}
try {
for(const id of selected){
 await load(id);
 if([2,6,10,15,17,19].includes(id)){const badActions=id===6?LEVELS[id-1].knownPlan.filter(a=>a.type!=='device'||a.key!=='unseal'):LEVELS[id-1].badPlan;const bad=await execute(id,badActions,'mistake');assert.equal(bad.mode,'failed',`level ${id} intended mistake won`);await page.keyboard.press('KeyR');assert.equal((await state()).mode,'plan');}
 const good=await execute(id,LEVELS[id-1].knownPlan,'solution');assert.equal(good.mode,'won',`level ${id} authored pointer plan failed: ${good.reason}`);assert.ok(Object.values(good.accounting.error).every((v)=>Math.abs(Number(v))<1e-6));
}
assert.deepEqual(errors,[]);console.log(JSON.stringify({scenarios:results.length,errors,output:directory}));
} catch(error){await page.screenshot({path:`${directory}/browser-failure.png`});throw error;} finally {await writeFile(`${directory}/browser-summary.json`,JSON.stringify({url,scriptedAuthoredPlans:true,results,errors},null,2));await browser.close();}
