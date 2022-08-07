import { rgbToCanvas } from "@image/canvas";
import { readCascFile } from "common/utils/casclib";
import Chk from "bw-chk";
import { charColor } from "common/enums";

export const omitCharacters = (str: string) =>
  Array.from(str)
    .filter((char) => char.charCodeAt(0) > 0x17)
    .join("");

export const processString = (str: string, useColors = true) => {
  const defaultColor = "white";
  let currentColor = defaultColor;
  let currentChunk = "";
  const chunks = [];
  const el = (newLine: boolean, color: string, content: string, i: number) =>
    newLine ? (
      <div style={{ color }} key={i}>
        {content}
      </div>
    ) : (
      <span style={{ color }} key={i}>
        {content}
      </span>
    );

  for (let i = 0; i <= str.length; i++) {
    const charCode = str.charCodeAt(i);
    const char = str[i];
    const nextColor = charColor.get(charCode);
    const newLine = charCode === 13;
    if (nextColor || newLine || i === str.length) {
      // first character won't have current chunk
      if (currentChunk) {
        chunks.push(el(newLine, currentColor, currentChunk, i));
        currentChunk = "";
        currentColor = useColors ? nextColor || defaultColor : defaultColor;
      }
    } else {
      currentChunk += char;
    }
  }

  return <>{chunks}</>;
};

export const cleanMapTitles = (chk: Chk) => {
  chk.title = omitCharacters(chk.title);
  chk.description = omitCharacters(chk.description);
};

export const createMapImage = async (chk: Chk) => {
  const img = await chk.image(
    Chk.customFileAccess(async (fs, isOptional) => {
      try {
        const img = await readCascFile(fs);
        return img;
      } catch (e) {
        if (isOptional) {
          return null;
        }
        throw e;
      }
    }),
    512,
    512
  );

  return rgbToCanvas({ data: img, width: 512, height: 512 }, "rgb");
};
