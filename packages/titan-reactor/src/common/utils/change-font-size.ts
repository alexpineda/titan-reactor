const fontSizesUp: Record<string, string> = {
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

const fontSizesDown: Record<string, string> = {
  "5xl": "4xl",
  "4xl": "3xl",
  "3xl": "2xl",
  "2xl": "xl",
  xl: "lg",
  lg: "base",
  base: "sm",
  sm: "xs",
};

//@todo constrain font sizes to union type

export const incFontSize = (fs: string, amount = 1) => {
  let fontSize = fs;
  for (let i = 0; i < amount; i++) {
    fontSize = fontSizesUp[fontSize];
  }
  return fontSize;
};

export const decFontSize = (fs: string, amount = 1) => {
  let fontSize = fs;
  for (let i = 0; i < amount; i++) {
    fontSize = fontSizesDown[fontSize];
  }
  return fontSize;
};
