
import { ImageDAT } from "../../types";
import GrpSDLegacy from "../atlas/atlas-sd-legacy";
import { rgbToCanvas } from "../canvas";

export default async (grp: Buffer, palette: Uint8Array) => {
    const grpSD = new GrpSDLegacy();

    await grpSD.load({
        readGrp: () => Promise.resolve(grp),
        imageDef: {} as ImageDAT,
        palettes: [palette],
    });

    if (
        !grpSD.texture ||
        !grpSD.frames ||
        !grpSD.grpHeight ||
        !grpSD.grpWidth
    ) {
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

    const gw = grpSD.grpWidth / 2;
    const gh = grpSD.grpHeight / 2;

    //max frame dims, max frame offsets from center
    const maxW = grpSD.frames.reduce((max, { w }) => (w > max ? w : max), 0);
    const maxH = grpSD.frames.reduce((max, { h }) => (h > max ? h : max), 0);
    const maxOx = grpSD.frames.reduce(
        (max, { x }) => (gw - x > max ? gw - x : max),
        0
    );
    const maxOy = grpSD.frames.reduce(
        (max, { y }) => (gh - y > max ? gh - y : max),
        0
    );

    const icons = grpSD.frames.map(({ x, y, grpX, grpY, w, h }) => {
        const dest = document.createElement("canvas");
        dest.width = maxW;
        dest.height = maxH;

        const dx = maxOx - (gw - x);
        const dy = maxOy - (gh - y);

        const ctx = dest.getContext("2d");
        if (!ctx) {
            throw new Error("Could not create canvas context");
        }
        ctx.drawImage(canvas, grpX + x, grpY + y, w, h, dx, dy, w, h);
        return dest.toDataURL("image/png");
    });

    return {
        icons,
        offX: maxOx,
        offY: maxOy,
    };
};