import '@fontsource/heebo/400.css';
import '@fontsource/heebo/700.css';
import '@fontsource/heebo/900.css';
import './campaign-style.css';
import {FreeformModel,type Wall} from './model';
import {FreeformScene} from './campaign-scene';
import {FREEFORM_LEVELS} from './campaign';
import {CAMPAIGN_KEY,planKey,readProgress,recordRescue} from './progress';
import type {Point} from '../levels';
import {initHost,parseLevelParam,postToHost} from '../host';

initHost('basin-breakers');

const icons={map:'<path d="M3 3h8v8H3zM17 3h8v8h-8zM3 17h8v8H3zM17 17h8v8h-8z"/>',fill:'<path d="M3 22h22M6 18h16M9 14h10M14 2v9m-4-4 4 4 4-4"/>',shovel:'<path d="m8 17 9-9m-2-4 5 5 3-3-5-5-3 3ZM8 13l5 5-4 4c-2 2-5 2-7 1-1-2-1-5 1-7l5-3Z"/>',wall:'<path d="M2 10h20v12H2zM2 16h20M8 10v6m8 0v6M16 10v6M8 16v6"/>',undo:'<path d="m8 5-5 5 5 5M4 10h10a7 7 0 0 1 0 14"/>',play:'<path d="m8 4 15 10L8 24Z"/>',rotate:'<path d="M21 10a9 9 0 1 0 0 8M16 10h6V4"/>',sound:'<path d="m3 10 5-1 6-5v20l-6-5-5-1ZM19 8q7 6 0 12"/>',home:'<path d="m2 12 12-10 12 10M5 11v14h18V11M11 25v-8h6v8"/>',pause:'<path d="M8 5v18M19 5v18"/>',retry:'<path d="M22 12A10 10 0 1 0 22 21M16 12h7V5"/>',trash:'<path d="M7 8v15h14V8M4 7h20M11 3h6M11 11v8m6-8v8"/>'};
const svg=(key:keyof typeof icons)=>`<svg viewBox="0 0 28 28" aria-hidden="true">${icons[key]}</svg>`;
const $=(id:string)=>document.getElementById(id)!;
const campaign=readProgress(localStorage.getItem(CAMPAIGN_KEY));
const legacyWon=!localStorage.getItem(CAMPAIGN_KEY)&&Number(localStorage.getItem('basin-freeform-rescues')||0)>0;
if(legacyWon)campaign.missions[1]={completed:true,attempts:1};
// ?level=N (the workbook host's lesson link) opens that authored map directly.
const deepLevel=parseLevelParam(location.search,FREEFORM_LEVELS.length);if(deepLevel!==null)campaign.current=deepLevel+1;
const model=new FreeformModel(campaign.current);let scene:FreeformScene;
let resumedWin=false,mapOpen=false,oldView='';
let hostReady=false,hostStartedAt=0;
function hostLevelStart(){hostStartedAt=performance.now();if(hostReady)postToHost({type:'level-start',level:model.level});}
function unpackSnapshot(value:unknown){
 if(!value||typeof value!=='object')return null;const raw=value as {bed?:unknown;changes?:unknown;walls?:unknown};
 if(Array.isArray(raw.bed))return{bed:raw.bed,walls:raw.walls};
 if(!Array.isArray(raw.changes)||raw.changes.length>model.baseH.length)return null;
 const bed=Array.from(model.baseH),seen=new Set<number>();for(const pair of raw.changes){if(!Array.isArray(pair)||pair.length!==2||!Number.isInteger(pair[0])||pair[0]<0||pair[0]>=bed.length||seen.has(pair[0])||typeof pair[1]!=='number'||!Number.isFinite(pair[1]))return null;seen.add(pair[0]);bed[pair[0]]=pair[1];}return{bed,walls:raw.walls};
}
function packSnapshot(snapshot:{bed:ArrayLike<number>;walls:Wall[]}){const changes:[number,number][]=[];for(let i=0;i<model.baseH.length;i++)if(Math.abs(snapshot.bed[i]-model.baseH[i])>1e-10)changes.push([i,snapshot.bed[i]]);return{changes,walls:snapshot.walls};}
function restoreSaved(n:number){
 resumedWin=false;const raw=localStorage.getItem(planKey(n))||(n===1?localStorage.getItem('basin-freeform-plan'):null);if(!raw)return;
 try{const data=JSON.parse(raw),snapshot=unpackSnapshot(data),history=Array.isArray(data.history)?data.history.map(unpackSnapshot):undefined;if(snapshot&&(data.level===undefined||data.level===n)&&model.restoreConstruction({...snapshot,history}))resumedWin=!!campaign.missions[n]?.completed&&(data.view==='won'||(n===1&&legacyWon));}catch{/* Keep malformed saves from blocking the level. */}
}
restoreSaved(model.level);
function saveCampaign(){campaign.current=model.level;try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(campaign));}catch{/* Storage failure never blocks controls. */}}
function savePlan(view:'plan'|'won'=model.state.mode==='won'||resumedWin?'won':'plan'){
 const snapshot={level:model.level,view,...packSnapshot({bed:model.bed,walls:model.walls}),history:model.history.slice(-32).map(packSnapshot)};
 try{localStorage.setItem(planKey(model.level),JSON.stringify(snapshot));}catch{
  // Keep the current construction even if an old origin-wide quota is full.
  try{localStorage.setItem(planKey(model.level),JSON.stringify({...snapshot,history:[]}));}catch{/* The live model and Fill/Undo still work. */}
 }saveCampaign();
}

let tool:'dig'|'fill'|'wall'='dig',angle=0,movingId:number|undefined,dragging=false,stroke:Point[]=[],pointer:Point|null=null;
let preview:ReturnType<FreeformModel['digPreview']>|null=null,helpOpen=false,muted=localStorage.getItem('basin-freeform-muted')!=='false',oldMode='',noticeTimer=0;
let audio:AudioContext|null=null;
$('app').innerHTML=`<div id="world"></div>
<header><div class="identity"><small>BASIN BREAKERS</small><h1>פורצי האגן</h1><p class="level-meta"><b id="stage"></b><span> · </span><span id="level-name"></span></p></div><div class="utilities"><button id="map" aria-label="מפת השלבים" title="מפת השלבים">${svg('map')}</button><button id="help" aria-label="איך משחקים">?</button><button id="new-plan" aria-label="ניקוי השטח לתכנית חדשה" title="שטח חדש">${svg('retry')}</button><button id="sound" aria-label="הפעלת צליל">${svg('sound')}</button><button id="pause" aria-label="השהיה">${svg('pause')}</button></div></header>
<div id="home-status" aria-label="שלושה בתים להגנה">${[0,1,2].map(k=>`<span data-home="${k}">${svg('home')}<i></i></span>`).join('')}</div>
<div id="instruction"></div><div id="soil-goal" hidden><span>חלחול לקרקע</span><b id="soil-quantity"></b><i><em></em></i></div>
<div id="coast-label">הים · החוף פתוח לכל אורכו</div><div id="notice" role="status"></div><div id="brush-cost" hidden></div>
<div id="outcome" hidden role="status"><strong id="outcome-title"></strong><span id="outcome-cause"></span><button id="revise">שינוי התכנית</button></div>
<footer><div id="wall-options" hidden><button id="rotate">${svg('rotate')}<span>סיבוב</span></button><button id="remove" hidden>${svg('trash')}<span>החזרה למגש</span></button><span><bdi>R</bdi> לסיבוב</span></div>
<div class="dock"><button id="dig" class="tool selected" aria-label="חפירה" aria-pressed="true">${svg('shovel')}<span>חפירה</span></button><button id="fill" class="tool" aria-label="מילוי חפירה" aria-pressed="false">${svg('fill')}<span>מילוי</span></button><button id="wall" class="tool" aria-label="הצבת סוללה" aria-pressed="false">${svg('wall')}<span id="stock">3 סוללות</span></button><div class="earth"><span>חפירה פנויה</span><b id="earth-value"></b><div><i id="earth-fill"></i></div></div><button id="undo" class="round" aria-label="ביטול הפעולה האחרונה">${svg('undo')}</button><button id="test" class="test">${svg('play')}<span id="test-label">בדיקת השיטפון</span></button></div>
<div id="wave-track"><i></i></div><small class="model-note">מפה סכמטית · מודל וזמן מפושטים</small></footer>
<div id="level-sheet" hidden></div><div id="help-sheet" hidden><section role="dialog" aria-modal="true" aria-labelledby="help-title"><button id="close-help" aria-label="סגירה">×</button><h2 id="help-title">לאן תשלחו את המים?</h2><p>גררו באדמה כדי לחפור תעלה. אפשר לחפור בכל שטח האדמה הפנוי, עד גמר התקציב.</p><p>בחרו סוללה והציבו אותה בשטח. סובבו עם הכפתור או <bdi>R</bdi>. לחיצה על סוללה קיימת מאפשרת להזיז או להסיר אותה.</p><p>בדקו את השיטפון. המטרה: כל שלושת הבתים בטוחים, ורוב הגל מגיע לים.</p><p>רוצים לסגור תעלה? בחרו <b>מילוי</b> וגררו עליה. האדמה תחזור והתקציב יוחזר.</p><p>אחרי הבדיקה, התכנית נשמרת. שנו אותה ונסו שוב. ↶ מבטל רק את הבנייה האחרונה.</p><small><bdi>1 / 2 / 3</bdi> כלים · <bdi>Z</bdi> ביטול · רווח בדיקה/השהיה · <bdi>F</bdi> מסך מלא</small><button id="clear">שטח נקי לתכנית חדשה</button></section></div>`;
try{scene=new FreeformScene($('world'),model);}catch(e){$('app').innerHTML='<p class="fatal">נדרשת תצוגת WebGL. הפעילו האצת גרפיקה בדפדפן ורעננו.</p>';throw e;}
let canvas=scene.renderer.domElement;
if(model.changedCells||model.walls.length)$('instruction').classList.add('dismissed');
function tone(freq=280,duration=.08){if(muted)return;audio??=new AudioContext();void audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);g.gain.setValueAtTime(.065,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
function notify(text:string){$('notice').textContent=text;$('notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=window.setTimeout(()=>$('notice').classList.remove('visible'),3000);}
function editable(){return!helpOpen&&!mapOpen&&model.state.mode!=='run'&&model.state.mode!=='paused';}
function refresh(save=true){if(save){resumedWin=false;savePlan('plan');}scene.terrainDirty=true;scene.buildObjects();scene.refreshPicking();sync();}
function loadLevel(n:number){
 if(n<1||n>FREEFORM_LEVELS.length)return;
 savePlan();cancelGesture();scene.dispose();model.load(n);restoreSaved(n);scene=new FreeformScene($('world'),model);canvas=scene.renderer.domElement;bindCanvas();
 tool='dig';movingId=undefined;pointer=null;angle=0;oldMode='';oldView='';mapOpen=helpOpen=false;$('level-sheet').hidden=true;$('help-sheet').hidden=true;$('instruction').classList.toggle('dismissed',model.changedCells>0||model.walls.length>0||resumedWin);$('notice').classList.remove('visible');saveCampaign();refresh(false);canvas.focus();hostLevelStart();
}
function nextLevel(){if(model.level<FREEFORM_LEVELS.length)loadLevel(model.level+1);else showMap(true);}
function showMap(open:boolean){
 mapOpen=open;$('level-sheet').hidden=!open;if(!open){canvas.focus();return;}cancelGesture();if(model.state.mode==='run')model.state.mode='paused';
 const completed=Object.keys(campaign.missions).length;
 $('level-sheet').innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="level-map-title"><button id="close-map" aria-label="סגירת מפת השלבים">×</button><small>${completed} מתוך ${FREEFORM_LEVELS.length} אגנים הוצלו</small><h2 id="level-map-title">${completed===24?'כל האגנים בטוחים!':'לאן ממשיכים?'}</h2><div class="level-grid">${FREEFORM_LEVELS.map(l=>`<button data-level="${l.id}" class="${campaign.missions[l.id]?'completed':''} ${l.id===model.level?'current':''}" aria-label="שלב ${l.id}: ${l.title}${campaign.missions[l.id]?' — הושלם':''}"><bdi>${l.id}</bdi><span>${l.title}</span><i>${campaign.missions[l.id]?'✓':''}</i></button>`).join('')}</div><p>כל השלבים זמינים לתרגול. התכניות שלכם נשמרות בכל אגן.</p></section>`;
 $('close-map').onclick=()=>showMap(false);document.querySelectorAll<HTMLElement>('[data-level]').forEach(e=>e.onclick=()=>loadLevel(Number(e.dataset.level)));$('close-map').focus();sync();
}
function selectTool(value:'dig'|'fill'|'wall',keepMove=false){cancelGesture();if(model.state.mode==='run'||model.state.mode==='paused'){model.retry();refresh();}tool=value;if(!keepMove)movingId=undefined;scene.previewWall(null);scene.hoverBrush(null);sync();}
function cancelGesture(){dragging=false;stroke=[];preview=null;model.previewH=null;$('brush-cost').hidden=true;scene.terrainDirty=true;scene.refreshPicking();}
function rotate(){angle=(angle+Math.PI/4)%Math.PI;if(pointer)wallPreview(pointer);tone(340);}
function wallPreview(p:Point){const w:Wall={id:movingId??-1,x:p[0],z:p[1],angle};const valid=model.canPlaceWall(w,movingId)&&(movingId!==undefined||model.walls.length<model.maxWalls);scene.previewWall(w,valid);scene.hoverBrush(null);}
function move(e:PointerEvent){if(!editable())return;const p=scene.pick(e.clientX,e.clientY);pointer=p;if(!p){scene.hoverBrush(null);scene.previewWall(null);return;}if(tool==='wall'){wallPreview(p);return;}scene.hoverBrush(p,!!model.editable[Math.round(p[1])*29+Math.round(p[0])]);if(!dragging)return;if(!stroke.length||Math.hypot(p[0]-stroke[stroke.length-1][0],p[1]-stroke[stroke.length-1][1])>.15)stroke.push(p);preview=tool==='fill'?model.fillPreview(stroke):model.digPreview(stroke);scene.terrainDirty=true;$('brush-cost').hidden=false;$('brush-cost').textContent=preview.ok?(tool==='fill'?`החזר חפירה: +${Math.ceil(preview.cost)}`:`חפירה: ${Math.ceil(preview.cost)}`):preview.reason;$('brush-cost').classList.toggle('invalid',!preview.ok);}
function bindCanvas(){
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!editable())return;canvas.focus();model.ensurePlanning();const visiblePoint=scene.pick(e.clientX,e.clientY);const hit=visiblePoint?model.wallAt(visiblePoint):null;if(hit&&tool==='dig'){movingId=hit.id;angle=hit.angle;tool='wall';pointer=visiblePoint;wallPreview(visiblePoint!);sync();return;}scene.freezePicking();const p=scene.pick(e.clientX,e.clientY);if(!p)return;dragging=true;stroke=[p];canvas.setPointerCapture(e.pointerId);move(e);});
canvas.addEventListener('pointermove',move);
canvas.addEventListener('pointerup',e=>{if(!dragging)return;const p=scene.pick(e.clientX,e.clientY);if(tool!=='wall'){if(p)stroke.push(p);const success=tool==='fill'?model.commitFill(stroke):model.commitDig(stroke);if(success){scene.cut(stroke[Math.floor(stroke.length/2)]);tone(220);$('instruction').classList.add('dismissed');}else notify(model.lastAction);}else if(p){if(model.placeWall(p[0],p[1],angle,movingId)){tone(300);movingId=undefined;$('instruction').classList.add('dismissed');}else notify(model.lastAction);}dragging=false;stroke=[];preview=null;model.previewH=null;$('brush-cost').hidden=true;scene.previewWall(null);refresh();});
canvas.addEventListener('pointercancel',cancelGesture);canvas.addEventListener('pointerleave',()=>{if(!dragging){scene.hoverBrush(null);scene.previewWall(null);}});canvas.addEventListener('contextmenu',e=>e.preventDefault());
}
bindCanvas();
function run(){if(helpOpen||mapOpen)return;if(model.state.mode==='won'||resumedWin){nextLevel();return;}$('notice').classList.remove('visible');cancelGesture();scene.previewWall(null);scene.hoverBrush(null);const s=model.state;if(s.mode==='run')s.mode='paused';else if(s.mode==='paused')s.mode='run';else if(s.mode==='failed'){model.retry();refresh();}else{model.run();$('instruction').classList.add('dismissed');tone(160,.2);}sync();}
function revise(){if(model.state.mode==='won'||resumedWin)hostLevelStart();resumedWin=false;cancelGesture();model.retry();movingId=undefined;refresh();notify('התכנית נשמרה. אפשר לשנות אותה.');}
function undo(){cancelGesture();if(model.undo()){movingId=undefined;scene.previewWall(null);refresh();tone(270);}sync();}
function help(open:boolean){helpOpen=open;$('help-sheet').hidden=!open;if(open){cancelGesture();if(model.state.mode==='run')model.state.mode='paused';$('close-help').focus();}else canvas.focus();sync();}
function sync(){const s=model.state;$('stage').textContent=`שלב ${model.level} מתוך ${FREEFORM_LEVELS.length}`;$('level-name').textContent=model.config.title;$('instruction').textContent=model.config.brief;$('soil-goal').hidden=!model.config.infiltrationGoal;$('soil-quantity').textContent=`${s.recharged.toFixed(1)} / ${model.config.infiltrationGoal}`;$('soil-goal').querySelector<HTMLElement>('em')!.style.width=`${Math.min(100,s.recharged/Math.max(.01,model.config.infiltrationGoal)*100)}%`;const running=s.mode==='run'||s.mode==='paused';$('dig').classList.toggle('selected',tool==='dig');$('fill').classList.toggle('selected',tool==='fill');$('fill').setAttribute('aria-pressed',String(tool==='fill'));$('wall').classList.toggle('selected',tool==='wall');$('dig').setAttribute('aria-pressed',String(tool==='dig'));$('wall').setAttribute('aria-pressed',String(tool==='wall'));$('stock').textContent=model.maxWalls-model.walls.length===1?'סוללה אחת':`${model.maxWalls-model.walls.length} סוללות`;$('earth-value').textContent=`${Math.floor(model.earthLeft)} / ${s.level.budget}`;$('earth-fill').style.width=`${model.earthLeft/s.level.budget*100}%`;$('wall-options').hidden=tool!=='wall'||running;$('remove').hidden=movingId===undefined;($('undo') as HTMLButtonElement).disabled=!model.history.length;($('dig') as HTMLButtonElement).disabled=false;($('fill') as HTMLButtonElement).disabled=false;($('wall') as HTMLButtonElement).disabled=false;
 $('test-label').textContent=s.mode==='run'?'השהיה':s.mode==='paused'?'המשך השיטפון':s.mode==='won'||resumedWin?(model.level===24?'מפת השלבים':'השלב הבא'):s.mode==='failed'?'חזרה לתכנון':'בדיקת השיטפון';$('test').classList.toggle('running',running);$('pause').setAttribute('aria-label',s.mode==='paused'?'המשך':'השהיה');$('sound').classList.toggle('muted',muted);$('sound').setAttribute('aria-label',muted?'הפעלת צליל':'השתקת צליל');$('wave-track').classList.toggle('active',running);$('wave-track').querySelector<HTMLElement>('i')!.style.width=`${s.time/s.level.duration*100}%`;
 document.querySelectorAll<HTMLElement>('[data-home]').forEach(e=>{const k=Number(e.dataset.home);e.classList.toggle('flooded',!model.homeSafe[k]);e.classList.toggle('rescued',s.mode==='won');e.setAttribute('aria-label',`בית ${k+1}: ${!model.homeSafe[k]?'הוצף':s.mode==='won'?'בטוח':'להגנה'}`);});
 if(s.mode==='won'&&oldMode!=='won'){
  recordRescue(campaign,model.level,{earth:model.earthUsed,walls:model.walls.length,received:model.delivered,infiltrated:s.recharged});savePlan('won');postToHost({type:'level-complete',level:model.level,stars:1,durationMs:Math.round(performance.now()-hostStartedAt)});tone(523,.18);setTimeout(()=>tone(659,.2),120);
 }
 oldMode=s.mode;const view=`${s.mode}:${resumedWin}:${model.level}`;
 if(oldView!==view){
  $('test').querySelector('svg')!.outerHTML=svg(s.mode==='run'?'pause':s.mode==='failed'?'retry':'play');
  const completed=s.mode==='won'||resumedWin;$('outcome').hidden=!completed&&s.mode!=='failed';$('outcome').classList.toggle('success',completed);
  $('outcome-title').textContent=completed?(resumedWin?'השלב הושלם — ממשיכים?':model.level===24?'האגן האחרון בטוח!':'הכפר ניצל!'):'צריך תכנית אחרת';
  $('outcome-cause').textContent=resumedWin?'הניצחון הקודם נשמר. אפשר להמשיך לאגן הבא.':s.reason;$('revise').textContent=completed?'עוד תכנית באגן הזה':'שינוי התכנית';
  if(s.mode==='failed')tone(150,.16);oldView=view;
 }

}
$('map').onclick=()=>showMap(true);$('level-sheet').onclick=e=>{if(e.target===$('level-sheet'))showMap(false);};$('dig').onclick=()=>selectTool('dig');$('fill').onclick=()=>selectTool('fill');$('new-plan').onclick=()=>{cancelGesture();if(model.state.mode==='run'||model.state.mode==='paused')model.retry();model.clear();selectTool('dig');refresh();notify('שטח נקי. אפשר לבטל עם ↶.');};$('wall').onclick=()=>selectTool('wall');$('rotate').onclick=rotate;$('remove').onclick=()=>{if(movingId!==undefined&&model.removeWall(movingId)){movingId=undefined;scene.previewWall(null);refresh();}};$('test').onclick=run;$('revise').onclick=revise;$('undo').onclick=undo;$('help').onclick=()=>help(true);$('close-help').onclick=()=>help(false);$('help-sheet').onclick=e=>{if(e.target===$('help-sheet'))help(false);};$('clear').onclick=()=>{if(model.state.mode==='paused')model.retry();model.clear();help(false);selectTool('dig');refresh();};$('sound').onclick=()=>{muted=!muted;localStorage.setItem('basin-freeform-muted',String(muted));tone();sync();};$('pause').onclick=()=>{if(model.state.mode==='run')model.state.mode='paused';else if(model.state.mode==='paused')model.state.mode='run';sync();};
window.addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='Escape'){showMap(false);help(false);cancelGesture();if(model.state.mode==='run')model.state.mode='paused';if(document.fullscreenElement)void document.exitFullscreen();sync();return;}if(helpOpen||mapOpen)return;if(e.code==='KeyM'){showMap(true);return;}if(e.code==='Space'){e.preventDefault();run();}if(e.code==='KeyZ')undo();if(e.code==='Digit1')selectTool('dig');if(e.code==='Digit2')selectTool('wall');if(e.code==='Digit3')selectTool('fill');if(e.code==='KeyR'&&tool==='wall'&&editable())rotate();if((e.code==='Delete'||e.code==='Backspace')&&movingId!==undefined){e.preventDefault();$('remove').click();}if(e.code==='KeyF'){if(document.fullscreenElement)void document.exitFullscreen();else void $('app').requestFullscreen();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&model.state.mode==='run'){model.state.mode='paused';sync();}});window.addEventListener('blur',()=>{if(model.state.mode==='run'){model.state.mode='paused';sync();}});
const debug=window as unknown as Record<string,unknown>;debug.render_game_to_text=()=>JSON.stringify({...model.text(),campaign:{current:model.level,total:FREEFORM_LEVELS.length,completed:Object.keys(campaign.missions).map(Number),resumedWin,mapOpen},tool,movingWall:movingId??null,angle,helpOpen,muted,preview});
let time=0;function update(dt:number){model.advance(dt);time+=dt;scene.render(time,dt);sync();}
debug.advanceTime=(ms:number)=>{let left=ms/1000;while(left>1e-8){const dt=Math.min(1/60,left);update(dt);left-=dt;}};
// Projection is read-only: browser QA uses it to relate visible geometry to captures.
debug.basinFreeform={screen:(p:Point,y=0)=>scene.screen(p,y),construction:()=>({level:model.level,bed:Array.from(model.bed),walls:model.walls.map(w=>({...w}))})};
// The host hears `ready` once the scene has rendered with its gate model (or after a 4 s fallback), then the opening level-start.
function announceReady(){if(hostReady||!(scene.assets.gate||time>4))return;hostReady=true;postToHost({type:'ready'});postToHost({type:'level-start',level:model.level});}
let last=performance.now();function frame(now:number){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);announceReady();requestAnimationFrame(frame);}hostStartedAt=performance.now();savePlan();sync();requestAnimationFrame(frame);
