import {
    AnimationClip,
    Color,
    Group,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    SRGBColorSpace,
    Texture,
} from "three";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshoptDecoder } from "./mesh-opt-decoder";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import { useWebGLRenderer } from "@render/render-composer";

const ktx2Loader = new KTX2Loader();
useWebGLRenderer(renderer => {
    ktx2Loader.setTranscoderPath(  __static + "/basis/" );
    ktx2Loader.detectSupport( renderer );
})


const loader = new GLTFLoader()
    .setMeshoptDecoder( MeshoptDecoder )
    .setKTX2Loader( ktx2Loader );

export interface GlbResponse {
    model: Group;
    animations: AnimationClip[];
}
export function loadGlb(
    file: string,
    envMap: Texture | null,
    name = ""
): Promise<GlbResponse> {
    return new Promise( ( resolve, reject ) => {
        loader.load(
            file,
            ( glb: GLTF ) => {
                const { scene: model, animations } = glb;
                model.traverse( ( o: Object3D ) => {
                    if ( o instanceof Mesh ) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        if ( ( o.material as MeshStandardMaterial ).map ) {
                            ( o.material as MeshStandardMaterial ).map!.colorSpace =
                                SRGBColorSpace;
                        }
                        if ( envMap ) {
                            ( o.material as MeshStandardMaterial ).envMap = envMap;
                        }
                        ( o.material as MeshStandardMaterial ).emissive = new Color(
                            0xffffff
                        );
                        ( o.material as MeshStandardMaterial ).emissiveIntensity = 0;
                        model.userData.mesh = o;
                    }
                } );

                Object.assign( model, { name } );

                resolve( { model, animations } );
            },
            undefined,
            ( error: any ) => {
                console.error( error );
                reject( error );
            }
        );
    } );
}
