import {
  EventDispatcher,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Vector3,
  MathUtils,
} from "three";
import { MinimapLayer, MinimapUnitLayer } from "./Layers";

class MinimapControl extends EventDispatcher {
  constructor(surface, mapWidth, mapHeight) {
    super();
    this.surface = surface;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this._isDragging = false;
    this._isPreviewing = false;

    this.enableDragging(true);
    this._attach();
  }

  enableDragging(enable) {
    this._enableDragging = enable;
  }

  // @todo modify this to account for map aspect ratio
  _attach() {
    const max = Math.max(this.mapWidth, this.mapHeight);
    const wAspect = this.mapWidth / max;
    const hAspect = this.mapHeight / max;

    const getX = (mouseX) =>
      MathUtils.clamp(
        (mouseX - this.surface.width / 2) / this.surface.width / wAspect,
        -0.5,
        0.5
      ) * this.mapWidth;

    const getY = (mouseY) =>
      MathUtils.clamp(
        (mouseY - this.surface.height / 2) / this.surface.height / hAspect,
        -0.5,
        0.5
      ) * this.mapHeight;

    this.surface.canvas.addEventListener("mousedown", (e) => {
      if (!this._enableDragging) return;
      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      const pos = new Vector3(x, 0, y);

      const rightMouse = e.button === 2;
      this.dispatchEvent({ type: "start", message: { pos, rightMouse, e } });

      if (rightMouse) {
        this._isDragging = true;
      }
    });

    this.surface.canvas.addEventListener("mouseup", (e) => {
      this._isDragging = false;
    });

    this.surface.canvas.addEventListener("mousemove", (e) => {
      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      const pos = new Vector3(x, 0, y);

      if (this._isDragging) {
        this.dispatchEvent({ type: "update", message: { pos, e } });
      } else {
        this.dispatchEvent({
          type: "hover",
          message: { pos, e },
        });
      }
    });

    this.surface.canvas.addEventListener("mouseenter ", (e) => {
      this.mouseInside = true;
    });

    this.surface.canvas.addEventListener("mouseleave ", (e) => {
      this.mouseInside = false;

      this.dispatchEvent({
        type: "stop",
        e,
      });
    });
  }

  dispose() {
    this.surface.canvas.removeEventListener("mousedown");
    this.surface.canvas.removeEventListener("mouseup");
    this.surface.canvas.removeEventListener("mousemove");
  }
}

export const createMiniMapPlane = (map, mapWidth, mapHeight) => {
  const geo = new PlaneBufferGeometry(
    mapWidth,
    mapHeight,
    Math.floor(mapWidth / 32),
    Math.floor(mapHeight / 32)
  );
  const mat = new MeshBasicMaterial({
    color: 0xffffff,
    map,
  });
  var mesh = new Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  mesh.layers.set(MinimapLayer);
  return mesh;
};

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

export default MinimapControl;