import { easePolyOut } from "d3-ease";

export default class ProductionElement {
  constructor(icons, color, compact) {
    this.icons = icons;
    this.color = color;
    this.image = document.createElement("img");
    this.image.style.mixBlendMode = "screen";
    this.image.style.filter = "brightness(1.5)";
    this.image.style.borderBottom = "0.25rem solid";
    this.image.style.borderImage = `linear-gradient(90deg, ${color}ee 0%, ${color}aa 0%, rgba(0,0,0,0.5) 0%) 1`;
    if (!compact) {
      this.image.classList.add("mt-1");
    }
    this.count = document.createElement("p");
    this.count.classList.add(
      "text-white",
      "absolute",
      "text-xs",
      "px-1",
      "rounded"
    );

    this.count.style.bottom = "0";
    this.count.style.right = "0";
    this.count.style.opacity = "0.9";
    this.count.style.fontFamily = "conthrax";
    this.count.style.fontWeight = "900";
    this.count.style.textShadow = "-2px -2px 2px black";

    this.domElement = document.createElement("div");
    this.domElement.classList.add("w-10", "mr-1", "relative");
    this.domElement.append(this.image, this.count);
    this.value = null;

    this.poly = easePolyOut.exponent(0.5);
  }

  set value(val) {
    this._value = val;
    if (val) {
      this.domElement.classList.remove("hidden");
      if (val.count > 1) {
        this.count.textContent = val.count;
        this.count.classList.remove("hidden");
      } else {
        this.count.classList.add("hidden");
      }
      this.image.src = this.icons[val.icon];

      const pct = this.poly(1 - val.remainingBuildTime / val.buildTime) * 100;
      this.image.style.borderImage = `linear-gradient(90deg, ${this.color}ee 0%, ${this.color}aa ${pct}%, rgba(0,0,0,0.5) ${pct}%) 1`;
      if (val.remainingBuildTime === 0 && (val.isTech || val.isUpgrade)) {
        this.image.style.outline = `3px groove ${this.color}aa`;
        // using a property as state to determine whether to add glow (only once)
        this.image.style.animation = `glow-${val.owner} 0.4s 10 alternate`;
        //react keeps mounting it so we have to terminate the animation after its done
        setTimeout(() => {
          this.image.style.animation = "";
        }, 3000);
      }
    } else {
      this.domElement.classList.add("hidden");
    }
  }

  get value() {
    return this._value;
  }
}
