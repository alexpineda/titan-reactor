const iscript = require("./index.js");
const fs = require("fs");

fs.readFile(process.argv[2], (err, buf) => {
  if (err) {
    console.error(err);
  }

  const { iscripts, animationBlocks } = iscript(buf);

  //each block contains a set of commands
  console.log(animationBlocks);

  //each script represents a unit, typically
  //offsets determine the purpose of the block, eg. index 0 = init, 1 = death, 3 = ground attack init, and so on
  console.log(iscripts);
});
