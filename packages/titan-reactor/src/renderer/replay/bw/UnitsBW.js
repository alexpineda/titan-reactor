export default class UnitBW {
  static get byteLength() {
    return 44;
  }

  //   unsigned int index;
  //   int id;
  //   int owner;
  //   int x;
  //   int y;
  //   int hp;
  //   int energy;
  //   int sprite_index = -1;
  //   int status_flags;
  //   int direction;
  //   double angle;

  constructor(buf) {
    this.index = buf.readUInt32LE(0);
    this.id = buf.readInt32LE(4);
    this.owner = buf.readInt32LE(8);
    this.x = buf.readInt32LE(12);
    this.y = buf.readInt32LE(16);
    this.hp = buf.readInt32LE(20);
    this.energy = buf.readInt32LE(24);
    this.spriteIndex = buf.readInt32LE(28);
    this.statusFlags = buf.readInt32LE(32);
    this.direction = buf.readInt32LE(36);
    this.angle = buf.readInt32LE(40);
  }
}
