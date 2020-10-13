import {
  BufferGeometry,
  Camera,
  Color,
  Euler,
  EventDispatcher,
  Float32BufferAttribute,
  Line3,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Plane,
  PlaneBufferGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
  Vector4,
} from "three";
import { Heatmap } from "../mesh/Heatmap";
import { MinimapLayer } from "./Layers";

export class Minimap extends EventDispatcher {
  constructor(domElement, terrainMap, mapWidth, mapHeight, heatMapScore) {
    super();
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.width = 0;
    this.height = 0;
    this._dragging = false;
    this.updateMouseHover = true;
    this.domElement = domElement;
    this.viewport = new Vector4();
    this.minimapPlane = this._createMiniMapPlane(terrainMap);
    this.heatmapEnabled = false;
    this.heatmap = new Heatmap(mapWidth, mapHeight, heatMapScore);
    this.heatmap.layers.set(MinimapLayer);
    this.heatmap.visible = false;
    this.camera = this._initMinimapCamera();

    this._resizeObserver = new ResizeObserver(() => {
      this.refresh();
    });
    this._resizeObserver.observe(domElement);

    this.refresh();
    this.enableDragging(true);
    this._attach();
  }

  enableDragging(enable) {
    this.enableDragging = enable;
  }

  _createMiniMapPlane(map) {
    const geo = new PlaneBufferGeometry(
      this.mapWidth,
      this.mapHeight,
      Math.floor(this.mapWidth / 32),
      Math.floor(this.mapHeight / 32)
    );
    const mat = new MeshBasicMaterial({
      color: 0xffffff,
      map,
    });
    var mesh = new Mesh(geo, mat);
    mesh.rotateX(-0.5 * Math.PI);
    mesh.layers.set(MinimapLayer);
    return mesh;
  }

  toggleHeatmap() {
    this.heatmapEnabled = !this.heatmapEnabled;
    this.heatmap.visible = this.heatmapEnabled;
    this.minimapPlane.visible = !this.heatmapEnabled;
    if (this.heatmapEnabled) {
      this.dispatchEvent({ type: "heatmap-enabled" });
    }
  }

  _initMinimapCamera() {
    const camera = new OrthographicCamera(
      -this.mapWidth / 2,
      this.mapWidth / 2,
      this.mapHeight / 2,
      -this.mapHeight / 2,
      0.1,
      10000
    );
    camera.position.set(0, 128, 0);
    camera.lookAt(new Vector3());
    camera.layers.set(MinimapLayer);

    return camera;
  }

  _attach() {
    this.domElement.addEventListener("mousedown", (e) => {
      if (!this.enableDragging) return;
      const x = e.offsetX * (this.mapWidth / this.width) - this.mapWidth / 2;
      const y = e.offsetY * (this.mapHeight / this.height) - this.mapHeight / 2;
      this.dispatchEvent({ type: "start", message: new Vector3(x, 0, y) });
      this._dragging = true;
    });

    this.domElement.addEventListener("mouseup", (e) => {
      this._dragging = false;
    });

    this.domElement.addEventListener("mousemove", (e) => {
      if (!this.enableDragging) return;
      const x = e.offsetX * (this.mapWidth / this.width) - this.mapWidth / 2;
      const y = e.offsetY * (this.mapHeight / this.height) - this.mapHeight / 2;

      const pos = new Vector3(x, 0, y);

      if (this._dragging) {
        this.dispatchEvent({ type: "update", message: pos });
      } else if (this.updateMouseHover) {
        this.dispatchEvent({ type: "hover", message: pos });
      }
    });
  }

  refresh() {
    this.width = this.domElement.offsetWidth;
    this.height = this.domElement.offsetHeight;
    const mapAspect = Math.max(this.mapWidth, this.mapHeight);

    const minimapWidth = (this.height * this.mapHeight) / mapAspect;
    const minimapHeight = (this.width * this.mapWidth) / mapAspect;

    const { left, bottom } = this.domElement.getBoundingClientRect();

    this.viewport = new Vector4(
      (this.width - minimapWidth) / 2 + left,
      (this.height - minimapHeight) / 2 + (window.innerHeight - bottom),
      minimapWidth,
      minimapHeight
    );
  }

  dispose() {
    this._resizeObserver.disconnect();
    this.domElement.removeEventListener("mousedown");
    this.domElement.removeEventListener("mouseup");
    this.domElement.removeEventListener("mousemove");
    this.domElement = null;
  }
}

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new Camera();

// based on https://threejs.org/docs/index.html#api/en/helpers/CameraHelper
export class MinimapCameraHelper extends LineSegments {
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

export const createMinimapPoint = (color, w, h) => {
  const geometry = new PlaneBufferGeometry(w, h);
  const material = new MeshBasicMaterial({ color });
  const plane = new Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.layers.set(MinimapLayer);
  // plane.updateMatrixWorld = function () {
  //   this.position.copy(this.parent.position);
  //   this.scale.copy(this.parent.scale);
  // };
  return plane;
};
