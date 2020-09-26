import {
  Mesh,
  SphereBufferGeometry,
  MeshStandardMaterial,
  DefaultLoadingManager,
  Group,
} from "three";
import { LoadModel } from "../utils/meshes/LoadModels";

export class RenderUnit3D {
  constructor(loadingManager = DefaultLoadingManager) {
    this.loadingManager = loadingManager;
    this.prefabs = {
      999: () => {
        const mesh = new Mesh(
          new SphereBufferGeometry(1),
          new MeshStandardMaterial({ color: 0x999999 })
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      },
    };
  }

  load(typeId, unit = new Group()) {
    const mesh = this.prefabs[typeId] || this.prefabs[999];
    unit.userData.unitMesh = mesh;
    unit.add(mesh);
    return unit;
  }

  replace(unit, typeId) {
    unit.children.remove(unit.userData.unitMesh);
    return this.load(typeId, unit);
  }

  loadAssets() {
    // const loadSprite = new LoadSprite(loadManager, fileAccess);

    // const prefabs = {
    //   999: loadSprite.loadSync(`_alex/marine.bmp`),
    // };

    const loadModel = new LoadModel(this.loadingManager);
    const assignModel = (id) => (model) => {
      this.prefabs[id] = () => model.clone();
    };
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
    loadModel.load(`_alex/marine.glb`).then(assignModel(0x0));
    loadModel.load(`_alex/scarab.glb`).then(assignModel(0x55));
    loadModel.load(`_alex/mineral1.glb`).then(assignModel(0xb0));
    loadModel.load(`_alex/mineral1.glb`).then(assignModel(0xb1));
    loadModel.load(`_alex/mineral1.glb`).then(assignModel(0xb2));

    // loadModel.load(`_alex/medic.glb`).then(assignModel(0x22));
  }

  update() {}
}
