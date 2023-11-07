export const EmptySection = ( { label }: { label: string } ) => {
    return (
        <aside
            style={{
                flex: 0,
                display: "flex",
                flexDirection: "column",
                maxHeight: "100vh",
                overflowY: "scroll",
                minWidth: "15rem",
            }}>
            <header style={{ padding: "var(--size-2)" }}>
                <p style={{ fontStyle: "italic" }}>{label}</p>
                <p>None</p>
            </header>
        </aside>
    );
};
