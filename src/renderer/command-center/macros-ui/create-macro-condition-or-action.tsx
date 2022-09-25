import { PluginMetaData } from "common/types";

export function CreateMacroConditionOrAction({
  onCreate,
  label,
}: {
  label: string;
  onCreate: () => void;
  pluginsMetadata: PluginMetaData[];
}) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          gridGap: "var(--size-3)",
          alignItems: "center",
          justifyContent: "start",
          maxWidth: "var(--size-md)",
          marginInline: "var(--size-6)",
          marginBottom: "var(--size-9)",
        }}
      >
        <button
          onClick={onCreate}
          style={{
            display: "flex",
            alignItems: "center",

            paddingBlock: "var(--size-1)",
            paddingInline: "var(--size-3)",
          }}
        >
          <i className="material-icons">add</i> {label}
        </button>
      </div>
    </>
  );
}
