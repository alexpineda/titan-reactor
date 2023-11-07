import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

onmessage = function ( { data: { buffer } }: { data: { buffer: Uint8Array } } ) {
    const exrLoader = new RGBELoader();
    const parsed = exrLoader.parse( buffer.buffer );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ( this as DedicatedWorkerGlobalScope ).postMessage( parsed, [ parsed.data.buffer ] );
};
