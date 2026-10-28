import * as THREE from 'three';

const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#899c9f');
scene.fog = new THREE.FogExp2('#a7a99d', 0.0095);
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

scene.add(new THREE.HemisphereLight('#e1e3d1', '#49565a', 2.1));
const sun = new THREE.DirectionalLight('#ffe2b3', 3.1);
sun.position.set(-30, 48, -24);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, far: 110 });
sun.shadow.bias = -0.00022;
scene.add(sun);

const mat = (color, roughness = 1, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const groundMat = mat('#75846e');
const groundGeo = new THREE.PlaneGeometry(150, 150, 90, 90);
const pos = groundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i);
  pos.setZ(i, 0.34 * Math.sin(x * 0.08) + 0.25 * Math.cos(y * 0.11) + 0.15 * Math.sin((x + y) * 0.18));
}
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const sphereGeo = new THREE.SphereGeometry(1, 9, 7);
function rock(x, y, z, s, color = '#82857b') {
  const mesh = new THREE.Mesh(sphereGeo, mat(color));
  mesh.position.set(x, y, z); mesh.scale.set(s, s * 0.7, s * 0.82); mesh.rotation.y = Math.random() * 4;
  mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
function tree(x, z, scale = 1, autumn = false) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); scene.add(g);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .22, 2.3, 6), mat('#51483b'));
  trunk.position.y = 1.1; trunk.castShadow = true; g.add(trunk);
  const shades = autumn ? ['#aa7756', '#8f7056', '#c39364'] : ['#546d59', '#6b8064', '#435d54'];
  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat(shades[(i + Math.floor(x + z)) % shades.length]));
    crown.position.set((i - 1) * .34, 2.05 + i * .51, i % 2 ? .12 : -.12);
    crown.scale.set(1.05 - i * .11, 1.13, .98); crown.castShadow = true; g.add(crown);
  }
  return g;
}

// A broad, readable path leads from the overlook into a ring of ancient stones.
const path = new THREE.Mesh(new THREE.PlaneGeometry(12, 80), mat('#8e8979'));
path.rotation.x = -Math.PI / 2; path.position.set(0, .035, -19); path.receiveShadow = true; scene.add(path);
const pathEdge = mat('#a49b86');
for (const side of [-1, 1]) {
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(.38, 76), pathEdge);
  edge.rotation.x = -Math.PI / 2; edge.position.set(side * 6.15, .045, -19); scene.add(edge);
}
for (let i = 0; i < 100; i++) {
  const x = (Math.random() - .5) * 2, z = -56 + Math.random() * 73;
  const angle = Math.atan2(x, 7) + (Math.random() - .5) * .13;
  const px = Math.sin(angle) * (7 + Math.random() * 10), pz = z;
  if (Math.abs(px) < 7 && pz > -47) continue;
  if (Math.random() < .83) tree(px, pz, .7 + Math.random() * .7, Math.random() < .23);
  else rock(px, .22, pz, .35 + Math.random() * .75);
}
// Distant ridge silhouettes soften the edge of the playable clearing.
for (let i = 0; i < 18; i++) {
  const ridge = new THREE.Mesh(new THREE.ConeGeometry(5 + Math.random() * 7, 10 + Math.random() * 13, 6), mat(i % 2 ? '#687873' : '#77817a'));
  ridge.position.set((i - 8.5) * 9 + (Math.random() - .5) * 5, 2.8, -67 - Math.random() * 12);
  ridge.scale.z = .56; ridge.rotation.y = Math.random(); scene.add(ridge);
}

// Sunken waystone ruin: visibly framed from the spawn path.
const stoneMat = mat('#777b75');
const ruins = new THREE.Group(); ruins.position.set(-13, 0, -23); scene.add(ruins);
for (let i = 0; i < 6; i++) {
  const a = i * Math.PI / 3;
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 4.3, 1.15), stoneMat);
  pillar.position.set(Math.cos(a) * 6, 2.15, Math.sin(a) * 6); pillar.rotation.y = a * .2; pillar.castShadow = true; pillar.receiveShadow = true; ruins.add(pillar);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.45, .24, 1.4), mat('#a09378'));
  cap.position.set(Math.cos(a) * 6, 4.36, Math.sin(a) * 6); cap.rotation.y = a * .2; ruins.add(cap);
}
const dais = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5, .38, 8), mat('#817d6e'));
dais.position.y = .2; dais.receiveShadow = true; ruins.add(dais);
const rune = new THREE.Mesh(new THREE.TorusGeometry(2.7, .045, 6, 64), new THREE.MeshBasicMaterial({ color: '#dfbd7d' }));
rune.rotation.x = Math.PI / 2; rune.position.y = .42; ruins.add(rune);

// Handmade low-poly traveler with a light blade; no external character assets.
const player = new THREE.Group(); scene.add(player);
const skin = mat('#dfbd9d'), coat = mat('#344353'), mantle = mat('#536774'), gold = mat('#d4b77e', .42, { metalness: .36 });
function capsulePart(parent, geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); mesh.castShadow = true; parent.add(mesh); return mesh;
}
const body = new THREE.Group(); player.add(body);
capsulePart(body, new THREE.CapsuleGeometry(.36, .72, 4, 8), coat, 0, 1.05, 0);
capsulePart(body, new THREE.SphereGeometry(.23, 8, 6), skin, 0, 1.93, 0);
capsulePart(body, new THREE.ConeGeometry(.33, .32, 7), mat('#c9d3c9'), 0, 2.18, -.02);
const hair = capsulePart(body, new THREE.SphereGeometry(.235, 8, 6), mat('#353c42'), 0, 2.04, -.04); hair.scale.set(1,.63,1.03);
capsulePart(body, new THREE.BoxGeometry(.13,.83,.17), mantle, -.32, 1.02,-.18, 0,0,-.19);
const arm = new THREE.Group(); arm.position.set(.32,1.48,0); body.add(arm);
capsulePart(arm, new THREE.CapsuleGeometry(.105,.46,3,6), coat, 0,-.27,0,0,0,-.33);
capsulePart(arm, new THREE.CylinderGeometry(.045,.08,.85,5), gold, .1,-.53,.3, Math.PI/2,0,-.32);
const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(.045,.19,5), mat('#dce3d2',.23,{metalness:.5,emissive:'#839c97',emissiveIntensity:.3}));
bladeTip.position.set(.1,-.53,.78); bladeTip.rotation.x=Math.PI/2; arm.add(bladeTip);
player.position.set(0,0,7);

const stalker = new THREE.Group(); scene.add(stalker); stalker.position.set(2,0,-8);
const enemyCore = new THREE.Mesh(new THREE.IcosahedronGeometry(.72,1), mat('#353843',.57,{emissive:'#492b40',emissiveIntensity:.54})); enemyCore.position.y=1.05; enemyCore.castShadow=true; stalker.add(enemyCore);
const enemyHead = new THREE.Mesh(new THREE.IcosahedronGeometry(.4,1), mat('#596069')); enemyHead.position.set(0,1.88,.03); enemyHead.castShadow=true; stalker.add(enemyHead);
const eyeMat = new THREE.MeshBasicMaterial({color:'#f6a887'});
for(const x of [-.16,.16]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.06,6,6),eyeMat);eye.position.set(x,1.91,.36);stalker.add(eye)}
for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.ConeGeometry(.16,.94,5),mat('#343840'));leg.position.set(side*.36,.43,0);leg.rotation.z=side*-.28;leg.castShadow=true;stalker.add(leg)}
const enemyAura=new THREE.PointLight('#c75a5c',2,7);enemyAura.position.y=1.5;stalker.add(enemyAura);

const pickups=[];
function shard(x,z){
  const group=new THREE.Group();group.position.set(x,.55,z);scene.add(group);
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.36,0),mat('#dbd9a2',.22,{metalness:.27,emissive:'#bdca83',emissiveIntensity:.7}));crystal.scale.y=1.45;crystal.castShadow=true;group.add(crystal);
  const glow=new THREE.PointLight('#d9dda0',1.3,4);group.add(glow);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.018,5,24),new THREE.MeshBasicMaterial({color:'#e4d7a0',transparent:true,opacity:.66}));ring.rotation.x=Math.PI/2;ring.position.y=-.24;group.add(ring);
  pickups.push({group,crystal});
}
shard(-5,-7); shard(7,-19); shard(-17,-23);
// A scatter of smaller pale flowers and grass clumps adds detail along the way.
for(let i=0;i<350;i++){
  const x=(Math.random()-.5)*45,z=-43+Math.random()*56;
  if(Math.abs(x)<6.5)continue;
  const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.09+Math.random()*.08,0),mat(Math.random()<.5?'#ddcba5':'#c2c9a4'));
  flower.position.set(x,.11,z); flower.scale.y=1.3; scene.add(flower);
}
for(let i=0;i<45;i++) rock(-20+Math.random()*40,.16,-40+Math.random()*48,.18+Math.random()*.34,i%2?'#8d8e81':'#747c71');

const slashMat = new THREE.MeshBasicMaterial({color:'#ecddad',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});
const slash = new THREE.Mesh(new THREE.TorusGeometry(1.4,.055,5,34,Math.PI*1.2),slashMat);
slash.visible=false; slash.renderOrder=5; scene.add(slash);
const hitFlash = new THREE.MeshBasicMaterial({color:'#ffe7b3',transparent:true,opacity:0});
enemyCore.material = enemyCore.material.clone();
const keys=new Set();let started=false, yaw=0, pitch=.24, dragging=false,lastX=0,lastY=0, health=100, stamina=100, enemyHealth=100, shards=0, invuln=0, attackTime=0, dodgeTime=0, hitCooldown=0, noticeTime=0, toastTime=0, lootTime=0, dead=false;
const hud=document.querySelector('#hud'), title=document.querySelector('#title-screen'), loading=document.querySelector('#loading');
function toast(message){const e=document.querySelector('#toast');e.textContent=message;e.classList.add('show');noticeTime=2.4}
document.querySelector('#begin').addEventListener('click',()=>{if(started)return;started=true;title.classList.add('leaving');hud.classList.remove('hidden');setTimeout(()=>title.classList.add('hidden'),900);toast('The wind carries a strange, familiar note.')});
addEventListener('keydown',e=>{keys.add(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='ShiftLeft'||e.code==='ShiftRight')dodge()});
addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointerdown',e=>{if(!started)return;canvas.setPointerCapture(e.pointerId);dragging=true;lastX=e.clientX;lastY=e.clientY;if(e.button===0)attack()});
canvas.addEventListener('pointerup',()=>dragging=false);
canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw-=(e.clientX-lastX)*.004;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,-.3,.75);lastX=e.clientX;lastY=e.clientY});
addEventListener('contextmenu',e=>e.preventDefault());
function attack(){if(!started||dead||attackTime>0)return;attackTime=.38;slash.visible=true;slashMat.opacity=.9;const d=player.position.distanceTo(stalker.position);if(d<3.5&&enemyHealth>0){enemyHealth=Math.max(0,enemyHealth-34);stalker.userData.hit=.27;document.querySelector('#enemy-status').classList.remove('hidden');document.querySelector('#enemy-fill').style.width=`${enemyHealth}%`;toast(enemyHealth===0?'The veil grows quiet. A sunshard stirs.':'Your blade finds its mark.');if(enemyHealth===0){const g=new THREE.Group();g.position.copy(stalker.position);scene.add(g);const shardMesh=new THREE.Mesh(new THREE.OctahedronGeometry(.32),mat('#d9dfa6',.2,{emissive:'#bdca83',emissiveIntensity:.8}));shardMesh.position.y=1;g.add(shardMesh);g.userData.enemyDrop=true;pickups.push({group:g,crystal:shardMesh});stalker.visible=false}}}
function dodge(){if(!started||dead||stamina<24||dodgeTime>0)return;stamina-=24;dodgeTime=.46;invuln=.56;}
function update(dt,time){
  attackTime=Math.max(0,attackTime-dt);dodgeTime=Math.max(0,dodgeTime-dt);invuln=Math.max(0,invuln-dt);hitCooldown=Math.max(0,hitCooldown-dt);
  if(attackTime>0){slash.position.copy(player.position);slash.position.y=1.15;slash.rotation.set(Math.PI/2,0,player.rotation.y-.4);slash.visible=true;slashMat.opacity=attackTime/.38*.8}else slash.visible=false;
  const moving=started&&!dead;
  const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
  const strafe=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  if(moving&&(forward||strafe)){
    const speed=dodgeTime>0?15:keys.has('ControlLeft')?4.2:6.2;
    const len=Math.hypot(forward,strafe),f=forward/len,s=strafe/len;
    const dx=(Math.sin(yaw)*f+Math.cos(yaw)*s)*speed*dt,dz=(Math.cos(yaw)*f-Math.sin(yaw)*s)*speed*dt;
    player.position.x=THREE.MathUtils.clamp(player.position.x+dx,-34,34);player.position.z=THREE.MathUtils.clamp(player.position.z+dz,-47,16);
    player.rotation.y=Math.atan2(dx,dz);body.position.y=Math.sin(time*12)*.055;
  }else body.position.y=Math.sin(time*2)*.022;
  if(dodgeTime>0)body.rotation.x=-.24*Math.sin(dodgeTime/.46*Math.PI);
  else body.rotation.x=THREE.MathUtils.damp(body.rotation.x,0,9,dt);
  stamina=Math.min(100,stamina+dt*(dodgeTime>0?0:13));
  if(enemyHealth>0){
    const dx=player.position.x-stalker.position.x,dz=player.position.z-stalker.position.z,d=Math.hypot(dx,dz);
    if(d<12){document.querySelector('#enemy-status').classList.remove('hidden');stalker.rotation.y=Math.atan2(dx,dz);stalker.position.y=.08+Math.sin(time*4)*.11;
      if(stalker.userData.hit>0){stalker.userData.hit-=dt;stalker.position.x-=dx/(d||1)*dt*5;stalker.position.z-=dz/(d||1)*dt*5;enemyCore.material.emissive.set('#d57d65')}
      else{enemyCore.material.emissive.set('#492b40');if(d>1.7){stalker.position.x+=dx/(d||1)*dt*1.9;stalker.position.z+=dz/(d||1)*dt*1.9}else if(hitCooldown<=0&&invuln<=0){health=Math.max(0,health-12);hitCooldown=1.2;toast(health===0?'You fall beneath the veil. The trail remains.':'The stalker strikes. Find the rhythm, then dodge.');if(health===0){dead=true;setTimeout(()=>{health=100;enemyHealth=100;stalker.position.set(2,0,-8);stalker.visible=true;stalker.userData.hit=0;document.querySelector('#enemy-fill').style.width='100%';document.querySelector('#enemy-status').classList.add('hidden');dead=false;player.position.set(0,0,7);toast('You wake at the edge of the clearing.')},2300)}}}
    }
  }
  for(const p of pickups){p.group.position.y=.52+Math.sin(time*2.7+p.group.position.x)*.13;p.group.rotation.y=time*.5;if(started&&p.group.position.distanceTo(player.position)<1.7){scene.remove(p.group);p.collected=true;shards++;document.querySelector('#quest-count').textContent=`${Math.min(shards,3)} / 3`;document.querySelector('#quest-progress').style.width=`${Math.min(shards,3)/3*100}%`;const loot=document.querySelector('#loot-toast');loot.classList.add('show');lootTime=2.8;toast(shards>=3?'All the sunshards hum in unison. The waystone answers.':'A sunshard remembers the warmth of another dawn.');}}
  for(let i=pickups.length-1;i>=0;i--)if(pickups[i].collected)pickups.splice(i,1);
  document.querySelector('#health-fill').style.width=`${health}%`;document.querySelector('#health-number').textContent=health;document.querySelector('#stamina-fill').style.width=`${stamina}%`;document.querySelector('#stamina-number').textContent=Math.round(stamina);
  if(noticeTime>0&&(noticeTime-=dt)<=0)document.querySelector('#toast').classList.remove('show');if(lootTime>0&&(lootTime-=dt)<=0)document.querySelector('#loot-toast').classList.remove('show');
  const follow=new THREE.Vector3(player.position.x,1.5,player.position.z);const distance=9.7;const desired=new THREE.Vector3(follow.x-Math.sin(yaw)*Math.cos(pitch)*distance,follow.y+Math.sin(pitch)*distance+1,follow.z+Math.cos(yaw)*Math.cos(pitch)*distance);
  camera.position.lerp(desired,1-Math.exp(-dt*4));camera.lookAt(follow.x,follow.y+.5,follow.z-1.2);
  // Light foliage sway keeps the silhouette lively without hiding the path.
  scene.traverse(o=>{if(o.userData.sway)o.rotation.z=Math.sin(time*1.1+o.position.x)*.02});
}
camera.position.set(0,7,17);camera.lookAt(0,1,0);
let previous=performance.now();
function frame(now){const dt=Math.min((now-previous)/1000,.04);previous=now;const t=now/1000;update(dt,t);renderer.render(scene,camera);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});
loading.classList.add('hidden');

