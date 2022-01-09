import { UnitStruct } from "../data-transfer";
import { EntityIterator } from "./entity-iterator";

export class UnitsEmbind implements EntityIterator<UnitStruct> {
    embindUnits = [];

    *items(count = this.embindUnits.length) {
        for (let i = 0; i < count; i++) {
            yield this.embindUnits[i];
        }
    }

    *reverse(count = this.embindUnits.length) {
        for (let i = count -1; i > 0; i--) {
            yield this.embindUnits[i];
        }
    }

    instances(count = this.embindUnits.length) {
        return this.embindUnits;
    }

  
}
export default UnitsEmbind;
