import { DAT } from "./DAT";
export class OrdersDAT extends DAT {
  constructor() {
    super();

    this.format = [
      { size: 2, name: "Label", get: (i) => this.stats[i] },
      { size: 1, name: "UseWeaponTargeting" },
      { size: 1, name: "Unknown1" },
      { size: 1, name: "MainOrSecondary" },
      { size: 1, name: "Unknown3" },
      { size: 1, name: "Unknown4" },
      { size: 1, name: "Interruptable" },
      { size: 1, name: "Unknown5" },
      { size: 1, name: "Queueable" },
      { size: 1, name: "Unknown6" },
      { size: 1, name: "Unknown7" },
      { size: 1, name: "Unknown8" },
      { size: 1, name: "Unknown9" },
      { size: 1, name: "Targeting", get: this._datValue("Weapons") },
      { size: 1, name: "Energy", get: this._infoValue("Techdata") },
      { size: 1, name: "Animation", get: this._infoValue("Animations") },
      { size: 2, name: "Highlight", get: this._infoValue("Icons") },
      { size: 2, name: "Unknown10" },
      { size: 1, name: "ObscuredOrder", get: this._datValue("Orders") },
    ];

    this.datname = "orders.dat";
    this.idfile = "Orders.txt";
    this.filesize = 4158;
    this.count = 189;
  }
}
