import shuffle from "lodash.shuffle";
import { range } from "ramda";

export default class LargeUnitDetailElement {
  constructor(wireframeIcons) {
    this.wireframeIcons = wireframeIcons;
    this.domElement = document.createElement("span");
    this.domElement.style.position = "relative";

    this.layers = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];

    this.layers.forEach((layer) => {
      layer.style.width = "128px";
      layer.style.height = "128px";
      layer.style.position = "absolute";
      this.domElement.appendChild(layer);
    });

    let stepLayers = range(0, 4).map(() => 0);

    const _findRandom = () => {
      Math.random();
    };

    const findRandomIndex = (list, pred) => {
      const eligible = shuffle(range(0, list.length));

      while (eligible.length) {
        const idx = eligible.shift();
        if (pred(list[idx])) {
          return idx;
        }
      }
    };

    this.steps = range(0, 8).map(() => {
      const idx = findRandomIndex(stepLayers, (layer) => layer < 120);
      stepLayers[idx] = stepLayers[idx] + 60;
      return [...stepLayers];
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
      let step = 0;
      if (unit.hp === unit.unitType.hp || unit.unitType.isResourceContainer) {
        step = 7;
      } else {
        step = Math.floor(Math.min(1, unit.hp / (unit.unitType.hp * 0.77)) * 6);
      }

      for (let i = 0; i < 4; i++) {
        const layer = this.layers[i];
        layer.style.backgroundImage = `url(${
          this.wireframeIcons.wireframes[unit.typeId]
        }`;
        layer.style.backgroundPositionX = `-${i * 128}px`;
        layer.style.filter = `hue-rotate(${this.steps[step][i]}deg) ${
          this.steps[step][i] > 0 ? "brightness(400%)" : ""
        }`;
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
