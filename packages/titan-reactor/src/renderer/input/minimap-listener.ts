import { MathUtils, Vector3 } from "three";
import { CanvasTarget } from "../../common/image";
import Janitor from "../utils/janitor";

const LeftMouse = 0;

export interface MinimapEvent {
  e: MouseEvent;
  pos: Vector3;
}
// manages and dispatches minimap drag and click events
export class MinimapEventListener {
  mapWidth: number;
  mapHeight: number;
  surface: CanvasTarget;
  _isDragging = false;
  _isPreviewing = false;
  mouseHoldDelay = 200;

  enabled = true;
  _mouseHoldTicks = 0;
  _lastInterval: NodeJS.Timer | null = null;

  onStart?: () => void;
  onStop?: () => void;
  onEnter?: (e: MinimapEvent) => void;
  onHover?: (e: MinimapEvent) => void;
  onMove?: (e: MinimapEvent) => void;

  private janitor: Janitor;


  constructor(surface: CanvasTarget, mapWidth: number, mapHeight: number) {
    this.surface = surface;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.janitor = new Janitor();
    this._attach();
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

    const _md = (e: MouseEvent) => {
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
        this.onStart && this.onStart();

        if (e.button === LeftMouse) {
          this._isDragging = true;
        }
      }, this.mouseHoldDelay);
    };
    this.surface.canvas.addEventListener("mousedown", _md);
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mousedown", _md));

    const _mu = (e: MouseEvent) => {
      if (!this.enabled || e.button !== LeftMouse) return;

      if (this._lastInterval) {
        clearInterval(this._lastInterval);
      }
      this._lastInterval = null;

      this._isDragging = false;
      if (this._mouseHoldTicks === 0) {
        this.onStart && this.onStart();
      }
    };
    this.surface.canvas.addEventListener("mouseup", _mu);
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mouseup", _mu));

    const _mm = (e: MouseEvent) => {
      if (!this.enabled || e.button !== LeftMouse) return;

      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      const pos = new Vector3(x, 0, y);

      if (this._isDragging) {
        this.onMove && this.onMove({ e, pos });
      } else {
        this.onHover && this.onHover({ e, pos });
      }
    }
    this.surface.canvas.addEventListener("mousemove", _mm
    );
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mousemove", _mm));

    const _me = (e: MouseEvent) => { this.onEnter && this.onEnter({ e, pos: new Vector3() }); };
    this.surface.canvas.addEventListener("mouseenter", _me);
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mouseenter", _me));

    const _ml = (e: MouseEvent) => {
      this.onStop && this.onStop();
    }
    this.surface.canvas.addEventListener("mouseleave", _ml);
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mouseleave", _ml));
  }

  dispose() {
    this.janitor.mopUp();
  }
}

export default MinimapEventListener;
