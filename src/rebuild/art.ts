import * as T from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// All artwork in this module is original procedural geometry/material code.
// Pivots are at ground level, Y is up; the house/marker front faces +Z.
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
function random(seed:number){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const up=new T.Vector3(0,1,0),dummy=new T.Object3D(),tint=new T.Color();
const roundBlock=new RoundedBoxGeometry(1,1,1,1,.12);
const wood=new T.MeshStandardMaterial({color:0x705035,roughness:.96});
const blue=new T.MeshStandardMaterial({color:0x185a77,roughness:.57,metalness:.04});
const terracotta=new T.MeshStandardMaterial({color:0xbd5935,roughness:.91});
const limestone=new T.MeshStandardMaterial({color:0xead3a5,roughness:.94});
const paleStone=new T.MeshStandardMaterial({color:0xf0dfb9,roughness:.92});

function addBox(parent:T.Object3D,material:T.Material,size:[number,number,number],at:[number,number,number]){
  const mesh=new T.Mesh(roundBlock,material);mesh.scale.set(...size);mesh.position.set(...at);
  mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

function makeLeafGeometry(){
  const shape=new T.Shape();shape.moveTo(0,-.5);shape.quadraticCurveTo(-.35,-.15,-.23,.12);
  shape.quadraticCurveTo(-.1,.4,0,.5);shape.quadraticCurveTo(.25,.22,.25,-.04);shape.quadraticCurveTo(.18,-.34,0,-.5);
  const geometry=new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:1,steps:1,curveSegments:2});
  geometry.translate(0,0,-.0175);return geometry;
}
const leafGeometry=makeLeafGeometry();
const leafMaterial=new T.MeshStandardMaterial({color:0xffffff,roughness:.89});
// Rounded core clusters close the healthy canopy silhouette; leaf tips remain
// separate so the crown reads as foliage rather than a collection of balls.
const crownGeometry=new T.IcosahedronGeometry(1,1);
const crownMaterial=new T.MeshStandardMaterial({color:0xffffff,roughness:.95});

function makeFlowerGeometry(){
  const positions:number[]=[],colors:number[]=[];
  const triangle=(a:number[],b:number[],c:number[],color:T.Color)=>{positions.push(...a,...b,...c);for(let k=0;k<3;k++)colors.push(color.r,color.g,color.b);};
  const white=new T.Color(0xfff2db),gold=new T.Color(0xe3ac38);
  for(let p=0;p<5;p++){
    const angle=p*Math.PI*2/5,center=[Math.cos(angle)*.071,.004,Math.sin(angle)*.071];
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3,b=(k+1)*Math.PI/3;
      const point=(v:number)=>[center[0]+Math.cos(angle)*Math.cos(v)*.075-Math.sin(angle)*Math.sin(v)*.041,.003,center[2]+Math.sin(angle)*Math.cos(v)*.075+Math.cos(angle)*Math.sin(v)*.041];
      triangle(center,point(b),point(a),white);
    }
  }
  for(let k=0;k<8;k++){const a=k*Math.PI/4,b=(k+1)*Math.PI/4;triangle([0,.013,0],[Math.cos(b)*.036,.013,Math.sin(b)*.036],[Math.cos(a)*.036,.013,Math.sin(a)*.036],gold);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();return geometry;
}
const flowerGeometry=makeFlowerGeometry();
const flowerMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.9,side:T.DoubleSide});

/** One instanced canopy and one instanced flower batch, never hundreds of meshes. */
export function makeOliveTree(seed:number,scale=1):T.Group{
  const rng=random(seed),root=new T.Group();root.name='olive-tree';root.scale.setScalar(scale);
  const trunkCurve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(-.045,.43,.035),new T.Vector3(.045,.91,0),new T.Vector3(0,1.34,0)]);
  const trunk=new T.Mesh(new T.TubeGeometry(trunkCurve,5,.105,6,false),wood);trunk.castShadow=true;trunk.receiveShadow=true;root.add(trunk);
  const branchGeometry=new T.CylinderGeometry(.035,.075,.78,5,1);
  branchGeometry.translate(0,.39,0);
  const branches:T.Mesh[]=[];
  for(let k=0;k<3;k++){const branch=new T.Mesh(branchGeometry,wood);branch.position.y=.85;branch.castShadow=true;root.add(branch);branches.push(branch);}
  const count=104,canopy=new T.InstancedMesh(leafGeometry,leafMaterial,count);canopy.castShadow=true;canopy.receiveShadow=true;
  canopy.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(canopy);
  const leaves=Array.from({length:count},(_,k)=>({
    angle:rng()*Math.PI*2,radius:.18+Math.sqrt(rng())*.67,level:rng(),length:.28+rng()*.23,
    tilt:rng(),fresh:k%7===0,
  }));
  const crown=new T.InstancedMesh(crownGeometry,crownMaterial,9);crown.castShadow=crown.receiveShadow=true;
  crown.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(crown);
  const cores=Array.from({length:9},(_,k)=>{const a=k/7*Math.PI*2;return{
    x:k<2?0:Math.cos(a)*.43,z:k<2?0:Math.sin(a)*.36,
    y:k===0?1.46:k===1?1.79:1.43+Math.sin(a*2.1)*.13,
    radius:k===0?.43:.3+rng()*.07,shade:.9+rng()*.2,
  };});
  const flowers=new T.InstancedMesh(flowerGeometry,flowerMaterial,14);flowers.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(flowers);
  const blossoms=Array.from({length:14},(_,k)=>{const angle=rng()*Math.PI*2,r=.34+rng()*.62;return{x:Math.cos(angle)*r,z:Math.sin(angle)*r,y:k<10?.025:1.2+rng()*.3,angle:rng()*Math.PI*2,size:.7+rng()*.5};});
  const dryColor=new T.Color(0x85804a),healthyColor=new T.Color(0x365627),freshColor=new T.Color(0x85a93c);
  const direction=new T.Vector3();let last=-1;
  const setBloom=(progress:number)=>{
    const value=clamp(progress);if(Math.abs(last-value)<.0001)return;last=value;const p=value*value*(3-2*value);
    for(let k=0;k<count;k++){
      const leaf=leaves[k],r=leaf.radius*(.85+p*.17);
      dummy.position.set(Math.cos(leaf.angle)*r,1.15+leaf.level*.57+(p-.7)*r*.33,Math.sin(leaf.angle)*r*.84);
      // Dry leaves hang; recovered leaves lift up and out, with a fuller crown.
      direction.set(Math.cos(leaf.angle)*(.3+p*.58),-1+p*(1.5+leaf.tilt*.6),Math.sin(leaf.angle)*(.3+p*.58)).normalize();
      dummy.quaternion.setFromUnitVectors(up,direction);dummy.rotateY(leaf.tilt*2.2);
      dummy.scale.set(.17+p*.12,leaf.length*(1+p*.13),.32+p*.09);dummy.updateMatrix();canopy.setMatrixAt(k,dummy.matrix);
      tint.copy(dryColor).lerp(leaf.fresh?freshColor:healthyColor,p).multiplyScalar(.9+leaf.tilt*.2);canopy.setColorAt(k,tint);
    }
    for(let k=0;k<branches.length;k++){
      const angle=k*Math.PI*2/3+.2;direction.set(Math.cos(angle)*.65,.2+p*.55,Math.sin(angle)*.65).normalize();branches[k].quaternion.setFromUnitVectors(up,direction);
    }
    const fullness=clamp((p-.12)/.88);
    for(let k=0;k<cores.length;k++){
      const core=cores[k];dummy.position.set(core.x,core.y,core.z);dummy.rotation.set(k*.23,k*.9,k*.13);
      dummy.scale.set(core.radius*fullness,core.radius*.88*fullness,core.radius*.94*fullness);dummy.updateMatrix();crown.setMatrixAt(k,dummy.matrix);
      tint.setHex(k===1?0x5d7c31:0x3d5c28).multiplyScalar(core.shade);crown.setColorAt(k,tint);
    }
    const opening=clamp((p-.25)/.75);
    for(let k=0;k<blossoms.length;k++){
      const b=blossoms[k];dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.angle,0);dummy.scale.setScalar(opening*b.size);dummy.updateMatrix();flowers.setMatrixAt(k,dummy.matrix);
    }
    canopy.instanceMatrix.needsUpdate=true;if(canopy.instanceColor)canopy.instanceColor.needsUpdate=true;flowers.instanceMatrix.needsUpdate=true;
    crown.instanceMatrix.needsUpdate=true;if(crown.instanceColor)crown.instanceColor.needsUpdate=true;
    canopy.computeBoundingSphere();canopy.computeBoundingBox();crown.computeBoundingSphere();crown.computeBoundingBox();flowers.computeBoundingSphere();flowers.computeBoundingBox();root.userData.bloomProgress=value;
  };
  root.userData.setBloom=setBloom;
  root.userData.setScenery=(enabled:boolean)=>{
    flowers.visible=!enabled;root.userData.scenery=enabled;
    if(enabled)setBloom(1);
  };
  setBloom(0);return root;
}

/** Rounded irregular limestone boulder, about .5–1 world unit, grounded pivot. */
export function makeRock(seed:number):T.Mesh{
  const rng=random(seed),geometry=new RoundedBoxGeometry(.6+rng()*.5,.35+rng()*.45,.5+rng()*.6,1,.15);
  const position=geometry.getAttribute('position');let minY=Infinity;
  for(let k=0;k<position.count;k++){
    const x=position.getX(k),y=position.getY(k),z=position.getZ(k),grain=1+.055*Math.sin(x*14.2+y*8.1+z*11.7+seed);
    position.setXYZ(k,x*grain,y*grain,z*grain);minY=Math.min(minY,y*grain);
  }
  geometry.translate(0,-minY,0);geometry.computeBoundingSphere();
  const mesh=new T.Mesh(geometry,limestone);mesh.rotation.y=rng()*Math.PI;mesh.castShadow=mesh.receiveShadow=true;mesh.name='rounded-limestone-rock';return mesh;
}

/** Radius is clear INNER radius; base Y=0. Gap angle π/2 opens the +Z mouth. */
export function makeStoneRing(radius:number,height=.65,gap?:{center:number;halfWidth:number}):T.Group{
  const root=new T.Group();root.name='irregular-stone-ring';const rng=random(Math.round(radius*1309+height*991));
  const thickness=.38,centerRadius=radius+thickness/2,courses=Math.max(1,Math.ceil(height/.4)),segments=Math.max(12,Math.round(Math.PI*2*centerRadius/.68));
  const stones=new T.InstancedMesh(roundBlock,limestone,courses*segments);stones.castShadow=stones.receiveShadow=true;
  const courseHeight=height/courses,arc=Math.PI*2*centerRadius/segments;
  const gapWidth=gap?Math.max(0,Math.min(Math.PI,gap.halfWidth)):0;let visibleCount=0;
  for(let course=0;course<courses;course++)for(let k=0;k<segments;k++){
    const a=(k+(course%2)*.5)*Math.PI*2/segments;
    if(gap&&gapWidth>0&&Math.abs(Math.atan2(Math.sin(a-gap.center),Math.cos(a-gap.center)))<gapWidth)continue;
    const r=centerRadius+(rng()-.5)*.035;
    dummy.position.set(Math.cos(a)*r,courseHeight*(course+.5)+(rng()-.5)*.02,Math.sin(a)*r);
    dummy.rotation.set((rng()-.5)*.025,-a-Math.PI/2+(rng()-.5)*.018,(rng()-.5)*.025);
    dummy.scale.set(arc*.97,courseHeight*(.92+rng()*.045),thickness*(.94+rng()*.08));dummy.updateMatrix();const index=visibleCount++;stones.setMatrixAt(index,dummy.matrix);
    tint.setHex(0xffffff).multiplyScalar(.89+rng()*.14);stones.setColorAt(index,tint);
  }
  stones.count=visibleCount;stones.instanceMatrix.needsUpdate=true;if(stones.instanceColor)stones.instanceColor.needsUpdate=true;
  stones.computeBoundingBox();stones.computeBoundingSphere();root.add(stones);
  root.userData.innerRadius=radius;root.userData.height=height;if(gap)root.userData.gap={center:gap.center,halfWidth:gapWidth};return root;
}

/** Prominent 2.8×2.15 house, about 2.7 high; door/windows face +Z. */
export function makeHouse():T.Group{
  const root=new T.Group();root.name='mediterranean-house';
  addBox(root,limestone,[3.05,.2,2.4],[0,.1,0]);
  addBox(root,paleStone,[2.8,1.7,2.15],[0,.97,0]);
  // Subtle long stone courses give walls scale without a noisy checkerboard.
  const mortar=new T.MeshStandardMaterial({color:0xc9b489,roughness:1});
  for(const y of [.56,.98,1.4])addBox(root,mortar,[2.65,.014,.012],[0,y,1.079]);
  addBox(root,limestone,[.78,1.32,.17],[0,.76,1.12]);
  addBox(root,blue,[.57,1.12,.1],[0,.72,1.22]);
  const groove=new T.MeshStandardMaterial({color:0x123f56,roughness:.7});
  for(const x of [-.14,0,.14])addBox(root,groove,[.011,1.04,.018],[x,.72,1.279]);
  addBox(root,limestone,[.83,.12,.33],[0,.23,1.24]);
  const handle=new T.Mesh(new T.TorusGeometry(.065,.018,5,10),new T.MeshStandardMaterial({color:0xa77336,roughness:.5,metalness:.3}));handle.position.set(.17,.77,1.29);root.add(handle);
  for(const x of [-.95,.95]){addBox(root,limestone,[.59,.69,.14],[x,1.04,1.12]);addBox(root,blue,[.43,.51,.1],[x,1.04,1.22]);addBox(root,groove,[.018,.49,.015],[x,1.04,1.278]);}
  const roofPositions=[
    -1.58,1.75,-1.27,1.58,1.75,-1.27,-1.58,2.45,0,1.58,2.45,0,-1.58,1.75,1.27,1.58,1.75,1.27,
  ];
  const roofGeometry=new T.BufferGeometry();roofGeometry.setAttribute('position',new T.Float32BufferAttribute(roofPositions,3));roofGeometry.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,0,4,2,1,3,5,0,1,4,1,5,4]);roofGeometry.computeVertexNormals();
  const roof=new T.Mesh(roofGeometry,terracotta);roof.castShadow=roof.receiveShadow=true;root.add(roof);
  const tileGeometry=new RoundedBoxGeometry(.238,.08,.37,1,.03),tiles=new T.InstancedMesh(tileGeometry,terracotta,104),rng=random(1701);
  let index=0;for(const side of [-1,1])for(let row=0;row<4;row++)for(let column=0;column<13;column++){
    const z=side*(.15+row*.315);dummy.position.set((column-6)*.242,2.49-Math.abs(z)*.55,z);dummy.rotation.set(side*Math.atan(.55),0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();tiles.setMatrixAt(index,dummy.matrix);
    tint.setHex(0xffffff).multiplyScalar(.8+rng()*.32);tiles.setColorAt(index++,tint);
  }
  tiles.castShadow=tiles.receiveShadow=true;tiles.instanceMatrix.needsUpdate=true;if(tiles.instanceColor)tiles.instanceColor.needsUpdate=true;root.add(tiles);
  const ridge=new T.Mesh(new T.CylinderGeometry(.09,.09,3.22,8),terracotta);ridge.rotation.z=Math.PI/2;ridge.position.y=2.53;ridge.castShadow=true;root.add(ridge);
  addBox(root,paleStone,[.38,.7,.38],[.93,2.24,-.4]);addBox(root,terracotta,[.47,.12,.47],[.93,2.64,-.4]);
  addBox(root,new T.MeshStandardMaterial({color:0x514637,roughness:1}),[.23,.015,.23],[.93,2.709,-.4]);return root;
}

/** Physical pond peg: blue line at local Y=.32, leaf glyph above, front +Z. */
export function makeLeafMarker():T.Group{
  const root=new T.Group();root.name='physical-leaf-fill-marker';
  addBox(root,paleStone,[.45,.98,.19],[0,.49,0]);
  addBox(root,blue,[.46,.037,.024],[0,.32,.108]);
  addBox(root,blue,[.025,.037,.19],[-.231,.32,0]);addBox(root,blue,[.025,.037,.19],[.231,.32,0]);
  const glyph=new T.MeshStandardMaterial({color:0x665134,roughness:1});
  const stem=new T.Mesh(new T.CylinderGeometry(.012,.015,.28,5),glyph);stem.position.set(-.025,.65,.116);stem.rotation.z=-.25;root.add(stem);
  for(const [x,y,angle] of [[-.07,.67,.8],[.065,.72,-.7],[.01,.83,-.12]]){
    const leaf=new T.Mesh(leafGeometry,glyph);leaf.position.set(x,y,.123);leaf.rotation.z=angle;leaf.scale.set(.18,.17,.23);root.add(leaf);
  }
  root.userData.fillLineHeight=.32;return root;
}

function injectWorldPosition(material:T.MeshStandardMaterial,varying:string){
  const previous=material.onBeforeCompile;
  material.onBeforeCompile=function(shader,renderer){
    previous.call(this,shader,renderer);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nvarying vec3 ${varying};`);
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>\nvec4 basinLocal=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nbasinLocal=instanceMatrix*basinLocal;\n#endif\n${varying}=(modelMatrix*basinLocal).xyz;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 ${varying};`);
  };
}

/** Expects the authoritative terrain geometry to provide its color attribute. */
export function createTerrainMaterial():T.MeshStandardMaterial{
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.97});injectWorldPosition(material,'vBasinTerrainWorld');
  const previous=material.onBeforeCompile;
  material.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 p=vBasinTerrainWorld;
// Vertex colors identify actual material zones. Separate pale mineral shoulders
// from red clay without inventing elevation, wetness or editable regions.
float basinMineral=smoothstep(.18,.3,diffuseColor.b/max(.001,diffuseColor.r));
float basinClay=smoothstep(1.8,2.7,diffuseColor.r/max(.001,diffuseColor.g))*(1.0-basinMineral);
diffuseColor.rgb*=mix(vec3(1.0),vec3(1.035,1.06,1.35),basinMineral*.75);
diffuseColor.rgb*=mix(vec3(1.0),vec3(.9,.7,.62),basinClay*.38);
float broad=sin(p.x*1.3+p.z*.7)*sin(p.z*1.5-p.x*.31);
float grain=sin(p.x*43.1+p.z*31.7+p.y*17.3)*sin(p.z*49.3-p.x*23.8);
float strata=sin(p.y*18.0+sin(p.x*.8+p.z*.6)*.5);
diffuseColor.rgb*=.985+broad*.025+grain*.015+strata*.014;`);
  };
  material.customProgramCacheKey=()=> 'basin-rebuild-terrain-v1';return material;
}

/** Cosmetic ripples/caustics only; surface position and finite volume stay external. */
export function createWaterMaterial():T.MeshStandardMaterial{
  const material=new T.MeshStandardMaterial({color:0x119bc3,roughness:.25,metalness:.08,transparent:false});
  const time={value:0};material.userData.tick=(seconds:number)=>{time.value=seconds;};injectWorldPosition(material,'vBasinWaterWorld');
  const previous=material.onBeforeCompile;
  material.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);shader.uniforms.uBasinWaterTime=time;
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
uniform float uBasinWaterTime;
vec2 basinWaterHash(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float basinWaterCells(vec2 p){
  vec2 cell=floor(p),f=fract(p);float first=8.0,second=8.0;
  for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){
    vec2 offset=vec2(float(x),float(y)),h=basinWaterHash(cell+offset);
    vec2 site=offset+.5+.32*sin(uBasinWaterTime*.53+6.283185*h)-f;
    float d=dot(site,site);if(d<first){second=first;first=d;}else{second=min(second,d);}
  }}
  return 1.0-smoothstep(.035,.19,second-first);
}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 basinWaterP=vBasinWaterWorld.xz*1.2;
basinWaterP+=vec2(sin(basinWaterP.y*1.3+uBasinWaterTime*.61),cos(basinWaterP.x*1.1-uBasinWaterTime*.47))*.18;
float basinCaustic=basinWaterCells(basinWaterP);
float basinCausticBreak=.5+.5*sin(basinWaterP.x*1.35-basinWaterP.y*.72+uBasinWaterTime*.56);
// Soft broken highlights replace the old uniform closed-cell mosaic.
float basinWaveA=pow(.5+.5*sin(basinWaterP.x*2.1+basinWaterP.y*3.6+sin(basinWaterP.x*1.2-uBasinWaterTime*.7)*.7-uBasinWaterTime*1.18),9.0);
float basinWaveB=pow(.5+.5*sin(basinWaterP.y*4.7-basinWaterP.x*2.6+sin(basinWaterP.y*.9+uBasinWaterTime*.6)*.55+uBasinWaterTime*.94),12.0);
float basinWaveBreak=.5+.5*sin(basinWaterP.x*2.7+basinWaterP.y*.6+uBasinWaterTime*.73);
float basinWaterLight=basinCaustic*.085*basinCausticBreak+basinWaveA*.13*basinWaveBreak+basinWaveB*.075;
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.32,.8,.91),basinWaterLight);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
vec3 basinRipple=vec3(sin(vBasinWaterWorld.x*2.1+vBasinWaterWorld.z*1.4+uBasinWaterTime*1.1),0.0,cos(vBasinWaterWorld.z*2.3-vBasinWaterWorld.x*1.2-uBasinWaterTime*.95))*.055;
basinRipple+=vec3(sin(vBasinWaterWorld.x*6.2-vBasinWaterWorld.z*3.8+uBasinWaterTime*1.8),0.0,cos(vBasinWaterWorld.z*5.7+vBasinWaterWorld.x*4.2-uBasinWaterTime*1.6))*.017;
normal=normalize(normal+(viewMatrix*vec4(basinRipple,0.0)).xyz);`);
  };
  material.customProgramCacheKey=()=> 'basin-rebuild-water-v2';return material;
}
