//partial credit @prisoner89 https://codepen.io/prisoner849/pen/pOPBYM?editors=1010
import { Mesh, PlaneBufferGeometry, ShaderMaterial } from "three";

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
    constructor(heatMap) {
        const planeGeometry = new PlaneBufferGeometry(128, 128, 128, 128);
        planeGeometry.rotateX(-Math.PI * 0.5);
        const material = new ShaderMaterial({
            uniforms: {
              heightMap: { value: heightMap },
              heightRatio: { value: 10 },
            },
            vertexShader: heatVertex,
            fragmentShader: heatFragment,
            transparent: false,
          });

        super(planeGeometry, material)
    }

    update(heatMap) {
        
    }
}
  
}
