import { LinearEncoding, Matrix3, sRGBEncoding, Uniform, Texture } from "three";
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

interface MapEffectArgs {
  blendFunction: number;
  texture: Texture;
  details: Texture;
  detailsMix: number;
  levels: Matrix3;
  ignoreLevels: Matrix3;
  ignoreDoodads: number;
  tileset: number;
  palette: Uint8Array;
  paletteIndices: Texture;
  elevations: Texture;
  mapTiles: Texture;
  processWater: boolean;
}

export class MapEffect extends Effect {
  /**
   * Constructs a new texture effect.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
   * @param {Texture} [options.texture] - A texture.
   */

  constructor({
    palette,
    paletteIndices,
    levels,
    ignoreLevels,
    blendFunction = BlendFunction.NORMAL,
    texture,
    details,
    elevations,
    mapTiles,
    ignoreDoodads,
    detailsMix,
    tileset,
    processWater = false,
  }: MapEffectArgs) {
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

  get texture(): Texture {
    return this.uniforms.get("texture")!.value!;
  }

  set texture(value: Texture | null) {
    const currentTexture = this.texture;

    if (currentTexture !== value) {
      const previousEncoding =
        currentTexture !== null ? currentTexture.encoding : null;
      this.uniforms.get("texture")!.value = value;

      if (value !== null) {
        switch (value.encoding) {
          case sRGBEncoding:
            this.defines.set("texelToLinear(texel)", "texel");
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

  get details(): Texture {
    return this.uniforms.get("details")!.value;
  }

  set details(value: Texture) {
    this.uniforms.get("details")!.value = value;
  }

  get elevations(): Texture {
    return this.uniforms.get("elevations")!.value;
  }

  set elevations(value: Texture) {
    this.uniforms.get("elevations")!.value = value;
  }

  get levels(): Matrix3 {
    return this.uniforms.get("levels")!.value;
  }

  set levels(value: Matrix3) {
    this.uniforms.get("levels")!.value = value;
  }

  get mapTiles(): Texture {
    return this.uniforms.get("mapTiles")!.value;
  }

  set mapTiles(value: Texture) {
    this.uniforms.get("mapTiles")!.value = value;
  }

  get ignoreDoodads(): number {
    return this.uniforms.get("ignoreDoodads")!.value;
  }

  set ignoreDoodads(value: number) {
    this.uniforms.get("ignoreDoodads")!.value = value;
  }

  get detailsMix(): number {
    return this.uniforms.get("detailsMix")!.value;
  }

  set detailsMix(value: number) {
    this.uniforms.get("detailsMix")!.value = value;
  }

  get tileset(): number {
    return this.uniforms.get("tileset")!.value;
  }

  set tileset(value: number) {
    this.uniforms.get("tileset")!.value = value;
  }

  get paletteIndices(): Texture {
    return this.uniforms.get("paletteIndices")!.value;
  }

  set paletteIndices(value: Texture) {
    this.uniforms.get("paletteIndices")!.value = value;
  }

  get processWater(): boolean {
    return this.uniforms.get("processWater")!.value;
  }

  set processWater(value: boolean) {
    this.uniforms.get("processWater")!.value = value;
  }

  get palette(): Uint8Array {
    return this.uniforms.get("palette")!.value;
  }

  set palette(value: Uint8Array) {
    this.uniforms.get("palette")!.value = value;
  }

  get ignoreLevels(): Matrix3 {
    return this.uniforms.get("ignoreLevels")!.value;
  }

  set ignoreLevels(value: Matrix3) {
    this.uniforms.get("ignoreLevels")!.value = value;
  }

  get aspectCorrection(): boolean {
    return this.defines.has("ASPECT_CORRECTION");
  }

  set aspectCorrection(value: boolean) {
    if (this.aspectCorrection !== value) {
      if (value) {
        if (this.uvTransform) {
          this.uvTransform = false;
        }

        this.defines.set("ASPECT_CORRECTION", "1");
        this.setVertexShader(vertexShader);
      } else {
        this.defines.delete("ASPECT_CORRECTION");
        this.setVertexShader("");
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
   */

  get uvTransform(): boolean {
    return this.defines.has("UV_TRANSFORM");
  }

  /**
   * Enables or disables texture UV transformation.
   *
   */

  set uvTransform(value: boolean) {
    if (this.uvTransform !== value) {
      if (value) {
        if (this.aspectCorrection) {
          this.aspectCorrection = false;
        }

        this.defines.set("UV_TRANSFORM", "1");
        this.uniforms.get("uvTransform")!.value = new Matrix3();
        this.setVertexShader(vertexShader);
      } else {
        this.defines.delete("UV_TRANSFORM");
        this.uniforms.get("uvTransform")!.value = null;
        this.setVertexShader("");
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

  setTextureSwizzleRGBA(r: number, g = r, b = r, a = r) {
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

  override update() {
    const texture = this.uniforms.get("texture")!.value;

    if (this.uvTransform && texture.matrixAutoUpdate) {
      texture.updateMatrix();
      this.uniforms.get("uvTransform")!.value.copy(texture.matrix);
    }
  }
}
