import { EventDispatcher, Vector3, MathUtils } from "three";

const LeftMouse = 0;
const MiddleMouse = 1;
const RightMouse = 2;

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

      if (e.button === LeftMouse || e.button === RightMouse) {
        this.dispatchEvent({
          type: "start",
          message: { pos, rightMouse: e.button === RightMouse, e },
        });
      }

      if (e.button === RightMouse) {
        this._isDragging = true;
      }
    });

    this.surface.canvas.addEventListener("mouseup", (e) => {
      this._isDragging = false;
    });

    this.surface.canvas.addEventListener("mousemove", (e) => {
      if (e.button === MiddleMouse) return;

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

    this.surface.canvas.addEventListener("mouseenter", (e) => {
      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      const pos = new Vector3(x, 0, y);

      this.dispatchEvent({
        type: "enter",
        message: { pos, e },
      });
    });

    this.surface.canvas.addEventListener("mouseleave", (e) => {
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
    this.surface.canvas.removeEventListener("mouseenter");
    this.surface.canvas.removeEventListener("mouseleave");
  }
}

export default MinimapControl;
