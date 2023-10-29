// @ts-nocheck
import "./style.css";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { GlobalSettingsConfiguration } from "./global-settings-configuration";
import { Tab, Tabs } from "./tabs";

// import { MacrosPanel } from "./macros-ui/macros-panel";
import { PluginsConfiguration } from "./plugins-configuration";
import { Helmet } from "react-helmet";

document.title = "Configuration";

const s = document.createElement( "link" );
s.rel = "stylesheet";
s.href = "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";
document.head.appendChild( s );

const CommandCenter = () => {
    const [ banner, setBanner ] = useState( "" );

    const [ mainTabIndex, setMainTabIndex ] = useState( 0 );

    useEffect( () => {
        if ( banner ) {
            const t = setTimeout( () => setBanner( "" ), 5000 );
            return () => clearTimeout( t );
        }
    }, [ banner ] );

    return (
        <>
            <Helmet>
                <link
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                    rel="stylesheet"
                />
            </Helmet>
            <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "32px" }}>Titan Reactor - Configuration</p>
                {banner && <p className="mui--bg-accent mui--text-light">{banner}</p>}
                <Tabs
                    onChange={( index: number ) => setMainTabIndex( index )}
                    selectedIndex={mainTabIndex}>
                    <Tab label="Global Settings">
                        <GlobalSettingsConfiguration />
                    </Tab>
                    <Tab label="Plugins">
                        <PluginsConfiguration setBanner={setBanner} />
                    </Tab>
                    {/* <Tab label="Macros">
                        <MacrosPanel />
                    </Tab> */}
                </Tabs>
            </div>
        </>
    );
};

const container = document.getElementById( "app" );
const root = createRoot( container! );

window.opener.postMessage( {
    type: "connect",
} );

window.addEventListener( "message", ( event ) => {
    if ( event.data.type === "connected" ) {
        console.log( "connected", window.deps.useSettingsStore.getState() );
        window.deps.useSettingsStore.subscribe( ( state ) => {
            console.log( "state", state );
        } );
        root.render( <CommandCenter /> );
    }
} );
