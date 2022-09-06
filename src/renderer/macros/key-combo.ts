import { KeyboardEvent as SyntheticKeyboardEvent } from "react";

export type KeyComboDTO = {
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
    codes: string[],
};
type KeyEvent = SyntheticKeyboardEvent<HTMLInputElement> | KeyboardEvent;

const isKeyComboDTO = (obj: any): obj is KeyComboDTO => {
    return obj && typeof obj === "object" && "ctrlKey" in obj && "altKey" in obj && "shiftKey" in obj && "codes" in obj;
}
export class KeyCombo implements KeyComboDTO {
    #timeout: NodeJS.Timeout | null = null;
    #promise: Promise<KeyComboDTO | null> = Promise.resolve(null);

    ctrlKey = false;
    altKey = false;
    shiftKey = false;
    codes: string[] = [];

    isModifier(e: KeyEvent) {
        return e.code.includes("Shift") ||
            e.code.includes("Control") ||
            e.code.includes("Alt");
    }

    isArrowKey(e: KeyEvent) {
        return e.code.includes("ArrowUp") ||
            e.code.includes("ArrowDown") ||
            e.code.includes("ArrowLeft") ||
            e.code.includes("ArrowRight")
    }

    isIllegal(e: KeyEvent) {
        if (
            this.isModifier(e) || this.isArrowKey(e)
        ) {
            return true;
        }
        return false
    }

    createEmptyKeyCombo() {
        return {
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            codes: []
        }
    }

    createKeyCombo(e: KeyEvent) {
        return {
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            codes: [e.code]
        }
    }

    resetKeyCombo() {
        Object.assign(this, this.createEmptyKeyCombo());
    }

    generateKeyComboFromEvent(e: KeyEvent) {
        e.preventDefault();

        // allow modifiers are single entries (no combos)
        if (this.isModifier(e)) {
            this.set(e);
            this.#promise = Promise.resolve(this);
            return this.#promise;
        }

        if (this.isIllegal(e)) {
            return this.#promise;
        }

        if (this.#timeout === null) {
            this.set(e);
        } else {
            this.add(e);
            clearTimeout(this.#timeout);
        }

        return this.#promise = new Promise(res => {
            this.#timeout = setTimeout(() => {
                res(this)
                this.#timeout = null;
                this.#promise = Promise.resolve(null);
            }, 800);
        });

    }

    // simple test for equality
    test(e: SyntheticKeyboardEvent<HTMLInputElement> | KeyboardEvent | KeyComboDTO) {
        return this.compareCombos(isKeyComboDTO(e) ? e : this.createKeyCombo(e))
    }

    testShallow(e: KeyComboDTO, n = 1) {
        if (!this.compareModifiers(e)) {
            return false;
        }

        for (let i = 0; i < n; i++) {
            if (this.codes[i] !== e.codes[i]) {
                return false;
            }
        }
        return true;
    }

    set(e: KeyEvent) {
        this.shiftKey = this.isModifier(e) ? false : e.shiftKey;
        this.ctrlKey = this.isModifier(e) ? false : e.ctrlKey;
        this.altKey = this.isModifier(e) ? false : e.altKey;
        this.codes = [e.code];
    }

    add(e: KeyEvent) {
        this.shiftKey = e.shiftKey;
        this.ctrlKey = e.ctrlKey;
        this.altKey = e.altKey;
        this.codes.push(e.code);
    }

    compareModifiers(b: KeyComboDTO) {
        if (this.ctrlKey !== b.ctrlKey) {
            return false;
        }

        if (this.altKey !== b.altKey) {
            return false;
        }

        if (this.shiftKey !== b.shiftKey) {
            return false;
        }
        return true;
    }

    compareCombos(b: KeyComboDTO) {

        if (this.compareModifiers(b) === false) {
            return false;
        }

        if (this.codes.length !== b.codes.length) {
            return false;
        }

        for (let i = 0; i < this.codes.length; i++) {
            if (this.codes[i] !== b.codes[i]) {
                return false;
            }
        }

        return true;
    }

    copy(dto: KeyComboDTO) {
        Object.assign(this, dto);
        return this;
    }

}