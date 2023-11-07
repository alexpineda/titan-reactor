import { Janitor } from "three-janitor";
import { CreepTexture, UnitTileScale } from "common/types";
import {
    MeshBasicMaterial,
    OrthographicCamera,
    Scene,
    Vector3,
    PlaneGeometry,
    Mesh,
    WebGLRenderer,
    NearestFilter,
    WebGLRenderTarget,
    LinearEncoding,
    SRGBColorSpace,
} from "three";
import { parseDdsGrp } from "../../formats/parse-dds-grp";
import { createDDSTexture, parseDDS } from "@image/formats";

const width = 13;
const height = 1;

// generates a single creep texture from 0 - 13
export const ddsToCreepTexture = (
    buffer: Buffer,
    tilegroupU16: Uint16Array,
    res: UnitTileScale,
    renderer: WebGLRenderer
): CreepTexture => {
    renderer.clear();

    const PX_PER_TILE_HD = res === UnitTileScale.HD ? 128 : 64;

    const tiles = parseDdsGrp( buffer );

    const ortho = new OrthographicCamera(
        -width / 2,
        width / 2,
        -height / 2,
        height / 2
    );
    ortho.position.y = width;
    ortho.lookAt( new Vector3() );

    const rt = new WebGLRenderTarget( width * PX_PER_TILE_HD, height * PX_PER_TILE_HD, {
        anisotropy: renderer.capabilities.getMaxAnisotropy(),
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        encoding: LinearEncoding,
        generateMipmaps: true,
        depthBuffer: false,
    } );
    renderer.setRenderTarget( rt );
    renderer.setSize( width * PX_PER_TILE_HD, height * PX_PER_TILE_HD );

    const scene = new Scene();
    scene.name = "creep-ortho-scene";
    const plane = new PlaneGeometry();

    for ( let i = 0; i < width; i++ ) {
        const x = i;
        const y = 0;
        // get the 13 creep tiles in the 2nd tile group including a first empty tile
        const texture = createDDSTexture( parseDDS( tiles[tilegroupU16[36 + i]] ) );
        texture.colorSpace = SRGBColorSpace;

        const mat = new MeshBasicMaterial( {
            map: texture,
        } );
        const mesh = new Mesh( plane, mat );
        mesh.name = `creep-${i}`;
        mesh.rotation.x = Math.PI / 2;
        mesh.position.x = x - width / 2 + 0.5;
        mesh.position.z = y - height / 2 + 0.5;
        scene.add( mesh );
    }

    renderer.render( scene, ortho );
    const texture = rt.texture;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.flipY = true;
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    renderer.setRenderTarget( null );

    Janitor.trash( "ddsCreep", scene );

    return {
        texture,
        count: width,
        dispose() {
            rt.dispose();
        },
    };
};
