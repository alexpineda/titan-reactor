import { EventDispatcher, Vector3, MathUtils } from "three";

const LeftMouse = 0;

// manages and dispatches minimap drag and click events
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
    this._listeners = [];
    this._attach();
  }

  register(event, listener) {
    this._listeners.push([event, listener]);
    return [event, listener];
  }

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

    this.surface.canvas.addEventListener(
      ...this.register("mousedown", (e) => {
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
      })
    );

    this.surface.canvas.addEventListener(
      ...this.register("mouseup", (e) => {
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
      })
    );

    this.surface.canvas.addEventListener(
      ...this.register("mousemove", (e) => {
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
      })
    );

    this.surface.canvas.addEventListener(
      ...this.register("mouseenter", (e) => {
        const x = getX(e.offsetX);
        const y = getY(e.offsetY);

        const pos = new Vector3(x, 0, y);

        this.dispatchEvent({
          type: "enter",
          message: { pos, e },
        });
      })
    );

    this.surface.canvas.addEventListener(
      ...this.register("mouseleave", (e) => {
        this.dispatchEvent({
          type: "stop",
          e,
        });
      })
    );
  }

  dispose() {
    this._listeners.forEach((l) =>
      this.surface.canvas.removeEventListener(...l)
    );
  }
}

export default MinimapControl;
