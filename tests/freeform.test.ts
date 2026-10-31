import test from 'node:test';
import assert from 'node:assert/strict';
import {FreeformModel,W,H,idx,DIG_DEPTH,EARTH_BUDGET,SAFE_TARGET,wallCells} from '../src/freeform/model.ts';
import {EAST_PATH,WEST_PATH,DEFLECTORS,construct,measure} from './freeform-witnesses.ts';
import type {Store,Point} from '../src/levels.ts';

const keys=['water','salt','pollution','reuse'] as const;
const sum=(a:ArrayLike<number>)=>Array.from(a).reduce((v,n)=>v+n,0);
function ledger(m:FreeformModel):Store{
 const s=m.state,t:Store={water:sum(s.w),salt:sum(s.salt),pollution:sum(s.pollution),reuse:sum(s.reuse)};
 for(const v of [...s.sources,...s.sinks,s.aquifer,s.sludge,s.evap,s.soil,s.lost])for(const key of keys)t[key]+=v[key];
 return t;
}
function conserved(m:FreeformModel){
 const total=ledger(m);for(const key of keys)assert.ok(Math.abs(total[key]-m.state.initial[key])<1e-7,`${key} ledger ${total[key]} != ${m.state.initial[key]}`);
 for(const a of [m.state.w,m.state.salt,m.state.pollution,m.state.reuse])for(const v of a)assert.ok(Number.isFinite(v)&&v>=-1e-10);
 for(const v of [...m.state.sources,...m.state.sinks,m.state.aquifer,m.state.sludge,m.state.evap,m.state.soil,m.state.lost])for(const key of keys)assert.ok(Number.isFinite(v[key])&&v[key]>=-1e-10);
}
function complete(m:FreeformModel){m.run();m.advance(8,false);assert.equal(m.state.time,100);conserved(m);return m;}
function snapshot(m:FreeformModel){return{bed:Array.from(m.bed),walls:m.walls.map(v=>({...v}))};}

test('two independent geometries carry most water through opposite flanks and both rescue the homes',()=>{
 const east=construct(new FreeformModel(),'east'),west=construct(new FreeformModel(),'west');const e=measure(east),w=measure(west);
 for(const [m,r]of [[east,e],[west,w]]as const){assert.equal(r.mode,'won',JSON.stringify(r));assert.equal(r.released,80);assert.ok(r.received>=SAFE_TARGET);assert.deepEqual(r.exposure,[0,0,0]);assert.ok(r.earth<EARTH_BUDGET);conserved(m);}
 assert.ok(e.flux.east>=48&&w.flux.west>=48);assert.ok(e.flux.west<12&&w.flux.east<12);
 const a=new Set(Array.from(east.bed,(_,i)=>i).filter(i=>east.bed[i]<east.baseH[i]-.1));const b=new Set(Array.from(west.bed,(_,i)=>i).filter(i=>west.bed[i]<west.baseH[i]-.1));
 const shared=[...a].filter(i=>b.has(i)).length;assert.ok(shared/Math.min(a.size,b.size)<.25,`too much common excavation ${shared}`);
});

for(const side of ['east','west']as const)for(const jitter of[-.5,.5])test(`${side}: rough half-cell trench variation still rescues without any route answer check (${jitter})`,()=>{
 const m=construct(new FreeformModel(),side,jitter);complete(m);assert.equal(m.state.mode,'won',JSON.stringify(m.text()));assert.deepEqual(m.homeExposure,[0,0,0]);
});

for(const side of ['east','west']as const)test(`${side}: continuous free wall-position variation remains viable`,()=>{
 const m=new FreeformModel();assert.ok(m.commitDig(side==='east'?EAST_PATH:WEST_PATH));const delta=side==='east'?.25:-.25,dz=side==='east'?.3:-.3;
 for(const[x,z,angle]of DEFLECTORS)assert.ok(m.placeWall(x+delta,z+dz,angle));complete(m);assert.equal(m.state.mode,'won',JSON.stringify(m.text()));
});

test('levees have a causal role: either trench alone and the same walls without a trench fail',()=>{
 for(const path of [EAST_PATH,WEST_PATH]){const m=new FreeformModel();assert.ok(m.commitDig(path));complete(m);assert.equal(m.state.mode,'failed');assert.ok(m.homeExposure.some(e=>e>.12));}
 const walls=new FreeformModel();for(const w of DEFLECTORS)assert.ok(walls.placeWall(...w));complete(walls);assert.equal(walls.state.mode,'failed');assert.ok(walls.homeExposure.some(e=>e>.12));
});

test('an unanticipated one-wall variation is accepted when its geometry physically works',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig(EAST_PATH));assert.ok(m.placeWall(15,14,0));complete(m);assert.equal(m.state.mode,'won');assert.equal(m.walls.length,1);
});

test('no edit releases the whole flood and receives water but fails actual courtyard safety',()=>{
 const m=complete(new FreeformModel());assert.equal(m.released,80);assert.ok(m.delivered>=64);assert.equal(m.state.mode,'failed');assert.ok(m.homeExposure[1]>.12);assert.match(m.state.reason,/חצר/);
});

test('closed inlet cannot win merely because all homes remain dry',()=>{
 const m=new FreeformModel();m.run();m.state.gate=0;m.advance(8,false);conserved(m);assert.equal(m.released,0);assert.equal(m.delivered,0);assert.ok(m.homeSafe.every(Boolean));assert.equal(m.state.mode,'failed');
});

test('a disconnected decorative ditch has no magical effect on the approaching flood',()=>{
 const plain=complete(new FreeformModel()),ditch=new FreeformModel();assert.ok(ditch.commitDig([[5,13],[5,20]]));complete(ditch);assert.equal(ditch.state.mode,'failed');assert.ok(ditch.homeExposure[1]>.12);assert.ok(Math.abs(ditch.delivered-plain.delivered)<1e-6);
});

test('courtyard-directed trench worsens the real home exposure',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig([[14,7],[15,15]]));complete(m);assert.equal(m.state.mode,'failed');assert.ok(m.homePeaks[1]>.45);
});

test('three levees across the valley are not an automatic safety answer',()=>{
 const m=new FreeformModel();for(const x of[10,15,20])assert.ok(m.placeWall(x,9,0));complete(m);assert.equal(m.state.mode,'failed');assert.ok(m.homeExposure.some(e=>e>.12));
});

test('a short dead-end channel can keep homes safe but fails actual safe receipt',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig([[14,7],[21,9],[23,12]]));for(const w of DEFLECTORS)assert.ok(m.placeWall(...w));complete(m);assert.ok(m.homeSafe.every(Boolean));assert.ok(m.delivered<64);assert.equal(m.state.mode,'failed');assert.ok(sum(m.state.w)>16);
});

test('a source pit retains real water and cannot receive credit for hidden drainage',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig([[9,7],[19,7],[19,9],[9,9],[9,11],[19,11]]));complete(m);assert.ok(m.delivered<50);assert.ok(sum(m.state.w)>30);assert.equal(m.state.mode,'failed');
});

test('arbitrary unmarked soil points change actual bounded terrain, rather than a selected route',()=>{
 const m=new FreeformModel();assert.ok(sum(m.editable)>250);for(const p of [[4,8],[24,8],[5,12],[23,12],[7,18],[23,19]]as Point[]){const i=idx(...p),before=m.bed[i];assert.ok(m.commitDig([p]));assert.ok(m.bed[i]<before);assert.ok(Math.abs(m.bed[i]-(m.baseH[i]-DIG_DEPTH))<1e-9);}
 for(let k=0;k<m.homeFootprints.length;k++)for(const i of m.homeFootprints[k])assert.equal(m.bed[i],m.baseH[i]);
});

test('stroke interpolation, repeated overlap and full earth cost are dependable',()=>{
 const a=new FreeformModel(),b=new FreeformModel();assert.ok(a.commitDig([[5,8],[5,20]]));assert.ok(b.commitDig(Array.from({length:13},(_,j)=>[5,j+8]as Point)));
 assert.deepEqual(a.bed,b.bed);const cost=a.earthUsed,history=a.history.length;assert.equal(a.commitDig([[5,8],[5,20]]),false);assert.equal(a.earthUsed,cost);assert.equal(a.history.length,history);
 let independent=0;for(let i=0;i<a.bed.length;i++){assert.ok(a.bed[i]>=a.baseH[i]-DIG_DEPTH-1e-9);independent+=a.baseH[i]-a.bed[i];}assert.ok(Math.abs(independent-(EARTH_BUDGET-a.earthLeft))<1e-8);
});

test('protected and over-budget gestures leave construction unchanged',()=>{
 const m=new FreeformModel(),before=snapshot(m);assert.equal(m.commitDig([[14,3]]),false);const all:Point[]=[];for(let z=7;z<=20;z+=2)all.push([3,z],[25,z]);assert.equal(m.commitDig(all),false);assert.deepEqual(snapshot(m),before);assert.equal(m.history.length,0);
});

test('free wall place/move/remove uses actual cells and exact inventory with no ghost wall',()=>{
 const m=new FreeformModel();assert.ok(m.placeWall(15,14,0));const id=m.walls[0].id,old=wallCells(m.walls[0]);assert.ok(old.some(i=>m.planH[i]>m.bed[i]));assert.ok(m.placeWall(7,10,Math.PI/2,id));const fresh=new Set(wallCells(m.walls[0]));for(const i of old)if(!fresh.has(i))assert.equal(m.planH[i],m.bed[i]);assert.equal(m.walls.length,1);assert.equal(m.earthUsed,0);assert.ok(m.removeWall(id));assert.deepEqual(m.planH,m.bed);assert.equal(m.walls.length,0);
});

test('invalid wall overlaps/footprints/stock/unknown move reject without history or inventory cost',()=>{
 const m=new FreeformModel();assert.ok(m.placeWall(7,9,0));let count=m.history.length;assert.equal(m.placeWall(7,9,0),false);assert.equal(m.placeWall(14,3,0),false);assert.equal(m.placeWall(12,10,0,999),false);assert.equal(m.history.length,count);assert.equal(m.walls.length,1);assert.ok(m.placeWall(14,9,0));assert.ok(m.placeWall(21,9,0));count=m.history.length;assert.equal(m.placeWall(7,13,0),false);assert.equal(m.history.length,count);assert.equal(m.walls.length,3);
});

test('retry restores water while preserving useful partial terrain; Undo alone reverses the last construction',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig(EAST_PATH));const first=snapshot(m),earth=m.earthLeft;complete(m);assert.equal(m.state.mode,'failed');m.retry();assert.deepEqual(snapshot(m),first);assert.equal(m.earthLeft,earth);assert.equal(m.state.time,0);assert.equal(m.state.sources[0].water,80);assert.ok(m.placeWall(15,14,0));assert.ok(m.undo());assert.deepEqual(snapshot(m),first);assert.equal(m.earthLeft,earth);assert.ok(m.undo());assert.deepEqual(m.bed,m.baseH);assert.equal(m.earthLeft,EARTH_BUDGET);
});

test('same final geometry with reversed stroke/wall input order yields the same physical result',()=>{
 const a=construct(new FreeformModel(),'east'),b=new FreeformModel();assert.ok(b.commitDig([...EAST_PATH].reverse()));for(const w of[...DEFLECTORS].reverse())assert.ok(b.placeWall(...w));assert.deepEqual(a.planH,b.planH);complete(a);complete(b);assert.equal(a.state.mode,b.state.mode);assert.deepEqual(a.state.w,b.state.w);assert.deepEqual(a.state.sinks,b.state.sinks);assert.deepEqual(a.homeExposure,b.homeExposure);
});

test('nonzero salt/pollutant/reuse tracers remain conserved through the new coast outflows',()=>{
 const m=construct(new FreeformModel(),'west');m.run();m.state.sources[0].salt=24;m.state.sources[0].pollution=8;m.state.sources[0].reuse=40;m.state.initial.salt=24;m.state.initial.pollution=8;m.state.initial.reuse=40;m.advance(8,false);conserved(m);assert.ok(m.state.sinks.reduce((n,v)=>n+v.salt,0)>15);assert.ok(m.state.sinks.reduce((n,v)=>n+v.pollution,0)>5);
});

test('new clock shows first25 model seconds over5 real seconds, then completes remaining75 over3',()=>{
 const m=construct(new FreeformModel(),'east');m.run();m.advance(1,false);assert.ok(Math.abs(m.state.time-5)<1e-7);m.advance(4,false);assert.ok(Math.abs(m.state.time-25)<1e-7);assert.equal(m.state.mode,'run');m.advance(2,false);assert.ok(Math.abs(m.state.time-75)<1e-7);assert.equal(m.state.mode,'run');m.advance(1,false);assert.equal(m.state.time,100);assert.equal(m.state.mode,'won');conserved(m);
});

test('flood freeze exposes actual consequence for at least2 real seconds and retains mass',()=>{
 const m=new FreeformModel();m.run();m.advance(1.9);assert.equal(m.state.mode,'run');m.advance(.2);assert.equal(m.state.mode,'failed');assert.ok(m.state.time>=10-1e-8&&m.state.time<10.1);assert.ok(m.homeExposure.some(e=>e>.12));conserved(m);
});

test('small public time steps preserve outcome and close quantities across the full event',()=>{
 const a=construct(new FreeformModel(),'west'),b=construct(new FreeformModel(),'west');complete(a);b.run();for(let n=0;n<501&&b.state.mode==='run';n++)b.advance(.016,false);conserved(b);assert.equal(b.state.mode,'won');assert.equal(b.state.time,100);assert.ok(Math.abs(a.delivered-b.delivered)<.15);
});

test('valid saved construction restores a fresh pulse without aliasing input or inventing history',()=>{
 const from=construct(new FreeformModel(),'east'),data=snapshot(from),m=new FreeformModel();assert.ok(m.commitDig([[5,12],[5,16]]));m.run();m.advance(.5,false);assert.ok(m.restoreConstruction(data));assert.deepEqual(m.bed,from.bed);assert.deepEqual(m.planH,from.planH);assert.equal(m.state.mode,'plan');assert.equal(m.state.time,0);assert.equal(m.state.sources[0].water,80);assert.equal(m.history.length,0);assert.equal(m.earthLeft,from.earthLeft);data.bed[0]=999;data.walls[0].x=999;assert.equal(m.bed[0],from.bed[0]);assert.equal(m.walls[0].x,from.walls[0].x);complete(m);assert.equal(m.state.mode,'won');
});

test('fill brush refunds only restored excavation, previews without mutation, and Undo restores the cut',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig([[5,8],[5,18]]));const dug=snapshot(m),earth=m.earthLeft,history=m.history.length;
 const preview=m.fillPreview([[5,8],[5,12]]);assert.ok(preview.ok&&preview.cells>0&&preview.cost>0);assert.deepEqual(snapshot(m),dug);assert.equal(m.history.length,history);assert.ok(m.previewH);assert.equal(m.previewH[idx(5,10)],m.baseH[idx(5,10)]);assert.equal(m.previewH[idx(5,17)],m.bed[idx(5,17)]);
 assert.ok(m.commitFill([[5,8],[5,12]]));assert.ok(Math.abs(m.earthLeft-earth-preview.cost)<1e-8);assert.equal(m.bed[idx(5,10)],m.baseH[idx(5,10)]);assert.ok(m.bed[idx(5,17)]<m.baseH[idx(5,17)]);assert.ok(m.undo());assert.deepEqual(snapshot(m),dug);assert.equal(m.earthLeft,earth);
 assert.ok(m.commitFill([[5,8],[5,18]]));assert.deepEqual(m.bed,m.baseH);assert.equal(m.earthLeft,EARTH_BUDGET);assert.equal(m.commitFill([[5,8],[5,18]]),false);assert.equal(m.history.length,history+1);
});

test('fill respects source, homes and current wall cells, including their preview crests',()=>{
 const m=new FreeformModel();assert.ok(m.commitDig([[7,8],[7,13]]));assert.ok(m.placeWall(7,10,0));const wall=m.walls[0],occupied=wallCells(wall),before=snapshot(m),earth=m.earthLeft;
 const p=m.fillPreview([[7,8],[7,13]]);assert.ok(p.ok);for(const i of occupied){assert.equal(m.previewH![i],m.planH[i]);assert.equal(m.bed[i],before.bed[i]);}assert.ok(m.commitFill([[7,8],[7,13]]));for(const i of occupied)assert.equal(m.bed[i],before.bed[i]);assert.ok(m.earthLeft>earth&&m.earthLeft<EARTH_BUDGET);
 assert.equal(m.commitFill([[14,3]]),false);assert.equal(m.commitFill([[10,16]]),false);for(const cells of m.homeFootprints)for(const i of cells)assert.equal(m.bed[i],m.baseH[i]);assert.deepEqual(m.walls,before.walls);assert.ok(m.removeWall(wall.id));assert.ok(m.commitFill([[7,8],[7,13]]));assert.deepEqual(m.bed,m.baseH);assert.equal(m.earthLeft,EARTH_BUDGET);
});

test('empty, invalid and unexcavated fill gestures create no cost or history',()=>{
 const m=new FreeformModel(),before=snapshot(m);for(const p of[[],[[5,10]],[[NaN,10]],[[5,Infinity]]]as Point[][]){assert.equal(m.commitFill(p),false);assert.deepEqual(snapshot(m),before);assert.equal(m.history.length,0);assert.equal(m.previewH,null);assert.equal(m.earthLeft,EARTH_BUDGET);}
});

test('Undo escapes both running and paused waves and reverses one construction at a time',()=>{
 for(const paused of[false,true]){const m=new FreeformModel();assert.ok(m.commitDig([[5,8],[5,14]]));const cut=snapshot(m);assert.ok(m.placeWall(15,14,0));m.run();m.advance(.4,false);if(paused)m.state.mode='paused';assert.ok(m.undo());assert.deepEqual(snapshot(m),cut);assert.equal(m.state.mode,'plan');assert.equal(m.state.time,0);assert.equal(m.state.sources[0].water,80);assert.deepEqual(m.homeExposure,[0,0,0]);conserved(m);assert.ok(m.undo());assert.deepEqual(m.bed,m.baseH);}
 const empty=new FreeformModel();empty.run();empty.advance(.4,false);empty.state.mode='paused';assert.equal(empty.undo(),false);assert.equal(empty.state.mode,'plan');assert.equal(empty.state.sources[0].water,80);assert.deepEqual(empty.bed,empty.baseH);
});

test('legacy saves never turn Undo into a destructive whole-plan wipe',()=>{
 const from=construct(new FreeformModel(),'west'),loaded=new FreeformModel(),original=snapshot(from);assert.ok(loaded.restoreConstruction(original));assert.equal(loaded.history.length,0);loaded.run();loaded.advance(.4,false);loaded.state.mode='paused';assert.equal(loaded.undo(),false);assert.deepEqual(snapshot(loaded),original);assert.equal(loaded.state.mode,'plan');const earth=loaded.earthLeft;assert.ok(loaded.commitFill([[4,18]]));assert.ok(loaded.earthLeft>earth);assert.equal(loaded.walls.length,2);
 const empty=new FreeformModel();assert.ok(empty.restoreConstruction(snapshot(new FreeformModel())));assert.equal(empty.history.length,0);assert.equal(empty.undo(),false);assert.deepEqual(empty.bed,empty.baseH);
 const keep=construct(new FreeformModel(),'east');keep.history=[];const keepOriginal=snapshot(keep);keep.run();keep.advance(.4,false);assert.equal(keep.undo(),false);assert.deepEqual(snapshot(keep),keepOriginal);assert.equal(keep.state.mode,'plan');
});

test('persisted history roundtrips the actual last action and preserves removed-wall IDs',()=>{
 const from=new FreeformModel();assert.ok(from.commitDig([[5,8],[5,14]]));const first=snapshot(from);assert.ok(from.placeWall(15,14,0));const id=from.walls[0].id;assert.ok(from.removeWall(id));
 const data={...snapshot(from),history:from.history.map(p=>({bed:Array.from(p.bed),walls:p.walls.map(w=>({...w}))}))},loaded=new FreeformModel();assert.ok(loaded.restoreConstruction(data));assert.equal(loaded.history.length,3);assert.ok(loaded.nextId>id);assert.ok(loaded.undo());assert.equal(loaded.walls.length,1);assert.equal(loaded.walls[0].id,id);assert.ok(loaded.placeWall(7,10,0));assert.equal(new Set(loaded.walls.map(w=>w.id)).size,2);assert.ok(loaded.undo());assert.ok(loaded.undo());assert.deepEqual(snapshot(loaded),first);assert.ok(loaded.undo());assert.deepEqual(loaded.bed,loaded.baseH);
 const cloned=new FreeformModel();assert.ok(cloned.restoreConstruction(data));data.history[0].bed[0]=999;assert.notEqual(cloned.history[0].bed[0],999);data.history[2].walls[0].x=999;assert.notEqual(cloned.history[2].walls[0].x,999);
});

test('invalid or excessive persisted history is rejected atomically',()=>{
 const m=construct(new FreeformModel(),'east');m.run();m.advance(.4,false);const original=snapshot(m),text=m.text(),history=m.history.length,empty=snapshot(new FreeformModel()),valid={...empty,history:[empty]};
 const bad:any[]=[{...valid,history:null},{...valid,history:{}},{...valid,history:Array.from({length:41},()=>empty)},{...valid,history:[null]},{...valid,history:[{...empty,bed:[]}]},{...valid,history:[{...empty,bed:empty.bed.map((v,i)=>i===idx(10,16)?v-.1:v)}]},{...valid,history:[{...empty,walls:[{id:1,x:Infinity,z:9,angle:0}]}]}];
 for(const payload of bad){assert.equal(m.restoreConstruction(payload),false);assert.deepEqual(snapshot(m),original);assert.deepEqual(m.text(),text);assert.equal(m.history.length,history);}
 const capped=new FreeformModel();assert.ok(capped.restoreConstruction({...empty,history:Array.from({length:40},()=>empty)}));assert.equal(capped.history.length,40);
});

test('malformed saved construction is rejected atomically across depth/protection/budget/wall limits',()=>{
 const m=construct(new FreeformModel(),'west');m.run();m.advance(.5,false);const original=snapshot(m),text=m.text(),history=m.history.length;const valid=snapshot(new FreeformModel());
 const bad:any[]=[null,{}, {...valid,bed:[]},{...valid,bed:valid.bed.map((v,i)=>i===idx(4,8)?NaN:v)}, {...valid,bed:valid.bed.map((v,i)=>i===idx(4,8)?v+.1:v)}, {...valid,bed:valid.bed.map((v,i)=>i===idx(4,8)?v-DIG_DEPTH-.1:v)}, {...valid,bed:valid.bed.map((v,i)=>i===idx(10,16)?v-.1:v)}, {...valid,bed:valid.bed.map((v,i)=>m.editable[i]?v-DIG_DEPTH:v)}];
 const w=(id:number,x:number,z:number,angle=0)=>({id,x,z,angle});bad.push({...valid,walls:[w(1,14,3)]},{...valid,walls:[w(1,7,9),w(2,7,9)]},{...valid,walls:[w(1,7,9),w(1,14,9)]},{...valid,walls:[w(1,7,9),w(2,14,9),w(3,21,9),w(4,7,13)]},{...valid,walls:[w(1,Infinity,9)]},{...valid,walls:[w(1,7,9,NaN)]},{...valid,walls:[w(0,7,9)]},{...valid,walls:[w(Number.MAX_SAFE_INTEGER,7,9)]});
 for(const payload of bad){assert.equal(m.restoreConstruction(payload),false);assert.deepEqual(snapshot(m),original);assert.deepEqual(m.text(),text);assert.equal(m.history.length,history);}
});
