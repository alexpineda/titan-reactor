import { useState } from "react";
import { WorldEventTrigger } from "@macros/world-event-trigger";
import { useMacroStore } from "./use-macros-store";

export const CreateMacro = ( { onCreated }: { onCreated: ( id: string ) => void } ) => {
    const [name, setName] = useState( "" );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { createMacro } = useMacroStore();

    return (
        <div
            style={{
                padding: "var(--size-3)",
            }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gridGap: "var(--size-3)",
                    alignItems: "center",
                    justifyContent: "end",
                }}>
                <label>
                    Name:
                    <input
                        type="text"
                        onChange={( e ) => setName( e.target.value )}
                        value={name}
                    />
                </label>

                <button
                    onClick={async () => {
                        if ( name.trim() === "" ) {
                            return;
                        }
                        const id = await createMacro( name, new WorldEventTrigger() );
                        onCreated( id );
                        setName( "" );
                    }}>
                    + Macro
                </button>
            </div>
        </div>
    );
};
