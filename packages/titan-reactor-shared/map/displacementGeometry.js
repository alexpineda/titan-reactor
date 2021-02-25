import * as THREE from "three";

export const createDisplacementGeometry = (
  existingGeom,
  width,
  height,
  widthSegments,
  heightSegments,
  canvas,
  displacementScale = 2,
  displacementBias = 1
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

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    uv.fromBufferAttribute(uvs, i);
    n.fromBufferAttribute(nor, i);

    var displacement = getDisplacement(image, uv);

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

function getDisplacement(image, uv) {
  var w = image.width - 1;
  var h = image.height - 1;

  var uvW = Math.floor(w * uv.x);
  var uvH = Math.floor(h * (1 - uv.y));
  var uvWnext = uv.x === 1.0 ? uvW : uvW + 1;
  var uvHnext = uv.y === 0.0 ? uvH : uvH + 1;

  var uvWfract = w * uv.x - uvW;
  var uvHfract = h * (1 - uv.y) - uvH;

  var d0 = image.data[uvH * image.width + uvW] / 255.0;
  var d1 = image.data[uvH * image.width + uvWnext] / 255.0;
  var d01 = d0 + (d1 - d0) * uvWfract;

  var d2 = image.data[uvHnext * image.width + uvW] / 255.0;
  var d3 = image.data[uvHnext * image.width + uvWnext] / 255.0;
  var d23 = d2 + (d3 - d2) * uvWfract;

  var d = d01 + (d23 - d01) * uvHfract;

  return d;
}

export const getTerrainY = (
  image,
  scale,
  mapWidth,
  mapHeight,
  offset = 0.1
) => {
  const imageF = new Float32Array(image.data.length);
  for (let i = 0; i < image.data.length; i++) {
    imageF[i] = (image.data[i] / 255) * scale;
  }

  const pxScale = image.width / mapWidth;
  const pyScale = image.height / mapHeight;

  return (x, y) => {
    if (
      x < -mapWidth / 2 ||
      x > mapWidth / 2 ||
      y < -mapWidth / 2 ||
      y > mapWidth / 2
    ) {
      return 0;
    }
    const px = Math.floor((x + mapWidth / 2) * pxScale);
    const py = Math.floor((y + mapHeight / 2) * pyScale);

    const p = (py * image.width + px) * 4;

    return imageF[p] + offset;
  };
};
