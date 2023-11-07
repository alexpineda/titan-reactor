import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

onmessage = function ( { data: { buffer } }: { data: { buffer: Uint8Array } } ) {
    const exrLoader = new EXRLoader();
    const parsed = exrLoader.parse( buffer.buffer );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ( this as DedicatedWorkerGlobalScope ).postMessage( parsed, [parsed.data.buffer] );
};
