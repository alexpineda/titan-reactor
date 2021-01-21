import { LinearEncoding, Matrix3, sRGBEncoding, Uniform } from "three";
import { ColorChannel, BlendFunction, Effect } from "postprocessing";

const fragmentShader = `
precision highp usampler2D;
uniform sampler2D texture;
uniform usampler2D fogOfWar;

#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)

	varying vec2 vUv2;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)

        uint fog = texture2D(fogOfWar, vUv2).r;


        vec4 oColor = texture2D(texture, vUv2);
        vec4 color = texture2D(texture, vUv2);
        color += texture2D(texture, vUv2 + vec2(-0.01, -0.01));
        color += texture2D(texture, vUv2 + vec2(0.01, 0.01));
        color += texture2D(texture, vUv2 + vec2(-0.01, 0.01));
        color += texture2D(texture, vUv2 + vec2(0.01, -0.01));
        
		    vec4 texel = texelToLinear(color);

	#else

        uint fog = texture2D(fogOfWar, vUv2).r;

        vec4 oColor = texture2D(texture, uv);
        vec4 color = texture2D(texture, uv);
        color += texture2D(texture, uv + vec2(-0.01, -0.01));
        color += texture2D(texture, uv + vec2(0.01, 0.01));
        color += texture2D(texture, uv + vec2(-0.01, 0.01));
        color += texture2D(texture, uv + vec2(0.01, -0.01));

	      vec4 texel = texelToLinear(color);

	#endif


    outputColor = TEXEL;

}
`;
const vertexShader = `
#ifdef ASPECT_CORRECTION

uniform float scale;

#else

uniform mat3 uvTransform;

#endif

varying vec2 vUv2;

void mainSupport(const in vec2 uv) {

#ifdef ASPECT_CORRECTION

    vUv2 = uv * vec2(aspect, 1.0) * scale;

#else

    vUv2 = (uvTransform * vec3(uv, 1.0)).xy;

#endif

}
`;

export class FogOfWarEffect extends Effect {
  /**
   * Constructs a new texture effect.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
   * @param {Texture} [options.texture] - A texture.
   */

  constructor({
    blendFunction = BlendFunction.NORMAL,
    texture = null,
    fogOfWar = null,
  } = {}) {
    super("FogOfWarEffect", fragmentShader, {
      blendFunction,

      defines: new Map([["TEXEL", "texel"]]),

      uniforms: new Map([
        ["texture", new Uniform(null)],
        ["scale", new Uniform(1.0)],
        ["uvTransform", new Uniform(null)],
        ["fogOfWar", new Uniform(null)],
      ]),
    });

    this.texture = texture;
    this.aspectCorrection = false;

    this.fogOfWar = fogOfWar;
  }

  /**
   * The texture.
   *
   * @type {Texture}
   */

  get texture() {
    return this.uniforms.get("texture").value;
  }

  /**
   * Sets the texture.
   *
   * @type {Texture}
   */

  set texture(value) {
    const currentTexture = this.texture;

    if (currentTexture !== value) {
      const previousEncoding =
        currentTexture !== null ? currentTexture.encoding : null;
      this.uniforms.get("texture").value = value;

      if (value !== null) {
        switch (value.encoding) {
          case sRGBEncoding:
            this.defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");
            break;

          case LinearEncoding:
            this.defines.set("texelToLinear(texel)", "texel");
            break;

          default:
            console.error("Unsupported encoding:", value.encoding);
            break;
        }

        if (previousEncoding !== value.encoding) {
          this.setChanged();
        }
      }
    }
  }

  get fogOfWar() {
    return this.uniforms.get("fogOfWar").value;
  }

  set fogOfWar(value) {
    this.uniforms.get("fogOfWar").value = value;
  }

  /**
   * Indicates whether aspect correction is enabled.
   *
   * If enabled, the texture can be scaled using the `scale` uniform.
   *
   * @type {Number}
   * @deprecated Use uvTransform instead for full control over the texture coordinates.
   */

  get aspectCorrection() {
    return this.defines.has("ASPECT_CORRECTION");
  }

  /**
   * Enables or disables aspect correction.
   *
   * @type {Number}
   * @deprecated Use uvTransform instead for full control over the texture coordinates.
   */

  set aspectCorrection(value) {
    if (this.aspectCorrection !== value) {
      if (value) {
        if (this.uvTransform) {
          this.uvTransform = false;
        }

        this.defines.set("ASPECT_CORRECTION", "1");
        this.setVertexShader(vertexShader);
      } else {
        this.defines.delete("ASPECT_CORRECTION");
        this.setVertexShader(null);
      }

      this.setChanged();
    }
  }

  /**
   * Indicates whether the texture UV coordinates will be transformed using the
   * transformation matrix of the texture.
   *
   * Cannot be used if aspect correction is enabled.
   *
   * @type {Boolean}
   */

  get uvTransform() {
    return this.defines.has("UV_TRANSFORM");
  }

  /**
   * Enables or disables texture UV transformation.
   *
   * @type {Boolean}
   */

  set uvTransform(value) {
    if (this.uvTransform !== value) {
      if (value) {
        if (this.aspectCorrection) {
          this.aspectCorrection = false;
        }

        this.defines.set("UV_TRANSFORM", "1");
        this.uniforms.get("uvTransform").value = new Matrix3();
        this.setVertexShader(vertexShader);
      } else {
        this.defines.delete("UV_TRANSFORM");
        this.uniforms.get("uvTransform").value = null;
        this.setVertexShader(null);
      }

      this.setChanged();
    }
  }

  /**
   * Sets the swizzles that will be applied to the `r`, `g`, `b`, and `a`
   * components of a texel before it is written to the output color.
   *
   * @param {ColorChannel} r - The swizzle for the `r` component.
   * @param {ColorChannel} [g=r] - The swizzle for the `g` component.
   * @param {ColorChannel} [b=r] - The swizzle for the `b` component.
   * @param {ColorChannel} [a=r] - The swizzle for the `a` component.
   */

  setTextureSwizzleRGBA(r, g = r, b = r, a = r) {
    const rgba = "rgba";
    let swizzle = "";

    if (
      r !== ColorChannel.RED ||
      g !== ColorChannel.GREEN ||
      b !== ColorChannel.BLUE ||
      a !== ColorChannel.ALPHA
    ) {
      swizzle = [".", rgba[r], rgba[g], rgba[b], rgba[a]].join("");
    }

    this.defines.set("TEXEL", "texel" + swizzle);
    this.setChanged();
  }

  /**
   * Updates this effect.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
   * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
   */

  update(renderer, inputBuffer, deltaTime) {
    const texture = this.uniforms.get("texture").value;

    if (this.uvTransform && texture.matrixAutoUpdate) {
      texture.updateMatrix();
      this.uniforms.get("uvTransform").value.copy(texture.matrix);
    }
  }
}
