import Chk from "bw-chk";
import createScmExtractor from "scm-extractor";
const fs = window.require("fs");
import concat from "concat-stream";

const parseChk = (data) => Promise.resolve(new Chk(data));

export const extractChk = (filename) =>
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

export const imageChk = (scm, bwDataPath) =>
  loadChk(scm).then((chk) =>
    Object.assign(chk, {
      image: chk.image.bind(chk, Chk.fsFileAccess(bwDataPath)),
    })
  );

export const loadChk = async (scm) => {
  if (scm instanceof Chk) return scm;
  return typeof scm == "string"
    ? extractChk(scm).then(parseChk)
    : parseChk(scm);
};
