export const LeftListItem = ({
  label,
  name,
  index,
  onClick,
}: {
  label: string;
  name: string;
  index: number;
  onClick: () => void;
}) => {
  return (
    <p
      style={{
        fontSize: "var(--font-size-2)",
        marginTop: "var(--size-4)",
        marginBottom: "var(--size-1)",
        color: "var(--blue-8)",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <span>{name}</span>
      <span
        style={{
          fontSize: "var(--font-size-1)",
          color: "var(--gray-6)",
          marginLeft: "var(--size-2)",
          marginRight: "var(--size-1)",
          borderRadius: "var(--border-size-1)",
        }}
        aria-label={`${label} #${index}`}
        data-balloon-pos="down"
      >
        {index}
      </span>
    </p>
  );
};
