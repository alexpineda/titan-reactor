import {
    MacroAction,
    MacroActionSequence,
    MacroDTO,
    PluginMetaData,
} from "common/types";
import { ActionablePanel } from "./actionable-panel";

const colors = [
    "--blue-3",
    "--yellow-3",
    "--green-3",
    "--red-3",
    "--purple-3",
    "--orange-3",
    "--pink-3",
];

export const ActionableGroupPanel = ( {
    groupId,
    actions,
    macro,
    pluginsMetadata,
    index,
}: {
    groupId: string;
    macro: MacroDTO;
    actions: MacroAction[];
    pluginsMetadata: PluginMetaData[];
    index: number;
} ) => {
    return (
        <div
            className="hover"
            style={{
                margin: "var(--size-5)",
                order: groupId,
                position: "relative",
            }}>
            <div
                style={{
                    padding: "var(--size-0)",
                    borderLeft:
                        macro.actionSequence === MacroActionSequence.AllSync
                            ? `3px solid var(${colors[0]})`
                            : `3px solid var(${colors[index % colors.length]})`,
                }}>
                {actions.map( ( action, index ) => (
                    <ActionablePanel
                        macro={macro}
                        index={index}
                        key={action.id}
                        action={action}
                        pluginsMetadata={pluginsMetadata}
                    />
                ) )}
            </div>
        </div>
    );
};
