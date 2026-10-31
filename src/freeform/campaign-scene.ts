import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {FreeformModel,DIG_RADIUS,WALL_HEIGHT,wallCells,W,H,idx,type Wall} from './model';
import type {Point} from '../levels';
import {makeHouse,makeOliveTree,makeRock,makeStoneRing,createTerrainMaterial,createWaterMaterial} from '../rebuild/art';

const HEIGHT=.65,SUB=2,NX=(W-1)*SUB+1,NZ=(H-1)*SUB+1;
const centerX=(W-1)/2,centerZ=(H-1)/2;
const dummy=new T.Object3D(),color=new T.Color();
const wetlandTint=new T.Color(0x4c733c),previewTint=new T.Color(0xddad61);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
type WallPreview=Pick<Wall,'x'|'z'|'angle'>&{id?:number};
function addMesh(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,at:[number,number,number]){
  const object=new T.Mesh(geometry,material);object.position.set(...at);object.castShadow=object.receiveShadow=true;parent.add(object);return object;
}

/** Rendering/input projection only. All excavation, barriers and water belong to the model. */
export class FreeformScene{
  renderer:T.WebGLRenderer;scene=new T.Scene();camera:T.OrthographicCamera;model:FreeformModel;
  root=new T.Group();staticObjects=new T.Group();walls=new T.Group();wallGhost=new T.Group();
  terrain:T.Mesh;water:T.Mesh;pickMesh:T.Mesh;waterMaterial:T.MeshStandardMaterial;poolMaterial:T.MeshStandardMaterial;
  pool:T.Mesh;gateHolder=new T.Group();gateUniform={value:0};assets={gate:false,skid:false};
  brush:T.Group;foam:T.InstancedMesh;sourceFoam:T.InstancedMesh;sand:T.InstancedMesh;
  coastWater:T.Mesh;private coastLast=new Float64Array(W);private coastLife=new Float64Array(W);
  terrainDirty=true;reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  private frozen=false;private lastPreview:Float64Array|null=null;private wallKey='';private ghostKey='';
  private pickRay=new T.Raycaster();private pointer=new T.Vector2();private frame=0;
  private burst=0;private burstPoint=new T.Vector3();private sourceBase=0;private resizeListener:()=>void;
  private seaClock={value:0};
  private disposed=false;
  private artGeometries=new Map<T.BufferGeometry,T.BufferGeometry>();
  private artMaterials=new Map<T.Material,T.Material>();
  private homeCells=new Set<number>();
  private wallGeometry=new RoundedBoxGeometry(1.015,1,1.015,1,.085);
  private wallMaterial=new T.MeshStandardMaterial({color:0xe5d2aa,roughness:.94});

  constructor(container:HTMLElement,model:FreeformModel){
    this.model=model;this.homeCells=new Set(model.homeFootprints.flat());this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor(0x073d50);
    this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;
    container.append(this.renderer.domElement);this.renderer.domElement.tabIndex=0;
    this.renderer.domElement.setAttribute('aria-label','עמק אדמה פתוח לתכנון — חפרו בכל אדמה רכה והציבו סוללות');
    this.camera=new T.OrthographicCamera(-18,18,14,-14,.1,300);this.camera.position.set(10,28,36);this.camera.lookAt(0,2,0);
    this.scene.add(this.root);this.root.add(this.staticObjects,this.walls,this.wallGhost);
    this.scene.add(new T.HemisphereLight(0xffebcf,0x285869,2.25));
    const sun=new T.DirectionalLight(0xffe5bd,3.1);sun.position.set(-18,30,20);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:85});sun.shadow.normalBias=.035;this.scene.add(sun);

    const geometry=this.gridGeometry(true);this.terrain=new T.Mesh(geometry,createTerrainMaterial());
    this.terrain.castShadow=this.terrain.receiveShadow=true;this.root.add(this.terrain);
    this.pickMesh=new T.Mesh(geometry.clone(),new T.MeshBasicMaterial({side:T.DoubleSide}));
    // The picking mesh is independent and never rendered. Its geometry only
    // changes after commit or at the start of a stroke, never during previews.
    this.waterMaterial=createWaterMaterial();this.poolMaterial=createWaterMaterial();
    const waterGeometry=this.gridGeometry(false),wet=new Float32Array(NX*NZ);waterGeometry.setAttribute('wetness',new T.BufferAttribute(wet,1));
    const waterCompile=this.waterMaterial.onBeforeCompile;
    this.waterMaterial.onBeforeCompile=function(shader,renderer){waterCompile.call(this,shader,renderer);
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float wetness;varying float vFreeWet;');
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFreeWet=wetness;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFreeWet;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vFreeWet<.009)discard;');
    };
    this.waterMaterial.customProgramCacheKey=()=> 'freeform-soft-wet-surface-v1';
    this.water=new T.Mesh(waterGeometry,this.waterMaterial);this.water.renderOrder=2;this.water.receiveShadow=true;this.root.add(this.water);

    const seaMaterial=new T.MeshStandardMaterial({color:0x16677e,roughness:.62,metalness:.035});
    seaMaterial.onBeforeCompile=shader=>{
      shader.uniforms.uFreeSeaTime=this.seaClock;
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSeaWorld;');
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvSeaWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSeaWorld;uniform float uFreeSeaTime;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(abs(vSeaWorld.x)<14.001&&vSeaWorld.z>-11.001&&vSeaWorld.z<11.001)discard;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float shoreDistance=length(vec2(max(abs(vSeaWorld.x)-14.0,0.0),max(abs(vSeaWorld.z)-11.0,0.0)));
float shoreGlow=exp(-shoreDistance*.23);
diffuseColor.rgb*=mix(vec3(.47,.61,.7),vec3(.84,1.0,1.06),shoreGlow);
// Broad continuous swells identify the sea without a bright cell pattern.
float swellPhase=dot(vSeaWorld.xz,vec2(.35,.54))-uFreeSeaTime*.65+sin(vSeaWorld.x*.18+uFreeSeaTime*.17)*.7;
float swellLine=pow(.5+.5*sin(swellPhase),18.0);
float swellBreak=.65+.35*sin(vSeaWorld.x*.47-vSeaWorld.z*.19+uFreeSeaTime*.22);
diffuseColor.rgb+=vec3(.003,.008,.01)*swellLine*swellBreak;
// Lapping marks only the exterior beach. It is never a simulated discharge.
float beachEdge=12.6+.3*sin((vSeaWorld.x+14.0)*.61);
float lap=exp(-pow((vSeaWorld.z-beachEdge-.12*sin(uFreeSeaTime*.8+vSeaWorld.x*.48))/.19,2.0));
float coastSpan=1.0-smoothstep(13.5,14.15,abs(vSeaWorld.x));
float lapBreak=.65+.35*sin(vSeaWorld.x*2.1+sin(vSeaWorld.x*.52)-uFreeSeaTime*.55);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.39,.68,.69),lap*coastSpan*lapBreak*.6);`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
normal=normalize(normal+vec3(.024*cos(dot(vSeaWorld.xz,vec2(.35,.54))-uFreeSeaTime*.65),.014*sin(vSeaWorld.x*.7-vSeaWorld.z*.3+uFreeSeaTime*.45),0.0));`);
    };seaMaterial.customProgramCacheKey=()=> 'freeform-calm-sea-v2';
    const sea=addMesh(this.root,new T.PlaneGeometry(180,180,1,1),seaMaterial,[0,.08,0]);sea.rotation.x=-Math.PI/2;sea.receiveShadow=false;sea.castShadow=false;
    this.root.userData.seaMaterial=seaMaterial;
    this.makeCoastSkirt();
    this.coastWater=this.makeCoastDischarge();
    const source=new T.Group();source.position.copy(this.point(this.source));this.sourceBase=source.position.y;
    source.rotation.y=Math.atan2(this.sourceDirection.x,this.sourceDirection.y);
    source.add(this.ownArt(makeStoneRing(3.25,1.5,{center:Math.PI/2,halfWidth:.37})));
    this.pool=addMesh(source,new T.CylinderGeometry(3.1,3.1,.08,56),this.poolMaterial,[0,1.25,0]);
    this.pool.castShadow=false;this.gateHolder.position.set(0,-.03,3.12);source.add(this.gateHolder);this.staticObjects.add(source);
    this.makeFallbackGate();this.makeHomes();this.makeScenery();

    this.brush=new T.Group();
    const ring=new T.Mesh(new T.RingGeometry(DIG_RADIUS*.92,DIG_RADIUS,56),new T.MeshBasicMaterial({color:0xffedbb,transparent:true,opacity:.9,side:T.DoubleSide,depthTest:false}));
    ring.rotation.x=-Math.PI/2;ring.renderOrder=8;this.brush.add(ring);
    const fill=new T.Mesh(new T.CircleGeometry(DIG_RADIUS*.92,48),new T.MeshBasicMaterial({color:0xffe3a1,transparent:true,opacity:.08,side:T.DoubleSide,depthTest:false,depthWrite:false}));
    fill.rotation.x=-Math.PI/2;fill.renderOrder=7;this.brush.add(fill);this.brush.visible=false;this.root.add(this.brush);
    const foamGeometry=new T.IcosahedronGeometry(.085,0),foamMaterial=new T.MeshBasicMaterial({color:0xe4fcff});
    this.foam=new T.InstancedMesh(foamGeometry,foamMaterial,340);this.foam.renderOrder=3;this.root.add(this.foam);
    this.sourceFoam=new T.InstancedMesh(foamGeometry,foamMaterial,64);this.root.add(this.sourceFoam);
    this.sand=new T.InstancedMesh(new T.IcosahedronGeometry(.085,0),new T.MeshStandardMaterial({color:0xd29a58,roughness:1}),36);this.root.add(this.sand);
    this.updateTerrain();this.refreshPicking();this.buildObjects();this.resize();this.resizeListener=()=>this.resize();window.addEventListener('resize',this.resizeListener);
    void this.loadGate();
  }

  private get source():Point{return this.model.source;}
  private get homes():Point[]{return this.model.homes;}
  private get sourceDirection(){
    const at=this.model.state.level.sources[0].at,source=this.source;
    const direction=new T.Vector2(at[0]-source[0],at[1]-source[1]);return direction.lengthSq()?direction.normalize():new T.Vector2(0,1);
  }
  /** Helper modules share CPU templates; give each scene its own GPU resources. */
  private ownArt<O extends T.Object3D>(object:O):O{
    object.traverse(child=>{if(!(child instanceof T.Mesh))return;
      const original=child.geometry as T.BufferGeometry,geometry=this.artGeometries.get(original)??original.clone();this.artGeometries.set(original,geometry);child.geometry=geometry;
      const clone=(material:T.Material)=>{let owned=this.artMaterials.get(material);if(!owned){owned=material.clone();this.artMaterials.set(material,owned);}return owned;};
      child.material=Array.isArray(child.material)?child.material.map(clone):clone(child.material);
    });return object;
  }

  private releaseBranch(root:T.Object3D,preserveWalls=false){
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
    root.traverse(object=>{
      if(object instanceof T.InstancedMesh)object.dispose();
      if(object instanceof T.Mesh){
        if(!preserveWalls||object.geometry!==this.wallGeometry)geometries.add(object.geometry);
        for(const material of Array.isArray(object.material)?object.material:[object.material])if(!preserveWalls||material!==this.wallMaterial)materials.add(material);
      }
      if(object instanceof T.DirectionalLight||object instanceof T.SpotLight||object instanceof T.PointLight)object.shadow.dispose();
    });
    for(const material of materials){for(const value of Object.values(material))if(value instanceof T.Texture)textures.add(value);material.dispose();}
    for(const texture of textures){texture.dispose();const image=texture.image as {close?:()=>void}|undefined;image?.close?.();}
    for(const geometry of geometries)geometry.dispose();
    root.clear();
  }

  /** Main owns RAF. It must dispose this scene before constructing the next. */
  dispose(){
    if(this.disposed)return;this.disposed=true;window.removeEventListener('resize',this.resizeListener);
    this.releaseBranch(this.scene);this.releaseBranch(this.pickMesh);
    this.wallGeometry.dispose();this.wallMaterial.dispose();
    this.artGeometries.clear();this.artMaterials.clear();this.coastLast.fill(0);this.coastLife.fill(0);
    this.renderer.setAnimationLoop(null);this.renderer.renderLists.dispose();this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
  }

  private gridGeometry(colors:boolean){
    const vertices=new Float32Array(NX*NZ*3),rgb=colors?new Float32Array(NX*NZ*3):null,indices:number[]=[];
    for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){
      const i=z*NX+x;vertices[i*3]=x/SUB-centerX;vertices[i*3+2]=z/SUB-centerZ;
      if(rgb){rgb[i*3]=rgb[i*3+1]=rgb[i*3+2]=1;}
      if(x<NX-1&&z<NZ-1)indices.push(i,i+NX,i+1,i+1,i+NX,i+NX+1);
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(vertices,3));if(rgb)geometry.setAttribute('color',new T.BufferAttribute(rgb,3));geometry.setIndex(indices);return geometry;
  }

  private sample(field:ArrayLike<number>,x:number,z:number){
    x=clamp(x,0,W-1);z=clamp(z,0,H-1);const x0=Math.floor(x),z0=Math.floor(z),x1=Math.min(W-1,x0+1),z1=Math.min(H-1,z0+1);
    return mix(mix(field[idx(x0,z0)],field[idx(x1,z0)],x-x0),mix(field[idx(x0,z1)],field[idx(x1,z1)],x-x0),z-z0);
  }
  private soilField(){
    if(!this.model.previewH)return this.model.bed;
    const display=this.model.previewH.slice();for(const wall of this.model.walls)for(const i of wallCells(wall))display[i]=this.model.bed[i];return display;
  }
  private point(p:Point,extra=0,field:ArrayLike<number>=this.model.bed){return new T.Vector3(p[0]-centerX,this.sample(field,p[0],p[1])*HEIGHT+extra,p[1]-centerZ);}

  private updateTerrain(){
    const field=this.soilField(),positions=this.terrain.geometry.getAttribute('position') as T.BufferAttribute,colors=this.terrain.geometry.getAttribute('color') as T.BufferAttribute;
    for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){
      const i=z*NX+x,gx=x/SUB,gz=z/SUB,j=idx(Math.round(gx),Math.round(gz)),height=this.sample(field,gx,gz),original=this.sample(this.model.baseH,gx,gz);
      positions.setY(i,height*HEIGHT);
      const soil=this.model.editable[j]===1,cut=original-height;
      const interiorStone=!soil&&gx>=3&&gx<=25&&gz>=7&&gz<=20&&!this.homeCells.has(j);
      color.setHex(soil?(cut>.12?0xa45c32:0xc1844c):interiorStone?0xa5a48c:0xe4cfa5);
      if(interiorStone)color.multiplyScalar(.92+.07*Math.sin(height*17+gx*.8)+.045*Math.sin(gx*4.7+gz*3.1));
      if(soil&&this.model.state.perm[j]>.001)color.lerp(wetlandTint,.86);
      const grain=Math.sin(gx*2.31+gz*.83)*Math.cos(gz*2.07-gx*.6)*.035;
      color.multiplyScalar(1+grain-clamp(this.model.state.wet[j],0,1)*.18);
      if(this.model.previewH&&height<this.sample(this.model.bed,gx,gz)-.05)color.lerp(previewTint,.15);
      colors.setXYZ(i,color.r,color.g,color.b);
    }
    positions.needsUpdate=true;colors.needsUpdate=true;this.terrain.geometry.computeVertexNormals();this.terrain.geometry.computeBoundingSphere();
    this.lastPreview=this.model.previewH;this.terrainDirty=false;
  }

  private makeCoastSkirt(){
    const p:number[]=[],c:number[]=[],indices:number[]=[],edge:Point[]=[];
    for(let x=0;x<W;x++)edge.push([x,0]);for(let z=1;z<H;z++)edge.push([W-1,z]);
    for(let x=W-2;x>=0;x--)edge.push([x,H-1]);for(let z=H-2;z>0;z--)edge.push([0,z]);
    for(let k=0;k<edge.length;k++){
      const [x,z]=edge[k],top=this.model.baseH[idx(x,z)]*HEIGHT;
      for(const [level,y]of [top,top-.3,.06].entries()){p.push(x-centerX,y,z-centerZ);color.setHex(level===0?0xd6bc8b:level===1?0xc4a373:0xa68c64);c.push(color.r,color.g,color.b);}
      const a=k*3,b=((k+1)%edge.length)*3,next=edge[(k+1)%edge.length];
      // The receiving coast is an open sloping beach, never a vertical wall.
      if(z===H-1&&next[1]===H-1)continue;
      for(let layer=0;layer<2;layer++)indices.push(a+layer,b+layer,a+layer+1,b+layer,b+layer+1,a+layer+1);
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setAttribute('color',new T.Float32BufferAttribute(c,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));mesh.receiveShadow=true;this.staticObjects.add(mesh);
    const beachP:number[]=[],beachC:number[]=[],beachI:number[]=[];
    for(let row=0;row<5;row++)for(let x=0;x<W;x++){
      const t=row/4,y=mix(this.model.baseH[idx(x,H-1)]*HEIGHT,.07,t),z=H-1-centerZ+t*(1.6+.3*Math.sin(x*.61));
      beachP.push(x-centerX,y,z);color.setHex(0xbbaa7f).multiplyScalar(1-t*.18);beachC.push(color.r,color.g,color.b);
      if(row<4&&x<W-1){const i=row*W+x;beachI.push(i,i+W,i+1,i+1,i+W,i+W+1);}
    }
    const beach=new T.BufferGeometry();beach.setAttribute('position',new T.Float32BufferAttribute(beachP,3));beach.setAttribute('color',new T.Float32BufferAttribute(beachC,3));beach.setIndex(beachI);beach.computeVertexNormals();
    const apron=new T.Mesh(beach,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));apron.receiveShadow=true;this.staticObjects.add(apron);
  }

  private makeCoastDischarge(){
    const positions=new Float32Array((W-2)*8*3),wet=new Float32Array((W-2)*8),indices:number[]=[];
    for(let x=1;x<W-1;x++)for(let row=0;row<4;row++){
      const a=(x-1)*8+row*2;positions[a*3]=x-centerX-.5;positions[(a+1)*3]=x-centerX+.5;
      if(row<3)indices.push(a,a+2,a+1,a+1,a+2,a+3);
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('wetness',new T.BufferAttribute(wet,1));geometry.setIndex(indices);
    const mesh=new T.Mesh(geometry,this.waterMaterial);mesh.renderOrder=3;mesh.frustumCulled=false;this.root.add(mesh);return mesh;
  }

  private makeHomes(){
    this.homes.forEach((at,k)=>{
      const group=new T.Group();group.position.copy(this.point(at,.035));
      const courtyard=addMesh(group,new RoundedBoxGeometry(3.05,.08,2.9,1,.06),new T.MeshStandardMaterial({color:0xd7bc93,roughness:1}),[0,.005,.08]);courtyard.castShadow=false;
      const house=this.ownArt(makeHouse());house.scale.setScalar(.86);house.rotation.y=[-.06,.02,.07][k%3];group.add(house);group.userData.home=k;this.staticObjects.add(group);
    });
  }
  private makeScenery(){
    // Raised fixed shoulders only. Nothing placed in the editable valley is a
    // decorative obstacle or an unmodeled answer wall.
    for(let side=0;side<2;side++)for(let n=0;n<6;n++){
      const gx=side===0?-.25:28.25,gz=1.3+n*3.05;
      if(!this.sceneryClear([gx,gz],1.3))continue;
      const rock=this.ownArt(makeRock(n+side*30));rock.scale.set(2.1+(n%3)*.24,.85+(n%2)*.35,2.3);rock.rotation.y=n*.7;rock.position.copy(this.point([gx,gz]));this.staticObjects.add(rock);
      if(n%2===0){const cap=this.ownArt(makeRock(80+n+side*7));cap.scale.set(1.8,.7,1.7);cap.position.copy(this.point([gx,gz]));cap.position.y+=.57;this.staticObjects.add(cap);}
      const treeAt:Point=[side===0?1.3:26.7,gz+.6];
      if(n%2===0&&gz<16&&this.sceneryClear(treeAt,.8)){const tree=this.ownArt(makeOliveTree(n+side*21,.7));tree.userData.setScenery(true);tree.position.copy(this.point(treeAt));this.staticObjects.add(tree);}
    }
    for(const [k,gx]of [3.5,7.5,20.5,24.5].entries()){
      if(!this.sceneryClear([gx,.25],1.5))continue;
      const rock=this.ownArt(makeRock(210+k));rock.scale.set(2.7,1.05,2.3);rock.rotation.y=k*.7;rock.position.copy(this.point([gx,.25]));this.staticObjects.add(rock);
      const cap=this.ownArt(makeRock(240+k));cap.scale.set(2.15,.65,1.9);cap.position.copy(rock.position);cap.position.y+=.7;this.staticObjects.add(cap);
    }
  }
  private sceneryClear(at:Point,radius:number){
    if(Math.hypot(at[0]-this.source[0],at[1]-this.source[1])<4.1+radius)return false;
    if(this.homes.some(p=>Math.hypot(at[0]-p[0],at[1]-p[1])<2.2+radius))return false;
    for(let z=Math.max(0,Math.floor(at[1]-radius));z<=Math.min(H-1,Math.ceil(at[1]+radius));z++)for(let x=Math.max(0,Math.floor(at[0]-radius));x<=Math.min(W-1,Math.ceil(at[0]+radius));x++)if(this.model.editable[idx(x,z)])return false;
    return true;
  }

  private makeFallbackGate(){
    const stone=new T.MeshStandardMaterial({color:0xe6d0a5,roughness:.94}),blue=new T.MeshStandardMaterial({color:0x1d6687,roughness:.55}),copper=new T.MeshStandardMaterial({color:0xa96633,metalness:.35,roughness:.48});
    addMesh(this.gateHolder,new RoundedBoxGeometry(.6,3.5,.65,1,.1),stone,[-1.6,1.7,0]);addMesh(this.gateHolder,new RoundedBoxGeometry(.6,3.5,.65,1,.1),stone,[1.6,1.7,0]);
    addMesh(this.gateHolder,new RoundedBoxGeometry(3.75,.5,.7,1,.1),stone,[0,3.25,0]);
    const door=addMesh(this.gateHolder,new RoundedBoxGeometry(2.55,2.05,.2,1,.05),blue,[0,1.15,0]);door.name='fallback-gate-panel';
    const wheel=addMesh(this.gateHolder,new T.TorusGeometry(.38,.07,6,20),copper,[0,2.65,.35]);wheel.name='gate-wheel';
  }
  private async loadGate(){
    try{
      const asset=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/sluice-gate.glb`);
      if(this.disposed){this.releaseBranch(asset.scene);return;}
      const box=new T.Box3().setFromObject(asset.scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),originalMaterials=new Set<T.Material>();
      asset.scene.position.sub(new T.Vector3(center.x,box.min.y,center.z));const wrapper=new T.Group();wrapper.scale.setScalar(3.85/Math.max(size.x,size.y,size.z));wrapper.rotation.y=Math.PI;wrapper.add(asset.scene);
      asset.scene.traverse(object=>{if(!(object instanceof T.Mesh))return;object.castShadow=object.receiveShadow=true;
        const original=object.material as T.Material;originalMaterials.add(original);
        const material=original.clone(),compile=material.onBeforeCompile,uniform=this.gateUniform;
        material.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.uniforms.uFreeGate=uniform;
          shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFreeGateLocal;');shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFreeGateLocal=position;');
          shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vFreeGateLocal;uniform float uFreeGate;');shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(abs(vFreeGateLocal.x)<.25&&vFreeGateLocal.y<.07+uFreeGate*.57&&abs(vFreeGateLocal.z)<.22)discard;');
        };material.customProgramCacheKey=()=> 'freeform-owned-gate-opening-v1';object.material=material;
      });
      for(const material of originalMaterials)material.dispose();
      this.releaseBranch(this.gateHolder);this.gateHolder.add(wrapper);this.assets.gate=true;
    }catch(error){if(!this.disposed)console.error('טעינת שער האגן נכשלה',error);}
  }

  private makeWall(wall:WallPreview,preview=false,valid=true){
    const result=new T.Group(),definition={id:wall.id??-1,...wall} as Wall,cells=wallCells(definition);
    if(!cells.length)return result;
    const crest=Math.max(...cells.map(i=>this.model.bed[i]))+WALL_HEIGHT,course=.43;
    const pieces:{i:number;bottom:number;height:number}[]=[];
    for(const i of cells){const bottom=this.model.bed[i],courses=Math.max(1,Math.ceil((crest-bottom)/course));for(let k=0;k<courses;k++)pieces.push({i,bottom:bottom+(crest-bottom)*k/courses,height:(crest-bottom)/courses});}
    const material=preview?new T.MeshStandardMaterial({color:valid?0xb9dcad:0xe89978,transparent:true,opacity:.58,roughness:.9,depthWrite:false}):this.wallMaterial;
    const stones=new T.InstancedMesh(this.wallGeometry,material,pieces.length);stones.castShadow=!preview;stones.receiveShadow=true;
    pieces.forEach((piece,k)=>{dummy.position.set(piece.i%W-centerX,(piece.bottom+piece.height/2)*HEIGHT,Math.floor(piece.i/W)-centerZ);dummy.rotation.set(0,0,0);dummy.scale.set(1,piece.height*HEIGHT*.985,1);dummy.updateMatrix();stones.setMatrixAt(k,dummy.matrix);});
    stones.instanceMatrix.needsUpdate=true;stones.computeBoundingSphere();stones.computeBoundingBox();result.add(stones);result.userData.wallId=wall.id;result.renderOrder=preview?5:0;return result;
  }
  buildObjects(){
    if(this.disposed)return;this.releaseBranch(this.walls,true);for(const wall of this.model.walls)this.walls.add(this.makeWall(wall));
    this.wallKey=this.model.walls.map(w=>`${w.id}:${w.x}:${w.z}:${w.angle}`).join('|');this.terrainDirty=true;
  }
  previewWall(wall:WallPreview|null,valid=true){
    if(this.disposed)return;
    const key=wall?`${wall.x.toFixed(3)}:${wall.z.toFixed(3)}:${wall.angle.toFixed(3)}:${valid}`:'';if(key===this.ghostKey)return;
    this.releaseBranch(this.wallGhost,true);if(wall)this.wallGhost.add(this.makeWall(wall,true,valid));this.ghostKey=key;
  }
  hoverBrush(point:Point|null,valid=true){
    this.brush.visible=!!point;if(point){this.brush.position.copy(this.point(point,.045,this.soilField()));for(const child of this.brush.children)(child as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>).material.color.setHex(valid?0xffedbb:0xf0a082);}
  }
  cut(point:Point){this.burstPoint.copy(this.point(point,.12));this.burst=1;this.terrainDirty=true;}

  freezePicking(){this.updatePickGeometry();this.frozen=true;}
  refreshPicking(){this.frozen=false;this.updatePickGeometry();}
  private updatePickGeometry(){
    const p=this.pickMesh.geometry.getAttribute('position') as T.BufferAttribute;
    for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++)p.setY(z*NX+x,this.sample(this.model.bed,x/SUB,z/SUB)*HEIGHT);
    p.needsUpdate=true;this.pickMesh.geometry.computeBoundingSphere();this.pickMesh.geometry.computeBoundingBox();this.pickMesh.updateMatrixWorld(true);
  }
  pick(x:number,y:number):Point|null{
    if(this.disposed)return null;
    const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);this.pickRay.setFromCamera(this.pointer,this.camera);
    const wallHit=!this.frozen?this.pickRay.intersectObject(this.walls,true)[0]:null,groundHit=this.pickRay.intersectObject(this.pickMesh)[0];
    const hit=wallHit&&(!groundHit||wallHit.distance<groundHit.distance)?wallHit:groundHit;if(!hit)return null;
    const gx=hit.point.x+centerX,gz=hit.point.z+centerZ;return gx>=0&&gx<W&&gz>=0&&gz<H?[gx,gz]:null;
  }
  screen(point:Point,y=0){const p=this.point(point,y);p.project(this.camera);const rect=this.renderer.domElement.getBoundingClientRect();return{x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2};}

  private resize(){
    if(this.disposed)return;
    const parent=this.renderer.domElement.parentElement!,width=parent.clientWidth,height=parent.clientHeight;this.renderer.setSize(width,height);
    const phone=width<700;this.camera.position.set(phone?1.5:10,phone?66:28,phone?18:36);this.camera.lookAt(0,2,0);
    this.camera.left=-18*width/height;this.camera.right=18*width/height;this.camera.top=18;this.camera.bottom=-18;this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);
    const points:T.Vector3[]=[];
    // Fit the actual editable mask/relief, never a particular level's corners.
    for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(this.model.editable[idx(x,z)]||(!phone&&(x===0||x===W-1||z===0||z===H-1)))points.push(this.point([x,z],.15));
    for(const sink of this.model.state.level.sinks)points.push(this.point(sink.at,.15));
    const sourceBase=this.point(this.source),direction=this.sourceDirection;
    for(let a=0;a<16;a++){const angle=a/16*Math.PI*2;points.push(sourceBase.clone().add(new T.Vector3(Math.cos(angle)*3.65,1.65,Math.sin(angle)*3.65)));}
    points.push(sourceBase.clone().add(new T.Vector3(direction.x*3.1,3.8,direction.y*3.1)));
    for(const home of this.homes)for(const dx of [-1.6,1.6])for(const dz of [-1.45,1.45])points.push(this.point(home,2.7).add(new T.Vector3(dx,0,dz)));
    const ndc=points.map(p=>p.clone().project(this.camera));let minX=Math.min(...ndc.map(p=>p.x)),maxX=Math.max(...ndc.map(p=>p.x)),minY=Math.min(...ndc.map(p=>p.y)),maxY=Math.max(...ndc.map(p=>p.y));
    const availableW=width-(phone?26:70),availableH=height-(phone?145:105)-(phone?165:130),scale=Math.max((maxX-minX)*width/2/availableW,(maxY-minY)*height/2/Math.max(120,availableH));
    this.camera.left*=scale;this.camera.right*=scale;this.camera.top*=scale;this.camera.bottom*=scale;this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);
    const fitted=points.map(p=>p.clone().project(this.camera));
    minX=Math.min(...fitted.map(p=>p.x));maxX=Math.max(...fitted.map(p=>p.x));minY=Math.min(...fitted.map(p=>p.y));maxY=Math.max(...fitted.map(p=>p.y));
    const top=phone?145:105,bottom=phone?165:130,targetY=1-2*(top+(height-top-bottom)/2)/height;
    const right=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,1);
    this.camera.position.addScaledVector(right,(minX+maxX)/2*(this.camera.right-this.camera.left)/2).addScaledVector(up,((minY+maxY)/2-targetY)*(this.camera.top-this.camera.bottom)/2);
    this.camera.updateMatrixWorld(true);
  }

  render(time:number,dt=.016){
    if(this.disposed)return;
    this.seaClock.value=this.reduced?0:time;
    this.frame++;if(this.terrainDirty||this.lastPreview!==this.model.previewH||this.frame%24===0)this.updateTerrain();
    const key=this.model.walls.map(w=>`${w.id}:${w.x}:${w.z}:${w.angle}`).join('|');if(key!==this.wallKey)this.buildObjects();
    const s=this.model.state,source=this.source,direction=this.sourceDirection,remaining=s.sources.reduce((sum,pulse)=>sum+pulse.water,0),total=s.level.sources.reduce((sum,pulse)=>sum+pulse.volume,0);
    const positions=this.water.geometry.getAttribute('position') as T.BufferAttribute,wet=this.water.geometry.getAttribute('wetness') as T.BufferAttribute;
    for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){
      const i=z*NX+x,gx=x/SUB,gz=z/SUB;let w=this.sample(s.w,gx,gz),sum=0,weight=0;
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const cx=Math.round(gx)+dx,cz=Math.round(gz)+dz;if(cx<0||cx>=W||cz<0||cz>=H)continue;const j=idx(cx,cz);if(s.w[j]<.004)continue;
        const q=s.w[j]/(.45+(cx-gx)**2+(cz-gz)**2);sum+=(s.h[j]+s.w[j])*q;weight+=q;
      }
      const h=weight?sum/weight:this.sample(s.h,gx,gz),sx=gx-source[0],sz=gz-source[1],along=sx*direction.x+sz*direction.y,across=sx*direction.y-sz*direction.x;
      if(Math.hypot(sx,sz)<3.03&&!(along>2.55&&Math.abs(across)<1.25))w=0;
      positions.setY(i,h*HEIGHT+.026);wet.setX(i,w);
    }
    positions.needsUpdate=true;wet.needsUpdate=true;this.water.geometry.computeVertexNormals();this.waterMaterial.userData.tick?.(time);this.poolMaterial.userData.tick?.(time);
    const coastP=this.coastWater.geometry.getAttribute('position') as T.BufferAttribute,coastWet=this.coastWater.geometry.getAttribute('wetness') as T.BufferAttribute;
    const coastReceived=new Float64Array(W),coastAt=new Float64Array(W).fill(H-2);
    s.level.sinks.forEach((sink,k)=>{const x=Math.round(sink.at[0]);if(x>0&&x<W-1&&sink.at[1]>=H-3){coastReceived[x]+=s.sinks[k].water;coastAt[x]=sink.at[1];}});
    for(let x=1;x<W-1;x++){
      const received=coastReceived[x],delta=received-this.coastLast[x];this.coastLast[x]=received;
      if(s.mode==='plan'||delta<-.001)this.coastLife[x]=0;else if(delta>.00001)this.coastLife[x]=.25;else if(s.mode==='run')this.coastLife[x]=Math.max(0,this.coastLife[x]-dt);
      const active=this.coastLife[x]>.001;
      for(let row=0;row<4;row++)for(let side=0;side<2;side++){
        const k=(x-1)*8+row*2+side,t=row/3,z=mix(coastAt[x]-centerZ,H-1-centerZ+1.6,t);
        const y=z<=H-1-centerZ?this.sample(s.h,x,z+centerZ)*HEIGHT+.045:mix(this.model.bed[idx(x,H-1)]*HEIGHT,.07,clamp((z-(H-1-centerZ))/(1.6+.3*Math.sin(x*.61)),0,1))+.045;
        coastP.setXYZ(k,x-centerX+(side?1:-1)*.51,y,z);coastWet.setX(k,active?.1:0);
      }
    }
    coastP.needsUpdate=true;coastWet.needsUpdate=true;this.coastWater.geometry.computeVertexNormals();
    this.pool.position.y=.08+1.22*clamp(remaining/Math.max(.001,total),0,1);
    // Future forecast pulses remain held; visibly close between release windows.
    const releasing=s.time>0&&s.sources.some((pulse,k)=>pulse.water>.001&&(s.level.sources[k].delay??0)<=s.time+1e-7);
    this.gateUniform.value=mix(this.gateUniform.value,releasing?1:0,this.reduced?1:.22);
    const fallback=this.gateHolder.getObjectByName('fallback-gate-panel');if(fallback)fallback.position.y=1.15+this.gateUniform.value*1.85;
    const active:number[]=[];for(let i=0;i<s.w.length;i++)if(s.w[i]>.035&&Math.hypot(i%W-source[0],Math.floor(i/W)-source[1])>3.1)active.push(i);
    for(let k=0;k<340;k++){
      if(active.length&&k<active.length*4){const i=active[k%active.length],x=i%W,z=Math.floor(i/W),phase=this.reduced?.5:(time*.58+k*.618)%1;dummy.position.set(x-centerX+(phase-.5)*.75,(s.h[i]+s.w[i])*HEIGHT+.055,z-centerZ+Math.sin(k*13.7)*.33);dummy.scale.set(.6,.22,1.25);}else dummy.scale.setScalar(0);
      dummy.rotation.set(0,0,0);dummy.updateMatrix();this.foam.setMatrixAt(k,dummy.matrix);
    }this.foam.instanceMatrix.needsUpdate=true;
    for(let k=0;k<64;k++){const a=k/64*Math.PI*2+time*.1,r=2.7+Math.sin(k*2.4+time)*.2;dummy.position.set(source[0]-centerX+Math.cos(a)*r,this.sourceBase+this.pool.position.y+.065,source[1]-centerZ+Math.sin(a)*r);dummy.scale.setScalar(remaining>.1?.45+Math.sin(k*6.1)**2*.4:0);dummy.updateMatrix();this.sourceFoam.setMatrixAt(k,dummy.matrix);}this.sourceFoam.instanceMatrix.needsUpdate=true;
    this.burst=Math.max(0,this.burst-dt*1.8);for(let k=0;k<36;k++){const p=1-this.burst,a=k*2.4;dummy.position.set(this.burstPoint.x+Math.cos(a)*p*.8,this.burstPoint.y+Math.sin(p*Math.PI)*(.25+k%3*.15),this.burstPoint.z+Math.sin(a)*p*.8);dummy.scale.setScalar(this.burst>.01?this.burst*.8:0);dummy.updateMatrix();this.sand.setMatrixAt(k,dummy.matrix);}this.sand.instanceMatrix.needsUpdate=true;
    this.renderer.render(this.scene,this.camera);
  }
}
