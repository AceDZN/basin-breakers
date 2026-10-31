export type MissionRecord={completed:true;bestEarth?:number;bestWalls?:number;received?:number;infiltrated?:number;attempts:number};
export type CampaignProgress={version:1;current:number;missions:Record<number,MissionRecord>};
export const CAMPAIGN_KEY='basin-freeform-campaign-v1';
export const planKey=(n:number)=>`basin-freeform-plan:${n}`;
export function readProgress(raw:string|null):CampaignProgress{
 const progress:CampaignProgress={version:1,current:1,missions:{}};
 if(!raw)return progress;
 try{const data=JSON.parse(raw);if(data.version!==1)return progress;if(Number.isInteger(data.current)&&data.current>=1&&data.current<=24)progress.current=data.current;
  for(let n=1;n<=24;n++){const v=data.missions?.[n];if(!v||v.completed!==true)continue;const r:MissionRecord={completed:true,attempts:Number.isSafeInteger(v.attempts)&&v.attempts>=0?v.attempts:0};for(const k of ['bestEarth','bestWalls','received','infiltrated']as const)if(typeof v[k]==='number'&&Number.isFinite(v[k])&&v[k]>=0)r[k]=v[k];progress.missions[n]=r;}
 }catch{/* A malformed local record must not prevent play. */}return progress;
}
export function recordRescue(progress:CampaignProgress,n:number,result:{earth:number;walls:number;received:number;infiltrated:number}){
 const previous=progress.missions[n];progress.missions[n]={completed:true,bestEarth:Math.min(previous?.bestEarth??Infinity,result.earth),bestWalls:Math.min(previous?.bestWalls??Infinity,result.walls),received:result.received,infiltrated:result.infiltrated,attempts:(previous?.attempts??0)+1};
}
