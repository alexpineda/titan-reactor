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
    this.mouseHoldDelay = 200;

    this.enabled = true;
    this._attach();
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

    this._mouseHoldTicks = 0;
    this._lastInterval = null;

    const _start = (e, pos, speed) => {
      this.dispatchEvent({
        type: "start",
        message: { pos, speed, e },
      });
    };

    this.surface.canvas.addEventListener("mousedown", (e) => {
      if (!this.enabled || e.button !== LeftMouse) return;

      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      const pos = new Vector3(x, 0, y);

      if (this._lastInterval) {
        return;
      }
      clearInterval(this._lastInterval);
      this._mouseHoldTicks = 0;

      // only if we're not double clicking
      this._lastInterval = setInterval(() => {
        this._mouseHoldTicks++;

        clearInterval(this._lastInterval);

        _start(e, pos, e.shiftKey ? 0 : 1);

        if (e.button === LeftMouse) {
          this._isDragging = true;
        }
      }, this.mouseHoldDelay);
    });

    this.surface.canvas.addEventListener("mouseup", (e) => {
      if (!this.enabled || e.button !== LeftMouse) return;

      clearInterval(this._lastInterval);
      this._lastInterval = null;

      this._isDragging = false;
      if (this._mouseHoldTicks === 0) {
        const x = getX(e.offsetX);
        const y = getY(e.offsetY);

        const pos = new Vector3(x, 0, y);
        _start(e, pos, 2);
      }
    });

    this.surface.canvas.addEventListener("mousemove", (e) => {
      if (!this.enabled || e.button !== LeftMouse) return;

      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      const pos = new Vector3(x, 0, y);

      if (this._isDragging) {
        this.dispatchEvent({
          type: "update",
          message: { pos, e },
        });
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
