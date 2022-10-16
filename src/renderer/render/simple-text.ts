export class SimpleText {
    #timeout: NodeJS.Timeout | null = null;
    #textEl: HTMLParagraphElement;
    constructor() {
        const textEl = document.createElement( "p" );
        textEl.style.position = "absolute";
        textEl.style.bottom = "1rem";
        textEl.style.left = "1rem";
        textEl.style.color = "white";
        textEl.style.zIndex = "200";
        this.#textEl = textEl;
        1;
        document.body.appendChild( textEl );
    }

    set( text: string ) {
        if ( this.#timeout ) {
            clearTimeout( this.#timeout );
        }
        this.#textEl.innerText = text;
        this.#timeout = setTimeout( () => {
            this.#timeout = null;
            this.#textEl.innerText = "";
        }, 1000 );
    }

    dispose() {
        if ( this.#timeout ) {
            clearTimeout( this.#timeout );
        }
        this.#textEl.remove();
    }
}
