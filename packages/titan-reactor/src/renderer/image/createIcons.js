
import { Grp } from "../../../libs/bw-chk/grp";
import { range } from "ramda";
import { RenderMode } from "../../settings";
import { rgbToCanvas, canvasToHtmlImage } from "./canvas";

const alphaBuffer = (w,h) => {
    const out = new Buffer(pW * pH * 4);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            out[(y * w + x) * 4 + 4] = 255;
        }
    } 
    return out;
} 

//game/icons.grp <- icons palette
export const createIcons = (buf, palette) => {
    const grp = new Grp(buf, Buffer);
    const sdIcons = range(0, grp.frameCount()).map(frame => {
        const { w, h, x, y } = grp.header(frame);
        const data = grp.decode(frame, palette);
        return canvasToHtmlImage(rgbToCanvas({data, width:w, height:h}, "rgba"));
    });

    return {
        [RenderMode.SD]: sdIcons,
        [RenderMode.HD]: sdIcons,
        [RenderMode.ThreeD]: sdIcons,
    }
}

export const createWireframes = (buf, palette) => {
    const grp = new Grp(buf, Buffer);
    const [w:maxW, h:maxH] = grp.maxDimensions();

    const grpStride = Math.floor(1024/maxW);
    const cw = maxW * grpStride;
    const ch = Math.ceil(grp.frameCount() / grpStride) * maxH;

    const texData = alphaBuffer(cw, ch);

    const frames = []
    for (let frame = 0; frame < grp.frameCount(); frame++) {
        const grpX = (frame % grpStride) * mw;
        const grpY = Math.floor(frame / grpStride) * mh;
        
        frames.push({ x: grpX, y:grpY, w: maxW, h: maxH});

        for (let fy = 0; fy < h; fy++) {
            for (let fx = 0; fx < w; fx++) {
                const py = fy + y + grpY;
                const px = fx + x + grpX;
                const pos = (py * cw + px) * 4;
                const spritePos = (fy * w + fx) * 4;
                texData[pos] = data[spritePos];
                texData[pos + 1] = data[spritePos + 1];
                texData[pos + 2] = data[spritePos + 2];
                texData[pos + 3] = data[spritePos + 3];
            }
        }
    }

    const wireframeSD = new WireframeSD(rgbToCanvas({data: texData, width:cw, height:ch}, "rgba"), frames);

    return {
        [RenderMode.SD]: wireframeSD,
        [RenderMode.HD]: wireframeSD,
        [RenderMode.ThreeD]: wireframeSD,
    }
    return ;
}

class WireframeSD {
    constructor(atlas, frames) {
        this.atlas = atlas;
        this.cache = {}
        this.frames = frames;
    }

    getWireframe(id) {
        if (this.cache[id]) return cache[id];

        const {x,y,w,h} = this.frames[id];

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(this.atlas,  x,y,w,h,  0,0,w,y);
        
        const image = canvasToHtmlImage(canvas);
        this.cache[id] = image;
        return image;
    }
}

//game/blink.grp
//@todo implement
export const createMapPingTexture = (buf, palette) => {
        const grp = new Grp(buf, Buffer);
        const max = grp.maxDimensions();

        const sdIcons = range(0, grp.frameCount()).map(frame => {
            const { x, y, w, h } = grp.header(frame);
            const data = grp.decode(frame, palette);
            return rgbToCanvas({data, width:w, height:h}, "rgba");
        });

        return {
            [RenderMode.SD]: sdIcons,
            [RenderMode.HD]: sdIcons,
            [RenderMode.ThreeD]: sdIcons,
        }
}