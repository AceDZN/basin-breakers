import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const checks:string[]=[];
try{
 await page.goto('http://localhost:4302');await page.waitForFunction(()=>!!(window as any).basin);await page.locator('#mute').click();
 await page.locator('#campaign').click();await page.locator('[data-level="9"]').click();await page.locator('#cutaway').click();assert.equal(await page.locator('#aquifer-cut').isVisible(),true);assert.match((await page.locator('#aquifer-cut').textContent())!,/נקבוביות/);await page.screenshot({path:'docs/playtest-captures/controls-groundwater-cutaway.png'});checks.push('actual cutaway button shows groundwater in porous rock');
 await page.locator('canvas').focus();await page.keyboard.press('Digit4');await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');assert.equal(await page.locator('#inspect-readout').isVisible(),true);assert.match((await page.locator('#inspect-readout').textContent())!,/גובה קרקע/);checks.push('keyboard inspect reports actual terrain and water depth');
 await page.locator('#campaign').click();await page.locator('[data-level="1"]').click();await page.locator('[data-tool="dig"]').click();for(let i=0;i<2;i++){const xy=await page.evaluate(()=>(window as any).basin.cellToScreen(9,8));await page.mouse.click(xy.x,xy.y);await page.waitForTimeout(60);}
 const plan=await page.evaluate(()=>({h:Array.from((window as any).basin.state.h),earth:(window as any).basin.state.earth}));await page.locator('#run').click();await page.evaluate(()=>(window as any).advanceTime(2000));await page.keyboard.press('KeyR');const after=await page.evaluate(()=>({h:Array.from((window as any).basin.state.h),earth:(window as any).basin.state.earth,time:(window as any).basin.state.time,water:(window as any).basin.state.sources[0].water}));assert.deepEqual(after.h,plan.h);assert.equal(after.earth,plan.earth);assert.equal(after.time,0);assert.equal(after.water,24);checks.push('actual R input preserves excavated terrain and earth budget while restoring water');
 console.log(JSON.stringify({checks}));await writeFile('docs/playtest-captures/controls-extra-summary.json',JSON.stringify({checks},null,2));
}finally{await browser.close();}
