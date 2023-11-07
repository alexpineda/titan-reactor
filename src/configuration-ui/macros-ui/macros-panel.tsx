import { useState } from "react";
import ErrorBoundary from "../error-boundary";
import { MacroPanel } from "./macro-panel";
import { CreateMacro } from "./create-macro";
import { TreeList } from "./treelist";
import { useStore } from "zustand";

export const MacrosPanel = () => {
    const plugins = useStore( window.deps.usePluginsStore );
    
    const {
        macros: { macros },
    } = useStore(window.deps.useMacroStore);
    const [ selectedMacroId, selectMacroId ] = useState<string | null>(
        macros[0]?.id ?? null
    );

    return (
        <div>
            <p style={{
                color: "var(--yellow-7)",
                padding: "var(--size-4)"
            }}>Warning: The macro system is likely to change entirely in the near future.</p>
            <ErrorBoundary message="There was an error with Macros.">
                <div
                    style={{
                        display: "flex",
                    }}>
                    <aside
                        style={{
                            minWidth: "30%",
                        }}>
                        <CreateMacro onCreated={selectMacroId} />
                        <TreeList
                            macros={macros}
                            selected={selectedMacroId}
                            onSelect={selectMacroId}
                        />
                    </aside>
                    <main style={{ flex: 1 }}>
                        {macros.find( ( m ) => m.id === selectedMacroId ) && (
                            <MacroPanel
                                key={selectedMacroId}
                                macro={macros.find( ( m ) => m.id === selectedMacroId )!}
                                pluginsMetadata={plugins.enabledPlugins}
                            />
                        )}
                    </main>
                </div>
            </ErrorBoundary>
        </div>
    );
};
