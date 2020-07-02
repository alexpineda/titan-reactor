import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { LoadModel } from "../meshes/LoadModels";
import { Object3D, Vector3, LoadingManager } from "three";

export const splatUnits = (terrain) => {
  const loadingManager = new LoadingManager();
  const loadModel = new LoadModel(loadingManager);
  const units = new Object3D();
  const assignModel = () => (model) => units.add(model);
  loadModel.load(`_alex/scvm.glb`).then(assignModel(0x7));
  loadModel.load(`_alex/probe.glb`).then(assignModel(0x40));
  loadModel.load(`_alex/supply.glb`).then(assignModel(0x6d));
  loadModel.load(`_alex/pylon.glb`).then(assignModel(0x9c));
  loadModel.load(`_alex/nexus.glb`).then(assignModel(0x9a));
  loadModel.load(`_alex/command-center.glb`).then(assignModel(0x6a));
  loadModel.load(`_alex/refinery.glb`).then(assignModel(0x6e));
  loadModel.load(`_alex/barracks.glb`).then(assignModel(0x6f));
  loadModel.load(`_alex/assimilator.glb`).then(assignModel(0x9d));
  loadModel.load(`_alex/gateway.glb`).then(assignModel(0xa0));
  loadModel.load(`_alex/dropship.glb`).then(assignModel(0xb));

  loadingManager.onLoad = () => {
    var sampler = new MeshSurfaceSampler(terrain)
      .setWeightAttribute("uv")
      .build();

    units.children.forEach((unit) => {
      let position = new Vector3(),
        normal = new Vector3();
      sampler.sample(position, normal);
      unit.position.set(position.x, position.z, position.y);
    });
  };

  return units;
};
