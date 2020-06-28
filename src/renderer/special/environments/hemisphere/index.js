import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { makeNoise2D } from "open-simplex-noise";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

scene.background = new THREE.Color(0xcccccc);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 60, 180);

scene.add(camera);


const basic = function() {
    const fogColor = new THREE.Color(0x080820);
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 256, 512);
}

const day = function() {
    
}

const night = function() {

}

const space = function() {

}


const amb = new THREE.AmbientLight(0x0000ff, 10);
// scene.add(amb);

const dir = new THREE.DirectionalLight();
dir.castShadow = true;
dir.position.set(1, 1, 1);
dir.shadow.camera.near = 0.5; // default
dir.shadow.camera.far = 1000; // default
scene.add(dir);

scene.add(new THREE.CameraHelper(dir.shadow.camera));

const light = new THREE.SpotLight(0xffffff, 5, 500);
light.position.set(100, 300, -100);
light.lookAt(new THREE.Vector3());
light.castShadow = true;
light.angle = 1;
light.decay = 1;
light.penumbra = 0.5;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 10;
light.shadow.camera.far = 1000;
light.shadow.bias = 0.00001;
scene.add(light);

// scene.add(new THREE.CameraHelper(light.camera))

// var spotLightHelper = new THREE.SpotLightHelper( light );
// scene.add( spotLightHelper );

const paramClouds = (function () {
  const noise = makeNoise2D(Date.now());
  const n = (x, y, v) => {
    const c = noise(x, y);
    console.log(c);
    v.addScalar(c * 10);
  };
  const geo = new THREE.ParametricGeometry(n);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  mesh.position.y = 30;

  return mesh;
})();
// scene.add(paramClouds);

const shapeClouds = (function () {
  var shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(x + 5, y + 5);
  shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

  // const geo = new THREE.ShapeGeometry(shape);

  var extrudeSettings = {
    steps: 1,
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.rotation.x = -Math.PI / 2;
  mesh.scale.set(5, 5, 1);
  mesh.position.y = 100;
  mesh.position.x = 100;
  return mesh;
})();
scene.add(shapeClouds);

const clouds = (function () {
  const texture = new THREE.TextureLoader().load("cloud2.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(10,10)
  const geo = new THREE.PlaneGeometry(128, 128);
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    // opacity: 0.5
    // depthPacking: THREE.RGBADepthPacking,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 30;

  return mesh;
})();
scene.add(clouds);

const floor = (function () {
  const geo = new THREE.PlaneGeometry(128 * 8, 128 * 8);
  geo.faceVertexUvs[1] = geo.faceVertexUvs[0];
  const mat = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
  });

  const mesh = new THREE.Mesh(geo, mat);

  mesh.receiveShadow = true;
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
})();
scene.add(floor);

const floorWithShadow = (function () {
  const texture = new THREE.TextureLoader().load("cloud2.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const geo = new THREE.PlaneGeometry(128 * 8, 128 * 8);
  geo.faceVertexUvs[1] = geo.faceVertexUvs[0];
  const mat = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    lightMap: texture,
    lightMapIntensity: -1,
  });

  const mesh = new THREE.Mesh(geo, mat);

  mesh.receiveShadow = true;
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
})();
// scene.add(floorWithShadow)

const ball = (function () {
  const geo = new THREE.SphereGeometry(10);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 5;
  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
})();
scene.add(ball);

const ball2 = (function () {
  const geo = new THREE.SphereGeometry(7);
  const mat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 15;
  mesh.position.x = 2;
  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
})();
scene.add(ball2);

camera.lookAt(floorWithShadow.position);

document.body.appendChild(renderer.domElement);

var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.update();

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
