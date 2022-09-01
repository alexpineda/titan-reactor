import { EquirectangularReflectionMapping } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

export async function loadEnvironmentMap(
  filepath: string
) {
  const loader = filepath.endsWith(".exr") ? new EXRLoader() : new RGBELoader();
  const tex = await loader.loadAsync(
    filepath,
  );

  tex.mapping = EquirectangularReflectionMapping;
  tex.name = filepath;
  return tex;
}