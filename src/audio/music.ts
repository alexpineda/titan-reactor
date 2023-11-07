import { mixer } from "./main-mixer";
import { Audio, AudioListener } from "three";
const rand = ( n: number ) => Math.floor( Math.random() * n );

class Music {
    #audio: Audio;
    races = ["terran", "zerg", "protoss"];

    constructor( listener: AudioListener ) {
        this.#audio = new Audio( listener );
    }

    getAudio() {
        return this.#audio;
    }

    playGame() {
        this.#audio.onEnded = this.playGame.bind( this );
        this.#play( `music/${this.races[rand( this.races.length )]}${rand( 4 ) + 1}.ogg` );
    }

    playMenu() {
        const race = ["t", "z", "p"];
        this.#audio.onEnded = this.playMenu.bind( this );
        this.#play( race[rand( 2 )] + "rdyroom.ogg" );
    }

    async #play( filepath: string ) {
        if ( this.#audio.isPlaying ) {
            this.#audio.stop();
        }

        const buffer = await mixer.loadCascAudio( filepath );

        this.#audio.setBuffer( buffer );
        this.#audio.play();
    }

    stop() {
        this.#audio.stop();
    }

    dispose() {
        if ( this.#audio.isPlaying ) {
            this.#audio.stop();
        }
        this.#audio.disconnect();
    }
}

export const music = new Music( mixer as unknown as AudioListener );