/** Internal model→ordinary-UI parity witnesses, not unaided-player enjoyment evidence. */
import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import type{Point}from'../src/levels';
const out='docs/rebuild/freeform-captures';await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=metal']});const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://localhost:5302/freeform.html');await page.waitForFunction(()=>typeof(window as any).render_game_to_text==='function');await page.waitForTimeout(500);
const get=()=>page.evaluate(()=>JSON.parse((window as any).render_game_to_text()));const project=(at:Point)=>page.evaluate(at=>(window as any).basinFreeform.screen(at),at);
async function shot(name:string){await page.screenshot({path:`${out}/${name}.png`});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await get(),null,2));}
const results=[];
for(const[name,route]of[['east',[[14,7],[19,10],[23,13],[24,18],[23,20]]],['west',[[14,7],[9,10],[5,13],[4,18],[5,20]]]]as const){
 if(name==='west'){await page.click('#help');await page.click('#clear');}
 await page.click('#dig');for(let k=0;k<route.length;k++){const p=await project([...route[k]]as Point);await page.mouse.move(p.x,p.y,{steps:k?8:1});if(!k)await page.mouse.down();}await page.mouse.up();let s=await get();assert.ok(s.excavatedCells>30);assert.ok(s.earthLeft<s.earthBudget);
 await page.click('#wall');for(const at of[[14,9],[15,14]]as Point[]){const p=await project(at);await page.mouse.click(p.x,p.y);}s=await get();assert.equal(s.walls.length,2);await shot(`06-${name}-construction`);await page.click('#test');await page.waitForTimeout(2500);await shot(`07-${name}-flow`);
 await page.waitForFunction(()=>['won','failed'].includes(JSON.parse((window as any).render_game_to_text()).mode),{},{timeout:15000});s=await get();await shot(`08-${name}-result`);assert.equal(s.mode,'won',JSON.stringify(s));assert.ok(s.safeReceived>=64);assert.ok(s.source.released>=79.999);assert.ok(s.homes.every((h:any)=>h.safe));results.push({name,state:s});
}
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/playthrough-summary.json`,JSON.stringify({method:'Real pointer construction; real elapsed-time waves; no model mutation, fixture load or time hook. QA coordinates are parity witnesses, not unaided solutions.',results,errors},null,2));console.log(JSON.stringify({passed:results.length,received:results.map(r=>r.state.safeReceived),errors}));await browser.close();
