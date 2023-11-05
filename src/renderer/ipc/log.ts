import { LogLevel } from "common/logging";
import { settingsStore } from "@stores/settings-store";

const logLevels = [ "info", "warn", "error", "debug" ];

const isActiveLevel = ( level: LogLevel ): boolean => {
    return (
        logLevels.indexOf( level ) <=
        logLevels.indexOf( settingsStore().data.utilities.logLevel )
    );
};

export const log = {
    error( msg: string | Error | unknown ) {
        if ( typeof msg === "string" ) {
            logClient( msg, "error" );
        } else {
            logClient( ( msg as Error ).message, "error" );
        }
    },

    warn( msg: string ) {
        logClient( msg, "warn" );
    },

    info( msg: string ) {
        logClient( msg, "info" );
    },

    debug( msg: string ) {
        logClient( msg, "debug" );
    },
};

export const logClient = ( message: string, level: LogLevel = "info" ) => {
    if (
        !isActiveLevel( level ) &&
        !( level === "error" && import.meta.env.DEV )
    ) {
        return;
    }

    if ( level === "error" ) {
        console.error( message );
    } else if ( level === "warn" ) {
        // eslint-disable-next-line no-console
        console.warn( message );
    } else if ( level === "info" ) {
        // eslint-disable-next-line no-console
        console.log( message );
    } else {
        // eslint-disable-next-line no-console
        console.debug( message );
    }
};
