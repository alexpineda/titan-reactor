#ifdef USE_DISPLACEMENTMAP

    vec2 duv = (vUv * quartileResolution) ;
    // flip on y axis per quartile
    duv.x += quartileOffset.x;
    duv.y = quartileResolution.y - duv.y + quartileOffset.y;
    transformed += normalize( objectNormal ) * ( texture2D( displacementMap, duv ).x * displacementScale + displacementBias );

#endif