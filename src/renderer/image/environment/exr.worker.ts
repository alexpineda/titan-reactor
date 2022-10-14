import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

onmessage = function ({ data: { buffer } }) {

    const exrLoader = new EXRLoader();
    const parsed = exrLoader.parse(buffer.buffer);

    (this as DedicatedWorkerGlobalScope).postMessage(parsed, [parsed.data.buffer]);
}