export default class MouseCursor {
  constructor(arrowIcons, hoverIcons, dragIcons) {
    this.arrowIcons = arrowIcons;
    this.arrowIconsIndex = 0;
    this.hoverIcons = hoverIcons;
    this.hoverIconsIndex = 0;
    this.dragIcons = dragIcons;
    this.dragIconsIndex = 0;

    this._interval = setInterval(() => {
      this.arrowIconsIndex =
        (this.arrowIconsIndex + 1) % this.arrowIcons.length;
      this.hoverIconsIndex =
        (this.hoverIconsIndex + 1) % this.hoverIcons.length;
      this.dragIconsIndex = (this.dragIconsIndex + 1) % this.dragIcons.length;
      this._updateIcon();
    }, 250);

    const style = document.createElement("style");
    document.head.appendChild(style);
    style.appendChild(
      document.createTextNode(`
      ${this.arrowIcons
        .map(
          (icon, i) => `
          .cursor-pointer-${i} {
            cursor: url(${icon}), auto
          }
        `
        )
        .join("\n")}
        
      ${this.hoverIcons
        .map(
          (icon, i) => `
          .cursor-hover-${i} {
            cursor: url(${icon}), auto
          }
        `
        )
        .join("\n")}

      ${this.dragIcons
        .map(
          (icon, i) => `
          .cursor-drag-${i} {
            cursor: url(${icon}), auto
          }
        `
        )
        .join("\n")}
  `)
    );
  }

  _updateIcon() {
    if (this._pointer === this.arrowIcons) {
      const remove =
        this.arrowIconsIndex - 1 < 0
          ? this.arrowIcons.length - 1
          : this.arrowIconsIndex - 1;

      if (
        !window.document.body.classList.contains(`cursor-pointer-${remove}`)
      ) {
        window.document.body.classList.add(
          `cursor-pointer-${this.arrowIconsIndex}`
        );
      } else {
        window.document.body.classList.replace(
          `cursor-pointer-${remove}`,
          `cursor-pointer-${this.arrowIconsIndex}`
        );
      }

      // window.document.body.style.cursor = `url(${
      //   this.arrowIcons[this.arrowIconsIndex]
      // }), auto`;
    } else if (this._pointer === this.hoverIcons) {
      window.document.body.style.cursor = `url(${
        this.hoverIcons[this.hoverIconsIndex]
      }) ${this.hoverIcons.offX} ${this.hoverIcons.offY}, auto`;
    } else if (this._pointer === this.dragIcons) {
      window.document.body.style.cursor = `url(${
        this.dragIcons[this.dragIconsIndex]
      }) ${this.dragIcons.offX} ${this.dragIcons.offY}, auto`;
    }
  }
  pointer() {
    this._pointer = this.arrowIcons;
  }

  hover() {
    this._pointer = this.hoverIcons;
  }

  drag() {
    this._pointer = this.dragIcons;
  }

  dispose() {
    clearInterval(this._interval);
    window.document.body.style.cursor = "default";
  }
}
