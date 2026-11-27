import * as THREE from 'three';

export type PortraitScene = { setFrame(second: boolean): void; dispose(): void };

const vertex = `
  varying vec2 vUv;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform float uStrength;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 p = position;
    float distanceToPointer = distance(uv, uPointer);
    float influence = exp(-distanceToPointer * distanceToPointer * 12.0);
    float edge = uv.x * (1.0-uv.x) * uv.y * (1.0-uv.y) * 16.0;
    p.z += sin(distanceToPointer * 14.0 - uTime * 2.0) * influence * edge * uStrength * 0.055;
    p.xy += uVelocity * influence * edge * uStrength * 0.03;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragment = `
  varying vec2 vUv;
  uniform sampler2D uFirst;
  uniform sampler2D uSecond;
  uniform float uImageAspect[2];
  uniform float uAspect;
  uniform float uMix;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform float uStrength;
  vec2 cover(vec2 uv, float imageAspect) {
    vec2 scale = uAspect > imageAspect ? vec2(1.0, imageAspect/uAspect) : vec2(uAspect/imageAspect, 1.0);
    return vec2((uv.x-0.5)*scale.x+0.5, uv.y*scale.y+1.0-scale.y);
  }
  void main() {
    vec2 offset = uVelocity * uStrength * exp(-distance(vUv,uPointer)*8.0) * 0.006;
    vec4 first = texture2D(uFirst, cover(vUv+offset, uImageAspect[0]));
    vec4 second = texture2D(uSecond, cover(vUv-offset, uImageAspect[1]));
    float radius = distance(vec2(vUv.x*uAspect, vUv.y),vec2(uPointer.x*uAspect,uPointer.y));
    float reveal = smoothstep(radius-0.16,radius+0.16,uMix*(uAspect+1.0));
    if (uMix<0.001) reveal=0.0;
    if (uMix>0.999) reveal=1.0;
    gl_FragColor = mix(first,second,reveal);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export async function mountPortrait(host: HTMLDivElement, urls: string[], onReady: () => void, onUnavailable: () => void): Promise<PortraitScene> {
  const loader = new THREE.TextureLoader();
  const results = await Promise.allSettled(urls.map(url => loader.loadAsync(url)));
  const textures = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
  if (textures.length !== 2) { textures.forEach(texture => texture.dispose()); throw new Error('Portrait texture unavailable'); }
  textures.forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.generateMipmaps = false; texture.minFilter = THREE.LinearFilter; });
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }); }
  catch (error) { textures.forEach(texture => texture.dispose()); throw error; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0,0);
  renderer.domElement.setAttribute('aria-hidden','true');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const duration = () => Math.max(1,parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-slow'))/6);
  let settle = duration();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45,1,.1,10);
  camera.position.z = 1 / Math.tan(Math.PI/8);
  const uniforms = {
    uFirst: {value:textures[0]}, uSecond:{value:textures[1]},
    uImageAspect:{value:textures.map(texture => texture.image.width / texture.image.height)},
    uAspect:{value:1},uMix:{value:0},uPointer:{value:new THREE.Vector2(.5,.5)},
    uVelocity:{value:new THREE.Vector2()},uStrength:{value:0},uTime:{value:0},
  };
  const geometry = new THREE.PlaneGeometry(2,2,36,48);
  const material = new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false});
  const mesh = new THREE.Mesh(geometry,material);
  scene.add(mesh);
  let target = 0, raf = 0, last = 0, visible = true, disposed = false, ready = false;
  const aim = new THREE.Vector2(.5,.5);
  function frame(time:number) {
    const dt = Math.min(last ? time-last : 16,64);last=time;
    const k = reduced.matches ? 1 : 1-Math.exp(-dt/settle);
    uniforms.uMix.value += (target-uniforms.uMix.value)*k;
    uniforms.uVelocity.value.copy(aim).sub(uniforms.uPointer.value);
    uniforms.uPointer.value.lerp(aim,k);
    uniforms.uStrength.value *= reduced.matches ? 0 : Math.exp(-dt/170);
    uniforms.uTime.value = time*.001;
    renderer.render(scene,camera);
    if(!ready) {ready=true;onReady();}
    const moving = Math.abs(target-uniforms.uMix.value)>0.001 || uniforms.uVelocity.value.length()>0.001 || uniforms.uStrength.value>0.001;
    raf = moving ? requestAnimationFrame(frame) : 0;
    if(!raf)last=0;
  }
  function wake(){if(!disposed&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  function pause(){cancelAnimationFrame(raf);raf=last=0;}
  const resize = new ResizeObserver(()=>{
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();
    uniforms.uAspect.value=width/height;mesh.scale.x=width/height;wake();
  });
  const intersection = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else pause();});
  const move = (event:PointerEvent)=>{
    if(reduced.matches||!pointer.matches||event.pointerType!=='mouse')return;
    const box=host.getBoundingClientRect();
    const x=(event.clientX-box.left)/box.width,y=1-(event.clientY-box.top)/box.height;
    uniforms.uStrength.value=Math.min(1,uniforms.uStrength.value+Math.hypot(x-aim.x,y-aim.y)*3);
    aim.set(x,y);wake();
  };
  const reset=()=>{aim.set(.5,.5);if(reduced.matches){uniforms.uPointer.value.copy(aim);uniforms.uStrength.value=0;}wake();};
  const motion=()=>{settle=duration();reset();};
  const visibility=()=>{if(document.hidden)pause();else wake();};
  const lost=(event:Event)=>{event.preventDefault();onUnavailable();dispose();};
  function dispose(){
    if(disposed)return;disposed=true;pause();resize.disconnect();intersection.disconnect();
    host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',reset);
    reduced.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);
    renderer.domElement.removeEventListener('webglcontextlost',lost);
    textures.forEach(texture=>texture.dispose());geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();
  }
  host.appendChild(renderer.domElement);resize.observe(host);intersection.observe(host);
  host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',reset);
  reduced.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
  renderer.domElement.addEventListener('webglcontextlost',lost);
  return {setFrame(second){target=second?1:0;if(!ready)uniforms.uMix.value=target;wake();},dispose};
}
