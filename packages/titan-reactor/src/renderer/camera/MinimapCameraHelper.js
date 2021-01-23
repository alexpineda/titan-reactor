import {
  BufferGeometry,
  Camera,
  Color,
  Euler,
  Float32BufferAttribute,
  Line3,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new Camera();

// based on https://threejs.org/docs/index.html#api/en/helpers/CameraHelper
class MinimapCameraHelper extends LineSegments {
  constructor(camera, plane) {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      toneMapped: false,
    });

    const vertices = [];
    const colors = [];

    const pointMap = {};

    // colors

    const colorFrustum = new Color(0x999999);
    const colorUp = new Color(0x00aaff);
    const colorTarget = new Color(0x999999);
    const colorCross = new Color(0x333333);
    const colorBox = new Color(0x9400d3);

    const colorNew = new Color(0x000000);
    addLine("b1", "b2", colorBox);
    addLine("b2", "b3", colorBox);
    addLine("b3", "b4", colorBox);
    addLine("b4", "b1", colorBox);

    // near
    addLine("n1", "n2", colorFrustum);
    addLine("n2", "n4", colorFrustum);
    addLine("n4", "n3", colorFrustum);
    addLine("n3", "n1", colorFrustum);

    // far

    addLine("f1", "f2", colorNew);
    addLine("f2", "f4", colorNew);
    addLine("f4", "f3", colorNew);
    addLine("f3", "f1", colorNew);

    // sides

    addLine("n1", "f1", colorFrustum);
    addLine("n2", "f2", colorFrustum);
    addLine("n3", "f3", colorFrustum);
    addLine("n4", "f4", colorFrustum);

    // up

    addLine("u1", "u2", colorUp);
    addLine("u2", "u3", colorUp);
    addLine("u3", "u1", colorUp);

    // target

    addLine("c", "t", colorTarget);
    addLine("p", "c", colorCross);

    function addLine(a, b, color) {
      addPoint(a, color);
      addPoint(b, color);
    }

    function addPoint(id, color) {
      vertices.push(0, 0, 0);
      colors.push(color.r, color.g, color.b);

      if (pointMap[id] === undefined) {
        pointMap[id] = [];
      }

      pointMap[id].push(vertices.length / 3 - 1);
    }

    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    super(geometry, material);

    this.type = "CameraHelper";

    this.camera = camera;
    if (this.camera.updateProjectionMatrix)
      this.camera.updateProjectionMatrix();

    this.matrix = camera.matrixWorld;
    this.matrixAutoUpdate = false;

    this.pointMap = pointMap;

    const mapPlane = new Plane();
    const rotScaleTranslation = new Matrix4();
    const rotation = new Quaternion();
    rotation.setFromEuler(new Euler(0, 0, -0.5 * Math.PI));
    rotScaleTranslation.compose(new Vector3(), rotation, new Vector3(1, 1, 1));
    mapPlane.applyMatrix4(rotScaleTranslation);
    this.mapPlane = mapPlane;
    this.mapLine = new Line3(new Vector3(), new Vector3());
    this.mapIntersect = new Vector3();

    var sgeo = new SphereGeometry(1, 32, 32);
    var smat = new MeshBasicMaterial({ color: 0xffff00 });
    var sphere = new Mesh(sgeo, smat);
    this.mapIndicator = sphere;
    this.mapIndicator.layers.enableAll();

    this.update();
  }

  update() {
    const geometry = this.geometry;
    const pointMap = this.pointMap;

    const w = 1,
      h = 1;

    // we need just camera projection matrix inverse
    // world matrix must be identity

    _camera.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse);

    this.mapLine.start.copy(this.camera.position);
    this.mapLine.end.copy(_vector.set(-w, h, 1).unproject(_camera));
    this.mapPlane.intersectLine(this.mapLine, this.mapIntersect);

    console.log(this.mapLine.start, this.mapLine.end, this.mapIntersect);

    // center / target

    setPoint("c", pointMap, geometry, _camera, 0, 0, -1);
    setPoint("t", pointMap, geometry, _camera, 0, 0, 1);

    // far

    setPoint("f1", pointMap, geometry, _camera, -w, -h, 1); //bl
    setPoint("f2", pointMap, geometry, _camera, w, -h, 1); //br
    setPoint("f3", pointMap, geometry, _camera, -w, h, 1); //tl
    setPoint("f4", pointMap, geometry, _camera, w, h, 1); //tr

    geometry.getAttribute("position").needsUpdate = true;
  }
}

function setPoint(point, pointMap, geometry, camera, x, y, z) {
  _vector.set(x, y, z).unproject(camera);

  const points = pointMap[point];

  if (points !== undefined) {
    const position = geometry.getAttribute("position");

    for (let i = 0, l = points.length; i < l; i++) {
      position.setXYZ(points[i], _vector.x, _vector.y, _vector.z);
    }
  }
}

export default MinimapCameraHelper;
