import { Color } from "three";
import { PlayerColor, AltColors } from "../types/colors";

export const setStyleSheet = (id: string, content: string) => {
  let style;

  style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = content;
};

export const injectColorsCss = (colors: PlayerColor[]) => {
  setStyleSheet(
    "player-colors-glow",
    colors.reduce((css: string, color) => {
      return `
    ${css}
    @keyframes glow-${color.playerId} {
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
};

export const createAltColors = (color: string): AltColors => {
  let darken = new Color(0.1, 0.1, 0.1);
  const test = { h: 0, s: 0, l: 0 };
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
};

export const buildPlayerColor = (color: string, id: number): PlayerColor => ({
  playerId: id,
  hex: color,
  three: new Color().setStyle(color),
  alt: createAltColors(color),
});
