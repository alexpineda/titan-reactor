import { TextureLoader } from "three";

export const normalCanvasTexture = () =>
  Promise.resolve(new TextureLoader().load("_alex/fs-nodoodads_normal.png"));
