import { Camera, ClampToEdgeWrapping, DataTexture, LinearFilter, RedFormat, UnsignedByteType, Vector2, Vector4 } from "three";
import { OpenBWAPI } from "common/types";
import FogOfWarEffect from "./fog-of-war-effect";

export default class FogOfWar {
    #openBW: OpenBWAPI;
    texture: DataTexture;
    effect: FogOfWarEffect;
    #buffer = new Uint8Array();
    forceInstantUpdate = false;
    enabled = true;

    constructor(width: number, height: number, openBw: OpenBWAPI, effect: FogOfWarEffect) {
        this.#openBW = openBw;

        const texture = new DataTexture(
            new Uint8ClampedArray(width * height),
            width,
            height,
            RedFormat,
            UnsignedByteType,
        );

        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = LinearFilter;
        texture.minFilter = LinearFilter;

        texture.needsUpdate = true;

        this.texture = texture;

        this.effect = effect;
        this.effect.fog = this.texture;
        this.effect.fogResolution = new Vector2(this.texture.image.width, this.texture.image.height);
        this.effect.fogUvTransform = new Vector4(0.5, 0.5, 0.99 / this.texture.image.height, 0.99 / this.texture.image.width);
    }

    update(playerVision: number, camera: Camera, minimapFOWImage: ImageData) {
        const tilesize = this.#openBW.getFowSize();
        const ptr = this.#openBW.getFowPtr(playerVision, this.forceInstantUpdate);

        this.#buffer = this.#openBW.HEAPU8.subarray(ptr, ptr + tilesize);
        this.texture.image.data.set(this.#buffer);
        this.texture.needsUpdate = true;

        this.effect.projectionInverse.copy(camera.projectionMatrixInverse);
        this.effect.viewInverse.copy(camera.matrixWorld);
        this.forceInstantUpdate = false;

        for (let i = 0; i < tilesize; i = i + 1) {
            minimapFOWImage.data[i * 4 - 1] = Math.max(50, 255 - this.#buffer[i]);
        }
    }

    isVisible(x: number, y: number) {
        return this.#buffer[y * this.texture.image.width + x] > 55;
    }

    isExplored(x: number, y: number) {
        return this.#buffer[y * this.texture.image.width + x] > 0;
    }

    isSomewhatVisible(x: number, y: number) {
        return this.#buffer[y * this.texture.image.width + x] > 55;
    }

    isSomewhatExplored(x: number, y: number) {
        return this.#buffer[y * this.texture.image.width + x] > 0;
    }

};