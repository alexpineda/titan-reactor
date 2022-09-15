import gameStore from "../stores/game-store";

type Icons = string[];

export class MouseCursor {
  #lastClass = "";

  #element: HTMLElement;
  #arrowIcons: Icons;
  #pointerNone: Icons = [];
  #pointer: Icons;
  #arrowIconsIndex = 0;

  constructor(element: HTMLElement) {
    this.#element = element;

    const icons = gameStore().assets!;

    this.#arrowIcons = icons.arrowIcons;
    this.#pointer = this.#arrowIcons;

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
            
          .cursor-none-0 {
            cursor: none;
          }
      `)
    );
    this.pointer();
  }

  #css(index: number, type: "pointer") {
    if (!this.#element.classList.contains(this.#lastClass)) {
      this.#element.classList.add(`cursor-${type}-${index}`);
    } else {
      this.#element.classList.replace(
        this.#lastClass,
        `cursor-${type}-${index}`
      );
    }
    this.#lastClass = `cursor-${type}-${index}`;
  }

  #update() {
    if (this.#pointer === this.#arrowIcons) {
      this.#css(this.#arrowIconsIndex, "pointer");
    }
  }

  pointer() {
    this.#pointer = this.#arrowIcons;
    this.#update();
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
    this.#element.style.cursor = "";
    window.document.getElementById("cursor-styles")?.remove();
  }
}