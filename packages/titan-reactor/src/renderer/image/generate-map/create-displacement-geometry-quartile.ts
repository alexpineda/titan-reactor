import { BufferAttribute, BufferGeometry, PlaneBufferGeometry, Vector2, Vector3 } from "three";

export const createDisplacementGeometryQuartile = (
  existingGeom: BufferGeometry | null,
  width: number,
  height: number,
  widthSegments: number,
  heightSegments: number,
  canvas: HTMLCanvasElement,
  displacementScale = 2,
  displacementBias = 1,
  scaleWidth = 1,
  scaleHeight = 1,
  offX = 0,
  offY = 0
) => {
  const geom =
    existingGeom ||
    new PlaneBufferGeometry(width, height, widthSegments, heightSegments);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
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

    const displacement = getDisplacement(
      canvas,
      ctx,
      uv,
      scaleWidth,
      scaleHeight,
      offX,
      offY
    );

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

function getDisplacement(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  uv: Vector2,
  scaleWidth: number,
  scaleHeight: number,
  offX: number,
  offY: number
) {
  const w = canvas.width - 1;
  const h = canvas.height - 1;

  const uvW = Math.floor(w * scaleWidth * uv.x) + offX;
  const uvH = Math.floor(h * scaleHeight * (1 - uv.y)) + offY;
  let uvWnext = uvW;
  let uvHnext = uvH;

  if (uv.x === 1.0) {
    uvWnext = Math.min(w, uvW + 1);
  } else if (uv.x === 0.0) {
    uvWnext = Math.max(0, uvW - 1);
  }

  if (uv.y === 0.0) {
    uvHnext = Math.min(h, uvH + 1);
  } else if (uv.y === 1.0) {
    uvHnext = Math.max(0, uvH - 1);
  }

  const direct = context.getImageData(uvW, uvH, 1, 1).data[0] / 255.0;
  const next = context.getImageData(uvWnext, uvHnext, 1, 1).data[0] / 255.0;

  return (direct + next) / 2;
}
