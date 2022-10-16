import { MacroTrigger, TriggerType } from "common/types";

export interface WorldEventTriggerDTO {
    eventName: string;
}

export class WorldEventTrigger implements MacroTrigger {
    type = TriggerType.WorldEvent;
    eventName: string;

    constructor( dto: WorldEventTriggerDTO = { eventName: "" } ) {
        this.eventName = dto.eventName;
    }

    serialize(): WorldEventTriggerDTO {
        return {
            eventName: this.eventName,
        };
    }

    test( eventName: string ) {
        return eventName === this.eventName;
    }

    static deserialize( dto: WorldEventTriggerDTO ) {
        return new WorldEventTrigger( dto );
    }

    toString() {
        return this.eventName;
    }

    readonly weight = 0;
}
