import { LevaPanel } from "leva";
import { StoreType } from "leva/dist/declarations/src/types";

export const createLevaPanel = ( store: StoreType ) => {
    return (
        <LevaPanel
            store={store}
            fill
            flat
            hideCopyButton
            titleBar={false}
            theme={{
                colors: {
                    accent1: "blue",
                    accent2: "orange",
                    accent3: "red",
                    elevation1: "red",
                    elevation2: "#f5f5f5",
                    elevation3: "#d9e0f0",
                    highlight1: "black",
                    highlight2: "#222",
                    highlight3: "#333",
                    vivid1: "red",
                },
                sizes: {
                    controlWidth: "40vw",
                },
                fontSizes: {
                    root: "14px",
                },
            }}
        />
    );
};
