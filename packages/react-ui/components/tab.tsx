import React from "react";

import Visible from "./visible";

export const Tab = ({
  tabName,
  activeTab,
  children,
  className = "",
}: {
  tabName: string;
  activeTab: string;
  children?: React.ReactNode;
  className?: string;
}) => (
  <Visible visible={tabName === activeTab}>
    <div
      className={`tab-content divide-y-8 divide-transparent leading-relaxed ${className}`}
    >
      {children}
    </div>
  </Visible>
);

export default Tab;
