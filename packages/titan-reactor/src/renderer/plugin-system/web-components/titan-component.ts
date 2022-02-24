// Create a wrapper in order to utilize the shadow dom for css styling
export class TitanComponent extends HTMLElement {
    private _content: HTMLDivElement;
    private _stylesheet: HTMLStyleElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._content = document.createElement('div');
        this._stylesheet = document.createElement('style');

        this.shadowRoot!.append(this._stylesheet, this._content);
    }

    setMarkup(markup: string) {
        this._content.innerHTML = markup;
    }

    setStylesheet(stylesheet: string, useConfig: any) {
        let cssVars = ':host {';
        for (const prop in useConfig) {
            cssVars += `--${prop}: ${useConfig[prop].value};\n`;
        }
        cssVars += '}\n\n';
        this._stylesheet.textContent = `${cssVars}${stylesheet}`;
    }

    connectedCallback() {
    }

    disconnectedCallback() {

    }
}

customElements.define("titan-component", TitanComponent);
