import { Vector3 } from "three";

export class ReplayUnits {
  loadAssets() {}

  spawn(frameData) {}

  spawnIfNotExists(frameData) {
    const exists = this.units.children.find(
      (child) => child.userData.repId === frameData.repId
    );
    return exists || this.spawn(frameData);
  }

  update(unit, frameData) {}

  cameraUpdate({ position }, { target }) {
    const delta = new Vector3();
    this.shear = delta.subVectors(position, target);
  }

  getUnits() {
    return this.units.children;
  }

  killUnits(repIds) {
    if (!repIds || !repIds.length) {
      return;
    }
    this.units.children
      .filter(({ userData }) => repIds.includes(userData.repId))
      .forEach((unit) => this.killUnit(unit));
  }

  dispose() {}
}

// //#region lepring movement and adjusting position according to terrain
// units.getUnits().forEach((model) => {
//     if (model.userData.nextPosition) {
//       model.position.lerpVectors(
//         model.userData.startPosition,
//         model.userData.nextPosition,
//         (worldFrame % physicsFrameSkip) / physicsFrameSkip
//       );
//     }
//   }

// displacement = {
//   image: floor.material.displacementMap.image
//     .getContext("2d")
//     .getImageData(0, 0, disp.width, disp.height),
//   width: disp.width,
//   scale: floor.material.displacementScale,
// };

// if (worldFloor && worldFrame % 50 === 0) {
//   const testPoint = new Vector3();
//   const raycaster = new THREE.Raycaster(
//     testPoint.addVectors(model.position, new Vector3(0, 20, 0)),
//     new Vector3(0, -1, 0)
//   );
//   const result = raycaster.intersectObject(worldFloor, false);
//   if (result && result.length) {
//     const point = result[0].point;
//     model.position.copy(point.add);
//   }
// }
