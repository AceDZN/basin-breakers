/** Internal QA constructions. Never import into the product or show as solution cues. */
import {FreeformModel,W} from '../src/freeform/model.ts';
import type {Point} from '../src/levels.ts';
export const EAST_PATH:Point[]=[[14,7],[19,10],[23,13],[24,18],[23,20]];
export const WEST_PATH:Point[]=[[14,7],[9,10],[5,13],[4,18],[5,20]];
export const DEFLECTORS:[number,number,number][]=[[14,9,0],[15,14,0]];
export function construct(m:FreeformModel,side:'east'|'west',jitter=0){
 const path=(side==='east'?EAST_PATH:WEST_PATH).map(([x,z],k)=>[x+(k?jitter:0),z] as Point);
 const actions=[m.commitDig(path),...DEFLECTORS.map(w=>m.placeWall(...w))];
 if(actions.some(ok=>!ok))throw new Error('QA construction rejected by public API');
 return m;
}
export function measure(m:FreeformModel){
 const flux={west:0,center:0,east:0};
 m.state.onTransfer=(from,to,amount)=>{
  let x=-1,sign=0;
  if(to-from===W&&Math.floor(from/W)===12){x=from%W;sign=1;}
  else if(from-to===W&&Math.floor(to/W)===12){x=to%W;sign=-1;}
  if(sign)flux[x<12?'west':x>16?'east':'center']+=amount*sign;
 };
 m.run();m.advance(8,false);
 return{mode:m.state.mode,released:m.released,received:m.delivered,exposure:[...m.homeExposure],peaks:[...m.homePeaks],earth:m.earthUsed,excavatedCells:m.changedCells,walls:m.walls.map(w=>({...w})),flux,reason:m.state.reason};
}
