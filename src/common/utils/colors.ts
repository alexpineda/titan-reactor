import { Color } from "three";
import { PlayerColor } from "../types/colors";

export const buildPlayerColor = (color: string, id: number): PlayerColor => ({
  playerId: id,
  hex: color,
  three: new Color().setStyle(color),
});
