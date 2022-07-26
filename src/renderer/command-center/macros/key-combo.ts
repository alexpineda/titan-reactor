import { keyComboWeight } from "@utils/key-utils";
import { KeyboardEvent as SyntheticKeyboardEvent } from "react";

export type KeyComboDTO = {
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
    codes: string[],
};

export class KeyCombo {
    keyCombo: KeyComboDTO = {
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        codes: []
    }

    #testCombo: KeyComboDTO = {
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        codes: []
    }

    #timeout: NodeJS.Timeout | null = null;
    #promise: Promise<KeyComboDTO | null> = Promise.resolve(null);
    #testPromise: Promise<boolean> = Promise.resolve(false);


    generateKeyComboFromEvent(e: SyntheticKeyboardEvent<HTMLInputElement> | KeyboardEvent) {
        if (this.#timeout === null) {
            this.keyCombo = {
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                codes: []
            }
            this.#promise = new Promise(res => {
                this.#timeout = setTimeout(() => {
                    res(this.keyCombo)
                    this.#timeout = null;
                    this.#promise = Promise.resolve(null);
                }, 1000);
            })
        }

        e.preventDefault();

        if (
            e.code.includes("Shift") ||
            e.code.includes("Control") ||
            e.code.includes("Alt") ||
            e.code.includes("Escape") ||
            e.code.includes("ArrowUp") ||
            e.code.includes("ArrowDown") ||
            e.code.includes("ArrowLeft") ||
            e.code.includes("ArrowRight")
        ) {
            return this.#promise;
        }

        this.keyCombo.shiftKey = e.shiftKey;
        this.keyCombo.ctrlKey = e.ctrlKey;
        this.keyCombo.altKey = e.altKey;
        this.keyCombo.codes.push(e.code);
        return this.#promise;
    }

    testKeyComboFromEvent(e: SyntheticKeyboardEvent<HTMLInputElement> | KeyboardEvent) {
        if (this.#timeout === null) {
            this.#testCombo = {
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
                codes: [e.code]
            }
            if (this.keyCombo.codes.length === 1) {
                return Promise.resolve(this.#compareCombos(this.keyCombo, this.#testCombo));
            }
            if (!this.#compareModifiers(this.keyCombo, this.#testCombo)) {
                return Promise.resolve(false);
            }
            return this.#testPromise = new Promise(res => {
                this.#timeout = setTimeout(() => {
                    res(this.#compareCombos(this.keyCombo, this.#testCombo));
                    this.#timeout = null;
                    this.#testPromise = Promise.resolve(false);
                }, keyComboWeight(this.keyCombo) * 100);
            })
        } else {

            if (
                e.code.includes("Shift") ||
                e.code.includes("Control") ||
                e.code.includes("Alt") ||
                e.code.includes("Escape") ||
                e.code.includes("ArrowUp") ||
                e.code.includes("ArrowDown") ||
                e.code.includes("ArrowLeft") ||
                e.code.includes("ArrowRight")
            ) {
                return this.#testPromise;
            }

            this.#testCombo.shiftKey = e.shiftKey;
            this.#testCombo.ctrlKey = e.ctrlKey;
            this.#testCombo.altKey = e.altKey;
            this.#testCombo.codes.push(e.code);
            return this.#testPromise;
        }
    }

    #compareModifiers(a: KeyComboDTO, b: KeyComboDTO) {
        if (a.ctrlKey !== b.ctrlKey) {
            return false;
        }

        if (a.altKey !== b.altKey) {
            return false;
        }

        if (a.shiftKey !== b.shiftKey) {
            return false;
        }
        return true;
    }

    #compareCombos(a: KeyComboDTO, b: KeyComboDTO) {

        if (this.#compareModifiers(a, b) === false) {
            return false;
        }


        if (a.codes.length !== b.codes.length) {
            return false;
        }

        for (let i = 0; i < a.codes.length; i++) {
            if (a.codes[i] !== b.codes[i]) {
                return false;
            }
        }

        return true;
    }

    serialize() {
        const shiftKey = this.keyCombo.shiftKey ? ["Shift"] : [];
        const ctrlKey = this.keyCombo.ctrlKey ? ["Ctrl"] : [];
        const altKey = this.keyCombo.altKey ? ["Alt"] : [];
        const v = [...shiftKey, ...ctrlKey, ...altKey, ...this.keyCombo.codes].join("+");
        return v;
    }

    deserialize(raw: string) {
        const keys = /(\+(.+))$/.exec(raw)?.[2] ?? raw;
        const keyCombo = {
            ctrlKey: raw.includes("Ctrl"),
            altKey: raw.includes("Alt"),
            shiftKey: raw.includes("Shift"),
            codes: keys.split("+").filter(k => ["Shift", "Ctrl", "Alt"].includes(k) === false)
        }
        this.keyCombo = keyCombo;
    }

}