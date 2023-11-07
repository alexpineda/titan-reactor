import { MacroAction, TargetType } from "common/types";

export class TargetComposer {
    #handlers = new Map<TargetType, TargetHandler>();

    setHandler( type: TargetType, handler: TargetHandler ) {
        this.#handlers.set( type, handler );
    }

    getHandler( type: TargetType ) {
        return this.#handlers.get( type );
    }
}

export interface TargetHandler {
    action( action: MacroAction, context?: unknown ): void;
    getValue( path: string[], value?: unknown, context?: unknown ): unknown;
}
