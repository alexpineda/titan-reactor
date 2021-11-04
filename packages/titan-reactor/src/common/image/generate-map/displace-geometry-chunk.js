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
  var uvWnext = uvW;
  var uvHnext = uvH;

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

  var direct = context.getImageData(uvW, uvH, 1, 1).data[0] / 255.0;
  var next = context.getImageData(uvWnext, uvHnext, 1, 1).data[0] / 255.0;

  return (direct + next) / 2;
}
