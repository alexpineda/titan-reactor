import gameStore from "../stores/game-store";

type Icons = string[];

export class MouseCursor {
  #lastClass = "";

  #arrowIcons: Icons;
  #dragIcons: Icons;
  #hoverIcons: Icons;
  #pointerNone: Icons = [];
  #pointer: Icons;
  #arrowIconsIndex = 0;
  #hoverIconsIndex = 0;
  #dragIconsIndex = 0;
  #interval: NodeJS.Timeout | undefined;

  constructor() {
    const icons = gameStore().assets!;

    this.#arrowIcons = icons.arrowIcons;
    this.#hoverIcons = icons.hoverIcons.icons;
    this.#dragIcons = icons.dragIcons.icons;

    this.#pointer = this.#arrowIcons;

    this.#interval = setInterval(() => {
      this.#arrowIconsIndex =
        (this.#arrowIconsIndex + 1) % this.#arrowIcons.length;
      this.#hoverIconsIndex =
        (this.#hoverIconsIndex + 1) % this.#hoverIcons.length;
      this.#dragIconsIndex = (this.#dragIconsIndex + 1) % this.#dragIcons.length;
      if (this.#pointer === this.#hoverIcons) {
        this._updateIcon();
      }
    }, 50);

    const style = document.createElement("style");
    style.id = "cursor-styles";
    document.head.appendChild(style);
    style.appendChild(
      document.createTextNode(`
          ${this.#arrowIcons
          .map(
            (icon, i: number) => `
              .cursor-pointer-${i} {
                cursor: url(${icon}), auto
              }
            `
          )
          .join("\n")}
            
          ${this.#hoverIcons
          .map(
            (icon, i: number) => `
              .cursor-hover-${i} {
                cursor: url(${icon}), auto
              }
            `
          )
          .join("\n")}
    
          ${this.#dragIcons
          .map(
            (icon, i: number) => `
              .cursor-drag-${i} {
                cursor: url(${icon}), auto
              }
            `
          )
          .join("\n")}

          .cursor-none-0 {
            cursor: none;
          }
      `)
    );
    this.pointer();
  }

  _updateClasses(index: number, type: "pointer" | "hover" | "drag" | "none") {
    if (!window.document.body.classList.contains(this.#lastClass)) {
      window.document.body.classList.add(`cursor-${type}-${index}`);
    } else {
      window.document.body.classList.replace(
        this.#lastClass,
        `cursor-${type}-${index}`
      );
    }
    this.#lastClass = `cursor-${type}-${index}`;
  }

  _updateIcon() {
    if (this.#pointer === this.#arrowIcons) {
      this._updateClasses(this.#arrowIconsIndex, "pointer");
    } else if (this.#pointer === this.#hoverIcons) {
      this._updateClasses(this.#hoverIconsIndex, "hover");
    } else if (this.#pointer === this.#dragIcons) {
      this._updateClasses(this.#dragIconsIndex, "drag");
    } else {
      this._updateClasses(0, "none");
    }
  }

  pointer() {
    this.#pointer = this.#arrowIcons;
    this._updateIcon();
  }

  hover() {
    this.#pointer = this.#hoverIcons;
  }

  drag() {
    this.#pointer = this.#dragIcons;
  }

  hide() {
    this.#pointer = this.#pointerNone;
  }

  get enabled() {
    return this.#pointer !== this.#pointerNone;
  }

  set enabled(value: boolean) {
    if (value) {
      this.pointer();
    } else {
      this.hide();
    }
  }

  dispose() {
    window.document.body.style.cursor = "";
    window.document.getElementById("cursor-styles")?.remove();
    clearInterval(this.#interval!);
  }
}