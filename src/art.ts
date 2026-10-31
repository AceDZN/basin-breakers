import * as T from 'three';

/** Original, deterministic, code-made material detail. No image/network assets. */
function random(seed:number){let value=seed>>>0;return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};}

function texture(kind:'stone'|'soil',seed:number){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const context=canvas.getContext('2d')!;const pixels=context.createImageData(256,256);const rng=random(seed);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const i=(y*256+x)*4,grain=(rng()-.5)*12;
    const layer=Math.sin(y*.095+Math.sin(x*.024)*1.4)*3+Math.sin(x*.06+y*.025)*2;
    const base=kind==='stone'?[235,224,200]:[207,191,162];
    for(let k=0;k<3;k++)pixels.data[i+k]=base[k]+grain+layer;
    pixels.data[i+3]=255;
  }
  context.putImageData(pixels,0,0);
  // Sparse tiny mineral flecks; no strong seams that reveal the repeated UV tile.
  for(let n=0;n<85;n++){
    context.fillStyle=n%4===0?'rgba(255,252,233,.17)':'rgba(97,79,53,.08)';
    context.beginPath();context.ellipse(rng()*256,rng()*256,.5+rng()*1.4,.4+rng()*.8,rng()*Math.PI,0,Math.PI*2);context.fill();
  }
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;return map;
}

export function createStoneTexture(seed=12391){return texture('stone',seed);}
export function createSoilTexture(seed=5721){return texture('soil',seed);}

/**
 * Keeps the terrain's vertex colors (wetness/permeability/edits) authoritative.
 * Continuous world-space grain and horizontal strata cross cell boundaries so
 * the precise editable heightfield reads as one limestone catchment.
 * Compatible with InstancedMesh; no extra draw calls or required texture files.
 */
export function applyLimestoneSurface<TMaterial extends T.MeshStandardMaterial>(material:TMaterial):TMaterial{
  const previousCompile=material.onBeforeCompile;
  material.onBeforeCompile=function(shader,renderer){
    previousCompile.call(this,shader,renderer);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
varying vec3 vBasinStoneWorld;
varying float vBasinStoneTop;`);
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
vec4 basinStoneLocal = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
basinStoneLocal = instanceMatrix * basinStoneLocal;
#endif
vBasinStoneWorld = (modelMatrix * basinStoneLocal).xyz;
vBasinStoneTop = abs(normal.y);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vBasinStoneWorld;
varying float vBasinStoneTop;
float basinStoneHash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float basinStoneNoise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(basinStoneHash(i),basinStoneHash(i+vec2(1.0,0.0)),f.x),
             mix(basinStoneHash(i+vec2(0.0,1.0)),basinStoneHash(i+vec2(1.0,1.0)),f.x),f.y);
}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 basinP=vBasinStoneWorld;
float basinBroad=basinStoneNoise(basinP.xz * 0.62 + basinP.y * 0.18);
float basinGrain=basinStoneNoise(basinP.xz * 8.0 + vec2(basinP.y * 7.0, basinP.y * 3.0));
float basinLayer=sin(basinP.y * 15.0 + basinStoneNoise(basinP.xz * 0.22) * 1.8);
float basinSide=1.0-smoothstep(0.35,0.9,vBasinStoneTop);
float basinDetail=0.94 + basinBroad * 0.09 + (basinGrain-0.5) * 0.065;
basinDetail += basinSide * basinLayer * 0.035;
diffuseColor.rgb *= basinDetail;
diffuseColor.rgb *= mix(vec3(1.0),vec3(0.98,0.955,0.91),basinSide * 0.45);`);
  };
  material.customProgramCacheKey=()=> 'basin-limestone-world-v1';
  material.needsUpdate=true;return material;
}

/** Optional visible cutaway foundation; top at -1 to meet the heightfield. */
export function createStrataBase(width:number,depth:number){
  const root=new T.Group();const layers=[{h:.26,c:0xb8a17a},{h:.34,c:0xc8b28b},{h:.3,c:0x8f9879}];let top=-1;
  for(const layer of layers){const material=new T.MeshStandardMaterial({color:layer.c,roughness:1});applyLimestoneSurface(material);
    const block=new T.Mesh(new T.BoxGeometry(width-.08,layer.h,depth-.08),material);block.position.y=top-layer.h/2;block.receiveShadow=true;root.add(block);top-=layer.h;}
  return root;
}
