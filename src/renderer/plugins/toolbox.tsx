import create from "zustand";

export interface ToolboxState {
    activeTool: string;
    tools: string[];
}

export const useToolboxStore = create<ToolboxState>( () => ( {
    activeTool: "select",
    tools: [],
} ) );

const Tool = ( { toolId, active }: { toolId: string; active: boolean } ) => {
    return <div style={{ color: active ? "red" : "black" }}>{toolId}</div>;
};

// default controls = scene controller, select units

export const Toolbox = () => {
    const { activeTool, tools } = useToolboxStore();
    return (
        <div>
            <h1>Toolbox</h1>
            {tools.map( ( tool ) => (
                <Tool key={tool} active={activeTool === tool} toolId={tool} />
            ) )}
        </div>
    );
};
