export default class MouseCursor {
  constructor(arrowIcons, hoverIcons) {
    this.arrowIcons = arrowIcons;
    this.arrowIconsIndex = 0;
    this.hoverIcons = hoverIcons;
    this.hoverIconsIndex = 0;
    this._interval = setInterval(() => {
      this.arrowIconsIndex =
        (this.arrowIconsIndex + 1) % this.arrowIcons.length;
      this.hoverIconsIndex =
        (this.hoverIconsIndex + 1) % this.hoverIcons.length;
      this._updateIcon();
    }, 100);
  }

  _updateIcon() {
    if (this._pointer === this.arrowIcons) {
      window.document.body.style.cursor = `url(${
        this.arrowIcons[this.arrowIconsIndex]
      }), auto`;
    } else if (this._pointer === this.hoverIcons) {
      window.document.body.style.cursor = `url(${
        this.hoverIcons[this.hoverIconsIndex]
      }), auto`;
    }
  }
  pointer() {
    this._pointer = this.arrowIcons;
  }

  hover() {
    this._pointer = this.hoverIcons;
  }

  dispose() {
    clearInterval(this._interval);
    window.document.body.style.cursor = "default";
  }
}
