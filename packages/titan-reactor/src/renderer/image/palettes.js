import { openDataFile } from "../invoke";

export default async (readStarcraftFile) => [
  await readStarcraftFile(`tileset/jungle.wpe`),
  await openDataFile(`palettes/ofire.wpe`),
  await openDataFile(`palettes/gfire.wpe`),
  await openDataFile(`palettes/bfire.wpe`),
  await openDataFile(`palettes/bexpl.wpe`),
];
