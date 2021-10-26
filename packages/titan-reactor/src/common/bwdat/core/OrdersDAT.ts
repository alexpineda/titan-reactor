import { DAT, ReadFileType } from "./DAT";

export type OrderDATType = {
  name: string;
};
export class OrdersDAT extends DAT<OrderDATType> {
  constructor(readFile: ReadFileType) {
    super(readFile);

    this.format = [
      { size: 2, name: "name", get: (i) => this.stats[i] },
      { size: 1, name: "useWeaponTargeting" },
      { size: 1, name: "unknown1" },
      { size: 1, name: "mainOrSecondary" },
      { size: 1, name: "unknown3" },
      { size: 1, name: "unknown4" },
      { size: 1, name: "interruptable" },
      { size: 1, name: "unknown5" },
      { size: 1, name: "queueable" },
      { size: 1, name: "unknown6" },
      { size: 1, name: "unknown7" },
      { size: 1, name: "unknown8" },
      { size: 1, name: "unknown9" },
      { size: 1, name: "targeting" },
      { size: 1, name: "energy" },
      { size: 1, name: "animation" },
      { size: 2, name: "highlight" },
      { size: 2, name: "unknown10" },
      { size: 1, name: "obscuredOrder" },
    ];

    this.datname = "orders.dat";
    this.count = 189;
  }
}
