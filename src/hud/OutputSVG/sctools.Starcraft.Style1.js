import React from "react"
import Color from "color"

function TwitchVs(props) {
  let { onElementClick } = props
  const p = { ...props }

  const colors = {
    baseColor: p["style.baseColor"],
    baseColorB: p["style.shadeColor"],
    textColor: p["style.textColor"],

    baseColorA: Color(p["style.baseColor"]).rotate(10).darken(0.7).hex(),
    secondaryColorA: Color(p["style.baseColor"]).hex(),
    secondaryColorB: Color(p["style.baseColor"]).rotate(10).darken(0.5).hex(),
  }

  const styles = [
    { fill: colors.baseColorA }, //  0
    { opacity: 0.3, fill: "url(#SVGID_1_)" }, //  1
    { opacity: 0.6, fill: "url(#SVGID_2_)" }, //  2
    { opacity: 0.6, fill: "url(#SVGID_3_)" }, //  3
    { opacity: 0.6, fill: "url(#SVGID_4_)" }, //  4
    { overflow: "visible" }, //  5
    { fill: colors.secondaryColorA }, //  6
    { fill: "url(#SVGID_7_)" }, //  7
    { fill: "url(#SVGID_8_)" }, //  8
    { fill: "url(#SVGID_9_)" }, //  9
    { fill: "url(#SVGID_10_)" }, // 10
    {
      fill: colors.textColor,
      fontSize: "50px",
      cursor: onElementClick ? "pointer" : "inherit",
    }, // 11
    { fontFamily: p["styles.font"] || "inherited" }, // 12
  ]

  onElementClick = onElementClick || function () {}

  const imageElement = !p["style.image"] ? null : (
    <image
      transform="matrix(1 0 0 1 575 7)"
      style={styles[11]}
      href={p["style.image"]}
      height="100"
      width="100%"
    />
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 1650 113"
      width={p["style.width"]}
      styles={styles[12]}
    >
      <rect style={styles[0]} width="1650" height="113" />
      <linearGradient
        id="SVGID_1_"
        gradientUnits="userSpaceOnUse"
        x1="625"
        y1="153"
        x2="625"
        y2="3.902"
      >
        <stop offset="0%" stopColor={colors.secondaryColorA} />
        <stop
          offset="100%"
          stopColor={colors.secondaryColorA}
          stopOpacity="0"
        />
      </linearGradient>
      <rect style={styles[1]} width="1650" height="113" />
      <linearGradient
        id="SVGID_2_"
        gradientUnits="userSpaceOnUse"
        x1="627.1667"
        y1="153"
        x2="627.1667"
        y2="3.902"
      >
        <stop offset="0%" stopColor={colors.secondaryColorA} />
        <stop
          offset="100%"
          stopColor={colors.secondaryColorA}
          stopOpacity="0"
        />
      </linearGradient>
      <rect x="705" style={styles[2]} width="238.3" height="113" />
      <linearGradient
        id="SVGID_3_"
        gradientUnits="userSpaceOnUse"
        x1="1523.7477"
        y1="56.5"
        x2="1084.4391"
        y2="56.5"
      >
        <stop offset="0%" stopColor={colors.secondaryColorA} />
        <stop
          offset="100%"
          stopColor={colors.secondaryColorA}
          stopOpacity="0"
        />
      </linearGradient>
      <rect x="1041.2" style={styles[3]} width="498.8" height="113" />
      <linearGradient
        id="SVGID_4_"
        gradientUnits="userSpaceOnUse"
        x1="520.5721"
        y1="56.5"
        x2="279.6636"
        y2="56.5"
        gradientTransform="matrix(-1 0 0 1 547 0)"
      >
        <stop offset="0%" stopColor={colors.secondaryColorA} />
        <stop
          offset="100%"
          stopColor={colors.secondaryColorA}
          stopOpacity="0"
        />
      </linearGradient>
      <polygon
        style={styles[4]}
        points="0,113 401.5,113 401.5,0 0,0 "
        transform="translate(120,0)"
      />
      <g>
        <defs>
          <rect id="SVGID_5_" width="1250" height="113" />
        </defs>
        <clipPath id="SVGID_6_">
          <use style={styles[5]} />
        </clipPath>
      </g>
      <g>
        <polygon style={styles[6]} points="161.5,113 0,113 0,0 121,0  " />
        <linearGradient
          id="SVGID_7_"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="56.5"
          x2="159.5"
          y2="56.5"
        >
          <stop offset="0%" stopColor={colors.baseColorB} />
          <stop offset="100%" stopColor={colors.secondaryColorB} />
        </linearGradient>
        <polygon style={styles[7]} points="159.5,113 0,113 0,0 119,0  " />
      </g>

      <g transform="translate(200,0)">
        <polygon
          style={styles[6]}
          points="548.3,113 402.7,113 401.5,0 507.8,0  "
        />
        <linearGradient
          id="SVGID_8_"
          gradientUnits="userSpaceOnUse"
          x1="548.3333"
          y1="56.5"
          x2="402.3196"
          y2="56.5"
        >
          <stop offset="0%" stopColor={colors.baseColorB} />
          <stop offset="100%" stopColor={colors.secondaryColorB} />
        </linearGradient>
        <polygon
          style={styles[8]}
          points="546.3,113 404.3,113 403,0 505.8,0  "
        />
      </g>
      <g transform="translate(200,0)">
        <polygon
          style={styles[6]}
          points="851.2,0 745.5,0 704.3,113 850.7,113  "
        />

        <linearGradient
          id="SVGID_9_"
          gradientUnits="userSpaceOnUse"
          x1="705.8333"
          y1="56.5"
          x2="849.1667"
          y2="56.5"
          gradientTransform="matrix(1 0 0 -1 0 113)"
        >
          <stop offset="0%" stopColor={colors.baseColorB} />
          <stop offset="100%" stopColor={colors.secondaryColorB} />
        </linearGradient>
        <polygon
          style={styles[9]}
          points="849.2,0 747.2,0 705.8,113 848.7,113  "
        />
      </g>
      <g transform="translate(400,0)">
        <polygon
          style={styles[6]}
          points="1088.5,113 1250,113 1250,0 1129,0  "
        />

        <linearGradient
          id="SVGID_10_"
          gradientUnits="userSpaceOnUse"
          x1="1073.5"
          y1="56.5"
          x2="1233"
          y2="56.5"
          gradientTransform="matrix(-1 0 0 1 2323.5 0)"
        >
          <stop offset="0%" stopColor={colors.baseColorB} />
          <stop offset="100%" stopColor={colors.secondaryColorB} />
        </linearGradient>
        <polygon
          style={styles[10]}
          points="1090.5,113 1250,113 1250,0 1131,0  "
        />
      </g>
      <text
        transform="matrix(1 0 0 1 46.29 78.93)"
        style={styles[11]}
        onClick={(e) => onElementClick("player1.points")}
      >
        {p["player1.points"]}
      </text>
      <text
        transform="matrix(1 0 0 1 196.0146 72.3431)"
        style={styles[11]}
        onClick={(e) => onElementClick("player1.name")}
      >
        {p["player1.name"]}
      </text>
      <text
        transform="matrix(1 0 0 1 625.9779 72.3431)"
        style={styles[11]}
        onClick={(e) => onElementClick("player1.race")}
      >
        {p["player1.race"]}
      </text>
      {imageElement}
      <text
        transform="matrix(1 0 0 1 949.6641 72.3431)"
        style={styles[11]}
        onClick={(e) => onElementClick("player2.race")}
      >
        {p["player2.race"]}
      </text>
      <text
        transform="matrix(1 0 0 1 1136.4333 72.3431)"
        style={styles[11]}
        onClick={(e) => onElementClick("player2.name")}
      >
        {p["player2.name"]}
      </text>
      <text
        transform="matrix(1 0 0 1 1562.2457 78.93)"
        style={styles[11]}
        onClick={(e) => onElementClick("player2.points")}
      >
        {p["player2.points"]}
      </text>
    </svg>
  )
}

TwitchVs.defaultProps = {
  "player1.name": "Flash",
  "player1.race": "T",
  "player1.points": "0",

  "player2.name": "Jaedong",
  "player2.race": "Z",
  "player2.points": "0",

  "style.baseColor": "#e91e63",
  "style.shadeColor": "#000000",
  "style.textColor": "#FFFFFF",
  "style.image": "",
  "style.font": "inherit",
}

// TwitchVs.formTypes = {
//   "player1.name": FormTypes.Text,
//   "player1.race": FormTypes.Text,
//   "player1.points": FormTypes.Text,

//   "player2.name": FormTypes.Text,
//   "player2.race": FormTypes.Text,
//   "player2.points": FormTypes.Text,

//   "style.baseColor": FormTypes.Color,
//   "style.shadeColor": FormTypes.Color,
//   "style.textColor": FormTypes.Color,
//   "style.image": FormTypes.Text,
//   "style.font": FormTypes.Font({ hidden: true }),
// }

export default TwitchVs
