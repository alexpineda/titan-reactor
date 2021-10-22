import { LinearEncoding, Matrix3, sRGBEncoding, Uniform } from "three";
import { ColorChannel, BlendFunction, Effect } from "postprocessing";

const fragmentShader = `
precision highp usampler2D;
uniform sampler2D texture;
uniform usampler2D elevations;
uniform usampler2D mapTiles;
uniform usampler2D details;
uniform usampler2D paletteIndices;
uniform float detailsMix;
uniform int ignoreDoodads;
uniform bool processWater;
uniform int tileset;
uniform mat3 levels;
uniform mat3 ignoreLevels;

#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)

	varying vec2 vUv2;

#endif

bool getIsWater(const in int tileset, const in int paletteIndex) {
  if (tileset > 3 || tileset == 0) { //jungle, badlands, desert, ice, twilight
    if ((paletteIndex >= 1 && paletteIndex <= 13) || (paletteIndex >= 248 && paletteIndex <= 254) ) {
      return true;
    }
  } else if (tileset == 3) { //ashworld
    if (paletteIndex >= 1 && paletteIndex <= 13) {
      return true;
    }
  }
  return false;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)

        uint elevation = texture2D(elevations, vUv2).r;


        vec4 oColor = texture2D(texture, vUv2);
        vec4 color = texture2D(texture, vUv2);
        color += texture2D(texture, vUv2 + vec2(-0.01, -0.01));
        color += texture2D(texture, vUv2 + vec2(0.01, 0.01));
        color += texture2D(texture, vUv2 + vec2(-0.01, 0.01));
        color += texture2D(texture, vUv2 + vec2(0.01, -0.01));
        
		    vec4 lColor = texelToLinear(color);

	#else

        uint elevation = texture2D(elevations, uv).r;

        vec4 oColor = texture2D(texture, uv);
        vec4 color = texture2D(texture, uv);
        color += texture2D(texture, uv + vec2(-0.01, -0.01));
        color += texture2D(texture, uv + vec2(0.01, 0.01));
        color += texture2D(texture, uv + vec2(-0.01, 0.01));
        color += texture2D(texture, uv + vec2(0.01, -0.01));

	      vec4 lColor = texelToLinear(color);

	#endif

    int paletteIndex = int(texture2D(paletteIndices, uv).r);

    bool isWater = getIsWater(tileset, paletteIndex);
    bool isWaterByColor = false;
    if (elevation == uint(0)) {
      if (tileset == 4 || tileset == 0) { //jungle and badlands
        if (oColor.b > oColor.r/2. + oColor.g/2.) {
          isWater = true;
          isWaterByColor = true;
        }
      } else if (tileset == 3) { // ashworld
        if (oColor.r > oColor.g/2. + oColor.b/2. || (oColor.r < 0.2 && oColor.g < 0.2 && oColor.b < 0.2)) {
          isWater = true;
          isWaterByColor = true;
        }
      } else if (tileset == 5 || tileset == 7) { // desert, twilight
        if (oColor.r < 0.2 && oColor.g < 0.2 && oColor.b < 0.2) {
          isWater = true;
          isWaterByColor = true;
        }
      } else if (tileset ==6) { // ic
        if (oColor.r < 0.2 && oColor.g < 0.2 && oColor.b < 0.4) {
          isWater = true;
          isWaterByColor = true;
        }
      }
    }

    uint effectiveElevation = elevation;

    //anything that is elevation 0 and is not "water" gets lifted an elevation up
    if (processWater && !isWater && elevation == uint(0)) {
      effectiveElevation = uint(1);
    }

    float elevationResult = 0.;
    bool ignoreLevel = false;
    if (effectiveElevation < uint(3)) {
        elevationResult = levels[effectiveElevation][0];
        ignoreLevel = ignoreLevels[effectiveElevation][0] > 0.;
      } else if (effectiveElevation >= uint(3) && effectiveElevation < uint(6)) {
        elevationResult = levels[effectiveElevation - uint(3)][1];
        ignoreLevel = ignoreLevels[effectiveElevation - uint(3)][1] > 0.;
    } else {
        elevationResult = levels[effectiveElevation - uint(6)][2];
        ignoreLevel = ignoreLevels[effectiveElevation - uint(6)][2] > 0.;
    }
 
    bool elevationWasModified = elevation != effectiveElevation;

    vec3 res = vec3(elevationResult);
    uint mapTile = texture2D(mapTiles, uv).r;
    
    //if doodad, use previous render
    // if (mapTile > uint(1023) && ignoreDoodads == 1 && elevation > uint(0)) {
      // if (elevation == uint(0)) {
      //   res = inputColor.rgb * (1.-inputColor.b);
      // } else {
        // res = inputColor.rgb * 0.5 * res * 0.5;
      // }
    // }

    if (ignoreLevel && !elevationWasModified) { //todo: change this to use a custom ignore elevation matrix
      res = inputColor.rgb;
    }

    float detail = float(texture2D(details, uv).r)/255.;
    float finalDetailMix = detailsMix;

    vec4 texel = vec4(res * (1.-finalDetailMix) + (detail*finalDetailMix), 1.);
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

export class MapEffect extends Effect {
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
    details = null,
    elevations = null,
    levels = null,
    ignoreLevels = null,
    mapTiles = null,
    ignoreDoodads = null,
    detailsMix = null,
    tileset = null,
    palette = null,
    paletteIndices = null,
    processWater = null,
  } = {}) {
    super("MapEffect", fragmentShader, {
      blendFunction,

      defines: new Map([["TEXEL", "texel"]]),

      uniforms: new Map([
        ["texture", new Uniform(null)],
        ["scale", new Uniform(1.0)],
        ["uvTransform", new Uniform(null)],
        ["details", new Uniform(null)],
        ["elevations", new Uniform(null)],
        ["levels", new Uniform(null)],
        ["ignoreLevels", new Uniform(null)],

        ["mapTiles", new Uniform(null)],
        ["detailsMix", new Uniform(null)],
        ["ignoreDoodads", new Uniform(null)],
        ["tileset", new Uniform(null)],
        ["paletteIndices", new Uniform(null)],
        ["palette", new Uniform(null)],
        ["processWater", new Uniform(null)],
      ]),
    });

    this.texture = texture;
    this.details = details;
    this.elevations = elevations;
    this.levels = levels;
    this.aspectCorrection = false;
    this.mapTiles = mapTiles;
    this.detailsMix = detailsMix;
    this.ignoreDoodads = ignoreDoodads;
    this.tileset = tileset;
    this.palette = palette;
    this.paletteIndices = paletteIndices;
    this.processWater = processWater;
    this.ignoreLevels = ignoreLevels;
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

  get details() {
    return this.uniforms.get("details").value;
  }

  set details(value) {
    this.uniforms.get("details").value = value;
  }

  get elevations() {
    return this.uniforms.get("elevations").value;
  }

  set elevations(value) {
    this.uniforms.get("elevations").value = value;
  }

  get levels() {
    return this.uniforms.get("levels").value;
  }

  set levels(value) {
    this.uniforms.get("levels").value = value;
  }

  get mapTiles() {
    return this.uniforms.get("mapTiles").value;
  }

  set mapTiles(value) {
    this.uniforms.get("mapTiles").value = value;
  }

  get ignoreDoodads() {
    return this.uniforms.get("ignoreDoodads").value;
  }

  set ignoreDoodads(value) {
    this.uniforms.get("ignoreDoodads").value = value;
  }

  get detailsMix() {
    return this.uniforms.get("detailsMix").value;
  }

  set detailsMix(value) {
    this.uniforms.get("detailsMix").value = value;
  }

  get tileset() {
    return this.uniforms.get("tileset").value;
  }

  set tileset(value) {
    this.uniforms.get("tileset").value = value;
  }

  get paletteIndices() {
    return this.uniforms.get("paletteIndices").value;
  }

  set paletteIndices(value) {
    this.uniforms.get("paletteIndices").value = value;
  }

  get processWater() {
    return this.uniforms.get("processWater").value;
  }

  set processWater(value) {
    this.uniforms.get("processWater").value = value;
  }

  get palette() {
    return this.uniforms.get("palette").value;
  }

  set palette(value) {
    this.uniforms.get("palette").value = value;
  }

  get ignoreLevels() {
    return this.uniforms.get("ignoreLevels").value;
  }

  set ignoreLevels(value) {
    this.uniforms.get("ignoreLevels").value = value;
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

  update() {
    const texture = this.uniforms.get("texture").value;

    if (this.uvTransform && texture.matrixAutoUpdate) {
      texture.updateMatrix();
      this.uniforms.get("uvTransform").value.copy(texture.matrix);
    }
  }
}
