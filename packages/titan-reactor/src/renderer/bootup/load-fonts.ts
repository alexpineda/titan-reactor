import { promises as fsPromises } from "fs";

const loadFont = async (file: string, family: string, weight: string) => {
  const conthrax = (await fsPromises.readFile(file)).toString("base64");
  const style = document.createElement("style");
  document.head.appendChild(style);
  style.appendChild(
    document.createTextNode(`
    @font-face{
        font-family: ${family};
        src: url(data:font/otf;base64,${conthrax});
        font-weight: ${weight};
    }
  `)
  );
};

export default async () => {
  await loadFont(`${__static}/fonts/conthrax-rg.otf`, "conthrax", "100 400");
  await loadFont(`${__static}/fonts/conthrax-hv.otf`, "conthrax", "500 900");
};
