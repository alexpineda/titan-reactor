import { LinearEncoding, Matrix3, sRGBEncoding, Uniform, Texture } from "three";
import { ColorChannel, BlendFunction, Effect } from "postprocessing";
import fragmentShader from "./map-effect.frag.glsl?raw";

const vertexShader = `
uniform mat3 uvTransform;
varying vec2 vUv2;

void mainSupport(const in vec2 uv) {
    vUv2 = (uvTransform * vec3(uv, 1.0)).xy;
}
`;

interface MapEffectArgs {
  blendFunction: number;
  texture: Texture;
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
    elevations,
    mapTiles,
    ignoreDoodads,
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
        ["elevations", new Uniform(null)],
        ["levels", new Uniform(null)],
        ["ignoreLevels", new Uniform(null)],

        ["mapTiles", new Uniform(null)],
        ["ignoreDoodads", new Uniform(null)],
        ["tileset", new Uniform(null)],
        ["paletteIndices", new Uniform(null)],
        ["palette", new Uniform(null)],
        ["processWater", new Uniform(null)],
      ]),
    });

    this.texture = texture;
    this.elevations = elevations;
    this.levels = levels;
    this.aspectCorrection = false;
    this.mapTiles = mapTiles;
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
