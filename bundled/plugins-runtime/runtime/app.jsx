import React, { useState, useEffect, useRef } from "react";
import { useStore, PluginContext } from "titan-reactor";
import { Home } from "./home.jsx";

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
  display: "flex",
  alignItems: "center",
};

const loadingSvg = (
  <svg width="205.245" height="230.766" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M.42 222.56c1.903-14.069 2.738-16.47 5.723-16.47 2.455 0 2.713 1.73 1.611 10.824-1.518 12.522-1.986 13.647-5.68 13.647-2.133 0-2.497-1.763-1.653-8zm12.14 4.499c0-1.926.52-7.3 1.156-11.94l1.157-8.44 8.249-.124c4.537-.068 8.715.629 9.284 1.55.574.929 2.558.72 4.462-.468 6.069-3.79 9.574-.644 9.574 8.593 0 10.206-1.429 14.33-4.964 14.33-2.027 0-2.55-2.269-2.151-9.33.866-15.334-3.563-12.694-6.97 4.154-.62 3.07-2.279 5.177-4.076 5.177-2.542 0-2.832-1.495-1.8-9.272 2.092-15.769-4.28-13.802-7.17 2.213-1.319 7.3-6.751 10.163-6.751 3.557zm38.398-.08c.452-1.653 1.376-7.877 2.053-13.83l1.231-10.824H28.695c-21.065 0-25.547-.479-25.547-2.73 0-1.501 1.067-3.407 2.371-4.235 1.304-.828 4.704-5.105 7.556-9.505 2.852-4.4 5.647-8 6.21-8 1.088 0 .666.813-5.952 11.458-5.605 9.015-3.639 12.199 6.073 9.834 5.987-1.458 7.189-2.515 6.805-5.986-.715-6.46 4.737-15.694 8.564-14.504 1.758.547 4.412.231 5.899-.702 2.24-1.405 2.28-2.204.24-4.663-2.003-2.413-2.008-2.967-.027-2.967 1.34 0 3.83-1.263 5.537-2.807 4.213-3.813 11.215-.457 16.79 8.049 2.547 3.885 5.206 5.967 6.825 5.346 1.46-.56 3.833.667 5.276 2.727 4.514 6.445 13.694 7.839 22.395 3.4 10.258-5.233 43.256-8.663 50.206-5.218 4.38 2.17 2.662 2.567-16.768 3.871-24.755 1.662-33.756 3.763-38.479 8.982-3.226 3.564-3.135 3.731 2.988 5.493 5.044 1.452 2.054 1.852-14.862 1.988-16.797.134-21.177.713-21.177 2.8 0 1.748 1.965 2.537 5.859 2.353 9.66-.458 12.018 8.579 4.809 18.435-3.563 4.871-20.621 5.962-19.328 1.236zm15.416-6.767c.649-2.586.634-6.125-.034-7.864-1.05-2.736-1.567-2.8-3.843-.475-1.447 1.478-3.202 5.017-3.9 7.864-1.079 4.4-.68 5.176 2.664 5.176 2.624 0 4.325-1.564 5.113-4.701zm14.42 9.102c-1.293-.522-2.352-4.12-2.352-7.994 0-8.86 6.152-15.23 14.71-15.23 5.724 0 5.996.336 5.996 7.407 0 10.305-3.112 18.066-6.212 15.494-1.508-1.252-3.4-1.338-5.145-.234-3.026 1.914-3.534 1.954-6.996.557zm8.56-6.764c2.62-3.156 4.94-12.695 3.087-12.695-3.252 0-8.352 6.5-8.352 10.644 0 4.853 2.222 5.718 5.265 2.051zm18.241 6.091c-.652-1.056-1.406-6.35-1.675-11.765-.505-10.152 2.776-18.315 7.36-18.315 1.324 0 2.894-1.271 3.49-2.824 1.484-3.867 10.01-3.567 12.248.431 1.726 3.085 2.009 3.085 5.418 0 4.637-4.196 19.3-4.551 19.3-.467 0 3.545-4.82 4.619-23.378 5.21-9.899.314-15.17 1.264-15.687 2.826-.428 1.294.563 2.353 2.202 2.353 4.096 0 3.737 2.387-.784 5.21-4.155 2.595-5.28 12.795-1.55 14.038 2.85.95.267 5.223-3.156 5.223-1.43 0-3.135-.864-3.788-1.92zm17.435-.114c-4.627-2.695-4.346-13.856.47-18.672 4.417-4.416 11.76-4.918 14.991-1.024 3.006 3.622 1.012 6.469-6.825 9.743-7.106 2.97-6.69 7.216.57 5.828 6.361-1.216 7.574 2.012 1.608 4.28-6.001 2.282-6.647 2.272-10.814-.155zm9.53-16.672c.47-1.412-.236-2.118-1.648-1.647-1.358.453-2.84 1.935-3.294 3.294-.47 1.412.236 2.117 1.647 1.647 1.36-.453 2.842-1.935 3.295-3.294zm11.713 15.065c-2.99-5.588-2.378-8.736 2.924-15.038 3.759-4.467 6.404-5.792 11.563-5.792h6.689l-1.214 11.612c-1.362 13.033-1.953 14.261-5.458 11.352-1.566-1.3-3.465-1.408-5.222-.297-4.278 2.706-7.156 2.136-9.282-1.837zm10.725-4.36c2.708-3.46 4.152-10.672 2.36-11.78-2.58-1.594-7.504 4.68-7.504 9.562 0 4.974 2.234 5.938 5.144 2.219zm14.7-2.655c.733-6.045 1.698-11.392 2.144-11.882 1.643-1.802 14.603-1.708 16.81.123 1.533 1.273 2.677 1.246 3.498-.082.671-1.086 3.328-1.974 5.905-1.974 4.55 0 4.668.336 4.124 11.746-.445 9.314-1.227 11.873-3.78 12.359-2.811.535-3.077-.6-2.091-8.922.756-6.384.442-9.536-.95-9.536-3.036 0-5.975 6.42-5.975 13.053 0 4.47-.829 5.77-3.676 5.77-3.305 0-3.563-.95-2.561-9.411.73-6.174.415-9.412-.92-9.412-2.842 0-4.682 3.473-5.94 11.21-.712 4.379-2.24 6.856-4.5 7.29-3.11.6-3.3-.34-2.088-10.332zm-100.205-43.95c-2.27-.915-5.497-3.756-7.174-6.314-3.147-4.803-2.694-8.726 3.153-27.299 1.9-6.039 2.339-6.29 9.333-5.352 5.841.784 7.718.277 9.194-2.481 2.852-5.33 2.458-6.245-6.682-15.517-7.275-7.379-8.36-9.442-7.345-13.957 2.68-11.908 13.17-20.172 15.293-12.05 1.188 4.54 3.855 4.9 8.762 1.182 2.361-1.79 3.677-5.672 4.127-12.176.627-9.075-1.712-12.922-4.09-6.725-.596 1.553-2.79 2.824-4.877 2.824-3.5 0-3.578-.323-1.008-4.194 1.532-2.307 4.897-5.484 7.479-7.06 2.581-1.575 6.947-4.45 9.702-6.389 3.892-2.739 7.302-3.335 15.29-2.673 6.352.527 10.617.076 11.162-1.18.52-1.201 1.735-.685 2.967 1.26 1.147 1.812 3.417 3.295 5.046 3.295 2.418 0 2.53.517.617 2.823-1.289 1.553-3.399 2.824-4.689 2.824-1.322 0-2.796 3.365-3.38 7.715-.658 4.908-2.493 8.736-5.043 10.522-3.148 2.205-3.541 3.371-1.832 5.43 1.745 2.103 1.11 3.013-3.204 4.587-13.136 4.794-15.37 6.155-17.391 10.591-1.949 4.276-1.438 5.388 5.556 12.108 8.213 7.89 9.541 8.398 14.72 5.627 4.664-2.496 17.493 2.239 19.746 7.287 1.296 2.905.921 5.869-1.342 10.616-4.605 9.655-3.943 9.836 4.1 1.124 7.25-7.853 13.465-10.221 13.465-5.13 0 4.789 3.919 5.328 8.365 1.152l4.321-4.06 1.06 4.052c.588 2.249 1.956 3.498 3.074 2.807 1.268-.784 1.766.367 1.345 3.104-.564 3.66-1.834 4.37-8.006 4.471-4.035.067-10.617 1.226-14.628 2.577-11.061 3.723-60.059 5.792-61.978 2.617-2.399-3.97-6.862-2.895-9.19 2.215-1.18 2.588-2.855 4.706-3.724 4.706-.87 0-1.58 1.723-1.58 3.83 0 3.248.573 3.525 3.764 1.817 4.84-2.59 4.753-1.185-.354 5.723-4.265 5.769-7.091 6.503-14.124 3.67zm8.831-13.16c0-1.034-1.32-1.881-2.934-1.881s-2.411.847-1.772 1.882c.64 1.035 1.96 1.882 2.935 1.882.974 0 1.771-.847 1.771-1.882zm5.647-13.039c0-.96-2.33-3.582-5.176-5.827-4.527-3.568-5.255-3.692-5.803-.987-.344 1.701.395 4.323 1.643 5.827 2.506 3.02 9.336 3.742 9.336.987zm52.706-11.43c0-1.036-.373-1.883-.83-1.883-.456 0-1.354.847-1.993 1.882-.64 1.036-.267 1.883.83 1.883 1.096 0 1.993-.847 1.993-1.883zm-4.907-2.978c2.011-5.242 1.227-10.2-1.615-10.2-3.023 0-6.654 5.583-6.654 10.23 0 3.856 6.787 3.83 8.269-.03zM91.618 110.83c0-3.01-4.848-3.554-6.588-.74-.64 1.035-.663 2.692-.05 3.683 1.548 2.505 6.638.248 6.638-2.943zm33.883-30.028c0-1.614-.861-2.402-1.913-1.752-1.053.65-1.426 1.971-.83 2.935 1.613 2.61 2.743 2.124 2.743-1.183zm5.647-11.071c0-.457-.847-1.354-1.883-1.994-1.035-.64-1.882-.266-1.882.83 0 1.097.847 1.994 1.882 1.994 1.036 0 1.883-.374 1.883-.83zm64.607 95.888c.679-4.14 1.243-10.282 1.254-13.647.026-7.538 4.898-8.387 7.585-1.321 2.111 5.553-1.122 15.126-6.644 19.674-3.241 2.67-3.36 2.414-2.195-4.706zm-41.827-42.884c4.163-2.796 6.604-6.082 6.992-9.412.327-2.813 1.72-5.115 3.093-5.115 4.499 0 6.718-11.758 2.689-14.248-1.151-.711-2.76-.214-3.575 1.104-.815 1.32-2.891 1.857-4.614 1.196-4.941-1.896-1.436-4.994 5.651-4.994 7.226 0 9.17 3.683 8.064 15.27-.378 3.948.427 7.188 2.112 8.504 2.289 1.789 1.84 2.9-2.824 7-4.32 3.796-7.581 4.885-14.764 4.932l-9.22.06zm29.287-18.7c-.633-5.348-.703-10.172-.154-10.72 1.924-1.925 4.5 4.608 4.529 11.487.044 10.7-3.082 10.152-4.375-.766zm-40.721-9.882c-2.052-2.473-1.665-2.887 2.698-2.887 3.095 0 4.8.877 4.348 2.236-1.17 3.508-4.425 3.81-7.046.65zm-25.1-85.855c1.87-3.185 4.604-6.785 6.074-8 1.47-1.214.299 1.392-2.603 5.792-6.093 9.239-8.496 10.768-3.47 2.208z"
      fill="#fff"
    />
  </svg>
);

export default ({ components }) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const { screen, error } = useStore(_screenSelector);
  const firstInstall = useStore(_firstInstall);
  const containerDiv = useRef();

  useEffect(() => {
    if (!containerDiv.current) return;

    let opacity = 0;
    const cancelId = setInterval(() => {
      opacity += 0.025;
      containerDiv.current.style.opacity = Math.min(opacity, 1);
      if (opacity >= 1) {
        clearInterval(cancelId);
      }
    }, 50);

    return () => clearInterval(cancelId);
  }, [screen]);

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
    !screen.startsWith("@home") &&
    (component.screen === undefined || component.screen === screen);

  const homeComponentsFilter = ({ component }) =>
    appLoaded && screen === "@home/ready" && component.screen === screen;

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
      {!appLoaded && !error && !firstInstall && (
        <div style={styleCenterText}>{loadingSvg}</div>
      )}
      {!appLoaded && firstInstall && (
        <div style={styleCenterText}>
          {firstInstall && (
            <p style={{ fontSize: "var(--font-size-6)" }}>
              Installing Default Plugins...
            </p>
          )}
        </div>
      )}
      {error && !firstInstall && <GlobalErrorState error={error} />}

      {screen === "@home/ready" && appLoaded && !error && (
        <Home
          components={
            components["loose"]
              ? components["loose"]
                  .filter(homeComponentsFilter)
                  .sort(orderSort)
                  .map(({ JSXElement, component }) => (
                    <PluginContext.Provider value={component}>
                      <Component
                        key={component.id}
                        component={component}
                        JSXElement={JSXElement}
                      />
                    </PluginContext.Provider>
                  ))
              : []
          }
        />
      )}

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
            marginTop: screen === "@home/ready" ? "200px" : "0",
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
          marginLeft: screen === "@home/ready" ? "600px" : "0",
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
