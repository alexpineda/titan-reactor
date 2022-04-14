import React, { useState, useEffect } from "react";
import { useStore, usePluginConfig } from "titan-reactor";
const _screenSelector = (store) => store.screen;

const _style_ErrorCenterText = {
  position: "absolute",
  zIndex: "-999",
  left: "50%",
  top: "50%",
  transform: `translate(-50%, -50%)`,
  transition: "all 3s ease-out",
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

const Component = ({ component, JSXElement, useMessage, sendMessage }) => {
  const config = usePluginConfig(component.pluginId);

  return (
    <ErrorBoundary key={component.id}>
      <JSXElement
        config={config}
        useMessage={useMessage}
        sendMessage={sendMessage}
      />
    </ErrorBoundary>
  );
};

const _firstInstall = (store) => store.firstInstall;
export default ({ components }) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const { screen, error } = useStore(_screenSelector);
  const firstInstall = useStore(_firstInstall);

  useEffect(() => {
    if (!appLoaded && screen !== "@home/loading") {
      setAppLoaded(true);
    }
  }, [screen]);

  const screenFilter = ({ component }) =>
    appLoaded &&
    (component.screen === undefined || component.screen === screen);

  const styleCenterText = {
    position: "absolute",
    zIndex: "-999",
    left: "50%",
    top: "50%",
    cursor: "wait",
    color: "#ffeedd",
    fontFamily: "Conthrax",
  };

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
      {!hasAnyComponents && !error && (
        <div style={styleCenterText}>
          <p>암흑 물질</p>
          {firstInstall && (
            <p style={styleCenterText}>
              Installing Default Plugins and Restarting.
            </p>
          )}
        </div>
      )}
      {error && <GlobalErrorState error={error} />}
      <div
        id="top-container"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexGrow: 1,
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
              .map(({ JSXElement, component, useMessage, sendMessage }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
                  useMessage={useMessage}
                  sendMessage={sendMessage}
                />
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
              .map(({ JSXElement, component, useMessage, sendMessage }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
                  useMessage={useMessage}
                  sendMessage={sendMessage}
                />
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
              .map(({ JSXElement, component, useMessage, sendMessage }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
                  useMessage={useMessage}
                  sendMessage={sendMessage}
                />
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
          }}
        >
          {components["left"] &&
            components["left"]
              .filter(screenFilter)
              .map(({ JSXElement, component, useMessage, sendMessage }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
                  useMessage={useMessage}
                  sendMessage={sendMessage}
                />
              ))}
        </div>
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
              .map(({ JSXElement, component, useMessage, sendMessage }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
                  useMessage={useMessage}
                  sendMessage={sendMessage}
                />
              ))}
        </div>
        <div
          id="right"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {components["right"] &&
            components["right"]
              .filter(screenFilter)
              .map(({ JSXElement, component, useMessage, sendMessage }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
                  useMessage={useMessage}
                  sendMessage={sendMessage}
                />
              ))}
        </div>
      </div>
      <div
        id="bottom"
        style={{ height: "var(--minimap-height)", display: "flex" }}
      >
        {components["bottom"] &&
          components["bottom"]
            .filter(screenFilter)
            .map(({ JSXElement, component, useMessage, sendMessage }) => (
              <Component
                key={component.id}
                component={component}
                JSXElement={JSXElement}
                useMessage={useMessage}
                sendMessage={sendMessage}
              />
            ))}
      </div>
      {components["loose"] &&
        components["loose"]
          .filter(screenFilter)
          .map(({ JSXElement, component, useMessage, sendMessage }) => (
            <Component
              key={component.id}
              component={component}
              JSXElement={JSXElement}
              useMessage={useMessage}
              sendMessage={sendMessage}
            />
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
