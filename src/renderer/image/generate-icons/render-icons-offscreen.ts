
import { OrthographicCamera, Scene, WebGLRenderer, Mesh, PlaneGeometry, MeshBasicMaterial, Color, DoubleSide } from "three";
import { parseDDS } from "../formats/parse-dds";
import { createDDSTexture } from "../formats/create-dds-texture";

export const renderIconsToBlobOffscreen = async function* (
    _: WebGLRenderer,
    fixedWidth: number | null,
    fixedHeight: number | null,
    dds: Uint8Array[],
    color: string | null = null
) {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true, depth: false, canvas: _.domElement });

    const ortho = new OrthographicCamera(-1, 1, 1, -1);

    const scene = new Scene();
    const mesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ color: color ? new Color(color) : undefined }));
    mesh.material.side = DoubleSide;
    scene.add(mesh);
    mesh.rotation.x += Math.PI;

    for (let i = 0; i < dds.length; i++) {
        const texture = createDDSTexture(parseDDS(dds[i]));

        const width = fixedWidth ?? texture.image.width;
        const height = fixedHeight ?? texture.image.height;

        renderer.setSize(width, height, false);

        // scene.background = texture;
        scene.scale.set(1, -1, 1);
        renderer.render(scene, ortho);
        renderer.dispose();

        const canvas = renderer.domElement as unknown as OffscreenCanvas;
        // const ctx = canvas.getContext("2d");
        // if (!ctx) {
        //     throw new Error("Could not create canvas context");
        // }

        // ctx.save();
        // ctx.scale(1, -1);
        // ctx.drawImage(renderer.domElement, 0, 0, width, -height);
        // ctx.restore();

        // if (color) {
        //     // white -> color outlines
        //     ctx.save();
        //     ctx.globalCompositeOperation = "multiply";
        //     ctx.fillStyle = color;
        //     ctx.fillRect(0, 0, width, height);
        //     ctx.restore();

        //     // restore alpha of original
        //     ctx.save();
        //     ctx.globalCompositeOperation = "destination-atop";
        //     ctx.scale(1, -1);
        //     ctx.drawImage(renderer.domElement, 0, 0, width, -height);
        //     ctx.restore();
        // }

        yield canvas.convertToBlob({ type: "image/png" });

    }
}