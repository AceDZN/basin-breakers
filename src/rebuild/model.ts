import {LEVELS,W,H,rasterPath,type Level,type Point,type Action} from '../levels';
import {createState,edit,setGate,setDevice,rewind,start,step,idx,type State,quality} from '../sim';
export const CAMPAIGN:Level[]=LEVELS.map(l=>structuredClone(l));
// Rescue openings: a real threatened lower branch and a lower-capacity bypass.
CAMPAIGN[0]=structuredClone(LEVELS[1]);CAMPAIGN[0].id=1;CAMPAIGN[0].name='הצילו את הבתים';CAMPAIGN[0].cuts=[[11,8]];CAMPAIGN[0].berms=[];CAMPAIGN[0].knownPlan=[{type:'edit',x:11,z:8,tool:'dig',count:2}];CAMPAIGN[0].badPlan=[];
CAMPAIGN[1]=structuredClone(LEVELS[3]);CAMPAIGN[1].id=2;CAMPAIGN[1].name='הגל מהצד השני';CAMPAIGN[1].routes.push([[23,8],[23,16]]);CAMPAIGN[1].hazards=[[23,16]];CAMPAIGN[1].badPlan=[];
CAMPAIGN[3]=structuredClone(LEVELS[7]);CAMPAIGN[3].id=4;CAMPAIGN[3].name='גל ועוד גל';CAMPAIGN[3].routes.push([[6,8],[6,15]]);CAMPAIGN[3].hazards=[[6,15]];
CAMPAIGN[0].sources[0].volume=80;CAMPAIGN[1].sources[0].volume=80;CAMPAIGN[0].duration=100;CAMPAIGN[1].duration=110;CAMPAIGN[2].duration=150;CAMPAIGN[3].duration=220;for(const source of CAMPAIGN[3].sources)source.volume*=2;
for(let i=0;i<4;i++){const l=CAMPAIGN[i];l.budget=40;l.sinks[0].kind='river';l.sinks[0].label='אגן ההשהיה';l.sinks[0].target=i===2?16:i===3?44:64;l.sinks[0].capacity=l.sources.reduce((v,r)=>v+r.volume,0)+2;l.floodLimit=i===2?.68:.18;}
CAMPAIGN[0].brief='פתחו תעלת מעקף. הביאו את כל הגל לאגן ושמרו על הבתים יבשים.';
CAMPAIGN[1].brief='הגל מגיע מהצד השני. פתחו שני מעברים והגנו על הבתים.';
CAMPAIGN[2].brief='המעבר צר. נסו זרם עדין כדי שהגל לא ייכנס לחצר.';
CAMPAIGN[3].brief='שני גלים בדרך. פתחו מוצא בטוח לשניהם.';
for(const l of CAMPAIGN)for(const d of l.sinks)d.capacity??=l.sources.reduce((v,r)=>v+r.volume,0)+l.aquifer+2;
for(const l of CAMPAIGN.slice(0,4))for(const action of l.knownPlan)if(action.type==='edit'&&action.tool==='dig')action.count=4;
export const WAVE_SECONDS=8;
export type Patch={at:Point;kind:'sand'|'asphalt';label:string};
export type PlanSnapshot={h:Float64Array;earth:number;devices:Record<string,number|boolean>;gate:number};
export class ToyModel{
 state:State;history:PlanSnapshot[]=[];level=1;changes=0;attempts=0;lastAction='';
 constructor(n=1){this.level=n;this.state=this.makeState(n);}
 patchCells(p:Point):Point[]{if(this.level>4)return[p];for(const route of CAMPAIGN[this.level-1].routes){const path=rasterPath(route),k=path.findIndex(q=>q[0]===p[0]&&q[1]===p[1]);if(k>=0){const before=path[Math.max(0,k-1)],after=path[Math.min(path.length-1,k+1)],horizontal=Math.abs(after[0]-before[0])>=Math.abs(after[1]-before[1]);return[-1,0,1].map(d=>horizontal?[p[0],p[1]+d]:[p[0]+d,p[1]]) as Point[];}}return[p];}
 makeState(n:number){
  const s=createState(CAMPAIGN[n-1]);
  if(n<=4){
   const original=s.h.slice(),cutBeds=new Map(s.level.cuts.map(p=>[idx(...p),original[idx(...p)]-1.4]));
   for(const route of s.level.routes)for(const p of rasterPath(route)){const bed=cutBeds.get(idx(...p))??original[idx(...p)];for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const x=p[0]+dx,z=p[1]+dz;if(x<1||x>=W-1||z<1||z>=H-1)continue;const j=idx(x,z);s.h[j]=Math.min(s.h[j],bed+(Math.abs(dx)+Math.abs(dz))*.08);}}
   s.base.set(s.h);for(let i=0;i<s.floor.length;i++)s.floor[i]=s.h[i]-2.1;
   for(const p of s.level.cuts)for(const q of this.patchCells(p)){const j=idx(...q),bed=s.h[j];s.h[j]=bed+2.8;s.base[j]=bed+2.8;s.floor[j]=bed;}
   for(const sink of s.level.sinks){const floor=s.h[idx(...sink.at)];for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){if(Math.hypot(dx,dz)>2)continue;const x=sink.at[0]+dx,z=sink.at[1]+dz;if(x<1||x>=W-1||z<1||z>=H-1)continue;const j=idx(x,z);s.h[j]=floor;s.base[j]=floor;s.floor[j]=floor;}}
  }
  if(n===1||n===2||n===4){const inlet:Point=n===2?[23,9]:[6,9];for(let dx=-1;dx<=1;dx++){const i=idx(inlet[0]+dx,inlet[1]);s.h[i]+=2.1;s.base[i]+=2.1;s.floor[i]+=2.1;}const center=s.level.hazards[0],floor=s.h[idx(...center)];for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++){if(Math.hypot(dx,dz)>4)continue;const j=idx(center[0]+dx,center[1]+dz);s.h[j]=floor;s.base[j]=floor;s.floor[j]=floor;}}
  return s;
 }
 load(n:number){this.level=n;this.state=this.makeState(n);this.history=[];this.changes=0;this.attempts=0;this.lastAction='';}
 snapshot(){this.history.push({h:this.state.h.slice(),earth:this.state.earth,gate:this.state.gate,devices:{...this.state.devices}});if(this.history.length>30)this.history.shift();}
 patches():Patch[]{return this.state.level.cuts.map(p=>({at:p,kind:'sand',label:'חול רך — גררו לפתיחת מעבר'}));}
 carve(p:Point){const s=this.state;if(s.mode!=='plan')return false;const required=this.level<=4?2.8:1.4,cells=this.patchCells(p);const cost=cells.reduce((sum,q)=>{const i=idx(...q);return sum+Math.max(0,required-(s.base[i]-s.h[i]));},0);if(cost<1e-7||s.earth+1e-7<cost)return false;this.snapshot();let ok=false;for(const q of cells)for(let k=0;k<Math.round(required/.7);k++){const i=idx(...q);if(s.base[i]-s.h[i]<required-1e-7)ok=edit(s,...q,'dig')||ok;}if(!ok)this.history.pop();else{this.changes++;this.lastAction='נפתח מעבר רחב בחול';}return ok;}
 device(key:string,value:number|boolean){if(this.state.mode!=='plan')return false;this.snapshot();const ok=setDevice(this.state,key,value);if(!ok)this.history.pop();else{this.changes++;this.lastAction='המכשיר השתנה';}return ok;}
 gate(value:number){if(this.state.mode!=='plan')return false;this.snapshot();setGate(this.state,value);this.changes++;return true;}
 undo(){if(!this.history.length)return false;const p=this.history.pop()!,hinted=this.state.hinted;this.state=this.makeState(this.level);this.state.hinted=hinted;this.state.h.set(p.h);this.state.earth=p.earth;this.state.gate=p.gate;this.state.devices={...p.devices};this.lastAction='הפעולה בוטלה והמים חזרו למאגר';return true;}
 retry(undoLast=false){if(undoLast&&this.history.length)this.undo();else{const old=this.state,fresh=this.makeState(this.level);fresh.h.set(old.h);fresh.earth=old.earth;fresh.edits=old.edits;fresh.gate=old.gate;fresh.devices={...old.devices};fresh.hinted=old.hinted;this.state=fresh;}this.lastAction='אפשר לשנות את התעלה ולנסות שוב';}
 run(){if(this.state.mode==='failed'||this.state.mode==='won')this.retry();this.attempts++;start(this.state);}
 advance(seconds:number){const s=this.state;if(s.mode!=='run')return;step(s,seconds*s.level.duration/WAVE_SECONDS);if((s.mode as State['mode'])==='won'&&this.level<=4&&s.sources.reduce((v,r)=>v+r.water,0)>.05){s.mode='failed';s.reason='נותרו מים מאחורי השער. העבירו את כל הגל בבטחה.';}if(s.flood>.1&&s.mode==='run'){s.mode='failed';s.reason='המים נשפכו לחצר הנמוכה. נסו מעבר אחר.';} }
 canCarve(p:Point){return this.patches().some(v=>v.at[0]===p[0]&&v.at[1]===p[1])&&this.state.base[idx(...p)]-this.state.h[idx(...p)]<(this.level<=4?2.799:1.399);}
 goalProgress(k:number){const d=this.state.level.sinks[k],v=this.state.sinks[k];return quality(v,d.kind)?Math.min(1,v.water/Math.max(.1,d.target)):0;}
}
export function executeToyPlan(model:ToyModel,plan:Action[]){for(const a of plan){if(a.type==='edit'){if(a.tool==='dig')model.carve([a.x,a.z]);else for(let j=0;j<(a.count||1);j++)edit(model.state,a.x,a.z,a.tool);}else if(a.type==='gate')model.gate(a.value);else model.device(a.key,a.value);}}
export {W,H,idx,quality};
