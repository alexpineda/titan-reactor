import {
  EventDispatcher,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Vector3,
} from "three";
import { MinimapLayer, MinimapUnitLayer } from "./Layers";
import InputEvents from "../input/InputEvents";

class MinimapControl extends EventDispatcher {
  constructor(surface, mapWidth, mapHeight, keyboardShortcuts) {
    super();
    this.surface = surface;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this._dragging = false;

    this.enableDragging(true);
    this._attach();
  }

  enableDragging(enable) {
    this._enableDragging = enable;
  }

  setConstraints(settings) {
    this.constraints = {
      distances: [20, 50, 100],
      polarAngle: [Math.PI / 6, Math.PI / 4, Math.PI / 2],
      azimuthAngle: [Math.PI / 6, Math.PI / 4, Math.PI / 2],
    };
  }

  _attach() {
    this.surface.canvas.addEventListener("mousedown", (e) => {
      if (!this._enableDragging) return;
      const x =
        e.offsetX * (this.mapWidth / this.surface.getWidth()) -
        this.mapWidth / 2;
      const y =
        e.offsetY * (this.mapHeight / this.surface.getHeight()) -
        this.mapHeight / 2;

      const pos = new Vector3(x, 0, y);

      const isCut = e.button === 2;
      this.dispatchEvent({ type: "start", message: { pos, cut: isCut } });

      if (!isCut) {
        this._dragging = true;
      }
    });

    this.surface.canvas.addEventListener("mouseup", (e) => {
      this._dragging = false;
    });

    this.surface.canvas.addEventListener("mousemove", (e) => {
      const x =
        e.offsetX * (this.mapWidth / this.surface.getWidth()) -
        this.mapWidth / 2;
      const y =
        e.offsetY * (this.mapHeight / this.surface.getHeight()) -
        this.mapHeight / 2;

      const pos = new Vector3(x, 0, y);

      if (this._dragging) {
        this.dispatchEvent({ type: "update", message: { pos } });
      } else {
        this.dispatchEvent({
          type: "hover",
          message: { pos, preview: e.shiftKey },
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
