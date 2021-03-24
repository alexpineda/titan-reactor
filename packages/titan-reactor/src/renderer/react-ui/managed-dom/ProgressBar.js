export default class ProgressBar {
  constructor() {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("relative", "mt-3");
    this.domElement.style.height = "0.875rem";
    this.domElement.style.width = "128px";

    this.hpBar = document.createElement("div");
    this.hpBar.classList.add(
      "rounded-lg",
      "border-2",
      "hp-bar",
      "absolute",
      "top-0",
      "left-0",
      "right-0",
      "bottom-0"
    );
    this.hpBar.style.borderColor = "#00ee00";
    this.hpBar.style.backgroundImage =
      "linear-gradient(to right, #000000, #000000 2px, #00ee00 2px, #00ee00 )";
    this.hpBar.style.backgroundSize = "7px 100%";
    this.domElement.appendChild(this.hpBar);

    this.blackBorder = document.createElement("div");
    this.blackBorder.classList.add(
      "border-2",
      "rounded",
      "border-black",
      "absolute",
      "z-10"
    );
    this.blackBorder.style.left = "2px";
    this.blackBorder.style.top = "2px";
    this.blackBorder.style.right = "2px";
    this.blackBorder.style.bottom = "2px";
    this.domElement.appendChild(this.blackBorder);

    this.blackProgress = document.createElement("div");
    this.blackProgress.classList.add("rounded", "bg-black", "absolute", "z-20");
    this.blackProgress.style.left = "2px";
    this.blackProgress.style.top = "2px";
    this.blackProgress.style.right = "2px";
    this.blackProgress.style.bottom = "2px";
    this.domElement.appendChild(this.blackProgress);

    this._value = 0;
  }

  set value(val) {
    if (val < 0 || val > 1) {
      throw new Error("value must be 0-1");
    }
    this.blackProgress.style.left = `${Math.floor(
      this.domElement.offsetWidth * (1 - val) + 2
    )}px`;
    if (val > 0) {
      this.domElement.style.visibility = "visible";
    }
    this._value = val;
  }

  get value() {
    return this._value;
  }

  hide() {
    this.domElement.style.visibility = "hidden";
  }
}
