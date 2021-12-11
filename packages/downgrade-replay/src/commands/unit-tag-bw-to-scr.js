// This utility converts 1.16 unit tags to SCR unit tags
const bwUnitTag = (bwTag) => {
  if (bwTag === 0) {
    return 0;
  }
  const index = 3400 - (1700 - (bwTag & 0x7ff));
  const generation = bwTag >> 11;
  return index | (generation << 13);
};

module.exports = bwUnitTag;
