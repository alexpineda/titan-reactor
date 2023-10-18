import { ReadFile } from "common/types";

import { parseDdsGrp } from "../formats/parse-dds-grp";
import { generateCursors } from "./generate-cursors";
import { generateRaceIcons } from "./generate-races";
import { generateResourceIcons } from "./generate-resources";
import { renderComposer } from "@render/render-composer";
import { RepeatWrapping } from "three";
import { b2ba } from "@utils/bin-utils";
import { setAsset } from "@stores/game-store";
import { range } from "lodash";

import { generateWireframes } from "./generate-wireframes";

const createOffScreenCanvas = () => {
    const canvas = document.createElement( "canvas" );
    return canvas.transferControlToOffscreen();
};

// somewhat expensive (~1second), so we do it w/ fancy web workers
const generateWireframeOffscreen = async ( readFile: ReadFile ) => {
    const c1 = createOffScreenCanvas(),
        c2 = createOffScreenCanvas();
    const worker = new Worker( new URL( "./icons.worker.ts", import.meta.url ), {
        type: "module",
    } );

    const wireframeData = await readFile( "HD2/unit/wirefram/wirefram.dds.grp" );
    worker.postMessage(
        {
            canvas: c1,
            destCanvas: c2,
            icons: parseDdsGrp( wireframeData ).map( ( dds ) => b2ba( dds ) ),
        },
        [ c1, c2 ]
    );

    worker.onmessage = function ( {
        data,
    }: {
        data: Awaited<ReturnType<typeof generateWireframes>>;
    } ) {
        setAsset( "wireframeIcons", data );
        worker.terminate();
    };
};

export const generateCursorIcons = async ( readFile: ReadFile ) => {
    const palette = new Uint8Array(
        ( await readFile( "TileSet/jungle.wpe" ) ).buffer
    ).subarray( 0, 1024 );

    const arrowIconsGPU = await generateCursors(
        await readFile( "cursor/arrow.grp" ),
        palette
    );

    arrowIconsGPU.texture.wrapS = arrowIconsGPU.texture.wrapT = RepeatWrapping;

    const hoverIconsGPU = await generateCursors(
        await readFile( "cursor/MagY.grp" ),
        palette
    );

    hoverIconsGPU.texture.wrapS = hoverIconsGPU.texture.wrapT = RepeatWrapping;

    const dragIconsGPU = await generateCursors(
        await readFile( "cursor/Drag.grp" ),
        palette
    );

    dragIconsGPU.texture.wrapS = dragIconsGPU.texture.wrapT = RepeatWrapping;

    return {
        arrowIconsGPU,
        hoverIconsGPU,
        dragIconsGPU,
    };
};

export const generateUIIcons = async ( readFile: ReadFile ) => {
    const r = ( f: string ) => readFile( f )

    generateWireframeOffscreen( readFile );

    const cmdIcons: ArrayBuffer[] = [];
    for ( const i of range( 0, 389 ) ) {
        cmdIcons[i] = await r( `webui\\dist\\lib\\images\\cmdicons.${i}.png` );
    }

    const workerIcons = {
        apm: await r( "webui/dist/lib/images/icon_apm.png" ),
        terran: await r( "webui/dist/lib/images/icon_worker_terran.png" ),
        zerg: await r( "webui/dist/lib/images/icon_worker_zerg.png" ),
        protoss: await r( "webui/dist/lib/images/icon_worker_protoss.png" ),
    };

    renderComposer.preprocessStart();
    const renderer = renderComposer.getWebGLRenderer();

    const gameIcons = await generateResourceIcons(
        renderer,
        parseDdsGrp( await readFile( "game/icons.dds.grp" ) )
    );

    const raceInsetIcons = await generateRaceIcons(
        renderer,
        parseDdsGrp( await readFile( "glue/scoretd/iScore.dds.grp" ) )
    );

    renderComposer.preprocessEnd();

    return {
        cmdIcons,
        gameIcons,
        raceInsetIcons,
        workerIcons,
    };
};
