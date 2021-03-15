import { Color } from "three";
import shuffle from "lodash.shuffle";

export class Players extends Array {
  constructor(players, startLocations, customColors, randomizeColors) {
    super();
    const colors = randomizeColors ? shuffle(customColors) : customColors;
    this.customColors = colors.map((color) => ({
      hex: color,
      three: new Color().setStyle(color),
      alt: this._createAltColors(color),
    }));

    this.push(
      ...players.map((player) => {
        const color = {
          ...player.color,
          three: new Color(player.color.rgb),
          alt: this._createAltColors(player.color.hex),
        };

        return {
          id: player.id,
          name: player.name,
          race: player.race,
          color,
          originalColor: color,
          showActions: false,
          showPov: false,
          vision: true,
          startLocation: startLocations.find((u) => u.player == player.id),
        };
      })
    );
    this.activePovs = 0;

    this.playersById = {};
    for (const player of this) {
      this.playersById[player.id] = player;
    }
  }

  _setStyleSheet(content) {
    let style;

    style = document.querySelector("#player-colors-glow");
    if (!style) {
      style = document.createElement("style");
      style.id = "player-colors-glow";
      document.head.appendChild(style);
    }
    style.textContent = content;
  }

  injectColorsCss() {
    this._setStyleSheet(
      this.reduce((colors, { color }, i) => {
        return `
      ${colors}
      @keyframes glow-${this[i].id} {
        from {
          box-shadow: 0 0 10px -10px ${color.hex}55;
        }
        to {
          box-shadow: 0 0 10px 10px ${color.hex}55;
        }
      }
      `;
      }, "")
    );
  }

  changeColors(useCustom) {
    for (let i = 0; i < this.length; i++) {
      if (useCustom) {
        this[i].color = this.customColors[i];
      } else {
        this[i].color = this.originalColor;
      }
    }
    this.injectColorsCss();
  }

  _createAltColors(color) {
    let darken = new Color(0.1, 0.1, 0.1);
    const test = new Color();
    new Color().setStyle(color).getHSL(test);

    if (test.l > 0.6) {
      darken = new Color(0.2, 0.2, 0.2);
    }
    const darker = `#${new Color().setStyle(color).sub(darken).getHexString()}`;

    const hueShift = `#${new Color()
      .setStyle(darker)
      .offsetHSL(0.01, 0, 0)
      .getHexString()}66`;
    const lightShift = `#${new Color()
      .setStyle(darker)
      .offsetHSL(0, 0, 0.1)
      .getHexString()}`;

    return {
      darker,
      hueShift,
      lightShift,
    };
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
