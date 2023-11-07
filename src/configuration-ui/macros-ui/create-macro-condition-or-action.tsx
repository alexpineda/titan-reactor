
export function CreateMacroConditionOrAction( {
    onCreate,
    label,
}: {
    label: string;
    onCreate: () => void;
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
