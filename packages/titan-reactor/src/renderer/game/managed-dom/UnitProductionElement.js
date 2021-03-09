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
  constructor(cmdIcons) {
    this.cmdIcons = cmdIcons;
    this.image = document.createElement("img");
    this.image.style.mixBlendMode = "screen";
    this.image.style.filter = "brightness(1.5)";

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
  }

  set value(val) {
    this._value = val;
    if (val) {
      this.domElement.classList.remove("hidden");
      this.count.innerText = val.count;
      this.image.src = this.cmdIcons[val.typeId];
    } else {
      this.domElement.classList.add("hidden");
    }
  }

  get value() {
    return this._value;
  }
}
