import * as THREE from "three";
import { Mesh, PlaneBufferGeometry } from "three";
import ExtendMaterial from "../../utils/ExtendMaterial";

const extendMaterial = ExtendMaterial(THREE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight
);
camera.position.y = 30;
camera.position.z = 150;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const dirlight = new THREE.DirectionalLight(0xffffff, 5);
const amblight = new THREE.AmbientLight(0xffffff, 2);
scene.add(dirlight);
scene.add(amblight);

const mapWidth = 128;
const mapHeight = 128;

const load = async () => {
  const mapBin = new Uint32Array(
    await fetch("/out.map.bin").then((res) => res.arrayBuffer())
  );
  const mapTiles = new Uint16Array(
    await fetch("/poly.mtxm").then((res) => res.arrayBuffer())
  );
  const tilegroup = new Uint16Array(
    await fetch("/jungle.cv5").then((res) => res.arrayBuffer())
  );
  const megatiles = new Uint32Array(
    await fetch("/jungle.vx4ex").then((res) => res.arrayBuffer())
  );
  const minitilesFlags = new Uint16Array(
    await fetch("/jungle.vf4").then((res) => res.arrayBuffer())
  );
  const minitiles = new Uint8Array(
    await fetch("/jungle.vr4").then((res) => res.arrayBuffer())
  );
  const palette = new Uint8Array(
    await fetch("/jungle.wpe").then((res) => res.arrayBuffer())
  );

  const mapTilesData = new Uint16Array(mapWidth * mapHeight);

  for (let mapY = 0; mapY < mapHeight; mapY++) {
    for (let mapX = 0; mapX < mapWidth; mapX++) {
      const mapTile = mapY * mapWidth + mapX;
      let tileId = 0;
      if (mapTile > mapTiles.length) {
        tileId = 0;
      } else {
        tileId = mapTiles[mapTile];
      }

      const tileGroup = tileId >> 4;
      const groupIndex = tileId & 0xf;
      const groupOffset = tileGroup * 26 + groupIndex + 10;
      let megatileId = 0;
      if (groupOffset > tilegroup.length) {
        megatileId = 0;
      } else {
        megatileId = tilegroup[groupOffset];
      }
      mapTilesData[mapY * mapWidth + mapX] = megatileId;
    }
  }

  const mapTilesTexture = new THREE.DataTexture(
    mapTilesData,
    mapWidth,
    mapHeight,
    THREE.RFormat,
    THREE.RedIntegerFormat
  );

  const megaTilesTexture = new THREE.DataTexture(
    megatiles,
    Math.ceil(Math.sqrt(megatiles.length)),
    Math.ceil(Math.sqrt(megatiles.length)),
    THREE.RFormat,
    THREE.RedIntegerFormat
  );

  const minitilesTexture = new THREE.DataTexture(
    minitiles,
    Math.ceil(Math.sqrt(minitiles.length)),
    Math.ceil(Math.sqrt(minitiles.length)),
    THREE.RFormat,
    THREE.RedIntegerFormat
  );

  const minitilesFlagsTexture = new THREE.DataTexture(
    minitilesFlags,
    Math.ceil(Math.sqrt(minitilesFlags.length)),
    Math.ceil(Math.sqrt(minitilesFlags.length)),
    THREE.RFormat,
    THREE.RedIntegerFormat
  );

  const paletteTexture = new THREE.DataTexture(
    palette,
    Math.ceil(Math.sqrt(palette.length)),
    Math.ceil(Math.sqrt(palette.length)),
    THREE.RFormat,
    THREE.RedIntegerFormat
  );

  //textureSize().xy

  const myMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: mapTilesTexture,
    onBeforeCompile: function (shader) {
      THREE.patchShader(shader, {
        header: `
        precision highp usampler2D;
        uniform usampler2D mapTiles;
        uniform usampler2D megaTiles;
        uniform usampler2D minitiles;
        uniform usampler2D minitilesFlags;
        uniform usampler2D palette;
        `,
        fragment: {
          "@#include <map_fragment>": `
            #ifdef USE_MAP

                vec2 pos = vec2(vUv.x / 128. * 8. * 4., vUv.y / 128. * 8. * 4.);
                uint megatile = texture2D( mapTiles, vUv ).r;

                uint megax = vUv.x / 128;
                uint megay = vUv.y / 128;
                uint minix = vUv.x / 
                // uint minitile = megatile * 0x40 + ()
                // vec4 minitiles = texture2D()
                // mini = megatiles.readUInt32LE(
                //     megatileId * 0x40 + (miniY * 4 + miniX) * 4
                // );
                // minitile = mini & 0xfffffffe;
                
                vec4 texelColor = texture2D( map, vUv );
            
                texelColor = mapTexelToLinear( texelColor );
                diffuseColor *= texelColor;
            
            #endif
            `,
        },
        uniforms: {
          mapTiles: mapTilesTexture,
          megaTiles: megaTilesTexture,
          minitiles: minitilesTexture,
          minitilesFlags: minitilesFlagsTexture,
          palette: paletteTexture,
        },
      });

      console.log(shader);
    },
  });

  const plane = new PlaneBufferGeometry(mapWidth, mapHeight, 128, 128);
  const mesh = new Mesh(plane, myMaterial);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  renderer.compile(scene, camera);

  // Get the GL context:
  const gl = renderer.getContext();

  // Print the shader source!
  //   console.log(gl.getShaderSource(myMaterial));

  renderer.setAnimationLoop(loop);
};

// const minitiles = Buffer.from(vf4);
// const minitilesFlags = Buffer.from(vr4);
// const palette = Buffer.from(wpe);

const loop = () => {
  renderer.render(scene, camera);
};

document.body.append(renderer.domElement);
load();

function createDisplacement(opts) {}
