import {
    getAppSettingsInLevaFormat,
    generateAppSettingsFromLevaFormat,
} from "common/get-app-settings-leva-config";
import { useControls, useCreateStore } from "leva";
import { useState } from "react";
import {
    attachOnChangeAndGroupByFolder,
    groupConfigByKey,
} from "./leva-plugins/leva-utils";
import { createWebGLRenderer } from "@render/render-composer";
import deepMerge from "deepmerge";
import { createLevaPanel } from "./create-leva-panel";
import { arrayOverwriteMerge } from "@utils/object-utils";
import { Schema } from "leva/plugin";
import { useStore } from "zustand";

const renderer = createWebGLRenderer();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
const maxSamples = renderer.capabilities.maxSamples;
renderer.dispose();

/**
 * Global App Settings UI
 */
export const GlobalSettingsConfiguration = () => {
    const settings = useStore( window.deps.useSettingsStore );
    const plugins = useStore( window.deps.usePluginsStore );

    const [ state, setState ] = useState(
        getAppSettingsInLevaFormat(
            settings.data,
            plugins.enabledPlugins,
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

                settings.save( newState );
            },
        } )
    );

    const store = useCreateStore();

    useControls( controls as Schema, { store } );

    return createLevaPanel( store );
};
