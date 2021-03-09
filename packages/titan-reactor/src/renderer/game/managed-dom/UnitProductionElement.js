import { easePolyOut } from "d3-ease";

{
  /* <div key={typeId} className="w-10 relative">
  <img
    alt={typeId}
    src={cmdIcons[typeId]}
    style={{ mixBlendMode: "screen", filter: "brightness(1.5)" }}
  />
  {count > 1 && (
    <p
      className="text-white absolute text-xs px-1 rounded"
      style={{
        bottom: 0,
        right: 0,
        backgroundColor,
        opacity: 0.8,
      }}
    >
      {count}
    </p>
  )}
</div>; */
}

export default class UnitProductionElement {
  constructor(cmdIcons, color) {
    this.cmdIcons = cmdIcons;
    this.color = color;
    this.image = document.createElement("img");
    this.image.style.mixBlendMode = "screen";
    this.image.style.filter = "brightness(1.5)";
    this.image.style.borderBottom = "4px solid";
    this.image.style.borderImage = `linear-gradient(90deg, ${color}ee 0%, ${color}aa 0%, rgba(0,0,0,0) 0%) 1`;

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

    this.domElement = document.createElement("div");
    this.domElement.classList.add("w-10", "relative");
    this.domElement.append(this.image, this.count);
    this.value = null;

    this.poly = easePolyOut.exponent(0.5);
  }

  set value(val) {
    this._value = val;
    if (val) {
      this.domElement.classList.remove("hidden");
      if (val.count > 2) {
        this.count.innerText = val.count;
        this.count.classList.remove("hidden");
      } else {
        this.count.classList.add("hidden");
      }
      this.image.src = this.cmdIcons[val.typeId];

      const pct = this.poly(1 - val.remainingBuildTime / val.buildTime) * 100;
      this.image.style.borderImage = `linear-gradient(90deg, ${this.color}ee 0%, ${this.color}aa ${pct}%, rgba(0,0,0,0) ${pct}%) 1`;
    } else {
      this.domElement.classList.add("hidden");
    }
  }

  get value() {
    return this._value;
  }
}
