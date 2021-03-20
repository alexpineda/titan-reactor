import UnitDetailLayers from "./UnitDetailLayers";

export default class LargeUnitDetailElement extends UnitDetailLayers {
  constructor(wireframeIcons) {
    super();
    this.wireframeIcons = wireframeIcons;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "relative";
    this.domElement.style.width = "128px";
    this.domElement.style.height = "128px";

    this.layers = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];

    let _zIndex = 10;
    this.layers.forEach((layer) => {
      layer.style.width = "128px";
      layer.style.height = "128px";
      layer.style.position = "absolute";
      layer.style.zIndex = _zIndex--;
      this.domElement.appendChild(layer);
    });

    this.hp = document.createElement("p");
    this.shields = document.createElement("p");
    this.kills = document.createElement("p");
    this.construction = document.createElement("div");

    this.domElement.appendChild(this.hp);
    this.domElement.appendChild(this.shields);
    this.domElement.appendChild(this.kills);
    this.domElement.appendChild(this.construction);

    this.domElement.style.display = "none";
    this.value = "";
  }

  set value(unit) {
    this._value = unit;
    if (unit) {
      for (let i = 0; i < 4; i++) {
        const layer = this.layers[i];
        layer.style.backgroundImage = `url(${
          this.wireframeIcons.wireframes[unit.typeId]
        }`;
        layer.style.backgroundPositionX = `-${i * 128}px`;
        layer.style.filter = this.getFilter(unit, i);
      }

      this.hp.textContent = `${unit.hp}/${unit.unitType.hp}`;
      if (unit.unitType.shieldsEnabled) {
        this.shields.textContent = `${unit.shields}/${unit.unitType.shields}`;
        this.shields.style.display = "none";
      } else {
        this.shields.style.display = "block";
      }

      //   this.kills.textContent = `${unit.kills} kills`;
      //   this.energy.textContent = `${unit.energy}/${unit.unitType.energy}`;
      //hp/maxhp
      //shield/maxshield
      //construction
      //kills

      //   this.textNode.nodeValue = val.id;
      this.domElement.style.display = "block";
    } else {
      this.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
