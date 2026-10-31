import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,N,W,type Level,type Store} from '../src/levels.ts';
import {createState,edit,setGate,setDevice,start,rewind,step,applyPlan,quality,idx,type State} from '../src/sim.ts';

const KEYS=['water','salt','pollution','reuse'] as const;
const MASS_TOLERANCE=1e-7;
const sum=(values:ArrayLike<number>)=>Array.from(values).reduce((a,b)=>a+b,0);

// Independent ledger: deliberately does not call the implementation's accounting().
function total(s:State):Store{
 const out:Store={water:sum(s.w),salt:sum(s.salt),pollution:sum(s.pollution),reuse:sum(s.reuse)};
 for(const v of [...s.sources,...s.sinks,s.aquifer,s.sludge,s.evap,s.soil,s.lost]) for(const key of KEYS)out[key]+=v[key];
 return out;
}
function verifyLedger(s:State){
 const t=total(s);
 for(const k of KEYS)assert.ok(Math.abs(t[k]-s.initial[k])<MASS_TOLERANCE,`level ${s.level.id} ${k}: ${t[k]} != ${s.initial[k]}`);
 for(const field of [s.w,s.salt,s.pollution,s.reuse])for(const value of field)assert.ok(Number.isFinite(value)&&value>=-1e-10);
 for(const v of [...s.sources,...s.sinks,s.aquifer,s.sludge,s.evap,s.soil,s.lost])for(const k of KEYS)assert.ok(Number.isFinite(v[k])&&v[k]>=-1e-10);
}
function run(s:State,dt=s.level.duration){start(s);while(s.mode==='run')step(s,dt);verifyLedger(s);assert.equal(s.time,s.level.duration);return s;}
function fixture(overrides:Partial<Level>={}):Level{
 return {...structuredClone(LEVELS[0]),id:900,duration:1,budget:10,routes:[],cuts:[],berms:[],sources:[],sinks:[],hazards:[],permeable:[],aquifer:0,reserve:0,recharge:0,devices:[],knownPlan:[],badPlan:[],defaults:{pump:0,membrane:false,treatment:false,drip:false,brineSafe:true,reuseToFarm:true,unseal:false},...overrides};
}

test('campaign contains 24 ordered original Hebrew missions with physical plans',()=>{
 assert.equal(LEVELS.length,24);
 assert.deepEqual(LEVELS.map(l=>l.id),Array.from({length:24},(_,i)=>i+1));
 for(const l of LEVELS){assert.ok(l.name&&l.brief&&l.hint&&l.lesson);assert.ok(l.duration>0&&l.knownPlan.length);assert.ok(l.sources.every(s=>s.volume>=0));}
});

for(const l of LEVELS){
 test(`level ${l.id}: known plan reaches all final constraints, conserving every tracer`,()=>{
  const s=createState(l);applyPlan(s,l.knownPlan);run(s);
  assert.equal(s.mode,'won',JSON.stringify({reason:s.reason,sinks:s.sinks,aq:s.aquifer,recharge:s.recharged,flood:s.flood,energy:s.energy}));
  assert.ok(s.energy>=0&&s.earth>=0);
 });
 test(`level ${l.id}: uncorrected/bad plan fails a physical constraint`,()=>{
  const s=createState(l);applyPlan(s,l.badPlan);run(s);assert.equal(s.mode,'failed',`bad plan unexpectedly won level ${l.id}`);assert.ok(s.reason.length>5);
 });
}

test('earth edits charge actual height change and obey depth/budget/locked cells',()=>{
 const s=createState(LEVELS[0]);const [x,z]=s.level.cuts[0],i=idx(x,z),before=s.h[i],budget=s.earth;
 assert.equal(edit(s,0,0,'dig'),false);assert.equal(edit(s,...s.level.sources[0].at,'dig'),false);assert.equal(edit(s,...s.level.sinks[0].at,'dig'),false);
 assert.equal(edit(s,x,z,'dig'),true);assert.ok(Math.abs(s.earth-(budget-Math.abs(s.h[i]-before)))<1e-9);
 for(let j=0;j<20;j++)edit(s,x,z,'dig');assert.ok(s.h[i]>=s.floor[i]-1e-9);const h=s.h[i];assert.equal(edit(s,x,z,'dig'),false);assert.equal(s.h[i],h);
 s.earth=.01;const h2=s.h[idx(10,10)];assert.equal(edit(s,10,10,'dig'),false);assert.equal(s.h[idx(10,10)],h2);
 start(s);assert.equal(edit(s,x,z,'raise'),false);
});

test('closed gate releases no finite-source water; setting gate is bounded',()=>{
 const s=createState(LEVELS[0]);setGate(s,-1);assert.equal(s.gate,0);run(s);assert.equal(sum(s.w)+sum(s.sinks.map(v=>v.water)),0);assert.equal(s.sources[0].released,0);
 setGate(s,2);assert.equal(s.gate,1);
});

test('plan/paused clock does not change stores; rewind restores deterministic replay and preserves terrain',()=>{
 const s=createState(LEVELS[0]);applyPlan(s,s.level.knownPlan);const h=Array.from(s.h),earth=s.earth;step(s,50);assert.equal(s.time,0);
 start(s);step(s,2);start(s);const ledger=total(s),time=s.time;step(s,10);assert.equal(s.time,time);assert.deepEqual(total(s),ledger);
 rewind(s);assert.deepEqual(Array.from(s.h),h);assert.equal(s.earth,earth);assert.equal(s.time,0);assert.equal(s.mode,'plan');verifyLedger(s);
 run(s);const final=Array.from(s.w),sinks=structuredClone(s.sinks);rewind(s);run(s);assert.deepEqual(Array.from(s.w),final);assert.deepEqual(s.sinks,sinks);
});

test('equal input over sealed and permeable cells changes storage, not water mass',()=>{
 const open=createState(LEVELS[4]),sealed=createState(LEVELS[5]);applyPlan(open,open.level.knownPlan);applyPlan(sealed,sealed.level.knownPlan.filter(a=>a.type!=='device'||a.key!=='unseal'));
 run(open);run(sealed);assert.deepEqual(open.initial,sealed.initial);assert.ok(open.recharged>1);assert.equal(sealed.recharged,0);assert.ok(open.sinks[0].water<sealed.sinks[0].water);assert.equal(sealed.mode,'failed');
});

test('a dry aquifer cannot supply a pump or become negative',()=>{
 const s=createState(fixture({pumpOut:[10,10]}));setDevice(s,'pump',1);run(s);assert.equal(s.aquifer.water,0);assert.equal(sum(s.w),0);
});

test('pump removes only existing groundwater and final reserve is enforced',()=>{
 const s=createState(fixture({duration:10,pumpOut:[10,10],aquifer:5,reserve:2}));setDevice(s,'pump',1);run(s);assert.equal(s.aquifer.water,0);assert.equal(s.mode,'failed');assert.match(s.reason,/עתוד/);
});

test('infiltration carries dissolved pollutant, salt and reuse provenance to groundwater',()=>{
 const s=createState(fixture({sources:[{at:[10,10],volume:1,salt:.3,pollution:.6,reuse:1,label:'test'}],permeable:[[10,10]],groundQuality:true}));setGate(s,1);run(s);
 assert.ok(s.aquifer.water>0&&s.aquifer.salt>0&&s.aquifer.pollution>0&&s.aquifer.reuse>0);assert.equal(quality(s.aquifer,'drink'),false);assert.equal(s.mode,'failed');
});

test('membrane splits finite feed into product and brine, retains all mass and spends energy',()=>{
 const s=createState(fixture({energy:1,sources:[{at:[4,4],volume:2,salt:3.5,pollution:.4,label:'feed',rate:1}],devices:[{kind:'membrane',at:[4,4],out:[12,10],brine:[20,10]}]}));setGate(s,1);setDevice(s,'membrane',true);start(s);step(s,.025);verifyLedger(s);
 const product={water:0,salt:0},brine={water:0,salt:0};for(let i=0;i<N;i++){const target=i%W<16?product:brine;target.water+=s.w[i];target.salt+=s.salt[i];}
 assert.ok(Math.abs(product.water-s.processed*.62)<1e-10);assert.ok(Math.abs(brine.water-s.processed*.38)<1e-10);assert.ok(Math.abs(product.salt+brine.salt-s.processed*3.5)<1e-10);
 assert.ok(product.salt/product.water<brine.salt/brine.water);assert.ok(Math.abs(s.energy-(1-s.processed))<1e-10);
});

test('zero-energy membrane cannot separate or create water',()=>{
 const s=createState(fixture({energy:0,sources:[{at:[4,4],volume:1,salt:3.5,label:'feed'}],devices:[{kind:'membrane',at:[4,4],out:[12,10],brine:[20,10]}]}));setDevice(s,'membrane',true);run(s);assert.equal(s.processed,0);assert.equal(s.energy,0);
});

test('wastewater treatment removes only supported pollutant into residual, preserving salt and nonpotability',()=>{
 const s=createState(fixture({sources:[{at:[4,4],volume:1,salt:.3,pollution:.8,reuse:1,label:'wastewater',rate:1}],devices:[{kind:'treatment',at:[4,4],out:[12,10]}]}));setGate(s,1);setDevice(s,'treatment',true);start(s);step(s,.025);verifyLedger(s);
 assert.ok(Math.abs(sum(s.salt)-s.processed*.3)<1e-10);assert.ok(Math.abs(s.sludge.pollution-s.processed*.8*.94)<1e-10);assert.ok(Math.abs(sum(s.pollution)-s.processed*.8*.06)<1e-10);assert.ok(Math.abs(sum(s.reuse)-s.processed)<1e-10);
 const water:Store={water:sum(s.w),salt:sum(s.salt),pollution:sum(s.pollution),reuse:sum(s.reuse)};assert.equal(quality(water,'drink'),false);assert.equal(quality(water,'farm'),true);
});

test('quantity cannot substitute for saline/polluted/reuse quality',()=>{
 for(const contaminant of [{salt:3.5,pollution:0,reuse:0},{salt:0,pollution:.5,reuse:0},{salt:0,pollution:0,reuse:1}])assert.equal(quality({water:100,salt:100*contaminant.salt,pollution:100*contaminant.pollution,reuse:100*contaminant.reuse},'drink'),false);
});

for(const id of [17,19])test(`level ${id}: wrong drinking connection explains quality before the missing farm quantity`,()=>{
 const l=LEVELS[id-1],s=createState(l);applyPlan(s,l.badPlan);run(s);assert.equal(s.mode,'failed');assert.match(s.reason,/איכות|שתייה|קולחים/);
 const drinking=l.sinks.findIndex(v=>v.kind==='drink');assert.ok(s.sinks[drinking].water>0);assert.equal(quality(s.sinks[drinking],'drink'),false);
});

test('irrigation evaporation retains dissolved material in soil and drip reduces water loss',()=>{
 const l=LEVELS[17];const drip=createState(l),waste=createState(l);applyPlan(drip,l.knownPlan);applyPlan(waste,l.badPlan);run(drip);run(waste);
 assert.ok(drip.evap.water<waste.evap.water);assert.ok(drip.sinks[0].water>waste.sinks[0].water);assert.ok(drip.soil.salt>0&&waste.soil.salt>0);assert.equal(drip.evap.salt,0);assert.equal(waste.evap.pollution,0);
});

test('smaller public timestep stays conservative and preserves ordinary drainage outcome',()=>{
 const l=LEVELS[0];const coarse=createState(l),fine=createState(l);applyPlan(coarse,l.knownPlan);applyPlan(fine,l.knownPlan);run(coarse,.1);run(fine,.0125);
 assert.equal(coarse.mode,fine.mode);assert.ok(Math.abs(coarse.sinks[0].water-fine.sinks[0].water)<.1);
});

test('last mission cannot win before its second finite pulse and full horizon',()=>{
 const s=createState(LEVELS[23]);applyPlan(s,s.level.knownPlan);start(s);step(s,25);assert.equal(s.mode,'run');assert.ok(s.sources.some((v,i)=>s.level.sources[i].delay!>25&&v.released===0));step(s,s.level.duration);assert.equal(s.time,s.level.duration);verifyLedger(s);
});

test('level 23 supports two spatially different safe excavation plans',()=>{
 const l=LEVELS[22];assert.ok(l.secondPlan);assert.notDeepEqual(l.knownPlan,l.secondPlan);for(const plan of [l.knownPlan,l.secondPlan!]){const s=createState(l);applyPlan(s,plan);run(s);assert.equal(s.mode,'won',s.reason);}
});
