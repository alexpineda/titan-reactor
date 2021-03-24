import create from "../../../libs/zustand";
import { WebGLRenderer } from "three";

const renderer = new WebGLRenderer();
const anisotropy = renderer.capabilities.getMaxAnisotropy();
renderer.dispose();

const useCapabilitiesStore = create(() => ({
  anisotropy,
  pixelRatio: window.devicePixelRatio,
}));

export default useCapabilitiesStore;
