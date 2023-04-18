import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { Extension } from "@codemirror/state";
import { getTsCompletionsAtPosition } from "@ipc/editor";

export function createAutocompletion(): Extension {
    return autocompletion( {
        override: [
            async ( ctx ) => {
                const { pos } = ctx;
                const completions = await getTsCompletionsAtPosition( pos );
                console.log( "completions", completions );

                if ( completions.length === 0 ) {
                    return null;
                }

                return completeFromList( completions )( ctx );
            },
        ],
    } );
}
