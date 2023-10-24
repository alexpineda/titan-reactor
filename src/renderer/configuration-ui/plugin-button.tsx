export interface PluginButtonProps {
    icon: React.ReactElement | null;
    description?: string;
    isSelected: boolean;
    onClick: () => void;
    isDisabled?: boolean;
    isOnline?: boolean;
}

export const PluginButton = ( {
    icon,
    description,
    isSelected,
    onClick,
    isDisabled = false,
}: PluginButtonProps ) => {
    return (
        <button
            onClick={onClick}
            style={{
                position: "relative",
                textAlign: "left",
                color: isDisabled
                    ? "var(--gray-5)"
                    : isSelected
                    ? "var(--gray-9)"
                    : "var(--gray-7)",
            }}>
            {icon}
            {description}{" "}
        </button>
    );
};
