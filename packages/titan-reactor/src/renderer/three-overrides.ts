import { MathUtils } from "three";

let _uuid = 0;
// crypto is slow - replace with global counter
MathUtils.generateUUID = () => "uuid_" + _uuid++;
