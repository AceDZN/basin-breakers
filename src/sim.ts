import {W,H,N,rasterPath,type Level,type Store,type Point,type Action} from './levels';
export const empty=():Store=>({water:0,salt:0,pollution:0,reuse:0});
export const idx=(x:number,z:number)=>z*W+x;
export type SourceState=Store&{released:number};
export type State={level:Level;h:Float64Array;base:Float64Array;floor:Float64Array;w:Float64Array;salt:Float64Array;pollution:Float64Array;reuse:Float64Array;wet:Float64Array;perm:Float64Array;sources:SourceState[];sinks:Store[];aquifer:Store;sludge:Store;evap:Store;soil:Store;lost:Store;initial:Store;gate:number;devices:Record<string,number|boolean>;energy:number;earth:number;time:number;mode:'plan'|'run'|'paused'|'won'|'failed';flood:number;peak:number;recharged:number;processed:number;hinted:boolean;reason:string;edits:number;sedimentMoved:boolean;tick:number};
function add(t:Store,a:Store){t.water+=a.water;t.salt+=a.salt;t.pollution+=a.pollution;t.reuse+=a.reuse;}
function take(t:Store,q:number):Store{q=Math.max(0,Math.min(t.water,q));const f=t.water>1e-12?q/t.water:0;const a={water:q,salt:t.salt*f,pollution:t.pollution*f,reuse:t.reuse*f};t.water-=q;t.salt-=a.salt;t.pollution-=a.pollution;t.reuse-=a.reuse;return a;}
function cellTake(s:State,i:number,q:number):Store{q=Math.max(0,Math.min(s.w[i],q));const f=s.w[i]>1e-12?q/s.w[i]:0;const a={water:q,salt:s.salt[i]*f,pollution:s.pollution[i]*f,reuse:s.reuse[i]*f};s.w[i]-=q;s.salt[i]-=a.salt;s.pollution[i]-=a.pollution;s.reuse[i]-=a.reuse;return a;}
function cellAdd(s:State,p:Point,a:Store){const i=idx(...p);s.w[i]+=a.water;s.salt[i]+=a.salt;s.pollution[i]+=a.pollution;s.reuse[i]+=a.reuse;}
export function createState(level:Level):State{
 const h=new Float64Array(N),floor=new Float64Array(N);for(let z=0;z<H;z++)for(let x=0;x<W;x++){const i=idx(x,z);h[i]=6.1+Math.floor((Math.sin(x*.72)+Math.cos(z*.61))*.8)*.22;floor[i]=h[i]-2.1;}
 for(const route of level.routes){const path=rasterPath(route);const startHeight=Math.min(4.25,h[idx(...route[0])]);path.forEach(([x,z],n)=>{const i=idx(x,z);const v=startHeight-n*.095;h[i]=Math.min(h[i],v);floor[i]=Math.min(floor[i],v-.55);});}
 // Each route is an authored relief feature, not a direction field used by the solver.
 for(const p of level.cuts){const i=idx(...p);h[i]+=1.4;floor[i]=h[i]-2.1;}
 for(const p of level.hazards){const i=idx(...p);if(level.id===3||level.id===22){const neighbor=idx(p[0]+1,p[1]);h[i]=h[neighbor]+.16;}floor[i]=h[i];}
 const base=h.slice(),perm=new Float64Array(N);for(const p of level.permeable)perm[idx(...p)]=level.pumpOut?.42:.075;
 const sources=level.sources.map(v=>({water:v.volume,salt:v.volume*(v.salt||0),pollution:v.volume*(v.pollution||0),reuse:v.volume*(v.reuse||0),released:0}));
 const aquifer={water:level.aquifer,salt:0,pollution:0,reuse:0};const initial=empty();for(const r of sources)add(initial,r);add(initial,aquifer);
 return {level,h,base,floor,w:new Float64Array(N),salt:new Float64Array(N),pollution:new Float64Array(N),reuse:new Float64Array(N),wet:new Float64Array(N),perm,sources,sinks:level.sinks.map(empty),aquifer,sludge:empty(),evap:empty(),soil:empty(),lost:empty(),initial,gate:.8,devices:{...level.defaults},energy:level.energy,earth:level.budget,time:0,mode:'plan',flood:0,peak:0,recharged:0,processed:0,hinted:false,reason:'',edits:0,sedimentMoved:false,tick:0};
}
export function edit(s:State,x:number,z:number,tool:'dig'|'raise'):boolean{if(s.mode!=='plan'||x<1||x>=W-1||z<1||z>=H-1)return false;const i=idx(x,z);if(s.level.sources.some(p=>idx(...p.at)===i)||s.level.sinks.some(p=>idx(...p.at)===i)||s.level.devices.some(p=>idx(...p.at)===i))return false;const next=tool==='dig'?Math.max(s.floor[i],s.h[i]-.7):Math.min(s.base[i]+2.1,s.h[i]+.7);const cost=Math.abs(next-s.h[i]);if(cost<1e-8||s.earth+1e-8<cost)return false;s.h[i]=next;s.earth=Math.max(0,s.earth-cost);s.edits++;return true;}
export function setGate(s:State,v:number){s.gate=Math.max(0,Math.min(1,v));}
export function setDevice(s:State,key:string,value:number|boolean){if(!(key in s.devices))return false;if(key==='unseal'&&value&&!s.devices.unseal){if(s.earth<2)return false;s.earth-=2;}s.devices[key]=typeof value==='number'?Math.max(0,Math.min(1,value)):value;return true;}
export function start(s:State){if(s.mode==='plan'||s.mode==='paused')s.mode='run';else if(s.mode==='run')s.mode='paused';}
export function rewind(s:State){const fresh=createState(s.level);fresh.h.set(s.h);fresh.earth=s.earth;fresh.edits=s.edits;fresh.gate=s.gate;fresh.devices={...s.devices};fresh.hinted=s.hinted;Object.assign(s,fresh);}
export function applyPlan(s:State,actions:Action[]){for(const a of actions){if(a.type==='edit')for(let j=0;j<(a.count||1);j++)edit(s,a.x,a.z,a.tool);else if(a.type==='gate')setGate(s,a.value);else setDevice(s,a.key,a.value);}}
export function quality(v:Store,kind:string){if(v.water<=1e-8)return true;const c=v.salt/v.water,p=v.pollution/v.water,r=v.reuse/v.water;if(kind==='brine')return true;if(kind==='drink')return c<=.12&&p<=.02&&r<=.001;if(kind==='farm')return c<=.75&&p<=.16;return c<=.3&&p<=.08&&r<=.001;}
function processDevices(s:State,dt:number){for(const d of s.level.devices){if(!s.devices[d.kind])continue;const i=idx(...d.at),cost=d.kind==='membrane'?1:.22;const q=Math.min(s.w[i],dt*2,s.energy/cost);if(q<=1e-10)continue;const a=cellTake(s,i,q);s.energy=Math.max(0,s.energy-q*cost);s.processed+=q;if(d.kind==='membrane'){
 const product:Store={water:q*.62,salt:a.salt*.008,pollution:a.pollution*.62,reuse:a.reuse*.62};const brine:Store={water:q*.38,salt:a.salt-product.salt,pollution:a.pollution-product.pollution,reuse:a.reuse-product.reuse};cellAdd(s,d.out,product);cellAdd(s,s.devices.brineSafe?d.brine!:d.out,brine);
 }else{const removed=a.pollution*.94;a.pollution-=removed;s.sludge.pollution+=removed;const out=s.devices.reuseToFarm||!d.brine?d.out:d.brine;cellAdd(s,out,a);}}}
function flow(s:State,dt:number){const from:number[]=[],to:number[]=[],amount:number[]=[],out=new Float64Array(N);for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){const i=idx(x,z);for(const j of [i+1,i+W]){if(j>=N)continue;const dh=s.h[i]+s.w[i]-s.h[j]-s.w[j];const f=dh>0?i:j,t=dh>0?j:i;if(s.w[f]<=1e-12)continue;const q=Math.abs(dh)*dt*6*Math.sqrt(s.w[f]+.04);if(q>1e-12){from.push(f);to.push(t);amount.push(q);out[f]+=q;}}}
 const dw=new Float64Array(N),ds=new Float64Array(N),dp=new Float64Array(N),dr=new Float64Array(N);for(let k=0;k<from.length;k++){const f=from[k],t=to[k];const q=amount[k]*Math.min(1,s.w[f]*.85/out[f]),ratio=q/s.w[f];dw[f]-=q;dw[t]+=q;const salt=s.salt[f]*ratio,p=s.pollution[f]*ratio,r=s.reuse[f]*ratio;ds[f]-=salt;ds[t]+=salt;dp[f]-=p;dp[t]+=p;dr[f]-=r;dr[t]+=r;}for(let i=0;i<N;i++){s.w[i]=Math.max(0,s.w[i]+dw[i]);s.salt[i]=Math.max(0,s.salt[i]+ds[i]);s.pollution[i]=Math.max(0,s.pollution[i]+dp[i]);s.reuse[i]=Math.max(0,s.reuse[i]+dr[i]);s.wet[i]=Math.max(s.wet[i],Math.min(1,s.w[i]*2));}}
function substep(s:State,dt:number){s.time+=dt;s.tick++;
 s.level.sources.forEach((d,k)=>{if(s.time<(d.delay||0))return;const control=d.control?Number(s.devices[d.control]):1;const q=dt*(d.rate||2.2)*s.gate*control;const a=take(s.sources[k],q);s.sources[k].released+=a.water;cellAdd(s,d.at,a);});
 processDevices(s,dt);flow(s,dt);
 for(let i=0;i<N;i++){const rate=s.level.sealed&&!s.devices.unseal?0:s.perm[i];if(rate>0&&s.w[i]>0){const a=cellTake(s,i,Math.min(s.w[i],rate*dt));s.recharged+=a.water;add(s.aquifer,a);}}
 if(s.level.pumpOut){const a=take(s.aquifer,Number(s.devices.pump)*dt*1.8);cellAdd(s,s.level.pumpOut,a);}
 s.level.sinks.forEach((d,k)=>{const i=idx(...d.at);const q=Math.min(s.w[i],dt*(d.rate||8),Math.max(0,(d.capacity??Infinity)-s.sinks[k].water));if(q<=0)return;const a=cellTake(s,i,q);if(d.kind==='farm'){const efficiency=s.devices.drip?.92:.5;const loss=a.water*(1-efficiency);s.evap.water+=loss; // Evaporated water leaves all dissolved mass in the soil ledger.
 const fraction=loss/a.water;s.soil.salt+=a.salt*fraction;s.soil.pollution+=a.pollution*fraction;s.soil.reuse+=a.reuse*fraction;a.water-=loss;a.salt*=1-fraction;a.pollution*=1-fraction;a.reuse*=1-fraction;}add(s.sinks[k],a);});
 for(const p of s.level.hazards){const depth=s.w[idx(...p)];s.peak=Math.max(s.peak,depth);if(depth>s.level.floodLimit)s.flood+=dt*(depth-s.level.floodLimit);}
 // In the sediment mission the loose deposit is a raised bed. Excavating it restores capacity;
 // suspended-load transport is deliberately not claimed by this compact solver.
 if(s.level.sediment&&!s.sedimentMoved){const i=idx(...s.level.sediment);s.sedimentMoved=s.h[i]<s.base[i]-.9;}
 if(s.time+1e-8>=s.level.duration){s.time=s.level.duration;const r=evaluate(s);s.mode=r.ok?'won':'failed';s.reason=r.reason;}}
export function step(s:State,dt:number){if(s.mode!=='run')return;let left=Math.min(dt,s.level.duration-s.time);while(left>1e-9&&s.mode==='run'){const d=Math.min(.025,left);substep(s,d);left-=d;}}
export function evaluate(s:State):{ok:boolean;reason:string}{
 if(s.flood>.1)return{ok:false,reason:'החצר הוצפה: שיא הזרימה עלה מעל קיבולת המעבר.'};
 for(let k=0;k<s.sinks.length;k++){const d=s.level.sinks[k],v=s.sinks[k];if(!quality(v,d.kind))return{ok:false,reason:d.kind==='drink'?'המכל קיבל מים באיכות שאינה מתאימה לשתייה: בדקו מלח, מזהם וקולחים.':'איכות המים אינה מתאימה ליעד. בדקו את מקור הזרם.'};}
 for(let k=0;k<s.sinks.length;k++){const d=s.level.sinks[k],v=s.sinks[k];if(v.water+1e-6<d.target)return{ok:false,reason:`חסרים מים ביעד: ${d.label}. בדקו את הספים, קצב השחרור והחלחול.`};}
 if(s.aquifer.water+1e-6<s.level.reserve)return{ok:false,reason:'המשאבה משכה יותר מדי: עתודת מי התהום נמוכה מהנדרש.'};
 if(s.recharged+1e-6<s.level.recharge)return{ok:false,reason:'לא חלחלו מספיק מים. בדקו את הקרקע הנקבובית ואת הכיסוי האטום.'};
 if(s.level.groundQuality&&!quality(s.aquifer,'drink'))return{ok:false,reason:'הזיהום חלחל למי התהום. עצרו את הדליפה לפני השחרור.'};
 return {ok:true,reason:s.level.lesson};}
export function accounting(s:State){const total=empty();for(let i=0;i<N;i++)add(total,{water:s.w[i],salt:s.salt[i],pollution:s.pollution[i],reuse:s.reuse[i]});for(const v of [...s.sources,...s.sinks,s.aquifer,s.sludge,s.evap,s.soil,s.lost])add(total,v);return{initial:{...s.initial},total,error:{water:total.water-s.initial.water,salt:total.salt-s.initial.salt,pollution:total.pollution-s.initial.pollution,reuse:total.reuse-s.initial.reuse}};}
