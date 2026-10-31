import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FreeformModel,FREEFORM_LEVELS,W,idx,wallCells} from '../src/freeform/model.ts';
import {CAMPAIGN_WITNESSES,applyCampaignWitness} from './freeform-campaign-witnesses.ts';
import type {Point,Store} from '../src/levels.ts';

const quantities=['water','salt','pollution','reuse']as const;
const sum=(v:ArrayLike<number>)=>Array.from(v).reduce((a,n)=>a+n,0);
function independentLedger(m:FreeformModel){
 const s=m.state,total:Store={water:sum(s.w),salt:sum(s.salt),pollution:sum(s.pollution),reuse:sum(s.reuse)};
 for(const a of[s.w,s.salt,s.pollution,s.reuse])for(const n of a)assert.ok(Number.isFinite(n)&&n>=-1e-10);
 for(const store of[...s.sources,...s.sinks,s.aquifer,s.sludge,s.evap,s.soil,s.lost])for(const q of quantities){assert.ok(Number.isFinite(store[q])&&store[q]>=-1e-10);total[q]+=store[q];}
 const error={}as Store;for(const q of quantities){error[q]=total[q]-s.initial[q];assert.ok(Math.abs(error[q])<1e-7,`level ${m.level}: ${q} changed by ${error[q]}`);}return error;
}
function fixture(n:number){return CAMPAIGN_WITNESSES.find(w=>w.level===n)!;}
function construct(n:number){return applyCampaignWitness(new FreeformModel(n),fixture(n));}
function complete(m:FreeformModel){m.run();m.advance(8,false);assert.equal(m.state.time,100);independentLedger(m);return m;}
function measure(m:FreeformModel){
 const flux={west:0,center:0,east:0};m.state.onTransfer=(from,to,q)=>{let x=-1,sign=0;if(to-from===W&&Math.floor(from/W)===12){x=from%W;sign=1;}else if(from-to===W&&Math.floor(to/W)===12){x=to%W;sign=-1;}if(sign)flux[x<12?'west':x>16?'east':'center']+=q*sign;};
 complete(m);return{level:m.level,title:m.config.title,released:m.released,total:m.totalWater,received:m.delivered,target:m.safeTarget,recharged:m.state.recharged,infiltrationGoal:m.infiltrationGoal,exposure:[...m.homeExposure],peaks:[...m.homePeaks],earth:m.earthUsed,budget:m.earthBudget,walls:m.walls.length,stock:m.maxWalls,excavatedCells:m.changedCells,flux,ledgerError:independentLedger(m)};
}
const wins=new Map<number,ReturnType<typeof measure>>(),bad=new Map<number,object>();

for(const c of FREEFORM_LEVELS){
 test(`campaign ${c.id}: authored public construction saves every courtyard through every finite pulse`,()=>{
  const m=construct(c.id),r=measure(m);assert.equal(m.state.mode,'won',JSON.stringify(m.text()));assert.ok(r.released>=r.total-.001);assert.ok(m.state.sources.every(s=>s.water<1e-7));assert.ok(r.received>=r.target);assert.ok(r.recharged+1e-6>=r.infiltrationGoal);assert.ok(r.exposure.every(e=>e<=.12));assert.ok(r.earth<=r.budget+1e-7);assert.ok(r.walls<=r.stock);wins.set(c.id,r);
 });
 test(`campaign ${c.id}: no edit fails an actual visible courtyard rather than an answer check`,()=>{
  const m=complete(new FreeformModel(c.id));assert.equal(m.state.mode,'failed');assert.ok(m.homeExposure.some(e=>e>.12),JSON.stringify(m.text()));assert.match(m.state.reason,/חצר/);bad.set(c.id,{exposure:[...m.homeExposure],peaks:[...m.homePeaks],released:m.released,received:m.delivered,recharged:m.state.recharged,reason:m.state.reason,ledgerError:independentLedger(m)});
 });
}

test('24 authored fields are physically distinct, editable, bounded and contain no product constructions',()=>{
 assert.equal(FREEFORM_LEVELS.length,24);assert.deepEqual(FREEFORM_LEVELS.map(c=>c.id),Array.from({length:24},(_,k)=>k+1));
 const geometry=new Set<string>();for(const c of FREEFORM_LEVELS){const m=new FreeformModel(c.id);geometry.add(Array.from(m.baseH).map(v=>v.toFixed(5)).join(','));assert.ok(sum(m.editable)>230);assert.equal(m.homes.length,3);assert.equal(m.state.level.knownPlan.length,0);assert.equal(m.state.level.cuts.length,0);assert.equal(m.state.level.routes.length,0);for(const cells of m.homeFootprints)for(const i of cells)assert.equal(m.editable[i],0);}
 assert.equal(geometry.size,24,'duplicate heightfields disguised only by a title');
 assert.ok(FREEFORM_LEVELS.some(c=>c.maxWalls===1));assert.ok(FREEFORM_LEVELS.some(c=>c.earthBudget<100));assert.ok(FREEFORM_LEVELS.filter(c=>c.pulses.length>1).length>=4);
});

test('west and east inlet missions use materially different actual water conveyance',()=>{
 const west=measure(construct(2)),east=measure(construct(3));assert.ok(west.flux.west>40,JSON.stringify(west.flux));assert.ok(east.flux.east>40,JSON.stringify(east.flux));assert.ok(west.flux.west>west.flux.east*2);assert.ok(east.flux.east>east.flux.west*2);
});

for(const n of[8,16,22,24])test(`campaign ${n}: delayed second wave is still finite and cannot be skipped by an early safe state`,()=>{
 const m=construct(n);m.run();m.advance(5,false);assert.ok(Math.abs(m.state.time-25)<1e-7);assert.equal(m.state.mode,'run');assert.equal(m.state.sources[1].released,0);assert.equal(m.state.sources[1].water,m.config.pulses[1].volume);assert.ok(m.released<m.totalWater);independentLedger(m);m.advance(3,false);assert.equal(m.state.mode,'won');assert.equal(m.state.time,100);assert.ok(m.state.sources.every(s=>s.water<1e-7));independentLedger(m);
});

test('long weak storm is not completed after only its first 25 model seconds',()=>{
 const m=construct(20);m.run();m.advance(5,false);assert.equal(m.state.mode,'run');assert.ok(m.state.sources[0].water>28);assert.ok(m.released<56);m.advance(3,false);assert.equal(m.state.mode,'won');assert.equal(m.released,84);independentLedger(m);
});

for(const n of[9,17,21,24])test(`campaign ${n}: green soil transfers real conserved water, and sealing it fails renewal`,()=>{
 const wet=complete(construct(n)),sealed=construct(n);sealed.run();sealed.state.perm.fill(0);sealed.advance(8,false);independentLedger(sealed);assert.ok(wet.state.recharged>=wet.infiltrationGoal);assert.ok(wet.state.aquifer.water>=wet.infiltrationGoal);assert.equal(sealed.state.recharged,0);assert.equal(sealed.state.aquifer.water,0);assert.equal(sealed.state.mode,'failed');assert.ok(sealed.delivered>wet.delivered);
});

test('fixed limestone remains an actual protected interruption under a free cross-island drag',()=>{
 for(const n of[2,5,11,17,22,23,24]){const m=new FreeformModel(n),f=m.config.terrain.features.find(f=>f.fixed)!,i=idx(...f.at),before=m.baseH[i];m.commitDig([[f.at[0]-3,f.at[1]],[f.at[0]+3,f.at[1]]]);assert.equal(m.editable[i],0);assert.equal(m.bed[i],before);assert.equal(m.planH[i],before);assert.ok(m.changedCells>0);}
});

for(const n of[2,7,12,24])for(const d of[-.1,.1])test(`campaign ${n}: small ordinary trench deviation ${d} retains a complete rescue`,()=>{
 const w=fixture(n),m=new FreeformModel(n);for(const p of w.paths)assert.ok(m.commitDig(p.map(([x,z],k)=>[x+(k?d:0),z]as Point)));for(const v of w.walls)assert.ok(m.placeWall(...v));complete(m);assert.equal(m.state.mode,'won',JSON.stringify(m.text()));
});

for(const n of[6,10,16,20])test(`campaign ${n}: revised construction tolerates broad trench and free-wall placement variations`,()=>{
 const w=fixture(n);for(const[dx,wx,wz]of[[0,0,0],[-.3,-.15,-.45],[.3,.15,.3],[-.5,0,0],[.5,0,0],[0,-.3,-.5],[0,.3,.5]]){const m=new FreeformModel(n);for(const p of w.paths)assert.ok(m.commitDig(p.map(([x,z],k)=>[x+(k?dx:0),z]as Point)));for(const[x,z,a]of w.walls)assert.ok(m.placeWall(x+wx,z+wz,a));complete(m);assert.equal(m.state.mode,'won',JSON.stringify({n,dx,wx,wz,state:m.text()}));}
});

test('mission10 widened interception also tolerates the actual observed one-cell uphill UI wall placement',()=>{
 for(const dx of[-.5,0,.5]){const m=new FreeformModel(10);for(const p of fixture(10).paths)assert.ok(m.commitDig(p.map(([x,z],k)=>[x+(k?dx:0),z]as Point)));assert.ok(m.placeWall(13.71266903682528,7.965605096399045,0));complete(m);assert.equal(m.state.mode,'won',JSON.stringify(m.text()));}
});

test('new missions preserve the finite nonzero salt, contamination and provenance ledgers across second pulses and soil',()=>{
 for(const n of[8,17,24]){const m=construct(n);m.run();m.state.initial.salt=0;m.state.initial.pollution=0;m.state.initial.reuse=0;for(const s of m.state.sources){s.salt=s.water*.2;s.pollution=s.water*.03;s.reuse=s.water*.4;m.state.initial.salt+=s.salt;m.state.initial.pollution+=s.pollution;m.state.initial.reuse+=s.reuse;}m.advance(8,false);independentLedger(m);assert.ok(m.state.sinks.reduce((v,s)=>v+s.salt,0)>8);if(m.infiltrationGoal){assert.ok(m.state.aquifer.salt>0);assert.ok(m.state.aquifer.pollution>0);assert.ok(m.state.aquifer.reuse>0);}}
});

test('load changes the actual map, resets construction, and keeps first-map saved geometry compatible',()=>{
 const m=construct(1),saved={bed:Array.from(m.bed),walls:m.walls.map(w=>({...w})),history:m.history.map(h=>({bed:Array.from(h.bed),walls:h.walls.map(w=>({...w}))}))},base=m.baseH.slice();m.load(24);assert.equal(m.level,24);assert.equal(m.totalWater,96);assert.equal(m.history.length,0);assert.equal(m.walls.length,0);assert.equal(m.earthUsed,0);assert.notDeepEqual(m.baseH,base);assert.equal(m.restoreConstruction(saved),false);m.load(1);assert.deepEqual(m.baseH,base);assert.ok(m.restoreConstruction(saved));complete(m);assert.equal(m.state.mode,'won');assert.ok(Math.abs(m.delivered-70.7903237972)<1e-7);
});

test('level-specific stock, budget and protected terrain also validate saved history',()=>{
 const one=new FreeformModel(7);assert.ok(one.placeWall(5,9,0));assert.equal(one.placeWall(20,9,0),false);assert.equal(one.walls.length,1);const saved={bed:Array.from(one.bed),walls:one.walls.map(w=>({...w})),history:[{bed:Array.from(one.baseH),walls:[{id:1,x:5,z:9,angle:0},{id:2,x:20,z:9,angle:0}]}]};assert.equal(one.restoreConstruction(saved),false);
 const rock=new FreeformModel(11),invalid=Array.from(rock.baseH);invalid[idx(8,11)]-=.1;assert.equal(rock.restoreConstruction({bed:invalid,walls:[]}),false);const low=new FreeformModel(18),over=Array.from(low.baseH);let cost=0;for(let i=0;i<over.length;i++)if(low.editable[i]&&cost<90){over[i]-=1.4;cost+=1.4;}assert.equal(low.restoreConstruction({bed:over,walls:[]}),false);
});

after(()=>{if(wins.size===24&&bad.size===24)fs.writeFileSync('docs/rebuild/campaign-model-proof.json',JSON.stringify({kind:'independent full-horizon model proof, not UI/newcomer evidence',levels:Array.from(wins.values()).sort((a,b)=>a.level-b.level).map(r=>({...r,noEdit:bad.get(r.level)}))},null,2)+'\n');});
