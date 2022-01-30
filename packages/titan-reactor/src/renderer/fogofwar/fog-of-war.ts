import { strict as assert } from "assert";
import { Camera, ClampToEdgeWrapping, DataTexture, LinearFilter, LuminanceFormat, RedIntegerFormat, Texture, UnsignedByteType, Vector2, Vector4 } from "three";
import { OpenBWAPI } from "../openbw";

export default class FogOfWar {
    private _bw: OpenBWAPI;
    imageData: ImageData;
    texture: Texture;
    // until postprocessing gets types
    effect: any;
    private _buffer = new Uint8Array();
    playerVisionWasToggled = false;
    enabled = true;

    constructor(width: number, height: number, openBw: OpenBWAPI, effect: any) {
        this._bw = openBw;

        // for use with canvas drawing / minimap
        this.imageData = new ImageData(width, height);

        // for shader
        const texture = new DataTexture(
            new Uint8ClampedArray(width * height),
            width,
            height,
            LuminanceFormat,
            UnsignedByteType,
        );


        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = LinearFilter;
        texture.minFilter = LinearFilter;

        texture.needsUpdate = true;

        this.texture = texture;
        this.effect = effect;
        this.effect.fog = texture;
        this.effect.fogResolution = new Vector2(width, height);
        this.effect.fogUvTransform = new Vector4(0.5, 0.5, 1 / height, 1 / width);
    }

    update(playerVision: number, camera: Camera) {
        assert(this._bw.wasm)
        const tilesize = this._bw.call.getFowSize();
        const ptr = this._bw.call.getFowPtr(playerVision, this.playerVisionWasToggled);

        this._buffer = this._bw.wasm.HEAPU8.subarray(ptr, ptr + tilesize);
        this.texture.image.data.set(this._buffer);
        this.texture.needsUpdate = true;

        this.effect.projectionInverse.copy(camera.projectionMatrixInverse);
        this.effect.viewInverse.copy(camera.matrixWorld);
        this.playerVisionWasToggled = false;

        for (let i = 0; i < tilesize; i = i + 1) {
            this.imageData.data[i * 4 - 1] = Math.max(50, 255 - this._buffer[i]);
        }
    }

    isVisible(x: number, y: number) {
        return this._buffer[y * this.imageData.width + x] > 55;
    }

    isExplored(x: number, y: number) {
        return this._buffer[y * this.imageData.width + x] > 0;
    }

    isSomewhatVisible(x: number, y: number) {
        return this._buffer[y * this.imageData.width + x] > 55;
    }

    isSomewhatExplored(x: number, y: number) {
        return this._buffer[y * this.imageData.width + x] > 0;
    }

};