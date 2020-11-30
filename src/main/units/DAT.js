import { TBL } from "./TBL";
import { openFileBinary, openFileLines } from "../fs";
import { range, identity, memoizeWith } from "ramda";

export class DAT {
  constructor(bwDataPath) {
    this.bwDataPath = bwDataPath;
    this.entries = [];
    this.info = {};
    this.statFile = `${this.bwDataPath}/rez/stat_txt.tbl`;
  }

  init() {
    this.initialized = new Promise((res) => {
      this._loadStatFile()
        .then(
          (stats) =>
            (this.stats = stats.map((file) => {
              if (file.includes("\u0000")) {
                return file.substr(0, file.indexOf("\u0000"));
              }
              return file;
            }))
        )
        .then(res);
    });
  }

  _read(buf, size, pos) {
    let value = null;
    if (size === 1) {
      value = buf.readUInt8(pos);
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

  async _loadDatFile(filename) {
    return await openFileBinary(`${this.bwDataPath}/arr/${filename}`);
  }

  _statTxt() {
    return (index) => {
      if (index === 0) {
        return null;
      }
      return this.stats[index - 1];
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
      this.init();
    }
    await this.initialized;

    const buf = await this._loadDatFile(this.datname);

    const formatRange = (fmt) =>
      fmt.range ? fmt.range() : range(0, this.count);
    const formatLen = (fmt) => formatRange(fmt).length;
    const formatMin = (fmt) => formatRange(fmt)[0];

    const entries = range(0, this.count).map((i) => {
      const values = this.format.flatMap((fmt, j) => {
        if (!formatRange(fmt).includes(i)) {
          if (fmt.names) {
            return fmt.names.map((name) => ({ name, value: 0 }));
          }
          return { name: fmt.name, value: 0 };
        }
        const pos =
          range(0, j)
            .map((k) => this.format[k])
            .reduce(
              (sum, prevFmt) => sum + prevFmt.size * formatLen(prevFmt),
              0
            ) +
          fmt.size * (i - formatMin(fmt));

        if (fmt.names) {
          return fmt.names.map((name, n) => {
            const size = fmt.size / fmt.names.length;
            const value = this._read(buf, size, pos + n * size);
            return { name, value };
          });
        }
        const data = this._read(buf, fmt.size, pos);
        return { name: fmt.name, value: fmt.get ? fmt.get(data) : data };
      });

      return values.reduce((memo, { name, value }) => {
        return { ...memo, [name]: value };
      }, {});
    });
    if (this.post) {
      this.post(entries);
    }
    return (this.entries = entries);
  }
}
