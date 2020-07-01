import Chk from "../../../bw-chk";
import createScmExtractor from "scm-extractor";
import fs from "fs";
import concat from "concat-stream";
import { openFile } from "../invoke";

const parseChk = (data) => Promise.resolve(new Chk(data));

const extractChk = (filename) =>
  new Promise((res, rej) =>
    fs
      .createReadStream(filename)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          res(data);
        })
      )
  );

let tilesetFiles = [];
export const imageChk = (scm, bwDataPath) => {
  const tilesets = [
    "badlands",
    "platform",
    "install",
    "ashworld",
    "jungle",
    "desert",
    "ice",
    "twilight",
  ];

  const extensions = [".cv5", ".vx4ex", ".vr4", ".wpe", ".vf4"];
  const files = tilesets
    .map((ts) => extensions.map((ext) => `tileset/${ts}${ext}`))
    .flat();

  files.forEach((file) => {
    tilesetFiles[file] = openFile(`${bwDataPath}/${file}`).catch(null);
  });

  const fileAccess = async (filepath) => {
    if (tilesetFiles[filepath]) {
      return await tilesetFiles[filepath];
    }
    throw new Error(`${filepath} not cached or does not exist`);
  };

  return loadChk(scm).then((chk) =>
    Object.assign(chk, {
      image: chk.image.bind(chk, Chk.customFileAccess(fileAccess)),
    })
  );
};

const loadChk = async (scm) => {
  if (scm instanceof Chk) return scm;
  return typeof scm == "string"
    ? extractChk(scm).then(parseChk)
    : parseChk(scm);
};
