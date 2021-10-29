const iconv = require("iconv-lite");

const cstring = (buf) => {
  let text = buf;
  const end = buf.indexOf(0);
  if (end !== -1) {
    text = buf.slice(0, end);
  }

  const string = iconv.decode(text, "cp949");
  if (string.indexOf("\ufffd") !== -1) {
    return iconv.decode(text, "cp1252");
  } else {
    return string;
  }
};

module.exports = cstring;
