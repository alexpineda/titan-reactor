import { Color } from "three";
import shuffle from "lodash.shuffle";

export class Players extends Array {
  constructor(players, startLocations, customColors, randomizeColors) {
    super();
    const colors = randomizeColors ? shuffle(customColors) : customColors;
    this.customColors = colors.map((color) => ({
      hex: color,
      three: new Color().setStyle(color),
    }));

    this.push(
      ...players.map((player) => ({
        id: player.id,
        name: player.name,
        race: player.race,
        actions: new Int32Array(1428),
        color: { ...player.color, three: new Color(player.color.rgb) },
        originalColor: { ...player.color, three: new Color(player.color.rgb) },
        showActions: false,
        showPov: false,
        vision: true,
        startLocation: startLocations.find((u) => u.player == player.id),
      }))
    );
    this.activePovs = 0;

    this.playersById = {};
    for (const player of this) {
      this.playersById[player.id] = player;
    }
  }

  changeColors(useCustom) {
    for (let i = 0; i < this.length; i++) {
      if (useCustom) {
        this[i].color = this.customColors[i];
      } else {
        this[i].color = this.originalColor;
      }
    }
  }

  static get [Symbol.species]() {
    return Array;
  }

  updateResources(game) {
    this[0].supply = game.supplyTaken[0];
    this[1].supply = game.supplyTaken[1];
    this[0].supplyMax = game.supplyProvided[0];
    this[1].supplyMax = game.supplyProvided[1];
    this[0].workers = game.getWorkerCount(0);
    this[1].workers = game.getWorkerCount(1);
  }
}
