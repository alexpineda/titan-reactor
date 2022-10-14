
import { OrthographicCamera, Scene, WebGLRenderer } from "three";
import { parseDDS } from "../formats/parse-dds";
import { createDDSTexture } from "../formats/create-dds-texture";

export const renderIconsToBlob = async function* (
    renderer: WebGLRenderer,
    fixedWidth: number | null,
    fixedHeight: number | null,
    dds: Uint8Array[],
    alpha = 0,
    color: string | null = null
) {
    const ortho = new OrthographicCamera(-1, 1, 1, -1);

    const scene = new Scene();

    for (let i = 0; i < dds.length; i++) {
        const texture = createDDSTexture(parseDDS(dds[i]));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Could not create canvas context");
        }

        const width = fixedWidth ?? texture.image.width;
        const height = fixedHeight ?? texture.image.height;

        renderer.setSize(width, height);

        canvas.width = width;
        canvas.height = height;

        scene.background = texture;
        renderer.render(scene, ortho);

        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(renderer.domElement, 0, 0, width, -height);
        ctx.restore();

        if (color) {
            // white -> color outlines
            ctx.save();
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();

            // restore alpha of original
            ctx.save();
            ctx.globalCompositeOperation = "destination-atop";
            ctx.scale(1, -1);
            ctx.drawImage(renderer.domElement, 0, 0, width, -height);
            ctx.restore();
        }

        if (alpha) {
            // create a 50% transparent image for use with css background-image
            const alphaCanvas = document.createElement("canvas");
            const actx = alphaCanvas.getContext("2d");
            if (!actx) {
                throw new Error("Could not create canvas context");
            }
            alphaCanvas.width = width;
            alphaCanvas.height = height;
            actx.scale(1, -1);
            actx.globalAlpha = alpha;
            actx.drawImage(renderer.domElement, 0, 0, width, -height);

            yield new Promise(res => alphaCanvas.toBlob(res, "image/png"));

        } else {
            yield new Promise(res => canvas.toBlob(res, "image/png"));
        }

    }
}