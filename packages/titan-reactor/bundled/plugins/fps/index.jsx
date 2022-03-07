import React, { useRef, useEffect } from "react";
import { registerComponent, useStore } from "titan-reactor";

registerComponent(
  { pluginId: "_plugin_id_", screen: "@replay/ready", snap: "top" },
  ({ config }) => {
    const fpsElRef = useRef();

    /**
     * Efficient update example:
     * Use the store subscribe function for transient updates, skipping the vdiff.
     * https://github.com/pmndrs/zustand#transient-updates-for-often-occuring-state-changes
     */
    useEffect(
      () =>
        useStore.subscribe((state) => {
          if (
            fpsElRef.current &&
            state.frame &&
            fpsElRef.current.textContent !== state.frame.fps
          ) {
            fpsElRef.current.textContent = state.frame.fps;
          }
        }),
      []
    );

    return (
      <p
        ref={fpsElRef}
        style={{ fontSize: config.fontSize.value, color: "white" }}
      ></p>
    );
  }
);
