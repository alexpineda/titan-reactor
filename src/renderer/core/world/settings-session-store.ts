import { SessionSettingsData, Settings } from "common/types";
import {
    getSessionSettingsInLevaFormat,
    getSessionSettingsPropertyInLevaFormat,
} from "common/get-app-settings-leva-config";
import lSet from "lodash.set";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { WorldEvents } from "./world-events";
import { TypeEmitter } from "@utils/type-emitter";
import { createDeepStore } from "@stores/deep-store";
import { createOperatableStore, MutationVariable } from "@stores/operatable-store";
import { SourceOfTruth } from "@stores/source-of-truth";

type ValidAppSessionPath = `${keyof SessionSettingsData}.`;
const validAppSettingsPaths: ValidAppSessionPath[] = [
    "audio.",
    "input.",
    "postprocessing.",
    "postprocessing3d.",
    "minimap.",
    "session.",
];

const isValidkey = ( key: string ) => {
    for ( const path of validAppSettingsPaths ) {
        if ( key.startsWith( path ) ) {
            return true;
        }
    }
};

/**
 * @public
 */
export type SessionVariables = {
    [K in keyof SessionSettingsData]: {
        [T in keyof SessionSettingsData[K]]: MutationVariable;
    };
};

const partialSettings = ( data: Settings ) => ( {
    session: data.session,
    audio: data.audio,
    input: data.input,
    minimap: data.minimap,
    postprocessing: data.postprocessing,
    postprocessing3d: data.postprocessing3d,
} );

type PartialSettings = ReturnType<typeof partialSettings>;

export type SettingsSessionStore = ReturnType<typeof createSettingsSessionStore>;
/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
export const createSettingsSessionStore = ( events: TypeEmitter<WorldEvents> ) => {
    const janitor = new Janitor( "ReactiveSessionVariables" );

    const sourceOfTruth = new SourceOfTruth( partialSettings( settingsStore().data ) );
    const store = createOperatableStore(
        createDeepStore<PartialSettings>( {
            initialState: sourceOfTruth.clone(),
            validateMerge: ( newSettings, rhs ) =>
                events.emit( "settings-changed", { settings: newSettings, rhs } ) !==
                false,
        } ),
        sourceOfTruth,
        ( path, state ) =>
            getSessionSettingsPropertyInLevaFormat(
                state,
                settingsStore().activatedPlugins,
                path
            )
    );

    // keep the session up to date with user changed settings
    janitor.mop(
        useSettingsStore.subscribe( ( { data } ) => {
            store.sourceOfTruth.update( partialSettings( data ) );
        } ),
        "settings-store-subscription"
    );

    const sessionSettingsConfig = getSessionSettingsInLevaFormat(
        settingsStore().data,
        settingsStore().activatedPlugins
    );

    const vars = Object.keys( sessionSettingsConfig ).reduce( ( acc, key ) => {
        if ( isValidkey( key ) ) {
            const settingsKey = key.split( "." );
            lSet<SessionVariables>( acc, settingsKey, store.createVariable( settingsKey ) );
        }
        return acc;
    }, {} ) as SessionVariables;

    return {
        ...store,
        vars,
        dispose: () => janitor.dispose(),
    };
};
