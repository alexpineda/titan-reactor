import { Object3D } from "three";

import { IScriptRunner } from "../iscript";
import { BwDATType, ImageDATType } from "./bwdat";

export type createIScriptRunner = (
  image: Object3D,
  imageDesc: ImageDATType,
  state?: any
) => IScriptRunner;

export type createIScriptRunnerFactory = (
  bwDat: BwDATType,
  tileset: number
) => createIScriptRunner;
