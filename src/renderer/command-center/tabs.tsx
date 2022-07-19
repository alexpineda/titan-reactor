import React, { isValidElement } from "react";

interface TabsProps {
  children: React.ReactNode;
  onChange?: (index: number) => void;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
}
export const Tabs = ({
  children,
  onChange,
  selectedIndex,
  defaultSelectedIndex = 0,
}: TabsProps) => {
  const [internalSelectedIndex, setInternalSelectedIndex] =
    React.useState(defaultSelectedIndex);

  const actualSelectedIndex =
    selectedIndex !== undefined ? selectedIndex : internalSelectedIndex;

  return (
    <div>
      <div style={{ display: "flex" }}>
        {React.Children.map(children, (child, index) => {
          if (!isValidElement(child)) {
            return null;
          }
          const active = index === actualSelectedIndex;

          return (
            <div
              style={{
                padding: "var(--size-2)",
                cursor: "pointer",
                borderBottom: `2px solid ${
                  active ? "var(--blue-5)" : "transparent"
                }`,
                marginLeft: "var(--size-2)",
              }}
              onClick={() => {
                setInternalSelectedIndex(index);
                onChange && onChange(index);
              }}
            >
              {/*@ts-ignore  */}
              {child.props.label}
            </div>
          );
        })}
      </div>
      {React.Children.map(children, (child, index) => {
        if (index !== actualSelectedIndex) {
          return null;
        }
        return child;
      })}
    </div>
  );
};

interface TabProps {
  children: React.ReactNode;
  label: string;
}
export const Tab = ({ children }: TabProps) => {
  return <>{children}</>;
};
