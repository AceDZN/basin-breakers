import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const url=process.env.BASIN_PERF_URL||'http://localhost:4302';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(url);await page.waitForFunction(()=>!!(window as any).basin&&Object.values((window as any).basin.assets).every(Boolean));await page.waitForTimeout(500);
 const resources=await page.evaluate(()=>{const entries=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')] as PerformanceResourceTiming[];return entries.map(v=>({url:v.name,encodedBytes:v.encodedBodySize,transferBytes:v.transferSize,durationMs:v.duration}));});
 await context.setOffline(true);await page.locator('#mute').click();
 for(let i=0;i<2;i++){const xy=await page.evaluate(()=>(window as any).basin.cellToScreen(9,8));await page.mouse.click(xy.x,xy.y);await page.waitForTimeout(60);}
 await page.locator('#run').click();await page.waitForTimeout(5500);const fps:number[]=[];for(let i=0;i<3;i++){fps.push(await page.evaluate(()=>JSON.parse((window as any).render_game_to_text()).fps));await page.waitForTimeout(1500);}
 const actualRun=await page.evaluate(()=>JSON.parse((window as any).render_game_to_text()));assert.equal(actualRun.mode,'run');assert.ok(actualRun.time>=5);await page.evaluate(()=>(window as any).advanceTime(55000));const end=await page.evaluate(()=>JSON.parse((window as any).render_game_to_text()));assert.equal(end.mode,'won');assert.deepEqual(errors,[]);
 const output={url,viewport:{width:1440,height:900,dpr:1},graphics:'Chromium headless, --use-angle=metal',fpsSamples:fps,actualElapsedSimulationSeconds:actualRun.time,networkOfflineAfterLoad:true,offlineActualPointerRunWon:end.mode==='won',encodedBytes:resources.reduce((n,v)=>n+v.encodedBytes,0),transferredBytes:resources.reduce((n,v)=>n+v.transferBytes,0),resources,errors};
 await writeFile('docs/playtest-captures/performance-summary.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output));
}finally{await browser.close();}
