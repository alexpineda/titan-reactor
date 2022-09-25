import { useState } from "react";
import ErrorBoundary from "../error-boundary";
import { MacroPanel } from "./macro-panel";
import { CreateMacro } from "./create-macro";
import { useSettingsStore } from "@stores/settings-store";
import groupBy from "lodash.groupby";
import { useMacroStore } from "./use-macros-store";

export const MacrosPanel = () => {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const settings = useSettingsStore();
  const {
    macros: { macros },
  } = useMacroStore();

  const [activeAction, _setActiveAction] = useState<string | null>(null);

  const setActiveAction = (id: string) => {
    if (activeAction === id) {
      _setActiveAction(null);
    } else {
      _setActiveAction(id);
    }
  };

  return (
    <div>
      <ErrorBoundary message="There was an error with Macros.">
        <CreateMacro />
        <div>
          {Object.entries(
            groupBy(macros, (m) => {
              const s = m.name.split(":");
              return s.length === 1 ? "General" : s[0].trim();
            })
          ).map(([groupName, macros]) => (
            <div
              key={groupName}
              style={{
                margin: "var(--size-7)",
              }}
            >
              {groupName && (
                <div
                  onClick={() => {
                    if (collapsedGroups.includes(groupName)) {
                      setCollapsedGroups(
                        collapsedGroups.filter((g) => g !== groupName)
                      );
                    } else {
                      setCollapsedGroups([...collapsedGroups, groupName]);
                    }
                  }}
                  style={{
                    color: "var(--gray-6)",
                    display: "flex",
                    alignItems: "center",
                    position: "sticky",
                  }}
                >
                  <i
                    className="material-icons"
                    style={{
                      fontSize: "var(--font-size-3)",
                      marginRight: "var(--size-2)",
                    }}
                  >
                    folder
                  </i>
                  <span>{groupName}</span>
                  {collapsedGroups.includes(groupName) && (
                    <ul>
                      {macros.map((macro) => (
                        <li key={macro.id}>{macro.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {!collapsedGroups.includes(groupName) &&
                macros.map((macro) => (
                  <MacroPanel
                    key={macro.id}
                    macro={macro}
                    pluginsMetadata={settings.enabledPlugins}
                    activeAction={activeAction}
                    setActiveAction={setActiveAction}
                  />
                ))}
            </div>
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
};
