import shuffle from "lodash.shuffle";
import { range } from "ramda";

export default class UnitDetailLayers {
  constructor() {
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
  }

  getFilter(unit, layerIndex) {
    if (unit.unitType.isZerg || unit.unitType.isResourceContainer) {
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
        brightness = "brightness(450%)";
        degree = 70;
        //protoss brightness lower than terran
      } else {
        brightness = "brightness(300%)";
        degree = this.steps[step][layerIndex];
      }

      return `hue-rotate(${degree}deg) ${
        this.steps[step][layerIndex] > 0 ? brightness : ""
      }`;
    }
  }
}
