
type ButtonProps = {
    children: React.ReactNode;
    color?: string;
    background?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
};

export const InGameMenuButton = ( { children, background, color, onClick, style }: ButtonProps ) => {
    return (
        <div
            onClick={onClick}
            style={{
                color,
                background,
                padding: "4px 8px",
                border: "none",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                userSelect: "none",
                pointerEvents: "all",
                ...style,
            }}>
            {children}
        </div>
    );
};