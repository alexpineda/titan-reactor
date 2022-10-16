import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { useSettingsStore } from "@stores/settings-store";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import {
    getAppSettingsInLevaFormat,
    generateAppSettingsFromLevaFormat,
} from "common/get-app-settings-leva-config";
import { useControls, useCreateStore } from "leva";
import { useState } from "react";
import { attachOnChangeAndGroupByFolder } from "@utils/leva-utils";
import { renderComposer } from "@render/render-composer";
import deepMerge from "deepmerge";
import { createLevaPanel } from "./create-leva-panel";

const overwriteMerge = ( _: any, sourceArray: any ) => sourceArray;

export const GlobalSettings = () => {
    const settings = useSettingsStore();

    const [state, setState] = useState(
        getAppSettingsInLevaFormat(
            settings.data,
            settings.enabledPlugins,
            renderComposer.getWebGLRenderer().capabilities.getMaxAnisotropy(),
            window.devicePixelRatio,
            //@ts-expect-error not in types yet
            renderComposer.getWebGLRenderer().capabilities.maxSamples
        )
    );

    const controls = attachOnChangeAndGroupByFolder( {
        config: state,
        groupByFolder: false,
        onChange: () => {
            setState( state );

            const newSettings = generateAppSettingsFromLevaFormat( state );

            const newState = deepMerge( Object.assign( {}, settings.data ), newSettings, {
                arrayMerge: overwriteMerge,
            } );

            settings.save( newState ).then( ( payload ) => {
                sendWindow( InvokeBrowserTarget.Game, {
                    type: SendWindowActionType.CommitSettings,
                    payload,
                } );
            } );
        },
    } );

    const store = useCreateStore();

    useControls( controls, { store, collapsed: true } );

    return createLevaPanel( store );
};
