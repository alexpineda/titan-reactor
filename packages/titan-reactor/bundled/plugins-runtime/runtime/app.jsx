import React, { useState, useEffect } from "react";
import { useStore, useConfig } from "titan-reactor";
const _screenSelector = (store) => store.screen;

const Component = ({ component, JSXElement }) => {
  const config = useConfig((store) => store[component.pluginId]);

  return (
    <ErrorBoundary key={component.id}>
      <JSXElement config={config} />
    </ErrorBoundary>
  );
};

export default ({ components }) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const screen = useStore(_screenSelector);

  useEffect(() => {
    if (!appLoaded && screen === "@home/ready") {
      setAppLoaded(true);
    }
  }, [screen]);

  const screenFilter = ({ component }) =>
    appLoaded &&
    (component.screen === undefined || component.screen === screen);

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
      <div id="top">
        {components["top"] &&
          components["top"]
            .filter(screenFilter)
            .map(({ JSXElement, component }) => (
              <Component
                key={component.id}
                component={component}
                JSXElement={JSXElement}
              />
            ))}
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
              .map(({ JSXElement, component }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
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
              .map(({ JSXElement, component }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
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
              .map(({ JSXElement, component }) => (
                <Component
                  key={component.id}
                  component={component}
                  JSXElement={JSXElement}
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
            .map(({ JSXElement, component }) => (
              <Component
                key={component.id}
                component={component}
                JSXElement={JSXElement}
              />
            ))}
      </div>
      {components["loose"] &&
        components["loose"]
          .filter(screenFilter)
          .map(({ JSXElement, component }) => (
            <Component
              key={component.id}
              component={component}
              JSXElement={JSXElement}
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
