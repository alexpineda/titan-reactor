import { createStats, createGui } from './gui';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader.js";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

import { generateDisplacementMap } from "../2d-map-rendering/src/generators/generateDisplacementMap";
import { generateEmissiveMap } from "../2d-map-rendering/src/generators/generateEmissiveMap";
import { generateMap } from "../2d-map-rendering/src/generators/generateMap";
import { generateRoughnessMap } from "../2d-map-rendering/src/generators/generateRoughnessMap";

import { generateMapDetails } from "../2d-map-rendering/src/generators/generateMapDetails";

import { loadMap } from './loadMap';

import createScmExtractor from "scm-extractor";
import concat from "concat-stream";
import { Vector3 } from 'three';

console.log(new Date().toLocaleString());
const fs = window.require("fs");

const scene = new THREE.Scene();
window.scene = scene;

const fogColor = new THREE.Color(0x080820);
scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 256, 512);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
window.camera = camera;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.Uncharted2ToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const findMeshByName = (name) => {
  let mesh;
  scene.traverse(o => {
    if (o.name === name) {
      mesh = o;
      return false;
    }
  })
  return mesh;
}

function generateMapMeshes(width, height, map, bg, displace, rough) {
  const floor = (function () {
    const geometry = new THREE.PlaneGeometry(width, height, width * 2, height * 2);
    const material = new THREE.MeshStandardMaterial({
      map: map,
      displacementMap: displace,
      displacementScale: 6,
      // normalMap: normal,
      // normalScale: new THREE.Vector2(1.3, 1.6),
      // normalMapType: THREE.TangentSpaceNormalMap,
      dithering: true,
      roughness: 1,
      roughnessMap: rough
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
  
    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.material.map.anisotropy = 16;
    plane.name = "floor";
    return plane;
  })();
  
  const backingFloor = (function () {
    const geometry = new THREE.PlaneGeometry(width, height, 4, 4);
    const material = new THREE.MeshLambertMaterial({
      map: bg,
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.scale.x = 10;
    plane.scale.y = 10;
    plane.rotation.x = -Math.PI / 2;
  
    plane.position.z = 32;
    plane.material.map.anisotropy = 1;
    plane.name = "backing-floor";
    return plane;
  })();

  return [
    floor,
    backingFloor
  ]
}

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

controls.update();
camera.lookAt(new Vector3());

const hemi = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
scene.add(hemi);

const spotlight = new THREE.SpotLight(0xffa95c, 2);
// spotlight.position.y = 50;
// spotlight.position.z = 80;
spotlight.castShadow = true;
spotlight.shadow.bias = -0.0001;
spotlight.shadow.mapSize.width = 1024 * 4;
spotlight.shadow.mapSize.height = 1024 * 4;
spotlight.decay = 2;
spotlight.distance = 1000;
spotlight.penumbra = 0.2;

scene.add(spotlight);

var pointLight = new THREE.PointLight(0xedd89f, 1, 100);
pointLight.position.set(-64, 10, -64);
pointLight.power = 8 * Math.PI;
scene.add(pointLight);

document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

(function () {
  const effect = new ShaderPass(DotScreenShader);
  effect.uniforms["scale"].value = 4;
  composer.addPass(effect);
})();

(function () {
  const effect = new ShaderPass(RGBShiftShader);
  effect.uniforms["amount"].value = 0.0015;
  composer.addPass(effect);
})();

const control = createGui();
const stats = createStats();

control.on("map:reload", (map) => {

const toDataTexture = ({data, width, height}) => new THREE.DataTexture(data, width, height, THREE.RGBFormat);

  const mapDetailsLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          res(generateMapDetails(data))
        }))
      })
  

  const mapLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        generateMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
        );
      })
    );
  })

  const bgLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        generateMap("./bwdata", data, 0.25, 32).then(data => res(toDataTexture(data)), rej
        );
      })
    );
  })

  const displaceLoader = new Promise((res, rej) => {

    fs.createReadStream(`./maps/${map}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        generateDisplacementMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
        );
      })
    );
  });


  const roughnessLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        generateRoughnessMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
        );
      })
    );
  })

  Promise.all([mapDetailsLoader, mapLoader, bgLoader, displaceLoader, roughnessLoader]).then(([mapDetails, map, bg, displace, roughness]) => {
    map.encoding = THREE.sRGBEncoding;
    bg.encoding = THREE.sRGBEncoding;
    // map.flipY = false;
    // bg.flipY = false;
    // displace.flipY = false;
    // roughness.flipY = false;
    const [newFloor, newFloorBg] = generateMapMeshes(mapDetails.size[0], mapDetails.size[1], map, bg, displace,roughness);
    
    const floor = findMeshByName('floor');
    const floorBg = findMeshByName('backing-floor');
    if (floor) {
      scene.remove(floor)
    }
    if (floorBg) {
    scene.remove(floorBg)
    }
    scene.add(newFloor);
    scene.add(newFloorBg);


  })

  
})

let f = 0;
function animate() {
  stats.begin()
  //   plane.rotation.z += 0.0005;
  spotlight.position.set(
    camera.position.x + 10,
    camera.position.y + 10,
    spotlight.position.z
  );
  f += 0.01;
  pointLight.position.x = Math.cos(f) * 64;
  pointLight.position.z = Math.sin(f) * 64;

  controls.update();
  stats.end()
  renderer.render(scene, camera);
  //   composer.render();
  requestAnimationFrame(animate);
}
animate();

control.on("scene:save", (map) => {
  var exporter = new GLTFExporter();
    exporter.parse(
      scene,
      function (gltf) {
        fs.writeFile("./scene.glb", gltf, () => {});
      },
      {
        binary: true,
      }
    )
  
})
