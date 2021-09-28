export default (str) =>
  Array.from(str)
    .filter((char) => char.charCodeAt(0) > 0x17)
    .join("");
