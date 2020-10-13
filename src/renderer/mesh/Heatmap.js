//partial credit @prisoner89 https://codepen.io/prisoner849/pen/pOPBYM?editors=1010
import { Mesh, PlaneBufferGeometry, RedFormat, ShaderMaterial } from "three";
import { DataTexture } from "three/src/textures/DataTexture";
import { MinimapLayer } from "../replay/Layers";

const heatVertex = `
    uniform sampler2D heightMap;
    uniform float heightRatio;
    varying vec2 vUv;
    varying float hValue;
    void main() {
      vUv = uv;
      vec3 pos = position;
      hValue = texture2D(heightMap, vUv).r;
      pos.y = hValue * heightRatio;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
    }
  `;

const heatFragment = `
    varying float hValue;
    
    // honestly stolen from https://www.shadertoy.com/view/4dsSzr
    vec3 heatmapGradient(float t) {
      return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
    }

    void main() {
      float v = abs(hValue - 1.);
      gl_FragColor = vec4(heatmapGradient(hValue), 1. - v * v) ;
    }
  `;

export class Heatmap extends Mesh {
  constructor(width, height, heatMapScore) {
    const heightMap = new Uint8Array(3 * width * height);
    const planeGeometry = new PlaneBufferGeometry(width, height);
    planeGeometry.rotateX(-Math.PI * 0.5);
    const material = new ShaderMaterial({
      uniforms: {
        heightMap: {
          value: new DataTexture(heightMap, width, height, RedFormat),
        },
        heightRatio: { value: 10 },
      },
      vertexShader: heatVertex,
      fragmentShader: heatFragment,
      transparent: false,
    });

    super(planeGeometry, material);
    this.width = width;
    this.height = height;
    this.heatmapScore = heatMapScore;
    this.heatmapData = [];
    this.heatmapRefreshRate = 24 * 5;
    this.reset();
  }

  reset() {
    this.heatmapData = [];
    for (let x = 0; x < this.width; x++) {
      this.heatmapData[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.heatmapData[x][y] = 0;
      }
    }
  }

  _decay() {
    for (let x = 0; x < this.width; x++) {
      this.heatmapData[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.heatmapData[x][y] = Math.max(0, this.heatmapData[x][y] - 1);
      }
    }
  }

  update(frame, units) {
    this._decay();

    if (frame % this.heatmapRefreshRate === 0) {
      const data = new Uint8Array(3 * this.width * this.height);

      units.forEach((unit) => {
        const x = Math.floor(unit.userData.current.x / 32);
        const y = Math.floor(unit.userData.current.y / 32);
        this.heatmapData[x][y] = Math.min(
          255,
          unit.userData.heatmapScore * 10 + this.heatmapData[x][y]
        );
        data[x + y * this.width] = this.heatmapData[x][y];
      });

      this.material.uniforms.heightMap.value.data = data;
      this.material.uniformsNeedUpdate = true;
    }
  }
}
