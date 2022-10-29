import {
    ClampToEdgeWrapping,
    DataTexture,
    LinearFilter,
    RedFormat,
    UnsignedByteType,
    Vector2,
    Vector4,
} from "three";
import { OpenBW } from "@openbw/openbw";
import { FogOfWarEffect } from "./fog-of-war-effect";

export class FogOfWar {
    #openBW: OpenBW;
    texture: DataTexture;
    effect: FogOfWarEffect;
    buffer = new Uint8Array();
    forceInstantUpdate = false;
    enabled = true;

    #lastPlayerVision = -1;

    constructor( width: number, height: number, openBw: OpenBW, effect: FogOfWarEffect ) {
        this.#openBW = openBw;

        const texture = new DataTexture(
            new Uint8ClampedArray( width * height ),
            width,
            height,
            RedFormat,
            UnsignedByteType
        );

        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = LinearFilter;
        texture.minFilter = LinearFilter;

        texture.needsUpdate = true;

        this.texture = texture;

        this.effect = effect;
        this.effect.fog = this.texture;
        this.effect.fogResolution = new Vector2(
            this.texture.image.width,
            this.texture.image.height
        );
        this.effect.fogUvTransform = new Vector4(
            0.5,
            0.5,
            0.99 / this.texture.image.height,
            0.99 / this.texture.image.width
        );
    }

    onFrame( playerVision: number ) {
        if ( this.#lastPlayerVision !== playerVision || this.forceInstantUpdate ) {
            this.#openBW.setPlayerVisibility( playerVision );
            this.#lastPlayerVision = playerVision;
        }

        const tilesize = this.#openBW.getFowSize();
        const ptr = this.#openBW.getFowPtr();

        this.buffer = this.#openBW.HEAPU8.subarray( ptr, ptr + tilesize );
        this.texture.image.data.set( this.buffer );
        this.texture.needsUpdate = true;

        this.forceInstantUpdate = false;
    }

    isVisible( x: number, y: number ) {
        return this.buffer[y * this.texture.image.width + x] > 55;
    }

    isExplored( x: number, y: number ) {
        return this.buffer[y * this.texture.image.width + x] > 0;
    }

    isSomewhatVisible( x: number, y: number ) {
        return this.buffer[y * this.texture.image.width + x] > 55;
    }

    isSomewhatExplored( x: number, y: number ) {
        return this.buffer[y * this.texture.image.width + x] > 0;
    }
}
