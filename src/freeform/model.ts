import {W,H,N,type Level,type Point} from '../levels';
import {createState,step,idx,accounting,type State} from '../sim';

export {W,H,idx};
export const SOURCE:Point=[14,3];
export const HOMES:Point[]=[[10,16],[15,17],[20,15]];
export const DIG_RADIUS=1.25,DIG_DEPTH=1.4,WALL_LENGTH=4,WALL_WIDTH=1.2,WALL_HEIGHT=1.3;
export const EARTH_BUDGET=155,WAVE_SECONDS=8,SAFE_TARGET=64;
export type Wall={id:number;x:number;z:number;angle:number};
export type Construction={bed:Float64Array;walls:Wall[]};
export type DigPreview={cost:number;cells:number;ok:boolean;reason:string};
const cloneWalls=(walls:Wall[])=>walls.map(w=>({...w}));
export function segmentDistance(x:number,z:number,a:Point,b:Point){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function wallEnds(w:Wall):[Point,Point]{const dx=Math.cos(w.angle)*WALL_LENGTH/2,dz=Math.sin(w.angle)*WALL_LENGTH/2;return[[w.x-dx,w.z-dz],[w.x+dx,w.z+dz]];}
export function wallCells(w:Wall){const [a,b]=wallEnds(w),cells:number[]=[];for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(segmentDistance(x,z,a,b)<=WALL_WIDTH/2+.15)cells.push(idx(x,z));return cells;}
function makeLevel():Level{return{id:101,name:'הצילו את הכפר',act:'תכנית משלכם',brief:'חפרו תעלות והציבו סוללות כדי להסיט את השיטפון מהבתים אל הים.',hint:'',lesson:'הבתים בטוחים והגל הגיע לים.',duration:100,budget:EARTH_BUDGET,energy:0,routes:[],cuts:[],berms:[],sources:[{at:[14,6],volume:80,rate:4,label:'גל השיטפון'}],sinks:Array.from({length:27},(_,i)=>({at:[i+1,21] as Point,kind:'river' as const,target:0,rate:12,label:'הים'})),hazards:[],permeable:[],aquifer:0,reserve:0,recharge:0,devices:[],defaults:{},knownPlan:[],badPlan:[],floodLimit:.22};}

/** Geometry drives the solver. No named route, hit spot or completed-stroke flag exists. */
export class FreeformModel{
 state:State;level=101;baseH=new Float64Array(N);planH=new Float64Array(N);bed=new Float64Array(N);editable=new Uint8Array(N);previewH:Float64Array|null=null;
 walls:Wall[]=[];history:Construction[]=[];homeFootprints:number[][]=[];homeExposure=[0,0,0];homePeaks=[0,0,0];attempts=0;nextId=1;lastAction='';
 constructor(){
  const l=makeLevel();this.state=createState(l);
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){
   const i=idx(x,z),side=Math.abs(x-14)/14;
   let height=5.8-z*.205+side*side*1.4-.32*Math.exp(-(((x-14)/4.5)**2));
   if(x<=2||x>=26)height+=1.9;if(z<=1)height+=2;
   this.baseH[i]=height;this.editable[i]=x>=3&&x<=25&&z>=7&&z<=20?1:0;
  }
  // An enclosed, fixed reservoir discharges at its visible lower outlet.
  for(let z=0;z<=6;z++)for(let x=10;x<=18;x++)if(Math.hypot(x-SOURCE[0],z-SOURCE[1])<3.6){this.baseH[idx(x,z)]=4.72;this.editable[idx(x,z)]=0;}
  for(const [hx,hz]of HOMES){const cells:number[]=[];const level=this.baseH[idx(hx,hz)];for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const i=idx(hx+dx,hz+dz);cells.push(i);this.baseH[i]=level;this.editable[i]=0;}this.homeFootprints.push(cells);}
  this.bed.set(this.baseH);this.planH.set(this.baseH);this.resetPulse();
 }
 patches(){return[];}
 goalProgress(_k:number){return 0;}
 get earthUsed(){let v=0;for(let i=0;i<N;i++)v+=this.baseH[i]-this.bed[i];return v;}
 get earthLeft(){return Math.max(0,EARTH_BUDGET-this.earthUsed);}
 get delivered(){return this.state.sinks.reduce((a,v)=>a+v.water,0);}
 get released(){return this.state.sources[0].released;}
 get homeSafe(){return this.homeExposure.map(e=>e<=.12);}
 get changedCells(){let n=0;for(let i=0;i<N;i++)if(this.bed[i]<this.baseH[i]-.01)n++;return n;}
 snapshot():Construction{return{bed:this.bed.slice(),walls:cloneWalls(this.walls)};}
 restoreConstruction(value:unknown):boolean{
  if(!value||typeof value!=='object')return false;
  const candidate=value as {bed?:unknown;walls?:unknown;history?:unknown};
  if(!Array.isArray(candidate.bed)||candidate.bed.length!==N||!Array.isArray(candidate.walls)||candidate.walls.length>3)return false;
  const bed=new Float64Array(N);let cost=0;
  for(let i=0;i<N;i++){
   const v=candidate.bed[i];if(typeof v!=='number'||!Number.isFinite(v)||v<this.baseH[i]-DIG_DEPTH-1e-8||v>this.baseH[i]+1e-8)return false;
   if(!this.editable[i]&&Math.abs(v-this.baseH[i])>1e-8)return false;
   bed[i]=this.editable[i]?Math.max(this.baseH[i]-DIG_DEPTH,Math.min(this.baseH[i],v)):this.baseH[i];cost+=this.baseH[i]-bed[i];
  }
  if(cost>EARTH_BUDGET+1e-7)return false;
  const walls:Wall[]=[],occupied=new Set<number>(),ids=new Set<number>();
  for(const raw of candidate.walls){
   if(!raw||typeof raw!=='object')return false;const w=raw as Wall;
   if(!Number.isSafeInteger(w.id)||w.id<1||w.id>=Number.MAX_SAFE_INTEGER-3||ids.has(w.id)||![w.x,w.z,w.angle].every(v=>typeof v==='number'&&Number.isFinite(v)))return false;
   const [a,b]=wallEnds(w),cells=wallCells(w);
   if(a[0]<3||a[0]>25||b[0]<3||b[0]>25||a[1]<7||a[1]>20||b[1]<7||b[1]>20||!cells.length||cells.some(i=>!this.editable[i]||occupied.has(i)))return false;
   ids.add(w.id);for(const i of cells)occupied.add(i);walls.push({id:w.id,x:w.x,z:w.z,angle:w.angle});
  }
  const history:Construction[]=[];
  if(candidate.history!==undefined){
   if(!Array.isArray(candidate.history)||candidate.history.length>40)return false;
   // Reuse the complete geometry validator. Nested histories are deliberately
   // excluded: these entries are construction snapshots, not recursive saves.
   const verifier=new FreeformModel();
   for(const raw of candidate.history){if(!raw||typeof raw!=='object')return false;const prior=raw as {bed?:unknown;walls?:unknown};if(!verifier.restoreConstruction({bed:prior.bed,walls:prior.walls}))return false;history.push(verifier.snapshot());}
  }
  this.bed.set(bed);this.walls=walls;this.history=history;this.nextId=Math.max(0,...ids,...history.flatMap(p=>p.walls.map(w=>w.id)))+1;this.resetPulse();this.lastAction='התכנית השמורה שוחזרה. הגל מוכן לבדיקה.';return true;
 }
 ensurePlanning(){if(this.state.mode==='run'||this.state.mode==='paused')return false;if(this.state.mode!=='plan')this.resetPulse();return true;}
 rebuildGeometry(){this.planH.set(this.bed);for(const w of this.walls){const cells=wallCells(w);const crest=Math.max(...cells.map(i=>this.bed[i]))+WALL_HEIGHT;for(const i of cells)this.planH[i]=Math.max(this.planH[i],crest);}this.state.h.set(this.planH);this.state.earth=this.earthLeft;}
 resetPulse(){const observer=this.state?.onTransfer;this.state=createState(makeLevel());this.state.onTransfer=observer;this.state.base.set(this.baseH);for(let i=0;i<N;i++)this.state.floor[i]=this.baseH[i]-DIG_DEPTH;this.homeExposure=[0,0,0];this.homePeaks=[0,0,0];this.previewH=null;this.rebuildGeometry();this.state.gate=1;}
 retry(){this.resetPulse();this.lastAction='הגל מוכן שוב. התכנית נשמרה.';}
 undo(){const prev=this.history.pop();if(prev){this.bed.set(prev.bed);this.walls=cloneWalls(prev.walls);}this.resetPulse();this.lastAction=prev?'הפעולה האחרונה בוטלה.':'אין פעולה קודמת לביטול. אפשר למלא אדמה או לנקות את השטח.';return!!prev;}
 clear(){if(!this.ensurePlanning())return;this.history.push(this.snapshot());this.bed.set(this.baseH);this.walls=[];this.resetPulse();this.lastAction='שטח נקי לתכנית חדשה.';}
 digPreview(points:Point[]):DigPreview{
  const next=this.bed.slice(),occupied=new Set(this.walls.flatMap(wallCells));let cells=0,cost=0;
  if(!points.length){this.previewH=null;return{cost:0,cells:0,ok:false,reason:''};}
  const segments=points.length>1?points.slice(1).map((p,k)=>[points[k],p] as [Point,Point]):[[points[0],points[0]] as [Point,Point]];
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){const i=idx(x,z);if(!this.editable[i]||occupied.has(i))continue;if(!segments.some(([a,b])=>segmentDistance(x,z,a,b)<=DIG_RADIUS))continue;const target=this.baseH[i]-DIG_DEPTH;if(next[i]>target+.001){cost+=next[i]-target;next[i]=target;cells++;}}
  const ok=cells>0&&cost<=this.earthLeft+1e-7;this.previewH=ok?next:null;
  // Keep existing levees at exactly their committed crest in the visual preview.
  if(this.previewH)for(let i=0;i<N;i++)if(this.planH[i]>this.bed[i]+.01)this.previewH[i]=this.planH[i];
  return{cost,cells,ok,reason:!cells?'כאן אין אדמה פנויה לחפירה.':!ok?'אין מספיק חפירה. קצרו את התעלה או בטלו פעולה.':''};
 }
 commitDig(points:Point[]){if(!this.ensurePlanning())return false;const p=this.digPreview(points);if(!p.ok){this.lastAction=p.reason;this.previewH=null;return false;}this.history.push(this.snapshot());const h=this.previewH!;for(let i=0;i<N;i++)this.bed[i]=Math.min(this.bed[i],h[i]);this.previewH=null;this.rebuildGeometry();this.lastAction='התעלה נחפרה.';return true;}
 // cost is the positive amount of earth returned to the digging budget.
 fillPreview(points:Point[]):DigPreview{
  const next=this.bed.slice(),occupied=new Set(this.walls.flatMap(wallCells));let cells=0,cost=0;
  if(!points.length||points.some(p=>!p||!Number.isFinite(p[0])||!Number.isFinite(p[1]))){this.previewH=null;return{cost:0,cells:0,ok:false,reason:''};}
  const segments=points.length>1?points.slice(1).map((p,k)=>[points[k],p] as [Point,Point]):[[points[0],points[0]] as [Point,Point]];
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){const i=idx(x,z);if(!this.editable[i]||occupied.has(i))continue;if(!segments.some(([a,b])=>segmentDistance(x,z,a,b)<=DIG_RADIUS))continue;const refund=this.baseH[i]-next[i];if(refund>1e-8){cost+=refund;next[i]=this.baseH[i];cells++;}}
  const ok=cells>0;this.previewH=ok?next:null;
  if(this.previewH)for(let i=0;i<N;i++)if(this.planH[i]>this.bed[i]+.01)this.previewH[i]=this.planH[i];
  return{cost,cells,ok,reason:ok?'':'כאן אין תעלה למילוי. הזיזו סוללה כדי למלא מתחתיה.'};
 }
 commitFill(points:Point[]){if(!this.ensurePlanning())return false;const p=this.fillPreview(points);if(!p.ok){this.lastAction=p.reason;this.previewH=null;return false;}this.history.push(this.snapshot());const h=this.previewH!,occupied=new Set(this.walls.flatMap(wallCells));for(let i=0;i<N;i++)if(this.editable[i]&&!occupied.has(i))this.bed[i]=Math.min(this.baseH[i],Math.max(this.bed[i],h[i]));this.previewH=null;this.rebuildGeometry();this.lastAction='האדמה הוחזרה והחפירה פנויה שוב.';return true;}
 canPlaceWall(w:Wall,ignoreId?:number){const cells=wallCells(w),[a,b]=wallEnds(w);if(a[0]<3||a[0]>25||b[0]<3||b[0]>25||a[1]<7||a[1]>20||b[1]<7||b[1]>20)return false;if(!cells.length||cells.some(i=>!this.editable[i]))return false;const occupied=new Set(this.walls.filter(v=>v.id!==ignoreId).flatMap(wallCells));return!cells.some(i=>occupied.has(i));}
 placeWall(x:number,z:number,angle:number,moveId?:number){if(moveId!==undefined&&!this.walls.some(w=>w.id===moveId)){this.lastAction='הסוללה אינה נמצאת בשטח.';return false;}if(!this.ensurePlanning())return false;const w={id:moveId??this.nextId,x,z,angle};if((moveId===undefined&&this.walls.length>=3)||!this.canPlaceWall(w,moveId)){this.lastAction='הסוללה צריכה אדמה פנויה, רחוק מהבתים ומהמאגר.';return false;}this.history.push(this.snapshot());if(moveId===undefined){this.nextId++;this.walls.push(w);}else this.walls=this.walls.map(v=>v.id===moveId?w:v);this.resetPulse();this.lastAction='הסוללה הוצבה.';return true;}
 removeWall(id:number){if(!this.ensurePlanning()||!this.walls.some(w=>w.id===id))return false;this.history.push(this.snapshot());this.walls=this.walls.filter(w=>w.id!==id);this.resetPulse();this.lastAction='הסוללה חזרה למגש.';return true;}
 wallAt(p:Point){return this.walls.find(w=>{const[a,b]=wallEnds(w);return segmentDistance(p[0],p[1],a,b)<1;});}
 run(){if(this.state.mode==='run'||this.state.mode==='paused')return;this.resetPulse();this.attempts++;this.state.mode='run';this.lastAction='';}
 // Show the first surge at 5 model seconds/real second (25 over 5s),
 // then resolve the remaining 75 model seconds over 3s. Physics steps stay bounded.
 advance(realSeconds:number,stopOnFlood=true){if(this.state.mode!=='run')return;let remainingReal=Math.max(0,realSeconds);while(remainingReal>1e-10&&this.state.mode==='run'){const slow=this.state.time<25-1e-8,rate=slow?5:25;const dt=Math.min(.05,remainingReal*rate,this.state.level.duration-this.state.time,slow?25-this.state.time:Infinity);if(dt<=1e-10)break;step(this.state,dt);remainingReal=Math.max(0,remainingReal-dt/rate);for(let k=0;k<3;k++){const depth=Math.max(...this.homeFootprints[k].map(i=>this.state.w[i]));this.homePeaks[k]=Math.max(this.homePeaks[k],depth);this.homeExposure[k]+=dt*Math.max(0,depth-.22);}this.state.flood=Math.max(...this.homeExposure);this.state.peak=Math.max(...this.homePeaks);if(stopOnFlood&&this.state.flood>.12&&this.state.time>=10-1e-8){this.state.mode='failed';this.state.reason='המים נכנסו לחצר. שנו את התכנית ונסו שוב.';}else if(this.state.time>=this.state.level.duration-1e-7)this.finish();}}
 finish(){const safe=this.homeSafe.every(Boolean),released=this.released>=79.999,received=this.delivered>=SAFE_TARGET;this.state.mode=safe&&released&&received?'won':'failed';this.state.reason=!safe?'המים נכנסו לחצר. שנו את התכנית ונסו שוב.':!released||!received?'הגל נעצר בשטח. צריך לאפשר למים להגיע לים.':'כל שלושת הבתים בטוחים!';}
 text(){return{mode:this.state.mode,coordinates:'grid x:0..28 left→right; z:0..22 uphill→coast',source:{at:SOURCE,outlet:this.state.level.sources[0].at,remaining:this.state.sources[0].water,released:this.released},homes:HOMES.map((at,k)=>({at,safe:this.homeSafe[k],peak:this.homePeaks[k],exposure:this.homeExposure[k]})),safeReceived:this.delivered,target:SAFE_TARGET,time:this.state.time,duration:this.state.level.duration,earthLeft:this.earthLeft,earthBudget:EARTH_BUDGET,excavatedCells:this.changedCells,walls:this.walls,wallStock:3-this.walls.length,toolDepth:DIG_DEPTH,toolRadius:DIG_RADIUS,constructionHistory:this.history.length,reason:this.state.reason,conservation:accounting(this.state).error};}
}
