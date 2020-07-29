import { SoundsDAT } from "./SoundsDAT";
import { PortraitsDAT } from "./PortraitsDAT";
import { SpritesDAT } from "./SpritesDAT";
import { FlingyDAT } from "./FlingyDAT";
import { TechDataDAT } from "./TechDataDAT";
import { UpgradesDAT } from "./UpgradesDAT";
import { OrdersDAT } from "./OrdersDAT";
import { ImagesDAT } from "./ImagesDAT";
import { WeaponsDAT } from "./WeaponsDAT";
import { UnitsDAT } from "./UnitsDAT";

import { writeFile } from "fs";
// const writeFile = () => {};

test("SoundsDAT should parse sfxdata.dat", async (done) => {
  const dat = new SoundsDAT();
  await dat.load();
  writeFile("sounds.result.json", JSON.stringify(dat.entries), () => {});
  // console.log(dat.entries)
  done();
});

test("PortraitsDAT should parse portdata.dat", async (done) => {
  const dat = new PortraitsDAT();
  await dat.load();
  writeFile("portraits.result.json", JSON.stringify(dat.entries), () => {});
  done();
});

test("SpritesDAT should parse sprites.dat", async (done) => {
  const dat = new SpritesDAT();
  await dat.load();
  writeFile("sprites.result.json", JSON.stringify(dat.entries), () => {});
  done();
});

test("FlingyDAT should parse flingy.dat", async (done) => {
  const dat = new FlingyDAT();
  await dat.load();
  writeFile("flingy.result.json", JSON.stringify(dat.entries), () => {});
  // console.log(dat.entries);
  done();
});

test("TechDataDAT should parse techdata.dat", async (done) => {
  const dat = new TechDataDAT();
  await dat.load();
  writeFile("techdata.result.json", JSON.stringify(dat.entries), () => {});
  // console.log(dat.entries);
  done();
});

test("UpgradesDAT should parse upgrades.dat", async (done) => {
  const dat = new UpgradesDAT();
  await dat.load();
  writeFile("upgrades.result.json", JSON.stringify(dat.entries), () => {});
  // console.log(dat.entries);
  done();
});

test("OrdersDAT should parse orders.dat", async (done) => {
  const dat = new OrdersDAT();
  await dat.load();
  writeFile("orders.result.json", JSON.stringify(dat.entries), () => {});
  // console.log(dat.entries);
  done();
});

test("ImagesDAT should parse images.dat", async (done) => {
  const dat = new ImagesDAT();
  await dat.load();
  writeFile("images.result.json", JSON.stringify(dat.entries), () => {});
  // console.log(dat.entries);
  done();
});

test("WeaponsDAT should parse weapons.dat", async (done) => {
  const dat = new WeaponsDAT();
  await dat.load();
  // console.log(dat.entries);
  writeFile("weapons.result.json", JSON.stringify(dat.entries), () => {});
  done();
});

test("UnitsDAT should parse units.dat", async (done) => {
  const dat = new UnitsDAT();
  await dat.load();
  console.log(dat.entries);
  writeFile("units.result.json", JSON.stringify(dat.entries), () => {});
  done();
});
