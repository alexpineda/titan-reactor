import { WebGLRenderer } from "three"
import { generateWireframes } from "./generate-wireframes";

onmessage = async function ({ data: { canvas, icons, destCanvas } }: { data: { canvas: OffscreenCanvas, destCanvas: OffscreenCanvas, icons: Uint8Array[] } }) {

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });

    postMessage(await generateWireframes(
        renderer,
        destCanvas,
        icons,
    ));

}