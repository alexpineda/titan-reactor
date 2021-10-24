import { EventDispatcher, MathUtils, Vector3 } from "three";

import CanvasTarget from "../../common/image/CanvasTarget";

const LeftMouse = 0;


// manages and dispatches minimap drag and click events
class MinimapControl extends EventDispatcher {
  mapWidth: number;
  mapHeight: number;
  surface: CanvasTarget;
  _isDragging = false;
  _isPreviewing = false;
  mouseHoldDelay = 200;

  enabled = true;
  _listeners: [keyof WindowEventMap, (this: Window, ev: MouseEvent) => any][] = [];

  _mouseHoldTicks = 0;
  _lastInterval: NodeJS.Timer | null = null;

  constructor(surface: CanvasTarget, mapWidth: number, mapHeight: number) {
    super();
    this.surface = surface;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this._attach();
  }

  register<K extends keyof WindowEventMap>(event: K, listener: (this: Window, evt: MouseEvent) => any) : [string, EventListener] {
    this._listeners.push([event, listener]);
    return [event, listener as EventListener];
  }

  _attach() {
    const max = Math.max(this.mapWidth, this.mapHeight);
    const wAspect = this.mapWidth / max;
    const hAspect = this.mapHeight / max;

    const getX = (mouseX: number) =>
      MathUtils.clamp(
        (mouseX - this.surface.width / 2) / this.surface.width / wAspect,
        -0.5,
        0.5
      ) * this.mapWidth;

    const getY = (mouseY: number) =>
      MathUtils.clamp(
        (mouseY - this.surface.height / 2) / this.surface.height / hAspect,
        -0.5,
        0.5
      ) * this.mapHeight;

    const _start = (e: MouseEvent, pos: Vector3, speed: number) => {
      this.dispatchEvent({
        type: "start",
        message: { pos, speed, e },
      });
    };

    this.surface.canvas.addEventListener(
      ...this.register("mousedown", (e: MouseEvent) => {
        if (!this.enabled || e.button !== LeftMouse) return;

        const x = getX(e.offsetX);
        const y = getY(e.offsetY);

        const pos = new Vector3(x, 0, y);

        if (this._lastInterval) {
          return;
        }
        this._mouseHoldTicks = 0;

        // only if we're not double clicking
        this._lastInterval = setInterval(() => {
          this._mouseHoldTicks++;

          if (this._lastInterval) {
            clearInterval(this._lastInterval);
          }
          _start(e, pos, 1);

          if (e.button === LeftMouse) {
            this._isDragging = true;
          }
        }, this.mouseHoldDelay);
      })
    );

    this.surface.canvas.addEventListener(
      ...this.register("mouseup", (e: MouseEvent) => {
        if (!this.enabled || e.button !== LeftMouse) return;

        if (this._lastInterval) {
          clearInterval(this._lastInterval);
        }
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
      ...this.register("mousemove", (e: MouseEvent) => {
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
      ...this.register("mouseenter", (evt: MouseEvent) => {
        const x = getX(evt.offsetX);
        const y = getY(evt.offsetY);

        const pos = new Vector3(x, 0, y);

        this.dispatchEvent({
          type: "enter",
          message: { pos, e: evt },
        });
      })
    );

    this.surface.canvas.addEventListener(
      ...this.register("mouseleave", (e: MouseEvent) => {
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
