import { BufferAttribute, BufferGeometry, PlaneBufferGeometry, Vector2, Vector3 } from "three";

export const createDisplacementGeometry = (
  existingGeom: BufferGeometry,
  width: number,
  height: number,
  widthSegments: number,
  heightSegments: number,
  canvas: HTMLCanvasElement,
  displacementScale = 2,
  displacementBias = 1
) => {
  const geom =
    existingGeom ||
    new PlaneBufferGeometry(width, height, widthSegments, heightSegments);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get context");
  }
  const pos = geom.getAttribute("position");
  const uvs = geom.getAttribute("uv") as BufferAttribute;
  const nor = geom.getAttribute("normal");
  const p = new Vector3();
  const uv = new Vector2();
  const n = new Vector3();

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    uv.fromBufferAttribute(uvs, i);
    n.fromBufferAttribute(nor, i);

    const displacement = getDisplacement(canvas, ctx, uv);

    p.addScaledVector(n, displacement * displacementScale).addScaledVector(
      n,
      displacementBias
    );
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();

  return geom;
};

function getDisplacement(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, uv: Vector2) {
  const w = canvas.width - 1;
  const h = canvas.height - 1;

  const uvW = Math.floor(w * uv.x);
  const uvH = Math.floor(h * (1 - uv.y));
  const uvWnext = uv.x === 1.0 ? uvW : uvW + 1;
  const uvHnext = uv.y === 0.0 ? uvH : uvH + 1;

  const uvWfract = w * uv.x - uvW;
  const uvHfract = h * (1 - uv.y) - uvH;

  const d0 = context.getImageData(uvW, uvH, 1, 1).data[0] / 255.0;
  const d1 = context.getImageData(uvWnext, uvH, 1, 1).data[0] / 255.0;
  const d01 = d0 + (d1 - d0) * uvWfract;

  const d2 = context.getImageData(uvW, uvHnext, 1, 1).data[0] / 255.0;
  const d3 = context.getImageData(uvWnext, uvHnext, 1, 1).data[0] / 255.0;
  const d23 = d2 + (d3 - d2) * uvWfract;

  const d = d01 + (d23 - d01) * uvHfract;

  return d;
}

export const getTerrainY = (
  image: ImageData,
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

    const p = (py * image.width + px) * 4;

    return imageF[p] + offset;
  };
};
