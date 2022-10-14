import { OrthographicCamera, Scene, WebGLRenderer } from "three";
import { createDDSTexture } from "../formats/create-dds-texture";

export const generateWireframes = async (renderer: WebGLRenderer, dds: Buffer[]) => {
    const wireframes = [];

    const ortho = new OrthographicCamera(-1, 1, 1, -1);

    const scene = new Scene();

    for (let i = 0; i < dds.length; i++) {
        const texture = await createDDSTexture(dds[i]);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Could not create canvas context");
        }

        const width = texture.image.width;
        const height = texture.image.height;

        renderer.setSize(width, height);

        // we dont need the last 2 frames
        const optWidth = width - 128 * 2;

        canvas.width = optWidth;
        canvas.height = height;
        scene.background = texture;

        renderer.render(scene, ortho);

        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(
            renderer.domElement,
            0,
            0,
            optWidth,
            height,
            0,
            0,
            optWidth,
            -height
        );
        ctx.restore();

        // white -> red outlines
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, optWidth, height);
        ctx.restore();

        // restore alpha of original
        ctx.save();
        ctx.globalCompositeOperation = "destination-atop";
        ctx.scale(1, -1);
        ctx.drawImage(
            renderer.domElement,
            0,
            0,
            optWidth,
            height,
            0,
            0,
            optWidth,
            -height
        );
        ctx.restore();

        wireframes[i] = await new Promise(res => canvas.toBlob(res, "image/png"));

    }

    return wireframes;
};