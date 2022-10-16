export interface Logger {
    error( msg: string ): void;
    warn( msg: string ): void;
    info( msg: string ): void;
    debug( msg: string ): void;
}

export type LogLevel = "info" | "warn" | "error" | "debug";
