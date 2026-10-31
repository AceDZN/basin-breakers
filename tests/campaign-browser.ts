/** Internal authored-plan campaign parity. No fixture is imported by the product. */
import{chromium,type Page}from'playwright';import assert from'node:assert/strict';import fs from'node:fs/promises';import type{Point}from'../src/levels';
import{CAMPAIGN_WITNESSES}from'./freeform-campaign-witnesses';
const selected=process.env.CAMPAIGN_LEVELS?.split(',').map(Number),out='docs/rebuild/campaign-captures';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']});const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const base=process.env.CAMPAIGN_BASE||'http://localhost:4302/';await page.goto(base);await page.waitForFunction(()=>!!(window as any).render_game_to_text);
const state=(p=page)=>p.evaluate(()=>JSON.parse((window as any).render_game_to_text()));const project=(at:Point,p=page)=>p.evaluate(at=>(window as any).basinFreeform.screen(at),at);
async function draw(points:Point[],p=page){for(let k=0;k<points.length;k++){const q=await project(points[k],p);await p.mouse.move(q.x,q.y,{steps:k?8:1});if(!k)await p.mouse.down();}await p.mouse.up();}
async function shot(name:string){await page.screenshot({path:`${out}/${name}.png`});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await state(),null,2));}
const results:any[]=[];
for(const fixture of CAMPAIGN_WITNESSES){
 if(selected&&!selected.includes(fixture.level))continue;
 let s=await state();if(s.level!==fixture.level){await page.click('#map');await page.click(`[data-level="${fixture.level}"]`);}else if(s.excavatedCells||s.walls.length)await page.click('#new-plan');
 await page.click('#dig');for(const path of fixture.paths)await draw(path);await page.click('#wall');
 for(const[x,z,angle]of fixture.walls){const current=(await state()).angle,target=((angle%Math.PI)+Math.PI)%Math.PI,turns=Math.round(((target-current+Math.PI)%Math.PI)/(Math.PI/4));for(let k=0;k<turns;k++)await page.click('#rotate');const q=await project([x,z]);await page.mouse.click(q.x,q.y);}
 s=await state();const name=`level-${String(fixture.level).padStart(2,'0')}`;await shot(`${name}-construction`);await fs.writeFile(`${out}/${name}-geometry.json`,JSON.stringify(await page.evaluate(()=>(window as any).basinFreeform.construction())));await page.click('#test');
 const realtime=process.env.CAMPAIGN_REALTIME==='all'||[2,8,16,24].includes(fixture.level);
 if(realtime)await page.waitForTimeout(2400);else await page.evaluate(()=>(window as any).advanceTime(2000));await shot(`${name}-flow`);
 if(realtime)await page.waitForFunction(()=>['won','failed'].includes(JSON.parse((window as any).render_game_to_text()).mode),{},{timeout:15000});else await page.evaluate(()=>(window as any).advanceTime(6200));
 s=await state();await shot(`${name}-result`);const result={level:fixture.level,mode:s.mode,inputMethod:'actual pointer + visible tool controls',clock:realtime?'real elapsed full wave':'documented deterministic advanceTime after actual construction',state:s};results.push(result);console.log(JSON.stringify({level:fixture.level,mode:s.mode,received:s.safeReceived,target:s.target,recharged:s.recharged,infiltrationGoal:s.infiltrationGoal,earthLeft:s.earthLeft,walls:s.walls.length,exposure:s.homes.map((h:any)=>h.exposure)}));
 assert.equal(await page.locator('canvas').count(),1);
 if(s.mode==='won'&&fixture.level<24){await page.click('#test');assert.equal((await state()).level,fixture.level+1);}
}
if(!selected&&results.length===24&&results.every(r=>r.mode==='won')){assert.equal((await state()).campaign.completed.length,24);await page.click('#test');assert.equal((await state()).campaign.mapOpen,true);assert.match(await page.locator('#level-map-title').innerText(),/כל האגנים בטוחים/);await shot('campaign-complete-map');}
let previous:any[]=[];if(selected)try{previous=JSON.parse(await fs.readFile(`${out}/campaign-browser-summary.json`,'utf8')).results||[];}catch{}const merged=new Map(previous.map(r=>[r.level,r]));for(const r of results)merged.set(r.level,r);await fs.writeFile(`${out}/campaign-browser-summary.json`,JSON.stringify({results:[...merged.values()].sort((a,b)=>a.level-b.level),lastRun:results.map(r=>r.level),errors},null,2));assert.deepEqual(errors,[]);const failures=results.filter(r=>r.mode!=='won');await browser.close();assert.equal(failures.length,0,`Actual UI failed levels ${failures.map(r=>r.level)}`);
