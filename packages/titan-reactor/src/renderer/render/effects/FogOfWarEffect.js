import { Uniform } from "three";
import { Effect, EffectAttribute, BlendFunction } from "postprocessing";

const fragmentShader = `
precision highp usampler2D;
uniform usampler2D tiles;
uniform mat3 players;
uniform int enabled;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

    // uint elevation = texture2D(elevations, vUv2).r;
	outputColor = vec4(inputColor.rgb * depth, inputColor.a);

}`;

// fogOfWarRenderer.setDepthBuffer(depthFrameBuffer.renderTarget.depthTexture);
// fogOfWarRenderer.setFogBuffer(fow.texture);
// fogOfWarRenderer.setResolution(fow.size.x, fow.size.y);
// fogOfWarRenderer.setUvTransformFromFog(fow);
// fogOfWarRenderer.setFogColor(fow.color);

export default class FogOfWarEffect extends Effect {
  constructor(tiles, players) {
    super("FogOfWarEffect", fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ["tiles", new Uniform(null)],
        ["enabled", new Uniform(1.0)],
        ["players", new Uniform(null)],
      ]),
    });

    this.tiles = tiles;
    this.players = players;
    this.enabled = 1;

    //fogResolution
    // uViewInverse: { type: 'm4', value: new Matrix4() },
    // uProjectionInverse: { type: 'm4', value: new Matrix4() },
    // uColor: { type: 'c', value: new Vector4(0, 0, 0, 1) },
    // uFogUvTransform: { type: 'v4', value: new Vector4(0, 0, 1, 1) },
    // uResolution: { type: 'v2', value: new Vector2(0, 0) }
  }

  get tiles() {
    return this.uniforms.get("tiles").value;
  }

  set tiles(value) {
    this.uniforms.get("tiles").value = value;
  }

  get players() {
    return this.uniforms.get("players").value;
  }

  set players(value) {
    this.uniforms.get("players").value = value;
  }

  get enabled() {
    return this.uniforms.get("enabled").value;
  }

  set enabled(value) {
    this.uniforms.get("enabled").value = value;
  }
}
