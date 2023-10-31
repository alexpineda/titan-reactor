import {
    BufferAttribute,
    BufferGeometry,
    Color,
    Intersection,
    Matrix4,
    Mesh,
    NearestFilter,
    NormalBlending,
    Raycaster,
    SubtractiveBlending,
    Triangle,
    Vector2,
    Vector3,
} from "three";

import { drawFunctions } from "common/enums";
import { ImageBase } from ".";
import { ImageHDMaterial } from "./image-hd-material";
import gameStore from "@stores/game-store";
import { ImageHDInstancedMaterial } from "./image-hd-instanced-material";
import { AnimAtlas } from "@image/atlas";

const white = new Color( 0xffffff );
const CLOAK_OPACITY = 0.6;

const _worldScale = new Vector3();
const _mvPosition = new Vector3();
const _intersectPoint = new Vector3();
const _alignedPosition = new Vector3();
const _vA = new Vector3();
const _vB = new Vector3();
const _vC = new Vector3();
const _uvA = new Vector2();
const _uvB = new Vector2();
const _uvC = new Vector2();
const _viewWorldMatrix = new Matrix4();

function transformVertex( vertexPosition: Vector3, mvPosition: Vector3, scale: Vector3 ) {
    // compute position in camera space
    _alignedPosition.copy( vertexPosition ).multiply( scale );

    vertexPosition.copy( mvPosition );
    vertexPosition.x += _alignedPosition.x;
    vertexPosition.y += _alignedPosition.y;

    // transform to world space
    vertexPosition.applyMatrix4( _viewWorldMatrix );
}

const _uv = new Vector2();

/**
 * A threejs mesh for a starcraft image.
 */
export class ImageHD
    extends Mesh<BufferGeometry, ImageHDMaterial | ImageHDInstancedMaterial>
    implements ImageBase
{
    isImageHd = true;
    isImage3d = false;
    isInstanced = false;
    atlas?: AnimAtlas;

    #frame = 0;
    #flip = false;

    _zOff: number;

    protected spriteWidth = 0;
    protected spriteHeight = 0;

    constructor() {
        super();

        this.material = this.createMaterial();
        this.material.transparent = true;

        this.geometry = new BufferGeometry();
        this.geometry.setIndex( [ 0, 1, 2, 0, 2, 3 ] );

        const posAttribute = new BufferAttribute(
            new Float32Array( [ -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0 ] ),
            3,
            false
        );
        // posAttribute.usage = DynamicDrawUsage;
        posAttribute.needsUpdate = true;
        this.geometry.setAttribute( "position", posAttribute );

        const uvAttribute = new BufferAttribute(
            new Float32Array( [ 0, 0, 1, 0, 1, 1, 0, 1 ] ),
            2,
            false
        );
        // uvAttribute.usage = DynamicDrawUsage;
        uvAttribute.needsUpdate = true;
        this.geometry.setAttribute( "uv", uvAttribute );

        this._zOff = 0;

        this.matrixAutoUpdate = false;
        this.matrixWorldAutoUpdate = false;

        this.name = "ImageHD";
    }

    protected createMaterial(): ImageHDMaterial | ImageHDInstancedMaterial {
        return new ImageHDMaterial();
    }

    get dat() {
        return gameStore().assets!.bwDat.images[this.atlas!.imageIndex];
    }

    updateImageType( atlas: AnimAtlas, force: boolean ) {
        if (
            this.atlas?.imageIndex === atlas.imageIndex &&
            this.atlas.unitTileScale === atlas.unitTileScale &&
            !force
        ) {
            return this;
        }

        this.atlas = atlas;
        this.material.map = atlas.diffuse;
        this.material.teamMask = atlas.teammask;
        this.material.warpInFlashGRP = gameStore().assets?.getImageAtlas(210)!;

        this.material.alphaTest = 0.01;
        this.scale.set( atlas.spriteWidth / 128, atlas.spriteHeight / 128, 1 );

        if ( this.dat.drawFunction === drawFunctions.rleShadow ) {
            this.material.blending = SubtractiveBlending;
        } else {
            this.material.blending = NormalBlending;
        }

        // command center / armory overlay scale up a bit to remove border issues
        if ( atlas.imageIndex === 276 || atlas.imageIndex === 269 ) {
            this.material.map.minFilter = NearestFilter;
            this.material.map.magFilter = NearestFilter;
        }

        this.material.uvPosTex = atlas.uvPosDataTex;

        this.material.needsUpdate = true;

        return this;
    }

    get unitTileScale() {
        return this.atlas!.unitTileScale;
    }

    get frames() {
        return this.atlas!.frames;
    }

    setTeamColor( val: Color | undefined ) {
        this.material.teamColor = val ?? white;
    }

    setModifiers( modifier: number, modifierData1: number, modifierData2: number ) {
        this.material.modifier = modifier;
        this.material.modifierData.set( modifierData1, modifierData2 );
        this.setOpacityFromModifiers( modifier, modifierData1 );
    }

    setOpacityFromModifiers( modifier: number, modifierData1: number ) {
        // 3 & 6 === cloak
        // 2 and 5 === activate cloak
        // 4 and 7 === deactivate cloak
        // modifierData1 = 0->8 for cloak progress
        if ( modifier === 2 || modifier === 5 || modifier === 4 || modifier === 7 ) {
            this.setOpacity( CLOAK_OPACITY + ( modifierData1 / 8 ) * ( 1 - CLOAK_OPACITY ) );
        } else if ( modifier === 3 || modifier === 6 ) {
            this.setOpacity( CLOAK_OPACITY );
        } else {
            this.setOpacity( 1 );
        }
    }

    setOpacity( val: number ) {
        this.material.opacity = val;
    }

    get frame() {
        return this.#frame;
    }

    set frame( val: number ) {
        this.#frame = val;
    }

    get flip() {
        return this.#flip;
    }

    set flip( val: boolean ) {
        this.#flip = val;
    }

    setFrame( frame: number, flip: boolean ) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ( this.atlas!.frames[frame] === undefined ) {
            if ( process.env.NODE_ENV !== "production" ) {
                // debugger;
                // throw new Error(
                //     `Invalid frame ${frame}/${this.atlas!.frames.length} for atlas ${
                //         this.atlas!.imageIndex
                //     }`
                // );
            }
            return;
        }

        ( this.material as ImageHDMaterial ).frame =
            frame / this.atlas!.frames.length + 0.5 / this.atlas!.frames.length;
        ( this.material as ImageHDMaterial ).flipped = flip;

        // this.geometry.setAttribute(
        //     "position",
        //     flip ? this.atlas!.uvPos[frame].flippedPos : this.atlas!.uvPos[frame].pos
        // );
        // this.geometry.setAttribute(
        //     "uv",
        //     flip ? this.atlas!.uvPos[frame].flippedUv : this.atlas!.uvPos[frame].uv
        // );

        this.frame = frame;
        this.flip = flip;
    }

    override raycast( raycaster: Raycaster, intersects: Intersection[] ) {
        _worldScale.setFromMatrixScale( this.matrixWorld );

        _viewWorldMatrix.copy( raycaster.camera.matrixWorld );
        this.modelViewMatrix.multiplyMatrices(
            raycaster.camera.matrixWorldInverse,
            this.matrixWorld
        );

        _mvPosition.setFromMatrixPosition( this.modelViewMatrix );

        transformVertex( _vA.set( -0.5, -0.5, 0 ), _mvPosition, _worldScale );
        transformVertex( _vB.set( 0.5, -0.5, 0 ), _mvPosition, _worldScale );
        transformVertex( _vC.set( 0.5, 0.5, 0 ), _mvPosition, _worldScale );

        _uvA.set( 0, 0 );
        _uvB.set( 1, 0 );
        _uvC.set( 1, 1 );

        // check first triangle
        let intersect = raycaster.ray.intersectTriangle(
            _vA,
            _vB,
            _vC,
            false,
            _intersectPoint
        );

        if ( intersect === null ) {
            // check second triangle
            transformVertex( _vB.set( -0.5, 0.5, 0 ), _mvPosition, _worldScale );
            _uvB.set( 0, 1 );

            intersect = raycaster.ray.intersectTriangle(
                _vA,
                _vC,
                _vB,
                false,
                _intersectPoint
            );
            if ( intersect === null ) {
                return;
            }
        }

        const distance = raycaster.ray.origin.distanceTo( _intersectPoint );

        if ( distance < raycaster.near || distance > raycaster.far ) return;

        Triangle.getInterpolation( _intersectPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, _uv );

        const x = _uv.x - 0.5;
        const y = _uv.y - 0.5;

        const posArray = this.flip
            ? this.atlas!.uvPos[this.frame].flippedPos.array
            : this.atlas!.uvPos[this.frame].pos.array;

        const intersectQuad =
            x > posArray[0] && x < posArray[3] && y > posArray[1] && y < posArray[7];

        if ( !intersectQuad ) return;

        intersects.push( {
            distance: distance,
            point: _intersectPoint.clone(),
            uv: _uv,
            face: null,
            object: this,
        } );
    }
}
