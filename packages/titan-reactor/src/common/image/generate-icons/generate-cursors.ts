import { ImageDAT } from "../../types";
import GrpSDLegacy from "../atlas/atlas-grp-sd";
import { rgbToCanvas } from "../canvas";



export default async (grp: Buffer, palette: Uint8Array) => {
    const grpSD = new GrpSDLegacy();

    await grpSD.load({
        readGrp: () => Promise.resolve(grp),
        imageDef: {} as ImageDAT,
        palettes: [palette],
    });

    if (!grpSD.texture || !grpSD.frames) {
        throw new Error("Could not load grp");
    }
    const canvas = rgbToCanvas(
        {
            data: grpSD.texture.image.data,
            width: grpSD.width,
            height: grpSD.height,
        },
        "rgba"
    );

    return grpSD.frames.map(({ x, y, grpX, grpY, w, h }) => {
        const dest = document.createElement("canvas");
        dest.width = w;
        dest.height = h;
        const ctx = dest.getContext("2d");
        if (!ctx) {
            throw new Error("Could not create canvas context");
        }
        ctx.drawImage(canvas, grpX + x, grpY + y, w, h, 0, 0, w, h);
        return dest.toDataURL("image/png");
    });
};