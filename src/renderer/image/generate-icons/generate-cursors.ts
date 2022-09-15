import { ImageDAT } from "common/types";
import LegacyGRP from "../atlas/legacy-grp";
import { rgbToCanvas } from "../canvas";

export const generateCursors = async (grp: Buffer, palette: Uint8Array) => {

    const grpSD = new LegacyGRP();

    await grpSD.load({
        readGrp: () => Promise.resolve(grp),
        imageDef: {} as ImageDAT,
        palettes: [palette],
    });

    if (!grpSD.texture || !grpSD.frames) {
        throw new Error("Could not load grp");
    }

    return grpSD;

}

export const generateCursorsDataURI = async (grp: Buffer, palette: Uint8Array) => {

    const grpSD = await generateCursors(grp, palette);

    const canvas = rgbToCanvas(
        {
            data: grpSD.texture.image.data,
            width: grpSD.width,
            height: grpSD.height,
        },
        "rgba"
    );

    return grpSD.frames!.map(({ x, y, grpX, grpY, w, h }) => {
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