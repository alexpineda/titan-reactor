import { useCallback, useState } from "react";
import { Actionable, MacroDTO } from "common/types";
import { ScriptInline } from "../../editor/script-inline";
import debounce from "lodash.debounce";


export const ActionableTargetFunction = ( {
    macro,
    action,
}: {
    macro: MacroDTO;
    action: Actionable;
} ) => {
    const [ value, setValue ] = useState( action.value );

    const debouncedUpdateActionable =  useCallback(debounce(
        // eslint-disable-next-line @typescript-eslint/unbound-method
        window.deps.useMacroStore.getState().updateActionable,
        500
    ), [] );
    
    return (
        <div
            style={{
                display: "grid",
                gridGap: "var(--size-1)",
            }}>
            <ScriptInline
                content={value as string}
                onChange={( content ) => {
                    setValue( content );
                    debouncedUpdateActionable( macro, { ...action, value: content } );
                }}
            />
        </div>
    );
};
