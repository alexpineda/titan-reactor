import { Uniform, Vector3 } from "three";
import { Effect } from "postprocessing";

// Using rollup-plugin-glsl to import shader files.
const fragmentShader = `
    
`;

export class CustomEffect extends Effect {
  constructor() {
    super("CustomEffect", fragmentShader, {
      uniforms: new Map([["weights", new Uniform(new Vector3())]]),
    });
  }
}
