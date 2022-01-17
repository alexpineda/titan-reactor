// This utility converts SCR unit tags to 1.16 unit tags

// 1.16 unit tags are encoded 16 bit, counting from 1700 to 0
// GGGG GIII IIII IIII where I is the index and G is the generation value
// generation values are incremented everytime a unit object gets re-used
// SCR Unit limit is at 3400? packed with 12 bit? 13 bit? for indexes?
// how come some SCR tags are 0 or something like like 254?
const scrUnitTag = (scrTag, id) => {
  if (scrTag === 0) {
    return 0;
  }
  // const index = scrTag & 0x1fff;
  const index = 1700 - (3400 - (scrTag & 0x1fff));
  const generation = scrTag >> 13;

  if (index >= 1700) {
    throw new Error("1.16 replay unit limit reached");
  }

  // write the unit tag back to 116
  const tag = index | (generation << 11);

  if (tag < 0) {
    return scrTag;
  }
  return tag;
};

module.exports = scrUnitTag;
