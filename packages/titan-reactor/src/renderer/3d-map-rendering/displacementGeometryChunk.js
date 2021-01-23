import * as THREE from "three";

export const createDisplacementGeometryChunk = (
  existingGeom,
  width,
  height,
  widthSegments,
  heightSegments,
  canvas,
  displacementScale = 2,
  displacementBias = 1,
  scaleWidth = 1,
  scaleHeight = 1,
  offX = 0,
  offY = 0
) => {
  const geom =
    existingGeom ||
    new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
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

    var displacement = getDisplacement(
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
  canvas,
  context,
  uv,
  scaleWidth,
  scaleHeight,
  offX,
  offY
) {
  var w = canvas.width - 1;
  var h = canvas.height - 1;

  var uvW = Math.floor(w * scaleWidth * uv.x) + offX;
  var uvH = Math.floor(h * scaleHeight * (1 - uv.y)) + offY;
  var uvWnext = uvW + 1;
  var uvHnext = uvH + 1;

  var uvWfract = w * uv.x - uvW;
  var uvHfract = h * (1 - uv.y) - uvH;

  var d0 = context.getImageData(uvW, uvH, 1, 1).data[0] / 255.0;
  var d1 = context.getImageData(uvWnext, uvH, 1, 1).data[0] / 255.0;
  var d01 = d0 + (d1 - d0) * uvWfract;

  var d2 = context.getImageData(uvW, uvHnext, 1, 1).data[0] / 255.0;
  var d3 = context.getImageData(uvWnext, uvHnext, 1, 1).data[0] / 255.0;
  var d23 = d2 + (d3 - d2) * uvWfract;

  var d = d01 + (d23 - d01) * uvHfract;

  var direct = context.getImageData(uvW, uvH, 1, 1).data[0] / 255.0;

  return direct;
}

export const getTerrainY = (
  image,
  scale,
  mapWidth,
  mapHeight,
  offset = 0.1
) => (x, y) => {
  const px = Math.floor(((x + mapWidth / 2) / mapWidth) * image.width);
  const py = Math.floor(((y + mapHeight / 2) / mapHeight) * image.height);

  const p = (py * image.width + px) * 4;

  return (image.data[p] / 255) * scale + offset;
};
