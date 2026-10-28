// Procedural scenery and character animation for the Verdant Reach.
export function createVisuals(THREE, {scene, renderer, grass, pathMat, sun, fillLight, hero, cloak, sword, bladeGlow, leftLeg, rightLeg, leftArm, rightArm, campFire}) {
  let seed = 417;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function surface(colors, repeat) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 10000; i++) {
      ctx.fillStyle = colors[1 + Math.floor(random() * (colors.length - 1))];
      ctx.globalAlpha = .12 + random() * .28;
      ctx.fillRect(random() * 256, random() * 256, 1 + random() * 5, 1 + random() * 3);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(repeat, repeat);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  grass.color.set(0xffffff); grass.map = surface(['#54704a','#344d36','#83915b','#aa9e6b'], 32); grass.needsUpdate = true;
  pathMat.color.set(0xffffff); pathMat.map = surface(['#938b71','#635f50','#b4a88a','#c3b697'], 1); pathMat.needsUpdate = true;
  scene.fog.color.set(0xa7b9b1); scene.fog.near = 42; scene.fog.far = 160;
  const skyCanvas = document.createElement('canvas'); skyCanvas.width = 16; skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext('2d'); const gradient = skyCtx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#375b7c'); gradient.addColorStop(.46, '#9cbdc8'); gradient.addColorStop(.58, '#e6d6b2'); gradient.addColorStop(1, '#9ba89c');
  skyCtx.fillStyle = gradient; skyCtx.fillRect(0, 0, 16, 256);
  const skyTexture = new THREE.CanvasTexture(skyCanvas); skyTexture.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 20), new THREE.MeshBasicMaterial({map:skyTexture, side:THREE.BackSide, depthWrite:false, fog:false}));
  scene.add(sky);
  renderer.toneMappingExposure = .88;
  sun.color.set(0xffd49b); sun.intensity = 2.7;
  sun.shadow.mapSize.set(2048,2048); sun.shadow.bias = -.00015; sun.shadow.normalBias = .035; sun.shadow.radius = 3;
  fillLight.intensity = .4;
  const campLight = new THREE.PointLight(0xff9b45, 7, 12, 2); campLight.position.set(-30,1.2,25); scene.add(campLight);
  // Distant cloud banks use shared geometry and material, with no shadow cost.
  const cloudMaterial = new THREE.MeshStandardMaterial({color:0xfff1d5, roughness:1, transparent:true, opacity:.52, depthWrite:false});
  const cloudGeometry = new THREE.SphereGeometry(1, 10, 6);
  const clouds = new THREE.Group(); scene.add(clouds);
  for(let i=0;i<12;i++) {
    const group = new THREE.Group(); group.position.set((random()-.5)*240,32+random()*22,(random()-.5)*230);
    for(let j=0;j<4;j++){const cloud=new THREE.Mesh(cloudGeometry,cloudMaterial);cloud.position.set(j*5,random()*1.5,random()*2);cloud.scale.set(7,1.6+random()*1.7,3.5);group.add(cloud);}
    clouds.add(group);
  }
  // A fitted hood, leather straps, steel bracers and boot cuffs give the hero a clearer silhouette.
  const leather = new THREE.MeshStandardMaterial({color:0x654732,roughness:.85});
  const steel = new THREE.MeshStandardMaterial({color:0x8099a9,metalness:.65,roughness:.38});
  function detail(w,h,d,material,x,y,z,parent=hero){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  const strap=detail(.12,1.15,.045,leather,0,1.55,.24);strap.rotation.z=-.48;
  detail(.19,.22,.08,steel,.08,1.4,.29);
  for(const side of [-1,1]){detail(.28,.22,.32,leather,side*.22,.3,.02);detail(.23,.29,.25,steel,side*.48,1.24,0);}
  const hood=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),new THREE.MeshStandardMaterial({color:0x17344b,roughness:.9}));
  hood.position.set(0,2.43,-.1);hood.scale.set(1,1.15,.8);hood.castShadow=true;hero.add(hood);
  const lastPosition=hero.position.clone();let stride=0;
  return { update(dt,time,dungeon) {
    sky.visible = !dungeon; clouds.visible = !dungeon; campLight.visible = !dungeon;
    if(!dungeon){scene.fog.color.set(0xa7b9b1);scene.fog.near=42;scene.fog.far=160;}
    const speed=Math.hypot(hero.position.x-lastPosition.x,hero.position.z-lastPosition.z)/Math.max(dt,.001);
    lastPosition.copy(hero.position);stride+=dt*(speed>.1?9:2);
    const swing=speed>.1?Math.sin(stride)*.42:0;
    leftLeg.rotation.x=THREE.MathUtils.lerp(leftLeg.rotation.x,swing,Math.min(1,dt*12));
    rightLeg.rotation.x=THREE.MathUtils.lerp(rightLeg.rotation.x,-swing,Math.min(1,dt*12));
    leftArm.rotation.x=-leftLeg.rotation.x*.65;rightArm.rotation.x=leftLeg.rotation.x*.65;
    cloak.rotation.z=Math.sin(time*1.7)*.035;cloak.rotation.x=-.12-Math.min(speed,7)*.025;
    bladeGlow.rotation.copy(sword.rotation);
    campFire.scale.set(1+Math.sin(time*13)*.1,1.3+Math.sin(time*9)*.2,1);
    campLight.intensity=6+Math.sin(time*11)*.7;
    clouds.rotation.y=Math.sin(time*.006)*.03;
    sun.position.set(hero.position.x-25,38,hero.position.z+18);sun.target.position.copy(hero.position);sun.target.updateMatrixWorld();
  }};
}

