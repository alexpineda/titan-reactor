export const canvasToImage = ( canvas: HTMLCanvasElement ) => {
    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
};
