const HeaderMagicScrModern = 0x53526573;
const HeaderMagicClassic = 0x53526572;
const HeaderMagicTitanReactor = 0x53526577;
const Version = {
  classic: 0,
  remastered: 1,
  titanReactor: 2,
};

module.exports = {
  HeaderMagicClassic,
  HeaderMagicScrModern,
  HeaderMagicTitanReactor,
  Version,
};
