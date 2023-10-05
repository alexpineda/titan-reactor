import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { useSettingsStore } from "@stores/settings-store";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import {
    getAppSettingsInLevaFormat,
    generateAppSettingsFromLevaFormat,
} from "common/get-app-settings-leva-config";
import { useControls, useCreateStore } from "leva";
import {   useState } from "react";
import { attachOnChangeAndGroupByFolder, groupConfigByKey } from "@utils/leva-utils";
import { createWebGLRenderer } from "@render/render-composer";
import deepMerge from "deepmerge";
import { createLevaPanel } from "./create-leva-panel";
import { arrayOverwriteMerge } from "@utils/object-utils";
import { Schema } from "leva/plugin";

const renderer = createWebGLRenderer();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
const maxSamples = renderer.capabilities.maxSamples;
renderer.dispose();

/**
 * Global App Settings UI
 */
export const GlobalSettings = () => {
    const settings = useSettingsStore();

    const [ state, setState ] = useState(
        getAppSettingsInLevaFormat(
            settings.data,
            settings.enabledPlugins,
            maxAnisotropy,
            window.devicePixelRatio,
            maxSamples
        )
    );

    const controls = groupConfigByKey(
        attachOnChangeAndGroupByFolder( {
            config: state,
            onChange: () => {
                setState( state );

                const newSettings = generateAppSettingsFromLevaFormat( state );

                const newState = deepMerge(
                    Object.assign( {}, settings.data ),
                    newSettings,
                    {
                        arrayMerge: arrayOverwriteMerge,
                    }
                );

                settings.save( newState ).then( ( payload ) => {
                    sendWindow( InvokeBrowserTarget.Game, {
                        type: SendWindowActionType.CommitSettings,
                        payload,
                    } );
                } );
            },
        } )
    );

    const store = useCreateStore();

    useControls( controls as Schema, { store } );

    return createLevaPanel( store );
};
