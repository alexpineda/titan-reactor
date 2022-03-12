import gameStore from "../stores/game-store";
import { strict as assert } from "assert";

type Icons = string[];

export class MouseCursor {
  private _lastClass = "";

  private arrowIcons: Icons;
  private dragIcons: Icons;
  private hoverIcons: Icons;
  private _pointer: Icons;
  private arrowIconsIndex = 0;
  private hoverIconsIndex = 0;
  private dragIconsIndex = 0;

  constructor() {
    const icons = gameStore().assets;
    assert(icons);

    this.arrowIcons = icons.arrowIcons;
    this.hoverIcons = icons.hoverIcons.icons;
    this.dragIcons = icons.dragIcons.icons;

    this._pointer = this.arrowIcons;

    // this._interval = setInterval(() => {
    //   this.arrowIconsIndex =
    //     (this.arrowIconsIndex + 1) % this.arrowIcons.length;
    //   this.hoverIconsIndex =
    //     (this.hoverIconsIndex + 1) % this.hoverIcons.length;
    //   this.dragIconsIndex = (this.dragIconsIndex + 1) % this.dragIcons.length;
    //   this._updateIcon();
    // }, 250);

    const style = document.createElement("style");
    style.id = "cursor-styles";
    document.head.appendChild(style);
    style.appendChild(
      document.createTextNode(`
          ${this.arrowIcons
          .map(
            (icon, i: number) => `
              .cursor-pointer-${i} {
                cursor: url(${icon}), auto
              }
            `
          )
          .join("\n")}
            
          ${this.hoverIcons
          .map(
            (icon, i: number) => `
              .cursor-hover-${i} {
                cursor: url(${icon}), auto
              }
            `
          )
          .join("\n")}
    
          ${this.dragIcons
          .map(
            (icon, i: number) => `
              .cursor-drag-${i} {
                cursor: url(${icon}), auto
              }
            `
          )
          .join("\n")}
      `)
    );
  }

  _updateClasses(index: number, type = "pointer") {
    if (!window.document.body.classList.contains(this._lastClass)) {
      window.document.body.classList.add(`cursor-${type}-${index}`);
    } else {
      window.document.body.classList.replace(
        this._lastClass,
        `cursor-${type}-${index}`
      );
    }
    this._lastClass = `cursor-${type}-${index}`;
  }

  _updateIcon() {
    if (this._pointer === this.arrowIcons) {
      this._updateClasses(this.arrowIconsIndex, "pointer");
    } else if (this._pointer === this.hoverIcons) {
      this._updateClasses(this.hoverIconsIndex, "hover");
    } else if (this._pointer === this.dragIcons) {
      this._updateClasses(this.dragIconsIndex, "drag");
    }
  }

  pointer() {
    this._pointer = this.arrowIcons;
    this._updateIcon();
  }

  hover() {
    this._pointer = this.hoverIcons;
  }

  drag() {
    this._pointer = this.dragIcons;
  }

  dispose() {
    window.document.body.style.cursor = "";
    window.document.getElementById("cursor-styles")?.remove();
    // clearInterval(_hoverInterval);
  }
}