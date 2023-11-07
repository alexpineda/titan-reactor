// creep calculations ported from openbw

import { generateCreep } from "./generate-creep";

onmessage = function ( {
    data,
}: {
    data: { buffer: Uint8Array; frame: number; mapWidth: number; mapHeight: number };
} ) {
    const { buffer, frame, mapWidth, mapHeight } = data;

    const { creepData, edgesData, imageData } = generateCreep(
        buffer,
        mapWidth,
        mapHeight
    );

    postMessage(
        {
            frame,
            creepData,
            edgesData,
            imageData,
        },
        // @ts-expect-error
        [ creepData.buffer, edgesData.buffer, imageData.data.buffer ]
    );
};
