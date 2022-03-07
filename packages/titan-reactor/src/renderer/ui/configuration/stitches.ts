import { createStitches } from "@stitches/react";
import { uiTheme } from "./theme";

export const { css, getCssText, styled, globalCss, keyframes, theme } = createStitches({
    theme: uiTheme
});