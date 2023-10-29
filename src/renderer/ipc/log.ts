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
            logBoth( msg, "error" );
        } else {
            logBoth( ( msg as Error ).message, "error" );
        }
    },

    warn( msg: string ) {
        logBoth( msg, "warn" );
    },

    info( msg: string ) {
        logBoth( msg, "info" );
    },

    debug( msg: string ) {
        logBoth( msg, "debug" );
    },
};

export const logBoth = ( message: string, level: LogLevel = "info" ) => {
    logClient( message, level );
    logServer( message, level );
};

export const logServer = ( message: string, level: LogLevel = "info" ) => {
    if ( !isActiveLevel( level ) ) {
        return;
    }

    //todo: log to server
    // console.log(message)

};

export const logClient = ( message: string, level: LogLevel = "info" ) => {
    if (
        !isActiveLevel( level ) &&
        !( level === "error" && process.env.NODE_ENV === "development" )
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
