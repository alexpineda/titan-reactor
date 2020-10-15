"use strict";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import Chk from "../../libs/bw-chk";
import rep from "downgrade-replay";
import concat from "concat-stream";
import createExtractor from "scm-extractor";
import { is } from "ramda";

const search = async (dir, fileExt, files = []) => {
  const filenames = await fsPromises.readdir(dir);

  for (let filename of filenames) {
    const filepath = path.join(dir, filename);
    const stat = await fsPromises.lstat(filepath);
    if (stat.isDirectory()) {
      await search(path.join(dir, filename), fileExt, files);
    } else if (filename.includes(fileExt)) {
      files.push(filepath);
    }
  }
  return files;
};

const getResources = (file) =>
  new Promise((res, rej) =>
    fs
      .createReadStream(file)
      .pipe(createExtractor())
      .on("error", rej)
      .pipe(
        concat((data) => {
          let chk;
          try {
            chk = new Chk(data);
            res(chk);
          } catch (e) {
            rej(e);
          }
        })
      )
  );

const sum = (list) =>
  list.reduce((sum, val) => {
    return sum + val;
  }, 0);

const avg = (list) => {
  const s = sum(list);
  return s / list.length;
};

const parseFiles = async () => {
  const files = await search(process.argv[2], ".scx");

  console.log(`found ${files.length} files`);
  let minerals = [];
  let gas = [];
  for (let file of files) {
    try {
      const res = await getResources(file);
      const totalMinerals = res.units.filter((u) =>
        [0xb0, 0xb1, 0xb2].includes(u.unitId)
      ).length;
      minerals.push(totalMinerals);
      const totalGas = res.units.filter((u) => [0xbc].includes(u.unitId))
        .length;

      gas.push(totalGas);
    } catch (e) {
      console.error(`could not parse ${file}`);
    }
  }
  return [minerals, gas];
};

const getSummary = async () => {
  const [minerals, gas] = await parseFiles();

  const avgMinerals = avg(minerals);

  const squareDiffMinerals = minerals.map((value) => {
    var diff = value - avgMinerals;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var stdMinerals = Math.sqrt(avg(squareDiffMinerals));

  const avgGas = avg(gas);

  const squareDiffGas = gas.map((value) => {
    var diff = value - avgGas;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var stdMinerals = Math.sqrt(avg(squareDiffMinerals));
  var stdGas = Math.sqrt(avg(squareDiffGas));

  console.log(`avg minerals: ${avgMinerals}  std: ${stdMinerals}`);
  console.log(`avg gas: ${avgGas}  std: ${stdGas}`);
};

getSummary();
