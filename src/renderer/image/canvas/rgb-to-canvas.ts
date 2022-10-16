export const rgbToCanvas = (
    {
        data,
        width,
        height,
        defaultCanvas,
    }: {
        data: Uint8Array | Uint8ClampedArray;
        width: number;
        height: number;
        defaultCanvas?: HTMLCanvasElement;
    },
    format = "rgba"
) => {
    const canvas = defaultCanvas || document.createElement( "canvas" );
    const ctx = canvas.getContext( "2d" );
    if ( !ctx ) {
        throw new Error( "Could not get canvas context" );
    }

    canvas.width = width;
    canvas.height = height;

    const srcPixelWidth = format === "rgba" ? 4 : 3;
    const dstPixelWidth = 4;

    const imagedata = ctx.createImageData( width, height );

    for (
        let src = 0, dst = 0;
        src < data.length;
        src += srcPixelWidth, dst += dstPixelWidth
    ) {
        imagedata.data[dst] = data[src];
        imagedata.data[dst + 1] = data[src + 1];
        imagedata.data[dst + 2] = data[src + 2];
        imagedata.data[dst + 3] = srcPixelWidth === 4 ? data[src + 3] : 255;
    }

    ctx.putImageData( imagedata, 0, 0 );
    return canvas;
};
