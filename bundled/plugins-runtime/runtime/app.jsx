import React, { useEffect, useRef } from "react";
import { usePluginConfig } from "titan-reactor";

const _screenSelector = (store) => store.screen;

const _style_ErrorCenterText = {
  position: "absolute",
  zIndex: "-999",
  left: "50%",
  top: "50%",
  transform: `translate(-50%, -50%)`,
  cursor: "wait",
  color: "#ffeedd",
  fontFamily: "Conthrax",
};

const GlobalErrorState = ({ error }) => {
  return (
    <div style={_style_ErrorCenterText}>
      <p style={{ fontSize: "150%" }}>Uh oh!</p>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          color: "#aa6677",
          fontSize: "150%",
        }}
      >
        {error}
      </p>
    </div>
  );
};

const Component = ({ id, JSXElement }) => {
  const config = usePluginConfig();
  return (
    <ErrorBoundary key={id}>
      <div style={{ display: config._visible ? "block" : "none" }}>
        <JSXElement />
      </div>
    </ErrorBoundary>
  );
};

const _firstInstall = (store) => store.firstInstall;

const orderSort = (a, b) => {
  return a.order - b.order;
};

export default ({ components, useStore, PluginContext }) => {
  const { screen, error } = useStore(_screenSelector);
  const firstInstall = useStore(_firstInstall);
  const containerDiv = useRef();

  useEffect(() => {
    if (!containerDiv.current) return;

    if (["@home", "@loading"].includes(screen)) {
      containerDiv.current.style.opacity = 1;
    } else {
      let opacity = 0;
      const cancelId = setInterval(() => {
        opacity += 0.025;
        containerDiv.current.style.opacity = Math.min(opacity, 1);
        if (opacity >= 1) {
          clearInterval(cancelId);
        }
      }, 50);
      return () => clearInterval(cancelId);
    }
  }, [screen]);

  const appLoaded = screen !== "@loading";

  const screenFilter = (component) =>
    appLoaded &&
    ["@replay", "@map"].includes(screen) &&
    (component.screen ?? "").includes(screen);

  const renderComponent = (component) => (
    <PluginContext.Provider value={component}>
      <Component key={component.id} {...component} />
    </PluginContext.Provider>
  );

  return (
    <div
      ref={containerDiv}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {error && !firstInstall && <GlobalErrorState error={error} />}

      <div
        id="top-container"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          id="top-left"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {components
            .filter((c) => c.snap === "top-left")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
        <div
          id="top"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          {components
            .filter((c) => c.snap === "top")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
        <div
          id="top-right"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {components
            .filter((c) => c.snap === "top-right")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
      </div>
      <div
        id="left_right"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <div
          id="left"
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            marginBottom: "var(--minimap-height)",
          }}
        >
          {components
            .filter((c) => c.snap === "left")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
        <div
          id="center_container"
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          <div
            id="center"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            {components
              .filter((c) => c.snap === "center")
              .filter(screenFilter)
              .sort(orderSort)
              .map(renderComponent)}
          </div>
          <div
            id="bottom"
            style={{
              display: "flex",
            }}
          >
            {components
              .filter((c) => c.snap === "bottom")
              .filter(screenFilter)
              .sort(orderSort)
              .map(renderComponent)}
          </div>
        </div>
        <div
          id="right"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components
            .filter((c) => c.snap === "right")
            .filter(screenFilter)
            .sort(orderSort)
            .map(renderComponent)}
        </div>
      </div>

      {components
        .filter((c) => c.snap === "loose")
        .filter(screenFilter)
        .sort(orderSort)
        .map(renderComponent)}
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>☠️</>;
    }

    return this.props.children;
  }
}
