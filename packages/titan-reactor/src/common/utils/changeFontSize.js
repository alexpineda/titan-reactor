const fontSizesUp = {
  xs: "sm",
  sm: "base",
  base: "lg",
  lg: "xl",
  xl: "2xl",
  "2xl": "3xl",
  "3xl": "4xl",
  "4xl": "5xl",
  "5xl": "5xl",
};

const fontSizesDown = {
  "5xl": "4xl",
  "4xl": "3xl",
  "3xl": "2xl",
  "2xl": "xl",
  xl: "lg",
  lg: "base",
  base: "sm",
  sm: "xs",
};

export const incFontSize = (fs, amount = 1) => {
  let fontSize = fs;
  for (let i = 0; i < amount; i++) {
    fontSize = fontSizesUp[fontSize];
  }
  return fontSize;
};

export const decFontSize = (fs, amount = 1) => {
  let fontSize = fs;
  for (let i = 0; i < amount; i++) {
    fontSize = fontSizesDown[fontSize];
  }
  return fontSize;
};
