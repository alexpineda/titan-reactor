import "three/examples/jsm/utils/SkeletonUtils";

import {
    AnimationAction,
    AnimationMixer,
    Bone,
    Box3,
    Box3Helper,
    BufferGeometry,
    Color,
    Mesh,
    Object3D,
    SkinnedMesh,
    Sphere,
    Vector3,
} from "three";
import type { ImageBase } from ".";
import { standardMaterialToImage3DMaterial } from "@utils/material-utils";
import { Image3DMaterial } from "./image-3d-material";
import gameStore from "@stores/game-store";
import { calculateAABB, parallelTraverse } from "@utils/mesh-utils";
import { GltfAtlas } from "@image/atlas";

const white = new Color( 0xffffff );

const _v1 = new Vector3();

const sourceLookup = new Map<Object3D, Object3D>();
const cloneLookup = new Map<Object3D, Object3D>();

export class Image3D extends Object3D implements ImageBase {
    isImageHd = false;
    isImage3d = true;
    isInstanced = false;

    atlas: GltfAtlas;
    mixer?: AnimationMixer;
    model: GltfAtlas["model"];
    mesh!: Mesh;

    boundingBox = new Box3();
    boundingSphere = new Sphere();

    #frame = 0;
    #times = new Float32Array();
    #action?: AnimationAction;

    // we cannot name this  `material` as three.js render will pick it up in an incorrect way
    readonly image3dMaterial: Image3DMaterial;

    _zOff: number;

    constructor( atlas: GltfAtlas ) {
        super();
        this.atlas = atlas;

        this.model = Image3D.clone( atlas.model );

        this.image3dMaterial = standardMaterialToImage3DMaterial( atlas.mesh.material );

        this.add( this.model );

        if ( this.model instanceof SkinnedMesh ) {
            this.model.pose();
        }

        this.model.traverse( ( o: Object3D ) => {
            if ( o instanceof Mesh ) {
                this.mesh = o as Mesh<BufferGeometry, Image3DMaterial>;
                o.material = this.image3dMaterial;
                const geometry = o.geometry as BufferGeometry;

                if ( o instanceof SkinnedMesh ) {
                    geometry.boundingBox = calculateAABB(
                        this,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        o,
                        atlas.animations[0],
                        0
                    );

                    // modified Box3.getBoundingSphere to be a bit smaller 0.5 -> 0.4
                    geometry.boundingSphere = new Sphere();
                    geometry.boundingBox.getCenter( geometry.boundingSphere.center );
                    geometry.boundingSphere.radius =
                        geometry.boundingBox.getSize( _v1 ).length() * 0.4;
                } else {
                    geometry.computeBoundingSphere();
                    geometry.computeBoundingBox();
                }

                this.boundingBox = geometry.boundingBox!;
                this.boundingSphere = geometry.boundingSphere!;

                // const sphereHelper = new Mesh(new SphereGeometry(this.boundingSphere.radius), new MeshBasicMaterial({ color: 0xff0000 }));
                // sphereHelper.position.copy(this.boundingSphere.center);
                // this.add(sphereHelper);

                //TODO: why do skinned meshes not update unless this is here? wtf
                const b = new Box3Helper( this.boundingBox, new Color( "blue" ) );
                // b.visible = false;
                this.add( b );
            }
        } );

        if ( this.atlas.animations.length ) {
            this.#times = this.atlas.animations[0].tracks[0].times;
            // so the last frame does not loop over
            this.#times[this.#times.length - 1] =
                this.#times[this.#times.length - 1] - 0.0000001;
            this.mixer = new AnimationMixer( this );
            this.#action = this.mixer.clipAction( this.atlas.animations[0] );
            this.#action.play();
        }

        this._zOff = 0;
        this.setFrame( 0 );

        this.matrixAutoUpdate = false;
        this.matrixWorldAutoUpdate = false;

        this.name = "Image3D";
    }

    get dat() {
        return gameStore().assets!.bwDat.images[this.atlas.imageIndex];
    }

    updateImageType() {
        this.rotation.set( 0, 0, 0 );

        return this;
    }

    get unitTileScale() {
        return this.atlas.unitTileScale;
    }

    setTeamColor( val: Color | undefined = white ) {
        this.image3dMaterial.teamColor = val;
    }

    setModifiers() {}

    get frames() {
        return this.atlas.frames;
    }

    setFrame( frame: number ) {
        if ( !this.mixer ) return;
        this.#frame = frame;
        this.mixer.setTime( this.#times[this.frame] );
    }

    setFrameSet( frameSet: number ) {
        this.setFrame( Math.floor( frameSet * 17 ) );
    }

    setEmissive( val: number ) {
        this.image3dMaterial.emissiveIntensity = val;
    }

    get frame() {
        return this.atlas.fixedFrames[this.#frame];
    }

    get frameSet() {
        return this.atlas.fixedFrames[this.#frame];
    }

    get isLooseFrame() {
        return (
            this.atlas.frames.length > 17 &&
            this.#frame / 17 > Math.floor( this.atlas.frames.length / 17 )
        );
    }

    static clone( source: Object3D ) {
        const clone = source.clone();
        sourceLookup.clear();
        cloneLookup.clear();

        parallelTraverse(
            source,
            clone,
            ( sourceNode: Object3D, clonedNode: Object3D ) => {
                sourceLookup.set( clonedNode, sourceNode );
                cloneLookup.set( sourceNode, clonedNode );
            }
        );

        clone.traverse( ( node ) => {
            if ( node instanceof SkinnedMesh ) {
                const clonedMesh = node;
                const sourceMesh = sourceLookup.get( node ) as SkinnedMesh;
                const sourceBones = sourceMesh.skeleton.bones;

                clonedMesh.skeleton = sourceMesh.skeleton.clone();
                clonedMesh.bindMatrix.copy( sourceMesh.bindMatrix );

                clonedMesh.skeleton.bones = sourceBones.map( function ( bone: Bone ) {
                    return cloneLookup.get( bone ) as Bone;
                } );

                clonedMesh.bind( clonedMesh.skeleton, clonedMesh.bindMatrix );
            }
        } );

        return clone;
    }
}
