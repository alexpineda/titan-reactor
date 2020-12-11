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
import {
  MinimapFogLayer,
  MinimapLayer,
  MinimapPingLayer,
  MinimapUnitLayer,
} from "../camera/Layers";

export class Minimap extends EventDispatcher {
  constructor(surface, terrainMap, mapWidth, mapHeight) {
    super();
    this.surface = surface;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this._dragging = false;
    this.updateMouseHover = true;
    this.viewport = new Vector4();
    this.minimapPlane = this._createMiniMapPlane(terrainMap);
    this.camera = this._initMinimapCamera();

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
    camera.layers.disableAll();
    camera.layers.enable(MinimapLayer);
    camera.layers.enable(MinimapUnitLayer);
    camera.layers.enable(MinimapPingLayer);
    camera.layers.enable(MinimapFogLayer);

    return camera;
  }

  _attach() {
    this.surface.canvas.addEventListener("mousedown", (e) => {
      if (!this.enableDragging) return;
      const x =
        e.offsetX * (this.mapWidth / this.surface.getWidth()) -
        this.mapWidth / 2;
      const y =
        e.offsetY * (this.mapHeight / this.surface.getHeight()) -
        this.mapHeight / 2;
      this.dispatchEvent({ type: "start", message: new Vector3(x, 0, y) });
      this._dragging = true;
    });

    this.surface.canvas.addEventListener("mouseup", (e) => {
      this._dragging = false;
    });

    this.surface.canvas.addEventListener("mousemove", (e) => {
      if (!this.enableDragging) return;
      const x =
        e.offsetX * (this.mapWidth / this.surface.getWidth()) -
        this.mapWidth / 2;
      const y =
        e.offsetY * (this.mapHeight / this.surface.getHeight()) -
        this.mapHeight / 2;

      const pos = new Vector3(x, 0, y);

      if (this._dragging) {
        this.dispatchEvent({ type: "update", message: pos });
      } else if (this.updateMouseHover) {
        this.dispatchEvent({ type: "hover", message: pos });
      }
    });
  }

  refresh() {
    const mapAspect = Math.max(this.mapWidth, this.mapHeight);

    const minimapWidth =
      (this.surface.getHeight() * this.mapHeight) / mapAspect;
    const minimapHeight = (this.surface.getWidth() * this.mapWidth) / mapAspect;

    const { left, bottom } = this.surface.canvas.getBoundingClientRect();

    this.viewport = new Vector4(
      (this.surface.getWidth() - minimapWidth) / 2 + left,
      (this.surface.getHeight() - minimapHeight) / 2 +
        (window.innerHeight - bottom),
      minimapWidth,
      minimapHeight
    );
  }

  dispose() {
    this.surface.canvas.removeEventListener("mousedown");
    this.surface.canvas.removeEventListener("mouseup");
    this.surface.canvas.removeEventListener("mousemove");
  }
}

export const createMinimapPoint = (color, w, h) => {
  const geometry = new PlaneBufferGeometry(w, h);
  const material = new MeshBasicMaterial({ color });
  const plane = new Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.layers.set(MinimapUnitLayer);
  Object.assign(plane, {
    updateMatrix: function () {
      this.matrix.compose(this.position, this.quaternion, this.scale);

      this.matrixWorldNeedsUpdate = true;
    },

    updateMatrixWorld: function (force) {
      if (this.matrixAutoUpdate) this.updateMatrix();

      if (this.matrixWorldNeedsUpdate || force) {
        if (this.parent === null) {
          this.matrixWorld.copy(this.matrix);
        } else {
          this.matrixWorld.multiplyMatrices(
            this.parent.matrixWorld,
            this.matrix
          );
        }

        this.matrixWorldNeedsUpdate = false;

        force = true;
      }

      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        children[i].updateMatrixWorld(force);
      }
    },
  });
  return plane;
};
