import React, { useState, useEffect } from "react";
import { useStore, PluginContext } from "titan-reactor";
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

const Component = ({ component, JSXElement }) => {
  return (
    <ErrorBoundary key={component.id}>
      <JSXElement />
    </ErrorBoundary>
  );
};

const _firstInstall = (store) => store.firstInstall;

const orderSort = (a, b) => {
  return a.component.order - b.component.order;
};

const styleCenterText = {
  position: "absolute",
  zIndex: "-999",
  left: "50%",
  top: "50%",
  transform: `translate(-50%, -50%)`,
  cursor: "wait",
  color: "#ffeedd",
  fontFamily: "Conthrax",
  animation: "var(--animation-blink) forwards",
  animationDuration: "10s",
};

export default ({ components }) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const { screen, error } = useStore(_screenSelector);
  const firstInstall = useStore(_firstInstall);

  useEffect(() => {
    if (!appLoaded && screen !== "@home/loading") {
      setAppLoaded(true);
    }

    if (screen.startsWith("@home")) {
      document.body.style.backdropFilter =
        "blur(20px) grayscale(0.2) contrast(0.5) brightness(0.5)";
      document.body.style.background =
        "url(./runtime/logo.png) center center / cover";
    } else {
      document.body.style.backdropFilter = "";
      document.body.style.background = "";
    }
  }, [screen]);

  const screenFilter = ({ component }) =>
    appLoaded &&
    (component.screen === undefined || component.screen === screen);

  const hasAnyComponents = Object.keys(components).reduce((acc, key) => {
    return acc || Boolean(components[key]);
  }, false);

  return (
    <div
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
      {(!hasAnyComponents || !appLoaded) && !error && (
        <div style={styleCenterText}>
          <p style={{ fontSize: "var(--font-size-8)" }}>Loading...</p>
          {firstInstall && <p>Installing Default Plugins and Restarting.</p>}
        </div>
      )}
      {error && <GlobalErrorState error={error} />}

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
          {components["top-left"] &&
            components["top-left"]
              .filter(screenFilter)
              .sort(orderSort)
              .map(({ JSXElement, component }) => (
                <PluginContext.Provider value={component}>
                  <Component
                    key={component.id}
                    component={component}
                    JSXElement={JSXElement}
                  />
                </PluginContext.Provider>
              ))}
        </div>
        <div
          id="top"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          {components["top"] &&
            components["top"]
              .filter(screenFilter)
              .sort(orderSort)
              .map(({ JSXElement, component }) => (
                <PluginContext.Provider value={component}>
                  <Component
                    key={component.id}
                    component={component}
                    JSXElement={JSXElement}
                  />
                </PluginContext.Provider>
              ))}
        </div>
        <div
          id="top-right"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {components["top-right"] &&
            components["top-right"]
              .filter(screenFilter)
              .sort(orderSort)
              .map(({ JSXElement, component }) => (
                <PluginContext.Provider value={component}>
                  <Component
                    key={component.id}
                    component={component}
                    JSXElement={JSXElement}
                  />
                </PluginContext.Provider>
              ))}
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
          {components["left"] &&
            components["left"]
              .filter(screenFilter)
              .sort(orderSort)
              .map(({ JSXElement, component }) => (
                <PluginContext.Provider value={component}>
                  <Component
                    key={component.id}
                    component={component}
                    JSXElement={JSXElement}
                  />
                </PluginContext.Provider>
              ))}
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
            {components["center"] &&
              components["center"]
                .filter(screenFilter)
                .sort(orderSort)
                .map(({ JSXElement, component }) => (
                  <PluginContext.Provider value={component}>
                    <Component
                      key={component.id}
                      component={component}
                      JSXElement={JSXElement}
                    />
                  </PluginContext.Provider>
                ))}
          </div>
          <div
            id="bottom"
            style={{
              display: "flex",
              marginLeft: "var(--minimap-width)",
            }}
          >
            {components["bottom"] &&
              components["bottom"]
                .filter(screenFilter)
                .sort(orderSort)
                .map(({ JSXElement, component }) => (
                  <PluginContext.Provider value={component}>
                    <Component
                      key={component.id}
                      component={component}
                      JSXElement={JSXElement}
                    />
                  </PluginContext.Provider>
                ))}
          </div>
        </div>
        <div
          id="right"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components["right"] &&
            components["right"]
              .filter(screenFilter)
              .sort(orderSort)
              .map(({ JSXElement, component }) => (
                <PluginContext.Provider value={component}>
                  <Component
                    key={component.id}
                    component={component}
                    JSXElement={JSXElement}
                  />
                </PluginContext.Provider>
              ))}
        </div>
      </div>

      {components["loose"] &&
        components["loose"]
          .filter(screenFilter)
          .sort(orderSort)
          .map(({ JSXElement, component }) => (
            <PluginContext.Provider value={component}>
              <Component
                key={component.id}
                component={component}
                JSXElement={JSXElement}
              />
            </PluginContext.Provider>
          ))}
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
