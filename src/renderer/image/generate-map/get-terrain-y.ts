
export const getTerrainY = (
    image: { width: number, height: number, data: Uint8ClampedArray },
    scale: number,
    mapWidth: number,
    mapHeight: number,
    offset = 0.1
  ) => {
    const imageF = new Float32Array(image.data.length);
    for (let i = 0; i < image.data.length; i++) {
      imageF[i] = (image.data[i] / 255) * scale;
    }
  
    const pxScale = image.width / mapWidth;
    const pyScale = image.height / mapHeight;
  
    return (x: number, y: number) => {
      const px = Math.floor((x + mapWidth / 2) * pxScale);
      const py = Math.floor((y + mapHeight / 2) * pyScale);
  
      const p = (py * image.width + px);
  
      return imageF[p] + offset;
    };
  };
  
  export type GetTerrainY = (x: number, y: number) => number;