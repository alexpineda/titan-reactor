import { Vector3 } from "three";

export class Minimap {
  constructor(element, mapWidth, mapHeight, updateGlobalCamera) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    this.dragging = false;
    this.element = element;
    this.updateGlobalCamera = updateGlobalCamera;
    this.enableDragging(true);
    this._attach();
  }

  enableDragging(enable) {
    this.enableDragging = enable;
  }

  _attach() {
    this.element.addEventListener("mousedown", (e) => {
      if (!this.enableDragging) return;
      const x = e.offsetX * (this.mapWidth / this.width) - this.mapWidth / 2;
      const y = e.offsetY * (this.mapHeight / this.height) - this.mapHeight / 2;
      this.updateGlobalCamera(new Vector3(x, 0, y));
      this.dragging = true;
    });

    this.element.addEventListener("mouseup", (e) => {
      this.dragging = false;
    });

    this.element.addEventListener("mousemove", (e) => {
      if (!this.enableDragging) return;
      if (this.dragging) {
        const x = e.offsetX * (this.mapWidth / this.width) - this.mapWidth / 2;
        const y =
          e.offsetY * (this.mapHeight / this.height) - this.mapHeight / 2;
        this.updateGlobalCamera(new Vector3(x, 0, y));
      }
    });
  }

  setMapDimensions(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  dispose() {
    this.element.removeEventListener("mousedown");
    this.element.removeEventListener("mouseup");
    this.element.removeEventListener("mousemove");
    this.element = null;
  }
}
