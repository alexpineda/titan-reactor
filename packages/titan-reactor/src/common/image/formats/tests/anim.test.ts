import { Anim } from "../anim";
import parseAnim from "../anim_new";
import fs from "fs";

const animTimes: number[] = [];
const newTimes: number[] = [];

for (let i = 0; i < 999; i++) {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(`./anim/main_${`00${i})}`.slice(-3)}.anim`);
  } catch (e) {
    continue;
  }

  let start = performance.now();
  Anim(buf);
  animTimes.push(start);

  start = performance.now();
  parseAnim(buf);
  newTimes.push(start);
}

console.log(`
      old-anim: ${animTimes.reduce((a, b) => a + b, 0) / animTimes.length} 
      new-anim: ${newTimes.reduce((a, b) => a + b, 0) / newTimes.length}
    `);
