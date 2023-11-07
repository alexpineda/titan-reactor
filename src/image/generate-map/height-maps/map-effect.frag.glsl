precision highp usampler2D;

uniform sampler2D texture;
uniform usampler2D elevations;
uniform usampler2D mapTiles;
uniform usampler2D paletteIndices;
uniform int ignoreDoodads;
uniform bool processWater;
uniform int tileset;
uniform mat3 levels;
uniform mat3 ignoreLevels;

bool getIsWater(const in int tileset, const in int paletteIndex, const in vec4 oColor, const in uint elevation) {
  
  if (tileset > 3 || tileset == 0) { //jungle, badlands, desert, ice, twilight
    if ((paletteIndex >= 1 && paletteIndex <= 13) || (paletteIndex >= 248 && paletteIndex <= 254) ) {
      return true;
    }
  } else if (tileset == 3) { //ashworld
    if (paletteIndex >= 1 && paletteIndex <= 13) {
      return true;
    }
  }

    //check by color
  if (elevation == uint(0)) {
    if (tileset == 4 || tileset == 0) { //jungle and badlands
        if (oColor.b > oColor.r/2. + oColor.g/2.) {
            return true;
        }
    } else if (tileset == 3) { // ashworld
        if (oColor.r > oColor.g/2. + oColor.b/2. || (oColor.r < 0.2 && oColor.g < 0.2 && oColor.b < 0.2)) {
        return true;
        }
    } else if (tileset == 5 || tileset == 7) { // desert, twilight
        if (oColor.r < 0.2 && oColor.g < 0.2 && oColor.b < 0.2) {
            return true;
        }
    } else if (tileset ==6) { // ice
        if (oColor.r < 0.2 && oColor.g < 0.2 && oColor.b < 0.4) {
            return true;
        }
    }
}

  return false;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

    // 0 - 6
    uint elevation = texture2D(elevations, uv).r;

    vec4 oColor = texture2D(texture, uv);
    int paletteIndex = int(texture2D(paletteIndices, uv).r);

    bool isWater = getIsWater(tileset, paletteIndex, oColor, elevation);

    uint level = elevation;

    // Anything that is elevation 0 and is not "water" gets lifted an elevation up
    // in order to keep water and stuff the lowest visual priority
    if (processWater && !isWater && elevation == uint(0)) {
      level = uint(1);
    }

    float displacement = 0.;
    bool ignoreLevel = false;

    // get the height 
    if (level < uint(3)) {

        displacement = levels[level][0];
        ignoreLevel = ignoreLevels[level][0] > 0.;

    } else if (level >= uint(3) && level < uint(6)) {

        displacement = levels[level - uint(3)][1];
        ignoreLevel = ignoreLevels[level - uint(3)][1] > 0.;

    } else {

        displacement = levels[level - uint(6)][2];
        ignoreLevel = ignoreLevels[level - uint(6)][2] > 0.;

    }
 
    bool elevationWasModified = elevation != level;

    vec3 res = vec3(displacement);
    uint mapTile = texture2D(mapTiles, uv).r;
    
    // TODO: change this to use a custom ignore elevation matrix
    if (ignoreLevel && !elevationWasModified) { 
      res = inputColor.rgb;
    }

    outputColor = vec4(res, 1.);
}