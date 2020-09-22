export const tilesetNames = [
  "badlands",
  "platform",
  "install",
  "ashworld",
  "jungle",
  "desert",
  "ice",
  "twilight",
];

export class Tileset {
  constructor(tileset, bwDataPath, fileAccess) {
    this.tileset = tileset;
    this.fileAccess = fileAccess;
    this.bwDataPath = bwDataPath;
    this.palettes = null;
  }

  async load() {
    this.palettes = [
      await this.fileAccess(
        `${this.bwDataPath}/tileset/${tilesetNames[this.tileset]}.wpe`
      ),
      await this.fileAccess(
        `${this.bwDataPath}/tileset/${tilesetNames[this.tileset]}/ofire.pcx`
      ),
      await this.fileAccess(
        `${this.bwDataPath}/tileset/${tilesetNames[this.tileset]}/gfire.pcx`
      ),
      await this.fileAccess(
        `${this.bwDataPath}/tileset/${tilesetNames[this.tileset]}/bfire.pcx`
      ),
      await this.fileAccess(
        `${this.bwDataPath}/tileset/${tilesetNames[this.tileset]}/bexpl.pcx`
      ),
    ];
  }
}
