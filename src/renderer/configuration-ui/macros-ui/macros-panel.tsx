import { useState } from "react";
import ErrorBoundary from "../error-boundary";
import { MacroPanel } from "./macro-panel";
import { CreateMacro } from "./create-macro";
import { useSettingsStore } from "@stores/settings-store";
import { useMacroStore } from "./use-macros-store";
import { TreeList } from "./treelist";

export const MacrosPanel = () => {
    const settings = useSettingsStore();
    const {
        macros: { macros },
    } = useMacroStore();
    const [ selectedMacroId, selectMacroId ] = useState<string | null>(
        macros[0]?.id ?? null
    );

    return (
        <div>
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
                                pluginsMetadata={settings.activatedPlugins}
                            />
                        )}
                    </main>
                </div>
            </ErrorBoundary>
        </div>
    );
};
