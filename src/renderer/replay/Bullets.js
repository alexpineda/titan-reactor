class Bullets {
  spawnIfNotExists(frameData) {
    const exists = this.units.children.find(
      (child) => child.userData.repId === frameData.repId
    );
    return exists || this.spawn(frameData);
  }

  spawn(frameData) {
    return this._spawn(frameData);
  }
  _spawn(frameData, replaceUnit, skippingFrames) {}
}
