import shuffle from "lodash.shuffle";
import { range } from "ramda";

const white = "#ffffff";
export default class UnitWireframe {
  constructor(wireframeIcons, size = "lg") {
    this.wireframeIcons = wireframeIcons;
    this.size = size;

    let stepLayers = range(0, 4).map(() => 0);

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

    this.zergSteps = range(0, 6).map((step) => {
      const layers = range(0, 4);

      //best guesses for zerg layer colors
      switch (step) {
        case 0:
          layers[0] = "hue-rotate(267deg) brightness(177%) saturate(0.4)";
          layers[1] = "hue-rotate(225deg) brightness(80%) saturate(0.6)";
          layers[2] = "hue-rotate(242deg) brightness(50%) saturate(0.6)";
          layers[3] = "hue-rotate(235deg) brightness(60%) saturate(0.6)";
          break;
        case 1:
          layers[0] = "hue-rotate(35deg) brightness(200%) saturate(0.8)";
          layers[1] = "hue-rotate(0deg) brightness(77%) saturate(0.7)";
          layers[2] = "hue-rotate(0deg) brightness(68%) saturate(0.6)";
          layers[3] = "hue-rotate(225deg) brightness(81%) saturate(0.7)";
          break;
        case 2:
          layers[0] = "hue-rotate(33deg) brightness(265%) saturate(0.8)";
          layers[1] = "hue-rotate(1deg) brightness(73%) saturate(0.9)";
          layers[2] = "hue-rotate(18deg) brightness(122%) saturate(0.7)";
          layers[3] = "hue-rotate(280deg) brightness(134%) saturate(0.3)";
          break;
        case 3:
          layers[0] = "hue-rotate(88deg) brightness(266%) saturate(0.6)";
          layers[1] = "hue-rotate(35deg) brightness(454%) saturate(0.9)";
          layers[2] = "hue-rotate(45deg) brightness(155%) saturate(0.5)";
          layers[3] = "hue-rotate(289deg) brightness(100%) saturate(0.3)";
          break;
        case 4:
          layers[0] = "hue-rotate(99deg) brightness(224%) saturate(0.8)";
          layers[1] = "hue-rotate(43deg) brightness(337%) saturate(0.9)";
          layers[2] = "hue-rotate(42deg) brightness(143%) saturate(0.6)";
          layers[3] = "hue-rotate(8deg) brightness(80%) saturate(0.7)";
          break;
        case 5: //
          layers[0] = "hue-rotate(45deg) brightness(437%) saturate(1)";
          layers[1] = "hue-rotate(113deg) brightness(262%) saturate(0.8)";
          layers[2] = "hue-rotate(37deg) brightness(341%) saturate(0.8)";
          layers[3] = "hue-rotate(0deg) brightness(90%) saturate(0.7)";
      }

      return layers;
    });

    this.domElement = document.createElement("div");
    this.domElement.style.position = "relative";
    if (size === "lg") {
      this.domElement.style.width = "128px";
      this.domElement.style.height = "128px";
    } else {
      this.domElement.style.width = "56px";
      this.domElement.style.height = "56px";
    }

    this.layers = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];

    this.layers.forEach((layer, i) => {
      layer.style.width = "128px";
      layer.style.height = "128px";
      layer.style.position = "absolute";
      layer.style.backgroundPositionX = `-${i * 128}px`;
      if (size === "md") {
        layer.style.transform = "translate(-38px, -38px) scale(0.4375)";
      }
      this.domElement.appendChild(layer);
    });

    //shields
    this.layers[4].style.filter = "hue-rotate(200deg)";
    this.layers[5].style.filter = "hue-rotate(200deg)";

    if (size === "md") {
      this.domElement.classList.add("border", "rounded");
      this.domElement.classList.add("mr-1", "mb-1");
    }
  }

  getFilter(unit, layerIndex) {
    if (
      unit.unitType.isZerg ||
      (unit.unitType.isResourceContainer && !unit.owner)
    ) {
      const step = unit.unitType.isResourceContainer
        ? 5
        : Math.floor((unit.hp / unit.unitType.hp) * 5);
      return this.zergSteps[step][layerIndex];
    } else {
      const step =
        unit.hp === unit.unitType.hp
          ? 7
          : Math.floor(Math.min(1, unit.hp / (unit.unitType.hp * 0.77)) * 6);

      let degree;
      let brightness;
      if (unit.unitType.isTerran) {
        brightness = "brightness(400%)";
        degree = this.steps[step][layerIndex];
        //protoss yellow needs some different settings
      } else if (this.steps[step][layerIndex] === 60) {
        brightness = "brightness(425%)";
        degree = 70;
        //protoss brightness lower than terran
      } else {
        brightness = "brightness(250%)";
        degree = this.steps[step][layerIndex];
      }

      return `hue-rotate(${degree}deg) ${
        this.steps[step][layerIndex] > 0 ? brightness : ""
      }`;
    }
  }

  update(unit) {
    const unitTypeId =
      unit.unitType.isZerg &&
      unit.unitType.isBuilding &&
      unit.queue &&
      unit.queue.units.length
        ? unit.queue.units[0]
        : unit.typeId;

    for (let i = 0; i < 4; i++) {
      const layer = this.layers[i];
      layer.style.backgroundImage = `url(${this.wireframeIcons.wireframes[unitTypeId]}`;
      layer.style.filter = this.getFilter(unit, i);
    }

    if (unit.unitType.shieldsEnabled) {
      this.layers[4].style.backgroundImage = `url(${this.wireframeIcons.wireframes[unitTypeId]}`;
      this.layers[5].style.backgroundImage = `url(${this.wireframeIcons.wireframes[unitTypeId]}`;

      if (unit.shields === 0) {
        this.layers[4].style.display = "none";
        this.layers[5].style.display = "none";
      } else if (unit.shields === unit.unitType.shields) {
        this.layers[4].style.display = "block";
        this.layers[5].style.display = "block";
      } else {
        this.layers[4].style.display = "block";
        this.layers[5].style.display = "none";
      }
    } else {
      this.layers[4].style.display = "none";
      this.layers[5].style.display = "none";
    }

    if (this.size === "md" && unit.owner) {
      this.domElement.style.borderColor =
        unit.recievingDamage & 1 ? white : unit.owner.color.hex;
    }
  }
}
