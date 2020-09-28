export const GameSpeed = {
  slowest: 2,
  normal: 12,
  fastest: 24,
  "2x": 48,
  "4x": 48,
  "8x": 48,
  "16x": 48,
  "32x": 48,
};

export class ReplayPosition {
  constructor(maxFrame) {
    this.maxFrame = maxFrame;
    this.frame = 0;
    this.bwapiBufferFrame = 0;
    this.bwGameFrame = 0;
    this.skipGameFrames = 1;
    this.skipPhysicsFrames = 20;
    this.gameSpeed = GameSpeed.fastest;
    this._maxSkipSpeed = 100;
    this.onResetState = () => {};
  }

  toggleSkipFrames() {
    if (this.skipGameFrames > 1) {
      this.skipGameFrames = 1;
    } else {
      this.skipGameFrames = 10;
    }
  }

  //@todo skipGameFrames in smaller increments
  goto(frame) {
    this.destination = frame;
    this._goto = () => {
      if (frame > this.bwGameFrame) {
        this.skipGameFrames = Math.min(
          frame - this.bwGameFrame,
          this._maxSkipSpeed
        );
      } else {
        this.skipGameFrames = Math.min(frame, this._maxSkipSpeed);
        this.bwapiBufferFrame = 0;
        this.bwGameFrame = 0;
        this.onResetState();
      }
      this._goto = null;
    };
  }

  update() {
    this.frame++;

    this._goto && this._goto();

    if (this.bwGameFrame === this.destination) {
      delete this.destination;
      this.skipGameFrames = 1;
    }
    if (
      this.bwGameFrame >= this.destination - this._maxSkipSpeed &&
      this.bwGameFrame <= this.destination + this._maxSkipSpeed
    ) {
      this.skipGameFrames = this.destination - this.bwGameFrame;
    }
  }
}
