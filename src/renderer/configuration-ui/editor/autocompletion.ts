// import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { autocompletion } from "@codemirror/autocomplete";
import { Extension } from "@codemirror/state";
// import { getTsCompletionsAtPosition } from "../ipc/editor";

export function createAutocompletion(): Extension {
    return autocompletion({
        override: [
            async (ctx) => {

                const { pos } = ctx;
                console.log("pos", pos);
                // try {
                //     const completions = await getTsCompletionsAtPosition(pos);

                //     if (completions.length === 0) {
                //         return null;
                //     }   

                //     return completeFromList(completions)(ctx);
                // } catch (e) {
                //     console.error(e);
                // }

                return null;
            },
        ],
    });
}
