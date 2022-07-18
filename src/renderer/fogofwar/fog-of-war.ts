import { Camera, ClampToEdgeWrapping, DataTexture, LinearFilter, RedFormat, Texture, UnsignedByteType, Vector2, Vector4 } from "three";
import { OpenBWAPI } from "common/types";

export default class FogOfWar {
    #openBW: OpenBWAPI;
    imageData: ImageData;
    texture: Texture;
    // until postprocessing gets types
    effect: any;
    #buffer = new Uint8Array();
    forceInstantUpdate = false;
    enabled = true;

    constructor(width: number, height: number, openBw: OpenBWAPI) {
        this.#openBW = openBw;

        // for use with canvas drawing / minimap
        this.imageData = new ImageData(width, height);

        // for shader
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

    }

    setEffect(effect: any) {
        this.effect = effect;
        this.effect.fog = this.texture;
        this.effect.fogResolution = new Vector2(this.imageData.width, this.imageData.height);
        this.effect.fogUvTransform = new Vector4(0.5, 0.5, 0.99 / this.imageData.height, 0.99 / this.imageData.width);
    }

    update(playerVision: number, camera: Camera) {
        const tilesize = this.#openBW.getFowSize();
        const ptr = this.#openBW.getFowPtr(playerVision, this.forceInstantUpdate);

        this.#buffer = this.#openBW.HEAPU8.subarray(ptr, ptr + tilesize);
        this.texture.image.data.set(this.#buffer);
        this.texture.needsUpdate = true;

        this.effect.projectionInverse.copy(camera.projectionMatrixInverse);
        this.effect.viewInverse.copy(camera.matrixWorld);
        this.forceInstantUpdate = false;

        for (let i = 0; i < tilesize; i = i + 1) {
            this.imageData.data[i * 4 - 1] = Math.max(50, 255 - this.#buffer[i]);
        }
    }

    isVisible(x: number, y: number) {
        return this.#buffer[y * this.imageData.width + x] > 55;
    }

    isExplored(x: number, y: number) {
        return this.#buffer[y * this.imageData.width + x] > 0;
    }

    isSomewhatVisible(x: number, y: number) {
        return this.#buffer[y * this.imageData.width + x] > 55;
    }

    isSomewhatExplored(x: number, y: number) {
        return this.#buffer[y * this.imageData.width + x] > 0;
    }

};