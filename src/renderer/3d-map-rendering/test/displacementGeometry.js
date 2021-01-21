import * as THREE from "three";

export const createDisplacementGeometry = (
  existingGeom,
  width,
  height,
  widthSegments,
  heightSegments,
  image,
  displacementScale = 2,
  displacementBias = 1
) => {
  const geom =
    existingGeom ||
    new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);

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

    var displacement = getDisplacement(image, width * 32, height * 32, uv);

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

function getDisplacement(image, width, height, uv) {
  var w = width - 1;
  var h = height - 1;

  var uvW = Math.floor(w * uv.x);
  var uvH = Math.floor(h * (1 - uv.y));
  var uvWnext = uv.x === 1.0 ? uvW : uvW + 1;
  var uvHnext = uv.y === 0.0 ? uvH : uvH + 1;
  var uvWfract = w * uv.x - uvW;
  var uvHfract = h * (1 - uv.y) - uvH;

  var d0 = image[Math.floor(uvH / 32) * width * 32 + uvW] / 255.0;
  var d1 = image[Math.floor(uvH / 32) * width * 32 + uvWnext] / 255.0;
  var d01 = d0 + (d1 - d0) * uvWfract;

  var d2 = image[Math.floor(uvHnext / 32) * width * 32 + uvW] / 255.0;
  var d3 = image[Math.floor(uvHnext / 32) * width * 32 + uvWnext] / 255.0;
  var d23 = d2 + (d3 - d2) * uvWfract;

  var d = d01 + (d23 - d01) * uvHfract;

  var direct = image[Math.floor(uvH / 32) * width * 32 + uvW] / 255.0;

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
