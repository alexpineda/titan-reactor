import { TBL } from "./TBL";
import { openFileBinary, openFileLines } from "../fs";
import { range, identity, memoizeWith } from "ramda";

export class DAT {
  constructor() {
    this.entries = [];
    this.info = {};
    this.statFile = `${process.env.BWDATA}/rez/stat_txt.tbl`;
  }

  async init() {
    const names = [
      "Animations",
      "Behaviours",
      "DamTypes",
      "DrawList",
      "ElevationLevels",
      "Explosions",
      "Flingy",
      "FlingyControl",
      "Hints",
      "Icons",
      "Images",
      "IscriptIDList",
      "Listfile",
      "Mapdata",
      "Orders",
      "Portdata",
      "Races",
      "Remapping",
      "Rightclick",
      "SelCircleSize",
      "Sfxdata",
      "ShieldSize",
      "Sprites",
      "Techdata",
      "Units",
      "UnitSize",
      "Upgrades",
      "Weapons",
    ];
    this.stats = await this._loadStatFile();
    this.initialized = Promise.all(
      names
        .map((name) => openFileLines(`./src/main/units/Data/${name}.txt`))
        .concat()
    ).then((files) => {
      files.forEach((buf, i) => {
        this.info[names[i]] = buf;
      });
    });
  }
  _readProp(buf, { size, array }) {
    if (array) {
      //@todo read the prop as an array itself instead
      return range(0, array).map((_) => this._read(buf, size));
    } else {
      return this._read(buf, { size });
    }
  }

  _read(buf, size, pos) {
    let value = null;
    if (size === 1) {
      value = buf.readInt8(pos);
    } else if (size === 2) {
      value = buf.readUInt16LE(pos);
    } else if (size === 4) {
      value = buf.readUInt32LE(pos);
    }
    return value;
  }

  async _loadStatFile() {
    const file = await openFileBinary(this.statFile);
    return TBL.parse(file);
  }

  async _loadIdFile(filename) {
    return await openFileBinary(`./src/main/units/Data/${filename}`);
  }

  async _loadDatFile(filename) {
    return await openFileBinary(`${process.env.BWDATA}/arr/${filename}`);
  }

  _statTxt(sublabel) {
    return (index) => {
      const offset = sublabel === "Sublabel" ? 1301 : 0;
      return this.stats[index + offset];
    };
  }

  _infoValue(name) {
    return (index) => {
      return this.info[name][index];
    };
  }

  _datValue(name) {
    return (index) => {
      if (index == 65535) return null;
      return this.info[name][index];
    };
  }

  async load() {
    if (!this.initialized) {
      await this.init();
    }

    this.stringIds = await this._loadIdFile(this.idfile);
    const buf = await this._loadDatFile(this.datname);

    const formatRange = (fmt) =>
      fmt.range ? fmt.range() : range(0, this.count);
    const formatLen = (fmt) => formatRange(fmt).length;
    const formatMin = (fmt) => formatRange(fmt)[0];

    this.entries = range(0, this.count).map((i) => {
      const values = this.format.map((fmt, j) => {
        if (!formatRange(fmt).includes(i)) {
          return [fmt.name, 0];
        }
        const pos =
          range(0, j)
            .map((k) => this.format[k])
            .reduce(
              (sum, prevFmt) => sum + prevFmt.size * formatLen(prevFmt),
              0
            ) +
          fmt.size * (i - formatMin(fmt));
        const value = this._read(buf, fmt.size, pos);
        return [fmt.name, fmt.get ? fmt.get(value) : value];
      });

      return values.reduce((memo, [key, val]) => {
        return { ...memo, [key]: val };
      }, {});
    });
  }
}
