import * as THREE from "three";

export const createDisplacementGeometry = (
  width,
  height,
  widthSegments,
  heightSegments,
  canvas,
  displacementScale = 2,
  displacementBias = 1
) => {
  var geom = new THREE.PlaneBufferGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );
  // geom.rotateX(-Math.PI * 0.5);
  var ctx = canvas.getContext("2d");

  var pos = geom.getAttribute("position");
  var uvs = geom.getAttribute("uv");
  var nor = geom.getAttribute("normal");
  var p = new THREE.Vector3();
  var uv = new THREE.Vector2();
  var n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    uv.fromBufferAttribute(uvs, i);
    n.fromBufferAttribute(nor, i);

    var displacement = getDisplacement(canvas, ctx, uv);

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

function getDisplacement(canvas, context, uv) {
  var w = canvas.width - 1;
  var h = canvas.height - 1;

  var uvW = Math.floor(w * uv.x);
  var uvH = Math.floor(h * (1 - uv.y));
  var uvWnext = uv.x === 1.0 ? uvW : uvW + 1;
  var uvHnext = uv.y === 0.0 ? uvH : uvH + 1;
  var uvWfract = w * uv.x - uvW;
  var uvHfract = h * (1 - uv.y) - uvH;

  var d0 = context.getImageData(uvW, uvH, 1, 1).data[0] / 255.0;
  var d1 = context.getImageData(uvWnext, uvH, 1, 1).data[0] / 255.0;
  var d01 = d0 + (d1 - d0) * uvWfract;

  var d2 = context.getImageData(uvW, uvHnext, 1, 1).data[0] / 255.0;
  var d3 = context.getImageData(uvWnext, uvHnext, 1, 1).data[0] / 255.0;
  var d23 = d2 + (d3 - d2) * uvWfract;

  var d = d01 + (d23 - d01) * uvHfract;

  return d;
}

export function getTerrainY(image, scale, x, y, mapWidth, mapHeight) {
  if (!image) return 0;
  const px = Math.floor(((x + mapWidth / 2) / mapWidth) * image.width);
  const py = Math.floor(((y + mapHeight / 2) / mapHeight) * image.height);

  const p = (py * image.width + px) * 4;

  return (image.data[p] / 255) * scale;
}
