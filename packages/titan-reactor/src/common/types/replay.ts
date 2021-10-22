import { ColorRepresentation } from "three";
import { Race } from "./common";

export type ReplayPlayer = {
  id: number;
  name: string;
  race: Race;
  color: {
    hex: string;
    rgb: ColorRepresentation;
  };
};
