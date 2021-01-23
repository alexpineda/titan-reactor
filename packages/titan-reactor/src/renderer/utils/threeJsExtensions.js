THREE.Object3D.prototype.updateMatrix = function () {
  this.matrix.compose(this.position, this.quaternion, this.scale);

  var pivot = this.pivot;

  if (pivot !== null) {
    var px = pivot.x,
      py = pivot.y,
      pz = pivot.z;
    var te = this.matrix.elements;

    te[12] += px - te[0] * px - te[4] * py - te[8] * pz;
    te[13] += py - te[1] * px - te[5] * py - te[9] * pz;
    te[14] += pz - te[2] * px - te[6] * py - te[10] * pz;
  }

  this.matrixWorldNeedsUpdate = true;
};
