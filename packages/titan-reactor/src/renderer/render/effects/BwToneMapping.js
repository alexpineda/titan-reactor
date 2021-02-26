import { Effect, BlendFunction } from "postprocessing";

const fragmentShader = `
uniform sampler2D fog;
uniform mat4 viewInverse;
uniform vec3 color;


void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

  outputColor.rgb = vec3(dot(vec3(0.222, 0.707, 0.071), inputColor.rgb));
  outputColor.a = inputColor.a;

}`;

export default class BWToneMappingEffect extends Effect {
  constructor() {
    super("BWToneMappingEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
    });
  }
}
