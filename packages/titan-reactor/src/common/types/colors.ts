import { Color } from "three";

export type AltColors = {
  darker: string;
  hueShift: string;
  lightShift: string;
};

export type PlayerColor = {
  playerId: number;
  hex: string;
  three: Color;
  alt: AltColors;
};
