export const Search = ( {
    search,
    setSearch,
}: {
    search: string;
    setSearch: ( val: string ) => void;
} ) => (
    <div
        style={{
            display: "flex",
            width: "100%",
            zIndex: "10",
            padding: "var(--size-4)",
        }}>
        <section
            style={{
                fontSize: "var(--font-size-1)",
                display: "flex",
                gap: "1rem",
            }}>
            <input
                style={{
                    border: "1px solid var(--gray-1)",
                    width: "100%",
                }}
                type="text"
                placeholder="Search name or #id"
                onChange={( e ) => setSearch( ( e.target as HTMLInputElement ).value )}
                value={search}
            />
            <button type="button" onClick={() => setSearch( "" )}>
                Clear
            </button>
        </section>
    </div>
);
