import { ReadFile } from "common/types";

import { parseDdsGrp } from "../formats/parse-dds-grp";
import { generateCursors } from "./generate-cursors";
import { RepeatWrapping } from "three";
import { b2ba } from "@utils/bin-utils";
import { setAsset } from "@stores/game-store";

import { generateWireframes } from "./generate-wireframes";

const createOffScreenCanvas = () => {
    const canvas = document.createElement( "canvas" );
    return canvas.transferControlToOffscreen();
};

// somewhat expensive (~1second), so we do it w/ web workers
export const generateWireframeOffscreen = async ( readFile: ReadFile ) => {
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