import { TextureLoader } from "three";

export const emissiveCanvasTexture = () =>
  Promise.resolve(new TextureLoader().load("_alex/fs-nodoodads_normal.png"));
