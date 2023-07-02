import {
    keymap,
    highlightSpecialChars,
    drawSelection,
    rectangularSelection,
    highlightActiveLineGutter,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
    defaultHighlightStyle,
    syntaxHighlighting,
    indentOnInput,
    bracketMatching,
    // foldGutter,
    foldKeymap
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { indentWithTab } from "@codemirror/commands";
// import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { completionKeymap } from "@codemirror/autocomplete";
// import { lintKeymap } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
// import { oneDark } from "@codemirror/theme-one-dark";

// import { evalKeymap } from "./evalKeymap";
// import { saveKeymap } from "./saveKeymap";
// import { createLinter } from "./linter";
// import { formatKeymap } from "./formatKeymap";
import { createAutocompletion } from "./autocompletion";

export const setupExtensions = () => [
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    EditorState.allowMultipleSelections.of( true ),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle),
    bracketMatching(),
    // closeBrackets(),
    rectangularSelection(),
    highlightSelectionMatches(),
    keymap.of( [
        // ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        // ...commentKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
        // evalKeymap,
        // saveKeymap,
        // formatKeymap,
    ] ),
    javascript(  ),
    // createLinter(),
    createAutocompletion(),
];
