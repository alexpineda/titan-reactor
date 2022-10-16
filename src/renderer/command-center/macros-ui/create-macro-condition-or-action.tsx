import { PluginMetaData } from "common/types";

export function CreateMacroConditionOrAction( {
    onCreate,
    label,
}: {
    label: string;
    onCreate: () => void;
    pluginsMetadata: PluginMetaData[];
} ) {
    return (
        <button
            onClick={onCreate}
            style={{
                display: "flex",
                alignItems: "center",

                paddingBlock: "var(--size-1)",
                paddingInline: "var(--size-3)",
            }}>
            <i className="material-icons">add</i> {label}
        </button>
    );
}
