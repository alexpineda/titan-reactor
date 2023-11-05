import { RealtimeChannel, Session } from "@supabase/supabase-js";
import { TypeEmitter } from "@utils/type-emitter";
import { supabase } from "common/supabase";
import { uniq } from "lodash";
import create from "zustand";

export type MetaverseStore = {
    events: TypeEmitter<MetaverseEvents>;
    room: string |  null;
    username: string |  null;
    isOwner: boolean;
    online: [];
    session: Session | null;
    channel: RealtimeChannel | null;
    init: () => {}
    setSession: (session: Session | null) => void;
    createWatchParty: () => void;
    joinWatchParty: () => void;
    track: (opts: TrackOpts) => void;
};

type MetaverseEvents = {
    "metaverse-presence": { presence: any };
    "replay-status-change": { url: string };
    "replay-position-sync": { url: string };
    "load-replay": { path: string, name: string };
}

function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    let firstPart = (Math.random() * 46656) | 0;
    let secondPart = (Math.random() * 46656) | 0;
    return ("000" + firstPart.toString(36)).slice(-3) + ("000" + secondPart.toString(36)).slice(-3);
}

export type TrackOpts = {
}

export const useMetaverse = create<MetaverseStore>( ( set, get ) => ( {
    events: new TypeEmitter<MetaverseEvents>(),
    username: null,
    room: null,
    isOwner: false,
    online: [],
    session: null,
    channel: null,
    init: async () => {
        
    },
    createWatchParty: async () => {

    },
    joinWatchParty: async () => {

    },
    track: async (opts: TrackOpts) => {
        if (get().channel) {
            get().channel!.track({
                username: get().username,
                ...opts
            });
        }
    },
    setSession: ( session: Session | null ) => {
        set( { session });

        if (!session) {
            return;
        }

        set( { username: session.user!.email! });

        const urlParams = new URLSearchParams(window.location.search);

        let room = urlParams.get('room');
        if (!urlParams.get('room')) {
            room = generateUID();
            urlParams.set('room', room);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }

        //todo: do we need presence options here?
        const channel = supabase.channel(room!);
        channel.on('presence', { event: 'sync' }, () => {
            const newState = channel.presenceState()
                console.log('sync', newState );

                const keys = uniq(Object.keys(newState));

                if (keys.length ===1) {
                    set({ isOwner: true });
                }
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('join', key, newPresences )
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('leave', key, leftPresences)
            })
            .on("broadcast", { event: "test" }, ( payload ) => {
                console.log( payload );
            })
            .on("broadcast", {event: "load-replay", }, ( evt ) => {
                console.log( evt )
                get().events.emit( "load-replay", evt.payload );
            })
            .on("broadcast", {event: "replay-status-change", }, ( payload ) => {
                get().events.emit( "replay-status-change", payload );
            })
            .on("broadcast", {event: "replay-position-sync", }, ( payload ) => {
                get().events.emit( "replay-position-sync", payload );
            })
            .subscribe((status) => {
                // Wait for successful connection
                if (status !== 'SUBSCRIBED') {
                    console.error( `supabased failed to connect to channel ${room} ${status}`);
                    return null
                }

                get().track({});
    
                set( { channel });
                set({ room })
            });

    },
} ) );

export const metaVerse = () => useMetaverse.getState();