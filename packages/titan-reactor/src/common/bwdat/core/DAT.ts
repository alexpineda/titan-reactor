import range from "../../utils/range";
import { TBL } from "./TBL";

export type ReadFileType = (fname: string) => Promise<Buffer>;
export type FormatType = {
  size: number;
  names?: string[];
  name?: string;
  get?: (i: number) => any;
  range?: () => number[];
};

export class DAT<Type> {
  private readonly readFile: ReadFileType;
  private initialized?: Promise<string[]>;
  stats: string[] = [];

  protected statFile: string;
  protected datname = "";
  protected count = 0;
  protected format?: FormatType[];
  entries: Type[] = [];

  constructor(readFile: ReadFileType) {
    this.readFile = readFile;
    this.statFile = "rez/stat_txt.tbl";
  }

  init() {
    this.initialized = new Promise((res) => {
      this._loadStatFile()
        .then(
          (stats) =>
            (this.stats = stats.map((file: string) => {
              if (file.includes("\u0000")) {
                return file.substr(0, file.indexOf("\u0000"));
              }
              return file;
            }))
        )
        .then(res);
    });
  }

  _read(buf: Buffer, size: number, pos: number) {
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
    const file = await this.readFile(this.statFile);
    return TBL.parse(file);
  }

  async _loadDatFile(filename: string) {
    return await this.readFile(`arr/${filename}`);
  }

  _statTxt(): (index: number) => string {
    return (index: number) => {
      if (index === 0) {
        return "";
      }
      return this.stats[index - 1];
    };
  }

  async load(): Promise<Type[]> {
    if (!this.initialized) {
      this.init();
    }
    await this.initialized;

    const buf = await this._loadDatFile(this.datname);

    const formatRange = (fmt: FormatType) =>
      fmt.range ? fmt.range() : range(0, this.count);
    const formatLen = (fmt: FormatType) => formatRange(fmt).length;
    const formatMin = (fmt: FormatType) => formatRange(fmt)[0];

    const entries = range(0, this.count).map((i): Type => {
      const values = (this.format as FormatType[]).flatMap((fmt, j) => {
        if (!formatRange(fmt).includes(i)) {
          if (fmt.names) {
            return fmt.names.map((name) => ({ name, value: 0 }));
          }
          return { name: fmt.name, value: 0 };
        }
        const pos =
          range(0, j)
            .map((k) => (this.format as FormatType[])[k])
            .reduce(
              (sum, prevFmt) => sum + prevFmt.size * formatLen(prevFmt),
              0
            ) +
          fmt.size * (i - formatMin(fmt));

        if (Array.isArray(fmt.names)) {
          return fmt.names.map((name, n) => {
            const size = fmt.size / (fmt.names as string[]).length;
            const value = this._read(buf, size, pos + n * size);
            return { name, value };
          });
        }
        const data = this._read(buf, fmt.size, pos) as number;
        return { name: fmt.name, value: fmt.get ? fmt.get(data) : data };
      });

      return values.reduce((memo, { name, value }) => {
        return { ...memo, [name]: value };
      }, {});
    });

    return (this.entries = await this.post(entries));
  }

  protected post(entries: Type[]) {
    return entries.map((entry: Type, i: number) => ({
      ...entry,
      index: i,
    }));
  }
}
