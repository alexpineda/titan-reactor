import {
  Mesh,
  SphereBufferGeometry,
  MeshStandardMaterial,
  DefaultLoadingManager,
  Group,
} from "three";
import loadGlb from "titan-reactor-shared/image/loadGlb";

export class Image3D {
  constructor(loadingManager = DefaultLoadingManager) {
    this.loadFromUnitType = true;
    this.loadingManager = loadingManager;
    // not used in 3d but required for interface
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

    const assignModel = (id) => (model) => {
      this.prefabs[id] = () => model.clone();
    };

    //@todo use units.js from bwdat
    //@todo don't use static asset directory anymore, load from fs
    loadGlb("_alex/scvm.glb").then(assignModel(0x7));
    loadGlb("_alex/probe.glb").then(assignModel(0x40));
    loadGlb("_alex/supply.glb").then(assignModel(0x6d));
    loadGlb("_alex/pylon.glb").then(assignModel(0x9c));
    loadGlb("_alex/nexus.glb").then(assignModel(0x9a));
    loadGlb("_alex/command-center.glb").then(assignModel(0x6a));
    loadGlb("_alex/refinery.glb").then(assignModel(0x6e));
    loadGlb("_alex/barracks.glb").then(assignModel(0x6f));
    loadGlb("_alex/assimilator.glb").then(assignModel(0x9d));
    loadGlb("_alex/gateway.glb").then(assignModel(0xa0));
    loadGlb("_alex/dropship.glb").then(assignModel(0xb));
    loadGlb("_alex/marine.glb").then(assignModel(0x0));
    loadGlb("_alex/scarab.glb").then(assignModel(0x55));
    loadGlb("_alex/mineral1.glb").then(assignModel(0xb0));
    loadGlb("_alex/mineral1.glb").then(assignModel(0xb1));
    loadGlb("_alex/mineral1.glb").then(assignModel(0xb2));

    // loadGlb(`_alex/medic.glb`).then(assignModel(0x22));
  }

  update() {}
}
