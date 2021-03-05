const fontSizes = {
  xs: "sm",
  sm: "base",
  lg: "xl",
  xl: "2xl",
  "2xl": "3xl",
  "3xl": "4xl",
  "4xl": "5xl",
  "5xl": "5xl",
};

const incFontSize = (fs, amount = 1) => {
  let fontSize = fs;
  for (let i = 0; i < amount; i++) {
    fontSize = fontSizes[fontSize];
  }
  return fontSize;
};

export default incFontSize;
