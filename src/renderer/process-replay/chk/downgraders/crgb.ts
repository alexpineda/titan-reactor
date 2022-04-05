import { Downgrader } from "./downgrader";

class CRGBDowngrader implements Downgrader {
  constructor() {
    this.chunkName = "CRGB";
  }
  chunkName: string;
  downgrade() {
    return null;
  }
}

export default CRGBDowngrader;
